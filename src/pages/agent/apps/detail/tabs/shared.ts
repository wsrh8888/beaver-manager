/**
 * 智能体详情 Tab 共享工具函数
 */

export type GenerationStyle = "stable" | "balanced" | "creative" | "custom"

export interface IModelParams {
  temperature: number
  topP: number
  maxOutputTokens: number
}

export const GENERATION_STYLE_PARAMS: Record<Exclude<GenerationStyle, "custom">, IModelParams> = {
  stable: { temperature: 0.3, topP: 0.85, maxOutputTokens: 4096 },
  balanced: { temperature: 0.7, topP: 0.9, maxOutputTokens: 4096 },
  creative: { temperature: 1, topP: 0.95, maxOutputTokens: 4096 }
}

export interface IPromptVariable {
  key: string
  label: string
  type: "text" | "paragraph" | "select" | "number"
  options: string[]
  defaultValue: string
  required: boolean
}

export function parseIdList(raw: string): string[] {
  if (!raw || raw.trim().charAt(0) !== "[") return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string")
    }
  } catch {
    /* ignore */
  }
  return []
}

export function parseModelParams(raw: string): IModelParams {
  const defaults = GENERATION_STYLE_PARAMS.balanced
  if (!raw) return defaults
  try {
    const o = JSON.parse(raw) as Partial<IModelParams>
    return {
      temperature: typeof o.temperature === "number" ? o.temperature : defaults.temperature,
      topP: typeof o.topP === "number" ? o.topP : defaults.topP,
      maxOutputTokens: typeof o.maxOutputTokens === "number" ? o.maxOutputTokens : defaults.maxOutputTokens
    }
  } catch {
    return defaults
  }
}

export function styleFromParams(params: IModelParams): GenerationStyle {
  for (const style of ["stable", "balanced", "creative"] as Array<Exclude<GenerationStyle, "custom">>) {
    const p = GENERATION_STYLE_PARAMS[style]
    if (Math.abs(params.temperature - p.temperature) < 0.06) return style
  }
  return "custom"
}

export function parseVars(raw: string): IPromptVariable[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) {
      return arr.map((v: any) => ({
        key: String(v.key || ""),
        label: String(v.label || ""),
        type: (v.type as any) || "text",
        options: Array.isArray(v.options) ? v.options.map(String) : [],
        defaultValue: String(v.defaultValue || ""),
        required: !!v.required
      }))
    }
  } catch {
    /* ignore */
  }
  return []
}

export function parseOpeningQuestions(raw: string): string[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) return arr.map(String)
  } catch {
    /* ignore */
  }
  return []
}
