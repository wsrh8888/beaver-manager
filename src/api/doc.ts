/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * 在线文档 API（beaver-server app/doc/doc_api，端口 20800）
 */

import type {
  ICreateDocReq,
  ICreateDocRes,
  ICreateNodeReq,
  ICreateNodeRes,
  ICreateSpaceReq,
  ICreateSpaceRes,
  IDeleteDocReq,
  IDeleteNodeReq,
  IDeleteSpaceReq,
  IGetDocReq,
  IGetDocRes,
  IImportDocReq,
  IImportDocRes,
  IListNodesReq,
  IListNodesRes,
  IListSpacesReq,
  IListSpacesRes,
  ISaveDocContentReq,
  IUpdateDocMetaReq
} from "@/types/api/doc"
import config from "@/config/env"
import { ajax } from "@/utils/request"

function docHeaders() {
  const userId = localStorage.getItem("userId") || ""
  return { "Beaver-User-Id": userId }
}

const DOC_BASE = `${config.apiApi}/api/doc/v1`

// —— 空间 ——
export function listSpacesApi(params: IListSpacesReq) {
  return ajax<IListSpacesRes>({
    method: "POST",
    url: `${DOC_BASE}/space/list`,
    data: params,
    headers: docHeaders()
  })
}

export function createSpaceApi(data: ICreateSpaceReq) {
  return ajax<ICreateSpaceRes>({
    method: "POST",
    url: `${DOC_BASE}/space/create`,
    data,
    headers: docHeaders()
  })
}

export function deleteSpaceApi(data: IDeleteSpaceReq) {
  return ajax<void>({
    method: "POST",
    url: `${DOC_BASE}/space/delete`,
    data,
    headers: docHeaders()
  })
}

// —— 节点 ——
export function listNodesApi(params: IListNodesReq) {
  return ajax<IListNodesRes>({
    method: "POST",
    url: `${DOC_BASE}/node/list`,
    data: params,
    headers: docHeaders()
  })
}

export function createNodeApi(data: ICreateNodeReq) {
  return ajax<ICreateNodeRes>({
    method: "POST",
    url: `${DOC_BASE}/node/create`,
    data,
    headers: docHeaders()
  })
}

export function deleteNodeApi(data: IDeleteNodeReq) {
  return ajax<void>({
    method: "POST",
    url: `${DOC_BASE}/node/delete`,
    data,
    headers: docHeaders()
  })
}

// —— 文档 ——
export function getDocApi(params: IGetDocReq) {
  return ajax<IGetDocRes>({
    method: "POST",
    url: `${DOC_BASE}/doc/get`,
    data: params,
    headers: docHeaders()
  })
}

export function createDocApi(data: ICreateDocReq) {
  return ajax<ICreateDocRes>({
    method: "POST",
    url: `${DOC_BASE}/doc/create`,
    data,
    headers: docHeaders()
  })
}

export function saveDocContentApi(data: ISaveDocContentReq) {
  return ajax<{ version: number }>({
    method: "POST",
    url: `${DOC_BASE}/doc/saveContent`,
    data,
    headers: docHeaders()
  })
}

export function updateDocMetaApi(data: IUpdateDocMetaReq) {
  return ajax<void>({
    method: "POST",
    url: `${DOC_BASE}/doc/updateMeta`,
    data,
    headers: docHeaders()
  })
}

export function deleteDocApi(data: IDeleteDocReq) {
  return ajax<void>({
    method: "POST",
    url: `${DOC_BASE}/doc/delete`,
    data,
    headers: docHeaders()
  })
}

// —— 文件导入 ——
export function importDocApi(data: IImportDocReq) {
  return ajax<IImportDocRes>({
    method: "POST",
    url: `${DOC_BASE}/doc/import`,
    data,
    headers: docHeaders()
  })
}
