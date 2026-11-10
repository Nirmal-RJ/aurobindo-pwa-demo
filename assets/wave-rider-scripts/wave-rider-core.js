(function(r){
 const day=now=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
 const fresh=(now=Date.now(),demo=false)=>({version:1,day:day(now),demo,level:0,unlocked:0,score:0,stars:0});
 function load(raw,now=Date.now()){
  if(!raw||raw.version!==1||raw.day!==day(now))return fresh(now,!!raw?.demo);
  return {...fresh(now),demo:!!raw.demo,level:Math.max(0,Math.min(8,Number(raw.level)||0)),unlocked:Math.max(0,Math.min(8,Number(raw.unlocked)||0)),score:Math.max(0,Number(raw.score)||0),stars:Math.max(0,Math.min(3,Number(raw.stars)||0))};
 }
 class Run{
  constructor(config,saved,now=()=>Date.now(),random=Math.random){this.config=config;this.saved=saved;this.now=now;this.random=random;this.flags=0;this.selected=saved.level;this.deck=[];this.lastId=null;}
  next(){if(!this.deck.length){this.deck=[...this.config.questions];for(let i=this.deck.length-1;i>0;i--){let j=Math.floor(this.random()*(i+1));[this.deck[i],this.deck[j]]=[this.deck[j],this.deck[i]];}if(this.deck.length>1&&this.deck.at(-1).id===this.lastId)[this.deck[0],this.deck[this.deck.length-1]]=[this.deck.at(-1),this.deck[0]];}this.question=this.deck.pop();this.lastId=this.question.id;this.started=this.now();this.penalty=0;this.lane=0;this.swipes=0;this.answerElapsed=0;this.settled=false;return this.question;}
  remaining(){return Math.max(0,this.config.questionSeconds*1000-(this.now()-this.started)-this.penalty);}
  change(lane){if(this.settled||![-1,1].includes(lane)||lane===this.lane||this.remaining()<=0)return false;this.lane=lane;this.swipes++;this.answerElapsed=this.now()-this.started;if(this.swipes>1)this.penalty+=this.config.changePenaltySeconds*1000;return true;}
  settle(){if(this.settled)return null;this.settled=true;const correct=this.lane!==0&&(this.lane===1)===this.question.answer;const points=correct?Math.max(0,this.config.questionSeconds-this.answerElapsed/1000):0;
   // Running out of available time through a swipe penalty awards no points.
   const penaltyExpired=this.swipes>1&&this.penalty+this.answerElapsed>=this.config.questionSeconds*1000;
   const earned=correct&&!penaltyExpired?Math.round(points):0;
   if(correct){this.flags++;this.saved.score+=earned;}else this.flags=0;
   return {correct,crash:this.lane===0,points:earned,upgrade:correct&&this.flags>=this.config.flagsPerUpgrade};
  }
  upgrade(){this.flags=0;if(this.saved.level<8){this.saved.level++;this.saved.unlocked=Math.max(this.saved.unlocked,this.saved.level);this.selected=this.saved.level;}
   if(this.saved.level===8&&this.saved.stars<this.config.maxDailyStars){this.saved.stars++;return true;}return false;}
  restartCycle(){if(this.saved.stars<this.config.maxDailyStars){this.saved.level=0;this.saved.unlocked=0;this.selected=0;}this.flags=0;}
 }
 const c={day,fresh,load,Run};if(typeof module==='object')module.exports=c;else r.WaveCore=c;
})(globalThis);
