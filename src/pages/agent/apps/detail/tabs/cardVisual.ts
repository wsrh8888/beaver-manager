// 智能体详情页 · 卡片首字母图标与配色（工具箱 / MCP / 知识库共用）
const ICON_TINTS = ["#e8f3ff", "#e8faf0", "#fff7e8", "#f3e8ff", "#ffe8f0", "#e8fffb"]

export function iconLetter(name: string) {
  return (name || "?").trim().slice(0, 1).toUpperCase()
}

export function iconTint(seed: string) {
  let n = 0
  for (let i = 0; i < seed.length; i++) {
    n += seed.charCodeAt(i)
  }
  return ICON_TINTS[n % ICON_TINTS.length]
}
