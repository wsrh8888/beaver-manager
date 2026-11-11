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

  知识源子路由页：/agent/apps/:scene/knowledge/:knowledgeSourceId
  - 进入时按 id 从后端取回知识源实体（详情接口），不再依赖列表页传参；
  - ?add=1（刚创建完空知识源）先展示「选择数据源」添加文件向导；
  - 向导之外由 KsDetailView 承载「文档 / 召回测试 / 设置」三分区；
  - 文档分区点「添加文件」重新打开向导。
-->

<template>
  <div v-loading="loading" class="ks-page">
    <div class="ks-page__bar">
      <el-button link type="primary" class="ks-page__back" @click="backToList">
        ← 全部知识源
      </el-button>
      <span class="ks-page__name">{{ source?.name || "知识源" }}</span>
      <el-tag v-if="showWizard" size="small" type="primary" effect="plain">
        添加文件
      </el-tag>
    </div>

    <KsAddFileWizard
      v-if="showWizard && source"
      :scene="scene"
      :knowledge-source-id="knowledgeSourceId"
      :index-config-seed="indexConfig"
      @cancel="leaveWizard"
      @done="onWizardDone"
    />

    <div v-else-if="!source && !loading" class="ks-page__missing">
      <el-empty description="知识源不存在，或当前账号无权访问" :image-size="72" />
      <el-button type="primary" @click="backToList">
        返回知识源列表
      </el-button>
    </div>

    <KsDetailView
      v-else-if="source"
      :scene="scene"
      :source="source"
      @back="backToList"
      @refresh="loadSource"
      @deleted="onDeleted"
      @add-file="showWizard = true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { detailKnowledgeSourceApi } from "@/api/knowledgeSource"
import {
  parseKnowledgeIndexConfig,
  type IKnowledgeIndexConfig,
  type IKnowledgeSourceItem
} from "@/types/api/knowledgeSource"
import KsDetailView from "./detail/KsDetailView.vue"
import KsAddFileWizard from "./KsAddFileWizard.vue"

const route = useRoute()
const router = useRouter()

const scene = computed(() => String(route.params.scene || ""))
const knowledgeSourceId = computed(() => String(route.params.knowledgeSourceId || ""))
const addMode = computed(() => route.query.add === "1")

const source = ref<IKnowledgeSourceItem | null>(null)
const loading = ref(false)
const showWizard = ref(false)
const indexConfig = ref<IKnowledgeIndexConfig>(parseKnowledgeIndexConfig())

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === "object" && "msg" in err) {
    return String((err as { msg?: string }).msg || fallback)
  }
  return fallback
}

async function loadSource() {
  if (!scene.value || !knowledgeSourceId.value) return
  loading.value = true
  try {
    const res = await detailKnowledgeSourceApi({
      scene: scene.value,
      knowledgeSourceId: knowledgeSourceId.value
    })
    if (res.code !== 0) throw new Error(res.msg || "加载知识源失败")
    source.value = res.result?.source ?? null
    indexConfig.value = parseKnowledgeIndexConfig(source.value?.indexConfig)
  } catch (err) {
    ElMessage.error(errorMessage(err, "加载知识源失败"))
    source.value = null
  } finally {
    loading.value = false
  }
}

function clearAddQuery() {
  if (!addMode.value) return
  router.replace({
    name: "AgentKnowledgeSourceDetail",
    params: { scene: scene.value, knowledgeSourceId: knowledgeSourceId.value },
    query: {}
  })
}

function backToList() {
  router.push({
    path: "/agent/apps/detail",
    query: { scene: scene.value, tab: "knowledge" }
  })
}

function leaveWizard() {
  showWizard.value = false
  clearAddQuery()
}

function onWizardDone() {
  // 保留在「处理完成」页让用户看到结果，点「返回文档列表」再回三分区。
  void loadSource()
  clearAddQuery()
}

function onDeleted() {
  backToList()
}

watch(
  () => [scene.value, knowledgeSourceId.value],
  () => {
    showWizard.value = addMode.value
    void loadSource()
  },
  { immediate: true }
)
</script>

<style scoped lang="less">
.ks-page {
  min-height: 520px;
  padding: 4px 8px 24px;

  &__bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__back {
    font-size: 14px;
    padding-left: 0;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__missing {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 360px;
  }
}
</style>
