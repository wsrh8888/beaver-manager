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

  知识源「设置」分区。只暴露后端真实生效的字段（名称 / 检索条数）；
  在线文档在「文档」分区通过粘贴海狸内部地址导入，文档正文与索引由平台侧异步拉取，
  因此这里不放一个改了也不生效的文档表单。
-->

<template>
  <el-form label-width="120px" size="default" class="settings-form">
    <el-divider content-position="left">知识源</el-divider>

    <el-form-item label="名称">
      <el-input v-model="name" maxlength="50" placeholder="知识源名称" />
    </el-form-item>
    <el-form-item label="检索条数">
      <el-input-number v-model="topK" :min="1" :max="50" controls-position="right" />
      <span class="settings-form__hint">检索时从该知识源集合里返回的最多片段数</span>
    </el-form-item>
    <el-form-item label="文档来源">
      <span class="settings-form__hint">在线文档在「文档」分区通过粘贴海狸内部地址导入，平台会自动拉取并索引，无需搬运。</span>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="saving" @click="save">保存</el-button>
    </el-form-item>

    <el-divider content-position="left">危险操作</el-divider>
    <el-form-item label="删除知识源">
      <div>
        <p class="settings-form__hint">只删除这个知识源与它的引用，被引入的知识库本身不受影响。</p>
        <el-button type="danger" plain :loading="deleting" @click="remove">删除知识源</el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { ref, watch, defineComponent, toRefs } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { deleteKnowledgeSourceApi, saveKnowledgeSourceApi } from "@/api/knowledgeSource"
import type { IKnowledgeSourceItem } from "@/types/api/knowledgeSource"

export default defineComponent({
  name: "KsSettingsPanel",
  props: {
    scene: { type: String, required: true },
    source: { type: Object as PropType<IKnowledgeSourceItem>, required: true }
  },
  emits: ["refresh", "deleted"],
  setup(props, { emit }) {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    const name = ref(props.source.name)
    const topK = ref(props.source.retrievalTopK || 8)
    const saving = ref(false)
    const deleting = ref(false)

    watch(() => [props.source.name, props.source.retrievalTopK], () => {
      name.value = props.source.name
      topK.value = props.source.retrievalTopK || 8
    })

    const save = async () => {
      const value = name.value.trim()
      if (!value) {
        ElMessage.warning("名称不能为空")
        return
      }
      saving.value = true
      try {
        const res = await saveKnowledgeSourceApi({
          scene: props.scene,
          knowledgeSourceId: props.source.knowledgeSourceId,
          name: value,
          retrievalTopK: topK.value
        })
        if (res.code !== 0) throw new Error(res.msg || "保存失败")
        ElMessage.success("已保存")
        emit("refresh")
      } catch (err) {
        ElMessage.error(errorMessage(err, "保存失败"))
      } finally {
        saving.value = false
      }
    }

    const remove = async () => {
      try {
        await ElMessageBox.confirm(
          `删除「${props.source.name}」后，它引入的在线文档引用会一并移除；在线文档本体不受影响。`,
          "删除知识源",
          { type: "warning" }
        )
      } catch {
        return
      }
      deleting.value = true
      try {
        const res = await deleteKnowledgeSourceApi({
          scene: props.scene,
          knowledgeSourceId: props.source.knowledgeSourceId
        })
        if (res.code !== 0) throw new Error(res.msg || "删除失败")
        ElMessage.success("知识源已删除")
        emit("deleted")
      } catch (err) {
        ElMessage.error(errorMessage(err, "删除失败"))
      } finally {
        deleting.value = false
      }
    }

    return {
      ...toRefs(props), props, emit, errorMessage, name, topK, saving, deleting, save,
      remove, ref, watch, ElMessage, ElMessageBox,
      deleteKnowledgeSourceApi, saveKnowledgeSourceApi
    }
  }
})
</script>

<style scoped lang="less">
.settings-form {
  max-width: 620px;

  &__value {
    margin-right: 12px;
    color: var(--el-text-color-primary);
  }

  &__hint {
    margin: 0 0 8px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }
}
</style>
