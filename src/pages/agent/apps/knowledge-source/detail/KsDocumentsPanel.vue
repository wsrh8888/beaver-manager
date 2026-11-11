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

  知识源「文档」分区：用户粘贴海狸内部的在线文档地址导入，后端解析 + 鉴权后建立引用，
  文档正文与索引由 platform 侧异步拉取（引用云文档语义）。这里只做引用管理——列引用、
  移除引用，绝不搬运或删除在线文档本体。
-->

<template>
  <div class="ks-docs">
    <div class="panel-toolbar">
      <el-input
        v-model="keyword"
        size="small"
        clearable
        placeholder="搜索文档名称"
        class="panel-toolbar__search"
        @clear="loadDocs"
        @keyup.enter="loadDocs"
      />
      <el-button size="small" link type="primary" class="panel-toolbar__quick" @click="importVisible = true">
        批量粘贴链接
      </el-button>
      <el-button size="small" type="primary" :icon="Plus" @click="emit('add-file')">
        添加文件
      </el-button>
    </div>

    <el-table v-loading="docLoading" :data="docs" size="default" empty-text="还没有导入在线文档">
      <el-table-column type="index" label="序号" width="64" align="center" />
      <el-table-column prop="title" label="名称" min-width="160" show-overflow-tooltip />
      <el-table-column label="来源文档" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.sourceDocId || "—" }}</template>
      </el-table-column>
      <el-table-column label="同步方式" width="110">
        <template #default="{ row }">{{ syncModeLabel(row.syncMode) }}</template>
      </el-table-column>
      <el-table-column label="最近同步" width="150">
        <template #default="{ row }">{{ formatSync(row.lastSyncedAt) }}</template>
      </el-table-column>
      <el-table-column label="学习时间" width="140">
        <template #default="{ row }">{{ formatTime(row.indexedAt) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="indexTagType(row.indexStatus)">
            {{ indexStatusLabel(row.indexStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="right">
        <template #default="{ row }">
          <el-button
            link
            type="danger"
            size="small"
            :loading="removingId === row.documentId"
            :disabled="!!removingId"
            @click="removeDoc(row.documentId)"
          >
            移除引用
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <ImportOnlineDocDialog
      v-model="importVisible"
      :scene="scene"
      :knowledge-source-id="source.knowledgeSourceId"
      @done="onImported"
    />
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { ref, onMounted, defineComponent, toRefs } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { Plus } from "@element-plus/icons-vue"
import {
  listKnowledgeSourceDocApi,
  deleteKnowledgeSourceDocApi
} from "@/api/knowledgeSource"
import type {
  IKnowledgeSourceDoc,
  IKnowledgeSourceItem
} from "@/types/api/knowledgeSource"
import ImportOnlineDocDialog from "./ImportOnlineDocDialog.vue"

export default defineComponent({
  name: "KsDocumentsPanel",
  components: { ImportOnlineDocDialog },
  props: {
    scene: { type: String, required: true },
    source: { type: Object as PropType<IKnowledgeSourceItem>, required: true }
  },
  emits: ["refresh", "add-file"],
  setup(props, { emit }) {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    function formatTime(unix: number): string {
      if (!unix) return "—"
      const d = new Date(unix * 1000)
      const pad = (n: number) => String(n).padStart(2, "0")
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
    function formatSync(raw?: string): string {
      if (!raw) return "—"
      return raw.replace("T", " ").slice(0, 16)
    }
    const syncModeLabel = (mode?: string) =>
      mode === "direct" ? "跟随更新" : mode === "import" ? "导入快照" : "—"
    const indexStatusLabel = (status?: string) => {
      if (status === "ready") return "已完成"
      if (status === "indexing") return "学习中"
      if (status === "failed") return "失败"
      return "待学习"
    }
    const indexTagType = (status?: string) => {
      if (status === "ready") return "success"
      if (status === "indexing") return "warning"
      if (status === "failed") return "danger"
      return "info"
    }

    const docs = ref<IKnowledgeSourceDoc[]>([])
    const docLoading = ref(false)
    const keyword = ref("")
    const importVisible = ref(false)
    const removingId = ref("")

    const loadDocs = async () => {
      docLoading.value = true
      try {
        const res = await listKnowledgeSourceDocApi({
          scene: props.scene,
          knowledgeSourceId: props.source.knowledgeSourceId,
          keyword: keyword.value.trim() || undefined
        })
        if (res.code !== 0) throw new Error(res.msg || "加载文档失败")
        docs.value = res.result?.list ?? []
      } catch (err) {
        ElMessage.error(errorMessage(err, "加载文档失败"))
      } finally {
        docLoading.value = false
      }
    }

    const removeDoc = async (documentId: string) => {
      try {
        await ElMessageBox.confirm(
          "移除后该在线文档不再参与这个知识源的检索，在线文档本体不受影响。",
          "移除引用",
          { type: "warning" }
        )
      } catch {
        return
      }
      removingId.value = documentId
      try {
        const res = await deleteKnowledgeSourceDocApi({
          scene: props.scene,
          knowledgeSourceId: props.source.knowledgeSourceId,
          documentId
        })
        if (res.code !== 0) throw new Error(res.msg || "移除失败")
        ElMessage.success("已移除引用")
        emit("refresh")
        await loadDocs()
      } catch (err) {
        ElMessage.error(errorMessage(err, "移除失败"))
      } finally {
        removingId.value = ""
      }
    }

    const onImported = () => {
      emit("refresh")
      void loadDocs()
    }

    onMounted(() => {
      void loadDocs()
    })
    return {
      ...toRefs(props), props, emit, formatTime, formatSync, syncModeLabel,
      indexStatusLabel, indexTagType, docs, docLoading, keyword, importVisible,
      removingId, loadDocs, removeDoc, onImported, onMounted, ref, Plus,
      listKnowledgeSourceDocApi, deleteKnowledgeSourceDocApi, ImportOnlineDocDialog
    }
  }
})
</script>

<style scoped lang="less">
.panel-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: flex-end;

  &__search {
    max-width: 240px;
    margin-right: auto;
  }

  &__quick {
    font-size: 13px;
  }
}
</style>
