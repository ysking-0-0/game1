/**
 * 垃圾分类大作战 - 微信小游戏
 * 从 Web 版完整移植，适配微信小游戏 API
 */
'use strict';

// ===================== 常量 =====================
const C = { W: 375, H: 667, bins: { y: 140, w: 60, h: 72, gap: 6 }, trash: { topY: 270, bottomY: 620, size: 62 } };

// ===================== 分类定义 =====================
const cats = [
  { id: 'recyclable', name: '可回收', color: '#2196F3', img: 'images/bins/bin_1.png' },
  { id: 'wet',        name: '湿垃圾', color: '#8B4513', img: 'images/bins/bin_2.png' },
  { id: 'harmful',    name: '有害',   color: '#F44336', img: 'images/bins/bin_3.png' },
  { id: 'dry',        name: '干垃圾', color: '#9E9E9E', img: 'images/bins/bin_4.png' },
  { id: 'other',      name: '其他',   color: '#2E7D32', img: 'images/bins/bin_5.png' }
];

// ===================== 关卡配置 =====================
const levels = [
  {id:1,n:5,t:60},{id:2,n:8,t:60},{id:3,n:10,t:50},{id:4,n:12,t:50},
  {id:5,n:15,t:45},{id:6,n:15,t:40},{id:7,n:18,t:40},{id:8,n:20,t:35},{id:9,n:20,t:30}
];

// ===================== 垃圾数据 =====================
const trashData = [
  {id:'t01',name:'塑料瓶',cat:'recyclable',img:'images/trash/recyclable_1.png'},
  {id:'t02',name:'旧T恤',cat:'recyclable',img:'images/trash/recyclable_2.png'},
  {id:'t03',name:'杂志',cat:'recyclable',img:'images/trash/recyclable_3.png'},
  {id:'t04',name:'牛奶盒',cat:'recyclable',img:'images/trash/recyclable_4.png'},
  {id:'t05',name:'玻璃瓶',cat:'recyclable',img:'images/trash/recyclable_5.png'},
  {id:'t06',name:'纸团',cat:'recyclable',img:'images/trash/recyclable_6.png'},
  {id:'t07',name:'纸盒',cat:'recyclable',img:'images/trash/recyclable_7.png'},
  {id:'t08',name:'运动鞋',cat:'recyclable',img:'images/trash/recyclable_8.png'},
  {id:'t09',name:'塑料袋',cat:'recyclable',img:'images/trash/recyclable_9.png'},
  {id:'t10',name:'发霉菜叶',cat:'wet',img:'images/trash/wet_1.png'},
  {id:'t11',name:'变质糊状物',cat:'wet',img:'images/trash/wet_2.png'},
  {id:'t12',name:'坏鸡蛋',cat:'wet',img:'images/trash/wet_3.png'},
  {id:'t13',name:'玉米',cat:'wet',img:'images/trash/wet_4.png'},
  {id:'t14',name:'腐烂番茄',cat:'wet',img:'images/trash/wet_5.png'},
  {id:'t15',name:'西瓜皮',cat:'wet',img:'images/trash/wet_6.png'},
  {id:'t16',name:'馊米饭',cat:'wet',img:'images/trash/wet_7.png'},
  {id:'t17',name:'废灯泡',cat:'harmful',img:'images/trash/harmful_1.png'},
  {id:'t18',name:'温度计',cat:'harmful',img:'images/trash/harmful_2.png'},
  {id:'t19',name:'杀虫剂',cat:'harmful',img:'images/trash/harmful_3.png'},
  {id:'t20',name:'过期电池',cat:'harmful',img:'images/trash/harmful_4.png'},
  {id:'t21',name:'过期药',cat:'harmful',img:'images/trash/harmful_5.png'},
  {id:'t22',name:'颜料桶',cat:'harmful',img:'images/trash/harmful_6.png'},
  {id:'t23',name:'口香糖',cat:'dry',img:'images/trash/dry_1.png'},
  {id:'t24',name:'骨头',cat:'dry',img:'images/trash/dry_2.png'},
  {id:'t25',name:'带肉骨头',cat:'dry',img:'images/trash/dry_3.png'},
  {id:'t26',name:'毛发',cat:'dry',img:'images/trash/dry_4.png'},
  {id:'t27',name:'脏勺子',cat:'dry',img:'images/trash/dry_5.png'},
  {id:'t28',name:'烟蒂',cat:'dry',img:'images/trash/dry_6.png'},
  {id:'t29',name:'碎瓷片',cat:'dry',img:'images/trash/dry_7.png'},
  {id:'t30',name:'脏手套',cat:'dry',img:'images/trash/dry_8.png'},
  {id:'t31',name:'脏抹布',cat:'dry',img:'images/trash/dry_9.png'}
];

// ===================== 表情映射（虚化处理后的人物表情） =====================
const exprImgs = {
  correct:  'images/faces/blur_correct.png',   // 03-开心愉悦（抿嘴微笑）
  combo:    'images/faces/blur_combo.png',     // 08-开怀大笑（张嘴大笑）
  wrong:    'images/faces/blur_wrong.png',     // 01-委屈难过（眼角有泪）
  angry:    'images/faces/blur_angry.png',     // 05-愤怒暴躁（眉头紧皱）
  shocked:  'images/faces/blur_shocked.png',   // 02-震惊受惊（瞪眼张嘴）
  confused: 'images/faces/blur_confused.png',  // 06-疑惑困惑（歪头问号）
  win:      'images/faces/blur_win.png',       // 09-俏皮得意（眨眼挥手）
  lose:     'images/faces/blur_lose.png',      // 04-嚎啕大哭（泪流满面）
  idle:     'images/faces/blur_idle.png'       // 07-无奈沮丧（叹气摊手）
};

// ===================== 背景图映射 =====================
const bgImgs = {
  1:'images/backgrounds/bg_1.png', 2:'images/backgrounds/bg_2.png',
  3:'images/backgrounds/bg_3.png', 4:'images/backgrounds/bg_4.png',
  5:'images/backgrounds/bg_5.png', 6:'images/backgrounds/bg_6.png',
  7:'images/backgrounds/bg_7.png', 8:'images/backgrounds/bg_8.png',
  9:'images/backgrounds/bg_9.png'
};

// ===================== Canvas & Context =====================
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 适配设备像素比（Retina 屏清晰渲染，逻辑坐标保持 375x667）
const systemInfo = wx.getSystemInfoSync();
const dpr = systemInfo.pixelRatio || 2;
const screenW = systemInfo.screenWidth;
const screenH = systemInfo.screenHeight;

canvas.width = C.W * dpr;
canvas.height = C.H * dpr;
ctx.scale(dpr, dpr);

// ===================== 图片缓存 =====================
const imgCache = {};
function loadImg(src) {
  if (imgCache[src]) return imgCache[src];
  const img = wx.createImage();
  img.src = src;
  img.onload = () => { img.loaded = true; };
  img.onerror = () => { console.warn('[VisualEye] img load fail:', src); };
  imgCache[src] = img;
  return img;
}

// ===================== 音效 =====================
const audioCache = {};
function loadAudio(src) {
  if (audioCache[src]) return audioCache[src];
  try {
    const audio = wx.createInnerAudioContext();
    audio.onError((err) => {
      // 静默处理音频解码错误（MP3 格式不兼容等）
      console.warn('[Audio] decode fail:', src, err.errMsg || '');
    });
    audio.src = src;
    audioCache[src] = audio;
    return audio;
  } catch(e) {
    console.warn('[Audio] create fail:', src, e.message || '');
    audioCache[src] = null;
    return null;
  }
}
function playAudio(src, loop) {
  const a = audioCache[src];
  if (a) {
    try {
      a.stop();
      if (loop) a.loop = true;
      a.play();
    } catch(e) {
      // 音频播放失败不阻塞游戏
    }
  }
}
function stopAudio(src) {
  const a = audioCache[src];
  if (a) {
    try { a.stop(); } catch(e) {}
  }
}

// ===================== 预加载 =====================
function preloadAll() {
  cats.forEach(c => loadImg(c.img));
  trashData.forEach(t => loadImg(t.img));
  Object.values(exprImgs).forEach(p => loadImg(p));
  Object.values(bgImgs).forEach(p => loadImg(p));
  loadImg('images/ui/truck_1.png');
  loadImg('images/faces/blur_idle.png');

  // 预加载音效
  loadAudio('audio/click.mp3');
  loadAudio('audio/correct.mp3');
  loadAudio('audio/wrong.mp3');
  loadAudio('audio/combo.mp3');
  loadAudio('audio/win.mp3');
  loadAudio('audio/lose.mp3');
  loadAudio('audio/bgm.mp3');
}
preloadAll();

// ===================== 游戏状态 =====================
let state = 'home', homeView = 'main';
let unlocked = 1;
let lv = 1, score = 0, combo = 0, maxCombo = 0, corr = 0, wrng = 0;
let totalT = 60, elapsed = 0, lastTs = 0;
let items = [], remain = 0, drag = null, offX = 0, offY = 0;
let bins = [], expr = 'confused', exprT = 0, anims = [], binHL = {};

// 加载解锁进度
try {
  const saved = wx.getStorageSync('unlockedLevel');
  if (saved) unlocked = saved;
} catch(e) {}

function saveProgress() {
  try { wx.setStorageSync('unlockedLevel', unlocked); } catch(e) {}
}

// ===================== 工具函数 =====================

function getTrash(n) {
  const cs = ['recyclable','wet','harmful','dry'], r = [];
  cs.forEach(c => {
    const s = trashData.filter(t => t.cat === c);
    if (s.length) r.push(s[Math.random() * s.length | 0]);
  });
  while (r.length < n) {
    const t = trashData[Math.random() * trashData.length | 0];
    r.push({...t, id: t.id + '_' + r.length});
  }
  return r.sort(() => Math.random() - .5).slice(0, n);
}

function calcBins() {
  const tw = cats.length * C.bins.w + (cats.length - 1) * C.bins.gap;
  const sx = (C.W - tw) / 2;
  bins = cats.map((c, i) => ({
    id: c.id, cat: c,
    x: sx + i * (C.bins.w + C.bins.gap),
    y: C.bins.y, w: C.bins.w, h: C.bins.h,
    hl: false
  }));
}

function initLv(id) {
  const l = levels.find(ll => ll.id === id);
  if (!l) return;
  lv = id; totalT = l.t; score = 0; combo = 0; maxCombo = 0; corr = 0; wrng = 0; elapsed = 0;
  anims = []; binHL = {}; state = 'playing'; expr = 'confused'; exprT = 0; lastTs = 0;
  const list = getTrash(l.n);
  items = list.map((t, i) => {
    const cols = 4, col = i % cols, row = i / cols | 0;
    const sp = (C.W - 60) / cols, vs = (C.trash.bottomY - C.trash.topY) / Math.ceil(list.length / cols);
    return {
      ...t,
      x: 30 + col * sp + (Math.random() - .5) * 15,
      y: C.trash.topY + row * vs + (Math.random() - .5) * 10,
      w: C.trash.size, h: C.trash.size,
      vis: true, set: false
    };
  });
  remain = items.length;
  calcBins();
}

// ===================== 绘图辅助 =====================

function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function card(x, y, w, h, bg, bd) {
  ctx.save(); rr(x, y, w, h, 8);
  ctx.fillStyle = bg || '#FFF'; ctx.fill();
  ctx.strokeStyle = bd || '#DDD'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}

function btn(txt, x, y, w, h, c, fs) {
  ctx.save(); rr(x, y, w, h, 8);
  ctx.fillStyle = c; ctx.fill();
  ctx.fillStyle = '#FFF'; ctx.font = `bold ${fs || 16}px "Microsoft YaHei"`;
  ctx.textAlign = 'center'; ctx.fillText(txt, x + w / 2, y + h / 2 + 6);
  ctx.restore();
}

function inR(px, py, r) { return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; }

function drawImg(src, x, y, w, h) {
  const img = imgCache[src];
  if (img && img.loaded) {
    ctx.drawImage(img, x, y, w, h);
    return true;
  }
  return false;
}

// ===================== 渲染 =====================

function renderHome() {
  const g = ctx.createLinearGradient(0, 0, 0, C.H);
  g.addColorStop(0, '#667eea'); g.addColorStop(1, '#764ba2');
  ctx.fillStyle = g; ctx.fillRect(0, 0, C.W, C.H);

  if (homeView === 'main') {
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 32px "Microsoft YaHei"'; ctx.textAlign = 'center';
    ctx.fillText('垃圾分类', C.W / 2, 130);
    ctx.font = 'bold 26px "Microsoft YaHei"'; ctx.fillText('大作战', C.W / 2, 165);
    // 垃圾桶展示
    const binW = 50, binH = 60, totalBinW = 5 * binW + 4 * 8, binSx = (C.W - totalBinW) / 2;
    cats.forEach((c, i) => {
      drawImg(c.img, binSx + i * (binW + 8), 195, binW, binH);
    });
    btn('🎮 开始游戏', C.W / 2 - 110, 310, 220, 45, '#4CAF50');
    btn('📋 关卡选择', C.W / 2 - 110, 375, 220, 45, '#2196F3');
  } else {
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 26px "Microsoft YaHei"'; ctx.textAlign = 'center';
    ctx.fillText('关卡选择', C.W / 2, 90);
    btn('← 返回', 20, 30, 70, 32, '#666', 12);
    for (let i = 0; i < 9; i++) {
      const c = i % 3, r = i / 3 | 0;
      const bx = C.W / 2 - 135 + c * 90, by = 130 + r * 90;
      const ok = i + 1 <= unlocked;
      card(bx, by, 70, 70, ok ? '#4CAF50' : '#888', ok ? '#388E3C' : '#666');
      ctx.fillStyle = '#FFF'; ctx.font = 'bold 22px "Microsoft YaHei"'; ctx.textAlign = 'center';
      ctx.fillText(ok ? `${i + 1}` : '🔒', bx + 35, by + 44);
    }
  }
}

function renderGame() {
  // 背景图
  const bgSrc = bgImgs[lv];
  if (!drawImg(bgSrc, 0, 0, C.W, C.H)) {
    const g = ctx.createLinearGradient(0, 0, 0, C.H);
    g.addColorStop(0, '#87CEEB'); g.addColorStop(1, '#90EE90');
    ctx.fillStyle = g; ctx.fillRect(0, 0, C.W, C.H);
  }
  // 背景半透明遮罩
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillRect(0, 0, C.W, C.H);

  // 顶部半透明遮罩（整体下移避开微信菜单栏）
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 35, C.W, 75);

  // 关卡 + 分数
  ctx.fillStyle = '#FFF'; ctx.font = 'bold 16px "Microsoft YaHei"'; ctx.textAlign = 'left';
  ctx.fillText(`第${lv}关`, 12, 57);
  ctx.textAlign = 'center'; ctx.fillText(`⭐${score}分`, C.W / 2, 57);

  // 进度条（一条线，垃圾车在上面行驶）
  const p = Math.min(elapsed / totalT, 1);
  const bx = 15, bw = C.W - 80, by = 70, bh = 22;

  // 垃圾车（在线上方行驶，车底与线间距 2px）
  const truckW = 40, truckH = 28;
  const truckX = bx + bw * p - truckW;
  const truckCenterY = by + bh / 2 - truckH / 2 - 2; // 车底离道路线 2px
  const truckImg = imgCache['images/ui/truck_1.png'];
  if (truckImg && truckImg.loaded) {
    ctx.save();
    ctx.translate(truckX + truckW / 2, truckCenterY + truckH / 2);
    ctx.scale(-1, 1);
    ctx.drawImage(truckImg, -truckW / 2, -truckH / 2, truckW, truckH);
    ctx.restore();
  } else {
    ctx.font = '18px Arial'; ctx.textAlign = 'center'; ctx.fillText('🚚', bx + bw * p, truckCenterY + truckH / 2 + 2);
  }

  // 道路线（垃圾车下方 2px）
  const roadY = truckCenterY + truckH + 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(bx, roadY); ctx.lineTo(bx + bw, roadY); ctx.stroke();

  // 已行驶路段（红色）
  if (bw * p > 0) {
    ctx.strokeStyle = '#F44336'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx, roadY); ctx.lineTo(bx + bw * p, roadY); ctx.stroke();
  }

  // 终点人物（3/4进度→震惊，到达终点→大哭）
  const endKey = p >= 1 ? 'lose' : p >= 0.75 ? 'shocked' : 'idle';
  const endImg = imgCache[exprImgs[endKey]];
  if (endImg && endImg.loaded) {
    ctx.drawImage(endImg, bx + bw + 5, by - 2, 30, 30);
  } else {
    const endEmoji = {idle:'😐',shocked:'😱',lose:'😭'};
    ctx.font = '16px Arial'; ctx.fillText(endEmoji[endKey] || '😐', bx + bw + 18, by + bh / 2 + 5);
  }

  // 暂停按钮
  ctx.font = '22px Arial'; ctx.textAlign = 'right'; ctx.fillText('⏸️', C.W - 12, 60);

  // 表情（整体下移）
  const exprSrc = exprImgs[expr] || exprImgs.correct;
  if (!drawImg(exprSrc, C.W - 60, 97, 48, 48)) {
    const emojiMap = {correct:'😊',combo:'😆',wrong:'😢',angry:'😡',shocked:'😱',win:'😆',lose:'😭',confused:'🤔',idle:'😐'};
    ctx.font = '36px Arial'; ctx.textAlign = 'center'; ctx.fillText(emojiMap[expr] || '😊', C.W - 36, 135);
  }

  // 垃圾桶
  bins.forEach(b => {
    const hl = binHL[b.id] > 0, sc = hl ? 1.15 : 1;
    const dw = b.w * sc, dh = b.h * sc;
    const dx = b.x - (dw - b.w) / 2, dy = b.y - (dh - b.h) / 2;

    if (!drawImg(b.cat.img, dx, dy, dw, dh)) {
      card(dx, dy, dw, dh, b.cat.color, hl ? '#FFD700' : 'rgba(0,0,0,0.2)');
      ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.fillText('🗑️', dx + dw / 2, dy + dh / 2 + 4);
    }
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 11px "Microsoft YaHei"'; ctx.textAlign = 'center';
    ctx.fillText(b.cat.name, b.x + b.w / 2, b.y + b.h + 14);
  });

  // 垃圾（非拖拽）
  items.forEach(t => { if (t.vis && !t.set && t !== drag) drawTrashItem(t, false); });
  // 拖拽中的垃圾
  if (drag) drawTrashItem(drag, true);

  // 飘字
  anims.forEach(a => {
    ctx.globalAlpha = Math.max(0, a.o);
    ctx.fillStyle = a.c; ctx.font = `bold ${a.fs}px "Microsoft YaHei"`; ctx.textAlign = 'center';
    ctx.fillText(a.t, a.x, a.y);
    ctx.globalAlpha = 1;
  });

  if (state === 'paused') renderPause();
  if (state === 'win') renderWin();
  if (state === 'lose') renderLose();
}

function drawTrashItem(t, dragging) {
  if (!drawImg(t.img, t.x, t.y, t.w, t.h)) {
    const emojiFallback = { 'recyclable':'♻️','wet':'🍎','harmful':'🔋','dry':'🗑️','other':'🟢' };
    ctx.font = '28px Arial'; ctx.textAlign = 'center';
    ctx.fillText(emojiFallback[t.cat] || '🗑️', t.x + t.w / 2, t.y + t.h / 2 + 4);
  }
  ctx.fillStyle = '#333'; ctx.font = 'bold 9px "Microsoft YaHei"'; ctx.textAlign = 'center';
  ctx.fillText(t.name, t.x + t.w / 2, t.y + t.h + 8);
}

function renderPause() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, C.W, C.H);
  ctx.fillStyle = '#FFF'; ctx.font = 'bold 28px "Microsoft YaHei"'; ctx.textAlign = 'center';
  ctx.fillText('⏸️ 暂停中', C.W / 2, 260);
  btn('▶️ 继续游戏', C.W / 2 - 100, 310, 200, 40, '#4CAF50');
  btn('🔄 重新开始', C.W / 2 - 100, 365, 200, 40, '#FF9800');
  btn('🏠 返回主页', C.W / 2 - 100, 420, 200, 40, '#666');
}

function renderWin() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, C.W, C.H);
  drawImg(exprImgs.win, C.W / 2 - 30, 130, 60, 60);
  ctx.fillStyle = '#FFF'; ctx.font = 'bold 28px "Microsoft YaHei"'; ctx.textAlign = 'center';
  ctx.fillText('🎉 恭喜过关！', C.W / 2, 220);
  const acc = corr + wrng > 0 ? Math.round(corr / (corr + wrng) * 100) : 0;
  ctx.font = '18px "Microsoft YaHei"';
  ctx.fillText(`⭐ 得分：${score}分`, C.W / 2, 260);
  ctx.fillText(`🎯 正确率：${acc}%`, C.W / 2, 285);
  ctx.fillText(`🔥 最高连击：${maxCombo}`, C.W / 2, 310);
  ctx.font = '32px Arial';
  ctx.fillText(acc >= 90 ? '⭐⭐⭐' : acc >= 70 ? '⭐⭐' : '⭐', C.W / 2, 350);
  if (lv < 9) btn('▶️ 下一关', C.W / 2 - 100, 385, 200, 40, '#4CAF50');
  btn('🔄 再玩一次', C.W / 2 - 100, 435, 200, 40, '#FF9800');
  btn('🏠 返回主页', C.W / 2 - 100, 485, 200, 40, '#666');
}

function renderLose() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, C.W, C.H);
  drawImg(exprImgs.lose, C.W / 2 - 30, 180, 60, 60);
  ctx.fillStyle = '#FFF'; ctx.font = 'bold 28px "Microsoft YaHei"'; ctx.textAlign = 'center';
  ctx.fillText('😢 挑战失败', C.W / 2, 270);
  ctx.font = '18px "Microsoft YaHei"';
  ctx.fillText(`⭐ 得分：${score}分`, C.W / 2, 310);
  ctx.fillText(`🎯 正确率：${corr + wrng > 0 ? Math.round(corr / (corr + wrng) * 100) : 0}%`, C.W / 2, 335);
  btn('🔄 再试一次', C.W / 2 - 100, 380, 200, 40, '#F44336');
  btn('🏠 返回主页', C.W / 2 - 100, 435, 200, 40, '#666');
}

// ===================== 游戏逻辑 =====================

function checkDrop(t, b) {
  if (t.cat === b.id) {
    combo++; maxCombo = Math.max(maxCombo, combo); corr++;
    const s = 10 + Math.max(0, combo - 1) * 5; score += s;
    expr = combo >= 5 ? 'shocked' : combo >= 3 ? 'combo' : 'correct'; exprT = 1.5;
    anims.push({t: `+${s}`, x: t.x, y: t.y, c: '#4CAF50', fs: 18, o: 1});
    if (combo >= 3) anims.push({t: `${combo}连击!`, x: t.x + 20, y: t.y - 20, c: '#FF9800', fs: 14, o: 1});
    binHL[b.id] = .5;
    playAudio('audio/correct.mp3');
    try { wx.vibrateShort({ type: 'light' }); } catch(e) {}
  } else {
    combo = 0; wrng++; score -= 5;
    expr = wrng >= 2 ? 'angry' : 'wrong'; exprT = 1.5;
    anims.push({t: '-5', x: t.x, y: t.y, c: '#F44336', fs: 18, o: 1});
    playAudio('audio/wrong.mp3');
    try { wx.vibrateShort({ type: 'heavy' }); } catch(e) {}
  }
  t.vis = false; t.set = true; remain--;

  if (remain <= 0) {
    gameOver(score >= 0);
  }
}

function gameOver(w) {
  state = w ? 'win' : 'lose';
  stopAudio('audio/bgm.mp3');
  playAudio(w ? 'audio/win.mp3' : 'audio/lose.mp3');
  try { wx.vibrateLong(); } catch(e) {}
  if (w && lv >= unlocked) {
    unlocked = lv + 1;
    saveProgress();
  }
}

// ===================== 触摸处理（微信小游戏 wx API） =====================

let ts0 = null, dr = false;

// 坐标转换比例（触摸坐标是屏幕坐标 → 转为画布逻辑坐标）
const touchScaleX = C.W / screenW;
const touchScaleY = C.H / screenH;

function gtouch(e) {
  // wx.onTouchStart 返回屏幕坐标（CSS像素），需转换为画布逻辑坐标
  const t = e.touches[0];
  return {
    x: t.clientX * touchScaleX,
    y: t.clientY * touchScaleY
  };
}

wx.onTouchStart(function(e) {
  const p = gtouch(e); ts0 = p; dr = false;
  if (state === 'playing') {
    for (let i = items.length - 1; i >= 0; i--) {
      const t = items[i];
      if (t.vis && !t.set && inR(p.x, p.y, {x: t.x, y: t.y, w: t.w, h: t.h})) {
        drag = t; offX = p.x - t.x; offY = p.y - t.y; break;
      }
    }
  }
});

wx.onTouchMove(function(e) {
  const p = gtouch(e);
  if (!dr && ts0) { const dx = p.x - ts0.x, dy = p.y - ts0.y; if (Math.sqrt(dx * dx + dy * dy) > 8) dr = true; }
  if (dr && drag) {
    drag.x = p.x - offX; drag.y = p.y - offY;
    bins.forEach(b => {
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      b.hl = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2) < 65;
    });
  }
});

wx.onTouchEnd(function(e) {
  if (dr && drag) {
    bins.forEach(b => { if (b.hl) checkDrop(drag, b); });
    drag = null; bins.forEach(b => b.hl = false);
  } else if (ts0) {
    handleClick(ts0.x, ts0.y);
  }
  ts0 = null; dr = false; drag = null;
});

wx.onTouchCancel(function(e) {
  ts0 = null; dr = false; drag = null;
  bins.forEach(b => b.hl = false);
});

// ===================== 点击处理 =====================

function handleClick(x, y) {
  if (state === 'home') {
    if (homeView === 'main') {
      if (x > C.W / 2 - 110 && x < C.W / 2 + 110) {
        if (y > 310 && y < 355) initLv(unlocked);
        if (y > 375 && y < 420) homeView = 'levels';
      }
    } else {
      if (x > 20 && x < 90 && y > 30 && y < 62) { homeView = 'main'; return; }
      for (let i = 0; i < 9; i++) {
        const c = i % 3, r = i / 3 | 0, bx = C.W / 2 - 135 + c * 90, by = 130 + r * 90;
        if (x > bx && x < bx + 70 && y > by && y < by + 70 && i + 1 <= unlocked) initLv(i + 1);
      }
    }
  } else if (state === 'playing') {
    if (x > C.W - 50 && y < 75) { state = 'paused'; stopAudio('audio/bgm.mp3'); }
  } else if (state === 'paused') {
    const cx = C.W / 2;
    if (x > cx - 100 && x < cx + 100) {
      if (y > 310 && y < 350) { state = 'playing'; lastTs = Date.now(); playAudio('audio/bgm.mp3', true); }
      if (y > 365 && y < 405) initLv(lv);
      if (y > 420 && y < 460) { state = 'home'; homeView = 'main'; }
    }
  } else if (state === 'win') {
    const cx = C.W / 2;
    if (x > cx - 100 && x < cx + 100) {
      if (y > 385 && y < 425 && lv < 9) initLv(lv + 1);
      if (y > 435 && y < 475) initLv(lv);
      if (y > 485 && y < 525) { state = 'home'; homeView = 'main'; }
    }
  } else if (state === 'lose') {
    const cx = C.W / 2;
    if (x > cx - 100 && x < cx + 100) {
      if (y > 380 && y < 420) initLv(lv);
      if (y > 435 && y < 475) { state = 'home'; homeView = 'main'; }
    }
  }
}

// ===================== 游戏主循环 =====================

function loop(ts) {
  ctx.clearRect(0, 0, C.W, C.H);
  if (state === 'home') {
    renderHome();
  } else {
    if (state === 'playing') {
      if (lastTs === 0) {
        lastTs = ts; // 首帧仅初始化时间戳，不计算 dt
      } else {
        const dt = (ts - lastTs) / 1000; lastTs = ts;
        elapsed += dt;
        if (elapsed >= totalT) { gameOver(score >= 0 && remain <= 0); }
        if (exprT > 0) exprT -= dt;
        anims = anims.filter(a => { a.y -= 60 * (dt || 0.016); a.o -= (dt || 0.016); return a.o > 0; });
        Object.keys(binHL).forEach(k => { binHL[k] -= (dt || 0.016); if (binHL[k] <= 0) delete binHL[k]; });

        // 时间紧迫时切换表情（仅在无其他表情时）
        if (exprT <= 0) {
          const remainTime = totalT - elapsed;
          if (remainTime <= 10) {
            expr = 'shocked'; // 最后10秒 → 震惊
          } else if (remainTime / totalT < 0.25) {
            expr = 'confused'; // 不足25%时间 → 疑惑
          } else {
            expr = 'confused'; // 时间充裕 → 思考中（等待分类）
          }
        }
      }
    }
    renderGame();
  }
  requestAnimationFrame(loop);
}

// ===================== 启动 =====================

console.log('👁️  垃圾分类大作战 - 微信小游戏启动');
console.log('   屏幕: ' + screenW + 'x' + screenH + ' @' + dpr + 'x');
console.log('   画布: ' + C.W + 'x' + C.H + ' (逻辑) → ' + (C.W * dpr) + 'x' + (C.H * dpr) + ' (物理)');
requestAnimationFrame(loop);
