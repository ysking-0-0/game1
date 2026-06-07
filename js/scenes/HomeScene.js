/**
 * 主页场景 - 关卡选择
 */
const config = require('../config');

class HomeScene {
  constructor(ctx, assetLoader) {
    this.ctx = ctx;
    this.loader = assetLoader;
    this.buttons = [];
    this.unlockedLevel = 1; // 最高解锁关卡

    this._calcButtons();
  }

  /**
   * 计算按钮位置
   */
  _calcButtons() {
    const startY = 400;
    const gap = 100;
    const btnWidth = 300;
    const btnHeight = 70;

    this.buttons = [
      // 开始游戏（进入当前最高解锁关卡）
      {
        id: 'start',
        text: '🎮 开始游戏',
        x: config.canvasWidth / 2 - btnWidth / 2,
        y: startY,
        width: btnWidth,
        height: btnHeight,
        color: '#4CAF50'
      },
      // 关卡选择
      {
        id: 'levels',
        text: '📋 关卡选择',
        x: config.canvasWidth / 2 - btnWidth / 2,
        y: startY + gap,
        width: btnWidth,
        height: btnHeight,
        color: '#2196F3'
      }
    ];

    // 关卡网格（9关，3x3）
    this.levelButtons = [];
    const gridStartY = 350;
    const gridGap = 120;
    const gridCols = 3;
    const cellSize = 80;

    for (let i = 0; i < 9; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      this.levelButtons.push({
        id: `level_${i + 1}`,
        level: i + 1,
        x: config.canvasWidth / 2 - (gridCols * gridGap) / 2 + col * gridGap,
        y: gridStartY + row * gridGap,
        width: cellSize,
        height: cellSize
      });
    }
  }

  /**
   * 设置解锁关卡
   */
  setUnlockedLevel(level) {
    this.unlockedLevel = Math.max(this.unlockedLevel, level);
  }

  /**
   * 渲染主页
   */
  render(mode = 'main') {
    const ctx = this.ctx;

    // 背景
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    if (mode === 'main') {
      this._renderMain();
    } else if (mode === 'levels') {
      this._renderLevelSelect();
    }
  }

  /**
   * 渲染主菜单
   */
  _renderMain() {
    const ctx = this.ctx;

    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('垃圾分类', config.canvasWidth / 2, 200);
    ctx.font = 'bold 42px Arial';
    ctx.fillText('大作战', config.canvasWidth / 2, 260);

    // 垃圾桶装饰
    ctx.font = '60px Arial';
    ctx.fillText('♻️🍎🔋🗑️🟢', config.canvasWidth / 2, 340);

    // 按钮
    this.buttons.forEach(btn => {
      ctx.fillStyle = btn.color;
      ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2 + 10);
    });
  }

  /**
   * 渲染关卡选择
   */
  _renderLevelSelect() {
    const ctx = this.ctx;

    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('关卡选择', config.canvasWidth / 2, 200);

    // 返回按钮
    ctx.fillStyle = '#666';
    ctx.fillRect(30, 30, 80, 50);
    ctx.fillStyle = '#FFF';
    ctx.font = '24px Arial';
    ctx.fillText('返回', 70, 60);

    // 关卡网格
    this.levelButtons.forEach(btn => {
      const unlocked = btn.level <= this.unlockedLevel;

      ctx.fillStyle = unlocked ? '#4CAF50' : '#999';
      ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        unlocked ? `${btn.level}` : '🔒',
        btn.x + btn.width / 2,
        btn.y + btn.height / 2 + 12
      );
    });
  }

  /**
   * 处理点击
   */
  onTap(x, y, mode = 'main') {
    if (mode === 'main') {
      for (const btn of this.buttons) {
        if (InputManager.isInRect(x, y, btn)) {
          return { action: btn.id };
        }
      }
    } else if (mode === 'levels') {
      // 返回按钮
      if (x >= 30 && x <= 110 && y >= 30 && y <= 80) {
        return { action: 'back' };
      }

      // 关卡按钮
      for (const btn of this.levelButtons) {
        if (InputManager.isInRect(x, y, btn) && btn.level <= this.unlockedLevel) {
          return { action: 'play', level: btn.level };
        }
      }
    }

    return null;
  }
}

const InputManager = require('../utils/inputManager');

module.exports = HomeScene;
