App({
  globalData: {
    sopNeedsRefresh: false,
    userInfo: null,
    openid: null,
    _openidReady: null,  // Promise，其他页面可 await
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    // 获取 openid 后再加载用户信息
    this.globalData._openidReady = this._initOpenid()
  },

  async _initOpenid() {
    try {
      const { result } = await wx.cloud.callFunction({ name: 'getOpenid' })
      this.globalData.openid = result.openid
    } catch (e) {
      console.error('获取openid失败', e)
    }
    await this.loadUserInfo()
  },

  async loadUserInfo() {
    const openid = this.globalData.openid
    if (!openid) return
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('users')
        .where({ _openid: openid })
        .limit(1)
        .get()
      if (data.length > 0) {
        this.globalData.userInfo = data[0]
      }
    } catch (e) {
      console.error('预加载用户信息失败', e)
    }
  },

  /** 等 openid 就绪，供各页面调用 */
  async getOpenid() {
    if (this.globalData.openid) return this.globalData.openid
    await this.globalData._openidReady
    return this.globalData.openid
  },
})
