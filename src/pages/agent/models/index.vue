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
      <p class="agent-models-hint">
        两层货架：先建「接入通道」（厂商 + base URL + Key，密钥只进不出），再「上架模型」（API 模型名 + 能力，绑一条通道）
      </p>
    </div>

    <div class="agent-models-toolbar">
      <el-form :inline="true">
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
        </el-form-item>
      </el-form>
      <div class="agent-models-actions">
        <el-button @click="openCredentialDrawer">接入通道</el-button>
        <el-button type="primary" @click="openCreate">上架模型</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="modelList" border stripe>
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column label="来源" width="90">
        <template #default="{ row }">{{ row.source === "official" ? "官方" : "个人" }}</template>
      </el-table-column>
      <el-table-column prop="channelName" label="接入通道" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.channelName || "—" }}</template>
      </el-table-column>
      <el-table-column prop="provider" label="供应商" width="140" />
      <el-table-column prop="modelName" label="API 模型名" min-width="150" show-overflow-tooltip />
      <el-table-column label="能力" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.supportsTools" size="small" class="cap-tag">工具</el-tag>
          <el-tag v-if="row.supportsVision" size="small" class="cap-tag">视觉</el-tag>
        </template>
      </el-table-column>
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
        <el-empty description="暂无模型，先建接入通道再上架模型" />
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

    <!-- 上架 / 编辑 模型 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑模型' : '上架模型'" width="640px">
      <el-form label-width="110px">
        <el-form-item label="来源">
          <el-select v-model="form.source" :disabled="isEdit" style="width: 100%">
            <el-option label="官方" value="official" />
            <el-option label="个人" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="接入通道">
          <el-select v-model="form.credentialId" placeholder="选择一条接入通道" style="width: 100%" :loading="credLoading">
            <el-option
              v-for="c in credentials"
              :key="c.credentialId"
              :label="`${c.name}（${c.modelService}${c.keyConfigured ? '，已设密钥 ' + c.keyHint : '，未设密钥'}）`"
              :value="c.credentialId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" maxlength="64" />
        </el-form-item>
        <el-form-item label="API 模型名">
          <el-input v-model="form.modelName" placeholder="实际调用的模型名，如 gpt-4o" />
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

    <!-- 接入通道管理 -->
    <el-dialog v-model="credDialogVisible" title="接入通道" width="860px">
      <div class="cred-toolbar">
        <span class="cred-hint">厂商 base URL + Key；密钥只进不出，编辑留空=不改。</span>
        <el-button type="primary" size="small" @click="openCredCreate">新建通道</el-button>
      </div>
      <el-table v-loading="credLoading" :data="credentials" border stripe size="small">
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="modelService" label="厂商" width="120" />
        <el-table-column prop="channelType" label="渠道类型" width="140" />
        <el-table-column prop="baseUrl" label="Base URL" min-width="200" show-overflow-tooltip />
        <el-table-column label="密钥" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.keyConfigured" size="small" type="success">{{ row.keyHint || "已设" }}</el-tag>
            <el-tag v-else size="small" type="info">未设</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? "启用" : "停用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openCredEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleCredDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 通道新建 / 编辑子表单 -->
      <el-dialog v-model="credFormVisible" :title="credIsEdit ? '编辑通道' : '新建通道'" width="560px" append-to-body>
        <el-form label-width="100px">
          <el-form-item label="名称">
            <el-input v-model="credForm.name" maxlength="64" />
          </el-form-item>
          <el-form-item label="厂商">
            <el-select v-model="credForm.modelService" style="width: 100%">
              <el-option v-for="s in modelServiceOptions" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item>
          <el-form-item label="渠道类型">
            <el-select v-model="credForm.channelType" style="width: 100%">
              <el-option v-for="t in channelTypeOptions" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item>
          <el-form-item label="Base URL">
            <el-input v-model="credForm.baseUrl" placeholder="https://api.openai.com/v1" />
          </el-form-item>
          <el-form-item label="API Key">
            <el-input
              v-model="credForm.apiKey"
              type="password"
              show-password
              :placeholder="credIsEdit ? '留空则不修改' : ''"
            />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="credForm.sort" :min="0" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="credForm.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="2">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="credFormVisible = false">取消</el-button>
          <el-button type="primary" :loading="credSaving" @click="submitCredForm">保存</el-button>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IAgentCredentialInfo, IAgentModelInfo } from "@/types/api/agent"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  createAgentCredentialApi,
  createAgentModelApi,
  deleteAgentCredentialApi,
  deleteAgentModelApi,
  getAgentCredentialListApi,
  getAgentModelListApi,
  updateAgentCredentialApi,
  updateAgentModelApi
} from "@/api/agent"

const modelServiceOptions = ["openai", "azure", "anthropic", "deepseek", "openai_compatible"]
const channelTypeOptions = ["official", "openai_compatible", "azure"]

function emptyForm() {
  return {
    modelId: "",
    source: "official",
    credentialId: "",
    name: "",
    modelName: "",
    contextWindow: 0,
    maxOutputTokens: 0,
    supportsTools: false,
    supportsVision: false,
    sort: 0,
    status: 1
  }
}

function emptyCredForm() {
  return {
    credentialId: "",
    name: "",
    modelService: "openai",
    channelType: "official",
    baseUrl: "",
    apiKey: "",
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

    // 接入通道
    const credDialogVisible = ref(false)
    const credFormVisible = ref(false)
    const credIsEdit = ref(false)
    const credLoading = ref(false)
    const credSaving = ref(false)
    const credentials = ref<IAgentCredentialInfo[]>([])
    const credForm = reactive(emptyCredForm())

    const fetchCredentials = async () => {
      credLoading.value = true
      const res = await getAgentCredentialListApi({ status: 0 })
      credLoading.value = false
      if (res.code === 0) {
        credentials.value = res.result.list || []
      } else {
        ElMessage.error(res.msg || "加载通道失败")
      }
    }

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
      // 下拉需要通道数据
      if (!credentials.value.length) {
        fetchCredentials()
      }
    }

    const openEdit = (row: IAgentModelInfo) => {
      isEdit.value = true
      form.modelId = row.modelId
      form.source = row.source || "official"
      form.credentialId = row.credentialId
      form.name = row.name
      form.modelName = row.modelName
      form.contextWindow = row.contextWindow || 0
      form.maxOutputTokens = row.maxOutputTokens || 0
      form.supportsTools = row.supportsTools
      form.supportsVision = row.supportsVision
      form.sort = row.sort || 0
      form.status = row.status || 1
      dialogVisible.value = true
      if (!credentials.value.length) {
        fetchCredentials()
      }
    }

    const submitForm = async () => {
      if (!form.name) {
        ElMessage.error("名称不能为空")
        return
      }
      if (!form.credentialId) {
        ElMessage.error("请选择接入通道")
        return
      }
      saving.value = true
      const payload = {
        name: form.name,
        source: form.source,
        credentialId: form.credentialId,
        modelName: form.modelName,
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

    // —— 通道管理 ——
    const openCredentialDrawer = () => {
      credDialogVisible.value = true
      fetchCredentials()
    }

    const openCredCreate = () => {
      credIsEdit.value = false
      Object.assign(credForm, emptyCredForm())
      credFormVisible.value = true
    }

    const openCredEdit = (row: IAgentCredentialInfo) => {
      credIsEdit.value = true
      credForm.credentialId = row.credentialId
      credForm.name = row.name
      credForm.modelService = row.modelService
      credForm.channelType = row.channelType || "official"
      credForm.baseUrl = row.baseUrl
      credForm.apiKey = ""
      credForm.sort = row.sort || 0
      credForm.status = row.status || 1
      credFormVisible.value = true
    }

    const submitCredForm = async () => {
      if (!credForm.name || !credForm.baseUrl) {
        ElMessage.error("名称与 Base URL 必填")
        return
      }
      credSaving.value = true
      // 编辑时留空 apiKey 不下发（空=不改）
      const res = credIsEdit.value
        ? await updateAgentCredentialApi({
            credentialId: credForm.credentialId,
            name: credForm.name,
            modelService: credForm.modelService,
            channelType: credForm.channelType,
            baseUrl: credForm.baseUrl,
            apiKey: credForm.apiKey || undefined,
            sort: credForm.sort,
            status: credForm.status
          })
        : await createAgentCredentialApi({
            name: credForm.name,
            modelService: credForm.modelService,
            channelType: credForm.channelType,
            baseUrl: credForm.baseUrl,
            apiKey: credForm.apiKey || undefined,
            sort: credForm.sort,
            status: credForm.status
          })
      credSaving.value = false
      if (res.code === 0) {
        ElMessage.success("已保存")
        credFormVisible.value = false
        await fetchCredentials()
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    const handleCredDelete = async (row: IAgentCredentialInfo) => {
      const confirmed = await ElMessageBox.confirm(`删除接入通道「${row.name}」？绑定它的模型将失去通道。`, "删除", {
        type: "warning"
      }).then(() => true, () => false)
      if (!confirmed) {
        return
      }
      const res = await deleteAgentCredentialApi({ credentialId: row.credentialId })
      if (res.code === 0) {
        ElMessage.success("已删除")
        await fetchCredentials()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    onMounted(() => {
      fetchList()
      fetchCredentials()
    })

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
      handleDelete,
      // 通道
      credDialogVisible,
      credFormVisible,
      credIsEdit,
      credLoading,
      credSaving,
      credentials,
      credForm,
      modelServiceOptions,
      channelTypeOptions,
      openCredentialDrawer,
      openCredCreate,
      openCredEdit,
      submitCredForm,
      handleCredDelete
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

  .agent-models-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .agent-models-actions {
    margin-bottom: 12px;
  }

  .cap-tag {
    margin-right: 4px;
  }

  .agent-models-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .cred-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .cred-hint {
      color: #909399;
      font-size: 12px;
    }
  }
}
</style>
