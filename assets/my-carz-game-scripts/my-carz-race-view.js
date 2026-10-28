/* Race presentation only: normalized geometry, continuous scenery and approach.
 * Rules, checkpoints, answer timing and sound remain in the controller/core. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CarzRaceView = api;
})(globalThis, () => {
  'use strict';
  const motion = Object.freeze({ arrowAt: .65, passSeconds: .75, returnSeconds: .55, steerSeconds: .18, commitSeconds: .20, visualSpeed: 1.75 });
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const worldProgress = progress => 1 - (1 - clamp(progress)) * motion.visualSpeed;
  function geometry(phase, progress = 0, feedbackSeconds = 0, correct = false) {
    return { y: phase === 'recovery' ? .35 * (1 - ease(feedbackSeconds / 1.1)) : 0,
      opacity: 1,
      arrow: phase === 'travel' && worldProgress(progress) >= motion.arrowAt };
  }
  class Steering {
    constructor() { this.reset(); }
    reset() { this.position = this.from = .25; this.lane = 0; this.time = motion.steerSeconds; this.tilt = 0; this.locked = false; }
    request(lane, remaining = Infinity) {
      if (this.locked || remaining <= motion.commitSeconds || ![0, 1].includes(lane)) return false;
      if (lane !== this.lane) { this.from = this.position; this.lane = lane; this.time = 0; }
      return true;
    }
    advance(dt) {
      this.time = Math.min(motion.steerSeconds, this.time + dt);
      const p = this.time / motion.steerSeconds, target = .25 + this.lane * .5;
      this.position = this.from + (target - this.from) * ease(p);
      this.tilt = Math.sin(p * Math.PI) * (target - this.from) * 20;
    }
    commit() { this.locked = true; return this.position < .5 ? 0 : 1; }
  }
  const gatePosition = (progress, nose = .7, size = .225) => -size + worldProgress(progress) * (nose + size / 2);
  function create({ app, track, road, car, arrow, tunnels }) {
    const ctx = road.getContext('2d');
    const world=track.parentElement;
    const carEffects=track.querySelector('#car-effects');
    let crashDrift=0;
    let width = 1, height = 1, distance = 0, feedbackSeconds = 0, lastPhase = '', correct = false, shade;
    let gateY = null, lastProgress = 0, nose = .7, inkTop = 0, inkBottom = 1, snapshot = {};
    let visualTilt=0,leanVelocity=0,lastWheels=null;
    const tireMarks=[];
    function resize() {
      // Layout dimensions stay stable during screen scale/translate animations.
      // A hidden track must not destroy the prepared canvas with a 1px resize.
      if (!track.clientWidth || !track.clientHeight) return;
      width = track.clientWidth; height = track.clientHeight;
      const scale = Math.min(globalThis.devicePixelRatio || 1, 2);
      const pixelsWide = Math.round(width * scale), pixelsHigh = Math.round(height * scale);
      if (road.width !== pixelsWide || road.height !== pixelsHigh) { road.width = pixelsWide; road.height = pixelsHigh; }
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      shade = ctx.createLinearGradient(0, 0, width, height);
      shade.addColorStop(0, '#294356'); shade.addColorStop(1, '#344f62');
      const rendered = Math.min(car.clientHeight, car.clientWidth * (car.naturalHeight / car.naturalWidth || 1));
      nose = (car.offsetTop + (car.clientHeight - rendered) / 2 + rendered * inkTop) / height;
    }
    async function calibrate() {
      await car.decode();
      const scan = document.createElement('canvas'); scan.width = 100; scan.height = Math.round(100 * car.naturalHeight / car.naturalWidth);
      const brush = scan.getContext('2d', { willReadFrequently: true }); brush.drawImage(car, 0, 0, scan.width, scan.height);
      const pixels = brush.getImageData(0, 0, scan.width, scan.height).data;
      inkTop = 0;
      outer: for (let y = 0; y < scan.height; y++) for (let x = 0; x < scan.width; x++) if (pixels[(y * scan.width + x) * 4 + 3] > 80) { inkTop = y / scan.height; break outer; }
      bottom: for (let y = scan.height - 1; y >= 0; y--) for (let x = 0; x < scan.width; x++) if (pixels[(y * scan.width + x) * 4 + 3] > 80) { inkBottom = (y + 1) / scan.height; break bottom; }
      resize();
    }
    function approach() { lastProgress = 0; gateY = gatePosition(0, nose); tunnels.hidden = false; }
    function reset() { gateY = null; tunnels.hidden = true; tireMarks.length=0;lastWheels=null;visualTilt=leanVelocity=crashDrift=0;world.style.transform=''; }
    function outcome(value) { correct = value; feedbackSeconds = 0;crashDrift=0; }
    function render({ phase, progress, dt, moving, travelSeconds, position, tilt, selected }) {
      if (phase !== lastPhase) { if (phase === 'feedback' || phase === 'recovery') feedbackSeconds = 0; lastPhase = phase; }
      if (phase === 'feedback' || phase === 'recovery') feedbackSeconds += dt;
      const span = (nose + .225 / 2) * motion.visualSpeed;
      let step = (moving || phase === 'feedback' && correct) ? dt * span / travelSeconds : 0;
      const crash=globalThis.CarzConfig.crashSequence;
      const cinematic=globalThis.CarzConfig.correctCinematic;
      const cinematicActive=phase==='feedback'&&correct;
      const enter=cinematicActive?ease(feedbackSeconds/cinematic.zoomInSeconds):0;
      const release=cinematicActive?ease((feedbackSeconds-cinematic.slowSeconds)/cinematic.returnSeconds):1;
      const focus=enter*(1-release);
      if(cinematicActive)step*=1-(1-cinematic.worldSlowScale)*focus;
      if(phase==='feedback'&&!correct){
        step=feedbackSeconds<crash.entrySeconds+globalThis.CarzConfig.explosion.seconds?dt*span/travelSeconds*crash.worldSlowScale:0;
        if(feedbackSeconds>=crash.entrySeconds)crashDrift+=step;
      }
      if (phase === 'travel') { step = (clamp(progress) - lastProgress) * span; gateY = gatePosition(progress, nose); lastProgress = clamp(progress); }
      else if (gateY !== null) gateY += step;
      distance += step * height;
      if (gateY !== null) { tunnels.style.transform = `translateY(${gateY * height}px)`; if (gateY > 1.05) tunnels.hidden = true; }
      app.style.setProperty('--scenery-offset', `${distance}px`);
      ctx.fillStyle = shade; ctx.fillRect(0, 0, width, height);
      const line = Math.max(2, width * .008);
      ctx.fillStyle = '#f4fbff';
      ctx.fillRect(width / 2 - line / 2, 0, line, height);
      ctx.fillStyle = '#ffffff08';
      for (let i = 0; i < 100; i++) ctx.fillRect(i * 47.3 % width, (i * 89.7 + distance) % height, 1, 1);
      ctx.fillStyle = '#dcf5ff44';
      for (let i = 0; i < 6; i++) ctx.fillRect(i < 3 ? 5 + i * 3 : width - 7 - i * 2, (distance * 1.5 + i * height / 3) % height, 1, 40);
      const pose = geometry(phase, progress, feedbackSeconds, correct);
      if(phase==='feedback'&&!correct){
        pose.y=-crash.entryDepth*ease(feedbackSeconds/crash.entrySeconds)+crashDrift;
      }
      if(cinematicActive){
        pose.y=-cinematic.entryDepth*ease(feedbackSeconds/cinematic.slowSeconds)*(1-release);
      }
      world.style.transform=focus>0?`scale(${1+(cinematic.zoomScale-1)*focus})`:'';
      world.style.transformOrigin=`${track.offsetLeft+position*width}px ${car.offsetTop+car.clientHeight/2}px`;
      const effects=globalThis.CarzConfig.laneEffects;
      // Presentation spring follows steering without changing lane position or deadlines.
      for(let remaining=dt;remaining>0;){const tick=Math.min(remaining,1/120);leanVelocity+=((tilt*effects.leanMultiplier-visualTilt)*effects.spring-leanVelocity*effects.damping)*tick;visualTilt+=leanVelocity*tick;remaining-=tick;}
      visualTilt=Math.max(-effects.maxLeanDegrees,Math.min(effects.maxLeanDegrees,visualTilt));
      const visibleHeight=Math.min(car.clientHeight,car.clientWidth*(car.naturalHeight/car.naturalWidth||1));
      const centerY=car.offsetTop+car.clientHeight/2+pose.y*height;
      const rear=visibleHeight*(inkBottom-.5)*.8,angle=visualTilt*Math.PI/180;
      const frontOffset=visibleHeight*(inkTop-.5);
      const front={x:(position*width-frontOffset*Math.sin(angle))/width,y:(centerY+frontOffset*Math.cos(angle))/height};
      if(phase==='feedback'&&!correct){carEffects.style.setProperty('--crash-x',`${front.x*100}%`);carEffects.style.setProperty('--crash-y',`${front.y*100}%`);}
      const wheelOffset=car.clientWidth*effects.wheelSpreadRatio;
      const wheels=[-wheelOffset,wheelOffset].map(dx=>({x:(position*width+dx*Math.cos(angle)-rear*Math.sin(angle))/width,y:(centerY+dx*Math.sin(angle)+rear*Math.cos(angle))/height}));
      for(const mark of tireMarks){mark.age+=dt;mark.a.y+=step;mark.b.y+=step;}
      while(tireMarks.length&&(tireMarks[0].age>effects.trailSeconds||tireMarks[0].a.y>1.1))tireMarks.shift();
      const turning=['question','reading','travel','recovery'].includes(phase)&&Math.abs(visualTilt)>.8&&pose.opacity>0&&wheels.some(wheel=>wheel.y>=0&&wheel.y<1);
      if(dt>0){
        if(turning&&lastWheels)wheels.forEach((wheel,i)=>tireMarks.push({a:{x:lastWheels[i].x,y:lastWheels[i].y+step},b:{...wheel},age:0}));
        lastWheels=turning?wheels:null;
      }
      while(tireMarks.length>effects.maxTrailSegments)tireMarks.shift();
      ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
      for(const mark of tireMarks){ctx.globalAlpha=.42*Math.pow(1-mark.age/effects.trailSeconds,1.5);ctx.strokeStyle='#071019';ctx.lineWidth=Math.max(1.5,car.clientWidth*effects.tireWidthRatio);ctx.beginPath();ctx.moveTo(mark.a.x*width,mark.a.y*height);ctx.lineTo(mark.b.x*width,mark.b.y*height);ctx.stroke();}
      ctx.restore();
      car.style.transform = `translate3d(${position * width}px,${pose.y * height}px,0) translateX(-50%) rotate(${visualTilt}deg)`;
      car.style.opacity = String(pose.opacity);
      arrow.dataset.active = String(pose.arrow);
      arrow.style.transform = `translateX(${(position - .25) * 200}%)`;
      snapshot = { phase, nose, gateLine: gateY === null ? null : gateY + .225 / 2, position, carY: pose.y, opacity: pose.opacity, distance };
      snapshot.front=front;
      snapshot.laneEffects={visualTilt,trailSegments:tireMarks.length,wheels};
      snapshot.cinematic={focus,worldScale:1+(cinematic.zoomScale-1)*focus,worldSpeedScale:1-(1-cinematic.worldSlowScale)*focus};
      snapshot.exhaust = { visible: false };
      if (selected >= 4) {
        // Read the animated car box, not its eventual resting location. Exhaust
        // shares the car's visibility/opacity and stays behind its opaque rear.
        const style = getComputedStyle(car);
        const visibleHeight = Math.min(car.clientHeight, car.clientWidth * (car.naturalHeight / car.naturalWidth || 1));
        const centerY = car.offsetTop + car.clientHeight / 2 + pose.y * height;
        const rear = visibleHeight * (inkBottom - .5), tailY = centerY + rear;
        const alpha = Number(style.opacity);
        const visible = style.visibility !== 'hidden' && alpha > 0 && tailY >= 0 && tailY < height;
        snapshot.exhaust = { visible, tailY, alpha };
        if (visible) {
          ctx.save(); ctx.globalAlpha = alpha; ctx.translate(position * width, centerY); ctx.rotate(visualTilt * Math.PI / 180); ctx.fillStyle = '#55caffaa';
          for (const dx of [-6, 6]) { ctx.beginPath(); ctx.moveTo(dx - 3, rear); ctx.lineTo(dx + 3, rear); ctx.lineTo(dx, rear + 20 + Math.sin(distance / 10) * 4); ctx.fill(); }
          ctx.restore();
        }
      }
      return pose;
    }
    return { resize, calibrate, approach, reset, outcome, render, get snapshot() { return snapshot; }, get width() { return width; }, get height() { return height; } };
  }
  return { motion, worldProgress, geometry, Steering, gatePosition, create };
});
