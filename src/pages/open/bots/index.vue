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
  <div class="open-bots">
    <div class="open-bots-header">
      <h2 class="open-bots-title">推送机器人</h2>
      <p class="open-bots-hint">
        开发者创建的群通知机器人（open_bot）：用 Webhook 往群里单向推消息，不是数字伙伴、也不能应答。后台只做检索与启停，Token、签名密钥与入站安全配置由开发者在控制台维护
      </p>
    </div>

    <el-form :inline="true" class="open-bots-form">
      <el-form-item label="BotID">
        <el-input v-model="searchForm.keyword" placeholder="模糊匹配" clearable style="width: 200px" @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="创建者">
        <el-input v-model="searchForm.ownerUserId" placeholder="用户 ID" clearable style="width: 160px" @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" style="width: 110px">
          <el-option label="全部" :value="-1" />
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="机器人" min-width="200">
        <template #default="{ row }">
          <div class="bot-cell">
            <div class="bot-cell-name">{{ row.botName || "（未取到昵称）" }}</div>
            <div class="bot-cell-id">{{ row.botId }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="创建者" width="150">
        <template #default="{ row }">
          <el-link v-if="row.ownerId" type="primary" :underline="false" @click="goUser(row.ownerId)">
            {{ row.ownerUserName || row.ownerId }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="可见范围" width="110">
        <template #default="{ row }">{{ OPEN_BOT_VISIBILITY[row.visibility] || row.visibility }}</template>
      </el-table-column>
      <el-table-column label="签名校验" width="100">
        <template #default="{ row }">
          <el-tag :type="row.signatureEnabled === 1 ? 'success' : 'info'" size="small" effect="plain">
            {{ row.signatureEnabled === 1 ? "已开启" : "未开启" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="(OPEN_ENABLE_STATUS[row.status]?.type as any) || 'info'" size="small">
            {{ OPEN_ENABLE_STATUS[row.status]?.text || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="110" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 1" link type="danger" @click="setStatus(row, 0)">禁用</el-button>
          <el-button v-else link type="primary" @click="setStatus(row, 1)">启用</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无推送机器人" />
      </template>
    </el-table>

    <el-pagination
      class="open-bots-pagination"
      background
      layout="total, sizes, prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />
  </div>
</template>

<script lang="ts">
import type { IOpenBotInfo } from "@/types/api/open"
import { OPEN_BOT_VISIBILITY, OPEN_ENABLE_STATUS } from "@/types/api/open"
import { getOpenBotListApi, updateOpenBotStatusApi } from "@/api/open"
import { ElMessage, ElMessageBox } from "element-plus"

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const list = ref<IOpenBotInfo[]>([])
    const searchForm = reactive({
      keyword: "",
      ownerUserId: "",
      status: -1
    })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const formatTime = (ms: number) => (ms ? new Date(ms).toLocaleString() : "-")

    const fetchList = async () => {
      loading.value = true
      const res = await getOpenBotListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword.trim() || undefined,
        ownerUserId: searchForm.ownerUserId.trim() || undefined,
        status: searchForm.status
      })
      loading.value = false
      if (res.code === 0) {
        list.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取推送机器人失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const handleReset = () => {
      searchForm.keyword = ""
      searchForm.ownerUserId = ""
      searchForm.status = -1
      handleSearch()
    }

    const onSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchList()
    }

    const setStatus = async (row: IOpenBotInfo, status: number) => {
      const label = status === 1 ? "启用" : "禁用"
      await ElMessageBox.confirm(
        `确认${label}机器人「${row.botName || row.botId}」？${status === 0 ? "禁用后 Webhook 将不再投递到它所在的群。" : ""}`,
        label,
        { type: "warning" }
      )
      const res = await updateOpenBotStatusApi({ botId: row.botId, status })
      if (res.code === 0) {
        ElMessage.success(`已${label}`)
        fetchList()
      } else {
        ElMessage.error(res.msg || `${label}失败`)
      }
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    onMounted(fetchList)

    return {
      loading, list, searchForm, pagination, OPEN_BOT_VISIBILITY, OPEN_ENABLE_STATUS,
      formatTime, handleSearch, handleReset, onSizeChange, onPageChange, setStatus, goUser
    }
  }
})
</script>

<style lang="less" scoped>
.open-bots {
  padding: 20px;

  &-header {
    margin-bottom: 16px;
  }

  &-title {
    margin: 0 0 4px;
  }

  &-hint {
    margin: 0;
    color: #909399;
    font-size: 13px;
    line-height: 1.6;
  }

  &-form {
    margin-bottom: 12px;
  }

  &-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .bot-cell {
    &-name {
      font-weight: 500;
      line-height: 1.4;
    }

    &-id {
      color: #909399;
      font-size: 12px;
      font-family: var(--el-font-family-mono, monospace);
      line-height: 1.4;
    }
  }
}
</style>
