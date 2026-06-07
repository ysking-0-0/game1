/**
 * 垃圾分类大作战 - 微信小游戏入口
 */
const config = require('./js/config');
const AssetLoader = require('./js/utils/assetLoader');
const SoundManager = require('./js/utils/soundManager');
const InputManager = require('./js/utils/inputManager');
const HomeScene = require('./js/scenes/HomeScene');
const GameScene = require('./js/scenes/GameScene');

// 获取画布
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 设置画布尺寸（适配屏幕）
const systemInfo = wx.getSystemInfoSync();
const screenWidth = systemInfo.screenWidth;
const screenHeight = systemInfo.screenHeight;
const dpr = systemInfo.pixelRatio;

canvas.width = screenWidth * dpr;
canvas.height = screenHeight * dpr;
ctx.scale(dpr, dpr);

// 逻辑尺寸
const logicalWidth = screenWidth;
const logicalHeight = screenHeight;

// 初始化管理器
const assetLoader = new AssetLoader();
const soundManager = new SoundManager(assetLoader);

// 场景状态
let currentScene = 'home'; // home, levels, game
let homeView = 'main'; // main, levels
let currentLevel = 1;
let unlockedLevel = 1;

// 尝试从本地存储读取解锁进度
try {
  const saved = wx.getStorageSync('unlockedLevel');
  if (saved) unlockedLevel = saved;
} catch (e) {}

// 创建场景
const homeScene = new HomeScene(ctx, assetLoader);
homeScene.setUnlockedLevel(unlockedLevel);

const gameScene = new GameScene(ctx, assetLoader, soundManager);

// 加载资源
async function loadAssets() {
  // 显示加载提示
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  ctx.fillStyle = '#FFF';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('加载中...', logicalWidth / 2, logicalHeight / 2);

  // 加载垃圾桶图片
  const binImages = {
    bin_recyclable: 'images/bins/recyclable.png',
    bin_wet: 'images/bins/wet.png',
    bin_harmful: 'images/bins/harmful.png',
    bin_dry: 'images/bins/dry.png',
    bin_other: 'images/bins/other.png'
  };

  // 加载表情图片
  const exprImages = {
    expr_correct: 'images/expressions/03-happy.png',
    expr_combo: 'images/expressions/08-laugh.png',
    expr_highScore: 'images/expressions/09-proud.png',
    expr_wrong: 'images/expressions/01-sad.png',
    expr_angry: 'images/expressions/05-angry.png',
    expr_confused: 'images/expressions/06-confused.png',
    expr_shocked: 'images/expressions/02-shocked.png',
    expr_win: 'images/expressions/08-laugh.png',
    expr_lose: 'images/expressions/04-cry.png'
  };

  // 加载背景图
  const bgImages = {};
  config.levels.forEach(level => {
    bgImages[`bg_${level.id}`] = `images/${level.background}`;
  });

  // 合并所有图片
  const allImages = { ...binImages, ...exprImages, ...bgImages };

  await assetLoader.loadAll(allImages);

  // 加载音效
  const audioFiles = {
    correct: 'audio/correct.mp3',
    wrong: 'audio/wrong.mp3',
    combo: 'audio/combo.mp3',
    win: 'audio/win.mp3',
    lose: 'audio/lose.mp3',
    click: 'audio/click.mp3',
    bgm: 'audio/bgm.mp3'
  };

  Object.entries(audioFiles).forEach(([key, path]) => {
    try {
      soundManager.loader.loadAudio(key, path);
    } catch (e) {
      console.warn(`音效加载失败: ${path}`);
    }
  });

  console.log('资源加载完成');
}

// 保存进度
function saveProgress(level) {
  try {
    wx.setStorageSync('unlockedLevel', level);
  } catch (e) {}
}

// 设置输入处理
function setupInput() {
  const input = new InputManager(canvas);

  // 坐标转换（屏幕坐标 → 逻辑坐标）
  function toLogical(x, y) {
    return { x: x, y: y }; // 已经是逻辑坐标
  }

  input.on('touchstart', (pos) => {
    const { x, y } = toLogical(pos.x, pos.y);
    if (currentScene === 'game') {
      gameScene.onTouchStart(x, y);
    }
  });

  input.on('dragmove', (pos) => {
    const { x, y } = toLogical(pos.x, pos.y);
    if (currentScene === 'game') {
      gameScene.onDragMove(x, y);
    }
  });

  input.on('dragend', (pos) => {
    const { x, y } = toLogical(pos.x, pos.y);
    if (currentScene === 'game') {
      gameScene.onDragEnd(x, y);
    }
  });

  input.on('tap', (pos) => {
    const { x, y } = toLogical(pos.x, pos.y);

    if (currentScene === 'home') {
      const result = homeScene.onTap(x, y, homeView);
      if (result) {
        if (result.action === 'start') {
          startLevel(unlockedLevel);
        } else if (result.action === 'levels') {
          homeView = 'levels';
        } else if (result.action === 'back') {
          homeView = 'main';
        } else if (result.action === 'play') {
          startLevel(result.level);
        }
      }
    } else if (currentScene === 'game') {
      gameScene.onTap(x, y);
    }
  });
}

// 开始关卡
function startLevel(level) {
  currentLevel = level;
  currentScene = 'game';
  gameScene.init(level);
  gameScene.start();
}

// 游戏结束回调
gameScene.onGameEnd = (result) => {
  if (result.win && result.level >= unlockedLevel) {
    unlockedLevel = result.level + 1;
    homeScene.setUnlockedLevel(unlockedLevel);
    saveProgress(unlockedLevel);
  }
};

gameScene.on('goHome', () => {
  currentScene = 'home';
  homeView = 'main';
  soundManager.stopBGM();
});

gameScene.on('nextLevel', (level) => {
  if (level <= config.levels.length) {
    startLevel(level);
  } else {
    // 全部通关
    currentScene = 'home';
    homeView = 'main';
    soundManager.stopBGM();
  }
});

// 游戏主循环
function gameLoop() {
  const timestamp = Date.now();

  // 清屏
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  if (currentScene === 'home') {
    homeScene.render(homeView);
  } else if (currentScene === 'game') {
    gameScene.update(timestamp);
    gameScene.render();
  }

  requestAnimationFrame(gameLoop);
}

// 启动
async function main() {
  await loadAssets();
  setupInput();
  gameLoop();
}

main();
