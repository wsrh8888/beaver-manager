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
  <div class="open-digitals">
    <div class="open-digitals-header">
      <h2 class="open-digitals-title">用户数字伙伴</h2>
      <p class="open-digitals-hint">用户在开放平台创建的数字伙伴。这里只做启用和禁用，不改提示词</p>
    </div>

    <el-form :inline="true" class="open-digitals-form">
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" style="width: 120px">
          <el-option label="全部" :value="-1" />
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="digitalList" border stripe>
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="digitalId" label="用户 ID" min-width="160" show-overflow-tooltip />
      <el-table-column prop="ownerId" label="创建者" min-width="140" show-overflow-tooltip />
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
          <el-button v-if="row.status === 1" link type="danger" @click="setStatus(row, 0)">禁用</el-button>
          <el-button v-else link type="primary" @click="setStatus(row, 1)">启用</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无用户数字伙伴" />
      </template>
    </el-table>

    <el-pagination
      class="open-digitals-pagination"
      background
      layout="total, prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      @current-change="onPageChange"
    />
  </div>
</template>

<script lang="ts">
import type { IDigitalAdminInfo } from "@/types/api/digital"
import { ElMessage } from "element-plus"
import { getDigitalListApi, updateDigitalApi } from "@/api/digital"

const runtimeLabels: Record<string, string> = { builtin: "内置", external: "外接", workflow: "工作流" }
const visibilityLabels: Record<string, string> = { private: "仅管理员", partial: "指定可见", public: "全员可见" }

export default defineComponent({
  setup() {
    const loading = ref(false)
    const digitalList = ref<IDigitalAdminInfo[]>([])
    const searchForm = reactive({ status: -1 })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const runtimeLabel = (runtime: string) => runtimeLabels[runtime] || runtime
    const visibilityLabel = (visibility: string) => visibilityLabels[visibility] || visibility

    const fetchList = async () => {
      loading.value = true
      const res = await getDigitalListApi({
        source: "open",
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

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchList()
    }

    const setStatus = async (row: IDigitalAdminInfo, status: number) => {
      const res = await updateDigitalApi({
        digitalId: row.digitalId,
        name: row.name,
        visibility: row.visibility,
        status
      })
      if (res.code === 0) {
        ElMessage.success(status === 1 ? "已启用" : "已禁用")
        fetchList()
      } else {
        ElMessage.error(res.msg || "更新失败")
      }
    }

    onMounted(fetchList)

    return {
      loading,
      digitalList,
      searchForm,
      pagination,
      runtimeLabel,
      visibilityLabel,
      handleSearch,
      onPageChange,
      setStatus
    }
  }
})
</script>

<style lang="less">
.open-digitals {
  padding: 20px;

  .open-digitals-title {
    margin-top: 0;
    margin-bottom: 4px;
    margin-left: 0;
    margin-right: 0;
  }

  .open-digitals-hint {
    margin-top: 0;
    margin-bottom: 16px;
    margin-left: 0;
    margin-right: 0;
    color: #909399;
  }

  .open-digitals-form {
    margin-bottom: 12px;
  }

  .open-digitals-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
