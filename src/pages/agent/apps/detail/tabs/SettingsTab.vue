<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  设置分区：名称 / 场景 / 运行状态。
  场景是平台固定枚举，不可改也不可删；能改的是展示名称与启停状态，保存放卡片 footer（与 open 控制台一致）。
-->

<template>
  <div v-loading="loading">
    <FormCard title="基本信息" desc="名称用于后台列表与客户端展示；场景由平台固定，不可修改。">
      <el-form label-width="96px" @submit.prevent>
        <el-form-item label="场景">
          <div class="scene-value">
            <span class="scene-value__name">{{ sceneLabel }}</span>
            <span class="scene-value__key">{{ scene }}</span>
          </div>
        </el-form-item>

        <el-form-item label="名称" required>
          <el-input v-model="form.name" maxlength="50" show-word-limit placeholder="例如：AI 助手" />
        </el-form-item>

        <el-form-item label="运行状态">
          <div class="status-row">
            <el-switch v-model="form.enabled" />
            <span class="status-row__hint">
              {{ form.enabled ? "客户端可以正常唤起该场景" : "客户端已停用该场景" }}
            </span>
          </div>
          <p class="status-hint">停用后该场景的智能体不再响应任何请求，已有会话数据保留。</p>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </FormCard>
  </div>
</template>

<script lang="ts">
import { ElMessage } from "element-plus"
import { getAiAssistantApi, saveAiAssistantApi } from "@/api/agent"
import FormCard from "../../components/FormCard.vue"

const SCENE_LABELS: Record<string, string> = {
  assistant: "AI 助手",
  chat: "聊天",
  moment: "朋友圈",
  workbench: "工作台"
}

export default defineComponent({
  name: "SettingsTab",
  components: { FormCard },
  props: {
    scene: { type: String, required: true }
  },
  emits: ["saved"],
  setup(props, { emit }) {
    const loading = ref(false)
    const saving = ref(false)
    const form = reactive({ name: "", enabled: true })

    const sceneLabel = computed(() => SCENE_LABELS[props.scene] || props.scene)

    const loadData = async () => {
      loading.value = true
      try {
        const res = await getAiAssistantApi({ scene: props.scene })
        const assistant = res.code === 0 ? res.result.assistant : null
        if (assistant) {
          form.name = assistant.name || sceneLabel.value
          form.enabled = (assistant.status || 1) === 1
        } else {
          form.name = sceneLabel.value
        }
      } finally {
        loading.value = false
      }
    }

    const submit = async () => {
      const name = form.name.trim()
      if (name.length < 2 || name.length > 50) {
        ElMessage.warning("名称需 2-50 个字符")
        return
      }
      saving.value = true
      try {
        const res = await saveAiAssistantApi({
          scene: props.scene,
          name,
          status: form.enabled ? 1 : 2
        })
        if (res.code !== 0) throw new Error(res.msg || "保存失败")
        ElMessage.success("设置已保存")
        emit("saved")
      } catch (err) {
        ElMessage.error(err instanceof Error && err.message ? err.message : "保存失败")
      } finally {
        saving.value = false
      }
    }

    onMounted(loadData)

    return { loading, saving, form, sceneLabel, submit }
  }
})
</script>

<style lang="less" scoped>
.scene-value {
  display: flex;
  align-items: center;
  gap: 8px;

  &__name {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  &__key {
    padding: 1px 8px;
    border-radius: 999px;
    background: var(--el-fill-color);
    font-family: ui-monospace, monospace;
    font-size: 11px;
    line-height: 18px;
    color: var(--el-text-color-secondary);
  }
}

.status-row {
  display: flex;
  align-items: center;
  gap: 12px;

  &__hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.status-hint {
  width: 100%;
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
