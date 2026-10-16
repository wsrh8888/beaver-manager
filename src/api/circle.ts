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
  DeleteCircleCommentRes,
  DeleteCirclePostRes,
  DeleteCircleRes,
  GetCircleCommentListReq,
  GetCircleCommentListRes,
  GetCircleDetailRes,
  GetCircleListReq,
  GetCircleListRes,
  GetCircleMemberListReq,
  GetCircleMemberListRes,
  GetCirclePostListReq,
  GetCirclePostListRes,
  RemoveCircleMemberReq,
  RemoveCircleMemberRes
} from "@/types/api/circle"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getCircleListApi(params: GetCircleListReq) {
  return ajax<GetCircleListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/circle/v1/list`,
    params
  })
}

export function getCircleDetailApi(circleId: string) {
  return ajax<GetCircleDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/circle/v1/detail`,
    params: { circleId }
  })
}

export function deleteCircleApi(circleId: string) {
  return ajax<DeleteCircleRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/circle/v1/delete`,
    data: { circleId }
  })
}

export function getCircleMemberListApi(params: GetCircleMemberListReq) {
  return ajax<GetCircleMemberListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/circle/v1/members`,
    params
  })
}

export function removeCircleMemberApi(data: RemoveCircleMemberReq) {
  return ajax<RemoveCircleMemberRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/circle/v1/remove_member`,
    data
  })
}

export function getCirclePostListApi(params: GetCirclePostListReq) {
  return ajax<GetCirclePostListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/circle/v1/posts`,
    params
  })
}

export function deleteCirclePostApi(postId: string) {
  return ajax<DeleteCirclePostRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/circle/v1/delete_post`,
    data: { postId }
  })
}

export function getCircleCommentListApi(params: GetCircleCommentListReq) {
  return ajax<GetCircleCommentListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/circle/v1/comments`,
    params
  })
}

export function deleteCircleCommentApi(commentId: string) {
  return ajax<DeleteCircleCommentRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/circle/v1/delete_comment`,
    data: { commentId }
  })
}
