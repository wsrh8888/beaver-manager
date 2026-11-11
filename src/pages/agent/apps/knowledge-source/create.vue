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

  创建知识源子路由页：/agent/apps/:scene/knowledge/create
  - 在「知识源」分区点「创建知识源」直接进这一页，不再先弹输入框；
  - 顶部「选择数据源」提供一个「创建一个空的知识源」入口（立即落库并进入知识源）；
  - 下面「上传文件」：海狸在线文档 / Q&A 文档 / 本地上传，选完点「创建知识源」一并落库并导入；
  - 在线文档与 Q&A 文档都要先在弹窗里「检查链接」，检查通过才能确认加入。
-->

<template>
  <div class="ks-create">
    <input
      ref="localInputRef"
      type="file"
      class="ks-create__file-input"
      accept=".docx,.xlsx"
      multiple
      @change="onLocalInputChange"
    >

    <div class="ks-create__bar">
      <el-button link type="primary" class="ks-create__back" :icon="ArrowLeft" @click="backToList">
        全部知识源
      </el-button>
    </div>

    <header class="ks-create__head">
      <h2 class="ks-create__title">
        创建新的知识源
      </h2>
      <p class="ks-create__desc">
        知识源是这个智能体检索文档的分组。可以先建一个空的，之后再补充文档；也可以现在就添加在线文档或本地文件。
      </p>
    </header>

    <section class="ks-section">
      <h3 class="ks-section__title">
        选择数据源
      </h3>
      <button
        type="button"
        class="empty-card"
        :disabled="creatingEmpty"
        @click="openEmptyDialog"
      >
        <span class="empty-card__icon">
          <el-icon><FolderAdd /></el-icon>
        </span>
        <span class="empty-card__body">
          <span class="empty-card__title">创建一个空的知识源</span>
          <span class="empty-card__desc">立即创建，进入知识源后再添加文档</span>
        </span>
        <span class="empty-card__action">
          创建 →
        </span>
      </button>
    </section>

    <section class="ks-section">
      <h3 class="ks-section__title">
        上传文件
      </h3>
      <div class="source-cards">
        <button type="button" class="source-card" @click="openLinkDialog('doc')">
          <span class="source-card__badge">推荐</span>
          <span class="source-card__title">海狸在线文档</span>
          <span class="source-card__desc">粘贴在线文档或表格链接，检查通过后加入</span>
        </button>
        <button type="button" class="source-card" @click="openLinkDialog('faq')">
          <span class="source-card__title">Q&amp;A 文档</span>
          <span class="source-card__desc">粘贴问答表格或 FAQ 文档链接，检查通过后加入</span>
        </button>
        <button type="button" class="source-card" @click="openLocalPick">
          <span class="source-card__title">本地上传</span>
          <span class="source-card__desc">支持 docx、xlsx，单个不超过 20MB，可多选</span>
        </button>
      </div>

      <div class="pending">
        <div class="pending__head">
          <span>已选文件</span>
          <span class="pending__count">{{ pending.length }} 个</span>
        </div>
        <el-table
          :data="pending"
          size="small"
          max-height="240"
          empty-text="暂无，先从上方选择数据源"
        >
          <el-table-column prop="title" label="名称" min-width="180" show-overflow-tooltip />
          <el-table-column label="类型" width="96">
            <template #default="{ row }">
              <span class="pending__type">
                <LibraryTypeIcon :type="pendingIconType(row)" :size="16" />
                {{ pendingTypeLabel(row) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="sourceLabel" label="来源" width="130" />
          <el-table-column label="" width="64" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" @click="removePending($index)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <div class="ks-create__actions">
      <el-button :disabled="creating" @click="backToList">
        取消
      </el-button>
      <el-button
        type="primary"
        :disabled="!pending.length"
        :loading="creating"
        @click="createWithDocs"
      >
        创建知识源
      </el-button>
    </div>

    <el-dialog
      v-model="emptyDialogVisible"
      title="创建知识源"
      width="440px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
      @opened="focusEmptyName"
    >
      <div class="empty-dialog">
        <label class="empty-dialog__label" for="ks-empty-name">知识源名称</label>
        <el-input
          id="ks-empty-name"
          ref="emptyNameInputRef"
          v-model="emptyName"
          maxlength="40"
          show-word-limit
          placeholder="输入知识源名称"
          @keyup.enter="confirmEmptyCreate"
        />
      </div>
      <template #footer>
        <el-button :disabled="creatingEmpty" @click="emptyDialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="creatingEmpty"
          :disabled="!emptyName.trim()"
          @click="confirmEmptyCreate"
        >
          创建
        </el-button>
      </template>
    </el-dialog>

    <LinkCheckDialog
      v-model="linkDialogVisible"
      :scene="scene"
      :doc-type="linkDocType"
      @confirm="onLinkConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import type { ElInput } from "element-plus"
import { ArrowLeft, FolderAdd } from "@element-plus/icons-vue"
import { saveKnowledgeSourceApi } from "@/api/knowledgeSource"
import { DEFAULT_KNOWLEDGE_INDEX_CONFIG, type IKnowledgeIndexConfig } from "@/types/api/knowledgeSource"
import LibraryTypeIcon from "./LibraryTypeIcon.vue"
import LinkCheckDialog from "./LinkCheckDialog.vue"
import {
  MAX_PENDING_FILE_BYTES,
  applyPendingDocs,
  pendingErrorMessage,
  pendingIconType,
  pendingTypeLabel,
  type KnowledgeDocType,
  type PendingDocItem
} from "./pending"

const route = useRoute()
const router = useRouter()

const scene = computed(() => String(route.params.scene || ""))

const pending = ref<PendingDocItem[]>([])
const creating = ref(false)
const localInputRef = ref<HTMLInputElement>()
const linkDialogVisible = ref(false)
const linkDocType = ref<KnowledgeDocType>("doc")
const indexConfig = ref<IKnowledgeIndexConfig>({ ...DEFAULT_KNOWLEDGE_INDEX_CONFIG })

/** 「创建一个空的知识源」：先弹窗输入名称，再落库 */
const emptyDialogVisible = ref(false)
const emptyName = ref("")
const creatingEmpty = ref(false)
const emptyNameInputRef = ref<InstanceType<typeof ElInput>>()

function backToList() {
  if (!scene.value) {
    void router.push({ path: "/agent/apps" })
    return
  }
  void router.push({
    path: "/agent/apps/detail",
    query: { scene: scene.value, tab: "knowledge" }
  })
}

function goDetail(knowledgeSourceId: string) {
  void router.replace({
    name: "AgentKnowledgeSourceDetail",
    params: { scene: scene.value, knowledgeSourceId }
  })
}

/** 没有名称输入框：用首条数据的标题兜底，用户可在知识源「设置」里改名 */
function defaultName(): string {
  const first = pending.value[0]?.title?.trim()
  if (first) return first.slice(0, 32)
  return "新建知识源"
}

async function createSource(name: string): Promise<string> {
  const res = await saveKnowledgeSourceApi({ scene: scene.value, name })
  if (res.code !== 0) throw new Error(res.msg || "创建知识源失败")
  const id = res.result?.knowledgeSourceId
  if (!id) throw new Error("创建成功但未返回知识源 ID")
  return id
}

function openEmptyDialog() {
  if (creatingEmpty.value) return
  emptyName.value = ""
  emptyDialogVisible.value = true
}

function focusEmptyName() {
  emptyNameInputRef.value?.focus()
}

async function confirmEmptyCreate() {
  const name = emptyName.value.trim()
  if (!name || creatingEmpty.value || !scene.value) return
  creatingEmpty.value = true
  try {
    const id = await createSource(name)
    emptyDialogVisible.value = false
    ElMessage.success("已创建空知识源")
    goDetail(id)
  } catch (err) {
    ElMessage.error(pendingErrorMessage(err, "创建知识源失败"))
  } finally {
    creatingEmpty.value = false
  }
}

async function createWithDocs() {
  if (!scene.value || creating.value || !pending.value.length) return
  creating.value = true
  try {
    const id = await createSource(defaultName())
    const { count, warnings } = await applyPendingDocs({
      scene: scene.value,
      knowledgeSourceId: id,
      pending: pending.value,
      indexConfig: indexConfig.value
    })
    if (warnings.length) {
      ElMessage.warning(warnings.join("；"))
    } else {
      ElMessage.success(count > 0 ? `已添加 ${count} 个文档` : "知识源已创建")
    }
    goDetail(id)
  } catch (err) {
    ElMessage.error(pendingErrorMessage(err, "创建知识源失败"))
  } finally {
    creating.value = false
  }
}

function openLinkDialog(docType: KnowledgeDocType) {
  linkDocType.value = docType
  linkDialogVisible.value = true
}

function onLinkConfirmed(payload: { docUrl: string; docId: string; title: string }) {
  const docType = linkDocType.value
  const key = `online_${payload.docId || payload.docUrl}`
  if (pending.value.some(item => item.key === key)) {
    ElMessage.info("这条文档已在已选文件里")
    return
  }
  pending.value.push({
    key,
    title: payload.title,
    sourceLabel: docType === "faq" ? "Q&A 文档" : "海狸在线文档",
    kind: "online",
    docType,
    docUrl: payload.docUrl,
    docId: payload.docId
  })
}

function openLocalPick() {
  localInputRef.value?.click()
}

function onLocalInputChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return
  for (const raw of Array.from(files)) {
    const lower = raw.name.toLowerCase()
    if (!lower.endsWith(".docx") && !lower.endsWith(".xlsx")) {
      ElMessage.warning(`${raw.name}：仅支持 docx / xlsx`)
      continue
    }
    if (raw.size > MAX_PENDING_FILE_BYTES) {
      ElMessage.warning(`${raw.name}：文件超过 20MB，暂不支持`)
      continue
    }
    const key = `local_${raw.name}_${raw.size}_${raw.lastModified}`
    if (pending.value.some(item => item.key === key)) continue
    pending.value.push({
      key,
      title: raw.name.replace(/\.(docx|xlsx)$/i, ""),
      sourceLabel: "本地上传",
      kind: "local",
      file: raw
    })
  }
  input.value = ""
}

function removePending(index: number) {
  pending.value.splice(index, 1)
}
</script>

<style scoped lang="less">
.ks-create {
  max-width: 1040px;
  padding: 4px 8px 32px;
  margin: 0 auto;

  &__file-input {
    display: none;
  }

  &__bar {
    margin-bottom: 12px;
  }

  &__back {
    padding-left: 0;
    font-size: 14px;
  }

  &__head {
    margin-bottom: 24px;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__desc {
    margin: 8px 0 0;
    max-width: 760px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }

  &__actions {
    display: flex;
    gap: 12px;
    margin-top: 28px;
  }
}

.ks-section {
  margin-bottom: 28px;

  &__title {
    margin: 0 0 14px;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.empty-card {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 18px 20px;
  text-align: left;
  border: 1px dashed var(--el-border-color);
  border-radius: 10px;
  background: var(--el-fill-color-blank);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:hover:not(:disabled) {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    font-size: 20px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__desc {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__action {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--el-color-primary);
  }
}

.source-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 860px) {
  .source-cards {
    grid-template-columns: 1fr;
  }
}

.source-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-height: 108px;
  padding: 18px 16px;
  text-align: left;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 16px rgb(0 0 0 / 6%);
  }

  &__badge {
    position: absolute;
    top: 0;
    right: 0;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 500;
    color: #fff;
    background: linear-gradient(135deg, #409eff, #66b1ff);
    border-radius: 0 10px 0 8px;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__desc {
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }
}

.pending {
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
  }

  &__count {
    font-size: 13px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }

  &__type {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
  }
}

.empty-dialog {
  &__label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }
}
</style>
