<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  设置分区：场景只读信息 + 启用开关。
  场景是平台固定枚举，这里没有名称、头像、可见范围——那些是开放平台数字伙伴的属性。
-->

<template>
  <div v-loading="loading">
    <FormCard title="基本设置" desc="停用后该场景的智能体不再响应任何请求，已有会话数据保留。">
      <el-form label-width="96px" @submit.prevent>
        <el-form-item label="场景">
          <div class="scene-value">
            <span class="scene-value__name">{{ sceneLabel }}</span>
            <span class="scene-value__key">{{ scene }}</span>
          </div>
        </el-form-item>

        <el-form-item label="状态">
          <div class="status-row">
            <el-switch
              v-model="status"
              :active-value="1"
              :inactive-value="2"
              active-text="启用"
              inactive-text="停用"
            />
            <span class="status-row__hint">{{ status === 1 ? "客户端可以正常唤起该场景" : "客户端已停用该场景" }}</span>
          </div>
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
  setup(props) {
    const loading = ref(false)
    const saving = ref(false)
    const status = ref(1)

    const sceneLabel = computed(() => SCENE_LABELS[props.scene] || props.scene)

    const loadData = async () => {
      loading.value = true
      try {
        const res = await getAiAssistantApi({ scene: props.scene })
        const assistant = res.code === 0 ? res.result.assistant : null
        if (assistant) status.value = assistant.status || 1
      } finally {
        loading.value = false
      }
    }

    const submit = async () => {
      saving.value = true
      try {
        const res = await saveAiAssistantApi({ scene: props.scene, status: status.value })
        if (res.code !== 0) throw new Error(res.msg || "保存失败")
        ElMessage.success("设置已保存")
      } catch (err) {
        ElMessage.error(err instanceof Error && err.message ? err.message : "保存失败")
      } finally {
        saving.value = false
      }
    }

    onMounted(loadData)

    return { loading, saving, status, sceneLabel, submit }
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
</style>
