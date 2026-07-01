/**
 * 公共工具函数
 */

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function formatDate(isoStr) {
  if (!isoStr) return '未知日期'
  const d = new Date(isoStr)
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${yesterday.getDate().padStart(2, '0')}`

  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  if (dateStr === today) return '今天'
  if (dateStr === yesterdayStr) return '昨天'
  return dateStr
}

function formatTime(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

module.exports = {
  deepClone,
  formatDate,
  formatTime,
}
