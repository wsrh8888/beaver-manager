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
  <div class="agent-digitals">
    <div class="agent-digitals-header">
      <h2 class="agent-digitals-title">官方数字伙伴</h2>
      <p class="agent-digitals-hint">数字伙伴是一个用户，别人搜索或添加后才能聊天。内置模式直接绑定提示词、官方工具和 MCP</p>
    </div>

    <el-form :inline="true" class="agent-digitals-form">
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" style="width: 120px">
          <el-option label="全部" :value="-1" />
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="openCreate">新建数字伙伴</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="digitalList" border stripe>
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="digitalId" label="用户 ID" min-width="160" show-overflow-tooltip />
      <el-table-column label="运行方式" width="100">
        <template #default="{ row }">{{ runtimeLabel(row.runtime) }}</template>
      </el-table-column>
      <el-table-column label="可见范围" width="120">
        <template #default="{ row }">{{ visibilityLabel(row.visibility) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
        <template #empty>
        <el-empty description="暂无官方数字伙伴" />
      </template>
    </el-table>

    <el-pagination
      class="agent-digitals-pagination"
      background
      layout="total, prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      @current-change="onPageChange"
    />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑数字伙伴' : '新建数字伙伴'" width="640px">
      <el-form label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="form.name" maxlength="32" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="简介">
          <el-input v-model="form.description" type="textarea" :rows="2" maxlength="128" />
        </el-form-item>
        <el-form-item label="运行方式">
          <el-select v-model="form.runtime" :disabled="isEdit" style="width: 100%">
            <el-option label="内置" value="builtin" />
            <el-option label="外接" value="external" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.runtime === 'builtin'" label="模型 ID">
          <el-input v-model="form.llmModelId" placeholder="官方模型目录中的 modelId" />
        </el-form-item>
        <el-form-item v-if="form.runtime === 'builtin'" label="系统提示词">
          <el-input v-model="form.systemPrompt" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item v-if="form.runtime === 'builtin'" label="工具">
          <el-select v-model="form.toolIds" multiple filterable style="width: 100%" placeholder="选择官方工具">
            <el-option v-for="item in toolOptions" :key="item.toolId" :label="item.name" :value="item.toolId" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.runtime === 'builtin'" label="MCP">
          <el-select v-model="form.mcpServerIds" multiple filterable style="width: 100%" placeholder="选择官方 MCP">
            <el-option v-for="item in mcpOptions" :key="item.mcpServerId" :label="item.name" :value="item.mcpServerId" />
          </el-select>
        </el-form-item>
        <el-form-item label="可见范围">
          <el-select v-model="form.visibility" style="width: 100%">
            <el-option label="仅管理员" value="private" />
            <el-option label="指定可见" value="partial" />
            <el-option label="全员可见" value="public" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IAgentMcpServerInfo, IAgentToolInfo } from "@/types/api/agent"
import type { IDigitalAdminInfo } from "@/types/api/digital"
import { ElMessage, ElMessageBox } from "element-plus"
import { getAgentMcpServerListApi, getAgentToolListApi } from "@/api/agent"
import { createSystemDigitalApi, getDigitalListApi, updateDigitalApi } from "@/api/digital"

const runtimeLabels: Record<string, string> = { builtin: "内置", external: "外接", workflow: "工作流" }
const visibilityLabels: Record<string, string> = { private: "仅管理员", partial: "指定可见", public: "全员可见" }

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

function emptyForm() {
  return {
    name: "",
    description: "",
    runtime: "builtin",
    visibility: "private",
    llmModelId: "",
    systemPrompt: "",
    toolIds: [] as string[],
    mcpServerIds: [] as string[],
    status: 1,
    digitalId: ""
  }
}

export default defineComponent({
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const digitalList = ref<IDigitalAdminInfo[]>([])
    const toolOptions = ref<IAgentToolInfo[]>([])
    const mcpOptions = ref<IAgentMcpServerInfo[]>([])
    const searchForm = reactive({ status: -1 })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const form = reactive(emptyForm())

    const runtimeLabel = (runtime: string) => runtimeLabels[runtime] || runtime
    const visibilityLabel = (visibility: string) => visibilityLabels[visibility] || visibility

    const fetchList = async () => {
      loading.value = true
      const res = await getDigitalListApi({
        source: "system",
        status: searchForm.status,
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      loading.value = false
      if (res.code === 0) {
        digitalList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const loadOptions = async () => {
      const toolRes = await getAgentToolListApi({ status: 0, source: "official" })
      if (toolRes.code === 0) {
        toolOptions.value = toolRes.result.list || []
      }
      const mcpRes = await getAgentMcpServerListApi({ status: 0, source: "official" })
      if (mcpRes.code === 0) {
        mcpOptions.value = mcpRes.result.list || []
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchList()
    }

    const openCreate = async () => {
      isEdit.value = false
      Object.assign(form, emptyForm())
      await loadOptions()
      dialogVisible.value = true
    }

    const openEdit = async (row: IDigitalAdminInfo) => {
      isEdit.value = true
      form.digitalId = row.digitalId
      form.name = row.name
      form.description = row.description
      form.runtime = row.runtime
      form.visibility = row.visibility || "private"
      form.llmModelId = row.llmModelId
      form.systemPrompt = row.systemPrompt
      form.toolIds = parseIdList(row.tools)
      form.mcpServerIds = parseIdList(row.mcpServerIds)
      form.status = row.status
      await loadOptions()
      dialogVisible.value = true
    }

    const builtinPayload = () => {
      if (form.runtime !== "builtin") {
        return { systemPrompt: "", llmModelId: "", tools: "", mcpServerIds: "" }
      }
      return {
        systemPrompt: form.systemPrompt,
        llmModelId: form.llmModelId,
        tools: JSON.stringify(form.toolIds),
        mcpServerIds: JSON.stringify(form.mcpServerIds)
      }
    }

    const submitForm = async () => {
      if (!form.name) {
        ElMessage.error("名称不能为空")
        return
      }
      saving.value = true
      const brain = builtinPayload()
      const res = isEdit.value
        ? await updateDigitalApi({
            digitalId: form.digitalId,
            name: form.name,
            visibility: form.visibility,
            status: form.status,
            ...brain
          })
        : await createSystemDigitalApi({
            name: form.name,
            description: form.description,
            runtime: form.runtime,
            visibility: form.visibility,
            ...brain
          })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      dialogVisible.value = false
      const created = !isEdit.value ? res.result : undefined
      ElMessage.success("已保存")
      fetchList()
      if (created && created.appSecret) {
        ElMessageBox.alert(
          `AppKey: ${created.appKey}  AppSecret: ${created.appSecret}`,
          "外接凭据仅显示一次"
        ).then(() => undefined, () => undefined)
      }
    }

    onMounted(fetchList)

    return {
      loading,
      saving,
      dialogVisible,
      isEdit,
      digitalList,
      toolOptions,
      mcpOptions,
      searchForm,
      pagination,
      form,
      runtimeLabel,
      visibilityLabel,
      handleSearch,
      onPageChange,
      openCreate,
      openEdit,
      submitForm
    }
  }
})
</script>

<style lang="less">
.agent-digitals {
  padding: 20px;

  .agent-digitals-title {
    margin-top: 0;
    margin-bottom: 4px;
    margin-left: 0;
    margin-right: 0;
  }

  .agent-digitals-hint {
    margin-top: 0;
    margin-bottom: 16px;
    margin-left: 0;
    margin-right: 0;
    color: #909399;
  }

  .agent-digitals-form {
    margin-bottom: 12px;
  }

  .agent-digitals-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
