<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  知识源分区（列表）：知识源 ≠ 知识库。
  知识源是 agent_knowledge_source 表里的后端一等实体，归当前场景所有，只持有 platform 索引集合的引用。
  - 点「创建知识源」进入独立子路由 /agent/apps/:scene/knowledge/create（先选数据源再落库，不在列表页弹输入框）；
  - 点卡片进入 /agent/apps/:scene/knowledge/:knowledgeSourceId。
  本组件只负责列表与入口。
-->

<template>
  <div>
    <div class="ks-head">
      <h3 class="ks-head__title">知识源</h3>
      <el-button type="primary" :icon="Plus" @click="goCreate">创建知识源</el-button>
    </div>

    <div v-loading="loading" class="agent-tools">
      <div class="tool-grid">
        <button type="button" class="tool-card tool-card--entry" @click="goCreate">
          <div class="tool-card__body tool-card__body--entry">
            <el-icon class="tool-card__plus-icon"><Plus /></el-icon>
            <span class="tool-card__entry-label">创建知识源</span>
            <span class="tool-card__entry-hint">组合多份在线文档或本地文件供智能体检索</span>
          </div>
        </button>

        <button
          v-for="source in sources"
          :key="source.knowledgeSourceId"
          type="button"
          class="tool-card"
          @click="openSource(source.knowledgeSourceId)"
        >
          <div class="tool-card__body">
            <div class="tool-card__row">
              <span class="tool-card__icon" :style="{ background: iconTint(source.name) }">
                {{ iconLetter(source.name) }}
              </span>
              <div class="tool-card__text">
                <span class="tool-card__title">{{ source.name }}</span>
                <span class="tool-card__subtitle">
                  {{ source.documentCount }} 篇文档 · 检索 TopK {{ source.retrievalTopK || 8 }}
                </span>
              </div>
            </div>
            <p class="tool-card__desc">{{ sourceSummary(source) }}</p>
          </div>
          <div class="tool-card__foot ks-foot">
            <span class="tool-card__tag">知识源</span>
            <span class="ks-foot__action">管理 →</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Plus } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { useRouter } from "vue-router"
import { listKnowledgeSourceApi } from "@/api/knowledgeSource"
import type { IKnowledgeSourceItem } from "@/types/api/knowledgeSource"
import { iconLetter, iconTint } from "./cardVisual"

export default defineComponent({
  name: "KnowledgeTab",
  props: {
    scene: { type: String, required: true }
  },
  setup(props) {
    const router = useRouter()
    const sources = ref<IKnowledgeSourceItem[]>([])
    const loading = ref(false)

    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    async function loadSources() {
      if (!props.scene) {
        sources.value = []
        return
      }
      loading.value = true
      try {
        const res = await listKnowledgeSourceApi({ scene: props.scene })
        if (res.code !== 0) throw new Error(res.msg || "加载知识源失败")
        sources.value = res.result?.list ?? []
      } catch (err) {
        ElMessage.error(errorMessage(err, "加载知识源失败"))
      } finally {
        loading.value = false
      }
    }

    function sourceSummary(source: IKnowledgeSourceItem): string {
      if (source.documentCount > 0) return `${source.documentCount} 篇文档已导入`
      return "还没有导入文档"
    }

    /** 创建：直接进独立子路由，先选数据源，再由子路由落库 */
    function goCreate() {
      if (!props.scene) return
      void router.push({ name: "AgentKnowledgeSourceCreate", params: { scene: props.scene } })
    }

    /** 点卡片进入独立子路由，详情数据由子路由页按 id 自行加载 */
    function openSource(knowledgeSourceId: string) {
      if (!props.scene) return
      void router.push({
        name: "AgentKnowledgeSourceDetail",
        params: { scene: props.scene, knowledgeSourceId }
      })
    }

    watch(
      () => props.scene,
      () => {
        void loadSources()
      }
    )

    onMounted(() => {
      void loadSources()
    })

    return {
      Plus,
      sources,
      loading,
      sourceSummary,
      iconLetter,
      iconTint,
      goCreate,
      openSource
    }
  }
})
</script>

<style scoped lang="less">
@import "./toolUi.less";

.ks-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  &__title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.ks-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__action {
    font-size: 12px;
    color: var(--el-color-primary);
  }
}
</style>
