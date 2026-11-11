<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  分区卡片：标题 + 说明 + 内容 + 可选 footer，宽度吃满容器。
  与控制台（beaver-open）的 FormCard 保持同一套结构与间距，配色改用 element-plus 变量。
-->

<template>
  <section class="ds-form-card" :class="{ 'ds-form-card--danger': danger }">
    <header class="ds-form-card__head">
      <div class="ds-form-card__head-text">
        <h2 class="ds-form-card__title">{{ title }}</h2>
        <p v-if="desc" class="ds-form-card__desc">{{ desc }}</p>
      </div>
      <div v-if="$slots.extra" class="ds-form-card__extra">
        <slot name="extra" />
      </div>
    </header>

    <div class="ds-form-card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="ds-form-card__foot">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script lang="ts">
export default defineComponent({
  name: "FormCard",
  props: {
    title: { type: String, required: true },
    desc: { type: String },
    danger: { type: Boolean }
  }
})
</script>

<style lang="less" scoped>
.ds-form-card {
  width: 100%;
  margin-bottom: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;

  &--danger {
    border-color: var(--el-color-danger-light-5);
  }
}

.ds-form-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.ds-form-card__head-text {
  min-width: 0;
}

.ds-form-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.ds-form-card__desc {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--el-text-color-secondary);
}

.ds-form-card__extra {
  flex: 0 0 auto;
}

.ds-form-card__body {
  padding: 20px;
}

.ds-form-card__foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--el-border-color-extra-light);
  background: var(--el-fill-color-lighter);
  border-radius: 0 0 12px 12px;
}

@media (max-width: 767px) {
  .ds-form-card__head,
  .ds-form-card__body,
  .ds-form-card__foot {
    padding-left: 14px;
    padding-right: 14px;
  }

  .ds-form-card__foot {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>
