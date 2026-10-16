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
  GetMomentCommentListReq,
  GetMomentCommentListRes,
  GetMomentDetailRes,
  GetMomentListReq,
  GetMomentListRes,
  DeleteMomentCommentRes,
  DeleteMomentRes
} from "@/types/api/moment"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getMomentListApi(params: GetMomentListReq) {
  return ajax<GetMomentListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/moment/v1/list`,
    params
  })
}

export function getMomentDetailApi(momentId: string) {
  return ajax<GetMomentDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/moment/v1/detail`,
    params: { momentId }
  })
}

export function deleteMomentApi(momentId: string) {
  return ajax<DeleteMomentRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/moment/v1/delete`,
    data: { momentId }
  })
}

export function getMomentCommentListApi(params: GetMomentCommentListReq) {
  return ajax<GetMomentCommentListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/moment/v1/comments`,
    params
  })
}

export function deleteMomentCommentApi(id: number) {
  return ajax<DeleteMomentCommentRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/moment/v1/delete_comment`,
    data: { commentId: String(id) }
  })
}
