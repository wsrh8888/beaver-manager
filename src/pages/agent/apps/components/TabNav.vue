<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  详情分区导航（下划线样式），与控制台（beaver-open）的 TabNav 一致。
  禁用态用于「当前编排方式不支持该分区」的场景。
-->

<template>
  <nav class="ds-tabbar" aria-label="详情分区">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="ds-tabbar__item"
      :class="{ 'is-active': tab.key === active, 'is-disabled': isDisabled(tab.key) }"
      :disabled="isDisabled(tab.key)"
      :aria-current="tab.key === active ? 'page' : undefined"
      :title="isDisabled(tab.key) ? '当前编排方式不支持此分区' : undefined"
      @click="!isDisabled(tab.key) && emit('select', tab.key)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>

<script lang="ts">
import type { PropType } from "vue"

interface ConsoleTab {
  key: string
  label: string
}

export default defineComponent({
  name: "TabNav",
  props: {
    tabs: { type: Array as PropType<ConsoleTab[]>, required: true },
    active: { type: String, required: true },
    disabled: { type: Array as PropType<string[]> }
  },
  emits: ["select"],
  setup(props, { emit }) {
    const disabled = computed(() => props.disabled ?? [])
    const isDisabled = (key: string) => disabled.value.includes(key)
    return { emit, isDisabled }
  }
})
</script>

<style lang="less" scoped>
.ds-tabbar {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 44px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.ds-tabbar__item {
  position: relative;
  flex: 0 0 auto;
  height: 44px;
  padding: 0 2px;
  border: 0;
  background: transparent;
  color: var(--el-text-color-regular);
  font-family: inherit;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: var(--el-text-color-primary);
  }

  &.is-disabled {
    color: var(--el-text-color-disabled);
    cursor: not-allowed;
    pointer-events: none;
  }

  &.is-active {
    color: var(--el-color-primary);
    font-weight: 500;

    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;
      height: 2px;
      background: var(--el-color-primary);
    }
  }
}
</style>
