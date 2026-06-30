# 勾GO 🎯

> **勾完再走** — 出行前打勾确认，SOP清单分享社区

SOP 版的 GitHub：创建清单 → 打勾确认 → 分享给朋友 → 别人 Fork 改进

---

## ✨ 核心功能

| 功能 | 说明 |
|---|---|
| 📋 **创建SOP** | 分组 + 条目 + 优先级（🔴必带 / 🟡推荐 / ⚪可选） |
| ✅ **打勾确认** | 出行前逐项打勾，进度追踪 + 必带提醒 |
| 🎉 **完成庆祝** | 全部勾完有动画特效，安心出发 |
| 🔗 **分享给好友** | 微信分享 / Canvas海报，一键传播 |
| 🍴 **Fork** | 一键复制别人的SOP到自己名下，自由修改 |
| 📊 **标签切换** | "我的SOP" / "Fork来的" 分类管理 |

## 🎬 使用流程

```
创建SOP → 逐项打勾确认 → 全部完成 ✓ → 安心出发
    ↓
  分享给朋友 → 朋友打开 → Fork到自己名下 → 按需修改
```

## 📱 页面结构

| 页面 | 功能 |
|---|---|
| 首页 | SOP列表 + 搜索 + 标签切换（我的/Fork来的） |
| 广场 | 热门SOP浏览 + 分类筛选 + 搜索 |
| 历史 | 使用记录 + 统计概览 |
| SOP详情 | 查看 / 编辑 / 分享 / 公开设置 |
| 打勾页 | 逐项确认 + 进度条 + 动画 |
| 分享页 | 只读预览 + Fork按钮 |

## 🛠️ 技术栈

- **框架**：微信小程序原生（MINA）
- **后端**：微信云开发（CloudBase）
- **数据库**：云数据库（sops / usages 集合）+ 本地缓存降级
- **分享**：onShareAppMessage + Canvas 2D 海报生成

## 🚀 快速开始

1. 克隆仓库
```bash
git clone https://github.com/TheProudSoul/sop-check.git
```

2. 用微信开发者工具导入项目

3. 替换 `project.config.json` 中的 `appid` 为你自己的

4. 开通云开发，创建数据库集合：
   - `sops` — SOP数据
   - `usages` — 使用记录

5. 编译运行

## 📐 数据模型

```
sop: {
  _id, title, emoji, category,
  groups: [{
    name: string,
    items: [{
      name: string,
      note: string,
      priority: 'must' | 'recommended' | 'optional'
    }]
  }],
  author_id, forked_from, fork_count,
  created_at, updated_at
}

usage: {
  sop_id, sop_title,
  checked_count, total_count,
  finished_at
}
```

## 🗺️ Roadmap

- [x] MVP：创建/编辑/打勾
- [x] Bug修复 + UI美化
- [x] 分享 + Fork
- [x] 社区广场（浏览热门SOP模板）
- [x] 使用历史（每次打勾的记录）
- [ ] PR机制（向原作者建议修改）
- [ ] 版本Diff（两版SOP对比）
- [ ] AI生成SOP

## 📄 License

MIT

---

**勾GO — 勾完再走** 🎯
