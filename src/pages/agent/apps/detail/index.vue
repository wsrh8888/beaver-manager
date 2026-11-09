<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  智能体详情二级页面：编排 / 工具 / 知识 / 设置 四个 Tab
-->

<template>
  <div class="app-detail">
    <div class="app-detail__header">
      <el-button link type="primary" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
      <div class="app-detail__title-block">
        <span class="app-detail__title">{{ sceneLabel }}</span>
        <span class="app-detail__subtitle">场景：{{ scene }}</span>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="app-detail__tabs">
      <el-tab-pane label="编排" name="persona" lazy>
        <PersonaTab :scene="scene" />
      </el-tab-pane>
      <el-tab-pane label="工具" name="tools" lazy>
        <ToolsTab :scene="scene" />
      </el-tab-pane>
      <el-tab-pane label="知识" name="knowledge" lazy>
        <KnowledgeTab :scene="scene" />
      </el-tab-pane>
      <el-tab-pane label="设置" name="settings" lazy>
        <SettingsTab :scene="scene" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { ArrowLeft } from "@element-plus/icons-vue"
import { useRoute, useRouter } from "vue-router"
import KnowledgeTab from "./tabs/KnowledgeTab.vue"
import PersonaTab from "./tabs/PersonaTab.vue"
import SettingsTab from "./tabs/SettingsTab.vue"
import ToolsTab from "./tabs/ToolsTab.vue"

const SCENE_LABELS: Record<string, string> = {
  assistant: "AI 助手",
  chat: "聊天",
  moment: "朋友圈",
  workbench: "工作台"
}

export default defineComponent({
  name: "AgentAppDetail",
  components: { ArrowLeft, PersonaTab, ToolsTab, KnowledgeTab, SettingsTab },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const scene = computed(() => String(route.query.scene || "assistant"))
    const activeTab = ref("persona")
    const sceneLabel = computed(() => SCENE_LABELS[scene.value] || scene.value)

    const goBack = () => router.push("/agent/apps")

    return { scene, activeTab, sceneLabel, goBack }
  }
})
</script>

<style lang="less" scoped>
.app-detail {
  padding: 16px;

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 8px;
  }

  &__title-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
  }

  &__subtitle {
    font-size: 12px;
    color: #909399;
  }

  &__tabs {
    margin-top: 8px;
  }
}
</style>
