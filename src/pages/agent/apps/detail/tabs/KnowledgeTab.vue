<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  知识源分区：给当前场景挂载可检索的知识库集合。
  场景智能体只存集合 ID（knowledgeIds），名称与类型实时取平台目录，不在这一层复制。
-->

<template>
  <div>
    <div class="ks-head">
      <h3 class="ks-head__title">知识源</h3>
      <el-button type="primary" :icon="Plus" @click="openPlaza">添加知识库</el-button>
    </div>

    <div v-loading="listLoading || detailLoading" class="agent-tools knowledge-tab">
      <section class="agent-tools__panel">
        <div class="tool-grid">
          <button type="button" class="tool-card tool-card--entry" @click="openPlaza">
            <div class="tool-card__body tool-card__body--entry">
              <el-icon class="tool-card__plus-icon"><Plus /></el-icon>
              <span class="tool-card__entry-label">添加知识库</span>
              <span class="tool-card__entry-hint">关联知识库供智能体检索</span>
            </div>
          </button>

          <button
            v-for="item in enabledCollections"
            :key="item.collectionId"
            type="button"
            class="tool-card"
            @click="openDetail(item)"
          >
            <div class="tool-card__body">
              <div class="tool-card__row">
                <span class="tool-card__icon" :style="{ background: iconTint(item.name) }">
                  {{ iconLetter(item.name) }}
                </span>
                <div class="tool-card__text">
                  <span class="tool-card__title">{{ item.name }}</span>
                  <span class="tool-card__subtitle">{{ kindLabel(item.kind) }}</span>
                </div>
              </div>
              <p class="tool-card__desc">
                {{ item.description || "暂无描述" }}
              </p>
            </div>
            <div class="tool-card__foot ks-foot">
              <span class="tool-card__tag">知识库</span>
              <span class="ks-foot__action">管理 →</span>
            </div>
          </button>
        </div>
      </section>
    </div>

    <!-- 添加知识库弹窗 -->
    <el-dialog v-model="plazaVisible" width="760px" destroy-on-close append-to-body class="tool-dialog" :show-close="true">
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">添加知识库</h2>
        </div>
      </template>
      <div class="tool-plaza-toolbar">
        <el-input v-model="plazaSearch" placeholder="搜索名称、类型…" clearable size="large" :prefix-icon="Search" />
      </div>
      <div v-loading="listLoading" class="tool-plaza-grid">
        <article v-for="item in plazaFiltered" :key="item.collectionId" class="tool-plaza-card">
          <div class="tool-plaza-card__head">
            <span class="tool-plaza-card__icon" :style="{ background: iconTint(item.name) }">
              {{ iconLetter(item.name) }}
            </span>
            <div class="tool-card__text">
              <h4 class="tool-plaza-card__name">{{ item.name }}</h4>
              <p class="tool-plaza-card__code">{{ kindLabel(item.kind) }}</p>
            </div>
          </div>
          <p class="tool-plaza-card__desc">{{ item.description || "暂无描述" }}</p>
          <div class="tool-plaza-card__actions">
            <el-button
              round
              size="small"
              :type="isEnabled(item.collectionId) ? 'info' : 'primary'"
              :disabled="isEnabled(item.collectionId)"
              :loading="persisting"
              @click="addFromPlaza(item)"
            >
              {{ isEnabled(item.collectionId) ? "已关联" : "添加" }}
            </el-button>
          </div>
        </article>
        <p v-if="!plazaFiltered.length && !listLoading" class="tool-plaza-grid__empty">
          {{ plazaSearch.trim() ? "无匹配知识库" : "暂无知识库" }}
        </p>
      </div>
    </el-dialog>

    <!-- 知识库详情弹窗 -->
    <el-dialog v-model="detailVisible" width="480px" destroy-on-close append-to-body class="tool-dialog">
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">知识库详情</h2>
        </div>
      </template>
      <template v-if="detailItem">
        <div class="tool-detail-hero">
          <span class="tool-detail-hero__icon" :style="{ background: iconTint(detailItem.name) }">
            {{ iconLetter(detailItem.name) }}
          </span>
          <div>
            <h3 class="tool-detail-hero__name">{{ detailItem.name }}</h3>
            <p class="tool-detail-hero__code">{{ kindLabel(detailItem.kind) }}</p>
          </div>
        </div>
        <div class="tool-info-grid">
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">描述</span>
            <p class="tool-info-grid__value">{{ detailItem.description || "暂无" }}</p>
          </div>
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">集合 ID</span>
            <p class="tool-info-grid__value tool-info-grid__mono">{{ detailItem.collectionId }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button round @click="detailVisible = false">关闭</el-button>
        <el-button round type="danger" plain :loading="persisting" @click="removeFromDetail">移除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IAgentAppInfo } from "@/types/api/agent"
import type { IKnowledgeCollectionInfo } from "@/types/api/knowledge"
import { Plus, Search } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { createAgentAppApi, getAgentAppListApi, updateAgentAppApi } from "@/api/agent"
import { getKnowledgeCollectionListApi } from "@/api/knowledge"
import { iconLetter, iconTint } from "./cardVisual"
import { parseIdList } from "./shared"

const KIND_LABELS: Record<string, string> = {
  docs: "文档",
  faq: "问答",
  manual: "手册",
  dataset: "数据集"
}

function kindLabel(k: string) {
  return KIND_LABELS[k] || k
}

/** agent_app 记录还不存在时，补建成功后用它占位，避免下次改动又打一次 create */
function emptyApp(scene: string): IAgentAppInfo {
  return {
    appId: "",
    name: scene,
    scene,
    systemPrompt: "",
    llmModelId: "",
    modelParams: "",
    tools: "",
    mcpServerIds: "",
    knowledgeIds: "",
    openingMessage: "",
    openingQuestions: "",
    variables: "",
    status: 1,
    sort: 0,
    createdBy: ""
  }
}

export default defineComponent({
  name: "KnowledgeTab",
  components: { Plus },
  props: {
    scene: { type: String, required: true }
  },
  setup(props) {
    const listLoading = ref(false)
    const detailLoading = ref(false)
    const persisting = ref(false)
    const collections = ref<IKnowledgeCollectionInfo[]>([])
    const enabledIds = ref<string[]>([])
    const currentApp = ref<IAgentAppInfo | null>(null)

    const plazaVisible = ref(false)
    const plazaSearch = ref("")
    const detailVisible = ref(false)
    const detailItem = ref<IKnowledgeCollectionInfo | null>(null)

    const collectionMap = computed(() => {
      const m = new Map<string, IKnowledgeCollectionInfo>()
      for (const item of collections.value) m.set(item.collectionId, item)
      return m
    })

    const enabledCollections = computed(() =>
      enabledIds.value.map((id) => collectionMap.value.get(id)).filter((c): c is IKnowledgeCollectionInfo => !!c)
    )

    const enabledSet = computed(() => new Set(enabledIds.value))

    const plazaFiltered = computed(() => {
      const q = plazaSearch.value.trim().toLowerCase()
      if (!q) return collections.value
      return collections.value.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.kind.toLowerCase().includes(q) ||
          (item.description || "").toLowerCase().includes(q)
      )
    })

    function isEnabled(collectionId: string) {
      return enabledSet.value.has(collectionId)
    }

    async function loadCollections() {
      listLoading.value = true
      const res = await getKnowledgeCollectionListApi({ status: 1, page: 1, pageSize: 200 })
      listLoading.value = false
      if (res.code === 0) collections.value = res.result.list || []
    }

    async function loadDetail() {
      detailLoading.value = true
      const res = await getAgentAppListApi({ scene: props.scene, page: 1, pageSize: 20 })
      detailLoading.value = false
      const app = res.code === 0 ? (res.result.list || []).find((a) => a.scene === props.scene) || null : null
      currentApp.value = app
      enabledIds.value = parseIdList(app?.knowledgeIds || "")
    }

    async function persist() {
      const knowledgeIds = JSON.stringify(enabledIds.value)
      const app = currentApp.value
      persisting.value = true
      const res = app
        ? await updateAgentAppApi({
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
        : await createAgentAppApi({
            name: props.scene,
            scene: props.scene,
            knowledgeIds,
            status: 1
          })
      persisting.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return false
      }
      // 新建后记住 appId，后续 update 才不会又去打 create
      if (!app && res.result?.appId) {
        currentApp.value = { ...emptyApp(props.scene), appId: res.result.appId, knowledgeIds }
      }
      return true
    }

    function openPlaza() {
      plazaSearch.value = ""
      plazaVisible.value = true
    }

    async function addFromPlaza(item: IKnowledgeCollectionInfo) {
      if (isEnabled(item.collectionId)) return
      enabledIds.value.push(item.collectionId)
      const ok = await persist()
      if (ok) ElMessage.success("已添加")
    }

    function openDetail(item: IKnowledgeCollectionInfo) {
      detailItem.value = item
      detailVisible.value = true
    }

    async function removeFromDetail() {
      if (!detailItem.value) return
      const idx = enabledIds.value.indexOf(detailItem.value.collectionId)
      if (idx >= 0) enabledIds.value.splice(idx, 1)
      const ok = await persist()
      if (ok) {
        detailVisible.value = false
        ElMessage.success("已移除")
      }
    }

    onMounted(async () => {
      await Promise.all([loadCollections(), loadDetail()])
    })

    return {
      Plus,
      Search,
      listLoading,
      detailLoading,
      persisting,
      collections,
      enabledCollections,
      plazaVisible,
      plazaSearch,
      detailVisible,
      detailItem,
      plazaFiltered,
      iconLetter,
      iconTint,
      kindLabel,
      isEnabled,
      openPlaza,
      addFromPlaza,
      openDetail,
      removeFromDetail
    }
  }
})
</script>

<style lang="less" scoped>
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
