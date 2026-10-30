(function (root, factory) {
  const config = factory();
  if (typeof module === 'object' && module.exports) module.exports = config;
  else root.CarzConfig = config;
})(globalThis, () => {
  const carNames = ['Mini', 'Hatchback', 'Sedan', 'SUV', 'Luxury', 'Limousine', 'Sports', 'F2', 'F1'];
  const garageArt = ['Mini', 'Hatch', 'Sedan', 'SUV', 'Luxury', 'Limo', 'Sports', 'F2', 'F1'];
  // Visible artwork bounds; garage cars share a scale and ground baseline.
  const garageCrops = [[377,225,1015,767],[96,89,1617,1001],[95,160,1624,904],
    [162,163,1485,892],[140,173,1506,793],[172,321,1464,611],
    [253,177,1293,834],[126,323,1537,595],[200,168,1399,816]];
  // Current supplied files face upward; crop to visible body bounds.
  const drivingArt = [
    ['1-mini', 0, [662,183,527,842]],
    ['2-hatch', 0, [613,30,576,1146]],
    ['3-sedan', 0, [634,41,510,1116]],
    ['4-suv', 0, [661,72,478,1057]],
    ['5-luxury', 0, [650,49,472,1109]],
    ['6-limo', 0, [764,77,288,1043]],
    ['7-sports', 0, [699,51,427,1090]],
    ['8-f2', 0, [679,50,431,1096]],
    ['9-f1', 0, [707,64,439,1076]]
  ];
  return {
    streakSize: 5, readingSeconds: 2, travelSeconds: 3.8, speedStep: 0,
    tunnels: {Good:'page-5/tunnel-good-updated.webp',Bad:'page-5/tunnel-bad-updated.webp'},
    garageMotion: { exitMs: 220, enterMs: 380 },
    diamondLoss: { stepMs:450, dropHeightRatio:.13 },
    musicTracks: { menu:'audio/menu-bgm.aac', game:'audio/lanerush-bgm.mp3' },
    // Question artwork tint, readable text and matching neon glow, in display order.
    questionPanels: [
      ['pink', '#d7005d', '#ffffff', '#d7005d'],
      ['violet', '#6800c4', '#ffffff', '#6800c4'],
      ['blue', '#0116ff', '#ffffff', '#0116ff'],
      ['orange', '#df6400', '#ffffff', '#df6400'],
      ['light-blue', '#00bfe4', '#ffffff', '#00bfe4']
    ],
    diamondFinale: {
      centerX: .5, centerY: .43, heroWidth: .43, orbitRadius: .13,
      sparkCount: 28, sparkRadius: .48, sparkDelaySeconds: .035,
      dimMs: 220, gatherMs: 1100, gatherStaggerMs: 65, mergeMs: 550,
      exitMs: 950, exitLift: .85, exitTurnDegrees: 155, exitPeakScale: 1.25,
      transitionMs: 650
    },
    scratchCard: { entranceMs: 1150, resolution: 640, revealFraction: .6 },
    confetti: { seconds: 3, particles: 160, pixelRatioLimit: 2,
      colors: ['#fff4bf', '#ffe17a', '#ffd044', '#edae25', '#c98412'] },
    laneEffects: { leanMultiplier: 1.65, spring: 210, damping: 23, maxLeanDegrees: 17,
      trailSeconds: 1.05, maxTrailSegments: 160, tireWidthRatio: .035, wheelSpreadRatio: .29 },
    crashSequence: { entrySeconds: .6, entryDepth: .015, worldSlowScale: .18 },
    correctCinematic: { slowSeconds: .9, returnSeconds: .55, worldSlowScale: .18,
      entryDepth: .015, zoomScale: 1.12, zoomInSeconds: .35 },
    explosion: { seconds: 2.2, widthPercent: 105,
      frames: Array.from({length:8},(_,i)=>`page-7/explosion/frame-${i}.png`) },
    // Supplied driving artwork; isometric previews remain temporary until supplied.
    cars: Array.from({ length: 9 }, (_, i) => ({ id: `car-${i + 1}`, name: carNames[i],
      driving: `cars-top-view/${drivingArt[i][0]}.webp`,
      drivingScale: i === 5 ? 1.4 : 1,
      drivingLayout: { rotation: drivingArt[i][1], crop: drivingArt[i][2], width:512, height:768, carHeight:744 },
      garagePreview: `car-iso-view/${garageArt[i]}.webp`,
      garageLayout: { crop: garageCrops[i], width:1600, height:1200, carWidth:1440, groundY:1100 },
      preview: `car-iso-view/${garageArt[i]}.webp`,
      frames: [] })),
    colors: [['original', 'Original', '#eee9d8'], ['red', 'Ruby', '#cc3045'], ['blue', 'Ocean', '#287cce'],
      ['green', 'Emerald', '#299969'], ['gold', 'Gold', '#dfa62f'], ['purple', 'Purple', '#854dce'],
      ['orange', 'Orange', '#ed782c'], ['pink', 'Pink', '#e85ba1'], ['teal', 'Teal', '#24b7b0'],
      ['silver', 'Silver', '#b8c3d0'], ['black', 'Black', '#343b48']],
    // User-supplied production bank. Good/Bad grades the lane; rightAction is crash guidance.
    // Question 10 retains the supplied Good classification.
    questions: [
      {
        "id": "lab-practice-01",
        "prompt": "Samples can be shaken by hand for the same duration if the sonicator is unavailable.",
        "answer": "Bad",
        "rightAction": "Always use sonicator. Hand shaking is never a substitute"
      },
      {
        "id": "lab-practice-02",
        "prompt": "Check sonicator bath temperature, even if the previous batch used the same setting.",
        "answer": "Good",
        "rightAction": "Check the sonicator bath temperature before every batch."
      },
      {
        "id": "lab-practice-03",
        "prompt": "Flasks can touch inside the sonicator if held firmly in place.",
        "answer": "Bad",
        "rightAction": "Flasks must always be kept 2 cms apart inside the sonicator."
      },
      {
        "id": "lab-practice-04",
        "prompt": "Check the sonicator water level after placing the flasks inside.",
        "answer": "Good",
        "rightAction": "Check the water level with the flasks in place."
      },
      {
        "id": "lab-practice-05",
        "prompt": "If the solution looks clear, required intermittent shaking in sonicator can be skipped.",
        "answer": "Bad",
        "rightAction": "Follow the required shaking steps, even if the solution looks clear."
      },
      {
        "id": "lab-practice-06",
        "prompt": "Replace contaminated sonicator bath water even if it looks clean.",
        "answer": "Good",
        "rightAction": "Clean-looking bath water may still be contaminated."
      },
      {
        "id": "lab-practice-07",
        "prompt": "For sonication, the smaller flask can be filled above the allowed level to fit a larger sample.",
        "answer": "Bad",
        "rightAction": "Use the flask size prescribed in the STP"
      },
      {
        "id": "lab-practice-08",
        "prompt": "Count sonication time only after the sonicator starts.",
        "answer": "Good",
        "rightAction": "Confirm the sonicator is running before timing."
      },
      {
        "id": "lab-practice-09",
        "prompt": "To save time, a sonicator temperature slightly above the STP limit is acceptable.",
        "answer": "Bad",
        "rightAction": "Follow the sonicator temperature prescribed in the STP."
      },
      {
        "id": "lab-practice-10",
        "prompt": "Stopping the sonicator once the sample dissoves will save time",
        "answer": "Good",
        "rightAction": "Always complete the specified sonication time."
      },
      {
        "id": "lab-practice-11",
        "prompt": "A short sonicator cycle can run with a low water level.",
        "answer": "Bad",
        "rightAction": "Maintain the required sonicator water level for all cycles"
      },
      {
        "id": "lab-practice-12",
        "prompt": "Keep different-sized flasks 2cm apart in the sonicator.",
        "answer": "Good",
        "rightAction": "Maintain the 2cm gap for all flask sizes."
      },
      {
        "id": "lab-practice-13",
        "prompt": "Adding fresh water makes contaminated sonicator water suitable for reuse",
        "answer": "Bad",
        "rightAction": "Replace contaminated water completely."
      },
      {
        "id": "lab-practice-14",
        "prompt": "Hand shake the flask as required, even when the sonicator runs continuously.",
        "answer": "Good",
        "rightAction": "Shake the flask as specified in the STP."
      },
      {
        "id": "lab-practice-15",
        "prompt": "Use a STP specified flask size in the sonicator to avoid overfilling.",
        "answer": "Good",
        "rightAction": "Use only the flask size prescribed in the STP."
      },
      {
        "id": "lab-practice-16",
        "prompt": "Extra sonicator time can make up for missed intermittent shaking of flask.",
        "answer": "Bad",
        "rightAction": "Extra time cannot replace shaking. Follow the STP intervals."
      },
      {
        "id": "lab-practice-17",
        "prompt": "A gap between sonicator flasks is needed only for different samples.",
        "answer": "Bad",
        "rightAction": "Keep flasks 2cm apart, even with the same sample."
      },
      {
        "id": "lab-practice-18",
        "prompt": "After pressing Start, check that the sonicator is working.",
        "answer": "Good",
        "rightAction": "Verify that sonication has started after pressing Start."
      },
      {
        "id": "lab-practice-19",
        "prompt": "Check the calibration register before using analytical balance.",
        "answer": "Good",
        "rightAction": "Verify the balance’s calibration status before use."
      },
      {
        "id": "lab-practice-20",
        "prompt": "If the reading in analytical balance is zero, checking its calibration status can be skipped.",
        "answer": "Bad",
        "rightAction": "A zero reading does not confirm calibration status"
      },
      {
        "id": "lab-practice-21",
        "prompt": "Label the glassware with the sample details before weighing.",
        "answer": "Good",
        "rightAction": "Label glassware first to avoid sample mix-ups."
      },
      {
        "id": "lab-practice-22",
        "prompt": "If only one sample is weighed, glassware can be labelled after weighing.",
        "answer": "Bad",
        "rightAction": "Label glassware before weighing, even for one sample."
      },
      {
        "id": "lab-practice-23",
        "prompt": "Check that the analytical balance’s levelling bubble is centred before use.",
        "answer": "Good",
        "rightAction": "Ensure the levelling bubble is centred before weighing."
      },
      {
        "id": "lab-practice-24",
        "prompt": "If the balance reading is stable, the leveling bubble need not be in centre.",
        "answer": "Bad",
        "rightAction": "Always keep the levelling bubble centred."
      },
      {
        "id": "lab-practice-25",
        "prompt": "Clean the analytical balance pan with a brush before use.",
        "answer": "Good",
        "rightAction": "Use a brush to clean the balance pan before weighing."
      },
      {
        "id": "lab-practice-26",
        "prompt": "Check the analytical balance for any residue, even if the pan looks clean.",
        "answer": "Good",
        "rightAction": "Check both the pan and base for residue."
      },
      {
        "id": "lab-practice-27",
        "prompt": "Use a new paper boat for each sample weighing.",
        "answer": "Good",
        "rightAction": "Use only a new paper boat for every sample."
      },
      {
        "id": "lab-practice-28",
        "prompt": "If weighing the same chemical, a boat paper can be reused.",
        "answer": "Bad",
        "rightAction": "Use a new paper boat for every weighing."
      },
      {
        "id": "lab-practice-29",
        "prompt": "Place the paper boat at the centre of the analytical balance pan.",
        "answer": "Good",
        "rightAction": "Keep the paper boat centred on the pan."
      },
      {
        "id": "lab-practice-30",
        "prompt": "The paper boat need not be centred if the balance reading is stable.",
        "answer": "Bad",
        "rightAction": "Keep the paper boat centred for every weighing."
      },
      {
        "id": "lab-practice-31",
        "prompt": "Zero (tare) the analytical balance with a new, empty paper boat on the pan.",
        "answer": "Good",
        "rightAction": "Zero the balance with the empty paper boat before adding the sample."
      }
    ],
    demos: [1, 2, 3, 4].map(i => `page-2-${i}/demo-step-${i}.webp`),
    // Populate with supplied GIF URLs. The four demo images are temporary help slides.
    helpSlides: [],
    sounds: { click: ['audio/gbu-button-click-sfx.mp3', .25], countdown: ['audio/gbu-countdown-audio.wav', .5],
      go: ['audio/my-carz-go.wav', .55], question: ['audio/my-carz-question-whoosh.wav', .32],
      explosion: ['audio/my-carz-explode.mp3', .6],
      streak: ['audio/my-carz-five-diamonds.mp3', .6], unlock: ['audio/my-carz-car-unlock.mp3', .6],
      pass: ['audio/my-carz-correct-pass.mp3', .6],
      diamondLost: ['audio/my-carz-diamond-lost.wav', .5],
      correct: ['audio/lanerush-correct.mp3', .6], wrong: ['audio/lanerush-wrong.mp3', .6], music: ['audio/menu-bgm.aac', .35] }
  };
});
