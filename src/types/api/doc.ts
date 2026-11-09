/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * 在线文档 API 类型（对应 beaver-server app/doc/doc_api）
 */

// —— 空间 space ——
export interface ISpaceItem {
  spaceId: string
  name: string
  kind: string
  ownerUserId: string
  parentId: string
  icon: string
  description: string
  status: number
  sort: number
  createdAt: string
}

export interface IListSpacesReq {
  status?: number
  page?: number
  pageSize?: number
}

export interface IListSpacesRes {
  total: number
  spaces: ISpaceItem[]
}

export interface ICreateSpaceReq {
  name: string
  kind?: string
  parentId?: string
  icon?: string
  description?: string
  sort?: number
}

export interface ICreateSpaceRes {
  spaceId: string
}

export interface IDeleteSpaceReq {
  spaceId: string
}

// —— 节点 node（folder | page）——
export interface INodeItem {
  nodeId: string
  spaceId: string
  parentId: string
  title: string
  icon: string
  type: string // folder | page
  sort: number
  docId: string
}

export interface IListNodesReq {
  spaceId: string
}

export interface IListNodesRes {
  nodes: INodeItem[]
}

export interface ICreateNodeReq {
  spaceId: string
  parentId?: string
  title: string
  type?: string // folder | page
  icon?: string
  sort?: number
}

export interface ICreateNodeRes {
  nodeId: string
  docId: string
}

export interface IDeleteNodeReq {
  nodeId: string
}

// —— 文档 document ——
export interface IDocItem {
  docId: string
  nodeId: string
  spaceId: string
  title: string
  contentJson: string
  version: number
  ownerUserId: string
  lastEditedBy: string
  status: number
  updatedAt: string
  createdAt: string
}

export interface IGetDocReq {
  docId: string
}

export interface IGetDocRes {
  doc: IDocItem
}

export interface ICreateDocReq {
  spaceId: string
  nodeId?: string
  title: string
  contentJson?: string
}

export interface ICreateDocRes {
  docId: string
}

export interface ISaveDocContentReq {
  docId: string
  contentJson: string
  contentText?: string
}

export interface IUpdateDocMetaReq {
  docId: string
  title?: string
  status?: number
}

export interface IDeleteDocReq {
  docId: string
}

// —— 文件导入 ——
export interface IImportDocReq {
  spaceId: string
  parentNodeId?: string
  title?: string
  fileName: string
  data: string // base64
}

export interface IImportDocRes {
  docId: string
  nodeId: string
  contentText: string
  fileKind: string
  parsed: boolean
  message: string
}
