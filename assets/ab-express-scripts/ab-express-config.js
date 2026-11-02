(function (root) {
  'use strict';
  const config = {
    version: '22', storageKey: 'ab-express-progress-v1',
    audio: { menu: 'audio/menu-bgm.aac', game: 'audio/gameplay-bgm.aac', wrong: 'audio/wrong-answer.aac', trainEntry: 'audio/train-entry.aac', correct: 'audio/correct-compartment.aac', whoosh: 'audio/rearrange.wav', trainEntryVolume: .95, correctVolume: .7, whooshVolume: .16, explosion: 'audio/explosion.mp3', explosionVolume: .65, menuVolume: .28, gameVolume: .28, wrongVolume: .55, buttonVolume: .5, tick: 'audio/timer-tick.wav', tickVolume: .32, crossfade: .85 },
    challengeRoundSeconds: 60,
    timing: { intro: 1300, trainEntry: 2000, compartment: 950, feedback: 1300, answerReveal: 650, answerRead: 1600, streak: 1400, reward: 1600 },
    crash: { duration: 2800, titleDelay: 650, shake: 9, sparks: 24, smokePuffs: 14, dim: .38 },
    steps: [
      'Check the balance bubble is centred.',
      'Check calibration is within date.',
      'Label the preparation vessel.',
      'Match the sample container label to the worksheet.',
      'Open the balance door.',
      'Clean the pan with the correct brush.',
      'Clean the entire base if residue is present.',
      'Use a clean & dry butter paper boat.',
      'Centre the boat on the balance pan.',
      'Tare the empty paper boat to zero.',
      "Discard excess sample in the bin. Don't return it to the container.",
      'Close the door for a stable reading & to prevent contamination.',
      'Wait for a stable reading before recording.',
      'Check net weight against the worksheet.',
      'Calculate and record the actual sample weight.',
      'Transfer the weighed sample to a dry preparation vessel.',
      'Weigh the used butter paper to check sample left.',
      'Record and print the gross weight.',
      'Clean the entire pan and base with brush after weighing.',
      'After weighing and cleaning, close the door to prevent contamination.',
      'Throw the used butter paper in the bin.',
      'Throw other waste and sample residue in the bin.',
      'Leave the balance clean and ready for use.',
      'Recheck the balance bubble is centred.'
    ],
    buckets: [[1,3,6,7,8,13,15,21], [2,4,5,8,9,10,12,13], [3,9,10,11,12,13,15,16], [8,13,15,16,17,18,21,22], [8,9,10,14,19,20,23,24]],
    asset(path) { return '../ab-express-assets/' + path.split('/').map(encodeURIComponent).join('/'); }
  };
  root.ABConfig = config;
  if (typeof module !== 'undefined') module.exports = config;
})(typeof window === 'undefined' ? globalThis : window);
