(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RocketGame = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';
  const chemicals = ['Water', 'ACN', 'MeOH'];
  // Recipes and pourSize algorithm match liquid-sort.js.
  const recipes = [
    { name: 'Column Cleaning', mix: { Water: 90, ACN: 5, MeOH: 5 }, video: 'assets/rocket-game-assets/cleaning-solution-videos/column-cleaning.mp4' },
    { name: 'Strong Wash Solvent', mix: { Water: 20, ACN: 80, MeOH: 0 }, video: 'assets/rocket-game-assets/cleaning-solution-videos/strong-wash.mp4' },
    { name: 'Needle Wash Solvent', mix: { Water: 50, ACN: 0, MeOH: 50 }, video: 'assets/rocket-game-assets/cleaning-solution-videos/needle-wash.mp4' },
    { name: 'Column Storage (C18)', mix: { Water: 30, ACN: 70, MeOH: 0 }, video: 'assets/rocket-game-assets/cleaning-solution-videos/column-storage.mp4' }
  ];
  const planets = ['Earth', 'Venus', 'Mars', 'Mercury', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  const missions = [
    [25800000, 7000000, 4, 1, 40], [74400000, 16000000, 5, 1, 36],
    [105600000, 20000000, 5, 1, 32], [447800000, 70000000, 6, 1, 28],
    [407000000, 70000000, 6, 2, 24], [893200000, 120000000, 7, 2, 20],
    [1009000000, 140000000, 7, 2, 16]
  ].map(([distance, speed, rockets, stars, seconds], i) => ({ id: i, origin: planets[i], destination: planets[i + 1], distance, speed, rockets, stars, seconds }));
  const empty = () => ({ Water: 0, ACN: 0, MeOH: 0 });
  const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const iso = () => new Date().toISOString();
  const increment = (recipe, chemical) => {
    const target = recipe.mix[chemical];
    return target ? [35, 30, 25, 20, 15, 10, 5].find(n => n <= target / 2 && target % n === 0) || 5 : 10;
  };
  function bag(last, random = Math.random) {
    const result = recipes.map((_, i) => i);
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    if (result[0] === last) [result[0], result[1]] = [result[1], result[0]];
    return result;
  }
  class Game {
    constructor(saved, now = () => performance.now(), random = Math.random) {
      this.now = now; this.random = random;
      this.data = saved?.schemaVersion === 1 && Array.isArray(saved.runs) && Array.isArray(saved.completed)
        && Number.isInteger(saved.unlocked) && saved.unlocked >= 0 && saved.unlocked < 7
        ? saved : { schemaVersion: 1, playerId: id(), unlocked: 0, completed: [], runs: [] };
      this.data.runs.filter(run => run.status === 'active').forEach(run => {
        run.status = 'interrupted'; run.endedAt = iso();
        run.questions.forEach(q => q.attempts.filter(a => a.outcome === 'active').forEach(a => {
          a.outcome = 'interrupted'; a.endedAt = iso(); a.elapsedSeconds = a.lastElapsedSeconds || 0;
        }));
      });
      this.phase = 'intro';
    }
    get mission() { return missions[this.run?.missionId ?? this.data.unlocked]; }
    get recipe() { return recipes[this.question.recipeId]; }
    get total() { return chemicals.reduce((sum, c) => sum + this.mixture[c], 0); }
    get elapsed() { return Math.min(this.mission.seconds, Math.max(0, (this.now() - this.started) / 1000)); }
    get remaining() { return Math.max(0, this.mission.seconds - this.elapsed); }
    startMission() {
      this.run = { id: id(), missionId: this.data.unlocked, config: { ...missions[this.data.unlocked] }, startedAt: iso(), status: 'active', engines: 3, distance: 0, inputSeconds: 0, questions: [], events: [] };
      this.data.runs.push(this.run); this.queue = []; this.last = undefined;
      this.nextQuestion();
    }
    nextQuestion() {
      if (!this.queue.length) this.queue = bag(this.last, this.random);
      const recipeId = this.queue.shift(); this.last = recipeId;
      this.question = { id: id(), recipeId, name: recipes[recipeId].name, target: { ...recipes[recipeId].mix }, attempts: [] };
      this.run.questions.push(this.question); this.phase = 'select'; this.mixture = empty();
    }
    selectRocket(rocket) {
      if (this.phase !== 'select' || !Number.isInteger(rocket) || rocket < 1 || rocket > 5) return false;
      this.rocket = rocket; this.phase = 'preparing';
      this.run.events.push({ type: 'rocket-selected', rocket, at: iso(), questionId: this.question.id });
      return true;
    }
    beginAttempt() {
      if (!['preparing', 'retry'].includes(this.phase)) return false;
      this.mixture = empty(); this.started = this.now(); this.phase = 'fill';
      this.attempt = { id: id(), startedAt: iso(), rocket: this.rocket, limitSeconds: this.mission.seconds, enginesBefore: this.run.engines, outcome: 'active', events: [], mixture: empty() };
      this.question.attempts.push(this.attempt); return true;
    }
    change(chemical, undo = false) {
      if (this.phase !== 'fill' || !chemicals.includes(chemical)) return false;
      if (this.remaining <= 0) { this.submit(true); return false; }
      const step = increment(this.recipe, chemical);
      const amount = undo ? -Math.min(step, this.mixture[chemical]) : Math.min(step, 100 - this.total);
      if (!amount) return false;
      this.mixture[chemical] += amount;
      this.attempt.mixture = { ...this.mixture };
      this.attempt.events.push({ type: undo ? 'undo' : 'fill', chemical, increment: step, amount, elapsedSeconds: this.elapsed, at: iso(), mixture: { ...this.mixture } });
      this.attempt.lastElapsedSeconds = this.elapsed;
      return true;
    }
    submit(timeout = false) {
      if (this.phase !== 'fill') return null;
      timeout = timeout || this.remaining <= 0;
      if (!timeout && this.total !== 100) return null;
      const elapsed = timeout ? this.mission.seconds : this.elapsed;
      const correct = !timeout && chemicals.every(c => this.mixture[c] === this.recipe.mix[c]);
      const saved = correct ? Math.max(0, this.mission.seconds - elapsed) : 0;
      if (!correct) this.run.engines--;
      const factor = [0, .34, .67, 1][this.run.engines];
      const speed = this.mission.speed * factor;
      const calculated = correct ? speed * (1 + saved / 100) : 0;
      const distance = Math.min(calculated, this.mission.distance - this.run.distance);
      this.run.distance += distance; this.run.inputSeconds += elapsed;
      Object.assign(this.attempt, { endedAt: iso(), outcome: timeout ? 'timeout' : correct ? 'correct' : 'incorrect', elapsedSeconds: elapsed, remainingSeconds: Math.max(0, this.mission.seconds - elapsed), timeSaved: saved, bonusPercent: saved, mixture: { ...this.mixture }, enginesAfter: this.run.engines, engineFactor: factor, speed, calculatedDistance: calculated, appliedDistance: distance, cumulativeDistance: this.run.distance });
      if (!this.run.engines) {
        this.phase = 'failed'; this.run.status = 'failed'; this.run.endedAt = iso();
      } else if (correct) {
        this.phase = 'journey';
        if (this.run.distance >= this.mission.distance) {
          this.run.status = 'completed'; this.run.endedAt = iso();
          const firstCompletion = !this.data.completed.includes(this.mission.id);
          if (firstCompletion) this.data.completed.push(this.mission.id);
          this.run.awardedStars = firstCompletion ? this.mission.stars : 0;
          this.data.unlocked = Math.min(6, Math.max(this.data.unlocked, this.mission.id + 1));
          this.run.unlockedMissionId = this.data.unlocked;
        }
      } else this.phase = 'failure';
      return this.attempt;
    }
    retry() {
      if (this.phase !== 'failure') return false;
      this.phase = 'retry'; return this.beginAttempt();
    }
    get stars() { return this.data.completed.reduce((sum, i) => sum + missions[i].stars, 0); }
  }
  return { Game, missions, recipes, chemicals, increment, bag };
});
