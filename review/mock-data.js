import {publicGames} from './public-games.js';
const svg = source => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
function portrait(color, hair, shirt) {
 return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="24" fill="${color}"/><path d="M10 80q0-30 30-30t30 30" fill="${shirt}"/><ellipse cx="40" cy="32" rx="17" ry="21" fill="#e6ac83"/><path d="M23 31Q17 5 40 7q25 0 18 29l-5-17q-17 13-28 4" fill="${hair}"/><circle cx="34" cy="33" r="1.5"/><circle cx="47" cy="33" r="1.5"/><path d="M35 43q6 5 11-1" fill="none" stroke="#823e37" stroke-width="2"/></svg>`);
}
export const accounts = [
 { id:'ghost-1', employeeId:'DEMO1001', name:'Maya · Tester', role:'ghost', photo:portrait('#e8ddfc','#342044','#7856b2') },
 { id:'ghost-2', employeeId:'DEMO1002', name:'Arun · Tester', role:'ghost', photo:portrait('#d5eced','#272d42','#2e777f') },
 { id:'director-1', employeeId:'DEMO2001', name:'Leela · Director', role:'director', photo:portrait('#f9e8ba','#443023','#ac6c22') },
 { id:'core-1', employeeId:'DEMO3001', name:'Dev · Core team', role:'core', photo:portrait('#dbe7ff','#212c4b','#4269a8') }
];
export const rooms = [
 {id:'global', name:'Global', description:'Directors, testers and approved core team'},
 {id:'rc', name:'RC', description:'Ghost testers only · internal discussion'}
];
export const screenshot = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#321146"/><stop offset="1" stop-color="#130d29"/></linearGradient></defs><rect width="720" height="960" fill="url(#g)"/><text x="360" y="70" text-anchor="middle" fill="#ffe6a0" font-family="sans-serif" font-size="32">Match It, Blast It</text><text x="360" y="112" text-anchor="middle" fill="#c7b7de" font-family="sans-serif" font-size="20">Illustrative demo screenshot</text><path d="M360 165v440" stroke="#dfd4b6" stroke-width="10"/>${['% RSD','Resolution','Tailing Factor','Plate Count','Retention Time'].map((t,i)=>`<rect x="40" y="${180+i*82}" width="275" height="64" rx="15" fill="#b02e43"/><text x="177" y="${220+i*82}" text-anchor="middle" fill="white" font-family="sans-serif" font-size="23">${t}</text><rect x="400" y="${180+i*82}" width="275" height="64" rx="15" fill="none" stroke="#f4ca65" stroke-dasharray="8 6"/>`).join('')}<rect x="40" y="670" width="640" height="155" rx="25" fill="#fff0ce"/><text x="360" y="720" text-anchor="middle" fill="#452765" font-family="sans-serif" font-size="30">Meaning panel</text><rect x="240" y="860" width="240" height="60" rx="30" fill="#ffd65b"/><text x="360" y="900" text-anchor="middle" fill="#341344" font-family="sans-serif" font-size="27">Light</text></svg>`);
export function seedState() {
 const now=Date.now();
 const builds=[{id:'blast-30',gameId:'blast',gameName:'Match It, Blast It',version:'v30',createdAt:new Date(now-86400000).toISOString()},{id:'blast-29',gameId:'blast',gameName:'Match It, Blast It',version:'v29',createdAt:new Date(now-172800000).toISOString()},{id:'rocket-review',gameId:'rocket',gameName:'Rocketier',version:'Review build A',createdAt:new Date(now).toISOString()}];
 for(const game of publicGames)if(!builds.some(b=>b.gameId===game.id))builds.push({id:game.defaultBuildId,gameId:game.id,gameName:game.name,version:'Review build A',createdAt:new Date(now).toISOString()});
 const messages=[];
 return {schema:1,accountId:'ghost-1',builds,messages,votes:[],read:{},sequence:0};
}
