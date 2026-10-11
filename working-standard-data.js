/* Codes transcribed from the four contents sheets. B6 and M7 fix duplicate printed codes. */
const WorkingStandard = (() => {
'use strict';
const groups = {
A: {
 A: ['Almond Caramel Nougat','Almond Chocolate Praline','Almond Vanilla Truffle','Almond sour & sweet','Almond cream & sugar','Almond sugar & sour','Almond strawberry cream','Almond strawberry crisp','Almond cinnamon & sour','Apple Caramel Praline','Apple Cinnamon Nougat','Apricot Vanilla Truffle'],
 B: ['Banana Caramel Nougat','Banana Chocolate Praline','Banana Vanilla Truffle','Blackberry Vanilla Praline','Blueberry Vanilla Nougat','Blackberry Caramel Truffle'],
 C: ['Caramel Almond Praline','Caramel Hazelnut Nougat','Cherry Chocolate Truffle','Cherry Vanilla Praline','Chocolate Almond Nougat','Chocolate sour & sweet','Chocolate sugar & sour','Chocolate cream & sugar','Chocolate almond cream','Chocolate almond crisp','Chocolate cinnamon & sour','Coconut Vanilla Truffle'],
 E: ['Espresso Hazelnut Praline','Espresso Caramel Nougat']
},
B: {
 F: ['Fig Caramel Nougat','Fig Vanilla Praline','Fudge Almond Truffle','Fudge Hazelnut Praline','Fudge Caramel Nougat'],
 G: ['Ginger Chocolate Truffle','Ginger Caramel Praline','Ginger Vanilla Nougat','Grape Vanilla Praline','Guava Caramel Nougat'],
 H: ['Hazelnut Chocolate Truffle','Hazelnut Caramel Praline','Hazelnut Vanilla Nougat','Honey Almond Praline','Honey Hazelnut Nougat','Honey Vanilla Truffle'],
 J: ['Jackfruit Caramel Nougat','Jaggery Almond Praline','Jaggery Coconut Nougat','Jasmine Vanilla Truffle']
},
C: {
 K: ['Kesar Almond Praline','Kesar Vanilla Nougat','Kiwi Vanilla Truffle','Kiwi Coconut Praline','Kulfi Pistachio Nougat'],
 L: ['Lemon Vanilla Praline','Lemon Coconut Truffle','Lime Coconut Nougat','Lychee Vanilla Praline','Lychee Coconut Truffle'],
 M: ['Macadamia Caramel Nougat','Macadamia Chocolate Praline','Mango Vanilla Truffle','Mango Coconut Nougat','Maple Almond Praline','Maple Hazelnut Nougat','Mocha Caramel Truffle'],
 N: [null,'Nutmeg Vanilla Praline'], O: [null,null,'Orange Chocolate Truffle','Orange Caramel Nougat']
},
D: {P: ['sour & sweet','sugar & sour','cream & sugar','almond cream','almond crisp','cinnamon & sour','sweet & cream','sour & sugar','cream & crisp','almond & sugar','cinnamon & sugar','cream & sour','almond & sour','sugar & crisp','cinnamon cream','almond & cinnamon','sweet & crisp','sugar & almond','cinnamon & cream','sour & crisp','almond sugar & cream','sweet cinnamon','cream & almond','cinnamon & crisp','sugar & cinnamon','sweet almond cream','sour cinnamon & sugar','almond cream & crisp','sweet & sour cream','cinnamon sugar & cream'].map(n=>'Pistachio '+n)}
};
const bottles = Object.entries(groups).flatMap(([box, prefixes]) => Object.entries(prefixes).flatMap(([prefix,names]) => names.flatMap((name,i)=>name ? [{box,code:prefix+(i+1),name}] : [])));
function shuffle(items, random=Math.random) { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; }
class Round {
 constructor(random=Math.random) { this.targets=shuffle(bottles,random).slice(0,3); this.selected=[]; this.remaining=60000; this.noteRemaining=3000; this.phase='memorize'; this.recallUsed=false; this.layouts={}; for(const box of ['A','B','C','D']) this.layouts[box]=shuffle(bottles.filter(b=>b.box===box),random).map(b=>({...b,hue:Math.floor(random()*360)})); }
 advance(ms) { ms=Math.max(0,ms); if(this.phase==='memorize'){const used=Math.min(ms,this.noteRemaining);this.noteRemaining-=used;ms-=used;if(!this.noteRemaining)this.phase='playing';} if(this.phase==='playing'){this.remaining=Math.max(0,this.remaining-ms);this.noteRemaining=Math.max(0,this.noteRemaining-ms);if(!this.remaining){this.phase='results';this.noteRemaining=0;}} }
 recall(){if(this.phase!=='playing'||this.recallUsed)return false;this.recallUsed=true;this.noteRemaining=3000;return true;}
 select(code){if(this.phase!=='playing'||this.selected.length===3||this.selected.some(b=>b.code===code))return false;const bottle=Object.values(this.layouts).flat().find(b=>b.code===code);if(!bottle)return false;this.selected.push(bottle);return true;}
 remove(code){if(this.phase==='playing')this.selected=this.selected.filter(b=>b.code!==code);}
 get matches(){return this.targets.filter(t=>this.selected.some(b=>b.code===t.code)).length;}
}
return {bottles,Round,shuffle};
})();
if(typeof module!=='undefined')module.exports=WorkingStandard;
