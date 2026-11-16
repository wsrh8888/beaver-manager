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

// scene ↔ agent_id 绑定；编排字段去 IAgentInfo（GetAgent）取。
export interface IAiAssistantInfo {
  scene: string
  agentId: string
  name: string
  status: number
  version: number
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
  credentialId: string
  channelName: string
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
  credentialId: string
  modelName?: string
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

export interface IUpdateAgentModelReq extends Omit<ICreateAgentModelReq, "credentialId"> {
  modelId: string
  credentialId?: string
}

export interface IDeleteAgentModelReq {
  modelId: string
  source?: string
  userId?: string
}

// —— 模型接入通道（两层货架上层，官方渠道，密钥只进不出）——
export interface IAgentCredentialInfo {
  credentialId: string
  name: string
  modelService: string
  channelType: string
  baseUrl: string
  keyHint: string
  keyConfigured: boolean
  sort: number
  status: number
}

export interface IGetAgentCredentialListReq {
  status?: number
}

export interface IGetAgentCredentialListRes {
  list: IAgentCredentialInfo[]
}

export interface ICreateAgentCredentialReq {
  name: string
  modelService: string
  channelType?: string
  baseUrl: string
  apiKey?: string
  sort?: number
  status?: number
}

export interface ICreateAgentCredentialRes {
  credentialId: string
}

export interface IUpdateAgentCredentialReq {
  credentialId: string
  name?: string
  modelService?: string
  channelType?: string
  baseUrl?: string
  apiKey?: string
  sort?: number
  status?: number
}

export interface IDeleteAgentCredentialReq {
  credentialId: string
}

// 渠道无关的 AI 编排定义（agents 表）。scene 归属在 IAiAssistantInfo，不在 Agent 上。
export interface IAgentInfo {
  agentId: string
  name: string
  description: string
  ownerUserId: string
  source: string       // official | custom
  runtime: string      // builtin | workflow
  systemPrompt: string
  llmModelId: string
  modelParams: string
  tools: string
  mcpServerIds: string
  knowledgeIds: string // 来自 agent_knowledge_bindings
  openingMessage: string
  openingQuestions: string
  variables: string
  workflowConfig: string
  status: number
  sort: number
  version: number
  createdBy: string
}

export interface IGetAgentListReq {
  scene?: string   // 传入时经 ai_assistant 解析出 agent_id 单查
  source?: string
  runtime?: string
  status?: number
  page: number
  pageSize: number
}

export interface IGetAgentListRes {
  total: number
  list: IAgentInfo[]
}

export interface IGetAgentReq {
  agentId?: string
  scene?: string
}

export interface IGetAgentRes {
  agent: IAgentInfo
}

export interface ICreateAgentReq {
  agentId?: string
  name: string
  scene?: string       // 传入时创建后绑定 scene↔agent_id
  description?: string
  source?: string
  runtime?: string
  systemPrompt?: string
  llmModelId?: string
  modelParams?: string
  tools?: string
  mcpServerIds?: string
  knowledgeIds?: string
  openingMessage?: string
  openingQuestions?: string
  variables?: string
  workflowConfig?: string
  status?: number
  sort?: number
}

export interface ICreateAgentRes {
  agentId: string
}

export interface IUpdateAgentReq extends ICreateAgentReq {
  agentId: string
  version?: number
}

export interface IDeleteAgentReq {
  agentId: string
}

export interface IAgentToolInfo {
  toolId: string
  name: string
  description: string
  version: string
  skillMd: string
  fileName: string
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
  description?: string
  version?: string
  skillMd?: string
  fileName?: string
  toolType?: string
  config?: string
  status?: number
  sort?: number
}

export interface ICreateAgentToolRes {
  toolId: string
}

export interface IUpdateAgentToolReq extends Partial<ICreateAgentToolReq> {
  toolId: string
}

export interface IDeleteAgentToolReq {
  toolId: string
}

// 上传 SKILL.md 解析结果（不落库，确认后再建技能）
export interface IParseAgentToolFileReq {
  fileName: string
  data: string
}

export interface IParseAgentToolFileRes {
  name: string
  description: string
  version: string
  skillMd: string
  fileName: string
  config: string
  msg: string
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
