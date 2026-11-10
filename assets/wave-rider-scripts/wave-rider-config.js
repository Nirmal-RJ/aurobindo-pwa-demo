// Source: docs/Wave Rider Question.xlsx. Client wording and boolean answers preserved.
(function(r){const c={
  "version": 3,
  "audio": {
    "crossfadeSeconds": 1.1,
    "musicVolume": 0.28,
    "volumes": {"penalty": 0.32, "celebration": 0.24, "button": 0.65, "correct": 0.85, "wrong": 0.85, "crash": 0.9},
    "files": {"menu": "menu-bgm-v1.mp3", "game": "game-bgm-v1.mp3", "correct": "correct-answer-v1.mp3", "wrong": "wrong-answer-v1.mp3", "crash": "boat-crashed-v1.mp3", "button": "button-v1.mp3"}
  },
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
      "id": "wr-sheet-v1-1",
      "prompt": "A clear looking solution can skip the required filtration step after sonication.",
      "answer": false,
      "rightAction": "Clear solutions can still contain particles. Complete the filtration step required by the STP."
    },
    {
      "id": "wr-sheet-v1-2",
      "prompt": "Residue in the HPLC detector flow cell can affect readings.",
      "answer": true,
      "rightAction": "Residue can affect detector readings. Flush the flow cell as instructed."
    },
    {
      "id": "wr-sheet-v1-3",
      "prompt": "Check the saved HPLC sequence against the current STP, even when testing the same product.",
      "answer": true,
      "rightAction": "Check that the programmed sequence matches the STP for the current run."
    },
    {
      "id": "wr-sheet-v1-4",
      "prompt": "Programming the HPLC sequence from memory without checking the STP is acceptable to save time.",
      "answer": false,
      "rightAction": "Check the programmed sequence against the approved STP before starting the run."
    },
    {
      "id": "wr-sheet-v1-5",
      "prompt": "The HPLC purge valve should remain open after purging during normal operation.",
      "answer": false,
      "rightAction": "Close the purge valve after purging so the system can build normal operating pressure."
    },
    {
      "id": "wr-sheet-v1-6",
      "prompt": "The manual purge valve can stay open while the system builds pressure for the run.",
      "answer": false,
      "rightAction": "Close the manual purge valve after purging so the system can build operating pressure."
    },
    {
      "id": "wr-sheet-v1-7",
      "prompt": "Check the sample temperature against the STP, even when the sample looks ready.",
      "answer": true,
      "rightAction": "Sample appearance cannot confirm temperature. Check it as described in the STP."
    },
    {
      "id": "wr-sheet-v1-8",
      "prompt": "Checking HPLC column temperature helps maintain accurate retention time and separation.",
      "answer": true,
      "rightAction": "Verify the column temperature before starting. Temperature changes can affect retention time and separation."
    },
    {
      "id": "wr-sheet-v1-9",
      "prompt": "Check the injection volume against the STP before starting a saved method.",
      "answer": true,
      "rightAction": "A saved method may use a different volume. Verify it against the current STP."
    },
    {
      "id": "wr-sheet-v1-10",
      "prompt": "Standard and sample vials can be identified just by how much liquid they contain.",
      "answer": false,
      "rightAction": "Match vial labels to the sequence. The liquid level itself cannot confirm vial identity."
    },
    {
      "id": "wr-sheet-v1-11",
      "prompt": "After placing a vial tray, check its location against the programmed sequence.",
      "answer": true,
      "rightAction": "Check both tray location and vial position so the system selects the correct vial."
    },
    {
      "id": "wr-sheet-v1-12",
      "prompt": "Different grades can be used for the same process if the chemical name matches.",
      "answer": false,
      "rightAction": "Check both the chemical name and the grade required by the method."
    },
    {
      "id": "wr-sheet-v1-13",
      "prompt": "Check the labels before using two prepared solvents that look alike.",
      "answer": true,
      "rightAction": "Prepared solvents can look identical. Use the labels to confirm their contents."
    },
    {
      "id": "wr-sheet-v1-14",
      "prompt": "A clean chromatogram means the required needle wash and seal wash can be skipped.",
      "answer": false,
      "rightAction": "Complete both washes. Needle wash reduces carryover. Seal wash helps keep pump seals clean."
    },
    {
      "id": "wr-sheet-v1-15",
      "prompt": "Using the wrong composition to wash or store a column can reduce its performance.",
      "answer": true,
      "rightAction": "Check the approved composition for each step. Washing and storage may require different mixtures."
    },
    {
      "id": "wr-sheet-v1-16",
      "prompt": "A column fitting can stay slightly loose if no leak is visible before the run.",
      "answer": false,
      "rightAction": "Secure the fitting as instructed. A loose connection may leak under operating pressure."
    },
    {
      "id": "wr-sheet-v1-17",
      "prompt": "Finish preparing the mobile phase before starting the run, even if the sequence is ready.",
      "answer": true,
      "rightAction": "Prepare the mobile phase first. Changes during the run can affect separation."
    },
    {
      "id": "wr-sheet-v1-18",
      "prompt": "Vial positions in a sequence eliminates the need for Standard and Sample labels.",
      "answer": false,
      "rightAction": "Label each vial clearly and match it to the sequence."
    },
    {
      "id": "wr-sheet-v1-19",
      "prompt": "Check both pore size and membrane material before choosing a membrane filter.",
      "answer": true,
      "rightAction": "Verify both specifications against the STP before selecting the filter."
    },
    {
      "id": "wr-sheet-v1-20",
      "prompt": "A peak in the next blank proves that the needle caused the carryover.",
      "answer": false,
      "rightAction": "A peak in the blank can suggest carryover. Investigate the source before adding a wash."
    },
    {
      "id": "wr-sheet-v1-21",
      "prompt": "Air entering the pump through a solvent line can make the system pressure fluctuate.",
      "answer": true,
      "rightAction": "Air can interrupt steady flow and cause the pressure to rise and fall."
    },
    {
      "id": "wr-sheet-v1-22",
      "prompt": "A sample vial can replace a volumetric flask stopper if it fits over the opening.",
      "answer": false,
      "rightAction": "Use the correct stopper. A sample vial can shift or leave gaps during mixing."
    },
    {
      "id": "wr-sheet-v1-23",
      "prompt": "A blocked reservoir suction filter can reduce the solvent flow reaching the pump.",
      "answer": true,
      "rightAction": "A blockage can restrict flow. Clean the suction filter as instructed."
    },
    {
      "id": "wr-sheet-v1-24",
      "prompt": "Tilting the beaker is enough even if the pipette tip becomes exposed while drawing liquid.",
      "answer": false,
      "rightAction": "Keep the tip submerged while drawing liquid so the pipette does not take in air."
    },
    {
      "id": "wr-sheet-v1-25",
      "prompt": "Complete the required filtration after sonication, even when no particles are visible.",
      "answer": true,
      "rightAction": "Fine particles may still be present. Follow the filtration step in the STP."
    },
    {
      "id": "wr-sheet-v1-26",
      "prompt": "After a run with buffer, a stable baseline is enough reason to skip the detector flush.",
      "answer": false,
      "rightAction": "Complete the approved flush. A stable baseline cannot confirm that salts are gone."
    },
    {
      "id": "wr-sheet-v1-27",
      "prompt": "The specified Channel C wash contains more water than organic.",
      "answer": true,
      "rightAction": "Use more water than organic for this Channel C wash. Check the STP ratio."
    },
    {
      "id": "wr-sheet-v1-28",
      "prompt": "The specified Channel D wash contains more organic than water.",
      "answer": true,
      "rightAction": "Use more organic than water for this Channel D wash. Check the STP ratio."
    },
    {
      "id": "wr-sheet-v1-29",
      "prompt": "A saved sequence can be started without checking if it worked for yesterday’s batch.",
      "answer": false,
      "rightAction": "Verify the saved sequence against the current STP before starting the run."
    },
    {
      "id": "wr-sheet-v1-30",
      "prompt": "Steady pressure means any remaining channels can skip the required purge.",
      "answer": false,
      "rightAction": "Purge each required channel. Steady pressure alone does not confirm every channel is ready."
    },
    {
      "id": "wr-sheet-v1-31",
      "prompt": "Close the manual purge valve after purging and before starting the run.",
      "answer": true,
      "rightAction": "Closing the manual purge valve lets the system build normal operating pressure."
    },
    {
      "id": "wr-sheet-v1-32",
      "prompt": "Leaving a sample on the bench for a while confirms it reached the required temperature.",
      "answer": false,
      "rightAction": "Time on the bench does not confirm temperature. Check it as described in the STP."
    },
    {
      "id": "wr-sheet-v1-33",
      "prompt": "Wait for the column to reach the required temperature before starting injections.",
      "answer": true,
      "rightAction": "Verify the actual column temperature. It can affect retention time and separation."
    },
    {
      "id": "wr-sheet-v1-34",
      "prompt": "Yesterday’s injection volume can be reused without checking if the same column is installed.",
      "answer": false,
      "rightAction": "Check the current STP for injection volume, even when using the same column."
    },
    {
      "id": "wr-sheet-v1-35",
      "prompt": "A tray can change slots without a sequence check if vial positions stay the same.",
      "answer": false,
      "rightAction": "Moving the tray can change vial selection. Check its location against the sequence."
    },
    {
      "id": "wr-sheet-v1-36",
      "prompt": "An incorrect mobile phase mix can change separation, retention time and peak shape.",
      "answer": true,
      "rightAction": "Check the solvent lines and programmed percentages to confirm the correct mix."
    },
    {
      "id": "wr-sheet-v1-37",
      "prompt": "A normal pressure reading is enough reason to delay a guard column filter replacement.",
      "answer": false,
      "rightAction": "Replace the filter when the maintenance procedure requires it, even if pressure looks normal."
    },
    {
      "id": "wr-sheet-v1-38",
      "prompt": "Using the wrong grade of a chemical can affect HPLC results.",
      "answer": true,
      "rightAction": "Check the chemical name and grade against the STP. Impurities can affect results."
    },
    {
      "id": "wr-sheet-v1-39",
      "prompt": "Two clear prepared solvents can be interchanged if both bottles have the same cap colour.",
      "answer": false,
      "rightAction": "Read the labels. Matching cap colours do not confirm matching contents."
    },
    {
      "id": "wr-sheet-v1-40",
      "prompt": "An extra needle wash may help when the needle causes carryover and the procedure allows it.",
      "answer": true,
      "rightAction": "If the needle is the source, an approved extra wash may remove the residue."
    },
    {
      "id": "wr-sheet-v1-41",
      "prompt": "A solvent that washes the column well can also be used for storage without checking.",
      "answer": false,
      "rightAction": "Check the approved storage composition. It may differ from the column wash."
    },
    {
      "id": "wr-sheet-v1-42",
      "prompt": "Loose column fittings can cause leaks and pressure problems during a run.",
      "answer": true,
      "rightAction": "Secure the fittings as instructed. A loose connection can leak under pressure."
    },
    {
      "id": "wr-sheet-v1-43",
      "prompt": "The first injections can begin while the mobile phase for the run is still being mixed.",
      "answer": false,
      "rightAction": "Finish preparing the mobile phase before starting the run."
    },
    {
      "id": "wr-sheet-v1-44",
      "prompt": "If reserve liquid is allowed, use it to keep the pipette tip submerged while drawing.",
      "answer": true,
      "rightAction": "Use the allowed reserve volume and keep the tip below the liquid surface."
    },
    {
      "id": "wr-sheet-v1-45",
      "prompt": "A familiar membrane filter colour is enough to confirm its pore size.",
      "answer": false,
      "rightAction": "Read the filter specifications. Verify pore size and membrane material against the STP."
    },
    {
      "id": "wr-sheet-v1-46",
      "prompt": "Use the correct stopper before inverting a volumetric flask to mix its contents.",
      "answer": true,
      "rightAction": "The correct stopper keeps the flask covered and helps prevent spills during mixing."
    },
    {
      "id": "wr-sheet-v1-47",
      "prompt": "Unclear Standard and Sample labels can make it harder to trace results to the correct vial.",
      "answer": true,
      "rightAction": "Label each vial clearly and match its identity to the sequence."
    },
    {
      "id": "wr-sheet-v1-48",
      "prompt": "A filter with the correct pore size can be used without checking its membrane material.",
      "answer": false,
      "rightAction": "Confirm the membrane material too. It can affect how much sample passes through the filter."
    },
    {
      "id": "wr-sheet-v1-49",
      "prompt": "Replacing a solvent bottle is a good time to recheck which channel its line feeds.",
      "answer": true,
      "rightAction": "Trace the line to the correct bottle before starting the run."
    },
    {
      "id": "wr-sheet-v1-50",
      "prompt": "A blank injected after a sample can help reveal residue from the previous injection.",
      "answer": true,
      "rightAction": "A peak in the blank may point to carryover from the preceding injection."
    },
    {
      "id": "wr-sheet-v1-51",
      "prompt": "A vial with a smudged label can be loaded if you remember its position.",
      "answer": false,
      "rightAction": "Confirm the vial’s identity and make the label readable before loading it."
    },
    {
      "id": "wr-sheet-v1-52",
      "prompt": "After editing a sequence, check that the standard and sample positions still match the tray.",
      "answer": true,
      "rightAction": "Verify the programmed positions against the loaded vials before starting."
    },
    {
      "id": "wr-sheet-v1-53",
      "prompt": "A clean-looking reservoir is enough reason to skip scheduled suction filter cleaning.",
      "answer": false,
      "rightAction": "Follow the filter cleaning schedule. A clear reservoir does not confirm the filter is clean."
    },
    {
      "id": "wr-sheet-v1-54",
      "prompt": "If the pipette draws in air, it may take up less liquid than required.",
      "answer": true,
      "rightAction": "Keep the tip submerged and follow the procedure for repeating an incomplete transfer."
    },
    {
      "id": "wr-sheet-v1-55",
      "prompt": "After a small spill, you can continue pipetting if the remaining liquid covers the beaker bottom.",
      "answer": false,
      "rightAction": "Check that the liquid level keeps the pipette tip submerged throughout the draw."
    },
    {
      "id": "wr-sheet-v1-56",
      "prompt": "Confirm the identity of a prepared solvent before reconnecting it after a bottle swap.",
      "answer": true,
      "rightAction": "Read the bottle label and trace the line to the correct channel."
    },
    {
      "id": "wr-sheet-v1-57",
      "prompt": "The needle wash can replace the seal wash if both use the same liquid.",
      "answer": false,
      "rightAction": "Each wash serves a different part of the system. Complete both as required."
    },
    {
      "id": "wr-sheet-v1-58",
      "prompt": "Check the wash bottle label before connecting it to Channel C or Channel D.",
      "answer": true,
      "rightAction": "Match the bottle to the channel and verify its water and organic ratio against the STP."
    },
    {
      "id": "wr-sheet-v1-59",
      "prompt": "Transfer reagent to a clean beaker before pipetting the amount needed.",
      "answer": true,
      "rightAction": "Use a clean vial for the transfer to help protect the stock reagent from contamination."
    },
    {
      "id": "wr-sheet-v1-60",
      "prompt": "A clean pipette can draw reagent directly from the stock bottle for a single transfer.",
      "answer": false,
      "rightAction": "Pour the needed reagent into a clean vial first, then pipette from that vial."
    },
    {
      "id": "wr-sheet-v1-61",
      "prompt": "Measure each solvent separately before adding it to the buffer mixing container.",
      "answer": true,
      "rightAction": "Measure each solvent on its own, then combine the measured amounts."
    },
    {
      "id": "wr-sheet-v1-62",
      "prompt": "Grinding with a mortar and pestle near an analytical balance can make the reading unstable.",
      "answer": true,
      "rightAction": "Grind away from the balance. Vibrations can make the reading fluctuate."
    },
    {
      "id": "wr-sheet-v1-63",
      "prompt": "A closed balance door makes it safe to run a motorized pestle nearby while weighing.",
      "answer": false,
      "rightAction": "A closed door reduces drafts. Keep motorized grinding away to avoid vibrations."
    },
    {
      "id": "wr-sheet-v1-64",
      "prompt": "Follow the approved procedure to decide whether moisture-loaded silica should be dried or replaced.",
      "answer": true,
      "rightAction": "Check the procedure for the silica in use and follow its drying or replacement instructions."
    },
    {
      "id": "wr-sheet-v1-65",
      "prompt": "Moisture-loaded silica can go back into use after oven drying, even without checking the procedure.",
      "answer": false,
      "rightAction": "Check whether drying is allowed and follow the approved conditions before reuse."
    },
    {
      "id": "wr-sheet-v1-66",
      "prompt": "When the method requires room temperature, let the heated sample cool before using it.",
      "answer": true,
      "rightAction": "Wait until the sample reaches the temperature required by the method."
    },
    {
      "id": "wr-sheet-v1-67",
      "prompt": "A heated sample that looks clear can be used before it reaches the method’s required temperature.",
      "answer": false,
      "rightAction": "Clarity cannot confirm temperature. Let the sample reach the temperature required by the method."
    },
    {
      "id": "wr-sheet-v1-68",
      "prompt": "Collect dissolution samples at the time point which is specified in the method.",
      "answer": true,
      "rightAction": "Use the specified sampling times so each result corresponds to the correct time point."
    },
    {
      "id": "wr-sheet-v1-69",
      "prompt": "Nearby dissolution time points can be combined into one collection if the test is running normally.",
      "answer": false,
      "rightAction": "Collect each sample at its specified time point, even when the times are close together."
    },
    {
      "id": "wr-sheet-v1-70",
      "prompt": "Check that the inlet filter is submerged in mobile phase before starting the run.",
      "answer": true,
      "rightAction": "Keep the inlet filter below the liquid surface so the line can draw mobile phase."
    },
    {
      "id": "wr-sheet-v1-71",
      "prompt": "Mobile phase left in the bottle is enough, even if the inlet filter sits above it.",
      "answer": false,
      "rightAction": "Check the filter position. It must sit below the liquid surface to draw mobile phase."
    },
    {
      "id": "wr-sheet-v1-72",
      "prompt": "Check the column manufacturer’s flushing instructions before using the column.",
      "answer": true,
      "rightAction": "Follow the approved flushing procedure for the column you are about to use."
    },
    {
      "id": "wr-sheet-v1-73",
      "prompt": "A new column can use the previous column’s flush settings if both have the same dimensions.",
      "answer": false,
      "rightAction": "Check the flushing instructions for the new column before using the previous settings."
    },
    {
      "id": "wr-sheet-v1-74",
      "prompt": "Check whether the sequence is paused or running before proceeding with the next injection.",
      "answer": true,
      "rightAction": "Confirm the sequence status in the software before proceeding with the next injection."
    },
    {
      "id": "wr-sheet-v1-75",
      "prompt": "If the next sample appears in the sequence, you can proceed without checking its status.",
      "answer": false,
      "rightAction": "A listed sample can still be waiting in a paused sequence. Check the status first."
    },
    {
      "id": "wr-sheet-v1-76",
      "prompt": "The HPLC mobile phase should be degassed before every run, as per the approved method.",
      "answer": true,
      "rightAction": "Degassing removes air bubbles, ensuring stable solvent flow and reliable detector readings."
    },
    {
      "id": "wr-sheet-v1-77",
      "prompt": "The HPLC pump should be purged after changing the solvent bottle.",
      "answer": true,
      "rightAction": "Purging removes trapped air and residual solvent, ensuring consistent solvent delivery."
    },
    {
      "id": "wr-sheet-v1-78",
      "prompt": "Buffer can be left inside the HPLC column overnight without special precautions.",
      "answer": false,
      "rightAction": "Flush the column using the recommended solvent before storage, following manufacturer instructions."
    },
    {
      "id": "wr-sheet-v1-79",
      "prompt": "Filtered tap water can replace HPLC-grade water during mobile phase preparation.",
      "answer": false,
      "rightAction": "Use HPLC-grade water to prevent impurities from affecting analysis and system performance."
    },
    {
      "id": "wr-sheet-v1-80",
      "prompt": "Old HPLC mobile phase can be topped up with a freshly prepared batch.",
      "answer": false,
      "rightAction": "Prepare fresh mobile phase instead of mixing old solutions with new batches."
    },
    {
      "id": "wr-sheet-v1-81",
      "prompt": "HPLC system suitability testing can be performed after completing sample analysis.",
      "answer": false,
      "rightAction": "Perform system suitability testing before sample analysis to verify system performance."
    },
    {
      "id": "wr-sheet-v1-82",
      "prompt": "The HPLC column must be equilibrated before the first sample injection.",
      "answer": true,
      "rightAction": "Equilibration stabilises the column, ensuring consistent retention times and separation."
    },
    {
      "id": "wr-sheet-v1-83",
      "prompt": "HPLC column oven temperature has no effect on retention time.",
      "answer": false,
      "rightAction": "Column temperature can influence retention time and chromatographic separation."
    },
    {
      "id": "wr-sheet-v1-84",
      "prompt": "Baseline drift during HPLC analysis is normal and never requires investigation.",
      "answer": false,
      "rightAction": "Investigate baseline drift to identify possible mobile phase, detector or system issues."
    },
    {
      "id": "wr-sheet-v1-85",
      "prompt": "The audit trail must remain enabled in the chromatography data system (CDS).",
      "answer": true,
      "rightAction": "Audit trails record system changes, ensuring data integrity and traceability."
    },
    {
      "id": "wr-sheet-v1-86",
      "prompt": "Do the weekly HPLC wash even if you used the machine only once this week.",
      "answer": true,
      "rightAction": "Follow the weekly wash schedule, even when the machine is rarely used."
    },
    {
      "id": "wr-sheet-v1-87",
      "prompt": "You can skip the weekly HPLC wash if you washed the needle every day.",
      "answer": false,
      "rightAction": "The needle wash cleans only the needle area. The system still needs its weekly wash."
    }
  ],
  "timings": {
    "enter": 450,
    "fastFinish": 650,
    "celebrationScale": 0.55,
    "correct": 3410,
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
    "page-2/demo-1-v1.gif",
    "page-2/demo-2-v1.gif",
    "page-2/demo-3-v1.gif",
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
