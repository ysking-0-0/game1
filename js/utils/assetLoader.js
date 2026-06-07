/**
 * 资源加载管理器
 */
class AssetLoader {
  constructor() {
    this.loadedImages = {};
    this.loadedAudio = {};
    this.totalCount = 0;
    this.loadedCount = 0;
  }

  /**
   * 加载单张图片
   */
  loadImage(key, path) {
    return new Promise((resolve, reject) => {
      if (this.loadedImages[key]) {
        resolve(this.loadedImages[key]);
        return;
      }
      const img = wx.createImage();
      img.onload = () => {
        this.loadedImages[key] = img;
        this.loadedCount++;
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`图片加载失败: ${path}`);
        this.loadedCount++;
        resolve(null); // 不阻塞
      };
      img.src = path;
      this.totalCount++;
    });
  }

  /**
   * 加载音效
   */
  loadAudio(key, path) {
    const audio = wx.createInnerAudioContext();
    audio.src = path;
    this.loadedAudio[key] = audio;
    return audio;
  }

  /**
   * 获取已加载的图片
   */
  getImage(key) {
    return this.loadedImages[key] || null;
  }

  /**
   * 获取音效
   */
  getAudio(key) {
    return this.loadedAudio[key] || null;
  }

  /**
   * 批量加载图片
   */
  async loadAll(imageMap) {
    const promises = Object.entries(imageMap).map(([key, path]) =>
      this.loadImage(key, path)
    );
    await Promise.all(promises);
  }

  /**
   * 释放音效资源
   */
  destroyAudio(key) {
    if (this.loadedAudio[key]) {
      this.loadedAudio[key].destroy();
      delete this.loadedAudio[key];
    }
  }

  /**
   * 释放所有音效
   */
  destroyAllAudio() {
    Object.keys(this.loadedAudio).forEach(key => {
      this.loadedAudio[key].destroy();
    });
    this.loadedAudio = {};
  }
}

module.exports = AssetLoader;
