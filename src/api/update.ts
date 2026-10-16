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

import { ajax } from '@/utils/request'
import config from '@/config/env'
import type { 
  IAddAppReq, IAddAppRes,
  IGetAppsReq, IGetAppsRes,
  IAddArchitectureReq, IAddArchitectureRes,
  IUpdateArchitectureReq,
  IGetArchitecturesReq, IGetArchitecturesRes,
  IAddVersionReq, IAddVersionRes,
  IGetVersionListReq, IGetVersionListRes,
  IUpsertReleasePolicyReq, IUpsertReleasePolicyRes,
  IGetReleasePoliciesReq, IGetReleasePoliciesRes
} from '@/types/api/update'

export function addAppApi(data: IAddAppReq) {
  return ajax<IAddAppRes>({
    method: 'POST',
    url: `${config.baseAPI}/admin/backend/update/v1/add_app`,
    data
  })
}

export function getAppsApi(params: IGetAppsReq) {
  return ajax<IGetAppsRes>({
    method: 'GET',
    url: `${config.baseAPI}/admin/backend/update/v1/list_apps`,
    params
  })
}

export function addArchitectureApi(data: IAddArchitectureReq) {
  return ajax<IAddArchitectureRes>({
    method: 'POST',
    url: `${config.baseAPI}/admin/backend/update/v1/add_architecture`,
    data
  })
}

export function updateArchitectureApi(data: IUpdateArchitectureReq) {
  return ajax<void>({
    method: 'POST',
    url: `${config.baseAPI}/admin/backend/update/v1/update_architecture`,
    data
  })
}

export function getArchitecturesApi(params: IGetArchitecturesReq) {
  return ajax<IGetArchitecturesRes>({
    method: 'GET',
    url: `${config.baseAPI}/admin/backend/update/v1/list_architectures`,
    params
  })
}

export const addVersionApi = (data: IAddVersionReq) => {
  return ajax<IAddVersionRes>({
    url: `${config.baseAPI}/admin/backend/update/v1/add_version`,
    method: 'post',
    data
  })
}

export const getVersionListApi = (params: IGetVersionListReq) => {
  return ajax<IGetVersionListRes>({
    url: `${config.baseAPI}/admin/backend/update/v1/list_versions`,
    method: 'get',
    params
  })
}

export function deleteVersionApi(id: number) {
  return ajax<void>({
    method: 'POST',
    url: `${config.baseAPI}/admin/backend/update/v1/delete_version`,
    data: { id }
  })
}

export function upsertReleasePolicyApi(data: IUpsertReleasePolicyReq) {
  return ajax<IUpsertReleasePolicyRes>({
    method: 'POST',
    url: `${config.baseAPI}/admin/backend/update/v1/upsert_release_policy`,
    data
  })
}

export function getReleasePoliciesApi(params: IGetReleasePoliciesReq) {
  return ajax<IGetReleasePoliciesRes>({
    method: 'GET',
    url: `${config.baseAPI}/admin/backend/update/v1/list_release_policies`,
    params
  })
}
