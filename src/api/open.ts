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
  IGetOpenBotListReq,
  IGetOpenBotListRes,
  IGetOpenOAuthListReq,
  IGetOpenOAuthListRes,
  IUpdateOpenBotStatusReq,
  IUpdateOpenBotStatusRes,
  IUpdateOpenOAuthStatusReq,
  IUpdateOpenOAuthStatusRes
} from "@/types/api/open"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// ==================== OAuth 应用 ====================

export function getOpenOAuthListApi(params: IGetOpenOAuthListReq) {
  return ajax<IGetOpenOAuthListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/open/v1/oauth_list`,
    params
  })
}

export function updateOpenOAuthStatusApi(data: IUpdateOpenOAuthStatusReq) {
  return ajax<IUpdateOpenOAuthStatusRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/open/v1/oauth_update_status`,
    data
  })
}

// ==================== 推送机器人 ====================

export function getOpenBotListApi(params: IGetOpenBotListReq) {
  return ajax<IGetOpenBotListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/open/v1/bot_list`,
    params
  })
}

export function updateOpenBotStatusApi(data: IUpdateOpenBotStatusReq) {
  return ajax<IUpdateOpenBotStatusRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/open/v1/bot_update_status`,
    data
  })
}
