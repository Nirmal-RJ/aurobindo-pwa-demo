/* Pure progression rules. Times are unrounded milliseconds; comparisons never use rounded labels. */
(function(root){
 'use strict';
 const empty=()=>({demoComplete:false,stars:0,bestAverageMs:null,streak:[]});
 function restore(value){
  const p=empty();if(!value||typeof value!=='object')return p;
  p.demoComplete=value.demoComplete===true;
  p.stars=Number.isSafeInteger(value.stars)&&value.stars>=0?value.stars:0;
  p.bestAverageMs=Number.isFinite(value.bestAverageMs)&&value.bestAverageMs>0&&value.bestAverageMs<20000?value.bestAverageMs:null;
  if(!p.bestAverageMs)p.stars=0;
  const limit=p.bestAverageMs||20000;
  p.streak=Array.isArray(value.streak)&&value.streak.length<3&&value.streak.every(t=>Number.isFinite(t)&&t>0&&t<limit)?value.streak.slice():[];
  return p;
 }
 const target=p=>p.bestAverageMs||20000;
 function complete(previous,{correct,expired,elapsedMs}){
  const progress=restore(previous),limit=target(progress),time=Math.max(1,elapsedMs);
  const qualified=correct&&!expired&&time<limit;
  if(!qualified){progress.streak=[];return {progress,qualified:false,won:false,times:[],targetMs:limit,elapsedMs:time,reason:expired?'timeout':correct?'target':'wrong'};}
  const times=[...progress.streak,time],won=times.length===3;
  if(won){const average=times.reduce((a,b)=>a+b,0)/3;progress.bestAverageMs=Math.min(progress.bestAverageMs||Infinity,average);progress.stars++;progress.streak=[];}
  else progress.streak=times;
  return {progress,qualified:true,won,times,targetMs:limit,elapsedMs:time,reason:'correct'};
 }
 const api={empty,restore,target,complete};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.BlastLogic=api;
})(typeof window==='undefined'?globalThis:window);
