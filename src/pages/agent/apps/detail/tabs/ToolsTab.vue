<!--
  工具 Tab：工具箱卡片网格 + 工具广场弹窗 + MCP 卡片网格
-->

<template>
  <div class="agent-tools skills-tab">
    <nav class="agent-tools__nav" role="tablist">
      <button
        type="button"
        role="tab"
        class="agent-tools__nav-btn"
        :class="{ 'agent-tools__nav-btn--active': viewMode === 'toolbox' }"
        @click="viewMode = 'toolbox'"
      >
        工具箱
      </button>
      <button
        type="button"
        role="tab"
        class="agent-tools__nav-btn"
        :class="{ 'agent-tools__nav-btn--active': viewMode === 'mcp' }"
        @click="viewMode = 'mcp'"
      >
        MCP
      </button>
    </nav>

    <!-- 工具箱 -->
    <section v-if="viewMode === 'toolbox'" v-loading="catalogLoading || detailLoading" class="agent-tools__panel">
      <div class="tool-grid">
        <button type="button" class="tool-card tool-card--entry" @click="openPlaza">
          <div class="tool-card__body tool-card__body--entry">
            <el-icon class="tool-card__plus-icon"><Plus /></el-icon>
            <span class="tool-card__entry-label">工具广场</span>
            <span class="tool-card__entry-hint">浏览并添加工具</span>
          </div>
        </button>

        <button
          v-for="tool in enabledTools"
          :key="tool.toolId"
          type="button"
          class="tool-card"
          @click="openToolDetail(tool)"
        >
          <div class="tool-card__body">
            <div class="tool-card__row">
              <span class="tool-card__icon" :style="{ background: iconTint(tool.name) }">
                {{ iconLetter(tool.name) }}
              </span>
              <div class="tool-card__text">
                <span class="tool-card__title">{{ tool.name }}</span>
                <span class="tool-card__subtitle">{{ toolTypeLabel(tool.toolType) }}</span>
              </div>
            </div>
            <p class="tool-card__desc">
              {{ toolConfigPreview(tool.config) }}
            </p>
          </div>
        </button>
      </div>
    </section>

    <!-- MCP -->
    <section v-else v-loading="mcpLoading || detailLoading" class="agent-tools__panel">
      <div class="tool-grid">
        <button
          v-for="mcp in mcpList"
          :key="mcp.mcpServerId"
          type="button"
          class="tool-card"
          :class="{ 'tool-card--live': isBound(mcp.mcpServerId) }"
          @click="toggleMcp(mcp)"
        >
          <div class="tool-card__body">
            <div class="tool-card__row">
              <span class="tool-card__icon tool-card__icon--mcp">
                <el-icon><Connection /></el-icon>
              </span>
              <div class="tool-card__text">
                <span class="tool-card__title">{{ mcp.name }}</span>
                <span class="tool-card__subtitle">{{ mcp.transport }} · {{ mcp.serverName }}</span>
              </div>
              <span class="tool-card__status-dot" :class="isBound(mcp.mcpServerId) ? 'is-on' : 'is-off'" />
            </div>
          </div>
        </button>

        <el-empty v-if="!mcpList.length && !mcpLoading" description="暂无 MCP 服务，请到 MCP 服务页添加" :image-size="60" />
      </div>
    </section>

    <!-- 工具广场弹窗 -->
    <el-dialog v-model="plazaVisible" width="760px" destroy-on-close class="tool-dialog" :show-close="true">
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">工具广场</h2>
        </div>
      </template>
      <div class="tool-plaza-toolbar">
        <el-input v-model="plazaSearch" placeholder="搜索名称、类型…" clearable size="large" :prefix-icon="Search" />
      </div>
      <div v-loading="catalogLoading" class="tool-plaza-grid">
        <article v-for="item in plazaFiltered" :key="item.toolId" class="tool-plaza-card">
          <div class="tool-plaza-card__head">
            <span class="tool-plaza-card__icon" :style="{ background: iconTint(item.name) }">
              {{ iconLetter(item.name) }}
            </span>
            <div class="tool-card__text">
              <h4 class="tool-plaza-card__name">{{ item.name }}</h4>
              <p class="tool-plaza-card__code">{{ toolTypeLabel(item.toolType) }}</p>
            </div>
          </div>
          <p class="tool-plaza-card__desc">{{ toolConfigPreview(item.config) }}</p>
          <div class="tool-plaza-card__actions">
            <el-button
              round
              size="small"
              :type="isEnabled(item.toolId) ? 'info' : 'primary'"
              :disabled="isEnabled(item.toolId)"
              :loading="persisting"
              @click="addFromPlaza(item)"
            >
              {{ isEnabled(item.toolId) ? "已在工具箱" : "添加" }}
            </el-button>
          </div>
        </article>
        <p v-if="!plazaFiltered.length && !catalogLoading" class="tool-plaza-grid__empty">
          {{ plazaSearch.trim() ? "无匹配工具" : "暂无工具" }}
        </p>
      </div>
    </el-dialog>

    <!-- 工具详情弹窗 -->
    <el-dialog v-model="detailVisible" width="480px" destroy-on-close class="tool-dialog">
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">工具详情</h2>
        </div>
      </template>
      <template v-if="detailItem">
        <div class="tool-detail-hero">
          <span class="tool-detail-hero__icon" :style="{ background: iconTint(detailItem.name) }">
            {{ iconLetter(detailItem.name) }}
          </span>
          <div>
            <h3 class="tool-detail-hero__name">{{ detailItem.name }}</h3>
            <p class="tool-detail-hero__code">{{ toolTypeLabel(detailItem.toolType) }}</p>
          </div>
        </div>
        <div class="tool-info-grid">
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">配置</span>
            <p class="tool-info-grid__value tool-info-grid__mono">{{ detailItem.config || "无" }}</p>
          </div>
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">工具 ID</span>
            <p class="tool-info-grid__value tool-info-grid__mono">{{ detailItem.toolId }}</p>
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
import type { IAgentMcpServerInfo, IAgentToolInfo } from "@/types/api/agent"
import { Connection, Plus, Search } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { getAgentMcpServerListApi, getAgentToolListApi, getAiAssistantApi, saveAiAssistantApi } from "@/api/agent"
import { iconLetter, iconTint } from "./cardVisual"
import { parseIdList } from "./shared"

const TOOL_TYPE_LABELS: Record<string, string> = {
  builtin: "内置",
  mcp: "MCP",
  api: "HTTP",
  workflow: "工作流"
}

function toolTypeLabel(t: string) {
  return TOOL_TYPE_LABELS[t] || t
}

function toolConfigPreview(config: string) {
  if (!config) return "无配置"
  try {
    const o = JSON.parse(config)
    if (typeof o === "object" && o) {
      const entries = Object.entries(o).slice(0, 3)
      return entries.map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`).join("  ") || "无配置"
    }
  } catch {
    /* ignore */
  }
  return config.slice(0, 80)
}

export default defineComponent({
  name: "ToolsTab",
  props: {
    scene: { type: String, required: true }
  },
  setup(props) {
    const viewMode = ref<"toolbox" | "mcp">("toolbox")
    const catalog = ref<IAgentToolInfo[]>([])
    const catalogLoading = ref(false)
    const detailLoading = ref(false)
    const persisting = ref(false)
    const mcpList = ref<IAgentMcpServerInfo[]>([])
    const mcpLoading = ref(false)

    const enabledIds = ref<string[]>([])
    const enabledMcpIds = ref<string[]>([])

    const plazaVisible = ref(false)
    const plazaSearch = ref("")
    const detailVisible = ref(false)
    const detailItem = ref<IAgentToolInfo | null>(null)

    const catalogMap = computed(() => {
      const m = new Map<string, IAgentToolInfo>()
      for (const item of catalog.value) m.set(item.toolId, item)
      return m
    })

    const enabledTools = computed(() =>
      enabledIds.value.map((id) => catalogMap.value.get(id)).filter((t): t is IAgentToolInfo => !!t)
    )

    const enabledSet = computed(() => new Set(enabledIds.value))
    const enabledMcpSet = computed(() => new Set(enabledMcpIds.value))

    const plazaFiltered = computed(() => {
      const q = plazaSearch.value.trim().toLowerCase()
      if (!q) return catalog.value
      return catalog.value.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.toolType.toLowerCase().includes(q) ||
          item.toolId.toLowerCase().includes(q)
      )
    })

    function isEnabled(toolId: string) {
      return enabledSet.value.has(toolId)
    }

    function isBound(mcpServerId: string) {
      return enabledMcpSet.value.has(mcpServerId)
    }

    async function loadCatalog() {
      catalogLoading.value = true
      const res = await getAgentToolListApi({ status: 0, source: "official" })
      catalogLoading.value = false
      if (res.code === 0) catalog.value = res.result.list || []
    }

    async function loadMcp() {
      mcpLoading.value = true
      const res = await getAgentMcpServerListApi({ status: 0, source: "official" })
      mcpLoading.value = false
      if (res.code === 0) mcpList.value = res.result.list || []
    }

    async function loadDetail() {
      detailLoading.value = true
      const res = await getAiAssistantApi({ scene: props.scene })
      detailLoading.value = false
      const assistant = res.code === 0 ? res.result.assistant : null
      enabledIds.value = parseIdList(assistant?.tools || "")
      enabledMcpIds.value = parseIdList(assistant?.mcpServerIds || "")
    }

    async function persist() {
      persisting.value = true
      const res = await saveAiAssistantApi({
        scene: props.scene,
        tools: JSON.stringify(enabledIds.value),
        mcpServerIds: JSON.stringify(enabledMcpIds.value)
      })
      persisting.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return false
      }
      return true
    }

    function openPlaza() {
      plazaSearch.value = ""
      plazaVisible.value = true
    }

    async function addFromPlaza(item: IAgentToolInfo) {
      if (isEnabled(item.toolId)) return
      enabledIds.value.push(item.toolId)
      const ok = await persist()
      if (ok) ElMessage.success("已添加")
    }

    function openToolDetail(tool: IAgentToolInfo) {
      detailItem.value = tool
      detailVisible.value = true
    }

    async function removeFromDetail() {
      if (!detailItem.value) return
      const idx = enabledIds.value.indexOf(detailItem.value.toolId)
      if (idx >= 0) enabledIds.value.splice(idx, 1)
      const ok = await persist()
      if (ok) {
        detailVisible.value = false
        ElMessage.success("已移除")
      }
    }

    async function toggleMcp(mcp: IAgentMcpServerInfo) {
      const wasBound = isBound(mcp.mcpServerId)
      if (wasBound) {
        enabledMcpIds.value = enabledMcpIds.value.filter((id) => id !== mcp.mcpServerId)
      } else {
        enabledMcpIds.value.push(mcp.mcpServerId)
      }
      const ok = await persist()
      if (ok) ElMessage.success(wasBound ? "已取消启用" : "已启用")
    }

    onMounted(async () => {
      await Promise.all([loadCatalog(), loadMcp(), loadDetail()])
    })

    return {
      Plus,
      Search,
      Connection,
      viewMode,
      catalogLoading,
      detailLoading,
      persisting,
      mcpLoading,
      catalog,
      mcpList,
      enabledTools,
      plazaVisible,
      plazaSearch,
      detailVisible,
      detailItem,
      plazaFiltered,
      iconLetter,
      iconTint,
      toolTypeLabel,
      toolConfigPreview,
      isEnabled,
      isBound,
      openPlaza,
      addFromPlaza,
      openToolDetail,
      removeFromDetail,
      toggleMcp
    }
  }
})
</script>

<style lang="less" scoped>
@import "./toolUi.less";
</style>
