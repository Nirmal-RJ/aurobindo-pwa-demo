(() => {
  'use strict';
  const state=SolventMaster, flow=SolventFlow, cfg=SolventMasterConfig.gameplay, $=id=>document.getElementById(id);
  const colors={ACN:'#b12fff',Water:'#12d7fa',MeOH:'#73ef36'};
  const media=path=>`../solvent-master-game-assets/${path}`;
  const image=(path,classes='',alt='')=>`<img class="${classes}" src="${media(path)}" alt="${alt}" draggable="false">`;
  // Render-only crop keeps original supplied media bytes and proportions intact.
  const crops={play:[2008,783,55,152,1900,462],next:[520,169,13,18,483,136],watch:[2008,783,56,152,1898,463],start:[747,165,26,11,705,143],submit:[356,141,13,6,324,131],undo:[346,298,39,21,288,260],retry:[2156,729,91,99,1968,514],again:[2158,729,37,85,2084,515]};
  function art(path,id,label,kind,classes=''){
    const c=crops[kind];const style=c?`style="aspect-ratio:${c[4]}/${c[5]}"`:'';
    const imgStyle=c?`style="position:absolute;width:${c[0]/c[4]*100}%;left:${-c[2]/c[4]*100}%;top:${-c[3]/c[5]*100}%;max-width:none"`:'';
    return `<button id="${id}" class="game-button ${classes}" type="button" aria-label="${label}" ${style}><img src="${media(path)}" alt="" ${imgStyle}></button>`;
  }
  const host=document.createElement('div');host.id='play-screens';
  host.innerHTML=`
  <section id="lesson" class="screen" aria-label="Solvent lesson" hidden>
    ${image('page-3-b/page-3-b-bg.webp','landing-art')}${image(cfg.faces.neutral,'lesson-beaker-face')}
    <h2 id="lesson-name" class="lesson-name"></h2>
    <video id="lesson-video" controls playsinline preload="metadata"></video>
    <aside id="lesson-pro-tip"><strong>PRO TIP:</strong> Always look at the label, not the colour of the solvent.</aside>
    ${art('page-3-b/start-mixing-button.webp','lesson-next','Start Mixing','start','lesson-next')}
    <button id="lesson-back" class="text-button lesson-next" hidden>Back to results</button>
  </section>
  <section id="round" class="screen" aria-label="Mix the solvent" hidden>
    ${image('page-3-c/page-3-c-bg.webp','landing-art')}
    <div id="mode-badge" class="mode-badge"></div><output id="round-count" class="round-count"></output>
    <div id="round-timer" class="round-timer" hidden>${image('page-5/timer.webp')}<span class="timer-track" aria-hidden="true"><span id="timer-fill"></span></span><output id="timer-value" aria-label="Time remaining">01:00</output></div>
    <div id="shelves"></div>
    <div id="feedback-dimmer" aria-hidden="true"></div>
    <div id="main-vessel" class="main-vessel"><div id="main-liquid" class="main-liquid"></div>${image('page-3-c/main-beaker.webp','vessel-glass')}<img id="expression-frame" alt="" hidden><div class="streak-sparks" aria-hidden="true">&#10022; <i>&#10023;</i> &#10022;</div></div>
    <output id="mixture-total" class="mixture-total" aria-live="polite">0%</output>
    <h2 id="round-name" class="round-name"></h2>
    ${art('page-3-c/undo-button.webp','pour-undo','Undo last pour','undo','pour-undo')}
    ${art('page-3-c/submit-button.webp','mix-submit','Submit mixture','submit','mix-submit')}
    <div id="feedback" role="dialog" aria-modal="true" aria-label="Mix result" hidden>
      <div class="feedback-card"><div class="feedback-bubble"><img id="feedback-art" alt=""></div>
      <button id="feedback-next" class="game-button"><img id="feedback-button-art" alt=""></button></div>
    </div>
  </section>
  <section id="mastered" class="screen" aria-label="Five solvents mastered" hidden>
    ${image('page-3-f/page-3-f-bg.webp','landing-art')}${image('page-3-f/congratulations-pop-up.webp','mastered-title')}${image('page-3-f/5-solvents-mastered-pop-up.webp','mastered-subtitle')}
    <p class="sr-only">Now let's move to Challenge mode!</p>
    <div class="mastered-message-glow" aria-hidden="true"></div>
    <div class="mastered-beaker-glow" aria-hidden="true"></div>
    ${image(cfg.faces.happy,'mastered-face')}
    <div class="mastered-sparkles" aria-hidden="true">&#10022; <i>&#10023;</i> &#10022;</div>
    ${art('ui-common-buttons/next-button.webp','mastered-next','Next','next','bottom-button')}
  </section>
  <section id="challenge" class="screen" aria-label="Challenge introduction" hidden>
    ${image('page-4/page-4-bg.webp','landing-art')}<div class="challenge-heading">${image('page-4/ready-for-challenge-pop-up.webp','challenge-title')}</div>
    <div class="challenge-summary">${image('page-4/timer-content-panel.webp')}<strong><span>5 mixes.</span><span>60 seconds.</span></strong></div>
    <p class="sr-only">Complete 3 times in a row and win a star</p>${image('page-4/star.webp','challenge-star')}
    ${art('ui-common-buttons/play-button.webp','challenge-play','Play challenge','play','bottom-button')}
  </section>
  <section id="results" class="screen" aria-label="Round results" hidden>
    ${image('page-6/page-6-bg.webp','landing-art')}${image(cfg.faces.happy,'results-beaker-face')}${image('page-6/results-pop-up.webp','results-title')}
    <div id="result-rows"></div>${art('ui-common-buttons/next-button.webp','results-next','Next','next','results-next')}
  </section>
  <section id="outcome" class="screen" aria-label="Challenge outcome" hidden>
    <img id="outcome-bg" class="landing-art" alt=""><img id="outcome-title" class="outcome-title" alt="">
    <p id="outcome-message" class="outcome-message"></p><output id="streak-count" class="streak-count"></output>
    <div id="streak-beakers" class="streak-beakers"></div><img id="completion-star" class="completion-star" src="${media('page-4/star.webp')}" alt="Star earned" hidden>
    <div class="completion-rays" aria-hidden="true">${Array.from({length:12},(_,i)=>`<span style="--ray:${i}"></span>`).join('')}</div>
    <div class="completion-message-focus" aria-hidden="true"></div>
    <div class="completion-water" aria-hidden="true"><span></span></div>${image('page-3-c/main-beaker.webp','completion-beaker')}${image(cfg.faces.happy,'completion-face')}
    <button id="outcome-next" class="game-button bottom-button"><img id="outcome-button" alt=""></button>
  </section>`;
  $('game').insertBefore(host,$('flow-status'));
  let game,lessonReturn=false,priorVideoPlaying=false;
  state.profileReady=(async()=>{game=new SolventCore.Game(cfg,await SolventStore.load());state.game=game;})();
  state.profileReady.catch(error=>flow.status(error.message));
  async function save(){
    while(true){try{await SolventStore.save(game.profile);flow.status('');return;}
      catch(error){flow.status('Progress could not be saved. Free browser storage, then retry.');
        await new Promise(resolve=>{const button=document.createElement('button');button.className='text-button';button.textContent='Retry saving';button.addEventListener('click',()=>{button.remove();resolve();},{once:true});$('flow-status').append(' ',button);button.focus();});}
    }
  }
  async function show(view,focus){
    const paths=[...new Set(Array.from($(view).querySelectorAll('img[src]')).map(img=>img.getAttribute('src')))];
    await Promise.all(paths.map(path=>flow.decoded(path)));
    for(const img of $(view).querySelectorAll('img[src]'))img.src=flow.source(img.getAttribute('src'));
    await flow.screen(view,focus);
  }
  async function intro(){await state.profileReady;await show('challenge','challenge-play');}
  async function lesson(recipe,fromResults=false){
    lessonReturn=fromResults;$('lesson-name').textContent=recipe.name;
    $('lesson-next').hidden=fromResults;$('lesson-back').hidden=!fromResults;
    const video=$('lesson-video');video.pause();video.src=flow.source(media(`lesson-videos/${recipe.id}.webm`));video.load();
    await show('lesson',fromResults?'lesson-back':'lesson-next');
    video.play().catch(()=>{});
  }
  const shelfSizing=globalThis.ResizeObserver?new ResizeObserver(entries=>{
    for(const entry of entries){const frame=entry.target.querySelector('.shelf-art-frame');if(!frame)continue;const width=Math.min(entry.contentRect.width,entry.contentRect.height*1010/1060);frame.style.width=`${width}px`;frame.style.height=`${width*1060/1010}px`;}
  }):null;
  function renderShelves(){
    shelfSizing?.disconnect();
    $('shelves').innerHTML=SolventCore.chemicals.map((chemical,column)=>{
      const label={ACN:'acetonitrile',Water:'water',MeOH:'methanol'}[chemical];
      return `<section class="rack rack-${column}" aria-label="${chemical} beakers">${image(`page-3-c/${label}-panel.webp`,'rack-label')}
      <div class="rack-beakers">${game.shelves[chemical].map((value,index)=>`<button class="shelf-beaker" data-chemical="${chemical}" data-index="${index}" aria-label="${chemical} ${value}%" style="--solvent:${colors[chemical]}"><span class="shelf-art-frame"><span class="shelf-art"><span class="shelf-fluid" aria-hidden="true"><span class="small-liquid" style="height:${value*.71}%"></span></span>${image('page-3-c/beaker-on-shelf.webp')}<span class="beaker-value">${value}%</span></span></span></button>`).join('')}</div></section>`;
    }).join('');
    $('shelves').querySelectorAll('button').forEach(button=>{shelfSizing?.observe(button);button.addEventListener('click',()=>flow.guarded(()=>pour(button)));});
  }
  function liquidView(pours=game.pours,lastFraction=1){
    const well=$('main-liquid');let total=0;
    while(well.children.length>pours.length)well.lastElementChild.remove();
    pours.forEach((pour,index)=>{
      let layer=well.children[index];if(!layer){layer=document.createElement('span');layer.className='solvent-layer';well.append(layer);}
      const amount=pour.value*(index===pours.length-1?lastFraction:1);
      layer.style.bottom=`${total}%`;layer.style.height=`${amount}%`;layer.style.setProperty('--liquid-color',colors[pour.chemical]);total+=amount;
    });
    well.style.setProperty('--surface',`${total}%`);well.style.setProperty('--surface-color',colors[pours.at(-1)?.chemical]||'transparent');
    well.classList.toggle('has-liquid',total>.05);
    $('mixture-total').textContent=`${Math.round(total)}%`;
    return total;
  }
  function refresh(){
    liquidView();
    $('pour-undo').disabled=!game.pours.length;
    for(const button of $('shelves').querySelectorAll('button')){const used=game.pours.some(p=>p.chemical===button.dataset.chemical&&p.index===Number(button.dataset.index));button.disabled=used||game.total+Number(game.shelves[button.dataset.chemical][button.dataset.index])>100;button.classList.toggle('used',used);}
  }
  async function question(){
    $('feedback').hidden=true;$('round').classList.remove('showing-feedback');
    $('expression-frame').src=await flow.decoded(media(cfg.faces.neutral));$('expression-frame').hidden=false;
    $('round-name').textContent=game.recipe.name;
    $('mode-badge').textContent=game.mode==='practice'?'PRACTICE MODE':'CHALLENGE MODE';
    $('round-count').hidden=game.mode==='challenge';
    $('round-count').textContent=game.mode==='practice'?`Practice ${game.index+1}/5`:'';
    $('round').classList.toggle('challenge-round',game.mode==='challenge');$('round-timer').hidden=game.mode!=='challenge';updateTimer();renderShelves();refresh();
    if(state.view!=='round')await show('round','mix-submit');
    else {const animation=$('round-name').animate?.([{opacity:0,transform:'translateX(30px)'},{opacity:1,transform:'translateX(0)'}],{duration:380,easing:'ease-out'});if(animation)await animation.finished;}
    lastFrame=performance.now();
  }
  async function animate(element,frames,duration){
    if(element.animate){const animation=element.animate(frames,{duration,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});if(document.hidden||state.orientationBlocked||state.fullscreenHelpOpen){paused.add(animation);animation.pause();}await animation.finished;paused.delete(animation);animation.cancel();}
    else{Object.assign(element.style,frames[0]);void element.offsetWidth;element.style.transition=`all ${duration}ms ease`;Object.assign(element.style,frames.at(-1));await new Promise(resolve=>setTimeout(resolve,duration));element.style.transition='';}
  }
  async function fluidFrames(duration,update){
    let elapsed=0,previous=performance.now();
    await new Promise((resolve,reject)=>{
      function step(now){
        const delta=now-previous;previous=now;
        if(!document.hidden&&!state.orientationBlocked&&!state.fullscreenHelpOpen)elapsed=Math.min(duration,elapsed+delta);
        try{update(elapsed/duration);}catch(error){reject(error);return;}
        if(elapsed>=duration)resolve();else requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  async function pour(button){
    const before={...game.mix},totalBefore=game.total,item=game.pour(button.dataset.chemical,Number(button.dataset.index));if(!item)return;
    const stage=$('game').getBoundingClientRect(),box=button.getBoundingClientRect(),clone=button.cloneNode(true);
    clone.removeAttribute('id');clone.className='flying-beaker';clone.disabled=true;clone.setAttribute('aria-hidden','true');
    const left=(box.left-stage.left)/stage.width*100,top=(box.top-stage.top)/stage.height*100;
    Object.assign(clone.style,{left:`${left}%`,top:`${top}%`,width:`${box.width/stage.width*100}%`,height:`${box.height/stage.height*100}%`});
    $('game').append(clone);button.style.visibility='hidden';
    const stream=document.createElement('div');stream.className='pour-stream';stream.style.setProperty('--liquid-color',colors[item.chemical]);stream.hidden=true;$('game').append(stream);
    const vessel=$('main-vessel').getBoundingClientRect();
    const mouthX=vessel.left-stage.left+vessel.width*.52,mouthY=vessel.top-stage.top+vessel.height*.10;
    const radians=65*Math.PI/180;
    // The source artwork's right lip, rotated around the same pivot as the flying beaker.
    const artBounds=button.querySelector('.shelf-art').getBoundingClientRect();
    const lipDX=artBounds.left-box.left+artBounds.width*.85-box.width*.75;
    const lipDY=artBounds.top-box.top+artBounds.height*.15-box.height*.50;
    const lipX=box.width*.75+lipDX*Math.cos(radians)-lipDY*Math.sin(radians);
    const lipY=box.height*.50+lipDX*Math.sin(radians)+lipDY*Math.cos(radians);
    const targetLeft=(mouthX-lipX)/stage.width*100,targetTop=(mouthY-lipY)/stage.height*100;
    const well=$('main-liquid');
    try{
      await animate(clone,[{left:`${left}%`,top:`${top}%`,transform:'rotate(0deg)'},{left:`${targetLeft}%`,top:`${targetTop}%`,transform:'rotate(0deg)'}],cfg.pourMs*.3);
      clone.style.left=`${targetLeft}%`;clone.style.top=`${targetTop}%`;
      await animate(clone,[{transform:'rotate(0deg)'},{transform:'rotate(65deg)'}],cfg.pourMs*.15);clone.style.transform='rotate(65deg)';
      stream.hidden=false;SolventAudio.liquid();well.classList.add('receiving');
      const sourceLiquid=clone.querySelector('.small-liquid'),sourceHeight=parseFloat(sourceLiquid.style.height);
      liquidView(game.pours,0);
      await fluidFrames(cfg.pourMs*.35,progress=>{
        const filling=Math.max(0,Math.min(1,(progress-.12)/.88));
        const total=liquidView(game.pours,filling);
        sourceLiquid.style.height=`${sourceHeight*(1-progress)}%`;
        sourceLiquid.style.transform=`skewY(${-Math.sin(progress*Math.PI)*18}deg)`;
        const liveStage=$('game').getBoundingClientRect(),liveVessel=$('main-vessel').getBoundingClientRect(),liveWell=well.getBoundingClientRect();
        const x=liveVessel.left-liveStage.left+liveVessel.width*.52,y=liveVessel.top-liveStage.top+liveVessel.height*.10;
        const surface=liveWell.bottom-liveStage.top-liveWell.height*total/100;
        Object.assign(stream.style,{left:`${x}px`,top:`${y}px`,height:`${Math.max(1,surface-y)}px`,width:`${Math.max(2,liveVessel.width*.025)}px`,opacity:String(Math.min(1,progress/.12,(1-progress)/.1))});
        well.style.setProperty('--impact',`${Math.sin(progress*Math.PI)*1.8}px`);
      });
      stream.hidden=true;well.classList.remove('receiving');SolventAudio.liquid(true);
      await Promise.all([
        animate(clone,[{left:`${targetLeft}%`,top:`${targetTop}%`,transform:'rotate(65deg)'},{left:`${left}%`,top:`${top}%`,transform:'rotate(0deg)'}],cfg.pourMs*.2),
        fluidFrames(cfg.pourMs*.2,p=>well.style.setProperty('--impact',`${Math.sin(p*Math.PI*3)*(1-p)*1.8}px`))
      ]);
    }catch(error){game.mix=before;game.pours.pop();throw error;}
    finally{SolventAudio.liquid(true);clone.remove();stream.remove();button.style.visibility='';well.classList.remove('receiving');well.style.setProperty('--impact','0px');refresh();lastFrame=performance.now();}
  }
  async function undo(){const previous=[...game.pours],item=game.undo();if(!item)return;await fluidFrames(550,p=>liquidView(previous,1-p));refresh();lastFrame=performance.now();}
  async function submit(){const correct=game.submit();if(correct===null)return;
    $('feedback-art').src=await flow.decoded(media(correct?'page-3-d/perfect-mix-pop-up.webp':game.mode==='practice'?'page-3-e/wrong-mix-pop-up.webp':'page-5/wrong-pop-up.webp'));
    const retry=!correct&&game.mode==='practice',kind=retry?'watch':'next',crop=crops[kind];
    $('feedback').classList.toggle('wrong',!correct);$('feedback').classList.toggle('retry',retry);
    $('feedback-art').alt=correct?'Perfect mix! 100%':retry?'Wrong mix! Watch video and try again':'Wrong mix!';
    $('feedback-next').setAttribute('aria-label',retry?'Watch Video':'Next');
    $('feedback-next').style.aspectRatio=`${crop[4]}/${crop[5]}`;
    $('feedback-button-art').src=await flow.decoded(media(`ui-common-buttons/${retry?'watch-video':'next'}-button.webp`));
    Object.assign($('feedback-button-art').style,{position:'absolute',width:`${crop[0]/crop[4]*100}%`,left:`${-crop[2]/crop[4]*100}%`,top:`${-crop[3]/crop[5]*100}%`,maxWidth:'none'});
    $('expression-frame').src=await flow.decoded(media(correct?cfg.faces.happy:cfg.faces.sad));
    $('feedback').hidden=false;$('round').classList.add('showing-feedback');SolventAudio.cue(correct?'correct':'wrong');
    $('feedback-next').disabled=true;
    const vessel=$('main-vessel');if(correct)vessel.classList.add('celebrating');
    try{await Promise.all([
      animate($('feedback-dimmer'),[{opacity:0},{opacity:1}],cfg.feedbackDimMs),
      animate($('feedback').firstElementChild,[{opacity:0,transform:'translateY(20px) scale(.9)'},{opacity:1,transform:'translateY(0) scale(1)'}],cfg.feedbackMs),
      correct?animate(vessel,[{transform:'translateY(0) rotate(0deg)'},{transform:'translateY(-18%) rotate(-7deg)',offset:.2},{transform:'translateY(0) rotate(4deg)',offset:.4},{transform:'translateY(-23%) rotate(7deg)',offset:.6},{transform:'translateY(0) rotate(-3deg)',offset:.8},{transform:'translateY(0) rotate(0deg)'}],cfg.correctCelebrationMs):Promise.resolve()
    ]);}finally{vessel.classList.remove('celebrating');}
    $('feedback-next').disabled=false;
    $('feedback-next').focus();
  }
  async function feedbackNext(){
    if(game.phase!=='feedback')return;
    const wrong=game.mode==='practice'&&!game.lastCorrect;
    game.next();$('feedback').hidden=true;
    if(wrong)return lesson(game.recipe);
    if(game.phase==='mastered'){await save();return mastery();}
    if(game.phase==='results'){await save();return results();}
    if(game.mode==='practice')return lesson(game.recipe);
    await question();
  }
  async function mastery(){
    const title=$('mastered').querySelector('.mastered-title'),badge=$('mastered').querySelector('.mastered-subtitle'),face=$('mastered').querySelector('.mastered-face');
    const next=$('mastered-next');next.disabled=true;
    for(const element of [title,badge,face,next])element.style.opacity='0';
    $('mastered').classList.remove('mastery-ready');
    await show('mastered','mastered-next');SolventAudio.cue('win');
    for(const [element,duration] of [[title,700],[badge,650],[face,500]]){
      await animate(element,[{opacity:0,transform:'translateY(18px) scale(.9)'},{opacity:1,transform:'translateY(0) scale(1)'}],duration);element.style.opacity='1';
    }
    $('mastered').classList.add('mastery-ready');
    await animate(next,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],420);next.style.opacity='1';next.disabled=false;next.focus();
  }
  async function results(){
    const perfect=game.results.length===5&&game.results.every(row=>row.correct);
    $('results').querySelector('.results-beaker-face').src=media(perfect?cfg.faces.happy:cfg.faces.sad);
    $('result-rows').innerHTML=game.results.map((row,index)=>`<div class="result-row">${image(`page-6/${row.correct?'correct':'wrong'}.webp`,'result-mark',row.correct?'Correct':'Wrong')}<span>${row.name}</span>${art('ui-common-buttons/watch-video-button.webp',`result-video-${index}`,'Watch video: '+row.name,'watch')}</div>`).join('');
    game.results.forEach((row,index)=>$(`result-video-${index}`).addEventListener('click',()=>flow.guarded(()=>lesson(cfg.recipes.find(r=>r.id===row.recipeId),true))));
    await show('results','results-next');
  }
  async function outcome(){
    const count=game.profile.streak,won=count===3,lost=count===0;
    $('outcome-bg').src=media(`page-${won?9:lost?8:7}/page-${won?9:lost?8:7}-bg.webp`);
    $('outcome-title').src=media(won?'page-3-f/congratulations-pop-up.webp':lost?'page-8/streak-lost-pop-up.webp':'page-7/perfect-round-pop-up.webp');
    $('outcome-title').alt=won?'Congratulations!':lost?'Streak Lost!':'Perfect Round!';
    $('outcome-message').textContent=won?'3 perfect rounds completed':lost?'Learn and build it again':`${3-count} more perfect ${count===2?'round':'rounds'} to go`;
    $('outcome-message').classList.toggle('sr-only',won||lost);
    $('outcome').classList.toggle('completed',won);
    $('outcome').classList.toggle('perfect-streak',!won&&!lost);
    $('outcome-next').disabled=true;
    $('streak-count').textContent=`Streak: ${count}/3`;$('streak-count').hidden=won;
    $('completion-star').hidden=!won;$('streak-beakers').hidden=won;
    $('streak-beakers').innerHTML=image('page-7/beaker-connecting-pole.webp','streak-pole pole-one')+image('page-7/beaker-connecting-pole.webp','streak-pole pole-two')+[1,2,3].map(n=>`<div class="streak-beaker ${n<=count?'earned':''}" aria-label="Streak ${n}${n<=count?' earned':''}">${image(lost?'page-8/broken-beaker.webp':'page-3-c/main-beaker.webp')}${lost?image(cfg.faces.sad,'broken-beaker-face'):''}</div>`).join('');
    if(!won&&!lost){
      $('streak-beakers').innerHTML=[1,2].map(n=>`<div class="streak-link link-${n}" style="--progress:${n<count?1:0}"><span></span></div>`).join('')+[1,2,3].map(n=>`<div class="streak-beaker ${n>count?'locked':n<count?'earned':''}" data-step="${n}" aria-label="Round ${n}${n<count?' complete':n>count?' locked':''}"><div class="streak-body"><div class="streak-water"><span style="height:${n<count?100:0}%"></span></div>${image('page-3-c/main-beaker.webp','streak-glass')}${image(n<count?cfg.faces.happy:cfg.faces.neutral,'streak-face')}<div class="streak-sparks" aria-hidden="true">? <i>?</i> ?</div></div></div>`).join('');
    }
    $('outcome-button').src=media(won?'page-9/play-again-button.webp':lost?'page-8/retry-button.webp':'page-7/next-challenge-button.webp');
    $('outcome-next').setAttribute('aria-label',won?'Play Again':lost?'Retry':'Next Challenge');
    // Hold the entrance start state through image decoding and page transition.
    $('streak-beakers').style.opacity=won?'':'0';
    $('outcome').classList.remove('victory-ready');
    const victoryElements=[$('outcome-title'),$('completion-star'),$('outcome').querySelector('.completion-rays'),$('outcome').querySelector('.completion-beaker'),$('outcome').querySelector('.completion-face'),$('outcome-next')];
    for(const element of victoryElements)element.style.opacity=won?'0':'';
    $('outcome').querySelector('.completion-water').style.opacity=won?'0':'';
    await show('outcome','outcome-next');if(lost)SolventAudio.cue('shatter');
    if(!won){try{await animate($('streak-beakers'),[{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'translateY(0)'}],900);}finally{$('streak-beakers').style.opacity='';}}
    else await celebrateVictory(victoryElements);
    if(!won&&!lost)await celebrateStreak(count);
    $('outcome-next').disabled=false;$('outcome-next').focus();
  }
  async function celebrateVictory(elements){
    const [title,star,rays,beaker,face,button]=elements;
    const water=$('outcome').querySelector('.completion-water');water.style.opacity='0';
    await animate(title,[{opacity:0,transform:'translateY(18px) scale(.85)'},{opacity:1,transform:'translateY(0) scale(1)'}],700);title.style.opacity='1';
    await Promise.all([
      animate(star,[{opacity:0,transform:'scale(.3) rotate(-80deg)'},{opacity:1,transform:'scale(1) rotate(0deg)'}],1100).then(()=>star.style.opacity='1'),
      animate(rays,[{opacity:0},{opacity:1}],1100).then(()=>rays.style.opacity='1'),
      animate(beaker,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],900).then(()=>beaker.style.opacity='1'),
      animate(water,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],900).then(()=>water.style.opacity='1'),
      animate(face,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],900).then(()=>face.style.opacity='1')
    ]);
    $('outcome').classList.add('victory-ready');
    await animate(button,[{opacity:0,transform:'translateY(15px) scale(.92)'},{opacity:1,transform:'translateY(0) scale(1)'}],500);button.style.opacity='1';
  }
  async function celebrateStreak(count){
    const timing=cfg.streakAnimation,current=$('streak-beakers').querySelector(`[data-step="${count}"]`),next=current.nextElementSibling;
    const water=current.querySelector('.streak-water span'),body=current.querySelector('.streak-body');
    $('outcome').dataset.stage='fill';SolventAudio.liquid();
    try{await fluidFrames(timing.fillMs,p=>water.style.height=`${p*100}%`);}finally{SolventAudio.liquid(true);}
    current.querySelector('.streak-face').src=flow.source(media(cfg.faces.happy));current.classList.add('earned','celebrating');
    $('outcome').dataset.stage='dance';SolventAudio.cue('streak');
    await animate(body,[{transform:'translateY(0) rotate(0deg)'},{transform:'translateY(-18%) rotate(-9deg)',offset:.2},{transform:'translateY(0) rotate(5deg)',offset:.4},{transform:'translateY(-24%) rotate(8deg)',offset:.6},{transform:'translateY(0) rotate(-4deg)',offset:.8},{transform:'translateY(0) rotate(0deg)'}],timing.danceMs);
    current.classList.remove('celebrating');$('outcome').dataset.stage='pipe';
    const pipe=$('streak-beakers').querySelector(`.link-${count}`);
    await fluidFrames(timing.pipeMs,p=>pipe.style.setProperty('--progress',p));
    $('outcome').dataset.stage='activate';next.classList.remove('locked');next.classList.add('next-ready');next.setAttribute('aria-label',`Round ${count+1} ready`);SolventAudio.cue('streak');
    await animate(next,[{opacity:.45,filter:'grayscale(1) brightness(.6)',transform:'scale(.95)'},{opacity:1,filter:'grayscale(0) brightness(1.7)',transform:'scale(1.12)',offset:.6},{opacity:1,filter:'grayscale(0) brightness(1)',transform:'scale(1)'}],timing.activateMs);
    $('outcome').dataset.stage='ready';
  }
  function on(id,task){$(id).addEventListener('click',()=>flow.guarded(task));}
  document.addEventListener('solvent-master:play',()=>flow.guarded(async()=>{await state.profileReady;game.start('practice');await lesson(game.recipe);}));
  on('lesson-next',async()=>{$('lesson-video').pause();await question();});
  on('lesson-back',async()=>{$('lesson-video').pause();await results();});
  on('pour-undo',undo);on('mix-submit',submit);on('feedback-next',feedbackNext);
  on('mastered-next',intro);
  on('challenge-play',async()=>{game.start('challenge');await question();});
  on('results-next',outcome);
  on('outcome-next',async()=>{if(game.profile.streak===3){game.profile.streak=0;await save();}game.start('challenge');await question();});
  // Trap feedback focus; backgrounding freezes native animations and video as well as the clock.
  $('feedback').addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();$('feedback-next').focus();}});
  const paused=new Set();
  let presentationPaused=false;
  function syncPresentationPause(){
    const shouldPause=document.hidden||state.orientationBlocked||state.fullscreenHelpOpen;if(shouldPause===presentationPaused)return;presentationPaused=shouldPause;
    const video=$('lesson-video');if(shouldPause){priorVideoPlaying=!video.paused;video.pause();for(const a of $('game').getAnimations({subtree:true}))if(a.playState==='running'){paused.add(a);a.pause();}}
    else{for(const a of paused)if(a.playState==='paused')a.play();paused.clear();if(priorVideoPlaying&&state.view==='lesson')video.play().catch(()=>{});lastFrame=performance.now();}
  }
  document.addEventListener('visibilitychange',syncPresentationPause);
  document.addEventListener('solvent-master:orientation',syncPresentationPause);
  function updateTimer(){
    const seconds=Math.max(0,Math.ceil(game.remaining));
    $('timer-value').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    $('round-timer').classList.toggle('timer-urgent',game.mode==='challenge'&&game.remaining>0&&game.remaining<=10);
    $('timer-fill').style.transform=`scaleX(${Math.max(0,Math.min(1,game.remaining/cfg.seconds))})`;
  }
  let lastFrame=performance.now(),lastTick=-1;
  function frame(now){const delta=Math.max(0,(now-lastFrame)/1000);lastFrame=now;
    SolventAudio.frame(state.view);
    if(game&&state.view==='round'&&!state.busy&&!document.hidden&&!state.orientationBlocked&&!state.fullscreenHelpOpen){
      if(game.tick(delta))flow.guarded(async()=>{await save();await results();});
      updateTimer();
      if(game.mode==='challenge'&&game.phase==='mix'&&game.remaining<=10&&lastTick!==Math.ceil(game.remaining)){lastTick=Math.ceil(game.remaining);SolventAudio.cue('timer');}

    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  globalThis.SolventPlay={intro,game:()=>game};
})();

