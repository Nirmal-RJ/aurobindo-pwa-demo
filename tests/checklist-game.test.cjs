const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function game() {
  class Element {
    constructor() { this.children=[]; this.events={}; this.dataset={}; this.style={}; this.parts={}; this.hidden=false; this.classList={add(){},remove(){},toggle(){}}; }
    addEventListener(n,fn){this.events[n]=fn;}
    append(node){if(node.parent) node.remove(); this.children.push(node); node.parent=this;}
    remove(){if(this.parent){this.parent.children=this.parent.children.filter(n=>n!==this);this.parent=null;}}
    replaceChildren(){this.children=[];}
    querySelector(s){return this.parts[s] ||= new Element();}
    cloneNode(){const e=new Element(); e.dataset={...this.dataset};return e;}
    setAttribute(){} setPointerCapture(){} focus(){}
    getBoundingClientRect(){return {left:20,top:100+(this.parent?.children.indexOf(this)||0)*70,width:300,height:60};}
    click(){this.events.click?.();}
  }
  let now=0,interval;const nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);};
  const document={hidden:false,body:new Element(),events:{},getElementById:get,createElement:()=>new Element(),querySelector:()=>get('clipboard'),addEventListener(n,f){this.events[n]=f;}};
  const math=Object.create(Math);math.random=()=>.99;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../checklist-game.js'),'utf8'),{document,window:{addEventListener(){}},navigator:{},Math:math,performance:{now:()=>now},setInterval:fn=>interval=fn,setTimeout(){}});
  return {get,start(){get('start').click();get('memorize').click();now+=5000;interval();now+=1200;interval();},tick(ms){now+=ms;interval();},hide(v){document.hidden=v;document.events.visibilitychange();},order(){return get('steps').children.map(n=>Number(n.dataset.id));},sort(){for(let id=0;id<5;id++){while(this.order().indexOf(id)>id){const row=get('steps').children.find(n=>Number(n.dataset.id)===id);row.querySelector('button').events.keydown({key:'ArrowUp',preventDefault(){}});}}}};
}
test('initial shuffle is incorrect, wrong answer permits retry, and keyboard order wins',()=>{
  const g=game();g.start();assert.notDeepEqual(g.order(),[0,1,2,3,4]);
  g.get('submit').click();assert.equal(g.get('result').hidden,false);assert.match(g.get('your-order').innerHTML,/out-of-place/);g.get('replay').click();g.start();
  g.tick(5000);g.sort();g.get('submit').click();
  assert.equal(g.get('result').hidden,false);assert.equal(g.get('result-title').textContent,'Perfect sequence!');
  assert.match(g.get('result-summary').textContent,/5s used/);
  g.get('replay').click();g.start();assert.equal(g.get('result').hidden,true);assert.equal(g.get('seconds').textContent,20);
});
test('background pauses the clock, expiry reports results, and late input is blocked',()=>{
  const g=game();g.start();g.tick(10000);g.hide(true);g.tick(90000);g.hide(false);
  assert.equal(g.get('seconds').textContent,10);g.tick(10000);
  assert.equal(g.get('result').hidden,false);assert.equal(g.get('submit').disabled,true);
  const order=g.order();g.sort=()=>{};g.get('submit').click();assert.deepEqual(g.order(),order);
});
test('pointer dragging reorders and cancellation restores the original order',()=>{
  const g=game();g.start();const before=g.order();const row=g.get('steps').children[0];
  row.events.pointerdown({button:0,pointerId:1,clientX:40,clientY:120,preventDefault(){}});
  row.events.pointermove({pointerId:1,clientX:40,clientY:480});assert.notDeepEqual(g.order(),before);
  row.events.pointercancel();assert.deepEqual(g.order(),before);
});
test('instructions precede five-second recognition and shuffle before the timer starts',()=>{
  const g=game();g.get('start').click();assert.equal(g.get('instructions').hidden,false);
  g.get('memorize').click();assert.deepEqual(g.order(),[0,1,2,3,4]);assert.equal(g.get('submit').disabled,true);
  g.tick(4900);assert.deepEqual(g.order(),[0,1,2,3,4]);assert.equal(g.get('seconds').textContent,1);
  g.tick(100);assert.notDeepEqual(g.order(),[0,1,2,3,4]);assert.equal(g.get('submit').disabled,true);
  g.tick(1200);assert.equal(g.get('submit').disabled,false);assert.equal(g.get('seconds').textContent,20);
  g.tick(1000);assert.equal(g.get('seconds').textContent,19);
});
