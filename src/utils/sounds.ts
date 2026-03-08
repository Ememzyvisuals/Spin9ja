// Sound effects manager using Web Audio API

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;

  constructor() {
    this.enabled = localStorage.getItem('spin9ja_sounds') !== 'false';
  }

  private init(): void {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ): void {
    if (!this.enabled) return;
    this.init();
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      // Silently fail
    }
  }

  private playChord(frequencies: number[], duration: number): void {
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, duration, 'sine', 0.15), i * 30);
    });
  }

  // Spin wheel tick sound
  tick(): void {
    this.playTone(800, 0.05, 'square', 0.1);
  }

  // Win celebration
  win(): void {
    const frequencies = [523, 659, 784, 1047]; // C major chord ascending
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.2), i * 100);
    });
  }

  // Big win (jackpot)
  jackpot(): void {
    const melody = [523, 659, 784, 1047, 1319, 1568];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.25), i * 80);
    });
  }

  // Coin collect sound
  coin(): void {
    this.playTone(1200, 0.1, 'sine', 0.2);
    setTimeout(() => this.playTone(1500, 0.1, 'sine', 0.15), 50);
  }

  // Success notification
  success(): void {
    this.playChord([523, 659, 784], 0.3);
  }

  // Error sound
  error(): void {
    this.playTone(200, 0.3, 'sawtooth', 0.2);
  }

  // Button click
  click(): void {
    this.playTone(600, 0.05, 'sine', 0.1);
  }

  // Notification
  notification(): void {
    this.playTone(880, 0.1, 'sine', 0.15);
    setTimeout(() => this.playTone(1100, 0.15, 'sine', 0.15), 100);
  }

  // Spin start
  spinStart(): void {
    this.playTone(300, 0.2, 'sine', 0.15);
  }

  // Spin end
  spinEnd(): void {
    this.playTone(600, 0.1, 'triangle', 0.2);
    setTimeout(() => this.playTone(800, 0.15, 'triangle', 0.2), 100);
  }

  // Check-in claim
  checkIn(): void {
    const notes = [392, 494, 587, 784]; // G4, B4, D5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.2), i * 100);
    });
  }

  // Referral bonus
  referral(): void {
    this.playChord([659, 784, 988], 0.4);
  }

  // Premium unlock
  premium(): void {
    const melody = [392, 494, 587, 784, 988, 1175];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.25, 'sine', 0.2), i * 100);
    });
  }

  // Ad complete
  adComplete(): void {
    this.playTone(880, 0.1, 'sine', 0.2);
    setTimeout(() => this.playTone(1100, 0.2, 'sine', 0.2), 100);
  }

  // Toggle sounds
  toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('spin9ja_sounds', this.enabled.toString());
    if (this.enabled) {
      this.click();
    }
    return this.enabled;
  }

  // Check if sounds are enabled
  isEnabled(): boolean {
    return this.enabled;
  }

  // Set enabled state
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('spin9ja_sounds', enabled.toString());
  }
}

// Export singleton instance
export const sounds = new SoundManager();
