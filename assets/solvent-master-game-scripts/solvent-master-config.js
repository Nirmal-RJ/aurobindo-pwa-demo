globalThis.SolventMasterConfig = Object.freeze({
  loading: Object.freeze({ cacheName: 'solvent-master-media-v1', concurrency: 4, attempts: 3, timeoutMs: 30000 }),
  landing: Object.freeze({ background: '../solvent-master-game-assets/page-1/page-1-bg.webp', next: '../solvent-master-game-assets/ui-common-buttons/next-button.webp' }),
  flow: Object.freeze({ demoStorageKey: 'solvent-master-demo-complete-v1', exitMs: 260, enterMs: 380, slideMs: 220 }),
  // Approved temporary reference slides; replace these mappings with supplied GIFs later.
  demoSlides: Object.freeze(['a','b','c','d'].map(letter => `../solvent-master-game-assets/page-2-demo-page/demo-page-2-${letter}-reference.webp`)),
  gameplay: Object.freeze({ storageKey:'solvent-master-progress-v1', seconds:60, pourMs:1500, feedbackMs:700, correctCelebrationMs:1600, feedbackDimMs:350,
    audio:{menu:.28,game:.25,celebration:.3,menuClick:.5,shatter:.6,mixHappy:.35,mixSad:.6,warning:.55,effects:.13,liquid:.45,crossfadeSeconds:1.2,files:{menu:'audio/menu-bgm.aac',game:'audio/game-bgm.aac',warning:'audio/last-10-seconds.aac',liquid:'audio/liquid-pour.mp3',celebration:'audio/congratulation-bgm.aac',menuClick:'audio/menu-click.aac',shatter:'audio/streak-lose.aac',mixHappy:'audio/mix-happy.aac',mixSad:'audio/mix-sad.aac'}},
    streakAnimation:Object.freeze({fillMs:1400,danceMs:1600,pipeMs:1300,activateMs:1100}),
    faces:Object.freeze({neutral:'beaker-faces/neutral.gif',happy:'beaker-faces/happy.gif',sad:'beaker-faces/sad.gif'}),
    recipes:[
      {id:'c-column-wash',name:'C Column Wash',mix:{Water:90,ACN:5,MeOH:5}},
      {id:'strong-wash',name:'Strong Wash Solvent',mix:{Water:20,ACN:80,MeOH:0}},
      {id:'needle-wash',name:'Needle Wash Solvent',mix:{Water:50,ACN:0,MeOH:50}},
      {id:'column-storage',name:'Column Storage (C18)',mix:{Water:30,ACN:70,MeOH:0}},
      {id:'d-column-wash',name:'D Column Wash',mix:{Water:10,ACN:45,MeOH:45}}
    ] })
});
if (typeof module === 'object') module.exports = globalThis.SolventMasterConfig;
