/**
 * SOP 海报生成 mixin
 * 使用 Canvas 2D API
 */

function createPosterMixin() {
  return {
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

    generatePoster() {
      this.setData({ drawingPoster: true }, () => {
        setTimeout(() => this.drawPoster(), 100)
      })
    },

    drawPoster() {
      const sop = this.data.sop
      const w = 600, h = 800

      const query = wx.createSelectorQuery()
      query.select('#posterCanvas').fields({ node: true, size: true }).exec((res) => {
        if (!res[0]) {
          this.setData({ drawingPoster: false })
          wx.showToast({ title: '海报生成失败', icon: 'none' })
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getWindowInfo().pixelRatio
        canvas.width = w * dpr
        canvas.height = h * dpr
        ctx.scale(dpr, dpr)

        // 背景渐变
        const grad = ctx.createLinearGradient(0, 0, 0, h)
        grad.addColorStop(0, '#1a1a2e')
        grad.addColorStop(0.5, '#16213e')
        grad.addColorStop(1, '#0f3460')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)

        // 品牌色顶部装饰条
        const brandGrad = ctx.createLinearGradient(0, 0, w, 0)
        brandGrad.addColorStop(0, '#4ecdc4')
        brandGrad.addColorStop(1, '#44b09e')
        ctx.fillStyle = brandGrad
        ctx.fillRect(0, 0, w, 8)

        // Emoji
        ctx.font = '64px sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(sop.emoji || '📋', w / 2, 100)

        // 标题
        ctx.font = '36px sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const title = sop.title.length > 16 ? sop.title.substring(0, 16) + '...' : sop.title
        ctx.fillText(title, w / 2, 175)

        // 分类
        if (sop.category) {
          ctx.font = '22px sans-serif'
          ctx.fillStyle = 'rgba(255,255,255,0.5)'
          ctx.fillText(sop.category, w / 2, 215)
        }

        // 分隔线
        ctx.strokeStyle = '#4ecdc4'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(80, 250)
        ctx.lineTo(w - 80, 250)
        ctx.stroke()

        // 分组统计
        let y = 300
        if (sop.groups) {
          sop.groups.forEach((g, i) => {
            if (i >= 6) return
            ctx.font = '26px sans-serif'
            ctx.fillStyle = '#4ecdc4'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            ctx.fillText(g.name, 80, y)
            ctx.font = '24px sans-serif'
            ctx.fillStyle = 'rgba(255,255,255,0.6)'
            ctx.textAlign = 'right'
            ctx.fillText(g.items.length + '项', w - 80, y)
            y += 50
          })
        }

        // 总计
        const totalItems = (sop.groups || []).reduce((s, g) => s + (g.items ? g.items.length : 0), 0)
        y += 20
        ctx.font = '22px sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.textAlign = 'center'
        ctx.fillText(`共 ${totalItems} 项 · SOP Check`, w / 2, y)

        // 小程序码占位
        const qrSize = 100
        const qrX = (w - qrSize) / 2
        const qrY = h - 180
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.fillRect(qrX, qrY, qrSize, qrSize)
        ctx.font = '18px sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.textAlign = 'center'
        ctx.fillText('小程序码', w / 2, qrY + qrSize / 2)

        // 底部提示
        ctx.font = '20px sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.fillText('扫码或长按识别使用此SOP', w / 2, h - 40)

        // Canvas 2D 是即时渲染，无需 ctx.draw()
        // 延迟一下确保渲染完成后再导出
        setTimeout(() => {
          wx.canvasToTempFilePath({
            canvas: canvas,
            width: w * dpr,
            height: h * dpr,
            destWidth: w * 2,
            destHeight: h * 2,
            success: (res) => {
              this.setData({ posterUrl: res.tempFilePath, drawingPoster: false })
            },
            fail: () => {
              this.setData({ drawingPoster: false })
              wx.showToast({ title: '海报生成失败', icon: 'none' })
            }
          })
        }, 300)
      })
    },
  }
}

module.exports = createPosterMixin
