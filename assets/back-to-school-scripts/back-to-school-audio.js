const AUDIO_BASE = '../back-to-school-assets/audio';

const TRACKS = {
  menu: `${AUDIO_BASE}/Menu BGM.mp3`,
  game: `${AUDIO_BASE}/Game BGM.mp3`
};

const SFX = {
  correct: `${AUDIO_BASE}/Correct Answer.mp3`,
  wrong: `${AUDIO_BASE}/Wrong Answer.mp3`,
  tooSlow: `${AUDIO_BASE}/Target Time  Fail.mp3`,
  timeUp: `${AUDIO_BASE}/Time Up.mp3`
};

const BGM_VOLUME = 0.42;
const FADE_MS = 450;

export function createAudioManager() {
  let muted = false;
  let unlocked = false;
  let currentTrackKey = null;
  let desiredTrackKey = 'menu';
  let fadeRaf = null;
  let activeSfx = null;

  const bgmElements = {
    menu: new Audio(TRACKS.menu),
    game: new Audio(TRACKS.game)
  };
  bgmElements.menu.loop = true;
  bgmElements.game.loop = true;
  bgmElements.menu.preload = 'auto';
  bgmElements.game.preload = 'auto';
  bgmElements.menu.volume = 0;
  bgmElements.game.volume = 0;

  const sfxCache = {};
  for (const [k, src] of Object.entries(SFX)) {
    const a = new Audio(src);
    a.preload = 'auto';
    sfxCache[k] = a;
  }

  function cancelFade() {
    if (fadeRaf !== null) {
      cancelAnimationFrame(fadeRaf);
      fadeRaf = null;
    }
  }

  function crossfadeTo(nextKey) {
    if (currentTrackKey === nextKey) return;
    const prevKey = currentTrackKey;
    currentTrackKey = nextKey;
    cancelFade();

    const nextEl = nextKey ? bgmElements[nextKey] : null;
    const prevEl = prevKey ? bgmElements[prevKey] : null;

    if (nextEl && !muted && unlocked) {
      if (nextEl.paused) {
        nextEl.volume = 0;
        nextEl.play().catch(() => {});
      }
    }

    const startTime = performance.now();
    const startPrevVol = prevEl ? prevEl.volume : 0;
    const startNextVol = nextEl ? nextEl.volume : 0;
    const targetNextVol = nextEl && !muted ? BGM_VOLUME : 0;

    function step(now) {
      const t = Math.min(1, (now - startTime) / FADE_MS);
      const ease = t * (2 - t);

      if (prevEl) {
        prevEl.volume = Math.max(0, startPrevVol * (1 - ease));
        if (t >= 1 && prevEl !== nextEl) {
          prevEl.pause();
        }
      }
      if (nextEl && !muted && unlocked) {
        nextEl.volume = startNextVol + (targetNextVol - startNextVol) * ease;
      }
      if (t < 1) {
        fadeRaf = requestAnimationFrame(step);
      } else {
        fadeRaf = null;
      }
    }
    fadeRaf = requestAnimationFrame(step);
  }

  function unlock() {
    if (!unlocked) {
      unlocked = true;
    }
    if (!muted && desiredTrackKey) {
      const el = bgmElements[desiredTrackKey];
      if (el && el.paused) {
        el.volume = 0;
        el.play().catch(() => {});
      }
      if (currentTrackKey !== desiredTrackKey) {
        crossfadeTo(desiredTrackKey);
      } else if (el) {
        el.volume = BGM_VOLUME;
      }
    }
  }

  function setTrack(trackKey) {
    desiredTrackKey = trackKey;
    if (!unlocked || muted) {
      currentTrackKey = trackKey;
      return;
    }
    crossfadeTo(trackKey);
  }

  function playSfx(name) {
    if (muted || !sfxCache[name]) return;
    if (activeSfx && !activeSfx.paused) {
      activeSfx.pause();
      activeSfx.currentTime = 0;
    }
    const sfx = sfxCache[name];
    activeSfx = sfx;
    sfx.currentTime = 0;
    sfx.volume = 0.85;

    // Gently duck BGM while outcome SFX plays, then restore smoothly
    const bgm = currentTrackKey ? bgmElements[currentTrackKey] : null;
    if (bgm && !bgm.paused) {
      bgm.volume = BGM_VOLUME * 0.28;
      sfx.onended = () => {
        if (!muted && bgm && !bgm.paused) {
          bgm.volume = BGM_VOLUME;
        }
      };
    }
    sfx.play().catch(() => {});
  }

  function toggleMute() {
    muted = !muted;
    if (muted) {
      cancelFade();
      bgmElements.menu.pause();
      bgmElements.game.pause();
      if (activeSfx && !activeSfx.paused) {
        activeSfx.pause();
      }
    } else if (unlocked && desiredTrackKey) {
      const el = bgmElements[desiredTrackKey];
      if (el) {
        el.volume = 0;
        el.play().catch(() => {});
        currentTrackKey = null;
        crossfadeTo(desiredTrackKey);
      }
    }
    return muted;
  }

  function isMuted() {
    return muted;
  }

  return { unlock, setTrack, playSfx, toggleMute, isMuted };
}

