(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const state = SolventMaster;
  const config = SolventMasterConfig;
  const timing = config.flow;
  Object.assign(state, { view: 'landing', busy: false, demoIndex: 0, demoComplete: false, playRequested: false });
  try { state.demoComplete = localStorage.getItem(timing.demoStorageKey) === 'true'; } catch { /* Session completion remains usable when browser storage is unavailable. */ }
  const source = path => {
    const entry = SOLVENT_MASTER_ASSETS.find(item => new URL(item.url, document.baseURI).pathname === new URL(path, document.baseURI).pathname);
    if (!entry) throw new Error('Required screen artwork is not in the asset manifest.');
    const url = new URL(path, document.baseURI); url.searchParams.set('rev', entry.revision); return url.href;
  };
  async function decoded(path) {
    const image = new Image(); image.src = source(path); await image.decode(); return image.src;
  }
  async function motion(element, frames, duration) {
    if (element.animate) {
      const animation = element.animate(frames, { duration, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
      try { await animation.finished; } finally { animation.cancel(); }
    } else {
      Object.assign(element.style, frames[0]); void element.offsetWidth;
      element.style.transition = `opacity ${duration}ms, transform ${duration}ms`;
      Object.assign(element.style, frames[1]);
      await new Promise(resolve => setTimeout(resolve, duration));
      element.style.transition = ''; element.style.opacity = ''; element.style.transform = '';
    }
  }
  function status(message) { $('flow-status').textContent = message; $('flow-status').hidden = !message; }
  async function guarded(task) {
    if (!state.ready || state.busy) return;
    state.busy = true; $(state.view).inert = true; status('');
    try { await task(); }
    catch (error) { status(`Could not open this screen. ${error.message} Please try again.`); }
    finally { state.busy = false; $(state.view).inert = false; }
  }
  async function screen(view, focus) {
    const old = $(state.view), next = $(view);
    await motion(old, [{ opacity:1, transform:'translateY(0) scale(1)' }, { opacity:0, transform:'translateY(-8px) scale(.99)' }], timing.exitMs);
    old.hidden = true; old.inert = false; next.hidden = false; next.inert = true;
    state.view = view;
    await motion(next, [{ opacity:0, transform:'translateY(10px) scale(.99)' }, { opacity:1, transform:'translateY(0) scale(1)' }], timing.enterMs);
    next.inert = false; $(focus).focus({ preventScroll:true });
  }
  function demoLabels() {
    $('demo-counter').textContent = `${state.demoIndex + 1} / ${config.demoSlides.length}`;
    $('demo-previous').disabled = state.demoIndex === 0;
    $('demo-next').textContent = state.demoIndex === config.demoSlides.length - 1 ? 'Finish' : 'Next →';
    $('demo-slide').alt = `How to play Solvent Master, step ${state.demoIndex + 1}`;
  }
  async function openDemo() {
    const url = await decoded(config.demoSlides[0]);
    state.demoIndex = 0; $('demo-slide').src = url; demoLabels();
    await screen('demo', 'demo-next');
  }
  async function mixing() {
    await Promise.all(Array.from($('mixing').querySelectorAll('img')).map(async image => {
      image.src = await decoded(image.getAttribute('src').split('?')[0]);
    }));
    await screen('mixing', 'mixing-play');
  }
  async function home(){
    await state.profileReady;
    if(state.game?.profile.practiceComplete) await SolventPlay.intro(); else await mixing();
  }
  document.addEventListener('solvent-master:next', () => guarded(async () => {
    try { await state.profileReady; if (state.demoComplete) await home(); else await openDemo(); }
    catch (error) { state.nextRequested = false; throw error; }
  }));
  $('mixing-demo').addEventListener('click', () => guarded(openDemo));
  async function moveSlide(direction) {
    const index = Math.max(0, Math.min(config.demoSlides.length - 1, state.demoIndex + direction));
    if (index === state.demoIndex) return;
    const url = await decoded(config.demoSlides[index]);
    await motion($('demo-slide'), [{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${-direction * 16}px)`}], timing.slideMs);
    $('demo-slide').src = url; state.demoIndex = index; demoLabels();
    await motion($('demo-slide'), [{opacity:0,transform:`translateX(${direction * 16}px)`},{opacity:1,transform:'translateX(0)'}], timing.slideMs);
    (direction < 0 && index > 0 ? $('demo-previous') : $('demo-next')).focus({preventScroll:true});
  }
  $('demo-previous').addEventListener('click', () => guarded(() => moveSlide(-1)));
  $('demo-next').addEventListener('click', () => guarded(async () => {
    if (state.demoIndex < config.demoSlides.length - 1) return moveSlide(1);
    await home();
    state.demoComplete = true;
    try { localStorage.setItem(timing.demoStorageKey, 'true'); }
    catch { status('Demo completed for this session. Browser storage is unavailable.'); }
  }));
  globalThis.SolventFlow={guarded,screen,source,decoded,status,home};
  $('mixing-play').addEventListener('click', () => {
    if (state.busy || state.view !== 'mixing') return;
    document.dispatchEvent(new CustomEvent('solvent-master:play'));
  });
})();
