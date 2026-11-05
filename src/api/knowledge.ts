/*
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
 */

import type {
  ICreateKnowledgeCollectionReq,
  ICreateKnowledgeCollectionRes,
  ICreateKnowledgeDocumentReq,
  ICreateKnowledgeDocumentRes,
  IDeleteKnowledgeCollectionReq,
  IDeleteKnowledgeDocumentReq,
  IGetKnowledgeCollectionListReq,
  IGetKnowledgeCollectionListRes,
  IGetKnowledgeCollectionReq,
  IGetKnowledgeCollectionRes,
  IGetKnowledgeDocumentListReq,
  IGetKnowledgeDocumentListRes,
  IGetKnowledgeDocumentReq,
  IGetKnowledgeDocumentRes,
  IReindexKnowledgeDocumentReq,
  IUpdateKnowledgeCollectionReq,
  IUpdateKnowledgeDocumentReq
} from "@/types/api/knowledge"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// —— 集合 CRUD ——
export function getKnowledgeCollectionListApi(params: IGetKnowledgeCollectionListReq) {
  return ajax<IGetKnowledgeCollectionListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/knowledge/v1/collection_list`,
    params
  })
}

export function getKnowledgeCollectionApi(params: IGetKnowledgeCollectionReq) {
  return ajax<IGetKnowledgeCollectionRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/knowledge/v1/collection_detail`,
    params
  })
}

export function createKnowledgeCollectionApi(data: ICreateKnowledgeCollectionReq) {
  return ajax<ICreateKnowledgeCollectionRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/knowledge/v1/collection_create`,
    data
  })
}

export function updateKnowledgeCollectionApi(data: IUpdateKnowledgeCollectionReq) {
  return ajax<void>({
    method: "PUT",
    url: `${config.baseAPI}/admin/backend/knowledge/v1/collection_update`,
    data
  })
}

export function deleteKnowledgeCollectionApi(data: IDeleteKnowledgeCollectionReq) {
  return ajax<void>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/backend/knowledge/v1/collection_delete`,
    data
  })
}

// —— 文档 CRUD ——
export function getKnowledgeDocumentListApi(params: IGetKnowledgeDocumentListReq) {
  return ajax<IGetKnowledgeDocumentListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/knowledge/v1/document_list`,
    params
  })
}

export function getKnowledgeDocumentApi(params: IGetKnowledgeDocumentReq) {
  return ajax<IGetKnowledgeDocumentRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/knowledge/v1/document_detail`,
    params
  })
}

export function createKnowledgeDocumentApi(data: ICreateKnowledgeDocumentReq) {
  return ajax<ICreateKnowledgeDocumentRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/knowledge/v1/document_create`,
    data
  })
}

export function updateKnowledgeDocumentApi(data: IUpdateKnowledgeDocumentReq) {
  return ajax<void>({
    method: "PUT",
    url: `${config.baseAPI}/admin/backend/knowledge/v1/document_update`,
    data
  })
}

export function deleteKnowledgeDocumentApi(data: IDeleteKnowledgeDocumentReq) {
  return ajax<void>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/backend/knowledge/v1/document_delete`,
    data
  })
}

export function reindexKnowledgeDocumentApi(data: IReindexKnowledgeDocumentReq) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/knowledge/v1/document_reindex`,
    data
  })
}
