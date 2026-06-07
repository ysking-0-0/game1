/**
 * 游戏全局配置
 */
const config = {
  // 画布尺寸（竖屏）
  canvasWidth: 750,
  canvasHeight: 1334,

  // 顶部信息栏
  topBar: {
    height: 80,
    fontSize: 28,
    padding: 20
  },

  // 表情区域
  expression: {
    width: 120,
    height: 120,
    y: 100  // 距顶部
  },

  // 垃圾桶配置
  bins: {
    y: 240,        // 距顶部
    width: 110,
    height: 130,
    gap: 20,       // 桶间距
    labelSize: 20, // 标签字号
    highlightScale: 1.15 // 拖拽靠近时放大
  },

  // 进度条
  progressBar: {
    y: 420,
    height: 40,
    padding: 30,
    truckWidth: 60,
    binIconWidth: 50
  },

  // 垃圾堆区域
  trashArea: {
    topY: 500,     // 起始Y
    bottomY: 1280, // 结束Y
    itemSize: 90   // 垃圾图标大小
  },

  // 垃圾分类定义
  categories: [
    { id: 'recyclable', name: '可回收', color: '#2196F3', icon: '♻️' },
    { id: 'wet',        name: '湿垃圾', color: '#8B4513', icon: '🍎' },
    { id: 'harmful',    name: '有害',   color: '#F44336', icon: '🔋' },
    { id: 'dry',        name: '干垃圾', color: '#9E9E9E', icon: '🗑️' },
    { id: 'other',      name: '其他',   color: '#2E7D32', icon: '🟢' }
  ],

  // 关卡配置
  levels: [
    { id: 1,  trashCount: 5,  time: 60, background: 'backgrounds/bg1.png' },
    { id: 2,  trashCount: 8,  time: 60, background: 'backgrounds/bg2.png' },
    { id: 3,  trashCount: 10, time: 50, background: 'backgrounds/bg3.png' },
    { id: 4,  trashCount: 12, time: 50, background: 'backgrounds/bg4.png' },
    { id: 5,  trashCount: 15, time: 45, background: 'backgrounds/bg5.png' },
    { id: 6,  trashCount: 15, time: 40, background: 'backgrounds/bg6.png' },
    { id: 7,  trashCount: 18, time: 40, background: 'backgrounds/bg7.png' },
    { id: 8,  trashCount: 20, time: 35, background: 'backgrounds/bg8.png' },
    { id: 9,  trashCount: 20, time: 30, background: 'backgrounds/bg9.png' }
  ],

  // 计分规则
  scoring: {
    correct: 10,        // 正确投放
    wrong: -5,          // 错误投放
    comboBonus: 5,      // 连击加成（每连击+5）
    maxComboDisplay: 99 // 最大连击显示
  },

  // 反馈配置
  feedback: {
    vibration: true,    // 震动反馈
    comboThreshold: 3,  // 连击多少触发特殊表情
    hesitationTime: 5,  // 犹豫时间（秒）
    urgentPercent: 0.8  // 进度条百分比触发紧急表情
  },

  // 表情映射
  expressions: {
    correct:    'expressions/03-happy.png',
    combo:      'expressions/08-laugh.png',
    highScore:  'expressions/09-proud.png',
    wrong:      'expressions/01-sad.png',
    angry:      'expressions/05-angry.png',
    confused:   'expressions/06-confused.png',
    shocked:    'expressions/02-shocked.png',
    win:        'expressions/08-laugh.png',
    lose:       'expressions/04-cry.png'
  },

  // 音效配置
  audio: {
    correct:  'audio/correct.mp3',
    wrong:    'audio/wrong.mp3',
    combo:    'audio/combo.mp3',
    win:      'audio/win.mp3',
    lose:     'audio/lose.mp3',
    click:    'audio/click.mp3',
    bgm:      'audio/bgm.mp3'
  }
};

module.exports = config;
