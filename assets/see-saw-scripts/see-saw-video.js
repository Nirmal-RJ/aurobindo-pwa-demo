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
      var timeout = setTimeout(function () {
        reject(new Error('YouTube API timeout'));
      }, 6500);
      var prev = root.onYouTubeIframeAPIReady;
      root.onYouTubeIframeAPIReady = function () {
        clearTimeout(timeout);
        if (typeof prev === 'function') prev();
        resolve(root.YT);
      };
      var script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = function () {
        clearTimeout(timeout);
        reject(new Error('YouTube script error'));
      };
      document.head.appendChild(script);
    });
    return ytApiPromise;
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
    video.src = pair.video;
    video.controls = Boolean(opts.allowControls);
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.autoplay = true;

    var completed = false;
    function markComplete() {
      if (completed) return;
      completed = true;
      if (typeof opts.onComplete === 'function') {
        opts.onComplete();
      }
    }

    video.addEventListener('ended', markComplete);
    video.addEventListener('error', function () {
      mountPlaceholderPlayer(container, pair, opts);
    });

    container.appendChild(video);
    var p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () {
        video.controls = true;
      });
    }

    activeCleanup = function () {
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
      container.innerHTML = '';
      var playerHost = document.createElement('div');
      playerHost.className = 'ss-yt-host';
      container.appendChild(playerHost);
      var destroyed = false;
      var ytPlayer = null;
      var completed = false;
      var completionTimer = null;

      function finishYouTubeVideo() {
        if (destroyed || completed) return;
        completed = true;
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
        if (completionTimer) clearInterval(completionTimer);
        completionTimer = null;
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
          ytPlayer = new YT.Player(playerHost, {
            videoId: ytId,
            playerVars: {
              autoplay: 1,
              loop: 0,
              controls: 1,
              disablekb: 0,
              rel: 0,
              playsinline: 1
            },
            events: {
              onReady: function () {
                if (destroyed) return;
                completionTimer = setInterval(checkYouTubeCompletion, 200);
              },
              onStateChange: function (ev) {
                if (destroyed) return;
                if (completed) {
                  if (ev.data === YT.PlayerState.PLAYING && ytPlayer) ytPlayer.pauseVideo();
                  return;
                }
                if (ev.data === YT.PlayerState.ENDED) finishYouTubeVideo();
              },
              onError: function () {
                if (destroyed) return;
                stopActiveVideo();
                if (pair && pair.video) {
                  mountLocalVideo(container, pair, opts);
                } else {
                  mountPlaceholderPlayer(container, pair, opts);
                }
              }
            }
          });
        })
        .catch(function () {
          if (destroyed) return;
          if (pair && pair.video) {
            mountLocalVideo(container, pair, opts);
          } else {
            mountPlaceholderPlayer(container, pair, opts);
          }
        });
      return;
    }

    if (pair && pair.video) {
      mountLocalVideo(container, pair, opts);
      return;
    }

    mountPlaceholderPlayer(container, pair, opts);
  }

  root.SeeSawVideo = {
    mountVideo: mountVideo,
    stopActiveVideo: stopActiveVideo,
    extractYouTubeId: extractYouTubeId
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

