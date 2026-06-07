/**
 * 输入管理器 - 处理触摸/拖拽
 */
class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.touchStartPos = null;
    this.touchCurrentPos = null;
    this.isDragging = false;
    this.dragTarget = null;
    this.listeners = {};

    this._bindEvents();
  }

  /**
   * 绑定触摸事件
   */
  _bindEvents() {
    wx.onTouchStart(this._onTouchStart.bind(this));
    wx.onTouchMove(this._onTouchMove.bind(this));
    wx.onTouchEnd(this._onTouchEnd.bind(this));
    wx.onTouchCancel(this._onTouchEnd.bind(this));
  }

  /**
   * 触摸开始
   */
  _onTouchStart(e) {
    const touch = e.touches[0];
    this.touchStartPos = { x: touch.clientX, y: touch.clientY };
    this.touchCurrentPos = { x: touch.clientX, y: touch.clientY };
    this.isDragging = false;

    this._emit('touchstart', {
      x: touch.clientX,
      y: touch.clientY
    });
  }

  /**
   * 触摸移动
   */
  _onTouchMove(e) {
    const touch = e.touches[0];
    this.touchCurrentPos = { x: touch.clientX, y: touch.clientY };

    // 判断是否开始拖拽（移动超过10px）
    if (!this.isDragging && this.touchStartPos) {
      const dx = touch.clientX - this.touchStartPos.x;
      const dy = touch.clientY - this.touchStartPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        this.isDragging = true;
        this._emit('dragstart', {
          x: this.touchStartPos.x,
          y: this.touchStartPos.y
        });
      }
    }

    if (this.isDragging) {
      this._emit('dragmove', {
        x: touch.clientX,
        y: touch.clientY
      });
    }
  }

  /**
   * 触摸结束
   */
  _onTouchEnd(e) {
    if (this.isDragging) {
      this._emit('dragend', {
        x: this.touchCurrentPos.x,
        y: this.touchCurrentPos.y
      });
    } else {
      this._emit('tap', {
        x: this.touchCurrentPos.x,
        y: this.touchCurrentPos.y
      });
    }

    this.touchStartPos = null;
    this.touchCurrentPos = null;
    this.isDragging = false;
    this.dragTarget = null;
  }

  /**
   * 注册事件监听
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * 触发事件
   */
  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  /**
   * 判断点是否在矩形内
   */
  static isInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }
}

module.exports = InputManager;
