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

export interface IDigitalAdminInfo {
  digitalId: string
  name: string
  description: string
  avatar: string
  ownerId: string
  runtime: string
  visibility: string
  status: number
  source: string
  systemPrompt: string
  llmModelId: string
  tools: string
  mcpServerIds: string
  createdAt: number
}

export interface IGetDigitalListReq {
  source: string
  status?: number
  page: number
  pageSize: number
}

export interface IGetDigitalListRes {
  total: number
  list: IDigitalAdminInfo[]
}

export interface ICreateSystemDigitalReq {
  name: string
  description?: string
  avatar?: string
  runtime: string
  visibility?: string
  systemPrompt?: string
  llmModelId?: string
  tools?: string
  mcpServerIds?: string
}

export interface ICreateSystemDigitalRes {
  digitalId: string
  appKey?: string
  appSecret?: string
}

export interface IUpdateDigitalReq {
  digitalId: string
  name?: string
  visibility?: string
  status: number
  systemPrompt?: string
  llmModelId?: string
  tools?: string
  mcpServerIds?: string
}
