<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  场景智能体列表页：卡片网格，点击卡片进入详情二级页面
-->

<template>
  <div class="agent-apps" v-loading="loading">
    <div class="agent-apps__header">
      <div class="agent-apps__header-left">
        <h2 class="agent-apps__title">场景智能体</h2>
        <p class="agent-apps__hint">每个场景对应一个智能体，点击卡片进入配置页面。</p>
      </div>
      <div class="agent-apps__header-actions">
        <el-button @click="loadAll">刷新</el-button>
      </div>
    </div>

    <div v-if="cards.length" class="agent-grid">
      <div v-for="card in cards" :key="card.scene" class="agent-card" @click="openDetail(card)">
        <div class="agent-card__top">
          <div class="agent-card__title-row">
            <span class="agent-card__name">{{ card.name }}</span>
            <el-tag size="small" effect="light" :type="card.status === 1 ? 'success' : 'info'">
              {{ card.status === 1 ? "启用" : "停用" }}
            </el-tag>
          </div>
          <div class="agent-card__meta">
            <span>{{ sceneLabel(card.scene) }}</span>
            <span v-if="card.modelName">· {{ card.modelName }}</span>
            <el-tag v-if="card.generationStyle" size="small" type="warning" effect="plain">
              {{ card.generationStyle }}
            </el-tag>
          </div>
        </div>
        <p class="agent-card__desc">
          {{ card.systemPrompt || "暂无系统提示词" }}
        </p>
        <div class="agent-card__stats">
          <span>知识 {{ card.knowledgeCount }}</span>
          <span>工具 {{ card.toolCount }}</span>
          <span>MCP {{ card.mcpCount }}</span>
          <span>变量 {{ card.varCount }}</span>
        </div>
        <div class="agent-card__foot">
          <span class="agent-card__time">{{ card.openingMessage ? "已配开场白" : "未配开场白" }}</span>
          <span class="agent-card__id">{{ card.scene }}</span>
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无场景智能体" :image-size="80" />
  </div>
</template>

<script lang="ts">
import type { IAgentAppInfo, IAgentModelInfo } from "@/types/api/agent"
import { useRouter } from "vue-router"
import { getAgentAppListApi, getAgentModelListApi, getAiAssistantApi } from "@/api/agent"
import { parseIdList, parseModelParams, parseVars, styleFromParams } from "./detail/tabs/shared"

interface ISceneCard {
  scene: string
  name: string
  systemPrompt: string
  openingMessage: string
  status: number
  modelName: string
  generationStyle: string
  knowledgeCount: number
  toolCount: number
  mcpCount: number
  varCount: number
}

const SCENES = ["assistant", "chat", "moment", "workbench"]
const SCENE_LABELS: Record<string, string> = {
  assistant: "AI 助手",
  chat: "聊天",
  moment: "朋友圈",
  workbench: "工作台"
}
const STYLE_LABELS: Record<string, string> = { stable: "更稳定", balanced: "默认", creative: "更发散" }

function sceneLabel(scene: string) {
  return SCENE_LABELS[scene] || scene
}

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const modelOptions = ref<IAgentModelInfo[]>([])
    const cards = ref<ISceneCard[]>([])

    const modelNameOf = (modelId: string) => {
      if (!modelId) return ""
      return modelOptions.value.find((m) => m.modelId === modelId)?.name || modelId
    }

    const loadAll = async () => {
      loading.value = true
      try {
        const [modelRes, assistantRes, appRes] = await Promise.all([
          getAgentModelListApi({ status: 1, page: 1, pageSize: 200 }),
          Promise.all(SCENES.map((s) => getAiAssistantApi({ scene: s }))),
          getAgentAppListApi({ page: 1, pageSize: 100 })
        ])
        if (modelRes.code === 0) modelOptions.value = modelRes.result.list || []

        const appMap = new Map<string, IAgentAppInfo>()
        if (appRes.code === 0) {
          for (const app of appRes.result.list || []) appMap.set(app.scene, app)
        }

        cards.value = SCENES.map((scene) => {
          const assistant = assistantRes.find((r) => r.code === 0 && r.result.assistant?.scene === scene)?.result.assistant
          const app = appMap.get(scene)
          const style = styleFromParams(parseModelParams(assistant?.modelParams || app?.modelParams || ""))
          return {
            scene,
            name: assistant?.name || SCENE_LABELS[scene],
            systemPrompt: assistant?.systemPrompt || app?.systemPrompt || "",
            openingMessage: assistant?.openingMessage || app?.openingMessage || "",
            status: assistant?.status || app?.status || 1,
            modelName: modelNameOf(assistant?.llmModelId || app?.llmModelId || ""),
            generationStyle: STYLE_LABELS[style] || "",
            knowledgeCount: parseIdList(app?.knowledgeIds || "").length,
            toolCount: parseIdList(assistant?.tools || app?.tools || "").length,
            mcpCount: parseIdList(assistant?.mcpServerIds || app?.mcpServerIds || "").length,
            varCount: parseVars(app?.variables || "").length
          }
        })
      } finally {
        loading.value = false
      }
    }

    const openDetail = (card: ISceneCard) => {
      router.push({ path: "/agent/apps/detail", query: { scene: card.scene } })
    }

    onMounted(loadAll)

    return { loading, cards, sceneLabel, loadAll, openDetail }
  }
})
</script>

<style lang="less" scoped>
.agent-apps {
  padding: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 4px;
  }

  &__hint {
    margin: 0;
    color: #909399;
  }
}

/* 卡片网格：约束对齐 veriweb agent-card */
.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.agent-card {
  padding: 14px 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background: #fff;

  &:hover {
    border-color: #c6d5ff;
    box-shadow: 0 4px 14px rgb(22 100 255 / 10%);
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__name {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    margin-top: 6px;
    font-size: 12px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  &__desc {
    margin: 10px 0 0;
    font-size: 13px;
    line-height: 1.55;
    color: #606266;
    min-height: 40px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__stats {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid #f0f2f5;
    font-size: 12px;
    color: #606266;
  }

  &__foot {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #c0c4cc;
  }

  &__id {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
