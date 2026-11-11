<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  编排分区：提示词 / 变量 / 对话开场 / 模型与高级 四张分区卡片。
  没有「保存」按钮——改动停顿 1 秒后静默落库，失败才提示（与控制台 beaver-open 一致）。
  数据分两张表写：编排字段落 ai_assistant，开场问题与变量落 agent_app，按需各自提交。
-->

<template>
  <div v-loading="loading">
    <FormCard title="提示词" desc="定义这个场景的智能体是谁、怎么回答。用双花括号包裹变量名即可引用下方变量。">
      <template v-if="variableOptions.length" #extra>
        <el-dropdown trigger="click" @command="insertVariable">
          <el-button size="small">插入变量</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in variableOptions" :key="item.key" :command="item.key">
                {{ item.label || item.key }}（{{ varToken(item.key) }}）
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>

      <el-input
        v-model="form.systemPrompt"
        type="textarea"
        :rows="12"
        maxlength="8000"
        show-word-limit
        placeholder="例如：你是售后助手，先确认订单号，再给出可执行的解决方案。"
      />
    </FormCard>

    <FormCard title="变量" desc="用户开始对话前填写的字段，值会替换提示词里的同名占位符。">
      <template #extra>
        <el-button size="small" @click="addVariable">
          <el-icon><Plus /></el-icon>添加变量
        </el-button>
      </template>

      <div class="ds-editor">
        <div class="ds-editor__head">
          <span>共 {{ vars.length }} 个变量</span>
        </div>

        <p v-if="!vars.length" class="orch-empty">还没有变量。纯对话型智能体可以不配置。</p>

        <div v-else class="var-list">
          <div v-for="(row, index) in vars" :key="index" class="var-row">
            <div class="var-cell var-cell--name">
              <span class="var-cell__label">变量名</span>
              <el-input v-model="row.key" placeholder="order_id" maxlength="64" />
            </div>
            <div class="var-cell var-cell--label">
              <span class="var-cell__label">展示标签</span>
              <el-input v-model="row.label" placeholder="订单号" maxlength="128" />
            </div>
            <div class="var-cell var-cell--type">
              <span class="var-cell__label">类型</span>
              <el-select v-model="row.type">
                <el-option label="单行文本" value="text" />
                <el-option label="段落" value="paragraph" />
                <el-option label="下拉" value="select" />
                <el-option label="数字" value="number" />
              </el-select>
            </div>
            <div class="var-cell var-cell--default">
              <span class="var-cell__label">默认值</span>
              <el-input v-model="row.defaultValue" placeholder="可选" maxlength="512" />
            </div>
            <div class="var-cell var-cell--required">
              <span class="var-cell__label">必填</span>
              <el-switch v-model="row.required" />
            </div>
            <el-button class="var-row__remove" link type="danger" @click="removeVariable(index)">
              删除
            </el-button>

            <div v-if="row.type === 'select'" class="var-row__options">
              <span class="var-cell__label">下拉选项</span>
              <IdTagsEditor v-model="row.options" placeholder="输入一个选项后按回车" />
            </div>
          </div>
        </div>
      </div>
    </FormCard>

    <FormCard title="对话开场" desc="用户进入会话时看到的第一句话与可点击的引导问题。">
      <el-form label-width="96px" @submit.prevent>
        <el-form-item label="开场白">
          <el-input
            v-model="form.openingMessage"
            type="textarea"
            :rows="3"
            maxlength="2000"
            show-word-limit
            placeholder="可选，留空则不主动开口"
          />
        </el-form-item>
        <el-form-item label="开场问题">
          <IdTagsEditor
            v-model="openingQuestions"
            placeholder="输入一个引导问题后按回车"
            hint="用户进入会话时可一键发送这些问题；留空表示不展示。"
          />
        </el-form-item>
      </el-form>
    </FormCard>

    <FormCard title="模型与高级" desc="不指定模型时由平台使用推荐模型；生成风格只影响 temperature。">
      <el-form label-width="96px" @submit.prevent>
        <el-form-item label="对话模型">
          <el-select v-model="form.llmModelId" clearable filterable placeholder="平台推荐" class="model-select">
            <el-option v-for="m in modelOptions" :key="m.modelId" :label="m.name" :value="m.modelId" />
          </el-select>
          <p v-if="effectiveModelName" class="form-hint">
            {{ form.llmModelId ? `已指定：${effectiveModelName}` : `平台推荐：${effectiveModelName}` }}
          </p>
        </el-form-item>

        <el-form-item label="生成风格">
          <el-radio-group v-model="generationStyle">
            <el-radio-button value="stable">更稳定</el-radio-button>
            <el-radio-button value="balanced">默认</el-radio-button>
            <el-radio-button value="creative">更发散</el-radio-button>
            <el-radio-button value="custom">自定义</el-radio-button>
          </el-radio-group>
          <p class="ds-hint" style="margin-top: var(--ds-space-2)">
            通过 temperature 控制：更稳定 0.3 / 默认 0.7 / 更发散 1.0。
          </p>
        </el-form-item>

        <el-form-item v-if="generationStyle === 'custom'" label="temperature">
          <el-input-number v-model="temperature" :min="0" :max="2" :step="0.1" :precision="1" controls-position="right" />
        </el-form-item>

        <el-form-item label="topP">
          <el-input-number v-model="baseParams.topP" :min="0" :max="1" :step="0.05" :precision="2" controls-position="right" />
        </el-form-item>

        <el-form-item label="最大输出 token">
          <el-input-number v-model="baseParams.maxOutputTokens" :min="256" :max="32768" :step="256" controls-position="right" />
        </el-form-item>
      </el-form>
    </FormCard>
  </div>
</template>

<script lang="ts">
import type { IAgentAppInfo, IAgentModelInfo } from "@/types/api/agent"
import { Plus } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import {
  createAgentAppApi,
  getAgentAppListApi,
  getAgentModelListApi,
  getAiAssistantApi,
  saveAiAssistantApi,
  updateAgentAppApi
} from "@/api/agent"
import FormCard from "../../components/FormCard.vue"
import IdTagsEditor from "../../components/IdTagsEditor.vue"
import {
  GENERATION_STYLE_PARAMS,
  parseModelParams,
  parseOpeningQuestions,
  parseVars,
  type GenerationStyle,
  type IPromptVariable
} from "./shared"

/** 自动保存的停顿：够用户打完一段字，又不至于离开页面还没落库 */
const AUTOSAVE_DELAY = 1000

export default defineComponent({
  name: "OrchestrationTab",
  components: { Plus, FormCard, IdTagsEditor },
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
    /** temperature 是唯一由「生成风格」驱动的参数；topP / maxOutputTokens 单独可调，保存时一起写回 */
    const temperature = ref<number | null>(0.7)
    const baseParams = reactive({ topP: 0.9, maxOutputTokens: 4096 })
    const generationStyle = computed<GenerationStyle>({
      get() {
        if (temperature.value === null) return "balanced"
        const matched = (Object.keys(GENERATION_STYLE_PARAMS) as Array<Exclude<GenerationStyle, "custom">>)
          .find((key) => Math.abs(GENERATION_STYLE_PARAMS[key].temperature - (temperature.value as number)) < 0.001)
        return matched ?? "custom"
      },
      set(value) {
        temperature.value = value === "custom"
          ? (temperature.value ?? 0.7)
          : GENERATION_STYLE_PARAMS[value].temperature
      }
    })
    const openingQuestions = ref<string[]>([])
    const vars = ref<IPromptVariable[]>([])

    /** 加载期间要抑制自动保存，否则刚读回来的值会被当成用户改动再写一遍 */
    const armed = ref(false)
    const dirtyAssistant = ref(false)
    const dirtyApp = ref(false)
    let timer: ReturnType<typeof setTimeout> | undefined

    const effectiveModelName = computed(() => {
      if (form.llmModelId) {
        return modelOptions.value.find((m) => m.modelId === form.llmModelId)?.name || form.llmModelId
      }
      return modelOptions.value[0]?.name || ""
    })

    const variableOptions = computed(() => vars.value.filter((item) => item.key.trim()))
    /** 模板里展示字面量占位符，例如 {{order_id}}；放方法里避免裸花括号被编译器误判 */
    const varToken = (key: string) => `{{${key}}}`

    const loadData = async () => {
      loading.value = true
      try {
        const [modelRes, assistantRes, appRes] = await Promise.all([
          getAgentModelListApi({ status: 1, page: 1, pageSize: 200 }),
          getAiAssistantApi({ scene: props.scene }),
          getAgentAppListApi({ scene: props.scene, page: 1, pageSize: 20 })
        ])
        if (modelRes.code === 0) modelOptions.value = modelRes.result.list || []

        const assistant = assistantRes.code === 0 ? assistantRes.result.assistant : null
        const app =
          appRes.code === 0 ? (appRes.result.list || []).find((a) => a.scene === props.scene) || null : null
        currentApp.value = app

        if (assistant) {
          form.systemPrompt = assistant.systemPrompt || ""
          form.openingMessage = assistant.openingMessage || ""
          form.llmModelId = assistant.llmModelId || ""
          const params = parseModelParams(assistant.modelParams)
          temperature.value = params.temperature
          baseParams.topP = params.topP
          baseParams.maxOutputTokens = params.maxOutputTokens
        }
        openingQuestions.value = parseOpeningQuestions(app?.openingQuestions || "")
        vars.value = parseVars(app?.variables || "")
      } finally {
        loading.value = false
        // 等赋值触发的 watch 全部跑完再解锁，避免读回来的值被立即回写
        await nextTick()
        armed.value = true
      }
    }

    const errorMessage = (err: unknown, fallback: string) => {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    /** 编排字段：只提交本分区负责的字段，工具/MCP 归工具分区管，不要顺手覆盖 */
    const saveAssistant = async () => {
      const modelParams = JSON.stringify({
        temperature: temperature.value ?? 0.7,
        topP: baseParams.topP,
        maxOutputTokens: baseParams.maxOutputTokens
      })
      const res = await saveAiAssistantApi({
        scene: props.scene,
        systemPrompt: form.systemPrompt,
        openingMessage: form.openingMessage,
        llmModelId: form.llmModelId || undefined,
        modelParams
      })
      if (res.code !== 0) throw new Error(res.msg || "编排保存失败")
    }

    /** 开场问题与变量存在 agent_app 上，首次改动时补建记录 */
    const saveApp = async () => {
      const openingQuestionsStr = JSON.stringify(openingQuestions.value.map((q) => q.trim()).filter(Boolean))
      const variablesStr = JSON.stringify(vars.value)
      const app = currentApp.value
      const res = app
        ? await updateAgentAppApi({
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
        : await createAgentAppApi({
            name: props.scene,
            scene: props.scene,
            openingQuestions: openingQuestionsStr,
            variables: variablesStr,
            status: 1
          })
      if (res.code !== 0) throw new Error(res.msg || "开场问题 / 变量保存失败")

      // 新建后记住 appId，否则下次改动会再建一条重复记录
      if (!app && res.result?.appId) {
        currentApp.value = {
          appId: res.result.appId,
          name: props.scene,
          scene: props.scene,
          systemPrompt: "",
          llmModelId: "",
          modelParams: "",
          tools: "",
          mcpServerIds: "",
          knowledgeIds: "",
          openingMessage: "",
          openingQuestions: openingQuestionsStr,
          variables: variablesStr,
          status: 1,
          sort: 0,
          createdBy: ""
        }
      }
    }

    const flush = async () => {
      if (!armed.value || loading.value) return
      if (!dirtyAssistant.value && !dirtyApp.value) return
      // 上一次还没写完就再等一轮，避免两个请求交叉覆盖
      if (saving.value) {
        schedule()
        return
      }
      const needAssistant = dirtyAssistant.value
      const needApp = dirtyApp.value
      dirtyAssistant.value = false
      dirtyApp.value = false
      saving.value = true
      try {
        if (needAssistant) await saveAssistant()
        if (needApp) await saveApp()
      } catch (err) {
        // 失败保留脏标记，下次改动会重试；同时明确告诉用户没存上
        if (needAssistant) dirtyAssistant.value = true
        if (needApp) dirtyApp.value = true
        ElMessage.error(errorMessage(err, "保存失败"))
      } finally {
        saving.value = false
      }
    }

    const schedule = () => {
      if (!armed.value) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => void flush(), AUTOSAVE_DELAY)
    }

    watch(
      () => [form.systemPrompt, form.openingMessage, form.llmModelId, temperature.value, baseParams.topP, baseParams.maxOutputTokens],
      () => {
        dirtyAssistant.value = true
        schedule()
      }
    )

    watch(
      [openingQuestions, vars],
      () => {
        dirtyApp.value = true
        schedule()
      },
      { deep: true }
    )

    const addVariable = () => {
      vars.value.push({
        key: "",
        label: "",
        type: "text",
        options: [],
        defaultValue: "",
        required: false
      })
    }

    const removeVariable = (index: number) => vars.value.splice(index, 1)

    const insertVariable = (key: string) => {
      const token = `{{${key}}}`
      form.systemPrompt = form.systemPrompt ? `${form.systemPrompt}${token}` : token
    }

    onMounted(loadData)

    // 切换场景/离开分区时把没落库的改动补一次，避免「打完字就点走」丢内容
    onBeforeUnmount(() => {
      if (timer) clearTimeout(timer)
      if (!armed.value || loading.value) return
      if (!dirtyAssistant.value && !dirtyApp.value) return
      dirtyAssistant.value = false
      dirtyApp.value = false
      void saveAssistant().catch(() => undefined)
      void saveApp().catch(() => undefined)
    })

    return {
      loading,
      modelOptions,
      form,
      temperature,
      baseParams,
      generationStyle,
      openingQuestions,
      vars,
      effectiveModelName,
      variableOptions,
      varToken,
      addVariable,
      removeVariable,
      insertVariable
    }
  }
})
</script>

<style lang="less" scoped>
.model-select {
  width: 420px;
}

.form-hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.orch-empty {
  margin: 0;
  padding: 12px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.var-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.var-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 10px;
  background: var(--el-fill-color-blank);

  &__remove {
    margin-top: 22px;
  }

  &__options {
    flex: 1 1 100%;
  }
}

.var-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &--name {
    width: 140px;
  }

  &--label {
    width: 140px;
  }

  &--type {
    width: 130px;
  }

  &--default {
    width: 150px;
  }

  &--required {
    width: 64px;
    align-items: flex-start;
  }
}

@media (max-width: 767px) {
  .model-select {
    width: 100%;
  }

  .var-cell {
    &--name,
    &--label,
    &--type,
    &--default {
      width: 100%;
    }
  }
}
</style>
