/**
 * 音效管理器
 */
class SoundManager {
  constructor(assetLoader) {
    this.loader = assetLoader;
    this.enabled = true;
    this.bgmPlaying = false;
  }

  /**
   * 播放音效
   */
  play(key) {
    if (!this.enabled) return;
    const audio = this.loader.getAudio(key);
    if (audio) {
      audio.stop();
      audio.play();
    }
  }

  /**
   * 播放背景音乐（循环）
   */
  playBGM() {
    if (!this.enabled) return;
    const bgm = this.loader.getAudio('bgm');
    if (bgm) {
      bgm.loop = true;
      bgm.play();
      this.bgmPlaying = true;
    }
  }

  /**
   * 停止背景音乐
   */
  stopBGM() {
    const bgm = this.loader.getAudio('bgm');
    if (bgm) {
      bgm.stop();
      this.bgmPlaying = false;
    }
  }

  /**
   * 暂停背景音乐
   */
  pauseBGM() {
    const bgm = this.loader.getAudio('bgm');
    if (bgm) bgm.pause();
  }

  /**
   * 恢复背景音乐
   */
  resumeBGM() {
    if (!this.bgmPlaying) return;
    const bgm = this.loader.getAudio('bgm');
    if (bgm) bgm.play();
  }

  /**
   * 开关音效
   */
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopBGM();
    }
    return this.enabled;
  }
}

module.exports = SoundManager;
