<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  标签输入：回车即加一项，也支持粘贴「a, b c」一次拆成多项并去重。
  用于开场问题、下拉变量选项这类字符串列表，省掉「加一行再删一行」的表格。
-->

<template>
  <div>
    <el-select
      :model-value="modelValue"
      multiple
      filterable
      allow-create
      default-first-option
      :reserve-keyword="false"
      :placeholder="placeholder || '输入内容后按回车添加'"
      class="id-tags__select"
      @update:model-value="update"
    />
    <p v-if="hint" class="id-tags__hint">{{ hint }}</p>
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"

export default defineComponent({
  name: "IdTagsEditor",
  props: {
    modelValue: { type: Array as PropType<string[]>, required: true },
    placeholder: { type: String },
    hint: { type: String }
  },
  emits: ["update:modelValue"],
  setup(_, { emit }) {
    // 支持一次粘贴 "a, b，c"：拆成多项并去重，避免用户手工敲分隔符。
    const update = (value: string[]) => {
      const parts = value
        .flatMap(item => String(item).split(/[,，\s]+/))
        .map(item => item.trim())
        .filter(Boolean)
      emit("update:modelValue", Array.from(new Set(parts)))
    }
    return { update }
  }
})
</script>

<style lang="less" scoped>
.id-tags__select {
  width: 100%;
}

.id-tags__hint {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}
</style>
