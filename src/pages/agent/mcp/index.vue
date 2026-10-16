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
  <div class="agent-mcp">
    <div class="agent-mcp-header">
      <h2 class="agent-mcp-title">MCP 服务</h2>
      <p class="agent-mcp-hint">官方 MCP 目录。场景智能体和官方数字伙伴从这里选择，用户自建 MCP 不在这张表里</p>
    </div>

    <el-form :inline="true" class="agent-mcp-form">
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" style="width: 120px">
          <el-option label="全部" :value="0" />
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="fetchList">搜索</el-button>
        <el-button type="primary" @click="openCreate">新建服务</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="serverList" border stripe>
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="serverName" label="服务标识" min-width="140" />
      <el-table-column prop="transport" label="传输" width="120" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? "启用" : "停用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row.mcpServerId)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无 MCP 服务" />
      </template>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑服务' : '新建服务'" width="640px">
      <el-form label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="form.name" maxlength="64" />
        </el-form-item>
        <el-form-item label="服务标识">
          <el-input v-model="form.serverName" maxlength="128" />
        </el-form-item>
        <el-form-item label="传输">
          <el-select v-model="form.transport" style="width: 100%">
            <el-option label="stdio" value="stdio" />
            <el-option label="sse" value="sse" />
            <el-option label="websocket" value="websocket" />
          </el-select>
        </el-form-item>
        <el-form-item label="连接配置">
          <el-input v-model="form.config" type="textarea" :rows="4" placeholder="JSON" />
        </el-form-item>
        <el-form-item label="能力清单">
          <el-input v-model="form.tools" type="textarea" :rows="4" placeholder="JSON" />
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
import type { IAgentMcpServerInfo } from "@/types/api/agent"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  createAgentMcpServerApi,
  deleteAgentMcpServerApi,
  getAgentMcpServerApi,
  getAgentMcpServerListApi,
  updateAgentMcpServerApi
} from "@/api/agent"

function emptyForm() {
  return { name: "", serverName: "", transport: "stdio", config: "", tools: "", status: 1 }
}

export default defineComponent({
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const editServerId = ref("")
    const serverList = ref<IAgentMcpServerInfo[]>([])
    const searchForm = reactive({ status: 0 })
    const form = reactive(emptyForm())

    const fetchList = async () => {
      loading.value = true
      const res = await getAgentMcpServerListApi({ status: searchForm.status, source: "official" })
      loading.value = false
      if (res.code === 0) {
        serverList.value = res.result.list || []
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const openCreate = () => {
      isEdit.value = false
      editServerId.value = ""
      Object.assign(form, emptyForm())
      dialogVisible.value = true
    }

    const openEdit = async (mcpServerId: string) => {
      const res = await getAgentMcpServerApi({ mcpServerId })
      if (res.code !== 0 || !res.result.server) {
        ElMessage.error(res.msg || "加载详情失败")
        return
      }
      const server = res.result.server
      isEdit.value = true
      editServerId.value = mcpServerId
      form.name = server.name
      form.serverName = server.serverName
      form.transport = server.transport
      form.config = server.config
      form.tools = server.tools
      form.status = server.status || 1
      dialogVisible.value = true
    }

    const submitForm = async () => {
      if (!form.name || !form.serverName || !form.transport) {
        ElMessage.error("名称、服务标识和传输不能为空")
        return
      }
      saving.value = true
      const res = isEdit.value
        ? await updateAgentMcpServerApi({ ...form, mcpServerId: editServerId.value })
        : await createAgentMcpServerApi({ ...form })
      saving.value = false
      if (res.code === 0) {
        ElMessage.success("已保存")
        dialogVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    const handleDelete = async (row: IAgentMcpServerInfo) => {
      const confirmed = await ElMessageBox.confirm(`删除服务「${row.name}」？`, "删除", { type: "warning" })
        .then(() => true, () => false)
      if (!confirmed) {
        return
      }
      const res = await deleteAgentMcpServerApi({ mcpServerId: row.mcpServerId })
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
      serverList,
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
.agent-mcp {
  padding: 20px;

  .agent-mcp-title {
    margin-top: 0;
    margin-bottom: 4px;
    margin-left: 0;
    margin-right: 0;
  }

  .agent-mcp-hint {
    margin-top: 0;
    margin-bottom: 16px;
    margin-left: 0;
    margin-right: 0;
    color: #909399;
  }

  .agent-mcp-form {
    margin-bottom: 12px;
  }
}
</style>
