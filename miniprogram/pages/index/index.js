const db = wx.cloud.database()

Page({
  data: {
    sops: [],
    filteredSops: [],
    searchText: '',
    activeTab: 'mine',
    userInfo: null,
  },

  onLoad() {
    this.loadSops()
  },

  onShow() {
    // 刷新用户信息
    const app = getApp()
    this.setData({ userInfo: app.globalData.userInfo || null })
    if (app.globalData.sopNeedsRefresh) {
      this.loadSops()
      app.globalData.sopNeedsRefresh = false
    }
  },

  onPullDownRefresh() {
    this.loadSops().then(() => wx.stopPullDownRefresh())
  },

  async loadSops() {
    try {
      const { data } = await db.collection('sops')
        .where({ _openid: '{openid}' })
        .orderBy('updated_at', 'desc')
        .get()
      // 给每个 sop 加 timeAgo、groupPreview 和 author 信息
      const currentUser = getApp().globalData.userInfo
      const enriched = data.map(sop => ({
        ...sop,
        timeAgo: this.formatTimeAgo(sop.updated_at || sop.created_at),
        groupPreview: this.buildGroupPreview(sop.groups),
        author_name: sop.author_name || (currentUser ? currentUser.nickname : '勾友'),
        author_avatar: sop.author_avatar || (currentUser ? currentUser.avatar_url : ''),
      }))
      this.setData({ sops: enriched })
      this.filterByTab()
    } catch (e) {
      console.error('加载SOP失败', e)
      const local = wx.getStorageSync('sops') || []
      const enriched = local.map(sop => ({
        ...sop,
        timeAgo: this.formatTimeAgo(sop.updated_at || sop.created_at),
        groupPreview: this.buildGroupPreview(sop.groups),
      }))
      this.setData({ sops: enriched })
      this.filterByTab()
    }
  },

  formatTimeAgo(dateStr) {
    if (!dateStr) return ''
    const now = Date.now()
    const then = new Date(dateStr).getTime()
    if (isNaN(then)) return ''
    const diff = now - then
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return minutes + '分钟前'
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return hours + '小时前'
    const days = Math.floor(hours / 24)
    if (days < 30) return days + '天前'
    const months = Math.floor(days / 30)
    if (months < 12) return months + '个月前'
    return Math.floor(months / 12) + '年前'
  },

  buildGroupPreview(groups) {
    if (!groups || groups.length === 0) return ''
    const names = groups.slice(0, 2).map(g => g.name || '未命名').join(' · ')
    return groups.length > 2 ? names + ' ...' : names
  },

  filterByTab() {
    const { sops, activeTab, searchText } = this.data
    let filtered = sops

    if (activeTab === 'mine') {
      filtered = sops.filter(s => !s.forked_from)
    } else {
      filtered = sops.filter(s => !!s.forked_from)
    }

    if (searchText) {
      const q = searchText.toLowerCase()
      filtered = filtered.filter(sop =>
        sop.title.toLowerCase().includes(q) ||
        (sop.category || '').toLowerCase().includes(q)
      )
    }

    this.setData({ filteredSops: filtered })
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
    this.filterByTab()
  },

  onSearch(e) {
    this.setData({ searchText: e.detail.value })
    this.filterByTab()
  },

  totalItemCount(sop) {
    if (!sop.groups) return 0
    return sop.groups.reduce((sum, g) => sum + (g.items ? g.items.length : 0), 0)
  },

  goToSop(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/sop/sop?id=${id}` })
  },

  startCheck(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/check/check?id=${id}` })
  },

  createSop() {
    wx.navigateTo({ url: '/pages/sop/sop' })
  }
})
