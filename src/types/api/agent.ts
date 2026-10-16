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

export interface IAiAssistantInfo {
  scene: string
  name: string
  systemPrompt: string
  llmModelId: string
  modelParams: string
  tools: string
  mcpServerIds: string
  openingMessage: string
  status: number
}

export interface IGetAiAssistantReq {
  scene: string
}

export interface ISaveAiAssistantReq {
  scene: string
  name?: string
  systemPrompt?: string
  llmModelId?: string
  modelParams?: string
  tools?: string
  mcpServerIds?: string
  openingMessage?: string
  status?: number
}

export interface IAgentModelInfo {
  modelId: string
  source: string
  userId: string
  name: string
  provider: string
  modelName: string
  endpoint: string
  apiKey: string
  contextWindow: number
  maxOutputTokens: number
  supportsTools: boolean
  supportsVision: boolean
  sort: number
  status: number
}

export interface IGetAgentModelListReq {
  source?: string
  userId?: string
  status?: number
  page: number
  pageSize: number
}

export interface IGetAgentModelListRes {
  total: number
  list: IAgentModelInfo[]
}

export interface ICreateAgentModelReq {
  name: string
  source: string
  userId?: string
  provider?: string
  modelName?: string
  endpoint?: string
  apiKey?: string
  contextWindow?: number
  maxOutputTokens?: number
  supportsTools?: boolean
  supportsVision?: boolean
  sort?: number
  status?: number
}

export interface ICreateAgentModelRes {
  modelId: string
}

export interface IUpdateAgentModelReq extends ICreateAgentModelReq {
  modelId: string
}

export interface IDeleteAgentModelReq {
  modelId: string
  source?: string
  userId?: string
}

export interface IAgentAppInfo {
  appId: string
  name: string
  scene: string
  systemPrompt: string
  llmModelId: string
  modelParams: string
  tools: string
  mcpServerIds: string
  knowledgeIds: string
  openingMessage: string
  openingQuestions: string
  variables: string
  status: number
  sort: number
  createdBy: string
}

export interface IGetAgentAppListReq {
  scene?: string
  status?: number
  page: number
  pageSize: number
}

export interface IGetAgentAppListRes {
  total: number
  list: IAgentAppInfo[]
}

export interface IGetAgentAppReq {
  appId?: string
  scene?: string
}

export interface IGetAgentAppRes {
  app: IAgentAppInfo
}

export interface ICreateAgentAppReq {
  name: string
  scene: string
  systemPrompt?: string
  llmModelId?: string
  modelParams?: string
  tools?: string
  mcpServerIds?: string
  knowledgeIds?: string
  openingMessage?: string
  openingQuestions?: string
  variables?: string
  status?: number
  sort?: number
}

export interface ICreateAgentAppRes {
  appId: string
}

export interface IUpdateAgentAppReq extends ICreateAgentAppReq {
  appId: string
}

export interface IDeleteAgentAppReq {
  appId: string
}

export interface IAgentToolInfo {
  toolId: string
  name: string
  toolType: string
  config: string
  status: number
  sort: number
}

export interface IGetAgentToolListReq {
  status?: number
  source?: string
}

export interface IGetAgentToolListRes {
  list: IAgentToolInfo[]
}

export interface IGetAgentToolReq {
  toolId: string
}

export interface IGetAgentToolRes {
  tool: IAgentToolInfo
}

export interface ICreateAgentToolReq {
  name: string
  toolType: string
  config?: string
  status?: number
  sort?: number
}

export interface ICreateAgentToolRes {
  toolId: string
}

export interface IUpdateAgentToolReq extends ICreateAgentToolReq {
  toolId: string
}

export interface IDeleteAgentToolReq {
  toolId: string
}

export interface IAgentMcpServerInfo {
  mcpServerId: string
  name: string
  serverName: string
  transport: string
  config: string
  tools: string
  status: number
}

export interface IGetAgentMcpServerListReq {
  status?: number
  source?: string
}

export interface IGetAgentMcpServerListRes {
  list: IAgentMcpServerInfo[]
}

export interface IGetAgentMcpServerReq {
  mcpServerId: string
}

export interface IGetAgentMcpServerRes {
  server: IAgentMcpServerInfo
}

export interface ICreateAgentMcpServerReq {
  name: string
  serverName: string
  transport: string
  config?: string
  tools?: string
  status?: number
}

export interface ICreateAgentMcpServerRes {
  mcpServerId: string
}

export interface IUpdateAgentMcpServerReq extends ICreateAgentMcpServerReq {
  mcpServerId: string
}

export interface IDeleteAgentMcpServerReq {
  mcpServerId: string
}
