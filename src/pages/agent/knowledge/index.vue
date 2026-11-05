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
  <div class="agent-knowledge">
    <div class="agent-knowledge-header">
      <h2 class="agent-knowledge-title">知识库</h2>
      <p class="agent-knowledge-hint">
        知识库按集合（目录）组织，最多两层。文档上传后进入索引队列，状态变「就绪」后，
        在「场景智能体」里勾选该集合即可被智能体检索命中。
      </p>
    </div>

    <div class="agent-knowledge-body">
      <!-- 左侧：集合目录树 -->
      <div class="agent-knowledge-tree">
        <div class="agent-knowledge-tree-head">
          <span>知识库目录</span>
          <div>
            <el-button link type="primary" @click="openCreateCollection()">新建集合</el-button>
            <el-button link @click="fetchCollections">刷新</el-button>
          </div>
        </div>
        <el-tree
          v-loading="treeLoading"
          :data="collectionTree"
          :props="treeProps"
          node-key="collectionId"
          highlight-current
          default-expand-all
          :expand-on-click-node="false"
          @node-click="onCollectionSelect"
        >
          <template #default="{ data }">
            <span class="agent-knowledge-node">
              <span class="agent-knowledge-node-name">{{ data.name }}</span>
              <el-tag v-if="data.status !== 1" type="info" size="small">停用</el-tag>
              <span class="agent-knowledge-node-ops">
                <el-button link type="primary" size="small" @click.stop="openEditCollection(data)">编辑</el-button>
                <el-button link type="danger" size="small" @click.stop="handleDeleteCollection(data)">删除</el-button>
              </span>
            </span>
          </template>
        </el-tree>
        <el-empty v-if="!treeLoading && collectionTree.length === 0" description="暂无集合" :image-size="60" />
      </div>

      <!-- 右侧：文档列表 -->
      <div class="agent-knowledge-docs">
        <div class="agent-knowledge-docs-head">
          <span>{{ currentCollection ? `「${currentCollection.name}」的文档` : "请选择左侧集合" }}</span>
          <div>
            <el-button type="primary" :disabled="!currentCollection" @click="openCreateDocument">上传文档</el-button>
            <el-button :disabled="!currentCollection" @click="fetchDocuments">刷新</el-button>
          </div>
        </div>

        <el-table v-loading="docLoading" :data="documentList" border stripe>
          <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
          <el-table-column prop="docType" label="类型" width="100" />
          <el-table-column label="大小" width="100">
            <template #default="{ row }">{{ formatBytes(row.byteSize) }}</template>
          </el-table-column>
          <el-table-column label="索引状态" width="120">
            <template #default="{ row }">
              <el-tag :type="indexStatusType(row.indexStatus)" size="small">
                {{ indexStatusLabel(row.indexStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="RAG" width="80">
            <template #default="{ row }">
              <el-tag :type="row.ragEnabled ? 'success' : 'info'" size="small">
                {{ row.ragEnabled ? "启用" : "停用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="indexedAt" label="索引时间" width="180" show-overflow-tooltip />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openEditDocument(row)">编辑</el-button>
              <el-button link type="warning" @click="handleReindex(row)">重建索引</el-button>
              <el-button link type="danger" @click="handleDeleteDocument(row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty :description="currentCollection ? '暂无文档' : '请先选择左侧集合'" />
          </template>
        </el-table>

        <el-pagination
          class="agent-knowledge-pagination"
          background
          layout="total, prev, pager, next"
          :current-page="docPagination.page"
          :page-size="docPagination.pageSize"
          :total="docPagination.total"
          @current-change="onDocPageChange"
        />
      </div>
    </div>

    <!-- 集合编辑弹窗 -->
    <el-dialog v-model="collectionDialogVisible" :title="collectionIsEdit ? '编辑集合' : '新建集合'" width="600px">
      <el-form label-width="100px">
        <el-form-item label="上级集合">
          <el-select v-model="collectionForm.parentId" clearable :disabled="collectionIsEdit" style="width: 100%" placeholder="留空为根目录">
            <el-option v-for="item in rootCollections" :key="item.collectionId" :label="item.name" :value="item.collectionId" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="collectionForm.name" maxlength="64" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="collectionForm.kind" style="width: 100%">
            <el-option label="文档 (docs)" value="docs" />
            <el-option label="问答 (faq)" value="faq" />
          </el-select>
        </el-form-item>
        <el-form-item label="访问范围">
          <el-select v-model="collectionForm.aclMode" style="width: 100%">
            <el-option label="内部 (internal)" value="internal" />
            <el-option label="按用户 (user_scoped)" value="user_scoped" />
          </el-select>
        </el-form-item>
        <el-form-item label="索引配置">
          <el-input v-model="collectionForm.indexConfig" type="textarea" :rows="4" placeholder='JSON，留空用后端默认分段/检索/embedding 配置' />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="collectionForm.description" type="textarea" :rows="2" maxlength="200" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="collectionForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="collectionForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="2">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="collectionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="collectionSaving" @click="submitCollection">保存</el-button>
      </template>
    </el-dialog>

    <!-- 文档编辑弹窗 -->
    <el-dialog v-model="documentDialogVisible" :title="documentIsEdit ? '编辑文档' : '上传文档'" width="640px">
      <el-form label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="documentForm.title" maxlength="128" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="documentForm.docType" style="width: 100%">
            <el-option label="指南 (guide)" value="guide" />
            <el-option label="政策 (policy)" value="faq" />
            <el-option label="问答 (faq)" value="faq" />
            <el-option label="产品 (product)" value="product" />
          </el-select>
        </el-form-item>
        <el-form-item label="正文">
          <el-input v-model="documentForm.contentText" type="textarea" :rows="8" placeholder="粘贴正文，或点右侧从 .txt 文件读取" />
          <input ref="fileInput" type="file" accept=".txt,.md,text/plain" style="display: none" @change="onFileChange" />
          <el-button class="agent-knowledge-file-btn" @click="pickFile">选择文本文件</el-button>
        </el-form-item>
        <el-form-item label="参与检索">
          <el-switch v-model="documentForm.ragEnabled" />
        </el-form-item>
        <el-form-item v-if="documentIsEdit" label="状态">
          <el-radio-group v-model="documentForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="2">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="documentDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="documentSaving" @click="submitDocument">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IKnowledgeCollectionInfo, IKnowledgeDocumentInfo } from "@/types/api/knowledge"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  createKnowledgeCollectionApi,
  createKnowledgeDocumentApi,
  deleteKnowledgeCollectionApi,
  deleteKnowledgeDocumentApi,
  getKnowledgeCollectionListApi,
  getKnowledgeDocumentListApi,
  reindexKnowledgeDocumentApi,
  updateKnowledgeCollectionApi,
  updateKnowledgeDocumentApi
} from "@/api/knowledge"

const indexStatusLabels: Record<string, string> = {
  pending: "排队中",
  indexing: "索引中",
  ready: "就绪",
  failed: "失败"
}

function emptyCollectionForm() {
  return {
    collectionId: "",
    parentId: "",
    name: "",
    kind: "docs",
    aclMode: "internal",
    indexConfig: "",
    description: "",
    status: 1,
    sort: 0
  }
}

function emptyDocumentForm() {
  return {
    documentId: "",
    title: "",
    docType: "guide",
    contentText: "",
    ragEnabled: true,
    status: 1
  }
}

export default defineComponent({
  setup() {
    const treeProps = { label: "name", children: "children" }
    const treeLoading = ref(false)
    const collections = ref<IKnowledgeCollectionInfo[]>([])
    const currentCollection = ref<IKnowledgeCollectionInfo | null>(null)

    const docLoading = ref(false)
    const documentList = ref<IKnowledgeDocumentInfo[]>([])
    const docPagination = reactive({ page: 1, pageSize: 20, total: 0 })

    const collectionDialogVisible = ref(false)
    const collectionIsEdit = ref(false)
    const collectionSaving = ref(false)
    const collectionForm = reactive(emptyCollectionForm())

    const documentDialogVisible = ref(false)
    const documentIsEdit = ref(false)
    const documentSaving = ref(false)
    const documentForm = reactive(emptyDocumentForm())
    const fileInput = ref<HTMLInputElement>()

    // 两层目录树：根集合 + 直接子集合
    const collectionTree = computed(() => {
      const roots = collections.value.filter((c) => !c.parentId)
      return roots.map((root) => ({
        ...root,
        children: collections.value.filter((c) => c.parentId === root.collectionId)
      }))
    })
    const rootCollections = computed(() => collections.value.filter((c) => !c.parentId))

    const indexStatusLabel = (status: string) => indexStatusLabels[status] || status || "未知"
    const indexStatusType = (status: string) => {
      if (status === "ready") return "success"
      if (status === "failed") return "danger"
      if (status === "indexing") return "warning"
      return "info"
    }
    const formatBytes = (n: number) => {
      const bytes = Number(n) || 0
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    }

    const fetchCollections = async () => {
      treeLoading.value = true
      const res = await getKnowledgeCollectionListApi({ status: 0, page: 1, pageSize: 200 })
      treeLoading.value = false
      if (res.code === 0) {
        collections.value = res.result.list || []
      } else {
        ElMessage.error(res.msg || "加载集合失败")
      }
    }

    const fetchDocuments = async () => {
      if (!currentCollection.value) {
        documentList.value = []
        docPagination.total = 0
        return
      }
      docLoading.value = true
      const res = await getKnowledgeDocumentListApi({
        collectionId: currentCollection.value.collectionId,
        page: docPagination.page,
        pageSize: docPagination.pageSize
      })
      docLoading.value = false
      if (res.code === 0) {
        documentList.value = res.result.list || []
        docPagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载文档失败")
      }
    }

    const onCollectionSelect = (data: IKnowledgeCollectionInfo) => {
      currentCollection.value = data
      docPagination.page = 1
      fetchDocuments()
    }

    const onDocPageChange = (page: number) => {
      docPagination.page = page
      fetchDocuments()
    }

    // —— 集合 ——
    const openCreateCollection = () => {
      collectionIsEdit.value = false
      Object.assign(collectionForm, emptyCollectionForm())
      collectionDialogVisible.value = true
    }

    const openEditCollection = (row: IKnowledgeCollectionInfo) => {
      collectionIsEdit.value = true
      Object.assign(collectionForm, {
        collectionId: row.collectionId,
        parentId: row.parentId,
        name: row.name,
        kind: row.kind || "docs",
        aclMode: row.aclMode || "internal",
        indexConfig: row.indexConfig || "",
        description: row.description || "",
        status: row.status || 1,
        sort: row.sort || 0
      })
      collectionDialogVisible.value = true
    }

    const submitCollection = async () => {
      if (!collectionForm.name) {
        ElMessage.error("名称不能为空")
        return
      }
      collectionSaving.value = true
      const res = collectionIsEdit.value
        ? await updateKnowledgeCollectionApi({
            collectionId: collectionForm.collectionId,
            name: collectionForm.name,
            kind: collectionForm.kind,
            aclMode: collectionForm.aclMode,
            indexConfig: collectionForm.indexConfig,
            description: collectionForm.description,
            status: collectionForm.status,
            sort: collectionForm.sort
          })
        : await createKnowledgeCollectionApi({
            parentId: collectionForm.parentId,
            name: collectionForm.name,
            kind: collectionForm.kind,
            aclMode: collectionForm.aclMode,
            indexConfig: collectionForm.indexConfig,
            description: collectionForm.description,
            status: collectionForm.status,
            sort: collectionForm.sort
          })
      collectionSaving.value = false
      if (res.code === 0) {
        ElMessage.success("已保存")
        collectionDialogVisible.value = false
        await fetchCollections()
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    const handleDeleteCollection = async (row: IKnowledgeCollectionInfo) => {
      const confirmed = await ElMessageBox.confirm(
        `删除集合「${row.name}」将级联软删其下文档并清除索引，确认？`,
        "删除",
        { type: "warning" }
      ).then(
        () => true,
        () => false
      )
      if (!confirmed) return
      const res = await deleteKnowledgeCollectionApi({ collectionId: row.collectionId })
      if (res.code === 0) {
        ElMessage.success("已删除")
        if (currentCollection.value?.collectionId === row.collectionId) {
          currentCollection.value = null
          documentList.value = []
          docPagination.total = 0
        }
        await fetchCollections()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    // —— 文档 ——
    const openCreateDocument = () => {
      if (!currentCollection.value) return
      documentIsEdit.value = false
      Object.assign(documentForm, emptyDocumentForm())
      documentDialogVisible.value = true
    }

    const openEditDocument = (row: IKnowledgeDocumentInfo) => {
      documentIsEdit.value = true
      Object.assign(documentForm, {
        documentId: row.documentId,
        title: row.title,
        docType: row.docType || "guide",
        contentText: "",
        ragEnabled: row.ragEnabled,
        status: row.status || 1
      })
      documentDialogVisible.value = true
    }

    const pickFile = () => fileInput.value?.click()

    const onFileChange = (e: Event) => {
      const input = e.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        documentForm.contentText = String(reader.result || "")
        if (!documentForm.title) {
          documentForm.title = file.name.replace(/\.[^.]+$/, "")
        }
      }
      reader.readAsText(file)
      input.value = ""
    }

    const submitDocument = async () => {
      if (!documentForm.title) {
        ElMessage.error("标题不能为空")
        return
      }
      if (!documentIsEdit.value && !currentCollection.value) {
        ElMessage.error("请先选择集合")
        return
      }
      documentSaving.value = true
      const res = documentIsEdit.value
        ? await updateKnowledgeDocumentApi({
            documentId: documentForm.documentId,
            title: documentForm.title,
            docType: documentForm.docType,
            contentText: documentForm.contentText || undefined,
            ragEnabled: documentForm.ragEnabled,
            status: documentForm.status
          })
        : await createKnowledgeDocumentApi({
            collectionId: currentCollection.value!.collectionId,
            title: documentForm.title,
            docType: documentForm.docType,
            contentText: documentForm.contentText,
            ragEnabled: documentForm.ragEnabled
          })
      documentSaving.value = false
      if (res.code === 0) {
        ElMessage.success(documentIsEdit.value ? "已保存" : "已上传，正在排队索引")
        documentDialogVisible.value = false
        fetchDocuments()
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    const handleReindex = async (row: IKnowledgeDocumentInfo) => {
      const res = await reindexKnowledgeDocumentApi({ documentId: row.documentId })
      if (res.code === 0) {
        ElMessage.success("已重新入队索引")
        fetchDocuments()
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const handleDeleteDocument = async (row: IKnowledgeDocumentInfo) => {
      const confirmed = await ElMessageBox.confirm(`删除文档「${row.title}」？`, "删除", { type: "warning" }).then(
        () => true,
        () => false
      )
      if (!confirmed) return
      const res = await deleteKnowledgeDocumentApi({ documentId: row.documentId })
      if (res.code === 0) {
        ElMessage.success("已删除")
        fetchDocuments()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    onMounted(fetchCollections)

    return {
      treeProps,
      treeLoading,
      collections,
      collectionTree,
      rootCollections,
      currentCollection,
      docLoading,
      documentList,
      docPagination,
      collectionDialogVisible,
      collectionIsEdit,
      collectionSaving,
      collectionForm,
      documentDialogVisible,
      documentIsEdit,
      documentSaving,
      documentForm,
      fileInput,
      indexStatusLabel,
      indexStatusType,
      formatBytes,
      fetchCollections,
      fetchDocuments,
      onCollectionSelect,
      onDocPageChange,
      openCreateCollection,
      openEditCollection,
      submitCollection,
      handleDeleteCollection,
      openCreateDocument,
      openEditDocument,
      pickFile,
      onFileChange,
      submitDocument,
      handleReindex,
      handleDeleteDocument
    }
  }
})
</script>

<style lang="less">
.agent-knowledge {
  padding: 20px;

  .agent-knowledge-title {
    margin-top: 0;
    margin-bottom: 4px;
  }

  .agent-knowledge-hint {
    margin-top: 0;
    margin-bottom: 16px;
    color: #909399;
  }

  .agent-knowledge-body {
    display: flex;
    gap: 16px;
  }

  .agent-knowledge-tree {
    width: 300px;
    flex-shrink: 0;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 12px;
  }

  .agent-knowledge-docs {
    flex: 1;
    min-width: 0;
  }

  .agent-knowledge-tree-head,
  .agent-knowledge-docs-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .agent-knowledge-node {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    .agent-knowledge-node-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .agent-knowledge-node-ops {
      visibility: hidden;
    }

    &:hover .agent-knowledge-node-ops {
      visibility: visible;
    }
  }

  .agent-knowledge-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .agent-knowledge-file-btn {
    margin-top: 8px;
  }
}
</style>
