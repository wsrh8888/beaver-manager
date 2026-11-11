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

  技能库：一个技能 = 一份 SKILL.md 文件。
  上传即解析 frontmatter（name / description / version），正文整篇存库；
  场景智能体在「工具」分区里从这些技能中挑选启用。
-->

<template>
  <div class="agent-skills">
    <header class="agent-skills__header">
      <div class="agent-skills__heading">
        <h1 class="agent-skills__title">技能</h1>
        <p class="agent-skills__hint">
          每个技能就是一份 SKILL.md。名称与描述取自文件头的 frontmatter，正文决定它在什么时候被用上。
        </p>
      </div>
      <el-input
        v-model="keyword"
        class="agent-skills__search"
        placeholder="搜索名称、描述"
        :prefix-icon="Search"
        clearable
      />
    </header>

    <div v-loading="loading" class="skill-grid">
      <button type="button" class="skill-card skill-card--entry" @click="openUpload">
        <el-icon class="skill-card__plus"><Plus /></el-icon>
        <span class="skill-card__entry-title">上传技能</span>
        <span class="skill-card__entry-hint">选择一个 SKILL.md</span>
      </button>

      <article
        v-for="item in filtered"
        :key="item.toolId"
        class="skill-card"
        role="button"
        tabindex="0"
        @click="openDetail(item)"
        @keyup.enter="openDetail(item)"
      >
        <header class="skill-card__head">
          <span class="skill-card__avatar" :style="{ background: iconTint(item.name) }">
            {{ iconLetter(item.name) }}
          </span>
          <div class="skill-card__heading">
            <h3 class="skill-card__name" :title="item.name">{{ item.name }}</h3>
            <p class="skill-card__meta">
              {{ item.version ? `v${item.version}` : "未标版本" }}
              <template v-if="item.fileName"> · {{ item.fileName }}</template>
            </p>
          </div>
          <span class="skill-card__badge" :class="item.status === 1 ? 'is-on' : 'is-off'">
            {{ item.status === 1 ? "启用中" : "已停用" }}
          </span>
        </header>

        <p class="skill-card__desc">
          {{ item.description || "没有写描述，运行时只能靠技能名判断是否可用" }}
        </p>

        <footer class="skill-card__foot">
          <span class="skill-card__stat">{{ bodyLines(item.skillMd) }} 行正文</span>
          <el-icon class="skill-card__go"><Right /></el-icon>
        </footer>
      </article>
    </div>

    <p v-if="!loading && !filtered.length && keyword" class="skill-empty">
      没有匹配「{{ keyword }}」的技能。
    </p>

    <!-- 上传 -->
    <el-dialog v-model="uploadVisible" width="720px" destroy-on-close class="skill-dialog" @closed="resetUpload">
      <template #header>
        <div class="skill-dialog__head">
          <h2 class="skill-dialog__title">上传技能</h2>
          <p class="skill-dialog__sub">解析完先看一遍，确认无误再加入技能库</p>
        </div>
      </template>

      <div
        v-if="!parsed"
        class="skill-drop"
        :class="{ 'is-busy': parsing }"
        @click="pickFile"
        @dragover.prevent
        @drop.prevent="onDrop"
      >
        <el-icon class="skill-drop__icon"><UploadFilled /></el-icon>
        <p class="skill-drop__title">{{ parsing ? "正在解析…" : "把 SKILL.md 拖到这里，或点击选择文件" }}</p>
        <p class="skill-drop__hint">支持 .md / .markdown / .txt，单个文件不超过 2MB</p>
        <input ref="fileInputRef" type="file" accept=".md,.markdown,.txt" hidden @change="onPick" />
      </div>

      <div v-else class="skill-form">
        <div class="skill-form__row">
          <label class="skill-form__label">名称</label>
          <el-input v-model="form.name" maxlength="128" placeholder="技能名" />
        </div>
        <div class="skill-form__row">
          <label class="skill-form__label">描述</label>
          <el-input
            v-model="form.description"
            maxlength="512"
            placeholder="一句话说明它在什么时候该被调用"
          />
        </div>
        <div class="skill-form__row">
          <label class="skill-form__label">版本</label>
          <el-input v-model="form.version" maxlength="32" placeholder="如 1.0.0（可留空）" />
        </div>
        <div class="skill-form__row">
          <label class="skill-form__label">正文</label>
          <pre class="skill-form__body">{{ form.skillMd }}</pre>
        </div>
      </div>

      <template #footer>
        <el-button round @click="uploadVisible = false">取消</el-button>
        <el-button v-if="parsed" round @click="resetUpload">重选文件</el-button>
        <el-button
          type="primary"
          round
          :disabled="!parsed"
          :loading="saving"
          @click="confirmCreate"
        >
          加入技能库
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情 / 编辑 -->
    <el-dialog v-model="detailVisible" width="720px" destroy-on-close class="skill-dialog">
      <template #header>
        <div class="skill-dialog__head">
          <h2 class="skill-dialog__title">{{ detail?.name || "技能详情" }}</h2>
          <p class="skill-dialog__sub">
            {{ detail?.fileName || "SKILL.md" }}
            <template v-if="detail?.version"> · v{{ detail.version }}</template>
          </p>
        </div>
      </template>

      <div v-if="detail" class="skill-form">
        <div class="skill-form__row">
          <label class="skill-form__label">名称</label>
          <el-input v-model="editForm.name" maxlength="128" />
        </div>
        <div class="skill-form__row">
          <label class="skill-form__label">描述</label>
          <el-input v-model="editForm.description" maxlength="512" />
        </div>
        <div class="skill-form__row">
          <label class="skill-form__label">版本</label>
          <el-input v-model="editForm.version" maxlength="32" />
        </div>
        <div class="skill-form__row">
          <label class="skill-form__label">正文</label>
          <pre class="skill-form__body">{{ detail.skillMd }}</pre>
        </div>
      </div>

      <template #footer>
        <el-button round type="danger" plain :loading="removing" @click="removeDetail">删除技能</el-button>
        <el-button round @click="toggleDetailStatus">
          {{ detail?.status === 1 ? "停用" : "启用" }}
        </el-button>
        <el-button type="primary" round :loading="saving" @click="saveDetail">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IAgentToolInfo } from "@/types/api/agent"
import { Plus, Right, Search, UploadFilled } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  createAgentToolApi,
  deleteAgentToolApi,
  getAgentToolListApi,
  parseAgentToolFileApi,
  updateAgentToolApi
} from "@/api/agent"
import { iconLetter, iconTint } from "../apps/detail/tabs/cardVisual"

interface ISkillForm {
  name: string
  description: string
  version: string
  skillMd: string
  fileName: string
  config: string
}

function emptyForm(): ISkillForm {
  return { name: "", description: "", version: "", skillMd: "", fileName: "", config: "" }
}

// 文件读成 base64，交给后端解析 frontmatter；前端不猜格式
function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("读取文件失败"))
    reader.onload = () => {
      const result = String(reader.result || "")
      const comma = result.indexOf(",")
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.readAsDataURL(file)
  })
}

export default defineComponent({
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const parsing = ref(false)
    const removing = ref(false)
    const list = ref<IAgentToolInfo[]>([])
    const keyword = ref("")

    const uploadVisible = ref(false)
    const parsed = ref(false)
    const fileInputRef = ref<HTMLInputElement | null>(null)
    const form = reactive<ISkillForm>(emptyForm())

    const detailVisible = ref(false)
    const detail = ref<IAgentToolInfo | null>(null)
    const editForm = reactive({ name: "", description: "", version: "" })

    const filtered = computed(() => {
      const q = keyword.value.trim().toLowerCase()
      if (!q) return list.value
      return list.value.filter(
        (item) =>
          item.name.toLowerCase().includes(q) || (item.description || "").toLowerCase().includes(q)
      )
    })

    const bodyLines = (text: string) => (text ? text.split("\n").length : 0)

    const fetchList = async () => {
      loading.value = true
      const res = await getAgentToolListApi({ status: 0, source: "official" })
      loading.value = false
      if (res.code === 0) {
        list.value = res.result.list || []
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const openUpload = () => {
      resetUpload()
      uploadVisible.value = true
    }

    const resetUpload = () => {
      parsed.value = false
      Object.assign(form, emptyForm())
      if (fileInputRef.value) fileInputRef.value.value = ""
    }

    const pickFile = () => {
      if (parsing.value) return
      fileInputRef.value?.click()
    }

    const onPick = (event: Event) => {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      if (file) void handleFile(file)
    }

    const onDrop = (event: DragEvent) => {
      const file = event.dataTransfer?.files?.[0]
      if (file) void handleFile(file)
    }

    const handleFile = async (file: File) => {
      if (!/\.(md|markdown|txt)$/i.test(file.name)) {
        ElMessage.warning("只支持 .md / .markdown / .txt")
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        ElMessage.warning("文件超过 2MB")
        return
      }
      parsing.value = true
      const data = await readAsBase64(file)
      const res = await parseAgentToolFileApi({ fileName: file.name, data })
      parsing.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "解析失败")
        return
      }
      if (res.result.msg) {
        ElMessage.error(res.result.msg)
        return
      }
      form.name = res.result.name
      form.description = res.result.description
      form.version = res.result.version
      form.skillMd = res.result.skillMd
      form.fileName = res.result.fileName || file.name
      form.config = res.result.config
      parsed.value = true
    }

    const confirmCreate = async () => {
      if (!form.name.trim()) {
        ElMessage.warning("请填写技能名")
        return
      }
      saving.value = true
      const res = await createAgentToolApi({
        name: form.name.trim(),
        description: form.description.trim(),
        version: form.version.trim(),
        skillMd: form.skillMd,
        fileName: form.fileName,
        config: form.config
      })
      saving.value = false
      if (res.code === 0) {
        ElMessage.success("已加入技能库")
        uploadVisible.value = false
        void fetchList()
      } else {
        ElMessage.error(res.msg || "创建失败")
      }
    }

    const openDetail = (item: IAgentToolInfo) => {
      detail.value = item
      editForm.name = item.name
      editForm.description = item.description || ""
      editForm.version = item.version || ""
      detailVisible.value = true
    }

    const saveDetail = async () => {
      if (!detail.value) return
      if (!editForm.name.trim()) {
        ElMessage.warning("请填写技能名")
        return
      }
      saving.value = true
      const res = await updateAgentToolApi({
        toolId: detail.value.toolId,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        version: editForm.version.trim()
      })
      saving.value = false
      if (res.code === 0) {
        ElMessage.success("已保存")
        detailVisible.value = false
        void fetchList()
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    const toggleDetailStatus = async () => {
      if (!detail.value) return
      const next = detail.value.status === 1 ? 2 : 1
      const res = await updateAgentToolApi({ toolId: detail.value.toolId, status: next })
      if (res.code === 0) {
        ElMessage.success(next === 1 ? "已启用" : "已停用")
        detailVisible.value = false
        void fetchList()
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const removeDetail = async () => {
      if (!detail.value) return
      const confirmed = await ElMessageBox.confirm(
        `删除技能「${detail.value.name}」？已启用它的智能体会同时失去这个能力。`,
        "删除技能",
        { type: "warning" }
      ).then(() => true, () => false)
      if (!confirmed) return
      removing.value = true
      const res = await deleteAgentToolApi({ toolId: detail.value.toolId })
      removing.value = false
      if (res.code === 0) {
        ElMessage.success("已删除")
        detailVisible.value = false
        void fetchList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    onMounted(fetchList)

    return {
      Plus,
      Right,
      Search,
      UploadFilled,
      iconLetter,
      iconTint,
      loading,
      saving,
      parsing,
      removing,
      list,
      keyword,
      filtered,
      uploadVisible,
      parsed,
      fileInputRef,
      form,
      detailVisible,
      detail,
      editForm,
      bodyLines,
      openUpload,
      resetUpload,
      pickFile,
      onPick,
      onDrop,
      confirmCreate,
      openDetail,
      saveDetail,
      toggleDetailStatus,
      removeDetail
    }
  }
})
</script>

<style scoped lang="less">
.agent-skills {
  padding: 4px 0;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__hint {
    margin: 6px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__search {
    flex: 0 0 260px;
  }
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
  gap: 16px;
  align-content: start;
  min-height: 160px;
}

.skill-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 16px 20px 14px;
  text-align: left;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover,
  &:focus-visible {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 6px 18px rgb(15 23 42 / 8%);
    outline: none;

    .skill-card__go {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &--entry {
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 172px;
    border-style: dashed;
    border-color: var(--el-border-color);
    background: var(--el-fill-color-lighter);

    &:hover {
      border-color: var(--el-color-primary-light-5);
      background: var(--el-color-primary-light-9);
    }
  }

  &__plus {
    font-size: 22px;
    color: var(--el-text-color-placeholder);
  }

  &__entry-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__entry-hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__avatar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    font-size: 16px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 65%);
  }

  &__heading {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__name {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 22px;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__badge {
    flex: 0 0 auto;
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 11px;
    line-height: 18px;

    &.is-on {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }

    &.is-off {
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color);
    }
  }

  &__desc {
    display: -webkit-box;
    flex: 1 1 auto;
    margin: 12px 0 0;
    overflow: hidden;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px solid var(--el-border-color-lighter);
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__go {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    opacity: 0;
    transform: translateX(-4px);
    transition:
      opacity 0.2s,
      transform 0.2s;
  }
}

.skill-empty {
  margin: 18px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.skill-dialog {
  &__head {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__sub {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.skill-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 46px 20px;
  border: 1px dashed var(--el-border-color);
  border-radius: 12px;
  background: var(--el-fill-color-lighter);
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
  }

  &.is-busy {
    cursor: progress;
    opacity: 0.75;
  }

  &__icon {
    font-size: 30px;
    color: var(--el-text-color-placeholder);
  }

  &__title {
    margin: 4px 0 0;
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  &__hint {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.skill-form {
  display: flex;
  flex-direction: column;
  gap: 14px;

  &__row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  &__label {
    flex: 0 0 48px;
    padding-top: 8px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  &__body {
    flex: 1 1 auto;
    max-height: 320px;
    margin: 0;
    padding: 12px 14px;
    overflow: auto;
    font-family: var(--el-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: 12px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }
}
</style>
