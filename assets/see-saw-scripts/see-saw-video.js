(function (root) {
  'use strict';

  var ytApiPromise = null;
  var activeCleanup = null;

  function extractYouTubeId(url) {
    if (!url || typeof url !== 'string') return '';
    var trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    var match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|watch\?v=))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  function loadYouTubeApi() {
    if (root.YT && root.YT.Player) return Promise.resolve(root.YT);
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise(function (resolve, reject) {
      function fail() {
        clearTimeout(timeout);
        script.remove();
        ytApiPromise = null;
        reject(new Error('YouTube unavailable'));
      }
      var timeout = setTimeout(fail, 15000);
      var prev = root.onYouTubeIframeAPIReady;
      root.onYouTubeIframeAPIReady = function () {
        clearTimeout(timeout);
        if (typeof prev === 'function') prev();
        resolve(root.YT);
      };
      var script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = fail;
      document.head.appendChild(script);
    });
    return ytApiPromise;
  }

  // Keep onboarding players in their original DOM nodes: moving an iframe reloads it.
  var preparedPlayers = Object.create(null);
  function preparePlayers(pairs, container) {
    if (!container) return loadYouTubeApi().catch(function () {});
    return loadYouTubeApi().then(function (YT) {
      (pairs || []).forEach(function (pair) {
        var id = extractYouTubeId(pair.youtube);
        if (!id || preparedPlayers[id]) return;
        var wrap = document.createElement('div');
        wrap.className = 'ss-prepared-video';
        wrap.style.visibility = 'hidden';
        wrap.style.pointerEvents = 'none';
        var host = document.createElement('div');
        host.className = 'ss-yt-host';
        wrap.appendChild(host);
        container.appendChild(wrap);
        var slot = {container: container, wrap: wrap, player: null, ready: false, events: null, failed: false};
        preparedPlayers[id] = slot;
        slot.player = new YT.Player(host, {
          videoId: id,
          playerVars: {autoplay: 0, loop: 0, controls: 1, playsinline: 1, rel: 0, origin: root.location.origin},
          events: {
            onReady: function (ev) {
              slot.ready = true;
              if (slot.events) slot.events.onReady(ev);
            },
            onStateChange: function (ev) {
              if (!slot.events) {
                if (ev.data === 1 && slot.player) slot.player.pauseVideo();
                return;
              }
              slot.events.onStateChange(ev);
            },
            onAutoplayBlocked: function (ev) { if (slot.events) slot.events.onAutoplayBlocked(ev); },
            onError: function () { slot.failed = true; if (slot.events) slot.events.onError(); }
          }
        });
      });
    }).catch(function () {});
  }

  function clearPreparedContainer(container) {
    Object.keys(preparedPlayers).forEach(function (id) {
      var slot = preparedPlayers[id];
      if (slot.container !== container) return;
      slot.events = null;
      try { slot.player.destroy(); } catch (_) {}
      slot.wrap.remove();
      delete preparedPlayers[id];
    });
  }

  function stopActiveVideo() {
    if (typeof activeCleanup === 'function') {
      try {
        activeCleanup();
      } catch (_) {
        /* ignore */
      }
      activeCleanup = null;
    }
  }

  var FALLBACK_SLIDES = [
    {
      src: '../see-saw-assets/videos/fallback-slides/slide-1.webp',
      text: 'Drag the cause to balance the seesaw'
    },
    {
      src: '../see-saw-assets/videos/fallback-slides/slide-2.webp',
      text: 'Wrong cause tilts the seesaw!'
    },
    {
      src: '../see-saw-assets/videos/fallback-slides/slide-3.webp',
      text: 'Mascot falls down — Try again!'
    },
    {
      src: '../see-saw-assets/videos/fallback-slides/slide-4.webp',
      text: 'Correct! The seesaw is balanced'
    }
  ];

  function mountPlaceholderPlayer(container, pair, options) {
    var opts = options || {};
    var durationMs = opts.durationMs || 5600;
    try {
      var params = new URLSearchParams(root.location && root.location.search ? root.location.search : '');
      if (params.get('fastVideo') === '1') {
        durationMs = 250;
      }
    } catch (_) {
      /* ignore */
    }

    container.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'ss-video-player-wrap';
    wrap.setAttribute('data-testid', 'video-player-wrap');

    // Slide Image
    var slideImg = document.createElement('img');
    slideImg.className = 'ss-video-slide-img';
    slideImg.src = FALLBACK_SLIDES[0].src;
    slideImg.alt = FALLBACK_SLIDES[0].text;
    slideImg.draggable = false;
    wrap.appendChild(slideImg);

    // Top Header Badge
    var topBadge = document.createElement('div');
    topBadge.className = 'ss-video-header-badge';
    var sym = pair && pair.symptom ? pair.symptom : 'HPLC Troubleshooting';
    var cause = pair && pair.cause ? pair.cause : 'Balanced Seesaw';
    topBadge.textContent = sym + ' ➔ ' + cause;
    wrap.appendChild(topBadge);

    // Bottom Controls Bar
    var controls = document.createElement('div');
    controls.className = 'ss-video-controls';

    var playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'ss-video-ctrl-btn';
    playBtn.setAttribute('aria-label', 'Pause video');
    playBtn.innerHTML = '❚❚';
    controls.appendChild(playBtn);

    var progressTrack = document.createElement('div');
    progressTrack.className = 'ss-video-ctrl-track';
    var progressFill = document.createElement('div');
    progressFill.className = 'ss-video-ctrl-fill';
    progressTrack.appendChild(progressFill);
    controls.appendChild(progressTrack);

    var timeLabel = document.createElement('div');
    timeLabel.className = 'ss-video-ctrl-time';
    timeLabel.textContent = '0:00 / 0:05';
    controls.appendChild(timeLabel);

    wrap.appendChild(controls);

    // Slide step dots
    var dotsRow = document.createElement('div');
    dotsRow.className = 'ss-video-dots-row';
    var dots = [];
    FALLBACK_SLIDES.forEach(function (_, i) {
      var dot = document.createElement('span');
      dot.className = 'ss-video-dot' + (i === 0 ? ' is-active' : '');
      dots.push(dot);
      dotsRow.appendChild(dot);
    });
    wrap.appendChild(dotsRow);

    container.appendChild(wrap);

    var startTime = performance.now();
    var pausedTime = 0;
    var pauseStart = 0;
    var isPlaying = true;
    var rafId = null;
    var finished = false;
    var currentSlideIndex = 0;

    function formatTime(ms) {
      var sec = Math.floor(ms / 1000);
      var m = Math.floor(sec / 60);
      var s = sec % 60;
      return m + ':' + (s < 10 ? '0' + s : s);
    }

    function setSlide(index) {
      if (index === currentSlideIndex) return;
      currentSlideIndex = index;
      var slide = FALLBACK_SLIDES[index];
      if (slide) {
        slideImg.src = slide.src;
        slideImg.alt = slide.text;
      }
      dots.forEach(function (d, idx) {
        d.classList.toggle('is-active', idx === index);
      });
    }

    function finish() {
      if (finished) return;
      finished = true;
      if (rafId) cancelAnimationFrame(rafId);
      progressFill.style.width = '100%';
      timeLabel.textContent = formatTime(durationMs) + ' / ' + formatTime(durationMs);
      setSlide(FALLBACK_SLIDES.length - 1);
      wrap.classList.add('is-complete');
      playBtn.innerHTML = '↺';
      playBtn.setAttribute('aria-label', 'Replay video');
      if (typeof opts.onComplete === 'function') {
        opts.onComplete();
      }
    }

    function tick(now) {
      if (finished || !isPlaying) return;
      var elapsed = Math.max(0, now - startTime - pausedTime);
      var ratio = Math.min(1, elapsed / durationMs);
      progressFill.style.width = Math.round(ratio * 100) + '%';
      timeLabel.textContent = formatTime(elapsed) + ' / ' + formatTime(durationMs);

      var slideIdx = Math.min(
        FALLBACK_SLIDES.length - 1,
        Math.floor(ratio * FALLBACK_SLIDES.length)
      );
      setSlide(slideIdx);

      if (ratio >= 1) {
        finish();
      } else {
        rafId = requestAnimationFrame(tick);
      }
    }

    function togglePlay() {
      if (finished) {
        // Replay
        finished = false;
        isPlaying = true;
        wrap.classList.remove('is-complete');
        playBtn.innerHTML = '❚❚';
        playBtn.setAttribute('aria-label', 'Pause video');
        startTime = performance.now();
        pausedTime = 0;
        setSlide(0);
        rafId = requestAnimationFrame(tick);
        return;
      }
      if (isPlaying) {
        isPlaying = false;
        pauseStart = performance.now();
        playBtn.innerHTML = '▶';
        playBtn.setAttribute('aria-label', 'Play video');
        if (rafId) cancelAnimationFrame(rafId);
      } else {
        isPlaying = true;
        pausedTime += performance.now() - pauseStart;
        playBtn.innerHTML = '❚❚';
        playBtn.setAttribute('aria-label', 'Pause video');
        rafId = requestAnimationFrame(tick);
      }
    }

    playBtn.addEventListener('click', togglePlay);

    progressTrack.addEventListener('click', function (ev) {
      if (!opts.allowControls) return;
      var rect = progressTrack.getBoundingClientRect();
      var clickRatio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      var targetElapsed = clickRatio * durationMs;
      var now = performance.now();
      startTime = now - targetElapsed - pausedTime;
      if (!isPlaying) {
        pauseStart = now;
      }
      tick(now);
    });

    rafId = requestAnimationFrame(tick);

    activeCleanup = function () {
      finished = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }

  function mountLocalVideo(container, pair, options) {
    var opts = options || {};
    container.innerHTML = '';
    var video = document.createElement('video');
    video.className = 'ss-video-element';
    video.preload = 'none';
    video.loop = false;
    video.src = pair.video;
    video.controls = Boolean(opts.allowControls);
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.autoplay = true;

    var completed = false;
    var disposed = false;
    function markComplete() {
      if (completed || disposed) return;
      completed = true;
      if (typeof opts.onComplete === 'function') {
        opts.onComplete();
      }
    }

    video.addEventListener('ended', markComplete);
    video.addEventListener('error', function () {
      if (disposed) return;
      stopActiveVideo();
      mountPlaceholderPlayer(container, pair, opts);
    });

    container.appendChild(video);
    var p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () {
        if (disposed) return;
        video.controls = true;
      });
    }

    activeCleanup = function () {
      disposed = true;
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch (_) {
        /* ignore */
      }
    };
  }

  function mountVideo(container, pair, options) {
    stopActiveVideo();
    if (!container) return;
    var opts = options || {};
    var ytId = pair && pair.youtube ? extractYouTubeId(pair.youtube) : '';

    if (ytId) {
      var prepared = preparedPlayers[ytId];
      if (prepared && (prepared.container !== container || !prepared.wrap.isConnected || prepared.failed)) prepared = null;
      if (!prepared) container.innerHTML = '';
      var playerHost = document.createElement('div');
      playerHost.className = 'ss-yt-host';
      if (!prepared) container.appendChild(playerHost);
      else { prepared.wrap.style.visibility = 'visible'; prepared.wrap.style.pointerEvents = 'auto'; }
      var destroyed = false;
      var ytPlayer = null;
      var completed = false;
      var completionTimer = null;
      var readyTimer = null;
      var tapButton = null;
      var startupTimer = null;
      var loading = document.createElement('div');
      loading.className = 'ss-video-loading';
      loading.setAttribute('role', 'status');
      loading.setAttribute('aria-label', 'Loading video');
      container.appendChild(loading);
      function removeLoading() {
        if (loading) loading.remove();
        loading = null;
      }
      function removeTap() {
        if (tapButton) tapButton.remove();
        tapButton = null;
      }
      function showTap(player) {
        if (destroyed || completed || tapButton) return;
        removeLoading();
        tapButton = document.createElement('button');
        tapButton.type = 'button';
        tapButton.className = 'ss-video-tap';
        tapButton.textContent = 'Tap to play';
        tapButton.addEventListener('click', function () {
          if (!destroyed && player && typeof player.playVideo === 'function') player.playVideo();
        });
        container.appendChild(tapButton);
      }
      function useFallback() {
        if (destroyed) return;
        stopActiveVideo();
        clearPreparedContainer(container);
        if (pair && pair.video) mountLocalVideo(container, pair, opts);
        else mountPlaceholderPlayer(container, pair, opts);
      }

      function finishYouTubeVideo() {
        if (destroyed || completed) return;
        completed = true;
        clearTimeout(startupTimer);
        removeLoading();
        removeTap();
        if (completionTimer) clearInterval(completionTimer);
        completionTimer = null;
        if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') ytPlayer.pauseVideo();
        if (typeof opts.onComplete === 'function') opts.onComplete();
      }

      function checkYouTubeCompletion() {
        if (destroyed || completed || !ytPlayer) return;
        var duration = typeof ytPlayer.getDuration === 'function' ? ytPlayer.getDuration() : 0;
        var current = typeof ytPlayer.getCurrentTime === 'function' ? ytPlayer.getCurrentTime() : 0;
        var state = typeof ytPlayer.getPlayerState === 'function' ? ytPlayer.getPlayerState() : -1;
        // Read the player's actual position; never unlock from a wall-clock timeout.
        if (state === 1 && duration > 0 && current >= duration - 0.12) finishYouTubeVideo();
      }

      activeCleanup = function () {
        destroyed = true;
        clearTimeout(readyTimer);
        clearTimeout(startupTimer);
        removeLoading();
        removeTap();
        if (completionTimer) clearInterval(completionTimer);
        completionTimer = null;
        if (prepared) {
          prepared.events = null;
          prepared.wrap.style.visibility = 'hidden';
          prepared.wrap.style.pointerEvents = 'none';
          try { prepared.player.pauseVideo(); } catch (_) {}
          return;
        }
        if (ytPlayer && typeof ytPlayer.destroy === 'function') {
          try {
            ytPlayer.destroy();
          } catch (_) {
            /* ignore */
          }
        }
      };

      loadYouTubeApi()
        .then(function (YT) {
          if (destroyed) return;
          readyTimer = setTimeout(useFallback, 15000);
          var playerOptions = {
            videoId: ytId,
            playerVars: {
              autoplay: 1,
              loop: 0,
              controls: 1,
              disablekb: 0,
              rel: 0,
              playsinline: 1,
              origin: root.location.origin
            },
            events: {
              onReady: function (ev) {
                if (destroyed) return;
                clearTimeout(readyTimer);
                completionTimer = setInterval(checkYouTubeCompletion, 200);
                var player = ev && ev.target ? ev.target : ytPlayer;
                if (player && typeof player.playVideo === 'function') player.playVideo();
                startupTimer = setTimeout(function () {
                  if (destroyed || completed) return;
                  if (player && typeof player.getPlayerState === 'function' && player.getPlayerState() === YT.PlayerState.PLAYING) {
                    removeLoading();
                    return;
                  }
                  showTap(player);
                }, 1500);
              },
              onAutoplayBlocked: function (ev) {
                if (destroyed || completed) return;
                clearTimeout(readyTimer);
                showTap(ev && ev.target ? ev.target : ytPlayer);
              },
              onStateChange: function (ev) {
                if (destroyed) return;
                if (ev.data === YT.PlayerState.PLAYING) {
                  clearTimeout(startupTimer);
                  removeLoading();
                  removeTap();
                }
                if (completed) {
                  if (ev.data === YT.PlayerState.PLAYING && ytPlayer) ytPlayer.pauseVideo();
                  return;
                }
                if (ev.data === YT.PlayerState.ENDED) finishYouTubeVideo();
              },
              onError: useFallback
            }
          };
          if (prepared) {
            ytPlayer = prepared.player;
            if (typeof ytPlayer.seekTo === 'function') ytPlayer.seekTo(0, true);
            prepared.events = playerOptions.events;
            if (prepared.ready) playerOptions.events.onReady({target: ytPlayer});
          } else {
            ytPlayer = new YT.Player(playerHost, playerOptions);
          }
        })
        .catch(useFallback);
      return;
    }

    if (pair && pair.video) {
      mountLocalVideo(container, pair, opts);
      return;
    }

    mountPlaceholderPlayer(container, pair, opts);
  }

  root.SeeSawVideo = {
    prepare: preparePlayers,
    mountVideo: mountVideo,
    stopActiveVideo: stopActiveVideo,
    extractYouTubeId: extractYouTubeId
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

