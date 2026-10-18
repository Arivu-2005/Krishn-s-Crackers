/**
 * Diwali Fireworks & Audio Synthesizer Engine
 * High-performance, GPU-friendly HTML5 Canvas particle system with Web Audio API.
 * Optimized for silky smooth 60fps scrolling and zero lag!
 */

class FireworksEngine {
  constructor(canvasId = 'fireworksCanvas') {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.isRunning = false;
    this.soundEnabled = false;
    this.audioCtx = null;
    this.lastLaunch = 0;
    this.autoLaunch = true;
    this.isVisible = true;

    if (this.canvas) {
      this.init();
    }
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    // Launch firework on canvas click
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.createBurst(x, y, 45);
      if (this.soundEnabled) this.playBangSound();
    });

    // Pause rendering when hero is scrolled out of view to save 100% GPU/CPU
    if ('IntersectionObserver' in window) {
      const heroEl = document.getElementById('hero') || this.canvas;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isVisible = entry.isIntersecting;
          if (this.isVisible && !this.isRunning) {
            this.start();
          } else if (!this.isVisible && this.isRunning && this.particles.length === 0) {
            this.stop();
          }
        });
      }, { threshold: 0.05 });
      observer.observe(heroEl);
    }

    this.start();
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    this.canvas.width = parent ? parent.clientWidth : window.innerWidth;
    this.canvas.height = parent ? parent.clientHeight : window.innerHeight;
  }

  enableSound(enable = true) {
    this.soundEnabled = enable;
    if (enable && !this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
  }

  toggleSound() {
    this.enableSound(!this.soundEnabled);
    return this.soundEnabled;
  }

  playBangSound() {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.3);
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(60, this.audioCtx.currentTime + 0.28);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);
      noise.start();
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  playSparkleSound() {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 + Math.random() * 600, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {}
  }

  createBurst(x, y, particleCount = 45, colors = null) {
    const defaultPalettes = [
      ['#ff0055', '#ff5500', '#ffd700', '#ffffff'],
      ['#00ffcc', '#0099ff', '#ff00ff', '#ffffff'],
      ['#10b981', '#facc15', '#fb923c', '#ffffff'],
      ['#fbbf24', '#f59e0b', '#d4af37', '#ffffff']
    ];
    const palette = colors || defaultPalettes[Math.floor(Math.random() * defaultPalettes.length)];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + (Math.random() - 0.5) * 0.2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: 0.016 + Math.random() * 0.018,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 1.5 + Math.random() * 2,
        gravity: 0.07,
        friction: 0.95
      });
    }

    if (this.soundEnabled) {
      this.playBangSound();
    }
  }

  celebrateOrderSuccess() {
    const width = this.canvas ? this.canvas.width : window.innerWidth;
    const height = this.canvas ? this.canvas.height : window.innerHeight;

    let burstCount = 0;
    const interval = setInterval(() => {
      const x = width * 0.2 + Math.random() * (width * 0.6);
      const y = height * 0.2 + Math.random() * (height * 0.4);
      this.createBurst(x, y, 60);
      burstCount++;
      if (burstCount >= 6) {
        clearInterval(interval);
      }
    }, 250);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = (timestamp) => {
      if (!this.isRunning) return;
      this.update(timestamp);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
  }

  update(timestamp) {
    if (this.autoLaunch && this.isVisible && timestamp - this.lastLaunch > 2800) {
      this.lastLaunch = timestamp;
      if (this.canvas) {
        const x = this.canvas.width * 0.2 + Math.random() * (this.canvas.width * 0.6);
        const y = this.canvas.height * 0.2 + Math.random() * (this.canvas.height * 0.35);
        this.createBurst(x, y, 35);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    if (!this.ctx || !this.canvas) return;

    // Fast clear with trail fade
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.particles.length === 0) return;

    // Direct high-performance batch drawing without expensive shadowBlur
    this.ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, 6.28318);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }
}

// Window instance initialization (singleton)
if (typeof window !== 'undefined') {
  window.FireworksEngine = FireworksEngine;
  if (!window.fireworks) {
    document.addEventListener('DOMContentLoaded', () => {
      if (!window.fireworks && document.getElementById('fireworksCanvas')) {
        window.fireworks = new FireworksEngine('fireworksCanvas');
      }
    });
  }
}
