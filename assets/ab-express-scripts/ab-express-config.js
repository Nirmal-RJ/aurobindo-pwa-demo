(function (root) {
  'use strict';
  const config = {
    version: '46', storageKey: 'ab-express-progress-v1',
    audio: { menu: 'audio/menu-bgm.aac', game: 'audio/gameplay-bgm.aac', wrong: 'audio/wrong-answer.aac', trainEntry: 'audio/train-entry.aac', correct: 'audio/correct-compartment.aac', whoosh: 'audio/rearrange.wav', trainEntryVolume: .95, correctVolume: .7, whooshVolume: .16, explosion: 'audio/explosion.mp3', explosionVolume: .65, menuVolume: .28, gameVolume: .28, wrongVolume: .55, buttonVolume: .5, tick: 'audio/timer-tick.wav', tickVolume: .32, crossfade: .85 },
    challengeRoundSeconds: 90, challengeRounds: 3, practiceRounds: 5,
    timing: { celebrationRead: 3600, cardEntry: 520, cardStagger: 90, startReadHold: 2000, departure: 950, intro: 1300, trainEntry: 2000, compartment: 950, feedback: 1300, answerReveal: 650, answerRead: 1600, streak: 1400, reward: 1600 },
    crash: { duration: 2800, titleDelay: 650, shake: 9, sparks: 24, smokePuffs: 14, dim: .38 },
    steps: [
      "Check the balance bubble is centred.",
      "Check calibration is within date.",
      "Label the preparation vessel.",
      "Match the sample container label to the worksheet.",
      "Open the balance door.",
      "Clean the pan and base",
      "Use a clean & dry butter paper boat.",
      "Centre the boat on the balance pan.",
      "Tare the empty paper boat to zero.",
      "Discard excess sample in the bin.",
      "Close the door for a stable reading.",
      "Wait for a stable reading before recording.",
      "Transfer the weighed sample to a dry preparation vessel.",
      "Weigh the used butter paper to check sample left.",
      "Clean the entire pan and base with brush after weighing.",
      "Throw the used butter paper in the bin.",
      "Throw other waste and sample residue in the bin."
],
    stepIcons: [1,2,3,4,5,6,8,9,10,11,12,13,16,17,19,21,22],
    asset(path) { return '../ab-express-assets/' + path.split('/').map(encodeURIComponent).join('/') + '?v=' + config.version; }
  };
  root.ABConfig = config;
  if (typeof module !== 'undefined') module.exports = config;
})(typeof window === 'undefined' ? globalThis : window);
