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
 * 场景知识源：与开放平台「数字伙伴知识源」同构，归属主体换成固定场景（scene）。
 * 一个知识源持有一个 platform 索引集合；运行时按该场景下所有知识源合并去重后的
 * knowledgeIds 检索，这一列由后端在知识源变更时自动回写，前端不直接提交。
 */

export interface IKnowledgeSourceItem {
  knowledgeSourceId: string
  name: string
  /** 召回条数，服务端默认 8 */
  retrievalTopK: number
  /** 分段 / 清洗配置 JSON 字符串 */
  indexConfig?: string
  /** 该知识源集合下的文档总数 */
  documentCount: number
  /** 秒级时间戳 */
  createdAt: number
}

export interface IListKnowledgeSourceReq {
  scene: string
}
export interface IListKnowledgeSourceRes {
  total: number
  list: IKnowledgeSourceItem[]
}

/** knowledgeSourceId 为空 = 新建；name/topK/indexConfig 不传 = 不改 */
export interface ISaveKnowledgeSourceReq {
  scene: string
  knowledgeSourceId?: string
  name?: string
  retrievalTopK?: number
  /** JSON 字符串 */
  indexConfig?: string
}
export interface ISaveKnowledgeSourceRes {
  knowledgeSourceId: string
}

export interface IDeleteKnowledgeSourceReq {
  scene: string
  knowledgeSourceId: string
}
export interface IDeleteKnowledgeSourceRes {}

/** 单个知识源详情：进入子路由时按 id 取回实体 */
export interface IDetailKnowledgeSourceReq {
  scene: string
  knowledgeSourceId: string
}
export interface IDetailKnowledgeSourceRes {
  source: IKnowledgeSourceItem
}

/** 知识源集合下的文档（在线文档引用与本地文件，只读聚合视图） */
export interface IKnowledgeSourceDoc {
  documentId: string
  title: string
  docType: string
  byteSize: number
  /** pending | indexing | ready | failed */
  indexStatus: string
  indexError?: string
  indexedAt: number
  /** 引用的在线文档 doc_id */
  sourceDocId: string
  /** direct（跟随源文档更新）| import */
  syncMode: string
  /** 最近同步时间，RFC3339 字符串，可能为空 */
  lastSyncedAt?: string
}
export interface IListKnowledgeSourceDocReq {
  scene: string
  knowledgeSourceId: string
  keyword?: string
}
export interface IListKnowledgeSourceDocRes {
  total: number
  list: IKnowledgeSourceDoc[]
}

/** 导入在线文档：粘贴海狸内部在线文档地址（URL 或裸 docId），后端解析后建立引用 */
export interface IImportKnowledgeSourceDocReq {
  scene: string
  knowledgeSourceId: string
  /** 海狸内部在线文档地址，可多个 */
  docUrls: string[]
  /** 文档类型：doc=在线文档 / faq=Q&A 文档，默认 doc */
  docType?: "doc" | "faq"
}
export interface IImportKnowledgeSourceDocRes {
  /** 成功建立的引用数 */
  imported: number
  /** 解析或读取失败的地址 */
  failed?: string[]
  notice?: string
}

/** 本地文件上传：docx/xlsx 读成 base64 传上来，服务端解析正文后建 file 文档 */
export interface IUploadKnowledgeSourceDocReq {
  scene: string
  knowledgeSourceId: string
  fileName: string
  /** base64 */
  data: string
  docType?: "doc" | "faq"
}
export interface IUploadKnowledgeSourceDocRes {
  documentId?: string
  title?: string
  byteSize: number
  msg?: string
}

export interface IDeleteKnowledgeSourceDocReq {
  scene: string
  knowledgeSourceId: string
  documentId: string
}
export interface IDeleteKnowledgeSourceDocRes {}

export interface IKnowledgeSourceHit {
  documentId: string
  title: string
  chunkIndex: number
  content: string
  score: number
}
export interface IRetrieveKnowledgeSourceReq {
  scene: string
  knowledgeSourceId: string
  query: string
  /** 不传 = 用知识源自身的 retrievalTopK */
  topK?: number
}
export interface IRetrieveKnowledgeSourceRes {
  hits: IKnowledgeSourceHit[]
  /** 无结果原因 */
  notice?: string
}

/** 检查在线文档链接：只解析 + 读取，不建立引用。检查通过才允许确认导入 */
export interface ICheckKnowledgeSourceDocReq {
  scene: string
  docUrl: string
}
export interface ICheckKnowledgeSourceDocRes {
  /** 链接可解析且文档可读 */
  valid: boolean
  docId?: string
  title?: string
  msg?: string
}

/**
 * 分段 / 清洗配置：知识源 indexConfig 列（JSON 字符串）反序列化后的形状。
 * 添加文件向导第二步与知识源「设置」分区共用，字段与后端约定保持一致。
 */
export interface IKnowledgeIndexConfig {
  /** auto=自动分段与清洗 / custom=自定义 */
  segmentMode: "auto" | "custom"
  maxSegmentLength: number
  overlapLength: number
  removeExtraSpaces: boolean
  removeUrls: boolean
  removeEmails: boolean
  /** 目前仅 auto（系统按文档内容自动选检索方式） */
  retrievalMode: "auto"
}

export const DEFAULT_KNOWLEDGE_INDEX_CONFIG: IKnowledgeIndexConfig = {
  segmentMode: "auto",
  maxSegmentLength: 500,
  overlapLength: 50,
  removeExtraSpaces: true,
  removeUrls: true,
  removeEmails: false,
  retrievalMode: "auto"
}

/** 解析后端 indexConfig JSON 字符串，缺字段用默认值补齐 */
export function parseKnowledgeIndexConfig(raw?: string): IKnowledgeIndexConfig {
  if (!raw) return { ...DEFAULT_KNOWLEDGE_INDEX_CONFIG }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ...DEFAULT_KNOWLEDGE_INDEX_CONFIG }
    }
    return { ...DEFAULT_KNOWLEDGE_INDEX_CONFIG, ...(parsed as Partial<IKnowledgeIndexConfig>) }
  } catch {
    return { ...DEFAULT_KNOWLEDGE_INDEX_CONFIG }
  }
}
