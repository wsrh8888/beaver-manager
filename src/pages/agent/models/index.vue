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
  <div class="agent-models">
    <div class="agent-models-header">
      <h2 class="agent-models-title">模型</h2>
      <p class="agent-models-hint">官方模型和个人模型都在这里。场景智能体不绑定模型，agent 运行时自己按 auto 取</p>
    </div>

    <el-form :inline="true" class="agent-models-form">
      <el-form-item label="来源">
        <el-select v-model="searchForm.source" style="width: 140px">
          <el-option label="全部" value="" />
          <el-option label="官方" value="official" />
          <el-option label="个人" value="custom" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" style="width: 120px">
          <el-option label="全部" :value="0" />
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="openCreate">新建模型</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="modelList" border stripe>
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column label="来源" width="90">
        <template #default="{ row }">{{ row.source === "official" ? "官方" : "个人" }}</template>
      </el-table-column>
      <el-table-column prop="userId" label="用户 ID" min-width="140" show-overflow-tooltip />
      <el-table-column prop="provider" label="供应商" width="140" />
      <el-table-column prop="modelName" label="模型名" min-width="140" show-overflow-tooltip />
      <el-table-column prop="endpoint" label="接口地址" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? "启用" : "停用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无模型" />
      </template>
    </el-table>

    <el-pagination
      class="agent-models-pagination"
      background
      layout="total, prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      @current-change="onPageChange"
    />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑模型' : '新建模型'" width="640px">
      <el-form label-width="100px">
        <el-form-item label="来源">
          <el-select v-model="form.source" :disabled="isEdit" style="width: 100%">
            <el-option label="官方" value="official" />
            <el-option label="个人" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.source === 'custom'" label="用户 ID">
          <el-input v-model="form.userId" :disabled="isEdit" maxlength="64" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" maxlength="64" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="form.provider" placeholder="openai_compatible" />
        </el-form-item>
        <el-form-item label="模型名">
          <el-input v-model="form.modelName" placeholder="实际调用的模型名" />
        </el-form-item>
        <el-form-item label="接口地址">
          <el-input v-model="form.endpoint" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="form.apiKey" type="password" show-password :placeholder="isEdit ? '留空则不修改' : ''" />
        </el-form-item>
        <el-form-item label="上下文">
          <el-input-number v-model="form.contextWindow" :min="0" />
        </el-form-item>
        <el-form-item label="最大输出">
          <el-input-number v-model="form.maxOutputTokens" :min="0" />
        </el-form-item>
        <el-form-item label="能力">
          <el-checkbox v-model="form.supportsTools">工具调用</el-checkbox>
          <el-checkbox v-model="form.supportsVision">视觉</el-checkbox>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="2">停用</el-radio>
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
import type { IAgentModelInfo } from "@/types/api/agent"
import { ElMessage, ElMessageBox } from "element-plus"
import { createAgentModelApi, deleteAgentModelApi, getAgentModelListApi, updateAgentModelApi } from "@/api/agent"

function emptyForm() {
  return {
    modelId: "",
    source: "official",
    userId: "",
    name: "",
    provider: "openai_compatible",
    modelName: "",
    endpoint: "",
    apiKey: "",
    contextWindow: 0,
    maxOutputTokens: 0,
    supportsTools: false,
    supportsVision: false,
    sort: 0,
    status: 1
  }
}

export default defineComponent({
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const modelList = ref<IAgentModelInfo[]>([])
    const searchForm = reactive({ source: "", status: 0 })
    const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
    const form = reactive(emptyForm())

    const fetchList = async () => {
      loading.value = true
      const res = await getAgentModelListApi({
        source: searchForm.source || undefined,
        status: searchForm.status,
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      loading.value = false
      if (res.code === 0) {
        modelList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载失败")
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

    const openCreate = () => {
      isEdit.value = false
      Object.assign(form, emptyForm())
      dialogVisible.value = true
    }

    const openEdit = (row: IAgentModelInfo) => {
      isEdit.value = true
      form.modelId = row.modelId
      form.source = row.source || "official"
      form.userId = row.userId
      form.name = row.name
      form.provider = row.provider
      form.modelName = row.modelName
      form.endpoint = row.endpoint
      form.apiKey = ""
      form.contextWindow = row.contextWindow || 0
      form.maxOutputTokens = row.maxOutputTokens || 0
      form.supportsTools = row.supportsTools
      form.supportsVision = row.supportsVision
      form.sort = row.sort || 0
      form.status = row.status || 1
      dialogVisible.value = true
    }

    const submitForm = async () => {
      if (!form.name) {
        ElMessage.error("名称不能为空")
        return
      }
      if (form.source === "custom" && !form.userId) {
        ElMessage.error("个人模型需要用户 ID")
        return
      }
      saving.value = true
      const payload = {
        name: form.name,
        source: form.source,
        userId: form.source === "custom" ? form.userId : "",
        provider: form.provider,
        modelName: form.modelName,
        endpoint: form.endpoint,
        apiKey: form.apiKey,
        contextWindow: form.contextWindow,
        maxOutputTokens: form.maxOutputTokens,
        supportsTools: form.supportsTools,
        supportsVision: form.supportsVision,
        sort: form.sort,
        status: form.status
      }
      const res = isEdit.value
        ? await updateAgentModelApi({ ...payload, modelId: form.modelId })
        : await createAgentModelApi(payload)
      saving.value = false
      if (res.code === 0) {
        ElMessage.success("已保存")
        dialogVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    const handleDelete = async (row: IAgentModelInfo) => {
      const confirmed = await ElMessageBox.confirm(`删除模型「${row.name}」？`, "删除", { type: "warning" })
        .then(() => true, () => false)
      if (!confirmed) {
        return
      }
      const res = await deleteAgentModelApi({ modelId: row.modelId, source: row.source, userId: row.userId })
      if (res.code === 0) {
        ElMessage.success("已删除")
        fetchList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    onMounted(fetchList)

    return {
      loading,
      saving,
      dialogVisible,
      isEdit,
      modelList,
      searchForm,
      pagination,
      form,
      fetchList,
      handleSearch,
      onPageChange,
      openCreate,
      openEdit,
      submitForm,
      handleDelete
    }
  }
})
</script>

<style lang="less">
.agent-models {
  padding: 20px;

  .agent-models-title {
    margin-top: 0;
    margin-bottom: 4px;
    margin-left: 0;
    margin-right: 0;
  }

  .agent-models-hint {
    margin-top: 0;
    margin-bottom: 16px;
    margin-left: 0;
    margin-right: 0;
    color: #909399;
  }

  .agent-models-form {
    margin-bottom: 12px;
  }

  .agent-models-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
