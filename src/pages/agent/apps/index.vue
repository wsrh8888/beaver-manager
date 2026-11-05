<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-manager-header-v1
-->

<template>
  <div class="agent-assistant">
    <div class="agent-assistant-header">
      <h2 class="agent-assistant-title">场景智能体</h2>
      <p class="agent-assistant-hint">每个场景只能有一个智能体。名称就是场景名。模型不在这里配，agent 按 auto 自己取：有个人模型用个人的，没有就用官方的，都没有就提示没有</p>
    </div>

    <el-radio-group v-model="scene" class="agent-assistant-scenes" @change="loadAssistant">
      <el-radio-button value="assistant">AI 助手</el-radio-button>
      <el-radio-button value="chat">聊天</el-radio-button>
      <el-radio-button value="moment">朋友圈</el-radio-button>
      <el-radio-button value="workbench">工作台</el-radio-button>
    </el-radio-group>

    <el-form v-loading="loading" label-width="100px" class="agent-assistant-form">
      <el-form-item label="系统提示词">
        <el-input v-model="form.systemPrompt" type="textarea" :rows="6" />
      </el-form-item>
      <el-form-item label="开场白">
        <el-input v-model="form.openingMessage" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="工具">
        <el-select v-model="form.toolIds" multiple filterable style="width: 480px" placeholder="选择官方工具">
          <el-option v-for="item in toolOptions" :key="item.toolId" :label="item.name" :value="item.toolId" />
        </el-select>
      </el-form-item>
      <el-form-item label="MCP">
        <el-select v-model="form.mcpServerIds" multiple filterable style="width: 480px" placeholder="选择官方 MCP">
          <el-option v-for="item in mcpOptions" :key="item.mcpServerId" :label="item.name" :value="item.mcpServerId" />
        </el-select>
      </el-form-item>
      <el-form-item label="知识库">
        <el-select v-model="form.knowledgeIds" multiple filterable style="width: 480px" placeholder="选择知识库集合">
          <el-option v-for="item in knowledgeOptions" :key="item.collectionId" :label="item.name" :value="item.collectionId" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="2">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import type { IAgentAppInfo, IAgentMcpServerInfo, IAgentToolInfo } from "@/types/api/agent"
import type { IKnowledgeCollectionInfo } from "@/types/api/knowledge"
import { ElMessage } from "element-plus"
import {
  createAgentAppApi,
  getAgentAppListApi,
  getAgentMcpServerListApi,
  getAgentToolListApi,
  getAiAssistantApi,
  saveAiAssistantApi,
  updateAgentAppApi
} from "@/api/agent"
import { getKnowledgeCollectionListApi } from "@/api/knowledge"

function parseIdList(raw: string) {
  if (!raw || raw.trim().charAt(0) !== "[") {
    return [] as string[]
  }
  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed)) {
    return []
  }
  return parsed.filter((item): item is string => typeof item === "string")
}

export default defineComponent({
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const scene = ref("assistant")
    const toolOptions = ref<IAgentToolInfo[]>([])
    const mcpOptions = ref<IAgentMcpServerInfo[]>([])
    const knowledgeOptions = ref<IKnowledgeCollectionInfo[]>([])
    const currentApp = ref<IAgentAppInfo | null>(null)
    const sceneNames: Record<string, string> = {
      assistant: "AI 助手",
      chat: "聊天",
      moment: "朋友圈",
      workbench: "工作台"
    }
    const form = reactive({
      systemPrompt: "",
      openingMessage: "",
      modelParams: "",
      toolIds: [] as string[],
      mcpServerIds: [] as string[],
      knowledgeIds: [] as string[],
      status: 1
    })

    const loadOptions = async () => {
      const toolRes = await getAgentToolListApi({ status: 0, source: "official" })
      if (toolRes.code === 0) {
        toolOptions.value = toolRes.result.list || []
      }
      const mcpRes = await getAgentMcpServerListApi({ status: 0, source: "official" })
      if (mcpRes.code === 0) {
        mcpOptions.value = mcpRes.result.list || []
      }
      const knowledgeRes = await getKnowledgeCollectionListApi({ status: 1, page: 1, pageSize: 200 })
      if (knowledgeRes.code === 0) {
        knowledgeOptions.value = knowledgeRes.result.list || []
      }
    }

    // 知识库绑定落在 AgentApp（运行时 definition_loader 只读 AgentApp.knowledge_ids）。
    const loadSceneAgentApp = async () => {
      currentApp.value = null
      form.knowledgeIds = []
      const res = await getAgentAppListApi({ scene: scene.value, page: 1, pageSize: 20 })
      if (res.code !== 0) {
        return
      }
      const app = (res.result.list || []).find((item) => item.scene === scene.value)
      if (!app) {
        return
      }
      currentApp.value = app
      form.knowledgeIds = parseIdList(app.knowledgeIds)
    }

    const loadAssistant = async () => {
      loading.value = true
      const res = await getAiAssistantApi({ scene: scene.value })
      loading.value = false
      if (res.code !== 0 || !res.result.assistant) {
        ElMessage.error(res.msg || "加载失败")
        return
      }
      const assistant = res.result.assistant
      form.systemPrompt = assistant.systemPrompt
      form.openingMessage = assistant.openingMessage
      form.modelParams = assistant.modelParams
      form.toolIds = parseIdList(assistant.tools)
      form.mcpServerIds = parseIdList(assistant.mcpServerIds)
      form.status = assistant.status || 1
      await loadSceneAgentApp()
    }

    // 仅同步 knowledgeIds，其余字段沿用已存在的 AgentApp（空 persona/tools 会回落到场景内置人设与全量内置工具）。
    const syncAgentAppKnowledge = async () => {
      const knowledgeIds = JSON.stringify(form.knowledgeIds)
      const app = currentApp.value
      if (app) {
        return await updateAgentAppApi({
          appId: app.appId,
          name: app.name,
          scene: app.scene,
          systemPrompt: app.systemPrompt,
          llmModelId: app.llmModelId,
          modelParams: app.modelParams,
          tools: app.tools,
          mcpServerIds: app.mcpServerIds,
          knowledgeIds,
          openingMessage: app.openingMessage,
          openingQuestions: app.openingQuestions,
          variables: app.variables,
          status: app.status,
          sort: app.sort
        })
      }
      return await createAgentAppApi({
        name: sceneNames[scene.value] || scene.value,
        scene: scene.value,
        knowledgeIds,
        status: 1
      })
    }

    const submitForm = async () => {
      saving.value = true
      const res = await saveAiAssistantApi({
        scene: scene.value,
        name: sceneNames[scene.value] || scene.value,
        systemPrompt: form.systemPrompt,
        openingMessage: form.openingMessage,
        modelParams: form.modelParams,
        tools: JSON.stringify(form.toolIds),
        mcpServerIds: JSON.stringify(form.mcpServerIds),
        status: form.status
      })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      const syncRes = await syncAgentAppKnowledge()
      if (syncRes.code === 0) {
        ElMessage.success("已保存")
        await loadSceneAgentApp()
      } else {
        ElMessage.error(syncRes.msg || "知识库绑定保存失败")
      }
    }

    onMounted(() => {
      loadOptions()
      loadAssistant()
    })

    return { loading, saving, scene, toolOptions, mcpOptions, knowledgeOptions, form, loadAssistant, submitForm }
  }
})
</script>

<style lang="less">
.agent-assistant {
  padding: 20px;

  .agent-assistant-title {
    margin-top: 0;
    margin-bottom: 4px;
    margin-left: 0;
    margin-right: 0;
  }

  .agent-assistant-hint {
    margin-top: 0;
    margin-bottom: 16px;
    margin-left: 0;
    margin-right: 0;
    color: #909399;
  }

  .agent-assistant-scenes {
    margin-bottom: 16px;
  }
}
</style>
