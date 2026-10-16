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
 */

import type {
  ICreateAgentAppReq,
  ICreateAgentAppRes,
  ICreateAgentMcpServerReq,
  ICreateAgentMcpServerRes,
  ICreateAgentToolReq,
  ICreateAgentToolRes,
  IDeleteAgentAppReq,
  IDeleteAgentMcpServerReq,
  IDeleteAgentToolReq,
  IGetAgentAppListReq,
  IGetAgentAppListRes,
  IGetAgentAppReq,
  IGetAgentAppRes,
  IGetAgentModelListReq,
  IGetAgentModelListRes,
  ICreateAgentModelReq,
  ICreateAgentModelRes,
  IUpdateAgentModelReq,
  IDeleteAgentModelReq,
  IAiAssistantInfo,
  IGetAiAssistantReq,
  ISaveAiAssistantReq,
  IGetAgentMcpServerListReq,
  IGetAgentMcpServerListRes,
  IGetAgentMcpServerReq,
  IGetAgentMcpServerRes,
  IGetAgentToolListReq,
  IGetAgentToolListRes,
  IGetAgentToolReq,
  IGetAgentToolRes,
  IUpdateAgentAppReq,
  IUpdateAgentMcpServerReq,
  IUpdateAgentToolReq
} from "@/types/api/agent"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function saveAiAssistantApi(data: ISaveAiAssistantReq) {
  return ajax<void>({
    method: "PUT",
    url: `${config.baseAPI}/admin/backend/agent/v1/assistant_save`,
    data
  })
}

export function getAiAssistantApi(params: IGetAiAssistantReq) {
  return ajax<{ assistant: IAiAssistantInfo }>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/agent/v1/assistant_detail`,
    params
  })
}

export function getAgentAppListApi(params: IGetAgentAppListReq) {
  return ajax<IGetAgentAppListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/agent/v1/app_list`,
    params
  })
}

export function getAgentAppApi(params: IGetAgentAppReq) {
  return ajax<IGetAgentAppRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/agent/v1/app_detail`,
    params
  })
}

export function createAgentAppApi(data: ICreateAgentAppReq) {
  return ajax<ICreateAgentAppRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/agent/v1/app_create`,
    data
  })
}

export function updateAgentAppApi(data: IUpdateAgentAppReq) {
  return ajax<void>({
    method: "PUT",
    url: `${config.baseAPI}/admin/backend/agent/v1/app_update`,
    data
  })
}

export function deleteAgentAppApi(data: IDeleteAgentAppReq) {
  return ajax<void>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/backend/agent/v1/app_delete`,
    data
  })
}

export function getAgentToolListApi(params: IGetAgentToolListReq) {
  return ajax<IGetAgentToolListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/agent/v1/tool_list`,
    params
  })
}

export function getAgentToolApi(params: IGetAgentToolReq) {
  return ajax<IGetAgentToolRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/agent/v1/tool_detail`,
    params
  })
}

export function createAgentToolApi(data: ICreateAgentToolReq) {
  return ajax<ICreateAgentToolRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/agent/v1/tool_create`,
    data
  })
}

export function updateAgentToolApi(data: IUpdateAgentToolReq) {
  return ajax<void>({
    method: "PUT",
    url: `${config.baseAPI}/admin/backend/agent/v1/tool_update`,
    data
  })
}

export function deleteAgentToolApi(data: IDeleteAgentToolReq) {
  return ajax<void>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/backend/agent/v1/tool_delete`,
    data
  })
}

export function getAgentMcpServerListApi(params: IGetAgentMcpServerListReq) {
  return ajax<IGetAgentMcpServerListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/agent/v1/mcp_list`,
    params
  })
}

export function getAgentMcpServerApi(params: IGetAgentMcpServerReq) {
  return ajax<IGetAgentMcpServerRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/agent/v1/mcp_detail`,
    params
  })
}

export function createAgentMcpServerApi(data: ICreateAgentMcpServerReq) {
  return ajax<ICreateAgentMcpServerRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/agent/v1/mcp_create`,
    data
  })
}

export function updateAgentMcpServerApi(data: IUpdateAgentMcpServerReq) {
  return ajax<void>({
    method: "PUT",
    url: `${config.baseAPI}/admin/backend/agent/v1/mcp_update`,
    data
  })
}

export function getAgentModelListApi(params: IGetAgentModelListReq) {
  return ajax<IGetAgentModelListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/agent/v1/model_list`,
    params
  })
}

export function createAgentModelApi(data: ICreateAgentModelReq) {
  return ajax<ICreateAgentModelRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/agent/v1/model_create`,
    data
  })
}

export function updateAgentModelApi(data: IUpdateAgentModelReq) {
  return ajax<void>({
    method: "PUT",
    url: `${config.baseAPI}/admin/backend/agent/v1/model_update`,
    data
  })
}

export function deleteAgentModelApi(data: IDeleteAgentModelReq) {
  return ajax<void>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/backend/agent/v1/model_delete`,
    data
  })
}

export function deleteAgentMcpServerApi(data: IDeleteAgentMcpServerReq) {
  return ajax<void>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/backend/agent/v1/mcp_delete`,
    data
  })
}
