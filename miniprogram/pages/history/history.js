const db = wx.cloud.database()
const { formatDate, formatTime } = require('../../utils')

Page({
  data: {
    usages: [],
    groupedUsages: [],  // 按日期分组: [{date, items: [...]}]
    stats: {
      totalCount: 0,
      topSop: null,
      avgRate: 0,
    },
    loading: true,
  },

  onLoad() {
    this.loadHistory()
  },

  onShow() {
    this.loadHistory()
  },

  onPullDownRefresh() {
    this.loadHistory().then(() => wx.stopPullDownRefresh())
  },

  async loadHistory() {
    this.setData({ loading: true })

    try {
      // 查询当前用户的使用记录
      const { data } = await db.collection('usages')
        .where({ _openid: '{openid}' })
        .orderBy('finished_at', 'desc')
        .limit(100)
        .get()

      this.processData(data)
    } catch (e) {
      console.error('加载历史失败', e)
      // 尝试从本地缓存读取
      const local = wx.getStorageSync('usages') || []
      this.processData(local)
    }
  },

  processData(data) {
    // 统计概览
    const totalCount = data.length
    let topSop = null
    const sopCountMap = {}
    let totalChecked = 0
    let totalItems = 0

    data.forEach(u => {
      const title = u.sop_title || '未命名SOP'
      sopCountMap[title] = (sopCountMap[title] || 0) + 1
      totalChecked += u.checked_count || 0
      totalItems += u.total_count || 0
    })

    // 找最常使用的SOP
    let maxCount = 0
    Object.keys(sopCountMap).forEach(title => {
      if (sopCountMap[title] > maxCount) {
        maxCount = sopCountMap[title]
        topSop = title
      }
    })

    const avgRate = totalItems > 0
      ? Math.round(totalChecked / totalItems * 100)
      : 0

    // 按日期分组
    const grouped = this.groupByDate(data)

    this.setData({
      usages: data,
      groupedUsages: grouped,
      stats: { totalCount, topSop, avgRate },
      loading: false,
    })
  },

  groupByDate(data) {
    const groups = {}

    data.forEach(u => {
      const date = this.formatDate(u.finished_at)
      if (!groups[date]) {
        groups[date] = { date, items: [] }
      }
      groups[date].items.push(u)
    })

    // 返回按日期倒序排列的数组
    return Object.values(groups).sort((a, b) => {
      return b.date.localeCompare(a.date)
    })
  },

  formatDate(isoStr) {
    return formatDate(isoStr)
  },

  formatTime(isoStr) {
    return formatTime(isoStr)
  },

  completionRate(checked, total) {
    if (!total) return 0
    return Math.round(checked / total * 100)
  },

  goToSop(e) {
    const id = e.currentTarget.dataset.id
    if (id && !id.startsWith('local_')) {
      wx.navigateTo({ url: `/pages/sop/sop?id=${id}` })
    }
  },

  onShareAppMessage() {
    return {
      title: '勾GO — 我的使用历史',
      path: '/pages/history/history',
    }
  },
})
