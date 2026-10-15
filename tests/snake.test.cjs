const {test}=require('node:test');
const assert=require('node:assert/strict');
const physics=require('../snake.js');
test('vegetable trails have collectible spacing and remain within the arena',()=>{
 for(const kind of ['line','curve','zigzag']){
  const points=physics.trail(kind,400,400,Math.PI/4);assert.equal(points.length,7);
  for(let i=0;i<points.length;i++){
   assert.ok(points[i].x>70 && points[i].x<2530 && points[i].y>70 && points[i].y<2530);
   if(i)assert.ok(Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y)>=72-1e-8);
  }
 }
});
test('completion medals reward accuracy',()=>{
 assert.equal(physics.medal(39,0),'Keep going');assert.equal(physics.medal(40,0),'Gold');
 assert.equal(physics.medal(40,3),'Silver');assert.equal(physics.medal(40,4),'Bronze');
});
test('snacks boost default speed without multiplying manual boost',()=>{
 assert.equal(physics.speed(false,false),125);assert.equal(physics.speed(true,false),190);
 assert.equal(physics.speed(true,true),230);
});
test('number quest accepts only 1 through 40 in sequence and unlocks at four correct eats',()=>{
 const run={next:1,correct:0};assert.equal(physics.number(run,2),false);assert.equal(run.next,1);
 for(let i=1;i<=40;i++){assert.equal(physics.number(run,i),true);assert.equal(physics.number(run,i),false);assert.equal(run.correct,i);assert.equal(physics.unlocked(i),Math.min(6,1+Math.floor(i/4)));}
 assert.equal(physics.number(run,41),false);assert.equal(run.correct,40);
});
test('opponents collect points without growing; only player length increases',()=>{
 const opponent={score:0,length:170}, player={score:0,length:170};
 for(let i=0;i<200;i++){physics.eat(opponent,false);physics.eat(player,true);}
 assert.equal(opponent.length,170);assert.equal(opponent.score,200);
 assert.equal(player.length,950);assert.equal(player.score,200);
});
test('steering crosses the angle wrap along the shortest arc',()=>{
 const angle=physics.turn(Math.PI-.1,-Math.PI+.1,.05);
 assert.ok(angle>Math.PI-.1); assert.ok(Math.abs(angle-(Math.PI-.05))<1e-9);
});
test('body spacing remains continuous after changing speed',()=>{
 const snake={x:0,y:0,angle:0,target:0,length:170,path:Array.from({length:100},(_,i)=>({x:-i*2,y:0}))};
 for(let i=0;i<60;i++)physics.move(snake,1/60,i<30?125:230);
 const body=physics.body(snake); assert.equal(body.length,18);
 for(let i=1;i<body.length;i++)assert.ok(Math.abs(Math.hypot(body[i].x-body[i-1].x,body[i].y-body[i-1].y)-10)<1e-8);
 assert.ok(snake.path.length<=93);
});
test('head collisions use world distance',()=>{
 assert.equal(physics.hits({x:0,y:0},[{x:10,y:0}]),true);
 assert.equal(physics.hits({x:0,y:0},[{x:30,y:0}]),false);
});
test('body cache is reused until movement or growth changes the body',()=>{
 const snake={x:0,y:0,angle:0,target:0,length:170,path:Array.from({length:100},(_,i)=>({x:-i*2,y:0}))};
 const first=physics.body(snake);assert.equal(physics.body(snake),first);
 physics.move(snake,1/60,125);const moved=physics.body(snake);assert.notEqual(moved,first);
 snake.length+=18;assert.notEqual(physics.body(snake),moved);
});
test('game starts, renders, resizes and pauses on phone, tablet and PC layouts',()=>{
 const vm=require('node:vm'), fs=require('node:fs');
 for(const [width,height] of [[360,640],[844,390],[768,1024],[1920,1080]]){
  const elements=new Map(), windowEvents={}, documentEvents={};let callback;
  const context2d=new Proxy({}, {get:(_,key)=>['createRadialGradient','createLinearGradient'].includes(key)?()=>({addColorStop(){}}):()=>{},set:()=>true});
  function element(){return {clientWidth:width,clientHeight:height,style:{},hidden:false,disabled:false,classList:{add(){},remove(){}},events:{},attributes:{},children:[],setAttribute(key,value){this.attributes[key]=value;},querySelectorAll(){return this.children;},getContext:()=>context2d,addEventListener(type,fn){this.events[type]=fn;},getBoundingClientRect:()=>({left:0,top:0,width:116,height:116}),append(...children){this.children.push(...children);},replaceChildren(...children){this.children=children;},focus(){},blur(){},setPointerCapture(){}};}
  const document={hidden:false,getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},createElement:element,createTextNode:t=>t,addEventListener(type,fn){documentEvents[type]=fn;}};
  const context=vm.createContext({document,window:{devicePixelRatio:3,addEventListener(type,fn){windowEvents[type]=fn;}},localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:width<900}),requestAnimationFrame:fn=>{callback=fn;},console});
  const source=fs.readFileSync(require.resolve('../snake.js'),'utf8').replace('fit(); reset(); renderPicker();', `
  globalThis.checkQuest = () => {
    reset();snakes=[player];state='playing';const groupCount=food.length;const close=food.every(p=>Math.hypot(p.x-player.x,p.y-player.y)<260);
    for(let value=1;value<=40;value++){
      const next=food.find(p=>p.number===value);if(!next)throw new Error('Missing next number '+value);
      player.x=next.x;player.y=next.y;simulate(0);
      for(const item of digestion)item.distance=10000;simulate(0);
    }
    const result={groupCount,close,score,state,streak,longestStreak,mistakes,unlocks:SnakePhysics.unlocked(totalCorrect),results:$('results').textContent};
    totalCorrect=0;selectedSkin=skins[0];reset();state='home';renderPicker();return result;
  };
  globalThis.checkSpeed = () => {
    reset(); state='playing';pickupImages.push(document.createElement('canvas'));spawnPickup();
    const spawned=pickups.length;food=[];
    pickups=[{x:player.x,y:player.y,image:pickupImages[0],age:0}];simulate(0);
    const boosted={time:speedRemaining,remaining:pickups.length,next:sequence.next,length:player.length};
    simulate(5.1);const expired=speedRemaining;reset();state='home';return {spawned,boosted,expired};
  };
  globalThis.checkDigestion = () => {
    reset(); const snakeCount=snakes.length; snakes=[player]; state = 'playing';
    const initial = player.length;
    const first = food.find(p => p.number === 1); player.x = first.x; player.y = first.y; simulate(0);
    const before = {length:player.length,next:sequence.next,correct:digestion[0].correct};
    digestion[0].distance=10000; simulate(0); const grown=player.length;
    const wrong=food.find(p=>p.number===3);player.x=wrong.x;player.y=wrong.y;simulate(0);
    digestion[0].distance=10000;simulate(0);
    const result={snakeCount,initial,before,grown,wrongLength:player.length,next:sequence.next,expelled:expelled[0].number};
    expelled[0].time=2;simulate(0);result.returned=food.some(p=>p.number===3);
    reset();state='home';return result;
  };
  fit(); reset(); renderPicker();`);
  vm.runInContext(source,context);
  const quest=context.checkQuest();assert.equal(quest.groupCount,40);assert.equal(quest.close,false);
  assert.equal(quest.score,40);assert.equal(quest.state,'over');assert.equal(quest.longestStreak,40);
  assert.equal(quest.mistakes,0);assert.equal(quest.unlocks,6);assert.match(quest.results,/Gold/);
  const snack=context.checkSpeed();assert.ok(snack.spawned>=7 && snack.spawned<=48);assert.equal(snack.spawned%7,0);assert.equal(snack.boosted.time,5);
  assert.equal(snack.boosted.remaining,0);assert.equal(snack.boosted.next,1);assert.equal(snack.boosted.length,170);assert.equal(snack.expired,0);
  const digestion=context.checkDigestion();assert.equal(digestion.snakeCount,5);assert.equal(digestion.before.length,digestion.initial);
  assert.equal(digestion.before.next,2);assert.equal(digestion.before.correct,true);
  assert.equal(digestion.grown,digestion.initial+18);assert.equal(digestion.wrongLength,digestion.grown);
  assert.equal(digestion.next,2);assert.equal(digestion.expelled,3);assert.equal(digestion.returned,true);
  const options=elements.get('snake-options');assert.equal(options.children.length,6);
  const types=elements.get('snake-types');assert.equal(types.children.length,2);
  types.children[1].events.click();assert.equal(types.children[1].attributes['aria-pressed'],'true');
  assert.equal(types.children[0].attributes['aria-pressed'],'false');
  options.children[1].events.click();assert.equal(options.children[1].disabled,true);assert.equal(options.children[0].attributes['aria-pressed'],'true');
  assert.equal(options.children.filter(b=>b.attributes['aria-pressed']==='true').length,1);
  elements.get('start').events.click();assert.equal(elements.get('overlay').hidden,true);
  const joystick=elements.get('joystick');
  joystick.events.pointerdown({pointerId:1,clientX:95,clientY:58});
  const steering=elements.get('stick').style.transform;
  joystick.events.pointerdown({pointerId:2,clientX:20,clientY:58});
  joystick.events.pointerup({pointerId:2});assert.equal(elements.get('stick').style.transform,steering);
  joystick.events.pointercancel({pointerId:1});assert.equal(elements.get('stick').style.transform,'');
  for(let i=0;i<180;i++)callback(i*1000/60);
  elements.get('arena').clientWidth=height;elements.get('arena').clientHeight=width;windowEvents.resize();callback(3010);
  document.hidden=true;documentEvents.visibilitychange();assert.equal(elements.get('overlay').hidden,false);assert.equal(elements.get('start').textContent,'Resume →');
  assert.equal(elements.get('snake-picker').hidden,true);
  elements.get('start').events.click();assert.equal(elements.get('overlay').hidden,true);callback(3020);
  windowEvents.blur();types.children[0].events.click();elements.get('start').events.click();callback(3040);
 }
});

test('straight body visibly slithers over time even with reduced motion enabled',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync(require.resolve('../snake.js'),'utf8');
 const helper=source.slice(source.indexOf('  function slitheringBody('),source.indexOf('  function draw()'));
 const body=Array.from({length:18},(_,i)=>({x:200-i*10,y:100}));
 const original=JSON.stringify(body);
 const context={SnakePhysics:{body:()=>body},reducedMotion:{matches:true},runTime:0};
 vm.createContext(context);vm.runInContext(helper+';this.sample=slitheringBody;',context);
 const first=context.sample({});context.runTime=.2;const second=context.sample({});
 assert.equal(first[0],body[0]);
 assert.ok(first.some((p,i)=>Math.abs(p.y-body[i].y)>10));
 assert.ok(second.some((p,i)=>Math.abs(p.y-first[i].y)>5));
 assert.equal(JSON.stringify(body),original);
});