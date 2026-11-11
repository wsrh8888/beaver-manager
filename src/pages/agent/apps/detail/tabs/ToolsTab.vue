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
        工具箱<span class="agent-tools__nav-count">{{ enabledIds.length }}</span>
      </button>
      <button
        type="button"
        role="tab"
        class="agent-tools__nav-btn"
        :class="{ 'agent-tools__nav-btn--active': viewMode === 'mcp' }"
        @click="viewMode = 'mcp'"
      >
        MCP<span class="agent-tools__nav-count">{{ enabledMcpIds.length }}</span>
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
                <span class="tool-card__subtitle">{{ tool.fileName || "SKILL.md" }}</span>
              </div>
            </div>
            <p class="tool-card__desc">
              {{ tool.description || "没有写描述" }}
            </p>
          </div>
        </button>

        <p v-if="!enabledTools.length && !catalogLoading" class="tool-grid__empty">
          还没有启用工具，点上方「工具广场」挑几个。
        </p>
      </div>
    </section>

    <!-- MCP -->
    <section v-else v-loading="mcpLoading || detailLoading" class="agent-tools__panel">
      <div class="tool-grid">
        <button type="button" class="tool-card tool-card--entry" @click="openMcpForm">
          <div class="tool-card__body tool-card__body--entry">
            <el-icon class="tool-card__plus-icon"><Plus /></el-icon>
            <span class="tool-card__entry-label">添加 MCP 服务</span>
            <span class="tool-card__entry-hint">填连接配置，建完再启用</span>
          </div>
        </button>

        <button
          v-for="mcp in mcpList"
          :key="mcp.mcpServerId"
          type="button"
          class="tool-card"
          :class="{ 'tool-card--live': isBound(mcp.mcpServerId) }"
          @click="openMcpDetail(mcp)"
        >
          <div class="tool-card__body">
            <div class="tool-card__row">
              <span class="tool-card__icon tool-card__icon--mcp">
                <el-icon><Connection /></el-icon>
              </span>
              <div class="tool-card__text">
                <span class="tool-card__title">{{ mcp.name }}</span>
                <span class="tool-card__subtitle">{{ mcp.transport }} · {{ mcp.serverName || "未设标识" }}</span>
              </div>
              <span class="tool-card__status-dot" :class="isBound(mcp.mcpServerId) ? 'is-on' : 'is-off'" />
            </div>
          </div>
        </button>

        <p v-if="!mcpList.length && !mcpLoading" class="tool-grid__empty">
          平台还没有 MCP 服务，点上方「添加 MCP 服务」新建一个。
        </p>
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
              <p class="tool-plaza-card__code">{{ item.fileName || "SKILL.md" }}</p>
            </div>
          </div>
          <p class="tool-plaza-card__desc">{{ item.description || "没有写描述" }}</p>
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
          {{ plazaSearch.trim() ? "无匹配技能" : "平台还没有技能，先到「技能」页上传一份 SKILL.md" }}
        </p>
      </div>
    </el-dialog>

    <!-- 工具详情弹窗 -->
    <el-dialog v-model="detailVisible" width="560px" destroy-on-close class="tool-dialog">
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
            <p class="tool-detail-hero__code">{{ detailItem.fileName || "SKILL.md" }}</p>
          </div>
        </div>
        <div class="tool-info-grid">
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">描述</span>
            <p class="tool-info-grid__value">{{ detailItem.description || "没有写描述" }}</p>
          </div>
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">工具 ID</span>
            <p class="tool-info-grid__value tool-info-grid__mono">{{ detailItem.toolId }}</p>
          </div>
        </div>
        <pre v-if="detailItem.skillMd" class="tool-detail-body">{{ detailItem.skillMd }}</pre>
      </template>
      <template #footer>
        <el-button round @click="detailVisible = false">关闭</el-button>
        <el-button round type="danger" plain :loading="persisting" @click="removeFromDetail">移除</el-button>
      </template>
    </el-dialog>

    <!-- MCP 详情 -->
    <el-dialog v-model="mcpDetailVisible" width="520px" destroy-on-close append-to-body class="tool-dialog">
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">MCP 详情</h2>
        </div>
      </template>
      <template v-if="detailMcp">
        <div class="tool-detail-hero">
          <span class="tool-detail-hero__icon tool-card__icon--mcp">
            <el-icon><Connection /></el-icon>
          </span>
          <div>
            <h3 class="tool-detail-hero__name">{{ detailMcp.name }}</h3>
            <p class="tool-detail-hero__code">{{ detailMcp.serverName || detailMcp.mcpServerId }}</p>
          </div>
        </div>
        <div class="tool-info-grid">
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">传输方式</span>
            <p class="tool-info-grid__value">{{ detailMcp.transport || "stdio" }}</p>
          </div>
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">连接配置</span>
            <p class="tool-info-grid__value tool-info-grid__mono">{{ detailMcp.config || "未配置" }}</p>
          </div>
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">本场景</span>
            <p class="tool-info-grid__value">{{ isBound(detailMcp.mcpServerId) ? "已启用" : "未启用" }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button round @click="mcpDetailVisible = false">关闭</el-button>
        <el-button
          round
          type="primary"
          plain
          :loading="persisting"
          @click="detailMcp && toggleMcp(detailMcp)"
        >
          {{ detailMcp && isBound(detailMcp.mcpServerId) ? "取消启用" : "启用于本场景" }}
        </el-button>
        <el-button round type="danger" plain :loading="persisting" @click="removeMcp">删除服务</el-button>
      </template>
    </el-dialog>

    <!-- 新建 MCP 服务 -->
    <el-dialog v-model="mcpFormVisible" width="560px" destroy-on-close append-to-body class="tool-dialog">
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">添加 MCP 服务</h2>
          <p class="tool-dialog-header__sub">平台级服务，建完在列表里启用于本场景</p>
        </div>
      </template>
      <el-form label-position="top" @submit.prevent>
        <el-form-item label="服务名称" required>
          <el-input v-model="mcpForm.name" maxlength="64" placeholder="例如：内部工单查询" />
        </el-form-item>
        <el-form-item label="服务标识">
          <el-input v-model="mcpForm.serverName" maxlength="64" placeholder="可选，MCP server name" />
        </el-form-item>
        <el-form-item label="传输方式">
          <el-select v-model="mcpForm.transport" class="mcp-form__select">
            <el-option label="websocket" value="websocket" />
            <el-option label="sse" value="sse" />
            <el-option label="stdio" value="stdio" />
          </el-select>
        </el-form-item>
        <el-form-item label="连接配置（JSON）">
          <el-input
            v-model="mcpForm.config"
            type="textarea"
            :rows="6"
            placeholder='{"url": "wss://example.com/mcp", "headers": {}}'
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="mcpFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="mcpSaving" @click="submitMcp">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IAgentMcpServerInfo, IAgentToolInfo } from "@/types/api/agent"
import { Connection, Plus, Search } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  createAgentMcpServerApi,
  deleteAgentMcpServerApi,
  getAgentMcpServerListApi,
  getAgentToolListApi,
  getAiAssistantApi,
  saveAiAssistantApi
} from "@/api/agent"
import { iconLetter, iconTint } from "./cardVisual"
import { parseIdList } from "./shared"

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

    // MCP 详情与新建
    const mcpDetailVisible = ref(false)
    const detailMcp = ref<IAgentMcpServerInfo | null>(null)
    const mcpFormVisible = ref(false)
    const mcpSaving = ref(false)
    const mcpForm = reactive({ name: "", serverName: "", transport: "websocket", config: "" })

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

    // 广场只上架启用中的技能；已停用的仍留在「工具箱」里，方便看清绑了什么
    const plazaFiltered = computed(() => {
      const live = catalog.value.filter((item) => item.status === 1)
      const q = plazaSearch.value.trim().toLowerCase()
      if (!q) return live
      return live.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description || "").toLowerCase().includes(q) ||
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

    function openMcpDetail(mcp: IAgentMcpServerInfo) {
      detailMcp.value = mcp
      mcpDetailVisible.value = true
    }

    async function removeMcp() {
      const mcp = detailMcp.value
      if (!mcp) return
      try {
        await ElMessageBox.confirm(
          `删除「${mcp.name}」后所有场景都无法再使用该服务，确认删除？`,
          "删除 MCP 服务",
          { type: "warning", confirmButtonText: "确认删除", cancelButtonText: "取消" }
        )
      } catch {
        return
      }
      persisting.value = true
      try {
        const res = await deleteAgentMcpServerApi({ mcpServerId: mcp.mcpServerId })
        if (res.code !== 0) throw new Error(res.msg || "删除失败")
        // 已绑定的话一并解绑，否则列表里会留下指向已删服务的死 ID
        if (isBound(mcp.mcpServerId)) {
          enabledMcpIds.value = enabledMcpIds.value.filter((id) => id !== mcp.mcpServerId)
          const ok = await persist()
          if (!ok) throw new Error("服务已删除，但解除绑定失败")
        }
        mcpList.value = mcpList.value.filter((item) => item.mcpServerId !== mcp.mcpServerId)
        mcpDetailVisible.value = false
        ElMessage.success("已删除")
      } catch (err) {
        ElMessage.error(err instanceof Error && err.message ? err.message : "删除失败")
      } finally {
        persisting.value = false
      }
    }

    function openMcpForm() {
      mcpForm.name = ""
      mcpForm.serverName = ""
      mcpForm.transport = "websocket"
      mcpForm.config = ""
      mcpFormVisible.value = true
    }

    async function submitMcp() {
      const name = mcpForm.name.trim()
      if (name.length < 2) {
        ElMessage.warning("服务名称至少 2 个字符")
        return
      }
      if (mcpForm.config.trim()) {
        try {
          JSON.parse(mcpForm.config)
        } catch {
          ElMessage.warning("连接配置必须是合法 JSON")
          return
        }
      }
      mcpSaving.value = true
      try {
        const res = await createAgentMcpServerApi({
          name,
          serverName: mcpForm.serverName.trim(),
          transport: mcpForm.transport,
          config: mcpForm.config.trim(),
          status: 1
        })
        if (res.code !== 0) throw new Error(res.msg || "创建失败")
        mcpFormVisible.value = false
        ElMessage.success("MCP 服务已创建，可在列表中启用")
        await loadMcp()
      } catch (err) {
        ElMessage.error(err instanceof Error && err.message ? err.message : "创建失败")
      } finally {
        mcpSaving.value = false
      }
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
      enabledIds,
      enabledMcpIds,
      plazaVisible,
      plazaSearch,
      detailVisible,
      detailItem,
      plazaFiltered,
      mcpDetailVisible,
      detailMcp,
      mcpFormVisible,
      mcpSaving,
      mcpForm,
      iconLetter,
      iconTint,
      isEnabled,
      isBound,
      openPlaza,
      addFromPlaza,
      openToolDetail,
      removeFromDetail,
      toggleMcp,
      openMcpDetail,
      removeMcp,
      openMcpForm,
      submitMcp
    }
  }
})
</script>

<style lang="less" scoped>
@import "./toolUi.less";

.agent-tools__nav-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  margin-left: 6px;
  padding: 0 5px;
  border-radius: 999px;
  font-size: 11px;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
}

.agent-tools__nav-btn--active .agent-tools__nav-count {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.tool-grid__empty {
  grid-column: 1 / -1;
  margin: 0;
  padding: 28px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.mcp-form__select {
  width: 200px;
}
</style>
