/* Isolated Web Audio mixer. Gain ramps survive rapid scene changes without restarting loops. */
(() => {
  'use strict';
  if (!window.AudioContext && !window.webkitAudioContext) {
    const media = new Map(); let scene = 'menu', active = false, paused = false, last = performance.now();
    const settings = () => ABConfig.audio;
    function play(audio) { if (audio) audio.play().catch(() => {}); }
    function update(now) {
      const step = Math.min((now - last) / 1000, .1) / settings().crossfade; last = now;
      for (const name of ['menu', 'game']) { const audio = media.get(settings()[name]); if (!audio) continue; const target = name === scene ? settings()[name + 'Volume'] : 0; audio.volume += Math.sign(target - audio.volume) * Math.min(Math.abs(target - audio.volume), step); }
      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
    function unlock() { if (paused) return; active = true; for (const name of ['menu', 'game']) play(media.get(settings()[name])); }
    function cue(name) { const audio = media.get(settings()[name]); if (!active || paused || !audio) return; audio.volume = settings()[name + 'Volume']; audio.currentTime = 0; play(audio); }
    window.ABAudio = {
      cue,
      async prepare(path, blob) { const audio = new Audio(URL.createObjectURL(blob)); audio.preload = 'auto'; audio.loop = path === settings().menu || path === settings().game; audio.volume = audio.loop ? 0 : settings().wrongVolume; media.set(path, audio); if (active && audio.loop && !paused) play(audio); },
      setScene(name) { for (const key of ['trainEntry', 'correct', 'whoosh', 'explosion', 'tick']) { const audio = media.get(settings()[key]); if (audio) { audio.pause(); audio.currentTime = 0; } } scene = ['arrange', 'checking'].includes(name) ? 'game' : 'menu'; const wrong = media.get(settings().wrong); if (wrong) { wrong.pause(); wrong.currentTime = 0; } },
      setPaused(value) { paused = value; if (value) for (const audio of media.values()) audio.pause(); else if (active) unlock(); },
      wrong() { const audio = media.get(settings().wrong); if (active && !paused && audio) { audio.currentTime = 0; play(audio); } }
    };
    document.addEventListener('click', event => { unlock(); const button = event.target.closest('button'); const audio = media.get('audio/button.wav'); if (button && !button.disabled && !button.closest('[inert]') && audio && !paused) { audio.volume = settings().buttonVolume; audio.playbackRate = .96 + Math.random() * .08; audio.currentTime = 0; play(audio); } }, true);
    return;
  }
  let context, unlocked = false, paused = false, scene = 'menu', wrongSource, lastPitch = -1;
  const buffers = new Map(), tracks = new Map(), cues = new Map();
  const settings = () => ABConfig.audio;
  function ctx() { return context || (context = new (window.AudioContext || window.webkitAudioContext)()); }
  async function prepare(path, blob) { buffers.set(path, await ctx().decodeAudioData(await blob.arrayBuffer())); if (unlocked) mix(); }
  function ramp(track, target) {
    const now = context.currentTime, previous = track.ramp;
    const value = previous ? previous.from + (previous.to - previous.from) * Math.min(1, Math.max(0, (now - previous.start) / previous.duration)) : 0;
    track.gain.gain.cancelScheduledValues(now); track.gain.gain.setValueAtTime(value, now);
    track.gain.gain.linearRampToValueAtTime(target, now + settings().crossfade);
    track.ramp = { from: value, to: target, start: now, duration: settings().crossfade };
  }
  function mix() {
    if (!unlocked) return;
    for (const name of ['menu', 'game']) {
      let track = tracks.get(name);
      const buffer = buffers.get(settings()[name]); if (!buffer) continue;
      if (!track) {
        const source = context.createBufferSource(), gain = context.createGain();
        source.buffer = buffer; source.loop = true; gain.gain.value = 0;
        source.connect(gain).connect(context.destination); source.start();
        track = { source, gain }; tracks.set(name, track);
      }
      ramp(track, scene === name ? settings()[name + 'Volume'] : 0);
    }
  }
  function unlock() {
    if (paused) return;
    const audio = ctx(); audio.resume().catch(() => {});
    if (!unlocked) { unlocked = true; mix(); }
  }
  function setScene(name) {
    for (const source of cues.values()) source.stop(); cues.clear();
    if (wrongSource) { wrongSource.stop(); wrongSource = null; }
    const next = ['arrange', 'checking'].includes(name) ? 'game' : 'menu';
    if (next !== scene) { scene = next; mix(); }
  }
  function setPaused(value) {
    paused = value;
    if (!context || !unlocked) return;
    if (value) context.suspend().catch(() => {}); else context.resume().catch(() => {});
  }
  function wrong() {
    if (!unlocked || paused) return;
    if (wrongSource) wrongSource.stop();
    const buffer = buffers.get(settings().wrong); if (!buffer) return;
    const source = context.createBufferSource(), gain = context.createGain();
    source.buffer = buffer; gain.gain.value = settings().wrongVolume;
    source.connect(gain).connect(context.destination); wrongSource = source;
    source.onended = () => { source.disconnect(); gain.disconnect(); if (wrongSource === source) wrongSource = null; };
    source.start();
  }
  function cue(name) {
    if (!unlocked || paused) return;
    const buffer = buffers.get(settings()[name]); if (!buffer) return;
    cues.get(name)?.stop();
    const source = context.createBufferSource(), gain = context.createGain();
    source.buffer = buffer; gain.gain.value = settings()[name + 'Volume'];
    source.connect(gain).connect(context.destination); cues.set(name, source);
    source.onended = () => { source.disconnect(); gain.disconnect(); if (cues.get(name) === source) cues.delete(name); }; source.start();
  }
  function click() {
    unlock(); if (paused) return;
    // A soft, short wooden/plucked UI tone; never repeat the previous pitch.
    let pitch = Math.floor(Math.random() * 5); if (pitch === lastPitch) pitch = (pitch + 1) % 5; lastPitch = pitch;
    const buffer = buffers.get('audio/button.wav'); if (!buffer) return;
    const source = context.createBufferSource(), gain = context.createGain();
    source.buffer = buffer; source.playbackRate.value = Math.pow(2, (pitch - 2) / 24);
    gain.gain.value = settings().buttonVolume;
    source.connect(gain).connect(context.destination); source.start();
    source.onended = () => { source.disconnect(); gain.disconnect(); };
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button && !button.disabled && !button.closest('[inert]')) click(); else unlock();
  }, true);
  document.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('pagehide', () => setPaused(true));
  window.addEventListener('pageshow', () => setPaused(document.hidden || document.body.classList.contains('needs-portrait')));
  window.ABAudio = { prepare, setScene, setPaused, wrong, cue };
})();
