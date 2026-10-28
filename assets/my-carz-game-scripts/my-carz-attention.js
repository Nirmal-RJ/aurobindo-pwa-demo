/* Presentation-only attention cues. Timers/steering/scoring remain in the controller/core. */
(function (root) {
  root.CarzAttention = {
    pacing: Object.freeze({ carHoldSeconds: 1.5, questionHoldSeconds: .5, hudHoldSeconds: .35 }),
    create({ race, car, question, diamonds, tunnels, animate, wait }) {
      let token = 0, tunnelCued = false, questionTone = -1;
      const colors = root.CarzConfig.questionPanels;
      const stage = value => { race.dataset.introStage = value; };
      function fitQuestion() {
        const text=question.querySelector('h2');
        if (!text.clientWidth || !text.clientHeight) return;
        text.style.fontSize='';
        let size=parseFloat(getComputedStyle(text).fontSize);
        // Fit the full prompt into the artwork's clear area without truncation.
        while ((text.scrollHeight>text.clientHeight+1 || text.scrollWidth>text.clientWidth+1) && size>8) {
          size-=.5; text.style.fontSize=`${size}px`;
        }
      }
      if (root.ResizeObserver) new ResizeObserver(fitQuestion).observe(question);
      function cue(element, name) { element.classList.remove(name); void element.offsetWidth; element.classList.add(name); }
      return {
        prepare() { token++; delete race.dataset.attention; delete race.dataset.attentionSoft; tunnelCued = false; stage('countdown'); return token; },
        cancel() { token++; delete race.dataset.attention; delete race.dataset.attentionSoft; },
        current(value) { return value === token; },
        async car(value, upgraded) {
          if (value !== token) return false;
          stage('car');
          car.classList.add('quick-entry');
          if (upgraded) car.classList.add('upgrade-entry');
          await wait(upgraded ? .8 : .7);
          car.classList.remove('quick-entry', 'upgrade-entry');
          if (value !== token) return false;
          await wait(root.CarzAttention.pacing.carHoldSeconds);
          return value === token;
        },
        question(first, soft = false) {
          race.dataset.attentionSoft = String(soft);
          tunnelCued = false; race.dataset.attention='question'; if (first) stage('question');
          questionTone = (questionTone + 1) % colors.length;
          const [name, background, text, outline] = colors[questionTone];
          question.style.setProperty('--question-color', background);
          question.style.setProperty('--question-text', text);
          question.style.setProperty('--question-glow', outline);
          question.dataset.tone = name;
          fitQuestion();
          cue(question, 'question-attention');
        },
        ready(value) { if(value===token) {delete race.dataset.attention;stage('drive');} },
        async questionIn() {
          const current=token;
          question.style.opacity='1';question.style.transform='';
          await animate(question,[{opacity:0,transform:'translateX(112%)'},{opacity:1,transform:'translateX(0)'}],380);
          if(current===token && race.dataset.introStage==='drive' && race.dataset.attention==='question') delete race.dataset.attention;
        },
        async questionOut() {
          const current=token;
          await animate(question,[{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(-112%)'}],260);
          if (current===token) {question.style.transform='translateX(-112%)';question.style.opacity='0';}
        },
        async hud(value) {
          if (value !== token) return false;
          stage('diamonds'); race.dataset.attention='diamonds';
          await animate(diamonds, [{ opacity: 0, transform: 'translateY(-7px) scale(.96)', filter: 'brightness(1.6)' }, { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'brightness(1)' }], 450);
          if (value !== token) return false;
          await wait(root.CarzAttention.pacing.hudHoldSeconds);
          if (value !== token) return false;
          return true;
        },
        approach(progress) {
          // The physical approach coordinate keeps this 480ms cue ahead of late guidance,
          // including at the fastest level. Never marks an answer as correct.
          if (!tunnelCued && progress >= .3) { tunnelCued = true; cue(tunnels, 'tunnel-attention'); }
        }
      };
    }
  };
})(globalThis);
