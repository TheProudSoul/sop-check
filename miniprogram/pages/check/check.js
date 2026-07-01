const db = wx.cloud.database()
const { deepClone } = require('../../utils/index')

Page({
  data: {
    sop: {},
    checkGroups: [],
    checkedCount: 0,
    totalCount: 0,
    uncheckedMust: 0,
    progress: 0,
    showCelebration: false,
  },

  onLoad(options) {
    if (options.id) {
      this.loadSop(options.id)
    }
  },

  async loadSop(id) {
    wx.showLoading({ title: '加载中...' })
    try {
      const { data } = await db.collection('sops').doc(id).get()
      this.initCheck(data)
    } catch (e) {
      const local = wx.getStorageSync('sops') || []
      const sop = local.find(s => s._id === id)
      if (sop) {
        this.initCheck(sop)
      } else {
        wx.showToast({ title: 'SOP不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1000)
      }
    }
    wx.hideLoading()
  },

  initCheck(sop) {
    // 深拷贝 + 添加 checked 字段
    const checkGroups = deepClone(sop.groups || []).map(g => ({
      ...g,
      items: (g.items || []).map(item => ({ ...item, checked: false })),
      checked: 0,
    }))

    const totalCount = checkGroups.reduce((sum, g) => sum + g.items.length, 0)
    const uncheckedMust = checkGroups.reduce((sum, g) =>
      sum + g.items.filter(i => i.priority === 'must').length, 0)

    this.setData({
      sop: deepClone(sop),
      checkGroups,
      checkedCount: 0,
      totalCount,
      uncheckedMust,
      progress: 0,
      showCelebration: false,
    })
  },

  toggleItem(e) {
    const { gidx, iidx } = e.currentTarget.dataset
    const current = this.data.checkGroups[gidx].items[iidx].checked
    const key = `checkGroups[${gidx}].items[${iidx}].checked`

    // 轻振动反馈
    wx.vibrateShort({ type: 'light' })

    this.setData({ [key]: !current }, () => this.updateProgress())
  },

  updateProgress() {
    let checkedCount = 0
    let uncheckedMust = 0

    const checkGroups = this.data.checkGroups.map(g => {
      const checked = g.items.filter(i => i.checked).length
      checkedCount += checked
      uncheckedMust += g.items.filter(i => i.priority === 'must' && !i.checked).length
      return { ...g, checked }
    })

    const progress = this.data.totalCount > 0
      ? Math.round(checkedCount / this.data.totalCount * 100)
      : 0

    this.setData({ checkGroups, checkedCount, uncheckedMust, progress })

    // 全部完成时庆祝
    if (progress === 100 && this.data.totalCount > 0) {
      this.celebrate()
    }
  },

  celebrate() {
    wx.vibrateShort()
    this.setData({ showCelebration: true })

    // 2秒后隐藏庆祝动画
    setTimeout(() => {
      this.setData({ showCelebration: false })
    }, 2200)
  },

  resetAll() {
    wx.showModal({
      title: '重置确认',
      content: '清空所有勾选？',
      confirmColor: '#4ecdc4',
      success: (res) => {
        if (res.confirm) {
          this.initCheck(this.data.sop)
        }
      }
    })
  },

  finishCheck() {
    wx.vibrateShort()

    // 保存使用记录
    const usage = {
      sop_id: this.data.sop._id,
      sop_title: this.data.sop.title,
      sop_emoji: this.data.sop.emoji || '📋',
      checked_count: this.data.checkedCount,
      total_count: this.data.totalCount,
      finished_at: new Date().toISOString(),
    }

    try {
      db.collection('usages').add({ data: usage })
    } catch (e) {
      const local = wx.getStorageSync('usages') || []
      local.unshift(usage)
      // 只保留最近50条
      if (local.length > 50) local.length = 50
      wx.setStorageSync('usages', local)
    }

    getApp().globalData.sopNeedsRefresh = true

    wx.showToast({
      title: '🎉 出发！',
      icon: 'none',
      duration: 2000,
    })

    setTimeout(() => wx.navigateBack(), 1500)
  },

  // 分享
  onShareAppMessage() {
    const sop = this.data.sop
    return {
      title: `${sop.emoji || '📋'} ${sop.title} — 打勾确认清单`,
      path: `/pages/share/share?id=${sop._id}`,
    }
  }
})
