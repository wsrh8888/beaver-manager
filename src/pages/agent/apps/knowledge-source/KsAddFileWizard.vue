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

  知识源 · 添加文件：选择数据源 → 文本分段与清洗 → 处理并完成。
  结构对齐 cloud-console 的 KsAddFileWizard；差异在于「在线文档 / Q&A 文档」
  走输入链接 + 后端检查（LinkCheckDialog），而不是从在线文档库勾选。
  本地 docx/xlsx 由后端标准库解析正文后建 file 文档，前端只做 base64 搬运。
-->

<template>
  <div class="ks-add-file">
    <input
      ref="localInputRef"
      type="file"
      class="ks-add-file__file-input"
      accept=".docx,.xlsx"
      multiple
      @change="onLocalInputChange"
    >

    <nav class="flow-steps" aria-label="步骤">
      <template v-for="(label, index) in stepLabels" :key="label">
        <div
          class="flow-steps__step"
          :class="{
            'flow-steps__step--current': step === index,
            'flow-steps__step--done': step > index
          }"
        >
          <span v-if="step === index" class="flow-steps__tag">STEP {{ index + 1 }}</span>
          <span v-else class="flow-steps__num">{{ index + 1 }}</span>
          <span class="flow-steps__label">{{ label }}</span>
        </div>
        <div
          v-if="index < stepLabels.length - 1"
          class="flow-steps__line"
          :class="{ 'flow-steps__line--past': step > index }"
        />
      </template>
    </nav>

    <div v-if="step === 0" class="ks-add-file__body">
      <h2 class="ks-add-file__section-title">
        选择数据源
      </h2>
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
          <span class="source-card__title">本地文件上传</span>
          <span class="source-card__desc">支持 docx、xlsx，单个不超过 20MB，可多选</span>
        </button>
      </div>

      <div class="pending-block">
        <div class="pending-block__head">
          <span>已选文件</span>
          <span class="pending-block__count">{{ pending.length }} 个</span>
        </div>
        <el-table :data="pending" size="small" max-height="220" empty-text="暂无，先从上方选择数据源">
          <el-table-column prop="title" label="名称" min-width="160" show-overflow-tooltip />
          <el-table-column label="类型" width="92">
            <template #default="{ row }">
              <span class="pending-type">
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
    </div>

    <div v-else-if="step === 1" class="ks-add-file__body">
      <KsSegmentSettingsPanel
        :index-config="indexConfig"
        :preprocess-docs="preprocessDocs"
        @update:index-config="onIndexConfigUpdate"
      />
    </div>

    <div v-else class="ks-add-file__body ks-add-file__done">
      <el-result
        icon="success"
        title="已提交"
        :sub-title="`已添加 ${addedCount} 个文档，索引处理中`"
      />
    </div>

    <div class="ks-add-file__actions">
      <el-button v-if="step === 1" @click="step = 0">
        上一步
      </el-button>
      <el-button v-if="step === 2" type="primary" @click="close">
        返回文档列表
      </el-button>
      <el-button
        v-if="step === 0"
        type="primary"
        :disabled="!pending.length"
        @click="step = 1"
      >
        下一步
      </el-button>
      <el-button
        v-else-if="step === 1"
        type="primary"
        plain
        :loading="submitting"
        @click="submit"
      >
        保存并处理
      </el-button>
    </div>

    <LinkCheckDialog
      v-model="linkDialogVisible"
      :scene="scene"
      :doc-type="linkDocType"
      @confirm="onLinkConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { ElMessage } from "element-plus"
import type { IKnowledgeIndexConfig } from "@/types/api/knowledgeSource"
import KsSegmentSettingsPanel from "./KsSegmentSettingsPanel.vue"
import LinkCheckDialog from "./LinkCheckDialog.vue"
import LibraryTypeIcon from "./LibraryTypeIcon.vue"
import {
  MAX_PENDING_FILE_BYTES,
  applyPendingDocs,
  pendingIconType,
  pendingTypeLabel,
  type KnowledgeDocType,
  type PendingDocItem
} from "./pending"

const props = defineProps<{
  scene: string
  knowledgeSourceId: string
  indexConfigSeed: IKnowledgeIndexConfig
}>()

const emit = defineEmits<{
  (e: "cancel"): void
  (e: "done"): void
}>()

const stepLabels = ["选择数据源", "文本分段与清洗", "处理并完成"]
const step = ref(0)
const pending = ref<PendingDocItem[]>([])
const indexConfig = ref<IKnowledgeIndexConfig>({ ...props.indexConfigSeed })
const submitting = ref(false)
const addedCount = ref(0)

const localInputRef = ref<HTMLInputElement>()
const linkDialogVisible = ref(false)
const linkDocType = ref<KnowledgeDocType>("doc")

watch(
  () => props.indexConfigSeed,
  seed => {
    indexConfig.value = { ...seed }
  },
  { deep: true }
)

function resetAll() {
  step.value = 0
  pending.value = []
  indexConfig.value = { ...props.indexConfigSeed }
  addedCount.value = 0
  linkDialogVisible.value = false
  linkDocType.value = "doc"
}

function close() {
  resetAll()
  emit("cancel")
}

function openLinkDialog(docType: KnowledgeDocType) {
  linkDocType.value = docType
  linkDialogVisible.value = true
}

function onLinkConfirmed(payload: { docUrl: string; docId: string; title: string }) {
  const docType = linkDocType.value
  const key = `online_${payload.docId || payload.docUrl}`
  if (pending.value.some(p => p.key === key)) {
    ElMessage.info("这条文档已在待导入列表")
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
    if (pending.value.some(p => p.key === key)) continue
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

const preprocessDocs = computed(() =>
  pending.value.map(p => ({
    key: p.key,
    title: p.title,
    iconType: pendingIconType(p)
  }))
)

function onIndexConfigUpdate(value: IKnowledgeIndexConfig) {
  indexConfig.value = value
}

async function submit() {
  if (!pending.value.length) return
  submitting.value = true
  try {
    const { count, warnings } = await applyPendingDocs({
      scene: props.scene,
      knowledgeSourceId: props.knowledgeSourceId,
      pending: pending.value,
      indexConfig: indexConfig.value
    })

    addedCount.value = count
    step.value = 2
    emit("done")
    if (warnings.length) {
      ElMessage.warning(warnings.join("；"))
    } else if (count > 0) {
      ElMessage.success(`已添加 ${count} 个文档`)
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  indexConfig.value = {
    ...props.indexConfigSeed,
    retrievalMode: props.indexConfigSeed.retrievalMode || "auto"
  }
})
</script>

<style scoped lang="less">
.ks-add-file {
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 12px;
}

.ks-add-file__file-input {
  display: none;
}

.flow-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0;
  margin: 4px 0 32px;
  padding: 0 8px;

  &__step {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 10px;
    border-radius: 11px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: #fff;
    background: var(--el-color-primary);
  }

  &__num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: 1px solid var(--el-border-color);
    border-radius: 50%;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    color: var(--el-text-color-placeholder);
    background: var(--el-bg-color);
  }

  &__label {
    font-size: 14px;
    color: var(--el-text-color-placeholder);
  }

  &__step--current .flow-steps__label {
    font-weight: 500;
    color: var(--el-color-primary);
  }

  &__step--done .flow-steps__num {
    border-color: var(--el-color-primary-light-5);
    color: var(--el-color-primary);
  }

  &__step--done .flow-steps__label {
    color: var(--el-text-color-regular);
  }

  &__line {
    flex-shrink: 0;
    width: 56px;
    height: 1px;
    margin: 0 16px;
    background: var(--el-border-color-lighter);

    &--past {
      background: var(--el-color-primary-light-7);
    }
  }
}

.ks-add-file__section-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.ks-add-file__actions {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 28px;
  padding-top: 0;
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
  min-height: 112px;
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

.pending-block {
  margin-top: 8px;
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
    font-weight: 400;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.pending-type {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.ks-add-file__done {
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
