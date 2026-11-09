<!--
  编排 Tab：系统提示词、变量、开场白、开场问题、对话模型、生成风格
-->

<template>
  <div class="tab-body">
    <el-form v-loading="loading" label-width="110px" class="persona-form">
      <el-form-item label="系统提示词">
        <el-input v-model="form.systemPrompt" type="textarea" :rows="8" placeholder="它是谁、能做什么、怎么回答" />
      </el-form-item>

      <el-form-item label="变量">
        <div class="var-block">
          <el-button size="small" @click="openVarDialog()">添加变量</el-button>
          <el-table v-if="vars.length" :data="vars" size="small" border style="margin-top: 8px">
            <el-table-column prop="key" label="变量名" min-width="120" />
            <el-table-column prop="label" label="显示名" min-width="120" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">{{ varTypeLabel(row.type) }}</template>
            </el-table-column>
            <el-table-column label="必填" width="72" align="center">
              <template #default="{ row }">{{ row.required ? "是" : "否" }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row, $index }">
                <el-button link type="primary" @click="openVarDialog(row, $index)">编辑</el-button>
                <el-button link type="danger" @click="removeVar($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无变量，提示词里可用 {{key}} 引用" :image-size="60" />
        </div>
      </el-form-item>

      <el-form-item label="开场白">
        <el-input v-model="form.openingMessage" type="textarea" :rows="3" maxlength="2000" show-word-limit />
      </el-form-item>

      <el-form-item label="开场问题">
        <div class="sq-block">
          <div class="sq-head">
            <span>{{ openingQuestions.length }}/8</span>
            <el-button size="small" :disabled="openingQuestions.length >= 8" @click="addOpeningQuestion">添加</el-button>
          </div>
          <div v-for="(_, idx) in openingQuestions" :key="idx" class="sq-row">
            <el-input v-model="openingQuestions[idx]" maxlength="256" />
            <el-button link type="danger" @click="removeOpeningQuestion(idx)">删除</el-button>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="对话模型">
        <el-select v-model="form.llmModelId" clearable filterable placeholder="平台推荐" style="width: 480px">
          <el-option v-for="m in modelOptions" :key="m.modelId" :label="m.name" :value="m.modelId" />
        </el-select>
        <div v-if="effectiveModelName" class="form-hint">
          {{ form.llmModelId ? `已指定：${effectiveModelName}` : `平台推荐：${effectiveModelName}` }}
        </div>
      </el-form-item>

      <el-form-item label="生成风格">
        <el-radio-group v-model="generationStyle">
          <el-radio-button value="stable">更稳定</el-radio-button>
          <el-radio-button value="balanced">默认</el-radio-button>
          <el-radio-button value="creative">更发散</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="saving" @click="submit">保存编排</el-button>
      </el-form-item>
    </el-form>

    <!-- 变量编辑弹窗 -->
    <el-dialog v-model="varDialogVisible" :title="varEditIndex === null ? '添加变量' : '编辑变量'" width="480px" destroy-on-close append-to-body>
      <el-form label-width="96px">
        <el-form-item label="变量名" required>
          <el-input v-model="varDraft.key" :disabled="varEditIndex !== null" maxlength="64" placeholder="input" />
        </el-form-item>
        <el-form-item label="显示名称" required>
          <el-input v-model="varDraft.label" maxlength="128" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="varDraft.type" style="width: 100%">
            <el-option label="单行文本" value="text" />
            <el-option label="段落" value="paragraph" />
            <el-option label="下拉" value="select" />
            <el-option label="数字" value="number" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="varDraft.type === 'select'" label="选项" required>
          <div class="option-list">
            <div v-for="(_, i) in varDraft.options" :key="i" class="option-list__row">
              <el-input v-model="varDraft.options[i]" maxlength="128" placeholder="选项文案" />
              <el-button link type="danger" :disabled="varDraft.options.length <= 1" @click="removeSelectOption(i)">删除</el-button>
            </div>
            <el-button size="small" @click="addSelectOption">添加选项</el-button>
          </div>
        </el-form-item>
        <el-form-item label="默认值">
          <el-input v-model="varDraft.defaultValue" maxlength="512" />
        </el-form-item>
        <el-form-item label="必填">
          <el-switch v-model="varDraft.required" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="varDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmVarDialog">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IAgentAppInfo, IAgentModelInfo } from "@/types/api/agent"
import { ElMessage } from "element-plus"
import {
  createAgentAppApi,
  getAgentAppListApi,
  getAgentModelListApi,
  getAiAssistantApi,
  saveAiAssistantApi,
  updateAgentAppApi
} from "@/api/agent"
import {
  emptyVar,
  GENERATION_STYLE_PARAMS,
  parseModelParams,
  parseOpeningQuestions,
  parseVars,
  stringifyVars,
  styleFromParams,
  varTypeLabel,
  type GenerationStyle,
  type IPromptVariable
} from "./shared"

export default defineComponent({
  name: "PersonaTab",
  props: {
    scene: { type: String, required: true }
  },
  setup(props) {
    const loading = ref(false)
    const saving = ref(false)
    const modelOptions = ref<IAgentModelInfo[]>([])
    const currentApp = ref<IAgentAppInfo | null>(null)

    const form = reactive({
      systemPrompt: "",
      openingMessage: "",
      llmModelId: ""
    })
    const generationStyle = ref<GenerationStyle>("balanced")
    const openingQuestions = ref<string[]>([])
    const vars = ref<IPromptVariable[]>([])

    const effectiveModelName = computed(() => {
      if (form.llmModelId) {
        return modelOptions.value.find((m) => m.modelId === form.llmModelId)?.name || form.llmModelId
      }
      return modelOptions.value[0]?.name || ""
    })

    const loadData = async () => {
      loading.value = true
      const [modelRes, assistantRes, appRes] = await Promise.all([
        getAgentModelListApi({ status: 1, page: 1, pageSize: 200 }),
        getAiAssistantApi({ scene: props.scene }),
        getAgentAppListApi({ scene: props.scene, page: 1, pageSize: 20 })
      ])
      if (modelRes.code === 0) modelOptions.value = modelRes.result.list || []
      const assistant = assistantRes.code === 0 ? assistantRes.result.assistant : null
      const app = appRes.code === 0 ? (appRes.result.list || []).find((a) => a.scene === props.scene) || null : null
      currentApp.value = app

      if (assistant) {
        form.systemPrompt = assistant.systemPrompt
        form.openingMessage = assistant.openingMessage
        form.llmModelId = assistant.llmModelId || ""
        generationStyle.value = styleFromParams(parseModelParams(assistant.modelParams))
      }
      if (app) {
        openingQuestions.value = parseOpeningQuestions(app.openingQuestions)
        vars.value = parseVars(app.variables)
      }
      loading.value = false
    }

    const syncAgentApp = async () => {
      const openingQuestionsStr = JSON.stringify(openingQuestions.value.map((q) => q.trim()).filter(Boolean))
      const variablesStr = stringifyVars(vars.value)
      const app = currentApp.value
      if (app) {
        return await updateAgentAppApi({
          appId: app.appId,
          name: app.name,
          scene: app.scene,
          systemPrompt: app.systemPrompt,
          llmModelId: app.llmModelId,
          modelParams: app.modelParams,
          tools: app.tools,
          mcpServerIds: app.mcpServerIds,
          knowledgeIds: app.knowledgeIds,
          openingMessage: app.openingMessage,
          openingQuestions: openingQuestionsStr,
          variables: variablesStr,
          status: app.status,
          sort: app.sort
        })
      }
      return await createAgentAppApi({
        name: props.scene,
        scene: props.scene,
        openingQuestions: openingQuestionsStr,
        variables: variablesStr,
        status: 1
      })
    }

    const submit = async () => {
      saving.value = true
      const modelParams = JSON.stringify(GENERATION_STYLE_PARAMS[generationStyle.value])
      const res = await saveAiAssistantApi({
        scene: props.scene,
        systemPrompt: form.systemPrompt,
        openingMessage: form.openingMessage,
        llmModelId: form.llmModelId || undefined,
        modelParams
      })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      const syncRes = await syncAgentApp()
      if (syncRes.code === 0) {
        ElMessage.success("编排已保存")
        await loadData()
      } else {
        ElMessage.error(syncRes.msg || "开场问题/变量保存失败")
      }
    }

    // —— 开场问题 ——
    const addOpeningQuestion = () => {
      if (openingQuestions.value.length >= 8) return
      openingQuestions.value.push("")
    }
    const removeOpeningQuestion = (idx: number) => openingQuestions.value.splice(idx, 1)

    // —— 变量 ——
    const varDialogVisible = ref(false)
    const varEditIndex = ref<number | null>(null)
    const varDraft = reactive<IPromptVariable>(emptyVar())

    const openVarDialog = (row?: IPromptVariable, index?: number) => {
      if (row !== undefined && index !== undefined) {
        varEditIndex.value = index
        Object.assign(varDraft, { ...row, options: [...row.options] })
      } else {
        varEditIndex.value = null
        Object.assign(varDraft, emptyVar())
      }
      ensureSelectOptions()
      varDialogVisible.value = true
    }
    const ensureSelectOptions = () => {
      if (varDraft.type === "select" && varDraft.options.length === 0) varDraft.options.push("")
    }
    watch(() => varDraft.type, (t) => {
      if (t === "select") ensureSelectOptions()
      else varDraft.options = []
    })
    const addSelectOption = () => varDraft.options.push("")
    const removeSelectOption = (i: number) => {
      if (varDraft.options.length <= 1) return
      varDraft.options.splice(i, 1)
    }
    const confirmVarDialog = () => {
      if (!varDraft.key.trim() || !varDraft.label.trim()) {
        ElMessage.warning("变量名和显示名称不能为空")
        return
      }
      const next = [...vars.value]
      const draft: IPromptVariable = {
        ...varDraft,
        key: varDraft.key.trim(),
        label: varDraft.label.trim(),
        defaultValue: varDraft.defaultValue.trim(),
        options: varDraft.type === "select" ? varDraft.options.map((s) => s.trim()).filter(Boolean) : []
      }
      if (varEditIndex.value === null) next.push(draft)
      else next[varEditIndex.value] = draft
      vars.value = next
      varDialogVisible.value = false
    }
    const removeVar = (idx: number) => vars.value.splice(idx, 1)

    onMounted(loadData)

    return {
      loading,
      saving,
      modelOptions,
      form,
      generationStyle,
      openingQuestions,
      vars,
      effectiveModelName,
      varDialogVisible,
      varEditIndex,
      varDraft,
      submit,
      addOpeningQuestion,
      removeOpeningQuestion,
      openVarDialog,
      confirmVarDialog,
      removeVar,
      addSelectOption,
      removeSelectOption,
      varTypeLabel
    }
  }
})
</script>

<style lang="less" scoped>
.tab-body {
  max-width: 900px;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.var-block {
  width: 100%;
}

.sq-block {
  width: 480px;

  .sq-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    color: #606266;
    font-size: 13px;
  }

  .sq-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
}

.option-list {
  width: 100%;

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
}
</style>
