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

  知识源详情：左侧「文档 / 召回测试 / 设置」三分区，版式对齐 cloud-console 的 KsDetailView。
  文档来源是用户粘贴的海狸内部在线文档地址：后端解析 + 鉴权后建立引用，
  文档正文与索引由 platform 侧异步拉取，所以「文档」分区只做引用管理（导入 / 移除），
  不搬运也不删除在线文档本体。
-->

<template>
  <div class="ks-detail">
    <div class="toolbar">
      <el-button link type="primary" @click="emit('back')">
        ← 全部知识源
      </el-button>
      <span class="toolbar__title">{{ source.name }}</span>
    </div>

    <div class="ks-layout">
      <nav class="ks-nav">
        <button
          v-for="tab in navTabs"
          :key="tab.key"
          type="button"
          class="ks-nav__item"
          :class="{ 'ks-nav__item--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="ks-panel">
        <KsDocumentsPanel
          v-if="activeTab === 'documents'"
          :scene="scene"
          :source="source"
          @refresh="emit('refresh')"
          @add-file="emit('add-file')"
        />
        <KsRetrievePanel
          v-else-if="activeTab === 'retrieve'"
          :scene="scene"
          :source="source"
          @refresh="emit('refresh')"
        />
        <KsSettingsPanel
          v-else
          :scene="scene"
          :source="source"
          @refresh="emit('refresh')"
          @deleted="emit('deleted')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { ref, defineComponent, toRefs } from "vue"
import type { IKnowledgeSourceItem } from "@/types/api/knowledgeSource"
import KsDocumentsPanel from "./KsDocumentsPanel.vue"
import KsRetrievePanel from "./KsRetrievePanel.vue"
import KsSettingsPanel from "./KsSettingsPanel.vue"

type TabKey = "documents" | "retrieve" | "settings"

export default defineComponent({
  name: "KsDetailView",
  components: { KsDocumentsPanel, KsRetrievePanel, KsSettingsPanel },
  props: {
    scene: { type: String, required: true },
    source: { type: Object as PropType<IKnowledgeSourceItem>, required: true }
  },
  emits: ["back", "refresh", "deleted", "add-file"],
  setup(props, { emit }) {
    const navTabs: { key: TabKey; label: string }[] = [
      { key: "documents", label: "文档" },
      { key: "retrieve", label: "召回测试" },
      { key: "settings", label: "设置" }
    ]
    const activeTab = ref<TabKey>("documents")
    return {
      ...toRefs(props), props, emit, navTabs, activeTab, ref, KsDocumentsPanel,
      KsRetrievePanel, KsSettingsPanel
    }
  }
})
</script>

<style scoped lang="less">
.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;

  &__title {
    font-weight: 600;
    margin-right: 8px;
    color: var(--el-text-color-primary);
  }
}

.ks-layout {
  display: flex;
  gap: 0;
  min-height: 420px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.ks-nav {
  width: 132px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  background: var(--el-fill-color-lighter);
  border-right: 1px solid var(--el-border-color-lighter);

  &__item {
    border: none;
    background: transparent;
    text-align: left;
    padding: 10px 16px;
    font-size: 14px;
    cursor: pointer;
    color: var(--el-text-color-regular);

    &--active {
      background: var(--el-bg-color);
      color: var(--el-color-primary);
      font-weight: 500;
    }
  }
}

.ks-panel {
  flex: 1;
  min-width: 0;
  padding: 16px;
}
</style>
