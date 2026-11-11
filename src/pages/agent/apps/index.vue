<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  场景智能体列表页。
  场景是平台固定枚举（assistant / chat / moment / workbench），每个场景对应一个智能体配置，
  所以这里没有「创建」入口，也不做分页——点卡片进详情，在四个分区里配置。
-->

<template>
  <div class="agent-apps" v-loading="loading">
    <header class="agent-apps__header">
      <h2 class="agent-apps__title">场景智能体</h2>
      <p class="agent-apps__hint">每个场景固定对应一个智能体，点卡片进入配置。</p>
    </header>

    <div class="agent-grid">
      <article
        v-for="card in cards"
        :key="card.scene"
        class="agent-card"
        role="button"
        tabindex="0"
        @click="openDetail(card)"
        @keyup.enter="openDetail(card)"
      >
        <header class="agent-card__head">
          <span class="agent-card__avatar" :style="{ background: iconTint(card.name) }">
            {{ iconLetter(card.name) }}
          </span>
          <div class="agent-card__heading">
            <h3 class="agent-card__name" :title="card.name">{{ card.name }}</h3>
            <p class="agent-card__meta">
              {{ card.scene }}
              <template v-if="card.modelName"> · {{ card.modelName }}</template>
              <template v-if="card.generationStyle"> · {{ card.generationStyle }}</template>
            </p>
          </div>
          <span class="agent-card__badge" :class="card.status === 1 ? 'is-on' : 'is-off'">
            {{ card.status === 1 ? "启用中" : "已停用" }}
          </span>
        </header>

        <p class="agent-card__desc">{{ card.systemPrompt || "还没有配置系统提示词" }}</p>

        <footer class="agent-card__stats">
          <span class="agent-card__stat"><b>{{ card.toolCount }}</b> 工具</span>
          <span class="agent-card__stat"><b>{{ card.knowledgeCount }}</b> 知识库</span>
          <span class="agent-card__stat"><b>{{ card.mcpCount }}</b> MCP</span>
          <span class="agent-card__stat"><b>{{ card.varCount }}</b> 变量</span>
          <el-icon class="agent-card__go"><Right /></el-icon>
        </footer>
      </article>
    </div>
  </div>
</template>

<script lang="ts">
import type { IAgentAppInfo, IAgentModelInfo } from "@/types/api/agent"
import { Right } from "@element-plus/icons-vue"
import { useRouter } from "vue-router"
import { getAgentAppListApi, getAgentModelListApi, getAiAssistantApi } from "@/api/agent"
import { iconLetter, iconTint } from "./detail/tabs/cardVisual"
import { parseIdList, parseModelParams, parseVars, styleFromParams } from "./detail/tabs/shared"

interface ISceneCard {
  scene: string
  name: string
  systemPrompt: string
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

export default defineComponent({
  name: "AgentAppsListPage",
  components: { Right },
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

    /** 分区走 ?tab=，与详情页的 TabNav 同一套约定 */
    const openDetail = (card: ISceneCard) => {
      router.push({ path: "/agent/apps/detail", query: { scene: card.scene, tab: "orchestration" } })
    }

    onMounted(loadAll)

    return { loading, cards, iconLetter, iconTint, openDetail }
  }
})
</script>

<style lang="less" scoped>
.agent-apps {
  &__header {
    margin-bottom: 16px;
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__hint {
    margin: 6px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
  gap: 16px;
  align-content: start;
  min-height: 160px;
}

.agent-card {
  display: flex;
  flex-direction: column;
  padding: 16px 20px 0;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover,
  &:focus-visible {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 6px 18px rgb(15 23 42 / 8%);
    outline: none;

    .agent-card__go {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__avatar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    font-size: 16px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 65%);
  }

  &__heading {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__name {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 22px;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__badge {
    flex: 0 0 auto;
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 11px;
    line-height: 18px;

    &.is-on {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }

    &.is-off {
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color);
    }
  }

  &__desc {
    margin: 12px 0 16px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    min-height: 42px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__stats {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    border-top: 1px solid var(--el-border-color-extra-light);
    font-size: 12px;
    color: var(--el-text-color-secondary);

    b {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  &__stat {
    white-space: nowrap;
  }

  &__go {
    margin-left: auto;
    font-size: 14px;
    color: var(--el-color-primary);
    opacity: 0;
    transform: translateX(-4px);
    transition:
      opacity 0.2s,
      transform 0.2s;
  }
}

@media (max-width: 767px) {
  .agent-grid {
    grid-template-columns: 1fr;
  }
}
</style>
