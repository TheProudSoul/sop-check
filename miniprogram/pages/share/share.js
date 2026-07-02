const db = wx.cloud.database()
const { deepClone } = require('../../utils/index')

Page({
  data: {
    sop: {},
    totalItems: 0,
    mustCount: 0,
    forking: false,
  },

  onLoad(options) {
    const id = options.id || options.scene
    if (id) {
      this.loadSop(id)
    } else {
      wx.showToast({ title: '无效的SOP链接', icon: 'none' })
    }
  },

  async loadSop(id) {
    wx.showLoading({ title: '加载中...' })
    try {
      const { data } = await db.collection('sops').doc(id).get()
      this.setData({ sop: data })
      this.calcStats(data)
    } catch (e) {
      const local = wx.getStorageSync('sops') || []
      const sop = local.find(s => s._id === id)
      if (sop) {
        this.setData({ sop })
        this.calcStats(sop)
      } else {
        wx.showToast({ title: 'SOP不存在或已被删除', icon: 'none' })
      }
    }
    wx.hideLoading()
  },

  calcStats(sop) {
    let totalItems = 0
    let mustCount = 0
    ;(sop.groups || []).forEach(g => {
      totalItems += (g.items || []).length
      mustCount += (g.items || []).filter(i => i.priority === 'must').length
    })
    this.setData({ totalItems, mustCount })
  },

  async forkSop() {
    if (this.data.forking) return
    this.setData({ forking: true })

    const original = this.data.sop
    const now = new Date().toISOString()

    // 深拷贝，去掉_id和云数据库元字段
    const currentUser = getApp().globalData.userInfo
    const forked = {
      title: original.title,
      category: original.category,
      emoji: original.emoji,
      groups: deepClone(original.groups || []),
      forked_from: original._id,
      is_public: true,
      fork_count: 0,
      author_id: currentUser ? currentUser._id : '',
      author_name: currentUser ? currentUser.nickname : '勾友',
      author_avatar: currentUser ? currentUser.avatar_url : '',
      created_at: now,
      updated_at: now,
    }

    try {
      const { _id } = await db.collection('sops').add({ data: forked })
      // 原SOP fork_count +1（可能没权限，忽略错误）
      try {
        await db.collection('sops').doc(original._id).update({
          data: { fork_count: db.command.inc(1) }
        })
      } catch (e) { /* ignore */ }

      // 更新用户的 fork_count +1
      try {
        const openid = await getApp().getOpenid()
        const userRes = await db.collection('users')
          .where({ _openid: openid })
          .limit(1)
          .get()
        if (userRes.data.length > 0) {
          await db.collection('users').doc(userRes.data[0]._id).update({
            data: { fork_count: db.command.inc(1) }
          })
        }
      } catch (e) { /* ignore */ }

      wx.vibrateShort()
      wx.showToast({ title: 'Fork成功！', icon: 'success' })
      getApp().globalData.sopNeedsRefresh = true
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1200)
    } catch (e) {
      // 本地fallback
      forked._id = 'local_' + Date.now()
      const local = wx.getStorageSync('sops') || []
      local.unshift(forked)
      wx.setStorageSync('sops', local)

      wx.showToast({ title: 'Fork成功(本地)！', icon: 'success' })
      getApp().globalData.sopNeedsRefresh = true
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1200)
    }
  },

  goCreate() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  onShareAppMessage() {
    return {
      title: `${this.data.sop.emoji || '📋'} ${this.data.sop.title}`,
      path: `/pages/share/share?id=${this.data.sop._id}`,
    }
  }
})
