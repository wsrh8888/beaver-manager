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
 * 场景知识源 API：全部带 scene，服务端按场景隔离。
 * 知识源是 agent_knowledge_source 表里的后端实体，归某个固定场景所有，
 * 只持有 platform 索引集合的引用；文档正文的权威源在 doc 域在线文档库。
 */

import config from "@/config/env"
import { ajax } from "@/utils/request"
import type {
  ICheckKnowledgeSourceDocReq,
  ICheckKnowledgeSourceDocRes,
  IDeleteKnowledgeSourceDocReq,
  IDeleteKnowledgeSourceDocRes,
  IDeleteKnowledgeSourceReq,
  IDeleteKnowledgeSourceRes,
  IDetailKnowledgeSourceReq,
  IDetailKnowledgeSourceRes,
  IImportKnowledgeSourceDocReq,
  IImportKnowledgeSourceDocRes,
  IListKnowledgeSourceDocReq,
  IListKnowledgeSourceDocRes,
  IListKnowledgeSourceReq,
  IListKnowledgeSourceRes,
  IRetrieveKnowledgeSourceReq,
  IRetrieveKnowledgeSourceRes,
  ISaveKnowledgeSourceReq,
  ISaveKnowledgeSourceRes,
  IUploadKnowledgeSourceDocReq,
  IUploadKnowledgeSourceDocRes
} from "@/types/api/knowledgeSource"

const sourceBase = `${config.baseAPI}/admin/backend/knowledge/v1`

export function listKnowledgeSourceApi(params: IListKnowledgeSourceReq) {
  return ajax<IListKnowledgeSourceRes>({
    method: "GET",
    url: `${sourceBase}/source_list`,
    params
  })
}

/** knowledgeSourceId 为空时创建，非空时按传入的部分字段更新 */
export function saveKnowledgeSourceApi(data: ISaveKnowledgeSourceReq) {
  return ajax<ISaveKnowledgeSourceRes>({
    method: "POST",
    url: `${sourceBase}/source_save`,
    data
  })
}

export function deleteKnowledgeSourceApi(data: IDeleteKnowledgeSourceReq) {
  return ajax<IDeleteKnowledgeSourceRes>({
    method: "POST",
    url: `${sourceBase}/source_delete`,
    data
  })
}

/** 单个知识源详情：进入子路由时按 id 取回实体 */
export function detailKnowledgeSourceApi(params: IDetailKnowledgeSourceReq) {
  return ajax<IDetailKnowledgeSourceRes>({
    method: "GET",
    url: `${sourceBase}/source_detail`,
    params
  })
}

/** 检查在线文档 / 表格链接：解析 doc_id 并确认可读，只校验不建引用 */
export function checkKnowledgeSourceDocApi(data: ICheckKnowledgeSourceDocReq) {
  return ajax<ICheckKnowledgeSourceDocRes>({
    method: "POST",
    url: `${sourceBase}/source_doc_check`,
    data
  })
}

/** 本地文件上传：docx/xlsx 读成 base64 传上来，服务端解析正文后建 file 文档 */
export function uploadKnowledgeSourceDocApi(data: IUploadKnowledgeSourceDocReq) {
  return ajax<IUploadKnowledgeSourceDocRes>({
    method: "POST",
    url: `${sourceBase}/source_doc_upload`,
    data
  })
}

/** 知识源详情页「文档」分区：列出该集合下的文档 */
export function listKnowledgeSourceDocApi(params: IListKnowledgeSourceDocReq) {
  return ajax<IListKnowledgeSourceDocRes>({
    method: "GET",
    url: `${sourceBase}/source_doc_list`,
    params
  })
}

/** 导入在线文档：粘贴海狸内部在线文档地址，后端解析后建立引用 */
export function importKnowledgeSourceDocApi(data: IImportKnowledgeSourceDocReq) {
  return ajax<IImportKnowledgeSourceDocRes>({
    method: "POST",
    url: `${sourceBase}/source_doc_import`,
    data
  })
}

/** 删除知识源里的一条文档引用（不动在线文档本体） */
export function deleteKnowledgeSourceDocApi(data: IDeleteKnowledgeSourceDocReq) {
  return ajax<IDeleteKnowledgeSourceDocRes>({
    method: "POST",
    url: `${sourceBase}/source_doc_delete`,
    data
  })
}

/** 知识源详情页「召回测试」分区 */
export function retrieveKnowledgeSourceApi(data: IRetrieveKnowledgeSourceReq) {
  return ajax<IRetrieveKnowledgeSourceRes>({
    method: "POST",
    url: `${sourceBase}/source_retrieve`,
    data
  })
}
