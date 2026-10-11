const test = require('node:test');
const assert = require('node:assert/strict');
const { bottles, Round } = require('../working-standard-data.js');
test('contents sheets map to unique codes and only named bottles', () => {
 assert.equal(bottles.length,102);assert.equal(new Set(bottles.map(b=>b.code)).size,102);
 assert.deepEqual(['A','B','C','D'].map(box=>bottles.filter(b=>b.box===box).length),[32,20,20,30]);
 for(const [code,name] of [['A1','Almond Caramel Nougat'],['B1','Banana Caramel Nougat'],['B6','Blackberry Caramel Truffle'],['E2','Espresso Caramel Nougat'],['M7','Mocha Caramel Truffle'],['P30','Pistachio cinnamon sugar & cream']])assert.equal(bottles.find(b=>b.code===code).name,name);
 assert.ok(!bottles.some(b=>b.code==='F6'));
});
test('three-second memorisation precedes the full sixty-second search', () => {
 const r=new Round();assert.equal(r.select('A1'),false);r.advance(2999);assert.equal(r.phase,'memorize');r.advance(1);assert.equal(r.phase,'playing');assert.equal(r.remaining,60000);r.advance(59999);assert.equal(r.phase,'playing');r.advance(1);assert.equal(r.phase,'results');assert.equal(r.select('A1'),false);
});
test('selections are unique, removable and never finish the round early', () => {
 const r=new Round();r.advance(3000);for(const b of r.targets)assert.equal(r.select(b.code),true);
 assert.equal(r.matches,3);assert.equal(r.phase,'playing');assert.equal(r.select(r.targets[0].code),false);
 r.remove(r.targets[0].code);assert.equal(r.selected.length,2);assert.equal(r.select(r.targets[0].code),true);r.advance(60000);assert.equal(r.matches,3);
});
test('one reminder lasts three seconds while the search clock continues', () => {
 const r=new Round();assert.equal(r.recall(),false);r.advance(3000);assert.equal(r.recall(),true);assert.equal(r.recall(),false);r.advance(3000);assert.equal(r.noteRemaining,0);assert.equal(r.remaining,57000);
});
test('each target is available in its own persistent box layout', () => {
 const r=new Round();assert.equal(new Set(r.targets.map(b=>b.code)).size,3);for(const t of r.targets)assert.ok(r.layouts[t.box].some(b=>b.code===t.code));
 r.advance(63000);assert.equal(r.phase,'results');assert.equal(r.noteRemaining,0);
});

function browser(options={}) {
 const fs=require('node:fs'),vm=require('node:vm'),nodes=new Map();let time=0,interval;
 function element(){const attrs=new Map();return {hidden:false,disabled:false,inert:false,dataset:{},children:[],events:{},textContent:'',style:{setProperty(){}},classList:{toggle(){}},clientWidth:1280,clientHeight:640,addEventListener(n,f){this.events[n]=f;},setAttribute(n,v){attrs.set(n,v);},getAttribute(n){return attrs.get(n);},append(...a){this.children.push(...a);},replaceChildren(...a){this.children=a;},querySelector(){return this.columns ||= element();},querySelectorAll(){return [];},getBoundingClientRect(){return {width:1280,height:640};},setPointerCapture(){},focus(){this.focused=true;}};}
 const node=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
 const boxes=['A','B','C','D'].map(box=>Object.assign(element(),{dataset:{box}}));
 const portrait={matches:false,addEventListener(n,f){this.change=f;}};if(options.legacyMediaQuery){delete portrait.addEventListener;portrait.addListener=f=>{portrait.change=f;};}
 const video=node('video');Object.assign(video,{plays:0,pauses:0,currentTime:0,play(){this.plays++;return Promise.resolve();},pause(){this.pauses++;}});
 const document={hidden:false,events:{},getElementById:node,createElement:element,querySelectorAll:q=>q==='.box'?boxes:[],addEventListener(n,f){this.events[n]=f;}};
 if(options.fullscreen)document.documentElement={requestFullscreen:options.fullscreen};const events={};const context={document,matchMedia:()=>portrait,window:{isSecureContext:false,addEventListener(n,f){events[n]=f;}},screen:{},navigator:{},performance:{now:()=>time},setInterval(f){interval=f;},console};
 vm.runInNewContext(fs.readFileSync(require.resolve('../working-standard-data.js'),'utf8')+'\n'+fs.readFileSync(require.resolve('../working-standard.js'),'utf8'),context);
 return {node,boxes,video,portrait,document,events,advance(ms){time+=ms;interval();},elapse(ms){time+=ms;}};
}
test('UI flows from final video frame to sheets, tray, removable selections and timed report',()=>{
 const app=browser();app.node('start').onclick();app.video.events.ended();app.node('ready-start').onclick();assert.equal(app.node('boxes').hidden,false);assert.equal(app.node('notes').hidden,false);
 app.advance(3000);assert.equal(app.node('notes').hidden,true);app.boxes[0].onclick();assert.equal(app.node('contents').hidden,false);app.node('open-tray').onclick();assert.equal(app.node('bottles').children.length,32);
 app.node('bottles').children[0].onclick();assert.equal(app.node('selected-count').textContent,'1 / 3');app.node('slots').children[0].onclick();assert.equal(app.node('selected-count').textContent,'0 / 3');
 app.node('recall').onclick();assert.equal(app.node('notes').hidden,false);app.advance(3000);assert.equal(app.node('recall').disabled,true);
 app.advance(57000);assert.equal(app.node('results').hidden,false);assert.equal(app.node('correct-answers').children.length,3);assert.equal(app.node('bench').hidden,true);
});
test('portrait pauses video and timer, and a click past the deadline cannot select',()=>{
 const app=browser();app.node('start').onclick();app.portrait.matches=true;app.portrait.change();assert.equal(app.node('rotate').hidden,false);assert.equal(app.node('app').inert,true);assert.ok(app.video.pauses>0);
 app.portrait.matches=false;app.portrait.change();app.video.events.ended();app.node('ready-start').onclick();app.advance(3000);app.boxes[1].onclick();app.node('open-tray').onclick();
 app.portrait.matches=true;app.portrait.change();app.advance(20000);assert.equal(app.node('timer').textContent,'60s');app.portrait.matches=false;app.portrait.change();
 app.elapse(60001);app.node('bottles').children[0].onclick();assert.equal(app.node('results').hidden,false);assert.equal(app.node('selected-count').textContent,'0 / 3');
});

test('ready prompt waits for user before the three-second notes and the one-minute timer',()=>{
 const app=browser();app.node('start').onclick();app.video.events.ended();assert.equal(app.node('game-briefing').hidden,false);assert.equal(app.node('notes').hidden,true);
 app.advance(15000);assert.equal(app.node('timer').textContent,'');app.node('ready-start').onclick();assert.equal(app.node('notes').hidden,false);
 app.advance(2999);assert.equal(app.node('notes').hidden,false);app.advance(1);assert.equal(app.node('notes').hidden,true);assert.equal(app.node('timer').textContent,'60s');
});
test('opening help pauses the round and the cabinet covers the entire viewport',()=>{
 const app=browser();app.node('start').onclick();app.video.events.ended();app.node('ready-start').onclick();app.advance(3000);
 app.node('how-to').onclick();app.advance(20000);assert.equal(app.node('timer').textContent,'60s');assert.equal(app.node('instructions').hidden,false);app.node('close-instructions').onclick();app.advance(1000);assert.equal(app.node('timer').textContent,'59s');
 const scene=app.node('cabinet-scene');assert.equal(scene.style.width,'1280px');assert.equal(scene.style.height,'720px');assert.equal(scene.style.top,'-40px');
});

test('reading the pulled-out box keeps it closed; the handle opens it and Return restores the cabinet',()=>{
 const app=browser();app.node('start').onclick();app.video.events.ended();app.node('ready-start').onclick();app.advance(3000);app.boxes[0].onclick();
 const viewport=app.node('contents-viewport');viewport.events.pointerdown({pointerId:1,button:0,clientX:500,clientY:300});viewport.events.pointerup({pointerId:1});assert.equal(app.node('contents').hidden,false);assert.equal(app.node('tray').hidden,true);
 app.node('open-handle').onclick();assert.equal(app.node('tray').hidden,false);app.node('tray-sheet').onclick();app.node('contents-back').onclick();assert.equal(app.node('cabinet').hidden,false);
});

test('bench stays visible across boxes; Close preserves the removed box and Return restores the cabinet',()=>{
 const app=browser();app.node('start').onclick();app.video.events.ended();app.node('ready-start').onclick();app.advance(3000);app.boxes[0].onclick();app.node('open-tray').onclick();
 app.node('bottles').children[0].onclick();assert.equal(app.node('selected-count').textContent,'1 / 3');app.node('tray-sheet').onclick();assert.equal(app.node('contents').hidden,false);assert.equal(app.node('bench').hidden,false);
 app.node('open-tray').onclick();app.node('tray-back').onclick();assert.equal(app.node('cabinet').hidden,false);assert.equal(app.node('bench').hidden,false);assert.equal(app.node('selected-count').textContent,'1 / 3');
 app.boxes[1].onclick();assert.equal(app.node('bench').hidden,false);assert.equal(app.node('selected-count').textContent,'1 / 3');
});
test('three selections enable an explicit early check; removal disables it and checking ends the round',()=>{
 const app=browser();app.node('start').onclick();app.video.events.ended();app.node('ready-start').onclick();app.advance(3000);app.boxes[0].onclick();app.node('open-tray').onclick();
 app.node('check-selections').onclick();assert.equal(app.node('results').hidden,true);
 for(let i=0;i<3;i++)app.node('bottles').children[i].onclick();assert.equal(app.node('check-selections').disabled,false);assert.equal(app.node('results').hidden,true);
 app.node('slots').children[0].onclick();assert.equal(app.node('check-selections').disabled,true);app.node('bottles').children[0].onclick();assert.equal(app.node('check-selections').disabled,false);
 app.node('check-selections').onclick();assert.equal(app.node('results').hidden,false);assert.equal(app.node('your-answers').children.length,3);assert.equal(app.node('bench').hidden,true);
});

test('iPhone without page fullscreen keeps gameplay working and presents usable fullscreen help',async()=>{
 const app=browser({legacyMediaQuery:true});app.node('start').onclick();assert.ok(app.video.plays>0);assert.equal(app.video.muted,true);assert.equal(app.video.playsInline,true);
 await app.node('fullscreen').onclick();assert.equal(app.node('fullscreen-help').hidden,false);app.node('close-fullscreen-help').onclick();assert.equal(app.node('fullscreen-help').hidden,true);
 app.portrait.matches=true;app.portrait.change();assert.equal(app.node('rotate').hidden,false);app.portrait.matches=false;app.portrait.change();app.video.events.ended();assert.equal(app.node('cabinet-still').hidden,false);
 app.node('ready-start').onclick();app.advance(3000);app.boxes[0].onclick();app.node('open-handle').onclick();assert.equal(app.node('tray').hidden,false);
});
test('Android-style fullscreen succeeds even without orientation locking, and history restoration resumes safely',async()=>{
 let requests=0;const app=browser({fullscreen:()=>{requests++;return Promise.resolve();}});app.node('start').onclick();await Promise.resolve();assert.equal(requests,1);
 await app.node('fullscreen').onclick();assert.equal(requests,2);assert.equal(app.node('fullscreen-help').hidden,true);
 app.video.events.ended();app.node('ready-start').onclick();app.advance(3000);app.events.pagehide();app.advance(20000);assert.equal(app.node('timer').textContent,'60s');app.events.pageshow();app.advance(1000);assert.equal(app.node('timer').textContent,'59s');
});
test('pinch and pointer cancellation do not open a box or leave a stuck drag',()=>{
 const app=browser();app.node('start').onclick();app.video.events.ended();app.node('ready-start').onclick();app.advance(3000);app.boxes[0].onclick();const viewport=app.node('contents-viewport');
 viewport.events.pointerdown({pointerId:1,button:0,clientX:300,clientY:300});viewport.events.pointerdown({pointerId:2,button:0,clientX:400,clientY:300});viewport.events.pointermove({pointerId:2,clientX:500,clientY:300});assert.equal(app.node('zoom-reset').textContent,'2.0×');
 viewport.events.pointercancel({pointerId:2});viewport.events.lostpointercapture({pointerId:1});assert.equal(app.node('contents').hidden,false);app.node('zoom-reset').onclick();assert.equal(app.node('zoom-reset').textContent,'1.0×');
});
