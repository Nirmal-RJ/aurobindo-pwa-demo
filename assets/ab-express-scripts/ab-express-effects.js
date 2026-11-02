/* Impact presentation uses the game's pausable clock, including all particles. */
(() => {
  'use strict';
  const clamp = value => Math.max(0, Math.min(1, value));
  function glow(ctx, x, y, radius, stops, opacity = 1) {
    if (radius <= 0 || opacity <= 0) return;
    ctx.globalAlpha = opacity;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    for (const [offset, color] of stops) gradient.addColorStop(offset, color);
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }
  async function crash({ screen, train, failedIndex, tween, asset, settings }) {
    const scrim = document.createElement('div'); scrim.className = 'impact-scrim'; scrim.setAttribute('aria-hidden', 'true');
    const canvas = document.createElement('canvas'); canvas.className = 'impact-canvas'; canvas.setAttribute('aria-hidden', 'true');
    screen.append(scrim, canvas);
    const ctx = canvas.getContext('2d');
    const ratio = Math.min(devicePixelRatio || 1, 2), width = screen.clientWidth;
    let height = screen.clientHeight;
    function resize() { height = screen.clientHeight; canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); }
    resize();
    const cars = Array.from(train.querySelectorAll('.carriage'));
    const impacted = cars[Math.max(0, failedIndex)] || train;
    const origin = impacted.getBoundingClientRect(), bounds = screen.getBoundingClientRect();
    const x = (origin.left + origin.width / 2 - bounds.left) / (bounds.width / width);
    const relativeY = Math.max(.26, Math.min(.37, (origin.top + origin.height / 2 - bounds.top) / bounds.height));
    const blast = document.createElement('div'); blast.className = 'imported-explosion';
    Object.assign(blast.style, { position: 'absolute', left: `${x}px`, top: `${relativeY * 100}%`, width: '92%', aspectRatio: '1', transform: 'translate(-50%,-50%)', zIndex: '9', pointerEvents: 'none' });
    const frames = Array.from({length:8}, (_, i) => { const image = new Image(); image.src = asset(`effects/explosion/frame-${i}.png`); image.alt = ''; Object.assign(image.style,{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain',visibility:'hidden'}); blast.append(image); return image; });
    screen.append(blast);
    await Promise.all(frames.map(image => image.decode().catch(() => {})));
    if (!screen.isConnected) { blast.remove(); canvas.remove(); return false; }
    ABAudio.cue('explosion');
    const sparks = Array.from({length: settings.sparks}, (_, i) => {
      const angle = (i / settings.sparks) * Math.PI * 2 + .13;
      return { vx: Math.cos(angle) * (95 + i % 4 * 24), vy: Math.sin(angle) * (75 + i % 5 * 19), delay: (i % 4) * .024 };
    });
    const puffs = Array.from({length: settings.smokePuffs}, (_, i) => ({
      delay: .12 + (i % 5) * .07, drift: Math.sin(i * 2.4) * (35 + i % 4 * 12), rise: 55 + i % 5 * 20, radius: 22 + i % 4 * 7
    }));
    // The canvas is decorative; a DOM burst remains available if Canvas is disabled.
    if (!ctx) { canvas.classList.add('impact-fallback'); canvas.style.setProperty('--impact-y', `${relativeY * 100}%`); }
    const active = await tween(settings.duration, fraction => {
      if (height !== screen.clientHeight) resize();
      const seconds = fraction * settings.duration / 1000, y = height * relativeY;
      // One impact jolt, then broken couplings let the failed car and trailing cars separate.
      const jolt = Math.max(0, 1 - seconds / .22);
      screen.style.setProperty('--impact-x', `${Math.sin(seconds * 62) * 3 * jolt}px`);
      screen.style.setProperty('--impact-y', `${Math.sin(seconds * 48) * 2 * jolt}px`);
      cars.forEach((car, i) => {
        const distance = i - Math.max(0, failedIndex); if (distance < 0) return;
        const t = clamp((seconds - distance * .055) / .9), eased = 1 - Math.pow(1 - t, 3);
        const direction = distance % 2 ? -1 : 1;
        car.style.transform = `translate(${direction * (distance === 0 ? 57 : 22) * eased}px,${(distance === 0 ? 45 : 15 + distance * 9) * eased}px) rotate(${direction * (distance === 0 ? 24 : 8) * eased}deg)`;
      });
      frames.forEach((frame, i) => frame.style.visibility = seconds < 2.2 && i === Math.min(7, Math.floor(seconds / 2.2 * 8)) ? 'visible' : 'hidden');
      scrim.style.opacity = String(clamp(seconds / .3) * settings.dim);
      canvas.dataset.phase = seconds < .35 ? 'impact' : seconds < 1 ? 'sparks' : 'smoke';
      if (!ctx) { canvas.style.opacity = String(1 - clamp(seconds / 1.5)); return; }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height);
      for (const spark of sparks) {
        const t = seconds - spark.delay;
        if (t < 0 || t > 1.2) continue;
        const px = x + spark.vx * t, py = y + spark.vy * t + 100 * t * t;
        ctx.globalAlpha = Math.pow(1 - t / 1.2, 1.4); ctx.strokeStyle = t < .3 ? '#fff8c7' : '#ffb83c'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - spark.vx * .045, py - (spark.vy + 200 * t) * .045); ctx.stroke();
      }
      for (const puff of puffs) {
        const t = seconds - puff.delay;
        if (t < 0) continue;
        const grow = 1 - Math.exp(-t * 3), fade = 1 - clamp((seconds - 1.25) / 1.55);
        glow(ctx, x + puff.drift * grow, y - puff.rise * t / 2.5, puff.radius * (.35 + grow * 1.1), [[0,'#b4aaa2'],[.45,'#777674'],[.8,'#44484a'],[1,'#323b4000']], Math.min(.62, t * 2) * fade);
      }
      ctx.globalAlpha = 1;
    });
    screen.style.removeProperty('--impact-x'); screen.style.removeProperty('--impact-y'); screen.style.removeProperty('--impact-roll');
    train.style.removeProperty('translate'); blast.remove();
    canvas.remove();
    return active;
  }
  window.ABEffects = { crash };
})();
