/**
 * 垃圾数据 - 每种垃圾对应的分类
 * category: recyclable(可回收), wet(湿垃圾), harmful(有害), dry(干垃圾), other(其他)
 */
const trashData = [
  // 可回收垃圾
  { id: 't01', name: '塑料瓶',  category: 'recyclable', image: 'trash/塑料瓶1.png' },
  { id: 't02', name: '旧T恤',   category: 'recyclable', image: 'trash/旧T恤1.png' },
  { id: 't03', name: '杂志',    category: 'recyclable', image: 'trash/杂志1.png' },
  { id: 't04', name: '牛奶盒',  category: 'recyclable', image: 'trash/牛奶盒1.png' },
  { id: 't05', name: '玻璃瓶',  category: 'recyclable', image: 'trash/玻璃瓶1.png' },
  { id: 't06', name: '纸团',    category: 'recyclable', image: 'trash/纸团1.jpg' },
  { id: 't07', name: '纸盒',    category: 'recyclable', image: 'trash/纸盒.png' },
  { id: 't08', name: '运动鞋',  category: 'recyclable', image: 'trash/运动鞋1.png' },

  // 湿垃圾
  { id: 't09', name: '发霉菜叶', category: 'wet', image: 'trash/发霉菜叶.png' },
  { id: 't10', name: '变质糊状物', category: 'wet', image: 'trash/变质糊状物.png' },
  { id: 't11', name: '坏鸡蛋',  category: 'wet', image: 'trash/坏鸡蛋.png' },
  { id: 't12', name: '玉米',    category: 'wet', image: 'trash/玉米.jpg' },
  { id: 't13', name: '腐烂番茄', category: 'wet', image: 'trash/腐烂番茄.png' },
  { id: 't14', name: '西瓜皮',  category: 'wet', image: 'trash/西瓜皮.png' },
  { id: 't15', name: '馊米饭',  category: 'wet', image: 'trash/馊米饭.png' },
  { id: 't16', name: '龙虾残骸', category: 'wet', image: 'trash/龙虾残骸.png' },

  // 有害垃圾
  { id: 't17', name: '废节能灯泡', category: 'harmful', image: 'trash/废节能灯泡.png' },
  { id: 't18', name: '损坏温度计', category: 'harmful', image: 'trash/损坏的温度计.jpg' },
  { id: 't19', name: '过期杀虫剂', category: 'harmful', image: 'trash/过期杀虫剂.jpg' },
  { id: 't20', name: '过期电池', category: 'harmful', image: 'trash/过期电池.png' },
  { id: 't21', name: '过期药',  category: 'harmful', image: 'trash/过期药.png' },
  { id: 't22', name: '颜料桶',  category: 'harmful', image: 'trash/颜料桶.png' },

  // 干垃圾
  { id: 't23', name: '口香糖',  category: 'dry', image: 'trash/口香糖.png' },
  { id: 't24', name: '啃咬骨头', category: 'dry', image: 'trash/啃咬骨头.png' },
  { id: 't25', name: '带肉骨头', category: 'dry', image: 'trash/带肉骨头.png' },
  { id: 't26', name: '毛发污垢', category: 'dry', image: 'trash/毛发污垢.png' },
  { id: 't27', name: '沾污勺子', category: 'dry', image: 'trash/沾污勺子.png' },
  { id: 't28', name: '烟蒂',    category: 'dry', image: 'trash/烟蒂.png' },
  { id: 't29', name: '碎瓷片',  category: 'dry', image: 'trash/碎瓷片.png' },
  { id: 't30', name: '脏手套',  category: 'dry', image: 'trash/脏手套.png' },
  { id: 't31', name: '脏抹布',  category: 'dry', image: 'trash/脏抹布.png' },

  // 其他垃圾（暂无素材，可用干垃圾中的作为补充）
  // 如有其他垃圾素材可在此添加
];

/**
 * 根据分类获取垃圾列表
 */
function getTrashByCategory(category) {
  return trashData.filter(t => t.category === category);
}

/**
 * 随机选取指定数量的垃圾
 */
function getRandomTrash(count) {
  const shuffled = [...trashData].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * 按关卡获取垃圾（保证每类都有）
 */
function getTrashForLevel(count) {
  const categories = ['recyclable', 'wet', 'harmful', 'dry'];
  const result = [];

  // 每类至少1个
  categories.forEach(cat => {
    const items = getTrashByCategory(cat);
    if (items.length > 0) {
      result.push(items[Math.floor(Math.random() * items.length)]);
    }
  });

  // 剩余随机填充
  const remaining = count - result.length;
  if (remaining > 0) {
    const extra = getRandomTrash(remaining);
    // 避免重复
    extra.forEach(item => {
      if (!result.find(r => r.id === item.id)) {
        result.push(item);
      }
    });
    // 如果还不够，允许重复
    while (result.length < count) {
      result.push(trashData[Math.floor(Math.random() * trashData.length)]);
    }
  }

  // 打乱顺序
  return result.sort(() => Math.random() - 0.5).slice(0, count);
}

module.exports = { trashData, getTrashByCategory, getRandomTrash, getTrashForLevel };
