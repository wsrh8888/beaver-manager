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

  知识源「召回测试」分区：对这个知识源集合（用户粘贴的在线文档引用）做一次真实检索，
  后端按相关度统一排序截断，结果与运行时扁平 knowledgeIds 的检索口径一致。
-->

<template>
  <div class="retrieve-block">
    <el-form label-width="88px" size="small">
      <el-form-item label="检索条数">
        <el-input-number
          v-model="topK"
          :min="1"
          :max="50"
          controls-position="right"
          @change="saveTopK"
        />
        <span class="retrieve-block__hint">保存后会同步到这个知识源的设置</span>
      </el-form-item>
      <el-form-item label="测试问题">
        <el-input v-model="query" type="textarea" :rows="5" placeholder="输入一个想从知识库里找回答案的问题" />
      </el-form-item>
    </el-form>

    <el-button type="primary" :loading="loading" @click="run">
      运行召回
    </el-button>

    <el-table v-if="hits.length" :data="hits" size="small" class="retrieve-table" max-height="360">
      <el-table-column prop="title" label="文档" width="180" show-overflow-tooltip />
      <el-table-column label="相关度" width="90">
        <template #default="{ row }">{{ row.score.toFixed(3) }}</template>
      </el-table-column>
      <el-table-column prop="content" label="片段" show-overflow-tooltip />
    </el-table>
    <el-empty v-else-if="done" :description="notice || '无命中'" :image-size="56" />
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { ref, watch, defineComponent, toRefs } from "vue"
import { ElMessage } from "element-plus"
import { retrieveKnowledgeSourceApi, saveKnowledgeSourceApi } from "@/api/knowledgeSource"
import type { IKnowledgeSourceHit, IKnowledgeSourceItem } from "@/types/api/knowledgeSource"

export default defineComponent({
  name: "KsRetrievePanel",
  props: {
    scene: { type: String, required: true },
    source: { type: Object as PropType<IKnowledgeSourceItem>, required: true }
  },
  emits: ["refresh"],
  setup(props, { emit }) {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    const topK = ref(props.source.retrievalTopK || 8)
    const query = ref("")
    const loading = ref(false)
    const done = ref(false)
    const notice = ref("")
    const hits = ref<IKnowledgeSourceHit[]>([])

    watch(() => props.source.retrievalTopK, value => {
      topK.value = value || 8
    })

    /** 检索条数是知识源实体上的字段，改一次落一次库，不靠详情整份提交。 */
    const saveTopK = async () => {
      try {
        const res = await saveKnowledgeSourceApi({
          scene: props.scene,
          knowledgeSourceId: props.source.knowledgeSourceId,
          retrievalTopK: topK.value
        })
        if (res.code !== 0) throw new Error(res.msg || "保存失败")
        emit("refresh")
      } catch (err) {
        ElMessage.error(errorMessage(err, "保存失败"))
      }
    }

    const run = async () => {
      const text = query.value.trim()
      if (!text) {
        ElMessage.warning("请输入测试问题")
        return
      }
      loading.value = true
      done.value = false
      hits.value = []
      notice.value = ""
      try {
        const res = await retrieveKnowledgeSourceApi({
          scene: props.scene,
          knowledgeSourceId: props.source.knowledgeSourceId,
          query: text,
          topK: topK.value
        })
        if (res.code !== 0) throw new Error(res.msg || "召回失败")
        hits.value = res.result?.hits ?? []
        notice.value = res.result?.notice || ""
      } catch (err) {
        ElMessage.error(errorMessage(err, "召回失败"))
      } finally {
        loading.value = false
        done.value = true
      }
    }
    return {
      ...toRefs(props), props, emit, errorMessage, topK, query, loading, done, notice, hits,
      saveTopK, run, ref, watch, ElMessage, retrieveKnowledgeSourceApi,
      saveKnowledgeSourceApi
    }
  }
})
</script>

<style scoped lang="less">
.retrieve-block {
  max-width: 760px;

  &__hint {
    margin-left: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.retrieve-table {
  margin-top: 16px;
}
</style>
