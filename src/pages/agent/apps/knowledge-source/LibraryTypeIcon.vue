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

  知识源文档类型图标：word / excel / faq，内联 SVG，无外部资源依赖。
  对齐 cloud-console 的 LibraryTypeIcon 视觉语义，但保持本仓库零新增静态资源。
-->

<template>
  <span
    class="lib-type-icon"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="img"
    :aria-label="`${type} 文档`"
  >
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <path
        d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
        :fill="palette.bg"
        :stroke="palette.fill"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
      <path
        d="M14 2v5h5"
        :fill="palette.bg"
        :stroke="palette.fill"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
      <text
        x="12"
        y="17.5"
        text-anchor="middle"
        :fill="palette.fill"
        font-size="9"
        font-weight="700"
      >
        {{ palette.mark }}
      </text>
    </svg>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue"

type IconType = "word" | "excel" | "faq"

const props = withDefaults(
  defineProps<{
    type?: IconType
    size?: number
  }>(),
  { type: "word", size: 22 }
)

const palette = computed(() => {
  if (props.type === "excel") return { fill: "#2f855a", bg: "#e6f4ea", mark: "X" }
  if (props.type === "faq") return { fill: "#c05621", bg: "#fff3e6", mark: "?" }
  return { fill: "#2b6cb0", bg: "#e8f1fb", mark: "W" }
})
</script>

<style scoped lang="less">
.lib-type-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
</style>
