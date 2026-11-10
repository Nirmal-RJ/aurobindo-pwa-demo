// Approved My Carz copy preserved verbatim. Wave Rider owns its independent bank.
(function(r){const c={
  "version": 3,
  "questionSeconds": 8,
  "changePenaltySeconds": 2,
  "flagsPerUpgrade": 7,
  "maxDailyStars": 3,
  "boats": [
    {
      "id": 0,
      "name": "Bamboo Raft",
      "image": "boats-isometric/1-bamboo-raft.webp",
      "front": "boats-front-view/1-bamboo-raft-top.webp",
      "frontInkTop": 0.05244755244755245,
      "waterline": [[0.2,0.17,0.76],[0.35,0.15,0.78],[0.55,0.15,0.78],[0.75,0.16,0.77],[0.9,0.19,0.75]]
    },
    {
      "id": 1,
      "name": "Round River Boat",
      "image": "boats-isometric/2-round-river-boat.webp",
      "front": "boats-front-view/2-round-river-boat.webp",
      "frontInkTop": 0.06278026905829596,
      "waterline": [[0.09,0.43,0.6],[0.19,0.24,0.78],[0.37,0.14,0.87],[0.55,0.15,0.87],[0.73,0.26,0.77],[0.86,0.43,0.62]]
    },
    {
      "id": 2,
      "name": "Explorer Rowboat",
      "image": "boats-isometric/3-explorer-rowboat.webp",
      "front": "boats-front-view/3-explorer-rowboat.webp",
      "frontInkTop": 0.04716981132075472,
      "waterline": [[0.1,0.47,0.53],[0.25,0.36,0.66],[0.45,0.28,0.73],[0.63,0.29,0.72],[0.79,0.37,0.64],[0.91,0.47,0.53]]
    },
    {
      "id": 3,
      "name": "Pedal Cruiser",
      "image": "boats-isometric/4-pedal-cruiser.webp",
      "front": "boats-front-view/4-pedal-cruiser.webp",
      "frontInkTop": 0.048859934853420196,
      "waterline": [[0.09,0.46,0.56],[0.23,0.3,0.71],[0.43,0.23,0.78],[0.65,0.25,0.77],[0.84,0.31,0.72],[0.91,0.39,0.64]]
    },
    {
      "id": 4,
      "name": "Coastal Voyager",
      "image": "boats-isometric/5-coastal-voyager.webp",
      "front": "boats-front-view/5-coastal-voyager.webp",
      "frontInkTop": 0.04142011834319527,
      "waterline": [[0.12,0.46,0.54],[0.28,0.33,0.68],[0.48,0.25,0.75],[0.69,0.29,0.73],[0.85,0.36,0.65],[0.91,0.44,0.58]]
    },
    {
      "id": 5,
      "name": "River Runner",
      "image": "boats-isometric/6-river-runner.webp",
      "front": "boats-front-view/6-river-runner.webp",
      "frontInkTop": 0.036939313984168866,
      "waterline": [[0.08,0.44,0.51],[0.23,0.27,0.69],[0.44,0.2,0.77],[0.66,0.25,0.74],[0.81,0.35,0.64],[0.87,0.4,0.6]]
    },
    {
      "id": 6,
      "name": "Race Champion",
      "image": "boats-isometric/7-race-champion.webp",
      "front": "boats-front-view/7-race-champion.webp",
      "frontInkTop": 0.03424657534246575,
      "waterline": [[0.08,0.44,0.52],[0.27,0.26,0.73],[0.48,0.22,0.77],[0.68,0.25,0.75],[0.82,0.35,0.65],[0.87,0.4,0.61]]
    },
    {
      "id": 7,
      "name": "Grand Yacht",
      "image": "boats-isometric/8-grand-yacht-iso.webp",
      "front": "boats-front-view/8-grand-yacht-iso.webp",
      "frontInkTop": 0.03456221198156682,
      "waterline": [[0.07,0.45,0.54],[0.25,0.3,0.73],[0.45,0.24,0.8],[0.66,0.26,0.78],[0.84,0.32,0.72],[0.92,0.4,0.64]]
    },
    {
      "id": 8,
      "name": "Luxury Voyager",
      "image": "boats-isometric/9-luxury-voyager-iso.webp",
      "front": "boats-front-view/9-luxury-voyager-iso.webp",
      "frontInkTop": 0.030107526881720432,
      "waterline": [[0.06,0.46,0.55],[0.24,0.27,0.74],[0.45,0.22,0.8],[0.66,0.24,0.79],[0.84,0.3,0.73],[0.92,0.43,0.64]]
    }
  ],
  "questions": [
    {
      "id": "lab-practice-01",
      "prompt": "Samples can be shaken by hand for the same duration if the sonicator is unavailable.",
      "answer": false,
      "rightAction": "Always use sonicator. Hand shaking is never a substitute"
    },
    {
      "id": "lab-practice-02",
      "prompt": "Check sonicator bath temperature, even if the previous batch used the same setting.",
      "answer": true,
      "rightAction": "Check the sonicator bath temperature before every batch."
    },
    {
      "id": "lab-practice-03",
      "prompt": "Flasks can touch inside the sonicator if held firmly in place.",
      "answer": false,
      "rightAction": "Flasks must always be kept 2 cms apart inside the sonicator."
    },
    {
      "id": "lab-practice-04",
      "prompt": "Check the sonicator water level after placing the flasks inside.",
      "answer": true,
      "rightAction": "Check the water level with the flasks in place."
    },
    {
      "id": "lab-practice-05",
      "prompt": "If the solution looks clear, required intermittent shaking in sonicator can be skipped.",
      "answer": false,
      "rightAction": "Follow the required shaking steps, even if the solution looks clear."
    },
    {
      "id": "lab-practice-06",
      "prompt": "Replace contaminated sonicator bath water even if it looks clean.",
      "answer": true,
      "rightAction": "Clean-looking bath water may still be contaminated."
    },
    {
      "id": "lab-practice-07",
      "prompt": "For sonication, the smaller flask can be filled above the allowed level to fit a larger sample.",
      "answer": false,
      "rightAction": "Use the flask size prescribed in the STP"
    },
    {
      "id": "lab-practice-08",
      "prompt": "Count sonication time only after the sonicator starts.",
      "answer": true,
      "rightAction": "Confirm the sonicator is running before timing."
    },
    {
      "id": "lab-practice-09",
      "prompt": "To save time, a sonicator temperature slightly above the STP limit is acceptable.",
      "answer": false,
      "rightAction": "Follow the sonicator temperature prescribed in the STP."
    },
    {
      "id": "lab-practice-10",
      "prompt": "Stopping the sonicator once the sample dissoves will save time",
      "answer": true,
      "rightAction": "Always complete the specified sonication time."
    },
    {
      "id": "lab-practice-11",
      "prompt": "A short sonicator cycle can run with a low water level.",
      "answer": false,
      "rightAction": "Maintain the required sonicator water level for all cycles"
    },
    {
      "id": "lab-practice-12",
      "prompt": "Keep different-sized flasks 2cm apart in the sonicator.",
      "answer": true,
      "rightAction": "Maintain the 2cm gap for all flask sizes."
    },
    {
      "id": "lab-practice-13",
      "prompt": "Adding fresh water makes contaminated sonicator water suitable for reuse",
      "answer": false,
      "rightAction": "Replace contaminated water completely."
    },
    {
      "id": "lab-practice-14",
      "prompt": "Hand shake the flask as required, even when the sonicator runs continuously.",
      "answer": true,
      "rightAction": "Shake the flask as specified in the STP."
    },
    {
      "id": "lab-practice-15",
      "prompt": "Use a STP specified flask size in the sonicator to avoid overfilling.",
      "answer": true,
      "rightAction": "Use only the flask size prescribed in the STP."
    },
    {
      "id": "lab-practice-16",
      "prompt": "Extra sonicator time can make up for missed intermittent shaking of flask.",
      "answer": false,
      "rightAction": "Extra time cannot replace shaking. Follow the STP intervals."
    },
    {
      "id": "lab-practice-17",
      "prompt": "A gap between sonicator flasks is needed only for different samples.",
      "answer": false,
      "rightAction": "Keep flasks 2cm apart, even with the same sample."
    },
    {
      "id": "lab-practice-18",
      "prompt": "After pressing Start, check that the sonicator is working.",
      "answer": true,
      "rightAction": "Verify that sonication has started after pressing Start."
    },
    {
      "id": "lab-practice-19",
      "prompt": "Check the calibration register before using analytical balance.",
      "answer": true,
      "rightAction": "Verify the balance’s calibration status before use."
    },
    {
      "id": "lab-practice-20",
      "prompt": "If the reading in analytical balance is zero, checking its calibration status can be skipped.",
      "answer": false,
      "rightAction": "A zero reading does not confirm calibration status"
    },
    {
      "id": "lab-practice-21",
      "prompt": "Label the glassware with the sample details before weighing.",
      "answer": true,
      "rightAction": "Label glassware first to avoid sample mix-ups."
    },
    {
      "id": "lab-practice-22",
      "prompt": "If only one sample is weighed, glassware can be labelled after weighing.",
      "answer": false,
      "rightAction": "Label glassware before weighing, even for one sample."
    },
    {
      "id": "lab-practice-23",
      "prompt": "Check that the analytical balance’s levelling bubble is centred before use.",
      "answer": true,
      "rightAction": "Ensure the levelling bubble is centred before weighing."
    },
    {
      "id": "lab-practice-24",
      "prompt": "If the balance reading is stable, the leveling bubble need not be in centre.",
      "answer": false,
      "rightAction": "Always keep the levelling bubble centred."
    },
    {
      "id": "lab-practice-25",
      "prompt": "Clean the analytical balance pan with a brush before use.",
      "answer": true,
      "rightAction": "Use a brush to clean the balance pan before weighing."
    },
    {
      "id": "lab-practice-26",
      "prompt": "Check the analytical balance for any residue, even if the pan looks clean.",
      "answer": true,
      "rightAction": "Check both the pan and base for residue."
    },
    {
      "id": "lab-practice-27",
      "prompt": "Use a new paper boat for each sample weighing.",
      "answer": true,
      "rightAction": "Use only a new paper boat for every sample."
    },
    {
      "id": "lab-practice-28",
      "prompt": "If weighing the same chemical, a boat paper can be reused.",
      "answer": false,
      "rightAction": "Use a new paper boat for every weighing."
    },
    {
      "id": "lab-practice-29",
      "prompt": "Place the paper boat at the centre of the analytical balance pan.",
      "answer": true,
      "rightAction": "Keep the paper boat centred on the pan."
    },
    {
      "id": "lab-practice-30",
      "prompt": "The paper boat need not be centred if the balance reading is stable.",
      "answer": false,
      "rightAction": "Keep the paper boat centred for every weighing."
    },
    {
      "id": "lab-practice-31",
      "prompt": "Zero (tare) the analytical balance with a new, empty paper boat on the pan.",
      "answer": true,
      "rightAction": "Zero the balance with the empty paper boat before adding the sample."
    }
  ],
  "timings": {
    "enter": 450,
    "correct": 6200,
    "wrong": 2800,
    "crash": 3200,
    "upgrade": 1800
  },
  "assets": [
    "page-4/timer-panel.webp",
    "continue-button.webp",
    "next-button.webp",
    "try-again-button.webp",
    "water-bg.webp",
    "boats-front-view/1-bamboo-raft-top.webp",
    "boats-front-view/2-round-river-boat.webp",
    "boats-front-view/3-explorer-rowboat.webp",
    "boats-front-view/4-pedal-cruiser.webp",
    "boats-front-view/5-coastal-voyager.webp",
    "boats-front-view/6-river-runner.webp",
    "boats-front-view/7-race-champion.webp",
    "boats-front-view/8-grand-yacht-iso.webp",
    "boats-front-view/9-luxury-voyager-iso.webp",
    "boats-isometric/1-bamboo-raft.webp",
    "boats-isometric/2-round-river-boat.webp",
    "boats-isometric/3-explorer-rowboat.webp",
    "boats-isometric/4-pedal-cruiser.webp",
    "boats-isometric/5-coastal-voyager.webp",
    "boats-isometric/6-river-runner.webp",
    "boats-isometric/7-race-champion.webp",
    "boats-isometric/8-grand-yacht-iso.webp",
    "boats-isometric/9-luxury-voyager-iso.webp",
    "page-1/page-1-bg.webp",
    "page-10/exit-button.webp",
    "page-10/exit-panel.webp",
    "page-10/keep-sailing-button.webp",
    "page-2/page-2-1-bg.webp",
    "page-2/page-2-2-bg.webp",
    "page-2/page-2-3-bg.webp",
    "page-2/page-2-4-bg.webp",
    "page-3/boat-selection-button.webp",
    "page-3/button-down.webp",
    "page-3/button-place-holder.webp",
    "page-3/button-up.webp",
    "page-3/collect-7-flags-to-upgrade.webp",
    "page-3/how-to-play-button.webp",
    "page-3/start-sailing-button.webp",
    "page-4/exit-button.webp",
    "page-4/false-line.webp",
    "page-4/false-panel.webp",
    "page-4/flag-panel.webp",
    "page-4/question-panel.webp",
    "page-4/true-line.webp",
    "page-4/true-panel.webp",
    "page-5/flag.webp",
    "page-5/right-answer-panel.webp",
    "page-6/wrong-answer-pop-up.webp",
    "page-7/lighthouse-crash-panel.webp",
    "page-8/boat-upgraded-panel.webp",
    "page-9/luxury-voyager-panel.webp",
    "page-9/star-panel.webp"
  ]
};if(typeof module==='object')module.exports=c;else r.WaveConfig=c;})(globalThis);
