class AudioManager {
  private sounds: Record<string, HTMLAudioElement> = {};

  constructor() {
    this.load("slot_win", "/sounds/slot_win.mp3");
    this.load("spin", "/sounds/spin.mp3");
    this.load("fish_hit", "/sounds/fish_hit.mp3");
    this.load("button", "/sounds/click.mp3");
  }

  private load(name: string, path: string) {
    const audio = new Audio(path);
    audio.preload = "auto";
    this.sounds[name] = audio;
  }

  play(name: string) {
    const sound = this.sounds[name];
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  stop(name: string) {
    const sound = this.sounds[name];
    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;
  }

  stopAll() {
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }
}

export const audioManager = new AudioManager();
