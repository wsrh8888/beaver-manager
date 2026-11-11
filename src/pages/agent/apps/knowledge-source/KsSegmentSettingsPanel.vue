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

  文本分段与清洗：添加文件向导第二步 / 单文档分段设置共用。
  结构对齐 cloud-console 的 KsSegmentSettingsPanel，图标改为内联 SVG 以免引入静态资源。
-->

<template>
  <div class="ks-segment-step">
    <section class="ks-segment-block">
      <h3 class="ks-segment-block__title">
        分段设置
      </h3>
      <div class="option-cards option-cards--2">
        <button
          type="button"
          class="option-card"
          :class="{ 'option-card--active': localConfig.segmentMode === 'auto' }"
          @click="setSegmentMode('auto')"
        >
          <span class="option-card__badge">推荐</span>
          <svg class="option-card__icon option-card__icon--spark" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
            <path d="M18.5 16.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3z" fill="currentColor" />
          </svg>
          <span class="option-card__head">
            <span class="option-card__radio" :class="{ 'option-card__radio--on': localConfig.segmentMode === 'auto' }" />
            <span class="option-card__name">自动分段与清洗</span>
          </span>
          <span class="option-card__desc">自动设置分段规则与预处理规则，不了解参数时建议选此项</span>
        </button>
        <button
          type="button"
          class="option-card"
          :class="{ 'option-card--active': localConfig.segmentMode === 'custom' }"
          @click="setSegmentMode('custom')"
        >
          <svg class="option-card__icon option-card__icon--sliders" viewBox="0 0 24 24" aria-hidden="true">
            <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
              <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="8" cy="17" r="2" />
            </g>
          </svg>
          <span class="option-card__head">
            <span class="option-card__radio" :class="{ 'option-card__radio--on': localConfig.segmentMode === 'custom' }" />
            <span class="option-card__name">自定义</span>
          </span>
          <span class="option-card__desc">自定义分段规则、分段长度以及预处理规则等参数</span>
        </button>
      </div>
      <div v-if="localConfig.segmentMode === 'custom'" class="ks-segment-custom">
        <el-form label-width="96px" size="default">
          <el-form-item label="最大段长">
            <el-input-number v-model="localConfig.maxSegmentLength" :min="100" :max="4000" />
          </el-form-item>
          <el-form-item label="重叠长度">
            <el-input-number v-model="localConfig.overlapLength" :min="0" :max="500" />
          </el-form-item>
          <el-form-item label="文本清洗">
            <el-checkbox v-model="localConfig.removeExtraSpaces">
              合并多余空白
            </el-checkbox>
            <el-checkbox v-model="localConfig.removeUrls">
              移除 URL
            </el-checkbox>
            <el-checkbox v-model="localConfig.removeEmails">
              移除邮箱
            </el-checkbox>
          </el-form-item>
        </el-form>
      </div>
    </section>

    <section class="ks-segment-block">
      <h3 class="ks-segment-block__title">
        检索设置
      </h3>
      <div class="option-cards option-cards--1">
        <button
          type="button"
          class="option-card option-card--active"
          @click="localConfig.retrievalMode = 'auto'"
        >
          <svg class="option-card__icon option-card__icon--spark" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
          </svg>
          <span class="option-card__head">
            <span class="option-card__radio option-card__radio--on" />
            <span class="option-card__name">默认检索方式</span>
          </span>
          <span class="option-card__desc">根据文档内容，系统自动选择最佳的检索方式进行检索</span>
        </button>
      </div>
    </section>

    <section v-if="showPreprocess" class="ks-segment-block">
      <h3 class="ks-segment-block__title">
        预处理文档
      </h3>
      <div v-if="preprocessDocs.length" class="pre-doc-list">
        <div v-for="item in preprocessDocs" :key="item.key" class="pre-doc-card">
          <LibraryTypeIcon :type="item.iconType" :size="22" />
          <span class="pre-doc-card__title" :title="item.title">{{ item.title }}</span>
        </div>
      </div>
      <el-empty v-else description="暂无待处理文档" :image-size="48" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import type { IKnowledgeIndexConfig } from "@/types/api/knowledgeSource"
import LibraryTypeIcon from "./LibraryTypeIcon.vue"

interface PreprocessDocItem {
  key: string
  title: string
  iconType: "word" | "excel" | "faq"
}

const props = withDefaults(
  defineProps<{
    indexConfig: IKnowledgeIndexConfig
    preprocessDocs?: PreprocessDocItem[]
    showPreprocess?: boolean
  }>(),
  { preprocessDocs: () => [], showPreprocess: true }
)

const emit = defineEmits<{
  (e: "update:indexConfig", value: IKnowledgeIndexConfig): void
}>()

const localConfig = ref<IKnowledgeIndexConfig>({ ...props.indexConfig })

watch(
  () => props.indexConfig,
  value => {
    localConfig.value = { ...value }
  },
  { deep: true }
)

watch(
  localConfig,
  value => {
    emit("update:indexConfig", { ...value })
  },
  { deep: true }
)

function setSegmentMode(mode: "auto" | "custom") {
  localConfig.value = { ...localConfig.value, segmentMode: mode }
}
</script>

<style scoped lang="less">
.ks-segment-step {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.ks-segment-block__title {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.ks-segment-custom {
  margin-top: 16px;
  padding: 16px 16px 4px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}

.option-cards {
  display: grid;
  gap: 16px;

  &--2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &--1 {
    grid-template-columns: minmax(0, 1fr);
    max-width: 520px;
  }
}

@media (max-width: 720px) {
  .option-cards--2 {
    grid-template-columns: 1fr;
  }
}

.option-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-height: 120px;
  padding: 16px 16px 14px 44px;
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
  }

  &--active {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px var(--el-color-primary-light-7);
  }

  &__badge {
    position: absolute;
    top: 0;
    right: 0;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 500;
    color: #fff;
    background: linear-gradient(135deg, #e6a23c, #f0c78a);
    border-radius: 0 10px 0 8px;
  }

  &__icon {
    position: absolute;
    left: 14px;
    top: 16px;
    width: 22px;
    height: 22px;
    object-fit: contain;
    opacity: 0.92;
    pointer-events: none;
    color: var(--el-color-primary);
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  &__radio {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border: 2px solid var(--el-border-color);
    border-radius: 50%;

    &--on {
      border-color: var(--el-color-primary);
      box-shadow: inset 0 0 0 4px var(--el-color-primary);
    }
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__desc {
    font-size: 13px;
    line-height: 1.55;
    color: var(--el-text-color-secondary);
  }
}

.pre-doc-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pre-doc-card {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 280px;
  padding: 10px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);

  &__title {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
