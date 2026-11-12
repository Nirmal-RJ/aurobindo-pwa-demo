(function (root) {
  'use strict';

  var CONFIG = root.SeeSawConfig || {};
  var AUDIO_CFG = CONFIG.audio || {};

  var ctx = null;
  var unlocked = false;
  var muted = false;
  var suspendedBySystem = false;
  var targetMode = 'none'; // 'menu' | 'game' | 'none'
  var currentMode = 'none';

  var tracks = {
    menu: {
      url: AUDIO_CFG.menuBgm || '../see-saw-assets/audio/menu-bgm.mp3',
      targetVol: AUDIO_CFG.menuVolume || 0.42,
      buffer: null,
      source: null,
      gainNode: null,
      htmlAudio: null,
      fadeTimer: null,
      playing: false
    },
    game: {
      url: AUDIO_CFG.gameBgm || '../see-saw-assets/audio/game-bgm.mp3',
      targetVol: AUDIO_CFG.gameVolume || 0.48,
      buffer: null,
      source: null,
      gainNode: null,
      htmlAudio: null,
      fadeTimer: null,
      playing: false
    }
  };

  var sfxTracks = {
    correct: {
      url: AUDIO_CFG.correctSfx || '../see-saw-assets/audio/correct.mp3',
      volume: AUDIO_CFG.sfxVolume || 0.70,
      buffer: null,
      htmlAudio: null
    },
    wrong: {
      url: AUDIO_CFG.wrongSfx || '../see-saw-assets/audio/wrong.mp3',
      volume: AUDIO_CFG.sfxVolume || 0.65,
      buffer: null,
      htmlAudio: null
    },
    timeUp: {
      url: AUDIO_CFG.timeUpSfx || '../see-saw-assets/audio/time-up.mp3',
      volume: AUDIO_CFG.sfxVolume || 0.65,
      buffer: null,
      htmlAudio: null
    }
  };

  function ensureContext() {
    if (ctx) return ctx;
    var AudioCtx = root.AudioContext || root.webkitAudioContext;
    if (AudioCtx) {
      try {
        ctx = new AudioCtx();
      } catch (_) {
        ctx = null;
      }
    }
    return ctx;
  }

  function fetchAndDecodeTrack(key, onProgress) {
    var track = tracks[key];
    if (!track) return Promise.resolve();
    var audioCtx = ensureContext();

    return fetch(track.url)
      .then(function (res) {
        if (!res.ok) throw new Error('Audio HTTP ' + res.status);
        return res.arrayBuffer();
      })
      .then(function (buf) {
        if (typeof onProgress === 'function') onProgress(0.6);
        if (audioCtx && typeof audioCtx.decodeAudioData === 'function') {
          return new Promise(function (resolve) {
            audioCtx.decodeAudioData(
              buf.slice(0),
              function (decoded) {
                track.buffer = decoded;
                if (typeof onProgress === 'function') onProgress(1);
                resolve();
              },
              function () {
                setupHtmlAudioFallback(track);
                if (typeof onProgress === 'function') onProgress(1);
                resolve();
              }
            );
          });
        }
        setupHtmlAudioFallback(track);
        if (typeof onProgress === 'function') onProgress(1);
        return Promise.resolve();
      })
      .catch(function () {
        setupHtmlAudioFallback(track);
        if (typeof onProgress === 'function') onProgress(1);
      });
  }

  function fetchAndDecodeSfx(key) {
    var sfx = sfxTracks[key];
    if (!sfx) return Promise.resolve();
    var audioCtx = ensureContext();

    return fetch(sfx.url)
      .then(function (res) {
        if (!res.ok) throw new Error('SFX HTTP ' + res.status);
        return res.arrayBuffer();
      })
      .then(function (buf) {
        if (audioCtx && typeof audioCtx.decodeAudioData === 'function') {
          return new Promise(function (resolve) {
            audioCtx.decodeAudioData(
              buf.slice(0),
              function (decoded) {
                sfx.buffer = decoded;
                resolve();
              },
              function () {
                setupHtmlAudioSfx(sfx);
                resolve();
              }
            );
          });
        }
        setupHtmlAudioSfx(sfx);
        return Promise.resolve();
      })
      .catch(function () {
        setupHtmlAudioSfx(sfx);
      });
  }

  function setupHtmlAudioFallback(track) {
    if (track.htmlAudio || typeof Audio === 'undefined') return;
    try {
      var el = new Audio();
      el.src = track.url;
      el.loop = true;
      el.preload = 'auto';
      el.volume = 0;
      track.htmlAudio = el;
    } catch (_) {
      /* ignore */
    }
  }

  function setupHtmlAudioSfx(sfx) {
    if (sfx.htmlAudio || typeof Audio === 'undefined') return;
    try {
      var el = new Audio();
      el.src = sfx.url;
      el.preload = 'auto';
      sfx.htmlAudio = el;
    } catch (_) {
      /* ignore */
    }
  }

  function preloadAll(onTrackProgress) {
    var bgmKeys = ['menu', 'game'];
    var sfxKeys = ['correct', 'wrong', 'timeUp'];
    var total = bgmKeys.length + sfxKeys.length;
    var loaded = 0;

    function reportOne() {
      loaded += 1;
      if (typeof onTrackProgress === 'function') {
        onTrackProgress(Math.min(1, loaded / total));
      }
    }

    var promises = bgmKeys.map(function (key) {
      return fetchAndDecodeTrack(key, function (p) {
        if (p >= 1) reportOne();
      });
    }).concat(sfxKeys.map(function (key) {
      return fetchAndDecodeSfx(key).then(reportOne, reportOne);
    }));

    return Promise.all(promises);
  }

  function startTrackNode(key) {
    var track = tracks[key];
    if (!track) return;
    var audioCtx = ensureContext();
    if (audioCtx && track.buffer) {
      if (track.source) return;
      try {
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        gain.connect(audioCtx.destination);
        var src = audioCtx.createBufferSource();
        src.buffer = track.buffer;
        src.loop = true;
        src.connect(gain);
        src.start(0);
        track.source = src;
        track.gainNode = gain;
        track.playing = true;
      } catch (_) {
        /* ignore */
      }
      return;
    }
    setupHtmlAudioFallback(track);
    if (track.htmlAudio && !track.playing) {
      track.htmlAudio.volume = 0;
      var p = track.htmlAudio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {});
      }
      track.playing = true;
    }
  }

  function fadeHtmlAudio(track, targetVol, durationSec) {
    if (!track.htmlAudio) return;
    if (track.fadeTimer) {
      clearInterval(track.fadeTimer);
      track.fadeTimer = null;
    }
    if (targetVol > 0 && !track.playing) {
      track.htmlAudio.volume = 0;
      var p = track.htmlAudio.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
      track.playing = true;
    }
    var startVol = track.htmlAudio.volume;
    var startTime = Date.now();
    var durationMs = Math.max(50, (durationSec || 1.2) * 1000);
    track.fadeTimer = setInterval(function () {
      var elapsed = Date.now() - startTime;
      var progress = Math.min(1, elapsed / durationMs);
      var currentVol = startVol + (targetVol - startVol) * (progress * (2 - progress));
      track.htmlAudio.volume = Math.max(0, Math.min(1, currentVol));
      if (progress >= 1) {
        clearInterval(track.fadeTimer);
        track.fadeTimer = null;
        track.htmlAudio.volume = targetVol;
        if (targetVol <= 0.001) {
          track.htmlAudio.pause();
          track.playing = false;
        }
      }
    }, 25);
  }

  function rampTrackVolume(key, targetVol, durationSec) {
    var track = tracks[key];
    if (!track) return;
    var effectiveVol = muted || suspendedBySystem ? 0 : targetVol;
    var fadeSec = typeof durationSec === 'number' ? durationSec : (AUDIO_CFG.crossfadeDuration || 1.2);

    if (effectiveVol > 0 && unlocked) {
      startTrackNode(key);
    }

    if (ctx && track.gainNode) {
      try {
        var now = ctx.currentTime;
        var currentVal = track.gainNode.gain.value;
        track.gainNode.gain.cancelScheduledValues(now);
        track.gainNode.gain.setValueAtTime(Math.max(0.0001, currentVal), now);
        // Exponential ramp for natural, smooth swell and decay without pops
        track.gainNode.gain.exponentialRampToValueAtTime(
          Math.max(0.0001, effectiveVol),
          now + Math.max(0.05, fadeSec)
        );
      } catch (_) {
        try {
          track.gainNode.gain.linearRampToValueAtTime(
            Math.max(0.0001, effectiveVol),
            now + Math.max(0.05, fadeSec)
          );
        } catch (e) {
          /* ignore */
        }
      }
    } else if (track.htmlAudio) {
      fadeHtmlAudio(track, effectiveVol, fadeSec);
    }
  }

  function applyMode(durationSec) {
    if (!unlocked) return;
    if (ctx && ctx.state === 'suspended' && !suspendedBySystem) {
      ctx.resume().catch(function () {});
    }
    if (targetMode === 'menu') {
      rampTrackVolume('menu', tracks.menu.targetVol, durationSec);
      rampTrackVolume('game', 0, durationSec);
    } else if (targetMode === 'game') {
      rampTrackVolume('menu', 0, durationSec);
      rampTrackVolume('game', tracks.game.targetVol, durationSec);
    } else {
      rampTrackVolume('menu', 0, durationSec || 0.8);
      rampTrackVolume('game', 0, durationSec || 0.8);
    }
  }

  function setMode(mode) {
    if (mode !== 'menu' && mode !== 'game' && mode !== 'none') {
      mode = 'none';
    }
    if (mode === targetMode && currentMode === mode) {
      return;
    }
    targetMode = mode;
    currentMode = mode;
    var duration = mode === 'none' ? 0.8 : (AUDIO_CFG.crossfadeDuration || 1.2);
    applyMode(duration);
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    var audioCtx = ensureContext();
    if (audioCtx && audioCtx.state === 'suspended' && !suspendedBySystem) {
      audioCtx.resume().catch(function () {});
    }
    if (targetMode !== 'none') {
      applyMode(0.8);
    }
  }

  function setSystemSuspended(suspended) {
    suspendedBySystem = Boolean(suspended);
    if (ctx) {
      if (suspendedBySystem && ctx.state === 'running') {
        ctx.suspend().catch(function () {});
      } else if (!suspendedBySystem && unlocked && ctx.state === 'suspended') {
        ctx.resume().catch(function () {});
      }
    }
    applyMode(0.4);
  }

  function playToneSequence(notes) {
    if (muted || suspendedBySystem || !unlocked) return;
    var audioCtx = ensureContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function () {});
    }
    var now = audioCtx.currentTime;
    notes.forEach(function (n) {
      try {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = n.type || 'sine';
        osc.frequency.setValueAtTime(n.freq, now + (n.delay || 0));
        if (n.endFreq) {
          osc.frequency.exponentialRampToValueAtTime(n.endFreq, now + (n.delay || 0) + n.duration);
        }
        var vol = n.vol || 0.12;
        gain.gain.setValueAtTime(0.0001, now + (n.delay || 0));
        gain.gain.linearRampToValueAtTime(vol, now + (n.delay || 0) + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (n.delay || 0) + n.duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + (n.delay || 0));
        osc.stop(now + (n.delay || 0) + n.duration + 0.02);
      } catch (_) {
        /* ignore */
      }
    });
  }

  function playSfx(key) {
    if (muted || suspendedBySystem || !unlocked) return;
    var sfx = sfxTracks[key];
    var audioCtx = ensureContext();
    var offset = key === 'wrong' ? Math.max(0, Number(AUDIO_CFG.wrongStartOffsetSeconds) || 0) : 0;
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function () {});
    }
    if (audioCtx && sfx && sfx.buffer) {
      try {
        var src = audioCtx.createBufferSource();
        src.buffer = sfx.buffer;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(sfx.volume || 0.70, audioCtx.currentTime);
        src.connect(gain);
        gain.connect(audioCtx.destination);
        src.start(0, Math.min(offset, Math.max(0, sfx.buffer.duration - 0.01)));
        return;
      } catch (_) {
        /* fallback below */
      }
    }
    if (sfx && sfx.url && typeof Audio !== 'undefined') {
      try {
        var a = sfx.htmlAudio || new Audio(sfx.url);
        a.currentTime = offset;
        a.volume = Math.max(0, Math.min(1, sfx.volume || 0.70));
        var p = a.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
        return;
      } catch (_) {
        /* fallback to tone */
      }
    }
    // Synthetic oscillator fallback if audio decoding fails
    if (key === 'correct') {
      playToneSequence([
        { freq: 523.25, duration: 0.11, delay: 0, type: 'triangle', vol: 0.15 },
        { freq: 659.25, duration: 0.11, delay: 0.09, type: 'triangle', vol: 0.15 },
        { freq: 783.99, duration: 0.22, delay: 0.18, type: 'triangle', vol: 0.17 }
      ]);
    } else if (key === 'wrong') {
      playToneSequence([
        { freq: 300, endFreq: 210, duration: 0.16, delay: 0, type: 'sawtooth', vol: 0.11 },
        { freq: 210, endFreq: 155, duration: 0.24, delay: 0.14, type: 'sawtooth', vol: 0.11 }
      ]);
    } else if (key === 'timeUp') {
      playToneSequence([
        { freq: 440, endFreq: 330, duration: 0.14, delay: 0, type: 'square', vol: 0.09 },
        { freq: 330, endFreq: 220, duration: 0.26, delay: 0.14, type: 'square', vol: 0.10 }
      ]);
    }
  }

  function playClick() {
    playToneSequence([{ freq: 580, endFreq: 760, duration: 0.065, type: 'triangle', vol: 0.11 }]);
  }

  function playPlace() {
    playToneSequence([
      { freq: 320, endFreq: 480, duration: 0.09, type: 'sine', vol: 0.14 }
    ]);
  }

  function playCorrect() {
    playSfx('correct');
  }

  function playWrong() {
    playSfx('wrong');
  }

  function playTimeUp() {
    playSfx('timeUp');
  }

  function playStar() {
    playToneSequence([
      { freq: 523.25, duration: 0.11, delay: 0, type: 'triangle', vol: 0.15 },
      { freq: 659.25, duration: 0.11, delay: 0.09, type: 'triangle', vol: 0.15 },
      { freq: 783.99, duration: 0.12, delay: 0.18, type: 'triangle', vol: 0.16 },
      { freq: 1046.5, duration: 0.32, delay: 0.28, type: 'triangle', vol: 0.18 }
    ]);
  }

  root.SeeSawAudio = {
    preloadAll: preloadAll,
    unlock: unlock,
    setMode: setMode,
    setSystemSuspended: setSystemSuspended,
    playClick: playClick,
    playPlace: playPlace,
    playCorrect: playCorrect,
    playWrong: playWrong,
    playTimeUp: playTimeUp,
    playStar: playStar
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
