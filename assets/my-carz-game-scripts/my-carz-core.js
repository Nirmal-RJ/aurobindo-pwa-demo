(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./my-carz-config.js') : root.CarzConfig);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CarzCore = api;
})(globalThis, config => {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  const DAY = 86400000, IST = 19800000;
  const dayKey = time => new Date(time + IST).toISOString().slice(0, 10);
  const nextMidnight = time => Math.floor((time + IST) / DAY) * DAY + DAY - IST;
  const lanes = random => random() < .5 ? ['Good', 'Bad'] : ['Bad', 'Good'];
  const stats = () => ({ answered: 0, correct: 0, wrong: 0, levels: 0, bestStreak: 0, plays: 0, history: [] });
  function freshDay(time, random = Math.random) {
    return { date: dayKey(time), unlocked: 1, selected: 0, level: 1, colors: config.cars.map(() => 'original'),
      lanes: lanes(random), exposure: {}, recent: [], stats: stats() };
  }
  function freshProfile(time, random) {
    return { version: 2, device: { demoDone: false, opened: false }, day: freshDay(time, random),
      preferences: {carColors:Object.fromEntries(config.cars.map(car=>[car.id,'original']))},
      lifetime: { plays: 0, daysPlayed: [], archives: [] } };
  }
  function normalize(input, time, random) {
    if (!input || input.version !== 2 || !input.day || !input.device || !input.lifetime) return freshProfile(time, random);
    const profile = copy(input), d = profile.day;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !Array.isArray(d.colors) || !d.stats || !Array.isArray(d.stats.history) ||
      !Array.isArray(profile.lifetime.archives) || !Array.isArray(profile.lifetime.daysPlayed)) return freshProfile(time, random);
    d.unlocked = Math.max(1, Math.min(config.cars.length, Math.trunc(Number(d.unlocked)) || 1));
    d.level = d.unlocked;
    d.selected = Math.max(0, Math.min(d.unlocked - 1, Math.trunc(Number(d.selected)) || 0));
    d.colors = config.cars.map((_, i) => config.colors.some(c => c[0] === d.colors[i]) ? d.colors[i] : 'original');
    const stored=profile.preferences?.carColors||{};
    const carColors=Object.fromEntries(config.cars.map((car,i)=>[car.id,
      config.colors.some(c=>c[0]===stored[car.id])?stored[car.id]:d.colors[i]]));
    profile.preferences={...profile.preferences,carColors};
    d.colors=config.cars.map(car=>carColors[car.id]);
    if (!Array.isArray(d.lanes) || [...d.lanes].sort().join() !== 'Bad,Good') d.lanes = lanes(random);
    d.exposure = d.exposure && typeof d.exposure === 'object' ? d.exposure : {};
    d.recent = Array.isArray(d.recent) ? d.recent : [];
    d.stats = { ...stats(), ...d.stats };
    return profile;
  }
  // Least-seen questions get priority. Recent/attempt exclusions avoid immediate repeats,
  // while exposure counts guarantee full-bank coverage rather than random starvation.
  class QuestionPicker {
    constructor(bank, exposure = {}, recent = [], random = Math.random) {
      if (bank.length < config.streakSize || new Set(bank.map(q => q.id)).size !== bank.length ||
        bank.some(q => !q.id || !q.prompt || !['Good', 'Bad'].includes(q.answer))) throw new Error('Question bank requires at least five unique Good/Bad questions.');
      this.bank = bank; this.exposure = { ...exposure }; this.recent = [...recent]; this.random = random;
    }
    next(attempt = []) {
      let available = this.bank.filter(q => !attempt.includes(q.id));
      if (!available.length) available = this.bank;
      const least = Math.min(...available.map(q => Number(this.exposure[q.id]) || 0));
      available = available.filter(q => (Number(this.exposure[q.id]) || 0) === least);
      const fresh = available.filter(q => !this.recent.slice(-4).includes(q.id));
      if (fresh.length) available = fresh;
      const question = available[Math.min(available.length - 1, Math.floor(this.random() * available.length))];
      this.exposure[question.id] = (Number(this.exposure[question.id]) || 0) + 1;
      this.recent.push(question.id); this.recent = this.recent.slice(-5);
      return question;
    }
  }
  class Game {
    constructor(saved, { now = Date.now, random = Math.random, bank = config.questions } = {}) {
      this.now = now; this.random = random; this.bank = bank;
      this.profile = normalize(saved, now(), random); this.committed = copy(this.profile.day);
      this.active = false; this.pendingReset = false; this.resetAttempt(); this.resetPicker(); this.checkDay();
    }
    get day() { return this.profile.day; }
    get freePlay() { return this.day.unlocked === config.cars.length; }
    get travelSeconds() { return config.travelSeconds / (1 + (this.day.level - 1) * config.speedStep); }
    resetPicker() { this.picker = new QuestionPicker(this.bank, this.day.exposure, this.day.recent, this.random); }
    resetAttempt() { this.streak = 0; this.attempt = []; this.question = null; this.resolved = true; }
    open() {
      const returning = !!this.profile.device.opened;
      this.profile.device.opened = true;
      return returning;
    }
    begin({ countPlay = true } = {}) {
      this.checkDay(); this.active = true; this.resetAttempt();
      if (countPlay) {
        this.day.stats.plays++; this.committed.stats.plays = this.day.stats.plays; this.profile.lifetime.plays++;
      }
      if (!this.profile.lifetime.daysPlayed.includes(this.day.date)) this.profile.lifetime.daysPlayed.push(this.day.date);
    }
    next() {
      if (!this.active) throw new Error('Start a drive first.');
      if (!this.resolved) return this.question;
      this.question = this.picker.next(this.attempt); this.attempt.push(this.question.id); this.resolved = false;
      return this.question;
    }
    answer(lane) {
      if (this.resolved || !this.question || ![0, 1].includes(lane)) return null;
      this.resolved = true;
      const correct = this.day.lanes[lane] === this.question.answer;
      const s = this.day.stats;
      s.answered++; s[correct ? 'correct' : 'wrong']++;
      this.streak = correct ? this.streak + 1 : 0;
      s.bestStreak = Math.max(s.bestStreak, this.streak);
      s.history.push({ id: this.question.id, answer: this.day.lanes[lane], correct, level: this.day.level, at: this.now() });
      if (!correct) this.attempt = [];
      return { correct, complete: this.streak === config.streakSize, answer: this.question.answer };
    }
    complete() {
      if (this.streak !== config.streakSize || !this.resolved) throw new Error('Five consecutive correct answers required.');
      const unlocked = this.freePlay ? null : this.day.unlocked;
      this.day.stats.levels++;
      if (unlocked !== null) { this.day.unlocked++; this.day.level = this.day.unlocked; this.day.selected = unlocked; this.day.lanes = lanes(this.random); }
      this.day.exposure = { ...this.picker.exposure }; this.day.recent = [...this.picker.recent];
      this.committed = copy(this.day); this.active = false; this.resetAttempt();
      return { unlocked, allCars: unlocked === config.cars.length - 1 };
    }
    checkpoint() {
      this.rememberPaint();
      const snapshot = copy(this.profile);
      // Never persist partial attempts, even when saving preferences/device metadata.
      snapshot.day = copy(this.committed);
      snapshot.day.selected = this.day.selected; snapshot.day.colors = [...this.day.colors];
      return snapshot;
    }
    discard() {
      const { selected, colors } = this.day;
      this.profile.day = copy(this.committed); this.day.selected = selected; this.day.colors = [...colors];
      this.active = false; this.resetAttempt(); this.resetPicker();
    }
    select(index) {
      if (!Number.isInteger(index) || index < 0 || index >= this.day.unlocked) return false;
      this.day.selected = index; return true;
    }
    paint(color) {
      if (!config.colors.some(c => c[0] === color)) return false;
      this.day.colors[this.day.selected] = color; this.rememberPaint(); return true;
    }
    rememberPaint() {
      this.profile.preferences={...this.profile.preferences,carColors:Object.fromEntries(config.cars.map((car,i)=>[car.id,this.day.colors[i]]))};
    }
    checkDay() {
      if (dayKey(this.now()) === this.day.date) return false;
      if (this.active) { this.pendingReset = true; return false; }
      const archived = copy(this.committed);
      archived.selected = this.day.selected; archived.colors = [...this.day.colors];
      this.profile.lifetime.archives.push(archived);
      this.rememberPaint();
      this.profile.day = freshDay(this.now(), this.random);
      this.day.colors=config.cars.map(car=>this.profile.preferences.carColors[car.id]||'original');
      this.committed = copy(this.day);
      this.pendingReset = false; this.resetAttempt(); this.resetPicker(); return true;
    }
  }
  return { Game, QuestionPicker, freshProfile, dayKey, nextMidnight, copy };
});
