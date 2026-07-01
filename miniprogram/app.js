App({
  globalData: {
    sopNeedsRefresh: false,
    userInfo: null,
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    // 预加载用户信息
    this.loadUserInfo()
  },

  async loadUserInfo() {
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('users')
        .where({ _openid: '{openid}' })
        .limit(1)
        .get()
      if (data.length > 0) {
        this.globalData.userInfo = data[0]
      }
    } catch (e) {
      console.error('预加载用户信息失败', e)
    }
  },
})
