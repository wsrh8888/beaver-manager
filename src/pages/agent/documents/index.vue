<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  在线文档：空间 + 节点树（目录/页面）+ 正文编辑 + 文件导入
-->

<template>
  <div class="doc-page">
    <div class="doc-page__header">
      <h2 class="doc-page__title">在线文档</h2>
      <p class="doc-page__hint">文档按「空间」组织，空间下是目录树（目录 / 页面）。支持导入 docx / pdf 文件。</p>
    </div>

    <div class="doc-page__body">
      <!-- 左侧：空间 + 节点树 -->
      <div class="doc-tree">
        <div class="doc-tree__bar">
          <el-select v-model="activeSpaceId" placeholder="选择空间" style="width: 100%" @change="onSpaceChange">
            <el-option v-for="s in spaces" :key="s.spaceId" :label="s.name" :value="s.spaceId" />
          </el-select>
          <el-button size="small" type="primary" @click="openCreateSpace">新建空间</el-button>
        </div>

        <div class="doc-tree__toolbar">
          <el-button size="small" :disabled="!activeSpaceId" @click="openCreateNode('folder')">新建目录</el-button>
          <el-button size="small" :disabled="!activeSpaceId" @click="openCreateNode('page')">新建页面</el-button>
          <el-button size="small" :disabled="!activeSpaceId" @click="openImport">导入文件</el-button>
        </div>

        <el-tree
          v-loading="treeLoading"
          :data="nodeTree"
          :props="treeProps"
          node-key="nodeId"
          highlight-current
          default-expand-all
          :expand-on-click-node="false"
          @node-click="onNodeClick"
        >
          <template #default="{ data }">
            <span class="doc-tree__node">
              <el-icon v-if="data.type === 'folder'" class="doc-tree__icon"><Folder /></el-icon>
              <el-icon v-else class="doc-tree__icon"><Document /></el-icon>
              <span class="doc-tree__node-title">{{ data.title }}</span>
              <span class="doc-tree__node-ops">
                <el-button link type="danger" size="small" @click.stop="handleDeleteNode(data)">删除</el-button>
              </span>
            </span>
          </template>
        </el-tree>
        <el-empty v-if="!treeLoading && nodeTree.length === 0" description="暂无节点" :image-size="60" />
      </div>

      <!-- 右侧：文档编辑 -->
      <div class="doc-editor">
        <div v-if="!currentDoc" class="doc-editor__empty">
          <el-empty description="选择左侧页面节点开始编辑，或新建页面" />
        </div>
        <div v-else v-loading="docLoading" class="doc-editor__content">
          <div class="doc-editor__bar">
            <el-input v-model="docTitle" maxlength="256" placeholder="标题" style="max-width: 480px" />
            <div class="doc-editor__actions">
              <span class="doc-editor__version">v{{ currentDoc.version }}</span>
              <el-button type="primary" :loading="saving" @click="saveDoc">保存</el-button>
            </div>
          </div>
          <el-input
            v-model="docContent"
            type="textarea"
            :rows="24"
            placeholder="在此输入正文内容…"
            resize="none"
          />
        </div>
      </div>
    </div>

    <!-- 新建空间 -->
    <el-dialog v-model="spaceDialogVisible" title="新建空间" width="480px">
      <el-form label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="spaceForm.name" maxlength="64" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="spaceDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="spaceSaving" @click="submitSpace">创建</el-button>
      </template>
    </el-dialog>

    <!-- 新建节点 -->
    <el-dialog v-model="nodeDialogVisible" :title="nodeForm.type === 'folder' ? '新建目录' : '新建页面'" width="480px">
      <el-form label-width="80px">
        <el-form-item label="上级">
          <el-select v-model="nodeForm.parentId" clearable style="width: 100%" placeholder="根目录">
            <el-option v-for="n in folderNodes" :key="n.nodeId" :label="n.title" :value="n.nodeId" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="nodeForm.title" maxlength="128" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="nodeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="nodeSaving" @click="submitNode">创建</el-button>
      </template>
    </el-dialog>

    <!-- 导入文件 -->
    <el-dialog v-model="importDialogVisible" title="导入文件" width="480px">
      <el-form label-width="80px">
        <el-form-item label="上级">
          <el-select v-model="importForm.parentNodeId" clearable style="width: 100%" placeholder="根目录">
            <el-option v-for="n in folderNodes" :key="n.nodeId" :label="n.title" :value="n.nodeId" />
          </el-select>
        </el-form-item>
        <el-form-item label="文件">
          <el-upload
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            accept=".docx,.pdf,.doc"
            :on-change="onImportFileChange"
            :on-exceed="() => ElMessage.warning('一次只能导入一个文件')"
          >
            <el-button>选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 .docx / .pdf，最大 20MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importing" @click="submitImport">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Document, Folder } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  createDocApi,
  createNodeApi,
  createSpaceApi,
  deleteDocApi,
  deleteNodeApi,
  getDocApi,
  importDocApi,
  listNodesApi,
  listSpacesApi,
  saveDocContentApi
} from "@/api/doc"
import type { IDocItem, INodeItem, ISpaceItem } from "@/types/api/doc"

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // data:application/...;base64,xxxx
      const comma = result.indexOf(",")
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default defineComponent({
  components: { Document, Folder },
  setup() {
    const treeProps = { label: "title", children: "children" }
    const spaces = ref<ISpaceItem[]>([])
    const activeSpaceId = ref("")
    const treeLoading = ref(false)
    const nodes = ref<INodeItem[]>([])

    const currentDoc = ref<IDocItem | null>(null)
    const docLoading = ref(false)
    const docTitle = ref("")
    const docContent = ref("")
    const saving = ref(false)

    const spaceDialogVisible = ref(false)
    const spaceSaving = ref(false)
    const spaceForm = reactive({ name: "" })

    const nodeDialogVisible = ref(false)
    const nodeSaving = ref(false)
    const nodeForm = reactive({ title: "", type: "page" as "folder" | "page", parentId: "" })

    const importDialogVisible = ref(false)
    const importing = ref(false)
    const importForm = reactive({ parentNodeId: "", file: null as File | null })

    const nodeTree = computed(() => {
      const map = new Map<string, INodeItem & { children?: INodeItem[] }>()
      nodes.value.forEach((n) => map.set(n.nodeId, { ...n }))
      const roots: (INodeItem & { children?: INodeItem[] })[] = []
      nodes.value.forEach((n) => {
        const node = map.get(n.nodeId)!
        if (n.parentId && map.has(n.parentId)) {
          const parent = map.get(n.parentId)!
          parent.children = parent.children || []
          parent.children.push(node)
        } else {
          roots.push(node)
        }
      })
      return roots
    })

    const folderNodes = computed(() => nodes.value.filter((n) => n.type === "folder"))

    const loadSpaces = async () => {
      const res = await listSpacesApi({ status: 1, page: 1, pageSize: 200 })
      if (res.code === 0) {
        spaces.value = res.result.spaces || []
        if (!activeSpaceId.value && spaces.value.length) {
          activeSpaceId.value = spaces.value[0].spaceId
          loadNodes()
        }
      }
    }

    const loadNodes = async () => {
      if (!activeSpaceId.value) return
      treeLoading.value = true
      const res = await listNodesApi({ spaceId: activeSpaceId.value })
      treeLoading.value = false
      if (res.code === 0) {
        nodes.value = res.result.nodes || []
      }
    }

    const onSpaceChange = () => {
      currentDoc.value = null
      loadNodes()
    }

    const onNodeClick = async (data: INodeItem) => {
      if (data.type === "folder") return
      if (!data.docId) return
      docLoading.value = true
      const res = await getDocApi({ docId: data.docId })
      docLoading.value = false
      if (res.code === 0 && res.result.doc) {
        currentDoc.value = res.result.doc
        docTitle.value = res.result.doc.title
        docContent.value = parseContentText(res.result.doc.contentJson)
      } else {
        ElMessage.error(res.msg || "加载文档失败")
      }
    }

    // contentJson 可能是 Yjs 状态；这里降级取可读文本（空则当空白）
    function parseContentText(raw: string): string {
      if (!raw) return ""
      try {
        const o = JSON.parse(raw)
        if (typeof o === "string") return o
        if (o && typeof o.text === "string") return o.text
      } catch {
        /* ignore */
      }
      return raw
    }

    const saveDoc = async () => {
      if (!currentDoc.value) return
      saving.value = true
      const contentJson = JSON.stringify(docContent.value)
      const res = await saveDocContentApi({
        docId: currentDoc.value.docId,
        contentJson,
        contentText: docContent.value
      })
      saving.value = false
      if (res.code === 0) {
        ElMessage.success("已保存")
        currentDoc.value = { ...currentDoc.value, version: res.result.version }
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    // —— 空间 ——
    const openCreateSpace = () => {
      spaceForm.name = ""
      spaceDialogVisible.value = true
    }
    const submitSpace = async () => {
      if (!spaceForm.name.trim()) {
        ElMessage.warning("请填写名称")
        return
      }
      spaceSaving.value = true
      const res = await createSpaceApi({ name: spaceForm.name.trim() })
      spaceSaving.value = false
      if (res.code === 0) {
        ElMessage.success("已创建")
        spaceDialogVisible.value = false
        await loadSpaces()
        activeSpaceId.value = res.result.spaceId
        loadNodes()
      } else {
        ElMessage.error(res.msg || "创建失败")
      }
    }

    // —— 节点 ——
    const openCreateNode = (type: "folder" | "page") => {
      nodeForm.type = type
      nodeForm.title = ""
      nodeForm.parentId = ""
      nodeDialogVisible.value = true
    }
    const submitNode = async () => {
      if (!nodeForm.title.trim()) {
        ElMessage.warning("请填写标题")
        return
      }
      nodeSaving.value = true
      const res = await createNodeApi({
        spaceId: activeSpaceId.value,
        parentId: nodeForm.parentId || undefined,
        title: nodeForm.title.trim(),
        type: nodeForm.type
      })
      nodeSaving.value = false
      if (res.code === 0) {
        ElMessage.success("已创建")
        nodeDialogVisible.value = false
        await loadNodes()
      } else {
        ElMessage.error(res.msg || "创建失败")
      }
    }
    const handleDeleteNode = async (row: INodeItem) => {
      const confirmed = await ElMessageBox.confirm(`删除「${row.title}」？`, "删除", { type: "warning" })
        .then(() => true, () => false)
      if (!confirmed) return
      const res = await deleteNodeApi({ nodeId: row.nodeId })
      if (res.code === 0) {
        ElMessage.success("已删除")
        if (currentDoc.value && currentDoc.value.nodeId === row.nodeId) {
          currentDoc.value = null
        }
        await loadNodes()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    // —— 导入文件 ——
    const openImport = () => {
      importForm.parentNodeId = ""
      importForm.file = null
      importDialogVisible.value = true
    }
    const onImportFileChange = (file: { raw: File }) => {
      importForm.file = file.raw
    }
    const submitImport = async () => {
      if (!importForm.file) {
        ElMessage.warning("请选择文件")
        return
      }
      if (importForm.file.size > 20 * 1024 * 1024) {
        ElMessage.warning("文件不能超过 20MB")
        return
      }
      importing.value = true
      try {
        const data = await fileToBase64(importForm.file)
        const res = await importDocApi({
          spaceId: activeSpaceId.value,
          parentNodeId: importForm.parentNodeId || undefined,
          fileName: importForm.file.name,
          data
        })
        if (res.code === 0) {
          ElMessage.success(res.result.parsed ? "导入成功" : "导入完成（解析可能不完整）")
          importDialogVisible.value = false
          await loadNodes()
        } else {
          ElMessage.error(res.msg || "导入失败")
        }
      } catch (e) {
        ElMessage.error("读取文件失败")
      } finally {
        importing.value = false
      }
    }

    onMounted(loadSpaces)

    return {
      treeProps,
      spaces,
      activeSpaceId,
      treeLoading,
      nodes,
      nodeTree,
      folderNodes,
      currentDoc,
      docLoading,
      docTitle,
      docContent,
      saving,
      spaceDialogVisible,
      spaceSaving,
      spaceForm,
      nodeDialogVisible,
      nodeSaving,
      nodeForm,
      importDialogVisible,
      importing,
      importForm,
      onSpaceChange,
      onNodeClick,
      saveDoc,
      openCreateSpace,
      submitSpace,
      openCreateNode,
      submitNode,
      handleDeleteNode,
      openImport,
      onImportFileChange,
      submitImport
    }
  }
})
</script>

<style lang="less" scoped>
.doc-page {
  padding: 20px;

  &__title {
    margin: 0 0 4px;
  }

  &__hint {
    margin: 0 0 16px;
    color: #909399;
  }

  &__body {
    display: flex;
    gap: 16px;
    height: calc(100vh - 200px);
  }
}

.doc-tree {
  width: 300px;
  flex-shrink: 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__bar {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__toolbar {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  &__node {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;

    &-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-ops {
      visibility: hidden;
    }

    &:hover &-ops {
      visibility: visible;
    }
  }

  &__icon {
    color: #409eff;
  }

  :deep(.el-tree) {
    flex: 1;
    overflow: auto;
  }
}

.doc-editor {
  flex: 1;
  min-width: 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow: hidden;
  }

  &__bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__version {
    color: #909399;
    font-size: 12px;
  }

  :deep(.el-textarea) {
    flex: 1;
  }

  :deep(.el-textarea__inner) {
    height: 100% !important;
  }
}
</style>
