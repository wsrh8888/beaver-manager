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
  IDeleteFeedbackRes,
  IGetFeedbackDetailRes,
  IGetFeedbackListReq,
  IGetFeedbackListRes,
  IHandleFeedbackReq,
  IHandleFeedbackRes
} from "@/types/api/feedback"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getFeedbackListApi(params: IGetFeedbackListReq) {
  return ajax<IGetFeedbackListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/feedback/v1/list`,
    params
  })
}

export function getFeedbackDetailApi(id: number) {
  return ajax<IGetFeedbackDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/feedback/v1/detail`,
    params: { id }
  })
}

export function handleFeedbackApi(id: number, data: Omit<IHandleFeedbackReq, "id">) {
  return ajax<IHandleFeedbackRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/feedback/v1/handle`,
    data: { id, ...data }
  })
}

export function deleteFeedbackApi(id: number) {
  return ajax<IDeleteFeedbackRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/feedback/v1/delete`,
    data: { id }
  })
}
