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
  <div class="agent-tools">
    <div class="agent-tools-header">
      <h2 class="agent-tools-title">智能体工具</h2>
      <p class="agent-tools-hint">官方工具目录。场景智能体和官方数字伙伴从这里选择，用户自建工具不在这张表里</p>
    </div>

    <el-form :inline="true" class="agent-tools-form">
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" style="width: 120px">
          <el-option label="全部" :value="0" />
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="fetchList">搜索</el-button>
        <el-button type="primary" @click="openCreate">新建工具</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="toolList" border stripe>
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="toolId" label="工具 ID" min-width="160" show-overflow-tooltip />
      <el-table-column prop="toolType" label="类型" width="120" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? "启用" : "停用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row.toolId)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无工具" />
      </template>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑工具' : '新建工具'" width="640px">
      <el-form label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="form.name" maxlength="64" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.toolType" style="width: 100%">
            <el-option label="内置" value="builtin" />
            <el-option label="MCP" value="mcp" />
            <el-option label="API" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置">
          <el-input v-model="form.config" type="textarea" :rows="6" placeholder="JSON" />
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
import type { IAgentToolInfo } from "@/types/api/agent"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  createAgentToolApi,
  deleteAgentToolApi,
  getAgentToolApi,
  getAgentToolListApi,
  updateAgentToolApi
} from "@/api/agent"

function emptyForm() {
  return { name: "", toolType: "builtin", config: "", status: 1, sort: 0 }
}

export default defineComponent({
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const editToolId = ref("")
    const toolList = ref<IAgentToolInfo[]>([])
    const searchForm = reactive({ status: 0 })
    const form = reactive(emptyForm())

    const fetchList = async () => {
      loading.value = true
      const res = await getAgentToolListApi({ status: searchForm.status, source: "official" })
      loading.value = false
      if (res.code === 0) {
        toolList.value = res.result.list || []
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const openCreate = () => {
      isEdit.value = false
      editToolId.value = ""
      Object.assign(form, emptyForm())
      dialogVisible.value = true
    }

    const openEdit = async (toolId: string) => {
      const res = await getAgentToolApi({ toolId })
      if (res.code !== 0 || !res.result.tool) {
        ElMessage.error(res.msg || "加载详情失败")
        return
      }
      const tool = res.result.tool
      isEdit.value = true
      editToolId.value = toolId
      form.name = tool.name
      form.toolType = tool.toolType
      form.config = tool.config
      form.status = tool.status || 1
      form.sort = tool.sort || 0
      dialogVisible.value = true
    }

    const submitForm = async () => {
      if (!form.name || !form.toolType) {
        ElMessage.error("名称和类型不能为空")
        return
      }
      saving.value = true
      const res = isEdit.value
        ? await updateAgentToolApi({ ...form, toolId: editToolId.value })
        : await createAgentToolApi({ ...form })
      saving.value = false
      if (res.code === 0) {
        ElMessage.success("已保存")
        dialogVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    const handleDelete = async (row: IAgentToolInfo) => {
      const confirmed = await ElMessageBox.confirm(`删除工具「${row.name}」？`, "删除", { type: "warning" })
        .then(() => true, () => false)
      if (!confirmed) {
        return
      }
      const res = await deleteAgentToolApi({ toolId: row.toolId })
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
      toolList,
      searchForm,
      form,
      fetchList,
      openCreate,
      openEdit,
      submitForm,
      handleDelete
    }
  }
})
</script>

<style lang="less">
.agent-tools {
  padding: 20px;

  .agent-tools-title {
    margin-top: 0;
    margin-bottom: 4px;
    margin-left: 0;
    margin-right: 0;
  }

  .agent-tools-hint {
    margin-top: 0;
    margin-bottom: 16px;
    margin-left: 0;
    margin-right: 0;
    color: #909399;
  }

  .agent-tools-form {
    margin-bottom: 12px;
  }
}
</style>
