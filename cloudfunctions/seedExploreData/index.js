const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const now = new Date().toISOString()

  const seeds = [
    {
      title: '越野跑装包清单',
      emoji: '🏃',
      category: '越野跑',
      groups: [
        {
          name: '穿着装备',
          items: [
            { name: '越野跑鞋', note: '检查鞋底磨损', priority: 'must' },
            { name: '速干T恤', note: '', priority: 'must' },
            { name: '越野短裤/压缩裤', note: '', priority: 'must' },
            { name: '遮阳帽/空顶帽', note: '夏天必备', priority: 'must' },
            { name: '运动袜', note: '建议五指袜防水泡', priority: 'must' },
            { name: '防风外套', note: '山顶温差大', priority: 'recommend' },
            { name: '手套', note: '冬季/高海拔', priority: 'optional' }
          ]
        },
        {
          name: '补给装备',
          items: [
            { name: '越野背包/水袋包', note: '检查水袋是否漏水', priority: 'must' },
            { name: '软水壶×2', note: '至少1L水', priority: 'must' },
            { name: '能量胶×3', note: '', priority: 'must' },
            { name: '盐丸', note: '长距离必带', priority: 'recommend' },
            { name: '能量棒', note: '', priority: 'recommend' }
          ]
        },
        {
          name: '安全装备',
          items: [
            { name: '手机（满电）', note: '下载离线地图', priority: 'must' },
            { name: '急救毯', note: '强制装备', priority: 'must' },
            { name: '口哨', note: '强制装备', priority: 'must' },
            { name: '头灯', note: '天黑/隧道用', priority: 'recommend' },
            { name: '绷带/创可贴', note: '', priority: 'recommend' }
          ]
        },
        {
          name: '赛事物品',
          items: [
            { name: '参赛号码布', note: '', priority: 'must' },
            { name: '计时芯片', note: '', priority: 'must' },
            { name: '身份证', note: '', priority: 'must' }
          ]
        }
      ],
      is_public: true,
      fork_count: 0,
      forked_from: null,
      author_id: '',
      author_name: '山野跑者',
      author_avatar: '',
      created_at: now,
      updated_at: now
    },
    {
      title: '周末露营检查表',
      emoji: '⛺',
      category: '露营',
      groups: [
        {
          name: '住宿装备',
          items: [
            { name: '帐篷（含地钉风绳）', note: '提前检查有无破损', priority: 'must' },
            { name: '睡袋', note: '注意温标匹配', priority: 'must' },
            { name: '防潮垫/充气垫', note: '', priority: 'must' },
            { name: '枕头', note: '充气枕轻便', priority: 'recommend' }
          ]
        },
        {
          name: '炊具食材',
          items: [
            { name: '炉头+气罐', note: '检查气罐余量', priority: 'must' },
            { name: '套锅', note: '', priority: 'must' },
            { name: '餐具（碗筷杯）', note: '', priority: 'must' },
            { name: '打火机/火柴', note: '', priority: 'must' },
            { name: '饮用水/净水器', note: '', priority: 'must' },
            { name: '食材（提前规划菜单）', note: '', priority: 'must' },
            { name: '调料包', note: '', priority: 'recommend' },
            { name: '垃圾袋', note: 'LNT无痕露营', priority: 'must' }
          ]
        },
        {
          name: '照明与电力',
          items: [
            { name: '营地灯', note: '', priority: 'must' },
            { name: '头灯', note: '', priority: 'must' },
            { name: '充电宝', note: '满电出发', priority: 'must' },
            { name: '备用电池', note: '', priority: 'recommend' }
          ]
        },
        {
          name: '个人物品',
          items: [
            { name: '防晒霜', note: '', priority: 'recommend' },
            { name: '驱蚊液', note: '', priority: 'recommend' },
            { name: '急救包', note: '', priority: 'must' },
            { name: '换洗衣物', note: '', priority: 'must' },
            { name: '洗漱用品', note: '', priority: 'recommend' }
          ]
        }
      ],
      is_public: true,
      fork_count: 0,
      forked_from: null,
      author_id: '',
      author_name: '露营达人',
      author_avatar: '',
      created_at: now,
      updated_at: now
    },
    {
      title: '出差行李打包',
      emoji: '💼',
      category: '出差',
      groups: [
        {
          name: '证件与票务',
          items: [
            { name: '身份证', note: '', priority: 'must' },
            { name: '机票/车票（电子+截图）', note: '', priority: 'must' },
            { name: '酒店确认单', note: '', priority: 'must' },
            { name: '名片', note: '', priority: 'recommend' }
          ]
        },
        {
          name: '电子设备',
          items: [
            { name: '笔记本电脑+充电器', note: '', priority: 'must' },
            { name: '手机充电器/数据线', note: '', priority: 'must' },
            { name: '充电宝', note: '', priority: 'must' },
            { name: '转接头', note: 'Type-C/Lightning', priority: 'recommend' },
            { name: '耳机', note: '', priority: 'recommend' }
          ]
        },
        {
          name: '衣物',
          items: [
            { name: '正装/商务装', note: '按天数准备', priority: 'must' },
            { name: '内衣袜子', note: '多带一套备用', priority: 'must' },
            { name: '睡衣', note: '', priority: 'optional' },
            { name: '运动装', note: '有健身计划时', priority: 'optional' }
          ]
        },
        {
          name: '洗漱用品',
          items: [
            { name: '牙刷牙膏', note: '', priority: 'must' },
            { name: '洗面奶', note: '', priority: 'must' },
            { name: '毛巾', note: '酒店的不放心可自带', priority: 'recommend' },
            { name: '剃须刀', note: '', priority: 'recommend' },
            { name: '护肤品小样', note: '', priority: 'optional' }
          ]
        }
      ],
      is_public: true,
      fork_count: 0,
      forked_from: null,
      author_id: '',
      author_name: '商旅常客',
      author_avatar: '',
      created_at: now,
      updated_at: now
    },
    {
      title: '长途旅行必备',
      emoji: '✈️',
      category: '旅行',
      groups: [
        {
          name: '证件资料',
          items: [
            { name: '护照/身份证', note: '检查有效期>6个月', priority: 'must' },
            { name: '签证', note: '确认入境要求', priority: 'must' },
            { name: '机票行程单', note: '', priority: 'must' },
            { name: '酒店预订确认', note: '', priority: 'must' },
            { name: '旅行保险', note: '强烈建议购买', priority: 'recommend' },
            { name: '证件复印件/电子备份', note: '', priority: 'recommend' }
          ]
        },
        {
          name: '电子装备',
          items: [
            { name: '手机+充电器', note: '', priority: 'must' },
            { name: '充电宝', note: '飞机限制20000mAh', priority: 'must' },
            { name: '万能转换插头', note: '查目的地插座标准', priority: 'must' },
            { name: '相机+存储卡', note: '', priority: 'optional' },
            { name: '耳机', note: '', priority: 'recommend' }
          ]
        },
        {
          name: '衣物与洗漱',
          items: [
            { name: '内衣×天数+1', note: '', priority: 'must' },
            { name: '外套（飞机/空调用）', note: '', priority: 'must' },
            { name: '拖鞋', note: '', priority: 'recommend' },
            { name: '洗漱包', note: '液体<100ml装透明袋', priority: 'must' },
            { name: '防晒霜', note: '', priority: 'recommend' }
          ]
        },
        {
          name: '应急物品',
          items: [
            { name: '常用药品', note: '感冒/肠胃/创可贴/晕车', priority: 'must' },
            { name: '现金+银行卡', note: '备少量当地货币', priority: 'must' },
            { name: '紧急联系人卡片', note: '', priority: 'recommend' },
            { name: '便携雨伞', note: '', priority: 'recommend' }
          ]
        }
      ],
      is_public: true,
      fork_count: 0,
      forked_from: null,
      author_id: '',
      author_name: '环球旅人',
      author_avatar: '',
      created_at: now,
      updated_at: now
    },
    {
      title: '搬家不遗漏指南',
      emoji: '📦',
      category: '搬家',
      groups: [
        {
          name: '搬家前一周',
          items: [
            { name: '确认搬家日期和车辆', note: '', priority: 'must' },
            { name: '通知物业/房东', note: '', priority: 'must' },
            { name: '断舍离：丢/捐/卖', note: '越早越好', priority: 'recommend' },
            { name: '准备纸箱和打包材料', note: '', priority: 'must' },
            { name: '贵重物品清单拍照', note: '留证据', priority: 'recommend' }
          ]
        },
        {
          name: '打包日',
          items: [
            { name: '按房间分类打包', note: '每箱贴标签', priority: 'must' },
            { name: '易碎品用气泡膜', note: '', priority: 'must' },
            { name: '当天要用的单独一箱', note: '洗漱/充电器/换洗衣物', priority: 'must' },
            { name: '冰箱断电除霜', note: '提前一天', priority: 'must' },
            { name: '拍摄电器接线照片', note: '方便到新家接回去', priority: 'recommend' }
          ]
        },
        {
          name: '搬家当天',
          items: [
            { name: '检查所有房间/抽屉/柜子', note: '逐间巡查', priority: 'must' },
            { name: '检查阳台/卫生间/厨房', note: '', priority: 'must' },
            { name: '水电气关闭', note: '', priority: 'must' },
            { name: '钥匙归还/交接', note: '', priority: 'must' },
            { name: '新家验收', note: '水电网是否正常', priority: 'must' }
          ]
        },
        {
          name: '搬入后',
          items: [
            { name: '宽带/水电过户', note: '', priority: 'must' },
            { name: '更新收货地址', note: '快递/外卖/银行', priority: 'must' },
            { name: '认识邻居/物业', note: '', priority: 'optional' }
          ]
        }
      ],
      is_public: true,
      fork_count: 0,
      forked_from: null,
      author_id: '',
      author_name: '搬家老手',
      author_avatar: '',
      created_at: now,
      updated_at: now
    },
    {
      title: '马拉松赛前检查',
      emoji: '🏅',
      category: '跑步',
      groups: [
        {
          name: '赛前物品',
          items: [
            { name: '参赛号码布', note: '别针固定好', priority: 'must' },
            { name: '计时芯片', note: '绑鞋上', priority: 'must' },
            { name: '身份证', note: '', priority: 'must' },
            { name: '赛事手册/路线图', note: '', priority: 'recommend' }
          ]
        },
        {
          name: '穿着',
          items: [
            { name: '跑鞋', note: '穿旧不穿新！', priority: 'must' },
            { name: '速干衣裤', note: '赛前试穿过的', priority: 'must' },
            { name: '运动内衣', note: '防磨', priority: 'must' },
            { name: '帽子/头带', note: '', priority: 'recommend' },
            { name: '一次性雨衣', note: '寄存前保暖/雨天', priority: 'recommend' },
            { name: '乳贴/凡士林', note: '防乳头磨伤', priority: 'recommend' }
          ]
        },
        {
          name: '补给',
          items: [
            { name: '能量胶×4', note: '每10km一个', priority: 'must' },
            { name: '盐丸', note: '', priority: 'recommend' },
            { name: '赛前早餐', note: '赛前2-3小时吃完', priority: 'must' }
          ]
        },
        {
          name: '赛后',
          items: [
            { name: '保暖衣物（寄存袋）', note: '赛后降温快', priority: 'must' },
            { name: '拖鞋', note: '赛后解放双脚', priority: 'recommend' },
            { name: '手机+充电宝', note: '拍奖牌照！', priority: 'must' }
          ]
        }
      ],
      is_public: true,
      fork_count: 0,
      forked_from: null,
      author_id: '',
      author_name: '跑马老司机',
      author_avatar: '',
      created_at: now,
      updated_at: now
    },
    {
      title: '考试当天清单',
      emoji: '📝',
      category: '考试',
      groups: [
        {
          name: '证件',
          items: [
            { name: '准考证', note: '打印2份', priority: 'must' },
            { name: '身份证', note: '', priority: 'must' },
            { name: '学生证', note: '', priority: 'optional' }
          ]
        },
        {
          name: '文具',
          items: [
            { name: '2B铅笔×3', note: '削好备用', priority: 'must' },
            { name: '黑色签字笔×2', note: '', priority: 'must' },
            { name: '橡皮', note: '', priority: 'must' },
            { name: '直尺', note: '', priority: 'recommend' },
            { name: '透明文具袋', note: '', priority: 'recommend' }
          ]
        },
        {
          name: '个人物品',
          items: [
            { name: '手表（非智能）', note: '部分考场禁止', priority: 'recommend' },
            { name: '水杯（透明无标签）', note: '', priority: 'must' },
            { name: '纸巾', note: '', priority: 'recommend' },
            { name: '巧克力/糖', note: '考间补充能量', priority: 'optional' },
            { name: '外套', note: '空调房冷', priority: 'recommend' }
          ]
        },
        {
          name: '注意事项',
          items: [
            { name: '手机关机放考场外', note: '带了就关机', priority: 'must' },
            { name: '提前30分钟到', note: '', priority: 'must' },
            { name: '上厕所', note: '考前解决', priority: 'recommend' }
          ]
        }
      ],
      is_public: true,
      fork_count: 0,
      forked_from: null,
      author_id: '',
      author_name: '学霸笔记',
      author_avatar: '',
      created_at: now,
      updated_at: now
    },
    {
      title: '健身房日常装备',
      emoji: '💪',
      category: '健身',
      groups: [
        {
          name: '穿着',
          items: [
            { name: '运动鞋', note: '', priority: 'must' },
            { name: '速干T恤', note: '', priority: 'must' },
            { name: '运动短裤', note: '', priority: 'must' },
            { name: '运动袜', note: '', priority: 'must' },
            { name: '运动内衣', note: '', priority: 'recommend' }
          ]
        },
        {
          name: '训练辅助',
          items: [
            { name: '水杯', note: '', priority: 'must' },
            { name: '毛巾', note: '', priority: 'must' },
            { name: '手套/握力带', note: '大重量日带', priority: 'optional' },
            { name: '腰带', note: '深蹲/硬拉日带', priority: 'optional' },
            { name: '耳机', note: 'BGM很重要', priority: 'recommend' }
          ]
        },
        {
          name: '洗浴',
          items: [
            { name: '洗发水/沐浴露', note: '小瓶装', priority: 'recommend' },
            { name: '换洗内衣', note: '', priority: 'must' },
            { name: '拖鞋', note: '公共浴室', priority: 'recommend' }
          ]
        }
      ],
      is_public: true,
      fork_count: 0,
      forked_from: null,
      author_id: '',
      author_name: '铁馆常驻',
      author_avatar: '',
      created_at: now,
      updated_at: now
    },
    {
      title: '羽毛球比赛装备',
      emoji: '🏸',
      category: '运动',
      groups: [
        {
          name: '球拍装备',
          items: [
            { name: '球拍×2', note: '一主一备', priority: 'must' },
            { name: '羽毛球×1筒', note: '比赛用球确认型号', priority: 'must' },
            { name: '手胶', note: '赛前换新', priority: 'must' },
            { name: '备用线', note: '', priority: 'optional' }
          ]
        },
        {
          name: '穿着',
          items: [
            { name: '羽毛球鞋', note: '防滑！别穿跑鞋', priority: 'must' },
            { name: '运动T恤×2', note: '备用换的', priority: 'must' },
            { name: '运动短裤', note: '', priority: 'must' },
            { name: '运动袜×2双', note: '厚底防磨', priority: 'must' },
            { name: '头带/护腕', note: '吸汗', priority: 'recommend' }
          ]
        },
        {
          name: '补给与恢复',
          items: [
            { name: '水杯/运动饮料', note: '', priority: 'must' },
            { name: '毛巾', note: '', priority: 'must' },
            { name: '能量棒/香蕉', note: '间歇补充', priority: 'recommend' },
            { name: '护膝/护踝', note: '有伤时带', priority: 'optional' },
            { name: '冰袋/喷雾', note: '急性扭伤应急', priority: 'optional' }
          ]
        }
      ],
      is_public: true,
      fork_count: 0,
      forked_from: null,
      author_id: '',
      author_name: '杀球暴徒',
      author_avatar: '',
      created_at: now,
      updated_at: now
    },
    {
      title: '周末徒步出行',
      emoji: '🥾',
      category: '户外',
      groups: [
        {
          name: '穿着',
          items: [
            { name: '徒步鞋/登山鞋', note: '提前穿合脚', priority: 'must' },
            { name: '速干衣裤', note: '', priority: 'must' },
            { name: '防风外套', note: '山上风大', priority: 'must' },
            { name: '帽子', note: '遮阳/保暖', priority: 'recommend' },
            { name: '登山杖', note: '下山护膝', priority: 'recommend' }
          ]
        },
        {
          name: '背包装备',
          items: [
            { name: '双肩包', note: '20-30L够用', priority: 'must' },
            { name: '饮用水≥1.5L', note: '', priority: 'must' },
            { name: '午餐/零食', note: '三明治+坚果+水果', priority: 'must' },
            { name: '垃圾袋', note: '带走所有垃圾', priority: 'must' },
            { name: '防雨罩', note: '', priority: 'recommend' }
          ]
        },
        {
          name: '安全装备',
          items: [
            { name: '手机（满电+离线地图）', note: '', priority: 'must' },
            { name: '充电宝', note: '', priority: 'must' },
            { name: '急救包', note: '创可贴+碘伏棉片', priority: 'recommend' },
            { name: '口哨', note: '', priority: 'recommend' },
            { name: '头灯', note: '日归可不带', priority: 'optional' }
          ]
        },
        {
          name: '个人物品',
          items: [
            { name: '防晒霜', note: '', priority: 'must' },
            { name: '驱蚊液', note: '夏季丛林', priority: 'recommend' },
            { name: '墨镜', note: '', priority: 'recommend' },
            { name: '纸巾/湿巾', note: '', priority: 'recommend' }
          ]
        }
      ],
      is_public: true,
      fork_count: 0,
      forked_from: null,
      author_id: '',
      author_name: '野路子',
      author_avatar: '',
      created_at: now,
      updated_at: now
    }
  ]

  const results = []
  for (const sop of seeds) {
    try {
      const res = await db.collection('sops').add({ data: sop })
      results.push({ title: sop.title, success: true, id: res._id })
    } catch (e) {
      results.push({ title: sop.title, success: false, error: e.message })
    }
  }

  return { total: seeds.length, results }
}
