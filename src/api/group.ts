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
  DeleteGroupRes,
  GetGroupDetailRes,
  GetGroupListReq,
  GetGroupListRes,
  GetGroupMemberListReq,
  GetGroupMemberListRes,
  MuteGroupMemberReq,
  MuteGroupMemberRes,
  RemoveGroupMemberReq,
  RemoveGroupMemberRes,
  UpdateGroupReq,
  UpdateGroupRes,
  UpdateMemberRoleReq,
  UpdateMemberRoleRes
} from "@/types/api/group"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getGroupListApi(params: GetGroupListReq) {
  return ajax<GetGroupListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/group/v1/list`,
    params
  })
}

export function getGroupDetailApi(id: number) {
  return ajax<GetGroupDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/group/v1/detail`,
    params: { id }
  })
}

export function updateGroupApi(id: number, data: Omit<UpdateGroupReq, "id">) {
  return ajax<UpdateGroupRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/group/v1/update`,
    data: { id, ...data }
  })
}

export function deleteGroupApi(id: number) {
  return ajax<DeleteGroupRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/group/v1/delete`,
    data: { id }
  })
}

export function getGroupMemberListApi(params: GetGroupMemberListReq) {
  return ajax<GetGroupMemberListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/group/v1/members`,
    params
  })
}

export function removeGroupMemberApi(data: RemoveGroupMemberReq) {
  return ajax<RemoveGroupMemberRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/group/v1/remove_member`,
    data
  })
}

export function updateMemberRoleApi(id: number, data: Omit<UpdateMemberRoleReq, "id">) {
  return ajax<UpdateMemberRoleRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/group/v1/update_member_role`,
    data: { id, ...data }
  })
}

export function muteGroupMemberApi(id: number, data: Omit<MuteGroupMemberReq, "id">) {
  return ajax<MuteGroupMemberRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/group/v1/mute_member`,
    data: { id, ...data }
  })
}
