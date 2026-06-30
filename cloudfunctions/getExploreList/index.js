// 云函数：获取广场SOP列表
// 支持分页、分类筛选、搜索
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const {
    category,
    search,
    page = 0,
    pageSize = 20,
  } = event

  const skip = page * pageSize

  // 构建查询条件
  let where = {
    is_public: _.eq(true),
  }

  if (category && category !== 'all') {
    where.category = category
  }

  if (search) {
    where.title = db.RegExp({
      regexp: search,
      options: 'i',
    })
  }

  try {
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
        created_at: true,
      })
      .get()

    // 计算每个SOP的条目数
    const enriched = data.map(sop => ({
      ...sop,
      item_count: (sop.groups || []).reduce((sum, g) => sum + (g.items || []).length, 0),
      fork_count: sop.fork_count || 0,
    }))

    return {
      data: enriched,
      hasMore: data.length === pageSize,
      page,
    }
  } catch (e) {
    console.error('getExploreList error:', e)
    return {
      data: [],
      hasMore: false,
      page: 0,
      error: e.message,
    }
  }
}
