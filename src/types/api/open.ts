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

// 开放平台（open 域）管理端类型：OAuth 应用 + 推送机器人。
// 两者都由开发者在控制台自助创建，后台只做检索与启停。

// ==================== OAuth 应用（open_oauth）====================

export interface IOpenOAuthInfo {
  oauthId: string
  name: string
  description: string
  icon: string
  ownerUserId: string
  ownerUserName: string
  /** 0 禁用 1 启用 */
  status: number
  createdAt: number
}

export interface IGetOpenOAuthListReq {
  page?: number
  pageSize?: number
  /** 应用名 / 描述 */
  keyword?: string
  ownerUserId?: string
  oauthId?: string
  /** -1 全部 0 禁用 1 启用 */
  status?: number
}

export interface IGetOpenOAuthListRes {
  total: number
  list: IOpenOAuthInfo[]
}

export interface IUpdateOpenOAuthStatusReq {
  oauthIds: string[]
  /** 0 禁用 1 启用 */
  status: number
}

export interface IUpdateOpenOAuthStatusRes {
  affectedCount: number
}

// ==================== 推送机器人（open_bot）====================

export interface IOpenBotInfo {
  /** Bot 的 IM 用户 ID */
  botId: string
  /** Bot 的 IM 昵称 */
  botName: string
  ownerId: string
  ownerUserName: string
  /** private | partial | public */
  visibility: string
  /** 0 禁用 1 启用 */
  status: number
  /** 1 开启入站签名校验 */
  signatureEnabled: number
  createdAt: number
}

export interface IGetOpenBotListReq {
  page?: number
  pageSize?: number
  /** BotID 模糊匹配 */
  keyword?: string
  ownerUserId?: string
  /** -1 全部 0 禁用 1 启用 */
  status?: number
}

export interface IGetOpenBotListRes {
  total: number
  list: IOpenBotInfo[]
}

export interface IUpdateOpenBotStatusReq {
  botId: string
  /** 0 禁用 1 启用 */
  status: number
}

export interface IUpdateOpenBotStatusRes {}

// ==================== 枚举文案 ====================

/** 启用状态（OAuth 应用与推送机器人共用：0 禁用 1 启用） */
export const OPEN_ENABLE_STATUS: Record<number, { text: string; type: string }> = {
  0: { text: "禁用", type: "info" },
  1: { text: "启用", type: "success" }
}

/** 机器人可见范围 */
export const OPEN_BOT_VISIBILITY: Record<string, string> = {
  private: "仅创建者",
  partial: "指定成员",
  public: "全部用户"
}
