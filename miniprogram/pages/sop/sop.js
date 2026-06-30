const db = wx.cloud.database()

// 深拷贝工具
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// 默认分组模板
const defaultGroups = () => deepClone([
  { name: '穿上身', items: [
    { name: '越野跑鞋', note: '大半码防顶脚', priority: 'must' },
    { name: '速干T恤/背心', note: '禁棉！', priority: 'must' },
    { name: '越野袜', note: '中筒防沙', priority: 'must' },
  ]},
  { name: '防护层', items: [
    { name: '皮肤风衣', note: '<200g', priority: 'must' },
    { name: '急救毯', note: '铝箔毯，失温救命', priority: 'must' },
    { name: '防晒霜', note: 'SPF50+', priority: 'must' },
    { name: '防蚊虫喷雾', note: '', priority: 'recommended' },
  ]},
  { name: '补给', items: [
    { name: '水/水袋', note: '≥2.5L', priority: 'must' },
    { name: '电解质/盐丸', note: '', priority: 'must' },
    { name: '能量胶', note: '每45min一支', priority: 'must' },
  ]},
  { name: '电子设备', items: [
    { name: '手机(离线轨迹)', note: '', priority: 'must' },
    { name: '头灯', note: '即使白天也带', priority: 'must' },
  ]},
])

Page({
  data: {
    sop: { title: '', category: '', emoji: '📋', groups: [] },
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
        sop: { title: '', category: '', emoji: '📋', groups },
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

  // 编辑/保存
  editSop() {
    // 深拷贝备份，取消时可恢复
    this.setData({
      isEdit: true,
      _originalSop: deepClone(this.data.sop),
    })
  },

  cancelEdit() {
    if (this.data.isNew) {
      wx.navigateBack()
      return
    }
    // 恢复到编辑前
    this.setData({
      isEdit: false,
      sop: this.data._originalSop || this.data.sop,
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
        const { _id } = await db.collection('sops').add({ data: sop })
        sop._id = _id
        this.setData({ isNew: false, isEdit: false, sop })
      } else {
        // 云端 update 不能带 _id 和 _openid
        const updateData = deepClone(sop)
        delete updateData._id
        delete updateData._openid
        await db.collection('sops').doc(sop._id).update({ data: updateData })
        this.setData({ isEdit: false })
      }
      this.updateStats()
      getApp().globalData.sopNeedsRefresh = true
      wx.showToast({ title: '已保存', icon: 'success' })
    } catch (e) {
      console.error('保存失败', e)
      // 本地fallback
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
      this.setData({ isNew: false, isEdit: false, sop })
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

  // 输入
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

  // 分组/条目操作 — 使用深拷贝防止引用污染
  addGroup() {
    const groups = deepClone(this.data.sop.groups)
    groups.push({ name: '', items: [] })
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

  pickEmoji() {
    const emojiGroups = [
      { name: '运动', emojis: ['🏃', '🚴', '🏋️', '🎿', '🧗'] },
      { name: '户外', emojis: ['🏔️', '🏕️', '🎣', '🚣', '🧭'] },
      { name: '出行', emojis: ['✈️', '🚗', '🎒', '🗺️', '🧳'] },
      { name: '日常', emojis: ['📋', '🏠', '💼', '🛒', '📦'] },
    ]
    const list = emojiGroups.map(g => g.name + ' ' + g.emojis.join(' '))
    wx.showActionSheet({
      itemList: list,
      success: (res) => {
        const group = emojiGroups[res.tapIndex]
        if (group) {
          // 二级选择
          wx.showActionSheet({
            itemList: group.emojis,
            success: (res2) => {
              this.setData({ 'sop.emoji': group.emojis[res2.tapIndex] })
            }
          })
        }
      }
    })
  },

  goBack() {
    wx.navigateBack()
  },

  shareSop() {
    wx.showShareMenu({ withShareTicket: true })
  },

  // 微信分享
  onShareAppMessage() {
    return {
      title: `${this.data.sop.emoji || '📋'} ${this.data.sop.title}`,
      path: `/pages/share/share?id=${this.data.sop._id}`,
    }
  },

  startCheck() {
    // Bug修复：编辑后未保存直接打勾，先自动保存
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

  // ========== 分享功能 ==========
  showSharePanel() {
    this.setData({ showSharePanel: true, posterUrl: '' })
  },

  hideSharePanel() {
    this.setData({ showSharePanel: false })
  },

  onShareAppMessage() {
    const sop = this.data.sop
    return {
      title: `${sop.emoji || '📋'} ${sop.title}`,
      path: `/pages/share/share?id=${sop._id}`,
    }
  },

  // ========== 海报生成 ==========
  generatePoster() {
    this.setData({ drawingPoster: true }, () => {
      setTimeout(() => this.drawPoster(), 100)
    })
  },

  drawPoster() {
    const sop = this.data.sop
    const ctx = wx.createCanvasContext('posterCanvas', this)
    const w = 600, h = 800

    // 背景渐变
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#1a1a2e')
    grad.addColorStop(0.5, '#16213e')
    grad.addColorStop(1, '#0f3460')
    ctx.setFillStyle(grad)
    ctx.fillRect(0, 0, w, h)

    // 品牌色顶部装饰条
    const brandGrad = ctx.createLinearGradient(0, 0, w, 0)
    brandGrad.addColorStop(0, '#4ecdc4')
    brandGrad.addColorStop(1, '#44b09e')
    ctx.setFillStyle(brandGrad)
    ctx.fillRect(0, 0, w, 8)

    // Emoji
    ctx.setFontSize(64)
    ctx.setFillStyle('#ffffff')
    ctx.setTextAlign('center')
    ctx.fillText(sop.emoji || '📋', w / 2, 120)

    // 标题
    ctx.setFontSize(36)
    ctx.setFillStyle('#ffffff')
    ctx.setTextAlign('center')
    const title = sop.title.length > 16 ? sop.title.substring(0, 16) + '...' : sop.title
    ctx.fillText(title, w / 2, 190)

    // 分类
    if (sop.category) {
      ctx.setFontSize(22)
      ctx.setFillStyle('rgba(255,255,255,0.5)')
      ctx.fillText(sop.category, w / 2, 225)
    }

    // 分隔线
    ctx.setStrokeStyle('#4ecdc4')
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.moveTo(80, 260)
    ctx.lineTo(w - 80, 260)
    ctx.stroke()

    // 分组统计
    let y = 310
    if (sop.groups) {
      sop.groups.forEach((g, i) => {
        if (i >= 6) return
        ctx.setFontSize(26)
        ctx.setFillStyle('#4ecdc4')
        ctx.setTextAlign('left')
        ctx.fillText(g.name, 80, y)
        ctx.setFontSize(24)
        ctx.setFillStyle('rgba(255,255,255,0.6)')
        ctx.setTextAlign('right')
        ctx.fillText(g.items.length + '项', w - 80, y)
        y += 50
      })
    }

    // 总计
    const totalItems = (sop.groups || []).reduce((s, g) => s + (g.items ? g.items.length : 0), 0)
    y += 20
    ctx.setFontSize(22)
    ctx.setFillStyle('rgba(255,255,255,0.4)')
    ctx.setTextAlign('center')
    ctx.fillText(`共 ${totalItems} 项 · SOP Check`, w / 2, y)

    // 小程序码占位
    const qrSize = 100
    const qrX = (w - qrSize) / 2
    const qrY = h - 180
    ctx.setFillStyle('rgba(255,255,255,0.1)')
    ctx.fillRect(qrX, qrY, qrSize, qrSize)
    ctx.setFontSize(18)
    ctx.setFillStyle('rgba(255,255,255,0.3)')
    ctx.fillText('小程序码', w / 2, qrY + qrSize / 2 + 6)

    // 底部提示
    ctx.setFontSize(20)
    ctx.setFillStyle('rgba(255,255,255,0.3)')
    ctx.fillText('扫码或长按识别使用此SOP', w / 2, h - 40)

    ctx.draw(false, () => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'posterCanvas',
          width: w,
          height: h,
          destWidth: w * 2,
          destHeight: h * 2,
          success: (res) => {
            this.setData({ posterUrl: res.tempFilePath, drawingPoster: false })
          },
          fail: () => {
            this.setData({ drawingPoster: false })
            wx.showToast({ title: '海报生成失败', icon: 'none' })
          }
        }, this)
      }, 300)
    })
  },
})
