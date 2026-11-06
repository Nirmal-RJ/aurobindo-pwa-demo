window.BlastConfig = {
  version: '30', roundSeconds: 60,
  theme: 'diwali',
  audio: {menu:'audio/menu-bgm.mp3',game:'audio/game-bgm.mp3',sparkle:'audio/sparkle.mp3',tick:'audio/timer-tick.wav',blast:'audio/blast-2.mp3',wrong:'audio/wrong-answer.mp3',wrongVolume:1.7,struggle:'audio/fuse-sputter.wav',struggleVolume:.7,blastVolume:1.6,blastDuck:.2,blastDuckSeconds:.45,menuVolume:.25,gameVolume:.25,sparkleVolume:.42,tickVolume:.32,crossfade:1.1},
  timing: { transition: 420, entrance: 1250, placement: 300, assemble: 850, sparklerApproach: 700, contact: 250, ignition: 900, burstGap: 600, correctHold: 1800, failSettle: 450, failZoom: 700, failStruggle: 1500, failSmoke: 1500, failReturn: 500, feedback: 1400, timeoutHold: 750, diyaLead: 500, diyaLight: 1300, diyaHold: 1400, resetHold: 1700, goldHold: 2200 },
  pairs: [
    {term:'% RSD', youtube:'5w6SYiNNWKs', meaning:'Precision', video:'videos/1-rsd.webm', left:'1-rsd.webp', right:'11-precision.webp'},
    {term:'Resolution', youtube:'gQJaalDoXOU', meaning:'Peak Separation', video:'videos/2-resolution.webm', left:'2-resolution.webp', right:'22-peak-seperation.webp'},
    {term:'Tailing Factor', youtube:'cl1aGuzl_HU', meaning:'Peak Symmetry', video:'videos/3-tailing-factor.webm', left:'3-tailing-factor.webp', right:'33-peak-symmetry.webp'},
    {term:'Plate Count', youtube:'37jwsnUoApM', meaning:'Column Efficiency', video:'videos/4-plate-count.webm', left:'4-plate-count.webp', right:'44-column-efficiency.webp'},
    {term:'Retention Time', youtube:'vi4o_y4JYf0', meaning:'Peak Identification', video:'videos/5-retention-time.webm', left:'5-retention-time.webp', right:'55-peak-identification.webp'}
  ]
};