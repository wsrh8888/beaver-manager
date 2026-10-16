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
  IBatchDeleteFriendsReq,
  IBatchDeleteFriendsRes,
  IBatchDeleteFriendVerifyReq,
  IBatchDeleteFriendVerifyRes,
  IDeleteFriendRes,
  IDeleteFriendVerifyReq,
  IDeleteFriendVerifyRes,
  IGetFriendBlockListReq,
  IGetFriendBlockListRes,
  IGetFriendDetailRes,
  IGetFriendListReq,
  IGetFriendListRes,
  IGetFriendVerifyDetailReq,
  IGetFriendVerifyDetailRes,
  IGetFriendVerifyListReq,
  IGetFriendVerifyListRes,
  IRestoreFriendReq,
  IRestoreFriendRes,
  IUnblockFriendUsersReq,
  IUnblockFriendUsersRes
} from "@/types/api/friend"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getFriendListApi(params: IGetFriendListReq) {
  return ajax<IGetFriendListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/friend/v1/list`,
    params
  })
}

export function getFriendDetailApi(id: string) {
  return ajax<IGetFriendDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/friend/v1/detail`,
    params: { id }
  })
}

export function deleteFriendApi(id: string) {
  return ajax<IDeleteFriendRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/friend/v1/delete`,
    data: { id }
  })
}

export function batchDeleteFriendsApi(data: IBatchDeleteFriendsReq) {
  return ajax<IBatchDeleteFriendsRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/friend/v1/batch_delete`,
    data
  })
}

export function restoreFriendApi(data: IRestoreFriendReq) {
  return ajax<IRestoreFriendRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/friend/v1/restore`,
    data
  })
}

export function getFriendVerifyListApi(params: IGetFriendVerifyListReq) {
  return ajax<IGetFriendVerifyListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/friend/v1/verify_list`,
    params
  })
}

export function getFriendVerifyDetailApi(params: IGetFriendVerifyDetailReq) {
  return ajax<IGetFriendVerifyDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/friend/v1/verify_detail`,
    params
  })
}

export function deleteFriendVerifyApi(data: IDeleteFriendVerifyReq) {
  return ajax<IDeleteFriendVerifyRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/friend/v1/delete_verify`,
    data
  })
}

export function batchDeleteFriendVerifyApi(data: IBatchDeleteFriendVerifyReq) {
  return ajax<IBatchDeleteFriendVerifyRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/friend/v1/batch_delete_verify`,
    data
  })
}

export function getFriendBlockListApi(params: IGetFriendBlockListReq) {
  return ajax<IGetFriendBlockListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/friend/v1/block_list`,
    params
  })
}

export function unblockFriendUsersApi(data: IUnblockFriendUsersReq) {
  return ajax<IUnblockFriendUsersRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/friend/v1/unblock_batch`,
    data
  })
}
