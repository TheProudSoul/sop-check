const db = wx.cloud.database()
const _ = db.command

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: '越野跑', label: '🏃 越野跑' },
  { key: '旅行', label: '✈️ 旅行' },
  { key: '露营', label: '⛺ 露营' },
  { key: '出差', label: '💼 出差' },
  { key: '搬家', label: '📦 搬家' },
  { key: '日常', label: '🏠 日常' },
  { key: '健身', label: '💪 健身' },
  { key: '考试', label: '📝 考试' },
]

Page({
  data: {
    categories: CATEGORIES,
    activeCategory: 'all',
    sops: [],
    searchText: '',
    loading: true,
    hasMore: true,
    page: 0,
    pageSize: 20,
  },

  onLoad() {
    this.loadExploreList()
  },

  onPullDownRefresh() {
    this.setData({ page: 0, hasMore: true, sops: [] })
    this.loadExploreList().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadExploreList()
    }
  },

  async loadExploreList() {
    if (!this.data.hasMore && this.data.page > 0) return
    this.setData({ loading: true })

    try {
      const { activeCategory, searchText, page, pageSize } = this.data
      const skip = page * pageSize

      // 构建查询条件
      let where = { is_public: true }

      if (activeCategory !== 'all') {
        where.category = activeCategory
      }

      if (searchText) {
        where.title = db.RegExp({
          regexp: searchText,
          options: 'i',
        })
      }

      const { data, errMsg } = await db.collection('sops')
        .where(where)
        .orderBy('fork_count', 'desc')
        .orderBy('updated_at', 'desc')
        .skip(skip)
        .limit(pageSize)
        .field({
          title: true,
          emoji: true,
          category: true,
          fork_count: true,
          groups: true,
          _id: true,
          updated_at: true,
        })
        .get()

      // 计算每个SOP的条目数
      const enriched = data.map(sop => ({
        ...sop,
        itemCount: (sop.groups || []).reduce((sum, g) => sum + (g.items || []).length, 0),
        fork_count: sop.fork_count || 0,
      }))

      const newList = page === 0 ? enriched : [...this.data.sops, ...enriched]
      const hasMore = data.length === pageSize

      this.setData({
        sops: newList,
        hasMore,
        page: page + 1,
        loading: false,
      })
    } catch (e) {
      console.error('加载广场失败', e)
      this.setData({ loading: false })
      // 如果是集合权限问题，提示用户
      if (e.errMsg && e.errMsg.includes('permission')) {
        wx.showToast({ title: '暂无公开SOP', icon: 'none' })
      }
    }
  },

  switchCategory(e) {
    const key = e.currentTarget.dataset.key
    this.setData({
      activeCategory: key,
      page: 0,
      hasMore: true,
      sops: [],
    })
    this.loadExploreList()
  },

  onSearch(e) {
    this.setData({ searchText: e.detail.value })
  },

  doSearch() {
    this.setData({ page: 0, hasMore: true, sops: [] })
    this.loadExploreList()
  },

  clearSearch() {
    this.setData({ searchText: '', page: 0, hasMore: true, sops: [] })
    this.loadExploreList()
  },

  goToShare(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/share/share?id=${id}` })
  },

  onShareAppMessage() {
    return {
      title: '勾GO广场 — 发现有用的SOP清单',
      path: '/pages/explore/explore',
    }
  },
})
