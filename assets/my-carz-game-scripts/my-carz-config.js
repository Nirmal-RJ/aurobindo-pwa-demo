(function (root, factory) {
  const config = factory();
  if (typeof module === 'object' && module.exports) module.exports = config;
  else root.CarzConfig = config;
})(globalThis, () => {
  const files = ['1-fiat-default', '2-ambassador-white', '3-maruti-white', '4-honda-white', '5-benz-white', '6-ferrari-white'];
  return {
    streakSize: 5, readingSeconds: 2, travelSeconds: 3.8, speedStep: .06,
    // Temporary names/artwork. Replace these records when production car frames arrive.
    cars: Array.from({ length: 9 }, (_, i) => ({ id: `car-${i + 1}`, name: `Car-${i + 1}`,
      driving: `inherited/${files[i % files.length]}.webp`,
      preview: `inherited/cars-iso-view/${files[i % files.length]}-front-view.webp`,
      frames: [] })),
    colors: [['original', 'Original', '#eee9d8'], ['red', 'Ruby', '#cc3045'], ['blue', 'Ocean', '#287cce'],
      ['green', 'Emerald', '#299969'], ['gold', 'Gold', '#dfa62f'], ['purple', 'Purple', '#854dce'],
      ['orange', 'Orange', '#ed782c'], ['pink', 'Pink', '#e85ba1'], ['teal', 'Teal', '#24b7b0'],
      ['silver', 'Silver', '#b8c3d0'], ['black', 'Black', '#343b48']],
    // Initial bank retains the inherited scenarios; former Ugly actions are Bad in this two-option game.
    questions: [
      ['pre-assumption', 'Pre-assumption of sample reading', 'Bad'],
      ['ppe', 'Not wearing the required PPE', 'Bad'],
      ['butter-paper', 'Reusage of butter paper', 'Bad'],
      ['dry-flask', 'Usage of dried flask when adding samples', 'Good'],
      ['excess-sample', 'Excess sample from gross weight can be discarded', 'Good'],
      ['vial-fill', 'Vial can be filled as preferred', 'Bad'],
      ['expiry', 'Check expiry dates of the standards/solvents', 'Good'],
      ['vial-order', 'Place the vials in the tray in any order you prefer', 'Bad'],
      ['solvent-batch', 'Usage of solvent from the same batch/lot throughout the analysis', 'Good'],
      ['flask-label', 'Ignore the flask labeling', 'Bad']
    ].map(([id, prompt, answer]) => ({ id, prompt, answer })),
    demos: [1, 2, 3, 4].map(i => `page-2-${i}/demo-page-2-${i}.webp`),
    // Populate with supplied GIF URLs. The four demo images are temporary help slides.
    helpSlides: [],
    sounds: { click: ['audio/gbu-button-click-sfx.mp3', .25], countdown: ['audio/gbu-countdown-audio.wav', .5],
      correct: ['audio/lanerush-correct.mp3', .6], wrong: ['audio/lanerush-wrong.mp3', .6], music: ['audio/lanerush-bgm.mp3', .35] }
  };
});
