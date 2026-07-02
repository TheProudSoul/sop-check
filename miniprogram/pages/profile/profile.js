const db = wx.cloud.database()
const { deepClone } = require('../../utils/index')

Page({
  data: {
    userInfo: null,
    sopCount: 0,
    forkCount: 0,
    usageCount: 0,
    showEditPanel: false,
    tempAvatarUrl: '',
    tempNickname: '',
    tempBio: '',
    loading: true,
  },

  onLoad() {
    this.loadUserProfile()
  },

  onShow() {
    this.loadUserProfile()
  },

  async loadUserProfile() {
    this.setData({ loading: true })
    try {
      const openid = await getApp().getOpenid()
      let query = db.collection('users')
      if (openid) {
        query = query.where({ _openid: openid })
      }
      const { data } = await query
        .limit(1)
        .get()

      if (data.length > 0) {
        this.setData({ userInfo: data[0] })
        this.loadStats(data[0])
      } else {
        // 首次使用，创建用户记录（昵称默认"勾友"）
        const now = new Date().toISOString()
        const newUser = {
          nickname: '勾友',
          avatar_url: '',
          bio: '',
          sop_count: 0,
          fork_count: 0,
          created_at: now,
          updated_at: now,
        }
        const { _id } = await db.collection('users').add({ data: newUser })
        newUser._id = _id
        this.setData({ userInfo: newUser })
        // 新用户自动弹出编辑面板引导设置昵称头像
        setTimeout(() => this.showEdit(), 300)
      }
    } catch (e) {
      console.error('加载用户信息失败', e)
    }
    this.setData({ loading: false })
  },

  async loadStats(user) {
    try {
      const openid = await getApp().getOpenid()
      const w = openid ? { _openid: openid } : {}
      // 查 SOP 数量（自己创建的，非 fork）
      const mySops = await db.collection('sops')
        .where({ ...w, forked_from: db.command.eq(null) })
        .count()
      // Fork 来的 SOP
      const forkedSops = await db.collection('sops')
        .where({ ...w, forked_from: db.command.neq(null) })
        .count()
      // 使用次数
      const usages = await db.collection('usages')
        .where(w)
        .count()

      this.setData({
        sopCount: mySops.total,
        forkCount: forkedSops.total,
        usageCount: usages.total,
      })
    } catch (e) {
      console.error('加载统计失败', e)
    }
  },

  // 编辑资料
  showEdit() {
    const user = this.data.userInfo
    this.setData({
      showEditPanel: true,
      tempAvatarUrl: user.avatar_url,
      tempNickname: user.nickname,
      tempBio: user.bio || '',
    })
  },

  hideEdit() {
    this.setData({ showEditPanel: false })
  },

  onChooseAvatar(e) {
    this.setData({ tempAvatarUrl: e.detail.avatarUrl })
  },

  onNicknameInput(e) {
    this.setData({ tempNickname: e.detail.value })
  },

  onNicknameBlur(e) {
    this.setData({ tempNickname: e.detail.value })
  },

  onBioInput(e) {
    this.setData({ tempBio: e.detail.value })
  },

  async saveProfile() {
    const { tempNickname, tempBio, tempAvatarUrl, userInfo } = this.data

    if (!tempNickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })

    let avatarUrl = userInfo.avatar_url

    // 如果头像是临时路径，需要上传到云存储
    if (tempAvatarUrl && tempAvatarUrl !== userInfo.avatar_url && !tempAvatarUrl.startsWith('cloud://')) {
      try {
        const ext = tempAvatarUrl.split('.').pop() || 'jpg'
        const cloudPath = `avatars/${Date.now()}.${ext}`
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: tempAvatarUrl,
        })
        // 获取永久链接
        const { fileList } = await wx.cloud.getTempFileURL({
          fileList: [uploadRes.fileID],
        })
        if (fileList && fileList[0] && fileList[0].tempFileURL) {
          avatarUrl = fileList[0].tempFileURL
        }
      } catch (e) {
        console.error('头像上传失败', e)
      }
    }

    const now = new Date().toISOString()
    const updateData = {
      nickname: tempNickname.trim(),
      avatar_url: avatarUrl,
      bio: tempBio.trim(),
      updated_at: now,
    }

    try {
      await db.collection('users').doc(userInfo._id).update({ data: updateData })
      this.setData({
        userInfo: { ...userInfo, ...updateData },
        showEditPanel: false,
      })
      wx.showToast({ title: '已保存', icon: 'success' })
      // 更新全局用户信息
      getApp().globalData.userInfo = { ...userInfo, ...updateData }
    } catch (e) {
      console.error('保存失败', e)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
    wx.hideLoading()
  },

  goToMySops() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  goToHistory() {
    wx.switchTab({ url: '/pages/history/history' })
  },

  showAbout() {
    wx.showModal({
      title: '勾GO',
      content: '勾完再走 🎯\nSOP版GitHub — 出行前打勾确认，清单分享社区\n\nv1.0.0',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#4ecdc4',
    })
  },
})
