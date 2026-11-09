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

export interface IKnowledgeCollectionInfo {
  id: number
  collectionId: string
  parentId: string // 父集合ID，空为根；仅两层
  name: string
  kind: string // docs|faq|...
  aclMode: string // user_scoped|internal
  indexConfig: string // JSON：分段/检索/embedding 配置
  description: string
  ownerUserId: string
  status: number // 1启用 2停用
  sort: number
}

export interface IKnowledgeDocumentInfo {
  id: number
  documentId: string
  collectionId: string
  title: string
  mediaType: string
  docType: string // guide|policy|faq|product
  byteSize: number
  sourceRef: string
  sourceType: string // doc|file
  sourceDocId: string
  syncMode: string
  lastSyncedAt: string
  metadataText: string
  ragEnabled: boolean
  indexStatus: string // pending|indexing|ready|failed
  indexRetryCount: number
  indexError: string
  indexedAt: string
  version: number
  status: number
  ownerUserId: string
  updatedBy: string
}

// —— 集合 CRUD ——
export interface IGetKnowledgeCollectionListReq {
  status?: number // 0全部 1启用 2停用
  page: number
  pageSize: number
}

export interface IGetKnowledgeCollectionListRes {
  total: number
  list: IKnowledgeCollectionInfo[]
}

export interface IGetKnowledgeCollectionReq {
  collectionId: string
}

export interface IGetKnowledgeCollectionRes {
  collection: IKnowledgeCollectionInfo
}

export interface ICreateKnowledgeCollectionReq {
  parentId?: string
  name: string
  kind?: string // default=docs
  aclMode?: string // default=internal
  indexConfig?: string // JSON
  description?: string
  status?: number // default=1
  sort?: number
}

export interface ICreateKnowledgeCollectionRes {
  collectionId: string
}

export interface IUpdateKnowledgeCollectionReq {
  collectionId: string
  name?: string
  kind?: string
  aclMode?: string
  indexConfig?: string
  description?: string
  status?: number
  sort?: number
}

export interface IDeleteKnowledgeCollectionReq {
  collectionId: string // 级联软删其下文档并清索引
}

// —— 文档 CRUD ——
export interface IGetKnowledgeDocumentListReq {
  collectionId?: string
  indexStatus?: string
  status?: number
  page: number
  pageSize: number
}

export interface IGetKnowledgeDocumentListRes {
  total: number
  list: IKnowledgeDocumentInfo[]
}

export interface IGetKnowledgeDocumentReq {
  documentId: string
}

export interface IGetKnowledgeDocumentRes {
  document: IKnowledgeDocumentInfo
}

export interface ICreateKnowledgeDocumentReq {
  collectionId: string
  title: string
  mediaType?: string
  docType?: string // default=guide
  sourceType?: string // doc|file
  sourceDocId?: string // 平台在线文档ID（sourceType=doc 时必填）
  syncMode?: string // import|direct
  syncInterval?: number
  sourceRef?: string // 上传后回填的对象存储键
  contentText?: string // 纯文本正文；有则入队索引
  metadataText?: string
  ragEnabled?: boolean // default=true
  ownerUserId?: string
}

export interface ICreateKnowledgeDocumentRes {
  documentId: string
}

export interface IUpdateKnowledgeDocumentReq {
  documentId: string
  title?: string
  docType?: string
  contentText?: string // 变更则重新入队索引
  metadataText?: string
  ragEnabled?: boolean
  status?: number
}

export interface IDeleteKnowledgeDocumentReq {
  documentId: string // 软删并同步清 OpenSearch 索引
}

export interface IReindexKnowledgeDocumentReq {
  documentId: string // 重新入队索引
}
