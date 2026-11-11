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

  选择数据源弹窗：输入海狸在线文档 / 表格链接，先「检查链接」，
  后端解析 doc_id 并校验当前用户可见，检查通过后「确认」才把这一条加入待导入列表。
  只校验不建引用；真正的导入发生在添加文件向导最后一步统一提交。
-->

<template>
  <el-dialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="560px"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @closed="reset"
  >
    <div class="link-check">
      <p class="link-check__tip">{{ tipText }}</p>
      <el-input
        v-model="raw"
        type="textarea"
        :rows="4"
        :placeholder="placeholder"
        :disabled="checking"
      />

      <div class="link-check__check-row">
        <el-button
          type="primary"
          plain
          :loading="checking"
          :disabled="!raw.trim()"
          @click="runCheck"
        >
          检查链接
        </el-button>
        <span v-if="!result && checkedRaw" class="link-check__expire">链接已修改，请重新检查</span>
      </div>

      <div v-if="result" class="link-check__result">
        <el-alert
          v-if="result.valid"
          type="success"
          show-icon
          :closable="false"
          :title="`检查通过：${result.title || result.docId}`"
          :description="`文档 ID：${result.docId}　确认后将加入待导入列表。`"
        />
        <el-alert
          v-else
          type="error"
          show-icon
          :closable="false"
          title="链接不可用"
          :description="result.msg || '无法解析文档 ID，或当前账号无权访问该文档'"
        />
      </div>
    </div>

    <template #footer>
      <el-button :disabled="checking" @click="emit('update:modelValue', false)">
        取消
      </el-button>
      <el-button
        type="primary"
        :disabled="!canConfirm"
        @click="confirm"
      >
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { ElMessage } from "element-plus"
import { checkKnowledgeSourceDocApi } from "@/api/knowledgeSource"
import type { ICheckKnowledgeSourceDocRes } from "@/types/api/knowledgeSource"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    scene: string
    /** doc=海狸在线文档 / faq=Q&A 文档 */
    docType?: "doc" | "faq"
  }>(),
  { docType: "doc" }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "confirm", payload: { docUrl: string; docId: string; title: string }): void
}>()

const dialogTitle = computed(() =>
  props.docType === "faq" ? "添加 Q&A 文档" : "添加海狸在线文档"
)
const tipText = computed(() =>
  props.docType === "faq"
    ? "粘贴海狸在线表格或问答文档链接，系统会校验链接并识别文档。检查通过后才能确认加入。"
    : "粘贴海狸在线文档或表格链接，系统会校验链接并识别文档。检查通过后才能确认加入。"
)
const placeholder = computed(() =>
  props.docType === "faq"
    ? "https://doc.beaver.im/sheet/xxx 或裸文档 ID"
    : "https://doc.beaver.im/d/xxx 或裸文档 ID"
)

const raw = ref("")
const checking = ref(false)
const result = ref<ICheckKnowledgeSourceDocRes | null>(null)
/** 记录已检查过的原始输入；一旦用户改动就作废检查结果，必须重新检查 */
const checkedRaw = ref("")

const canConfirm = computed(() => Boolean(result.value?.valid) && raw.value.trim() === checkedRaw.value)

watch(raw, value => {
  if (!result.value) return
  if (value.trim() !== checkedRaw.value) result.value = null
})

function reset() {
  raw.value = ""
  checking.value = false
  result.value = null
  checkedRaw.value = ""
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === "object" && "msg" in err) {
    return String((err as { msg?: string }).msg || fallback)
  }
  return fallback
}

async function runCheck() {
  const docUrl = raw.value.trim()
  if (!docUrl) return
  checking.value = true
  result.value = null
  try {
    const res = await checkKnowledgeSourceDocApi({
      scene: props.scene,
      docUrl
    })
    if (res.code !== 0) throw new Error(res.msg || "检查失败")
    result.value = res.result ?? null
    checkedRaw.value = docUrl
  } catch (err) {
    result.value = { valid: false, msg: errorMessage(err, "检查失败") }
    checkedRaw.value = docUrl
  } finally {
    checking.value = false
  }
}

function confirm() {
  if (!canConfirm.value || !result.value?.valid) return
  emit("confirm", {
    docUrl: checkedRaw.value,
    docId: result.value.docId || "",
    title: result.value.title || result.value.docId || "在线文档"
  })
  ElMessage.success("检查通过，已加入待导入列表")
  emit("update:modelValue", false)
}
</script>

<style scoped lang="less">
.link-check {
  &__tip {
    margin: 0 0 10px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }

  &__check-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
  }

  &__expire {
    font-size: 12px;
    color: var(--el-color-warning);
  }

  &__result {
    margin-top: 14px;
  }
}
</style>
