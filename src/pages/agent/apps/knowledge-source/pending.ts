/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-manager-header-v1
 *
 * 知识源「待添加条目」的共享模型与统一提交流程。
 * /agent/apps/:scene/knowledge/create（创建知识源子路由）与
 * 知识源详情里的添加文件向导共用这一份，避免两处各写一遍导入逻辑。
 */

import {
  importKnowledgeSourceDocApi,
  saveKnowledgeSourceApi,
  uploadKnowledgeSourceDocApi
} from "@/api/knowledgeSource"
import type { IKnowledgeIndexConfig } from "@/types/api/knowledgeSource"

/** doc=海狸在线文档 / faq=Q&A 文档 */
export type KnowledgeDocType = "doc" | "faq"

export type PendingIconType = "word" | "excel" | "faq"

/** 待添加条目：在线文档只存链接与 docId，本地文件存 File，提交时再读成 base64 */
export interface PendingDocItem {
  key: string
  title: string
  sourceLabel: string
  kind: "online" | "local"
  docType?: KnowledgeDocType
  docUrl?: string
  docId?: string
  file?: File
}

/** 与服务端 UploadDigitalKnowledgeSourceDoc 的限制保持一致 */
export const MAX_PENDING_FILE_BYTES = 20 * 1024 * 1024

export function pendingIconType(item: PendingDocItem): PendingIconType {
  if (item.docType === "faq") return "faq"
  if (item.file?.name.toLowerCase().endsWith(".xlsx")) return "excel"
  if (/\.xlsx$/i.test(item.title)) return "excel"
  return "word"
}

export function pendingTypeLabel(item: PendingDocItem): string {
  if (item.docType === "faq") return "Q&A"
  if (item.kind === "local") return pendingIconType(item) === "excel" ? "Excel" : "Word"
  return "文档"
}

export function pendingErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === "object" && "msg" in err) {
    return String((err as { msg?: string }).msg || fallback)
  }
  return fallback
}

/** FileReader 读成不带 data: 前缀的 base64 */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || "")
      const comma = text.indexOf(",")
      resolve(comma >= 0 ? text.slice(comma + 1) : text)
    }
    reader.onerror = () => reject(new Error("读取文件失败"))
    reader.readAsDataURL(file)
  })
}

export interface ApplyPendingResult {
  /** 成功建立的引用 / 文档数 */
  count: number
  /** 逐条失败原因，由调用方决定怎么提示 */
  warnings: string[]
}

/**
 * 把待添加条目落到指定知识源：
 * 1. 在线文档按 docType 分组批量导入（服务端解析链接 + 鉴权，只建引用）；
 * 2. 本地 docx/xlsx 逐个读成 base64 交给服务端解析正文入库；
 * 3. 最后把这一轮选定的分段 / 清洗配置写回知识源实体。
 * 单条失败不中断整体，收集到 warnings 里。
 */
export async function applyPendingDocs(options: {
  scene: string
  knowledgeSourceId: string
  pending: PendingDocItem[]
  indexConfig: IKnowledgeIndexConfig
}): Promise<ApplyPendingResult> {
  const { scene, knowledgeSourceId, pending, indexConfig } = options
  const warnings: string[] = []
  let count = 0

  for (const docType of ["doc", "faq"] as const) {
    const urls = pending
      .filter(item => item.kind === "online" && item.docType === docType && item.docUrl)
      .map(item => item.docUrl as string)
    if (!urls.length) continue
    try {
      const res = await importKnowledgeSourceDocApi({
        scene,
        knowledgeSourceId,
        docUrls: urls,
        docType
      })
      if (res.code !== 0) {
        warnings.push(`${docType === "faq" ? "Q&A 文档" : "在线文档"}导入失败：${res.msg || "未知原因"}`)
        continue
      }
      count += res.result?.imported ?? 0
      if (res.result?.failed?.length) {
        warnings.push(`${res.result.failed.length} 条链接未通过解析或鉴权`)
      }
    } catch (err) {
      warnings.push(`${docType === "faq" ? "Q&A 文档" : "在线文档"}导入失败：${pendingErrorMessage(err, "网络错误")}`)
    }
  }

  for (const item of pending) {
    if (item.kind !== "local" || !item.file) continue
    try {
      const data = await readFileAsBase64(item.file)
      const res = await uploadKnowledgeSourceDocApi({
        scene,
        knowledgeSourceId,
        fileName: item.file.name,
        data,
        docType: "doc"
      })
      if (res.code === 0 && res.result?.documentId) {
        count += 1
      } else {
        warnings.push(`${item.title}：${res.msg || "上传失败"}`)
      }
    } catch (err) {
      warnings.push(`${item.title}：${pendingErrorMessage(err, "上传失败")}`)
    }
  }

  const config: IKnowledgeIndexConfig = {
    ...indexConfig,
    retrievalMode: indexConfig.retrievalMode || "auto"
  }
  try {
    const res = await saveKnowledgeSourceApi({
      scene,
      knowledgeSourceId,
      indexConfig: JSON.stringify(config)
    })
    if (res.code !== 0) {
      warnings.push(`分段配置未保存：${res.msg || "未知原因"}`)
    }
  } catch (err) {
    warnings.push(`分段配置未保存：${pendingErrorMessage(err, "网络错误")}`)
  }

  return { count, warnings }
}
