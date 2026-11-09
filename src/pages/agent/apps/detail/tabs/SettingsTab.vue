<!--
  设置 Tab：启用/停用状态
-->

<template>
  <div class="tab-body">
    <el-form v-loading="loading" label-width="110px">
      <el-form-item label="状态">
        <el-radio-group v-model="status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="2">停用</el-radio>
        </el-radio-group>
        <div class="form-hint">停用后该场景的智能体将不会响应请求。</div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="saving" @click="submit">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { ElMessage } from "element-plus"
import { getAiAssistantApi, saveAiAssistantApi } from "@/api/agent"

export default defineComponent({
  name: "SettingsTab",
  props: {
    scene: { type: String, required: true }
  },
  setup(props) {
    const loading = ref(false)
    const saving = ref(false)
    const status = ref(1)

    const loadData = async () => {
      loading.value = true
      const res = await getAiAssistantApi({ scene: props.scene })
      const assistant = res.code === 0 ? res.result.assistant : null
      if (assistant) status.value = assistant.status || 1
      loading.value = false
    }

    const submit = async () => {
      saving.value = true
      const res = await saveAiAssistantApi({
        scene: props.scene,
        status: status.value
      })
      saving.value = false
      if (res.code === 0) {
        ElMessage.success("设置已保存")
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    onMounted(loadData)

    return { loading, saving, status, submit }
  }
})
</script>

<style lang="less" scoped>
.tab-body {
  max-width: 600px;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
