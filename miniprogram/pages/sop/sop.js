const db = wx.cloud.database()
const { deepClone } = require('../../utils/index')
const createPosterMixin = require('./sop-poster')

// 默认分组模板（空白，引导用户自由填写）
const defaultGroups = () => deepClone([
  { name: '', items: [{ name: '', note: '', priority: 'recommended' }] }
])

// 预设分类列表
const CATEGORY_PRESETS = ['越野跑', '旅行', '露营', '出差', '搬家', '日常', '健身', '考试', '运动', '烹饪', '其他']

// Emoji 分组
const EMOJI_GROUPS = [
  { name: '运动', emojis: ['🏃', '🚴', '🏋️', '🎿', '🧗', '🏊', '🤸', '⚽', '🏸', '🎯'] },
  { name: '户外', emojis: ['🏔️', '🏕️', '🎣', '🚣', '🧭', '🌲', '🏖️', '🌊', '🦋', '🌅'] },
  { name: '出行', emojis: ['✈️', '🚗', '🎒', '🗺️', '🧳', '🚆', '🛳️', '🚁', '🗼', '🌍'] },
  { name: '日常', emojis: ['📋', '🏠', '💼', '🛒', '📦', '🔧', '🧹', '💊', '📱', '🛁'] },
  { name: '美食', emojis: ['🍳', '🥘', '🍕', '🍰', '🧁', '🍜', '🍱', '🥗', '🍻', '☕'] },
  { name: '学习', emojis: ['📝', '📚', '💻', '🎓', '🔬', '📐', '🎨', '🎵', '📷', '🖋️'] },
]

Page(Object.assign({
  data: {
    sop: { title: '', category: '', emoji: '📋', groups: [], is_public: true },
    isEdit: false,
    isNew: true,
    // 统计
    groupCount: 0,
    itemCount: 0,
    mustCount: 0,
    _originalSop: null,
    showSharePanel: false,
    posterUrl: '',
    drawingPoster: false,
    // 新增 UI 状态
    showEmojiPanel: false,
    emojiGroups: EMOJI_GROUPS,
    categoryPresets: CATEGORY_PRESETS,
    customCategory: '',
    showCustomCategory: false,
    collapsedGroups: {},
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isNew: false })
      this.loadSop(options.id)
    } else {
      const groups = defaultGroups()
      this.setData({
        isEdit: true,
        isNew: true,
        sop: { title: '', category: '', emoji: '📋', groups, is_public: true },
      })
      this.updateStats()
    }
  },

  async loadSop(id) {
    wx.showLoading({ title: '加载中...' })
    try {
      const { data } = await db.collection('sops').doc(id).get()
      this.setData({ sop: deepClone(data), isEdit: false })
      this.updateStats()
    } catch (e) {
      const local = wx.getStorageSync('sops') || []
      const sop = local.find(s => s._id === id)
      if (sop) {
        this.setData({ sop: deepClone(sop), isEdit: false })
        this.updateStats()
      } else {
        wx.showToast({ title: 'SOP不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1000)
      }
    }
    wx.hideLoading()
  },

  updateStats() {
    const groups = this.data.sop.groups || []
    const groupCount = groups.length
    let itemCount = 0, mustCount = 0
    groups.forEach(g => {
      (g.items || []).forEach(item => {
        itemCount++
        if (item.priority === 'must') mustCount++
      })
    })
    this.setData({ groupCount, itemCount, mustCount })
  },

  // ========== 编辑/保存 ==========
  editSop() {
    const sop = deepClone(this.data.sop)
    // 如果当前分类是自定义的（不在预设列表中），设置 customCategory
    const isPreset = CATEGORY_PRESETS.includes(sop.category)
    this.setData({
      isEdit: true,
      _originalSop: deepClone(this.data.sop),
      showCustomCategory: !isPreset && sop.category,
      customCategory: !isPreset ? sop.category : '',
    })
  },

  cancelEdit() {
    if (this.data.isNew) {
      wx.navigateBack()
      return
    }
    this.setData({
      isEdit: false,
      sop: this.data._originalSop || this.data.sop,
      showEmojiPanel: false,
      collapsedGroups: {},
    })
    this.updateStats()
  },

  async saveSop() {
    const sop = this.data.sop
    if (!sop.title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' })
      return
    }
    // 过滤空条目
    sop.groups = sop.groups.map(g => ({
      ...g,
      items: (g.items || []).filter(i => i.name.trim())
    })).filter(g => g.items.length > 0 || g.name.trim())

    wx.showLoading({ title: '保存中...' })
    const now = new Date().toISOString()
    sop.updated_at = now

    try {
      if (this.data.isNew) {
        sop.created_at = now
        sop.is_public = sop.is_public !== undefined ? sop.is_public : true
        const currentUser = getApp().globalData.userInfo
        sop.author_id = currentUser ? currentUser._id : ''
        sop.author_name = currentUser ? currentUser.nickname : '勾友'
        sop.author_avatar = currentUser ? currentUser.avatar_url : ''
        const { _id } = await db.collection('sops').add({ data: sop })
        sop._id = _id
        this.setData({ isNew: false, isEdit: false, sop, collapsedGroups: {} })
      } else {
        const updateData = deepClone(sop)
        delete updateData._id
        delete updateData._openid
        await db.collection('sops').doc(sop._id).update({ data: updateData })
        this.setData({ isEdit: false, collapsedGroups: {} })
      }
      this.updateStats()
      getApp().globalData.sopNeedsRefresh = true
      wx.showToast({ title: '已保存', icon: 'success' })
    } catch (e) {
      console.error('保存失败', e)
      const local = wx.getStorageSync('sops') || []
      if (this.data.isNew) {
        sop._id = 'local_' + Date.now()
        sop.created_at = now
        local.unshift(sop)
      } else {
        const idx = local.findIndex(s => s._id === sop._id)
        if (idx >= 0) local[idx] = deepClone(sop)
      }
      wx.setStorageSync('sops', local)
      this.setData({ isNew: false, isEdit: false, sop, collapsedGroups: {} })
      this.updateStats()
      getApp().globalData.sopNeedsRefresh = true
      wx.showToast({ title: '已保存(本地)', icon: 'success' })
    }
  },

  async deleteSop() {
    const res = await wx.showModal({ title: '确认删除', content: '删除后无法恢复', confirmColor: '#ff6b6b' })
    if (!res.confirm) return

    try {
      await db.collection('sops').doc(this.data.sop._id).remove()
    } catch (e) {
      const local = wx.getStorageSync('sops') || []
      const filtered = local.filter(s => s._id !== this.data.sop._id)
      wx.setStorageSync('sops', filtered)
    }
    getApp().globalData.sopNeedsRefresh = true
    wx.navigateBack()
  },

  // ========== 输入事件 ==========
  onTitleInput(e) { this.setData({ 'sop.title': e.detail.value }) },
  onCategoryInput(e) { this.setData({ 'sop.category': e.detail.value }) },
  onGroupNameInput(e) {
    this.setData({ [`sop.groups[${e.currentTarget.dataset.gidx}].name`]: e.detail.value })
  },
  onItemNameInput(e) {
    const { gidx, iidx } = e.currentTarget.dataset
    this.setData({ [`sop.groups[${gidx}].items[${iidx}].name`]: e.detail.value })
  },
  onItemNoteInput(e) {
    const { gidx, iidx } = e.currentTarget.dataset
    this.setData({ [`sop.groups[${gidx}].items[${iidx}].note`]: e.detail.value })
  },

  // ========== 分类选择 ==========
  onCategorySelect(e) {
    const cat = e.currentTarget.dataset.cat
    if (cat === '其他') {
      this.setData({
        'sop.category': '其他',
        showCustomCategory: true,
      })
    } else {
      this.setData({
        'sop.category': cat,
        showCustomCategory: false,
        customCategory: '',
      })
    }
  },

  onCustomCategoryInput(e) {
    const val = e.detail.value
    this.setData({
      customCategory: val,
      'sop.category': val || '其他',
    })
  },

  // ========== Emoji 弹窗 ==========
  showEmojiPicker() {
    this.setData({ showEmojiPanel: true })
  },

  hideEmojiPicker() {
    this.setData({ showEmojiPanel: false })
  },

  selectEmoji(e) {
    this.setData({
      'sop.emoji': e.currentTarget.dataset.emoji,
      showEmojiPanel: false,
    })
  },

  // ========== 分组折叠 ==========
  toggleGroupCollapse(e) {
    const gIdx = e.currentTarget.dataset.gidx
    const key = `collapsedGroups.${gIdx}`
    this.setData({ [key]: !this.data.collapsedGroups[gIdx] })
  },

  // ========== 分组/条目操作 ==========
  addGroup() {
    const groups = deepClone(this.data.sop.groups)
    groups.push({ name: '', items: [{ name: '', note: '', priority: 'recommended' }] })
    this.setData({ 'sop.groups': groups })
  },

  deleteGroup(e) {
    const groups = deepClone(this.data.sop.groups)
    groups.splice(e.currentTarget.dataset.gidx, 1)
    this.setData({ 'sop.groups': groups })
    this.updateStats()
  },

  addItem(e) {
    const groups = deepClone(this.data.sop.groups)
    groups[e.currentTarget.dataset.gidx].items.push({ name: '', note: '', priority: 'recommended' })
    this.setData({ 'sop.groups': groups })
    this.updateStats()
  },

  deleteItem(e) {
    const { gidx, iidx } = e.currentTarget.dataset
    const groups = deepClone(this.data.sop.groups)
    groups[gidx].items.splice(iidx, 1)
    this.setData({ 'sop.groups': groups })
    this.updateStats()
  },

  togglePriority(e) {
    const { gidx, iidx } = e.currentTarget.dataset
    const groups = deepClone(this.data.sop.groups)
    const current = groups[gidx].items[iidx].priority || 'recommended'
    const cycle = { must: 'optional', optional: 'recommended', recommended: 'must' }
    groups[gidx].items[iidx].priority = cycle[current]
    this.setData({ 'sop.groups': groups })
    this.updateStats()
  },

  // ========== 导航/公开 ==========
  goBack() {
    wx.navigateBack()
  },

  togglePublic() {
    const newVal = !this.data.sop.is_public
    this.setData({ 'sop.is_public': newVal })
    if (!this.data.isEdit && this.data.sop._id) {
      db.collection('sops').doc(this.data.sop._id).update({
        data: { is_public: newVal }
      }).catch(e => console.error('更新公开状态失败', e))
    }
  },

  startCheck() {
    if (this.data.isEdit) {
      this.saveSop().then(() => {
        wx.navigateTo({ url: `/pages/check/check?id=${this.data.sop._id}` })
      })
      return
    }
    if (!this.data.sop._id) {
      wx.showToast({ title: '请先保存SOP', icon: 'none' })
      return
    }
    const totalItems = this.data.sop.groups.reduce((n, g) => n + (g.items || []).length, 0)
    if (totalItems === 0) {
      wx.showToast({ title: 'SOP没有条目', icon: 'none' })
      return
    }
    wx.navigateTo({ url: `/pages/check/check?id=${this.data.sop._id}` })
  },
}, createPosterMixin()))
