(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.SolventCore=api;})(globalThis,()=>{
  'use strict';
  const chemicals=['ACN','Water','MeOH'];
  const empty=()=>({ACN:0,Water:0,MeOH:0});
  function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function shelf(target,random=Math.random){
    const values=target?[target]:[];
    // Nearby five-point choices make several wrong solvent combinations total 100.
    // Staying above half the target prevents two shelf beakers replacing its answer.
    const candidates=Array.from({length:19},(_,i)=>(i+1)*5)
      .filter(n=>n!==target&&n>target/2)
      .sort((a,b)=>Math.abs(a-target)-Math.abs(b-target)||a-b);
    values.push(...candidates.slice(0,8-values.length));
    return shuffle(values,random);
  }
  class Game {
    constructor(config,profile={}){
      this.config=config;
      this.profile={schema:1,practiceComplete:false,streak:0,stars:0,rounds:[],...profile};
      if(this.profile.schema!==1||!Array.isArray(this.profile.rounds)||!Number.isInteger(this.profile.streak)||this.profile.streak<0||this.profile.streak>3)throw new Error('Saved progress is invalid.');
      this.mode='practice';this.phase='idle';this.remaining=config.seconds;
    }
    start(mode,random=Math.random){this.mode=mode;this.order=mode==='practice'?this.config.recipes.map((_,i)=>i):shuffle(this.config.recipes.map((_,i)=>i),random);this.index=0;this.results=[];this.remaining=this.config.seconds;this.question();}
    get recipe(){return this.config.recipes[this.order[this.index]];}
    get total(){return Object.values(this.mix).reduce((a,b)=>a+b,0);}
    question(){this.mix=empty();this.pours=[];this.shelves=Object.fromEntries(chemicals.map(c=>[c,shelf(this.recipe.mix[c])]));this.phase='mix';}
    pour(chemical,index){const value=this.shelves[chemical]?.[index];if(this.phase!=='mix'||!value||this.pours.some(p=>p.chemical===chemical&&p.index===index)||this.total+value>100)return null;const item={chemical,index,value};this.pours.push(item);this.mix[chemical]+=value;return item;}
    undo(){if(this.phase!=='mix')return null;const item=this.pours.pop();if(item)this.mix[item.chemical]-=item.value;return item;}
    submit(){if(this.phase!=='mix')return null;const correct=chemicals.every(c=>this.mix[c]===this.recipe.mix[c]);this.phase='feedback';this.lastCorrect=correct;if(this.mode==='challenge')this.results.push({recipeId:this.recipe.id,name:this.recipe.name,correct,mix:{...this.mix},timeout:false});return correct;}
    next(){if(this.phase!=='feedback')return false;if(this.mode==='practice'&&!this.lastCorrect){this.question();return false;}this.index++;if(this.index===this.order.length){if(this.mode==='practice'){this.profile.practiceComplete=true;this.phase='mastered';}else this.finish();return true;}this.question();return false;}
    tick(seconds){if(this.mode!=='challenge'||this.phase!=='mix')return false;this.remaining=Math.max(0,this.remaining-seconds);if(!this.remaining){for(let i=this.index;i<this.order.length;i++){const r=this.config.recipes[this.order[i]];this.results.push({recipeId:r.id,name:r.name,correct:false,timeout:true,mix:i===this.index?{...this.mix}:empty()});}this.finish();return true;}return false;}
    finish(){if(this.phase==='results')return;this.phase='results';const perfect=this.results.length===5&&this.results.every(r=>r.correct);this.profile.streak=perfect?Math.min(3,this.profile.streak+1):0;if(perfect&&this.profile.streak===3)this.profile.stars++;this.profile.rounds.push({at:new Date().toISOString(),perfect,remaining:this.remaining,results:structuredClone(this.results)});}
  }
  return {Game,chemicals,shelf,shuffle};
});
