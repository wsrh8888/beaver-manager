<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  场景智能体详情：编排 / 知识源 / 工具 / 设置 四个分区。
  场景是平台固定枚举，这里只配置、不创建，也没有开发者选项（那是开放平台数字伙伴的事）。
  分区与 URL ?tab= 双向同步，刷新、分享、后退都停在同一分区。
-->

<template>
  <div class="app-detail">
    <header class="app-detail__head">
      <button class="app-detail__back" type="button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>返回列表
      </button>

      <div class="app-detail__title-row">
        <h1 class="app-detail__title">{{ title }}</h1>
        <span class="app-detail__scene">{{ scene }}</span>
      </div>
    </header>

    <TabNav :tabs="TABS" :active="active" @select="select" />

    <!-- :key 随场景变化，强制重建分区，避免切场景时残留上一个场景的表单状态 -->
    <div :key="scene">
      <OrchestrationTab v-if="active === 'orchestration'" :scene="scene" />
      <KnowledgeTab v-else-if="active === 'knowledge'" :scene="scene" />
      <ToolsTab v-else-if="active === 'tools'" :scene="scene" />
      <SettingsTab v-else-if="active === 'settings'" :scene="scene" @saved="loadSceneName" />
    </div>
  </div>
</template>

<script lang="ts">
import { ArrowLeft } from "@element-plus/icons-vue"
import { useRoute, useRouter } from "vue-router"
import { getAiAssistantApi } from "@/api/agent"
import TabNav from "../components/TabNav.vue"
import OrchestrationTab from "./tabs/OrchestrationTab.vue"
import KnowledgeTab from "./tabs/KnowledgeTab.vue"
import SettingsTab from "./tabs/SettingsTab.vue"
import ToolsTab from "./tabs/ToolsTab.vue"

const SCENE_LABELS: Record<string, string> = {
  assistant: "AI 助手",
  chat: "聊天",
  moment: "朋友圈",
  workbench: "工作台"
}

const TABS = [
  { key: "orchestration", label: "编排" },
  { key: "knowledge", label: "知识源" },
  { key: "tools", label: "工具" },
  { key: "settings", label: "设置" }
]

export default defineComponent({
  name: "AgentAppDetail",
  components: { ArrowLeft, TabNav, OrchestrationTab, ToolsTab, KnowledgeTab, SettingsTab },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const scene = computed(() => String(route.query.scene || "assistant"))
    const sceneLabel = computed(() => SCENE_LABELS[scene.value] || scene.value)
    /** 设置里可以改名称，标题优先用配置里的名字，没配过才回落到场景固定名 */
    const assistantName = ref("")
    const title = computed(() => assistantName.value || sceneLabel.value)

    const loadSceneName = async () => {
      const res = await getAiAssistantApi({ scene: scene.value })
      assistantName.value = res.code === 0 ? res.result.assistant?.name || "" : ""
    }

    const active = computed(() => {
      const queryTab = String(route.query.tab || "")
      return TABS.some(item => item.key === queryTab) ? queryTab : TABS[0].key
    })

    const select = (key: string) => {
      if (key === active.value) return
      router.replace({ query: { ...route.query, tab: key } })
    }

    const goBack = () => router.push("/agent/apps")

    onMounted(loadSceneName)
    watch(scene, loadSceneName)

    return { scene, sceneLabel, title, loadSceneName, active, select, goBack, TABS }
  }
})
</script>

<style lang="less" scoped>
.app-detail {
  &__head {
    margin-bottom: 12px;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--el-text-color-secondary);
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--el-text-color-primary);
  }

  &__scene {
    padding: 1px 8px;
    border-radius: 999px;
    background: var(--el-fill-color);
    font-family: ui-monospace, monospace;
    font-size: 11px;
    line-height: 18px;
    color: var(--el-text-color-secondary);
  }
}
</style>
