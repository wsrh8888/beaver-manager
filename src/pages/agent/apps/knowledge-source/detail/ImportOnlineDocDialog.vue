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

  导入在线文档：用户把海狸内部的在线文档地址（URL 或裸 docId，可多个，每行一个）粘贴进来，
  后端解析出 doc_id 并校验当前用户可见，再建立引用；正文与索引由平台侧异步拉取。
  这里只负责「认出地址 + 提交」，不搬运任何正文。
-->

<template>
  <el-dialog
    :model-value="modelValue"
    title="导入在线文档"
    width="560px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:modelValue', $event)"
    @closed="reset"
  >
    <div class="import-doc">
      <p class="import-doc__tip">
        粘贴海狸内部的在线文档地址，每行一个。支持完整链接或裸文档 ID；
        导入后平台会按你的账号权限校验可见性并自动拉取、索引源文档。
      </p>
      <el-input
        v-model="raw"
        type="textarea"
        :rows="6"
        placeholder="https://doc.beaver.im/d/doc_xxx&#10;https://doc.beaver.im/#/doc/doc_yyy"
        :disabled="importing"
      />
      <p v-if="error" class="import-doc__error">{{ error }}</p>

      <div v-if="result" class="import-doc__result">
        <el-alert
          :title="result.imported > 0 ? `成功导入 ${result.imported} 个文档引用` : '没有成功导入'"
          :type="result.imported > 0 ? 'success' : 'warning'"
          :description="result.notice || undefined"
          show-icon
          :closable="false"
        />
        <div v-if="result.failed && result.failed.length" class="import-doc__failed">
          <p class="import-doc__failed-title">以下地址解析或鉴权失败：</p>
          <ul>
            <li v-for="(url, idx) in result.failed" :key="idx">{{ url }}</li>
          </ul>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button :disabled="importing" @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="importing" :disabled="!raw.trim()" @click="runImport">
        导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue"
import { ElMessage } from "element-plus"
import { importKnowledgeSourceDocApi } from "@/api/knowledgeSource"
import type { IImportKnowledgeSourceDocRes } from "@/types/api/knowledgeSource"

export default defineComponent({
  name: "ImportOnlineDocDialog",
  props: {
    modelValue: { type: Boolean, default: false },
    scene: { type: String, required: true },
    knowledgeSourceId: { type: String, required: true }
  },
  emits: ["update:modelValue", "done"],
  setup(props, { emit }) {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    const raw = ref("")
    const importing = ref(false)
    const error = ref("")
    const result = ref<IImportKnowledgeSourceDocRes | null>(null)

    const reset = () => {
      raw.value = ""
      importing.value = false
      error.value = ""
      result.value = null
    }

    const runImport = async () => {
      const urls = raw.value
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
      if (!urls.length) {
        error.value = "请至少填写一个在线文档地址"
        return
      }
      importing.value = true
      error.value = ""
      result.value = null
      try {
        const res = await importKnowledgeSourceDocApi({
          scene: props.scene,
          knowledgeSourceId: props.knowledgeSourceId,
          docUrls: urls
        })
        if (res.code !== 0) throw new Error(res.msg || "导入失败")
        result.value = res.result ?? null
        if ((res.result?.imported ?? 0) > 0) {
          ElMessage.success(`已导入 ${res.result?.imported} 个文档引用`)
          emit("done")
        }
      } catch (err) {
        error.value = errorMessage(err, "导入失败")
      } finally {
        importing.value = false
      }
    }
    return {
      emit, raw, importing, error, result, reset, runImport, ref, ElMessage,
      importKnowledgeSourceDocApi
    }
  }
})
</script>

<style scoped lang="less">
.import-doc {
  &__tip {
    margin: 0 0 10px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }

  &__error {
    margin: 8px 0 0;
    font-size: 13px;
    color: var(--el-color-danger);
  }

  &__result {
    margin-top: 14px;
  }

  &__failed {
    margin-top: 10px;
    padding: 10px 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-fill-color-lighter);

    &-title {
      margin: 0 0 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    ul {
      margin: 0;
      padding-left: 18px;
      max-height: 140px;
      overflow: auto;
    }

    li {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      word-break: break-all;
    }
  }
}
</style>
