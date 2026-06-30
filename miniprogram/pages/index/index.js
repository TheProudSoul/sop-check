const db = wx.cloud.database()

Page({
  data: {
    sops: [],
    filteredSops: [],
    searchText: '',
    activeTab: 'mine',
  },

  onLoad() {
    this.loadSops()
  },

  onShow() {
    this.loadSops()
  },

  async loadSops() {
    wx.showLoading({ title: '加载中...' })
    try {
      const { data } = await db.collection('sops')
        .where({ _openid: '{openid}' })
        .orderBy('updated_at', 'desc')
        .get()
      this.setData({ sops: data })
      this.filterByTab()
    } catch (e) {
      console.error('加载SOP失败', e)
      const local = wx.getStorageSync('sops') || []
      this.setData({ sops: local })
      this.filterByTab()
    }
    wx.hideLoading()
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
