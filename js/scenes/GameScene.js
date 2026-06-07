/**
 * 游戏主场景 - 核心玩法逻辑
 */
const config = require('../config');
const { getTrashForLevel } = require('../data/trashData');

class GameScene {
  constructor(ctx, assetLoader, soundManager) {
    this.ctx = ctx;
    this.loader = assetLoader;
    this.sound = soundManager;

    // 游戏状态
    this.state = 'ready'; // ready, playing, paused, win, lose
    this.level = 1;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctCount = 0;
    this.wrongCount = 0;

    // 时间
    this.totalTime = 60;
    this.elapsedTime = 0;
    this.lastTimestamp = 0;

    // 垃圾列表
    this.trashItems = [];
    this.remainingTrash = 0;

    // 拖拽状态
    this.draggingItem = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    // 垃圾桶位置
    this.binRects = [];

    // 表情状态
    this.currentExpression = 'correct';
    this.expressionTimer = 0;

    // 动画
    this.animations = []; // 飘字动画等
    this.binHighlights = {}; // 桶高亮状态

    // 回调
    this.onGameEnd = null;
  }

  /**
   * 初始化关卡
   */
  init(levelId) {
    const levelConfig = config.levels.find(l => l.id === levelId);
    if (!levelConfig) return;

    this.level = levelId;
    this.totalTime = levelConfig.time;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.elapsedTime = 0;
    this.state = 'ready';
    this.animations = [];
    this.binHighlights = {};

    // 生成垃圾
    const trashList = getTrashForLevel(levelConfig.trashCount);
    this.trashItems = trashList.map((item, index) => ({
      ...item,
      x: this._getTrashX(index, trashList.length),
      y: this._getTrashY(index, trashList.length),
      width: config.trashArea.itemSize,
      height: config.trashArea.itemSize,
      visible: true,
      settled: false
    }));
    this.remainingTrash = this.trashItems.length;

    // 计算垃圾桶位置
    this._calcBinPositions();
  }

  /**
   * 计算垃圾桶位置
   */
  _calcBinPositions() {
    const { categories, bins } = config;
    const totalWidth = categories.length * bins.width + (categories.length - 1) * bins.gap;
    const startX = (config.canvasWidth - totalWidth) / 2;

    this.binRects = categories.map((cat, i) => ({
      id: cat.id,
      x: startX + i * (bins.width + bins.gap),
      y: bins.y,
      width: bins.width,
      height: bins.height,
      category: cat,
      highlight: false
    }));
  }

  /**
   * 计算垃圾初始位置（底部区域散落）
   */
  _getTrashX(index, total) {
    const area = config.trashArea;
    const cols = 4;
    const col = index % cols;
    const spacing = (config.canvasWidth - 80) / cols;
    return 40 + col * spacing + (Math.random() - 0.5) * 40;
  }

  _getTrashY(index, total) {
    const area = config.trashArea;
    const rows = Math.ceil(total / 4);
    const row = Math.floor(index / 4);
    const spacing = (area.bottomY - area.topY) / Math.max(rows, 1);
    return area.topY + row * spacing + (Math.random() - 0.5) * 30;
  }

  /**
   * 开始游戏
   */
  start() {
    this.state = 'playing';
    this.lastTimestamp = Date.now();
    this.sound.playBGM();
  }

  /**
   * 暂停
   */
  pause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.sound.pauseBGM();
    }
  }

  /**
   * 继续
   */
  resume() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.lastTimestamp = Date.now();
      this.sound.resumeBGM();
    }
  }

  /**
   * 更新逻辑（每帧调用）
   */
  update(timestamp) {
    if (this.state !== 'playing') return;

    // 更新时间
    const dt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    this.elapsedTime += dt;

    // 检查时间
    if (this.elapsedTime >= this.totalTime) {
      this._gameOver(false);
      return;
    }

    // 更新表情计时器
    if (this.expressionTimer > 0) {
      this.expressionTimer -= dt;
    }

    // 更新动画
    this.animations = this.animations.filter(anim => {
      anim.y -= 60 * dt;
      anim.opacity -= dt;
      return anim.opacity > 0;
    });

    // 更新桶高亮
    Object.keys(this.binHighlights).forEach(key => {
      this.binHighlights[key] -= dt;
      if (this.binHighlights[key] <= 0) delete this.binHighlights[key];
    });

    // 检查胜利
    if (this.remainingTrash <= 0) {
      this._gameOver(this.score >= 0);
    }
  }

  /**
   * 渲染（每帧调用）
   */
  render() {
    const ctx = this.ctx;

    // 清屏
    ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);

    // 绘制背景
    this._renderBackground();

    // 绘制垃圾桶
    this._renderBins();

    // 绘制垃圾
    this._renderTrash();

    // 绘制拖拽中的垃圾（最上层）
    if (this.draggingItem) {
      this._renderTrashItem(this.draggingItem);
    }

    // 绘制顶部信息栏
    this._renderTopBar();

    // 绘制表情
    this._renderExpression();

    // 绘制飘字动画
    this._renderAnimations();

    // 绘制暂停/结算弹窗
    if (this.state === 'paused') this._renderPauseModal();
    if (this.state === 'win') this._renderWinModal();
    if (this.state === 'lose') this._renderLoseModal();
  }

  /**
   * 绘制背景
   */
  _renderBackground() {
    const levelConfig = config.levels.find(l => l.id === this.level);
    if (levelConfig) {
      const bg = this.loader.getImage('bg');
      if (bg) {
        this.ctx.drawImage(bg, 0, 0, config.canvasWidth, config.canvasHeight);
      }
    }
  }

  /**
   * 绘制垃圾桶
   */
  _renderBins() {
    const ctx = this.ctx;

    this.binRects.forEach(bin => {
      const binImg = this.loader.getImage(`bin_${bin.id}`);
      const highlight = this.binHighlights[bin.id] > 0;

      if (binImg) {
        if (highlight) {
          // 高亮效果：放大
          const scale = config.bins.highlightScale;
          const dw = bin.width * scale;
          const dh = bin.height * scale;
          const dx = bin.x - (dw - bin.width) / 2;
          const dy = bin.y - (dh - bin.height) / 2;
          ctx.drawImage(binImg, dx, dy, dw, dh);
        } else {
          ctx.drawImage(binImg, bin.x, bin.y, bin.width, bin.height);
        }
      } else {
        // 无图片时绘制占位矩形
        ctx.fillStyle = highlight ? '#FFD700' : bin.category.color;
        ctx.fillRect(bin.x, bin.y, bin.width, bin.height);
      }

      // 绘制标签
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${config.bins.labelSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(
        bin.category.name,
        bin.x + bin.width / 2,
        bin.y + bin.height + 25
      );
    });
  }

  /**
   * 绘制垃圾列表
   */
  _renderTrash() {
    this.trashItems.forEach(item => {
      if (item.visible && !item.settled) {
        this._renderTrashItem(item);
      }
    });
  }

  /**
   * 绘制单个垃圾
   */
  _renderTrashItem(item) {
    const ctx = this.ctx;
    const img = this.loader.getImage(item.id);

    if (img) {
      ctx.drawImage(img, item.x, item.y, item.width, item.height);
    } else {
      // 无图片时绘制占位
      ctx.fillStyle = '#FFA500';
      ctx.fillRect(item.x, item.y, item.width, item.height);
      ctx.fillStyle = '#FFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, item.x + item.width / 2, item.y + item.height / 2 + 4);
    }
  }

  /**
   * 绘制顶部信息栏
   */
  _renderTopBar() {
    const ctx = this.ctx;
    const { topBar, progressBar } = config;

    // 背景半透明遮罩
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, config.canvasWidth, progressBar.y - 10);

    // 关卡 + 分数
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${topBar.fontSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(`第${this.level}关`, topBar.padding, topBar.height / 2 + 8);

    ctx.textAlign = 'center';
    ctx.fillText(`⭐${this.score}分`, config.canvasWidth / 2, topBar.height / 2 + 8);

    // 进度条
    const progress = Math.min(this.elapsedTime / this.totalTime, 1);
    const barX = progressBar.padding;
    const barW = config.canvasWidth - progressBar.padding * 2 - 80;
    const barY = topBar.height + 10;
    const barH = progressBar.height;

    // 进度条背景
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(barX, barY, barW, barH);

    // 进度条填充（绿→黄→红渐变）
    let barColor = '#4CAF50';
    if (progress > 0.6) barColor = '#FF9800';
    if (progress > 0.8) barColor = '#F44336';
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barW * progress, barH);

    // 垃圾车图标（在进度条上）
    const truckX = barX + barW * progress - 30;
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🚚', truckX, barY + barH / 2 + 10);

    // 终点垃圾桶图标
    ctx.font = '25px Arial';
    ctx.fillText('🗑️', barX + barW + 30, barY + barH / 2 + 8);

    // 暂停按钮
    ctx.font = '35px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('⏸️', config.canvasWidth - 20, topBar.height / 2 + 12);
  }

  /**
   * 绘制表情
   */
  _renderExpression() {
    const exprKey = this.currentExpression;
    const exprPath = config.expressions[exprKey];
    const exprImg = this.loader.getImage(`expr_${exprKey}`);

    if (exprImg) {
      const size = config.expression.width;
      const x = config.canvasWidth - size - 20;
      const y = config.expression.y;
      this.ctx.drawImage(exprImg, x, y, size, size);
    }
  }

  /**
   * 绘制飘字动画
   */
  _renderAnimations() {
    const ctx = this.ctx;
    this.animations.forEach(anim => {
      ctx.globalAlpha = anim.opacity;
      ctx.fillStyle = anim.color;
      ctx.font = `bold ${anim.fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(anim.text, anim.x, anim.y);
      ctx.globalAlpha = 1;
    });
  }

  /**
   * 绘制暂停弹窗
   */
  _renderPauseModal() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⏸️ 暂停中', config.canvasWidth / 2, 500);

    // 按钮
    const buttons = [
      { text: '▶️ 继续游戏', y: 620 },
      { text: '🔄 重新开始', y: 700 },
      { text: '🏠 返回主页', y: 780 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(config.canvasWidth / 2 - 150, btn.y - 25, 300, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(btn.text, config.canvasWidth / 2, btn.y + 8);
    });
  }

  /**
   * 绘制胜利弹窗
   */
  _renderWinModal() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('😊 恭喜过关！', config.canvasWidth / 2, 420);

    const accuracy = this.correctCount + this.wrongCount > 0
      ? Math.round(this.correctCount / (this.correctCount + this.wrongCount) * 100)
      : 0;

    ctx.font = '28px Arial';
    ctx.fillText(`⭐ 得分：${this.score}分`, config.canvasWidth / 2, 500);
    ctx.fillText(`🎯 正确率：${accuracy}%`, config.canvasWidth / 2, 540);
    ctx.fillText(`🔥 最高连击：${this.maxCombo}`, config.canvasWidth / 2, 580);

    // 星级
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
    ctx.font = '48px Arial';
    ctx.fillText('⭐'.repeat(stars), config.canvasWidth / 2, 650);

    // 按钮
    const buttons = [
      { text: '▶️ 下一关', y: 730 },
      { text: '🔄 再玩一次', y: 800 },
      { text: '🏠 返回主页', y: 870 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(config.canvasWidth / 2 - 150, btn.y - 25, 300, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(btn.text, config.canvasWidth / 2, btn.y + 8);
    });
  }

  /**
   * 绘制失败弹窗
   */
  _renderLoseModal() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('😢 挑战失败', config.canvasWidth / 2, 480);

    ctx.font = '28px Arial';
    ctx.fillText(`⭐ 得分：${this.score}分`, config.canvasWidth / 2, 560);

    const buttons = [
      { text: '🔄 再试一次', y: 660 },
      { text: '🏠 返回主页', y: 730 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#F44336';
      ctx.fillRect(config.canvasWidth / 2 - 150, btn.y - 25, 300, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(btn.text, config.canvasWidth / 2, btn.y + 8);
    });
  }

  // ========== 触摸/拖拽处理 ==========

  /**
   * 处理触摸开始 - 判断是否点到垃圾
   */
  onTouchStart(x, y) {
    if (this.state !== 'playing') return;

    // 从后往前遍历（后绘制的在上层）
    for (let i = this.trashItems.length - 1; i >= 0; i--) {
      const item = this.trashItems[i];
      if (item.visible && !item.settled) {
        if (InputManager.isInRect(x, y, item)) {
          this.draggingItem = item;
          this.dragOffsetX = x - item.x;
          this.dragOffsetY = y - item.y;
          return;
        }
      }
    }
  }

  /**
   * 处理拖拽移动
   */
  onDragMove(x, y) {
    if (this.draggingItem) {
      this.draggingItem.x = x - this.dragOffsetX;
      this.draggingItem.y = y - this.dragOffsetY;

      // 检查是否靠近垃圾桶（高亮）
      this.binRects.forEach(bin => {
        const centerX = bin.x + bin.width / 2;
        const centerY = bin.y + bin.height / 2;
        const dist = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        bin.highlight = dist < 100;
      });
    }
  }

  /**
   * 处理拖拽结束 - 判断投放
   */
  onDragEnd(x, y) {
    if (!this.draggingItem) return;

    let dropped = false;

    // 检查是否拖到了垃圾桶上
    this.binRects.forEach(bin => {
      if (InputManager.isInRect(x, y, bin)) {
        this._checkDrop(this.draggingItem, bin);
        dropped = true;
      }
    });

    // 没拖到任何桶上 → 不处理（垃圾留在原位）
    if (!dropped) {
      // 可选：弹回原位
    }

    this.draggingItem = null;
    this.binRects.forEach(bin => bin.highlight = false);
  }

  /**
   * 处理点击（暂停按钮等）
   */
  onTap(x, y) {
    // 暂停按钮区域
    if (x > config.canvasWidth - 70 && y < 80) {
      this.pause();
      return;
    }

    // 暂停弹窗按钮
    if (this.state === 'paused') {
      if (x > config.canvasWidth / 2 - 150 && x < config.canvasWidth / 2 + 150) {
        if (y > 595 && y < 645) this.resume();
        if (y > 675 && y < 725) { this.init(this.level); this.start(); }
        if (y > 755 && y < 805) { this._emit('goHome'); }
      }
    }

    // 胜利弹窗按钮
    if (this.state === 'win') {
      if (x > config.canvasWidth / 2 - 150 && x < config.canvasWidth / 2 + 150) {
        if (y > 705 && y < 755) { this._emit('nextLevel', this.level + 1); }
        if (y > 775 && y < 825) { this.init(this.level); this.start(); }
        if (y > 845 && y < 895) { this._emit('goHome'); }
      }
    }

    // 失败弹窗按钮
    if (this.state === 'lose') {
      if (x > config.canvasWidth / 2 - 150 && x < config.canvasWidth / 2 + 150) {
        if (y > 635 && y < 685) { this.init(this.level); this.start(); }
        if (y > 705 && y < 755) { this._emit('goHome'); }
      }
    }
  }

  // ========== 游戏逻辑 ==========

  /**
   * 检查投放是否正确
   */
  _checkDrop(trashItem, bin) {
    if (trashItem.category === bin.id) {
      // ✅ 正确
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.correctCount++;

      const baseScore = config.scoring.correct;
      const comboBonus = Math.max(0, (this.combo - 1)) * config.scoring.comboBonus;
      this.score += baseScore + comboBonus;

      // 表情
      if (this.combo >= config.feedback.comboThreshold) {
        this.currentExpression = 'combo';
      } else {
        this.currentExpression = 'correct';
      }
      this.expressionTimer = 1.5;

      // 音效 + 震动
      this.sound.play(this.combo >= 3 ? 'combo' : 'correct');
      if (config.feedback.vibration) {
        wx.vibrateShort({ type: 'light' });
      }

      // 飘字
      this._addAnimation(`+${baseScore + comboBonus}`, trashItem.x, trashItem.y, '#4CAF50', 32);
      if (comboBonus > 0) {
        this._addAnimation(`${this.combo}连击!`, trashItem.x + 40, trashItem.y - 30, '#FF9800', 24);
      }

      // 桶高亮
      this.binHighlights[bin.id] = 0.5;

      // 标记垃圾已处理
      trashItem.visible = false;
      trashItem.settled = true;
      this.remainingTrash--;

    } else {
      // ❌ 错误
      this.combo = 0;
      this.wrongCount++;
      this.score += config.scoring.wrong;

      // 表情
      if (this.wrongCount >= 2) {
        this.currentExpression = 'angry';
      } else {
        this.currentExpression = 'wrong';
      }
      this.expressionTimer = 1.5;

      // 音效 + 震动
      this.sound.play('wrong');
      if (config.feedback.vibration) {
        wx.vibrateShort({ type: 'heavy' });
      }

      // 飘字
      this._addAnimation(`${config.scoring.wrong}`, trashItem.x, trashItem.y, '#F44336', 32);

      // 垃圾直接消失
      trashItem.visible = false;
      trashItem.settled = true;
      this.remainingTrash--;
    }
  }

  /**
   * 添加飘字动画
   */
  _addAnimation(text, x, y, color, fontSize) {
    this.animations.push({
      text, x, y, color, fontSize,
      opacity: 1
    });
  }

  /**
   * 游戏结束
   */
  _gameOver(isWin) {
    this.state = isWin ? 'win' : 'lose';
    this.sound.stopBGM();
    this.sound.play(isWin ? 'win' : 'lose');

    if (config.feedback.vibration) {
      wx.vibrateLong();
    }

    if (this.onGameEnd) {
      this.onGameEnd({
        level: this.level,
        score: this.score,
        win: isWin,
        correct: this.correctCount,
        wrong: this.wrongCount,
        maxCombo: this.maxCombo
      });
    }
  }

  /**
   * 事件系统
   */
  on(event, callback) {
    if (!this._events) this._events = {};
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(callback);
  }

  _emit(event, data) {
    if (this._events && this._events[event]) {
      this._events[event].forEach(cb => cb(data));
    }
  }
}

// 需要引入 InputManager
const InputManager = require('../utils/inputManager');

module.exports = GameScene;
