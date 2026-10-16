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
  ICreateWorkbenchAppReq,
  ICreateWorkbenchAppRes,
  IDeleteWorkbenchAppReq,
  IGetWorkbenchAppListReq,
  IGetWorkbenchAppListRes,
  IUpdateWorkbenchAppReq,
  IWorkbenchAppItem
} from "@/types/api/workbench"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getWorkbenchAppListApi(params: IGetWorkbenchAppListReq) {
  return ajax<IGetWorkbenchAppListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/workbench/v1/list`,
    params
  })
}

export function getWorkbenchAppApi(workbenchAppId: string) {
  return ajax<IWorkbenchAppItem>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/workbench/v1/detail`,
    params: { workbenchAppId }
  })
}

export function createWorkbenchAppApi(data: ICreateWorkbenchAppReq) {
  return ajax<ICreateWorkbenchAppRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/workbench/v1/create`,
    data
  })
}

export function updateWorkbenchAppApi(data: IUpdateWorkbenchAppReq) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/workbench/v1/update`,
    data
  })
}

export function deleteWorkbenchAppApi(data: IDeleteWorkbenchAppReq) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/workbench/v1/delete`,
    data
  })
}
