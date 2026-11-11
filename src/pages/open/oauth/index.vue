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
  <div class="open-oauth">
    <div class="open-oauth-header">
      <h2 class="open-oauth-title">OAuth 应用</h2>
      <p class="open-oauth-hint">
        开发者主动接入的第三方应用，用海狸账号登录换取 Token。后台只做检索与启停，密钥、回调与权限范围由开发者在开放平台控制台维护
      </p>
    </div>

    <el-form :inline="true" class="open-oauth-form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="应用名 / 描述" clearable style="width: 180px" @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="OAuthID">
        <el-input v-model="searchForm.oauthId" placeholder="精确匹配" clearable style="width: 180px" @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="所有者">
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

    <div class="open-oauth-toolbar">
      <el-button type="danger" plain :disabled="!selectedIds.length" @click="batchStatus(0)">批量禁用</el-button>
      <el-button type="success" plain :disabled="!selectedIds.length" @click="batchStatus(1)">批量启用</el-button>
      <span class="open-oauth-toolbar-tip">共 {{ pagination.total }} 个应用</span>
    </div>

    <el-table v-loading="loading" :data="list" border stripe @selection-change="onSelectionChange">
      <el-table-column type="selection" width="46" />
      <el-table-column label="应用" min-width="200">
        <template #default="{ row }">
          <div class="app-cell">
            <el-avatar :size="28" :src="row.icon">{{ (row.name || "?").slice(0, 1) }}</el-avatar>
            <div class="app-cell-text">
              <div class="app-cell-name">{{ row.name }}</div>
              <div class="app-cell-desc">{{ row.description || "暂无描述" }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="oauthId" label="OAuthID" min-width="170" show-overflow-tooltip />
      <el-table-column label="所有者" width="150">
        <template #default="{ row }">
          <el-link v-if="row.ownerUserId" type="primary" :underline="false" @click="goUser(row.ownerUserId)">
            {{ row.ownerUserName || row.ownerUserId }}
          </el-link>
          <span v-else>-</span>
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
        <el-empty description="暂无 OAuth 应用" />
      </template>
    </el-table>

    <el-pagination
      class="open-oauth-pagination"
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
import type { IOpenOAuthInfo } from "@/types/api/open"
import { OPEN_ENABLE_STATUS } from "@/types/api/open"
import { getOpenOAuthListApi, updateOpenOAuthStatusApi } from "@/api/open"
import { ElMessage, ElMessageBox } from "element-plus"

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const list = ref<IOpenOAuthInfo[]>([])
    const selectedIds = ref<string[]>([])
    const searchForm = reactive({
      keyword: "",
      oauthId: "",
      ownerUserId: "",
      status: -1
    })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const formatTime = (ms: number) => (ms ? new Date(ms).toLocaleString() : "-")

    const fetchList = async () => {
      loading.value = true
      const res = await getOpenOAuthListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword.trim() || undefined,
        oauthId: searchForm.oauthId.trim() || undefined,
        ownerUserId: searchForm.ownerUserId.trim() || undefined,
        status: searchForm.status
      })
      loading.value = false
      if (res.code === 0) {
        list.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取 OAuth 应用失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const handleReset = () => {
      searchForm.keyword = ""
      searchForm.oauthId = ""
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

    const onSelectionChange = (rows: IOpenOAuthInfo[]) => {
      selectedIds.value = rows.map(row => row.oauthId)
    }

    const submitStatus = async (oauthIds: string[], status: number) => {
      const res = await updateOpenOAuthStatusApi({ oauthIds, status })
      if (res.code === 0) {
        ElMessage.success(status === 1 ? "已启用" : "已禁用")
        fetchList()
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const setStatus = async (row: IOpenOAuthInfo, status: number) => {
      const label = status === 1 ? "启用" : "禁用"
      await ElMessageBox.confirm(`确认${label}应用「${row.name}」？`, label, { type: "warning" })
      submitStatus([row.oauthId], status)
    }

    const batchStatus = async (status: number) => {
      if (!selectedIds.value.length) return
      const label = status === 1 ? "启用" : "禁用"
      await ElMessageBox.confirm(`确认批量${label} ${selectedIds.value.length} 个应用？`, "提示", { type: "warning" })
      submitStatus(selectedIds.value, status)
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    onMounted(fetchList)

    return {
      loading, list, selectedIds, searchForm, pagination, OPEN_ENABLE_STATUS,
      formatTime, handleSearch, handleReset, onSizeChange, onPageChange,
      onSelectionChange, setStatus, batchStatus, goUser
    }
  }
})
</script>

<style lang="less" scoped>
.open-oauth {
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

  &-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    &-tip {
      margin-left: auto;
      color: #909399;
      font-size: 13px;
    }
  }

  &-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .app-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    &-text {
      min-width: 0;
    }

    &-name {
      font-weight: 500;
      line-height: 1.4;
    }

    &-desc {
      color: #909399;
      font-size: 12px;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 260px;
    }
  }
}
</style>
