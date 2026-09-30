'use strict';

// The round owns its deadline and accepts each pair only once, including during animation.
class PillRound {
  constructor(now = 0) {
    this.started = now;
    this.deadline = now + 45000;
    this.matched = new Set();
    this.mistakes = 0;
    this.maxMistakes = 3;
    this.ended = false;
    this.elapsed = 0;
    this.userConnections = new Map();
  }
  tick(now) {
    if (!this.ended) {
      this.elapsed = Math.min(45000, Math.max(0, now - this.started));
      if (now >= this.deadline) this.ended = true;
    }
    return Math.max(0, 45000 - this.elapsed);
  }
  attempt(a, b, now) {
    this.tick(now);
    if (this.ended) return 'ended';
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a > 9 || b > 9 || a === b || this.matched.has(a >> 1) || this.matched.has(b >> 1)) return 'ignored';
    if ((a >> 1) !== (b >> 1)) {
      this.mistakes++;
      const aIsParam = a % 2 === 0;
      const bIsParam = b % 2 === 0;
      if (aIsParam !== bIsParam) {
        const param = (aIsParam ? a : b) >> 1;
        const meaning = (aIsParam ? b : a) >> 1;
        this.userConnections.set(param, meaning);
      }
      if (this.mistakes >= this.maxMistakes) this.ended = true;
      return 'wrong';
    }
    const pairIndex = a >> 1;
    this.matched.add(pairIndex);
    this.userConnections.set(pairIndex, pairIndex);
    if (this.matched.size === 5) this.ended = true;
    return 'matched';
  }
}
if (typeof module !== 'undefined' && module.exports) module.exports = { PillRound };

if (typeof document !== 'undefined') (() => {
  const $ = id => document.getElementById(id);
  const copy = {
    en: {
      edition: 'GAME 03 · SST CONNECTIONS', back: '← Games', footer: 'A little practice. A lasting connection.',
      off: 'Off', on: 'On', sound: 'Sound', introTag: 'SMALL PILLS. BIG CONNECTIONS.', title: 'Two halves.<br><em>One match.</em>',
      intro: 'Each pill is broken into two halves — one has an SST parameter, and the other has its meaning. Drag the halves together to complete the pill and learn the connection.',
      watch: 'Watch', practice: 'Practice', play: 'Play', begin: 'Show me how', demo: 'WATCH THE CONNECTION', prompt: 'Join the halves to discover the meaning.',
      watching: 'Watch the two halves come together.', replay: 'Replay demo', try: 'Try it yourself', practiceTag: 'GUIDED PRACTICE',
      pair: 'Pill {n} of 5', helper: 'Drag either half onto the other. You can also tap both halves.', next: 'Next Pill', matched: 'Matched!',
      praise: ['Beautiful match!', 'You’ve got it!', 'Great connection!', 'Nicely done!', 'Pill perfect!'],
      all: 'All five joined!', allText: 'Ready to put your memory to the test?', ready: 'YOUR NEXT CHALLENGE', readyTitle: 'Five pills.<br><em>Beat the clock!</em>',
      readyText: 'Match each SST parameter with its meaning. Drag the correct halves together to complete all five pills as quickly as you can. You have 3 lives!',
      pills: 'pills', seconds: 'seconds', halves: 'halves', lives: 'Lives', start: 'Start Game', gameTag: 'PILL PERFECT · MEMORY CHALLENGE',
      gamePrompt: 'Match the halves. Make them whole!', left: 'seconds left', joined: 'joined', mistakes: 'Incorrect attempts',
      parameter: 'SST parameter', meaning: 'Meaning', tray: 'YOUR COMPLETED PILLS', pick: 'Find a connection. Bring the halves together.',
      selected: 'Now choose its matching half.', wrong: 'Not quite — try another half.', complete: 'Five pills. Perfectly connected!', expired: 'Time’s up — keep the connections!',
      outOfLives: 'Out of lives!', gameOver: 'You used all 3 lives. Review the correct connections below and try again!',
      resultTag: 'YOUR CONNECTION REPORT', winText: 'You brought every pair together. That’s knowledge worth keeping.', loseText: 'Every connection is progress. Review the meanings below and give it another go.',
      time: 'Time taken', correct: 'Correct pairs', answers: 'The five connections', found: 'Joined correctly', missed: 'Keep this connection in mind', again: 'Learn & play again', games: 'Back to Games', unit: 's',
      userPill: 'Your connection', correctPill: 'Correct pill', matchedBadge: 'Matched', mismatchedBadge: 'Mismatched', unmatchedBadge: 'Not joined',
      watchTag: 'WATCH & LEARN', watchTitle: 'Watch What To Do', watchDesc: 'Sit back and watch the demo. See how matching halves connect!',
      continueBtn: 'Continue',
      names: ['%RSD', 'Resolution', 'Tailing Factor', 'Plate Count', 'Retention Time'], meanings: ['Precision', 'Peak Separation', 'Peak Symmetry', 'Column Efficiency', 'Peak Identification'],
      explanations: ['%RSD tells you how consistent repeated results are.', 'Resolution tells you how well two peaks are separated.', 'Tailing Factor describes how symmetrical a peak is.', 'Plate Count indicates how efficiently the column separates compounds.', 'Retention Time helps identify a peak by when it appears.']
    },
    hi: {
      edition: 'गेम 03 · SST के संबंध', back: '← गेम्स', footer: 'थोड़ा अभ्यास। लंबे समय तक याद रहने वाला संबंध।',
      off: 'बंद', on: 'चालू', sound: 'ध्वनि', introTag: 'छोटी गोलियाँ। गहरे संबंध।', title: 'दो हिस्से।<br><em>एक जोड़ी।</em>',
      intro: 'हर कैप्सूल के दो हिस्से हैं — एक पर SST पैरामीटर है और दूसरे पर उसका अर्थ। दोनों हिस्सों को खींचकर जोड़ें, कैप्सूल पूरा करें और उनका संबंध सीखें।',
      watch: 'देखें', practice: 'अभ्यास करें', play: 'खेलें', begin: 'कैसे खेलें, दिखाएँ', demo: 'जुड़ते हुए देखें', prompt: 'हिस्सों को जोड़ें और अर्थ जानें।',
      watching: 'देखें, दोनों हिस्से कैसे एक साथ जुड़ते हैं।', replay: 'फिर से देखें', try: 'खुद करके देखें', practiceTag: 'सीखें और अभ्यास करें',
      pair: 'कैप्सूल {n} / 5', helper: 'किसी भी हिस्से को दूसरे पर खींचें। आप दोनों हिस्सों पर बारी-बारी टैप भी कर सकते हैं।', next: 'अगला कैप्सूल', matched: 'सही जोड़ी!',
      praise: ['शानदार जोड़ी!', 'बिल्कुल सही!', 'बहुत अच्छा!', 'शाबाश!', 'सभी सही जुड़े!'],
      all: 'पाँचों जुड़ गए!', allText: 'अब अपनी याददाश्त परखने के लिए तैयार हैं?', ready: 'आपकी अगली चुनौती', readyTitle: 'पाँच कैप्सूल।<br><em>समय से पहले जोड़ें!</em>',
      readyText: 'हर SST पैरामीटर को उसके अर्थ से मिलाएँ। सही हिस्सों को खींचकर जोड़ें और जितनी जल्दी हो सके पाँचों कैप्सूल पूरे करें। आपके पास 3 जीवन हैं!',
      pills: 'कैप्सूल', seconds: 'सेकंड', halves: 'हिस्से', lives: 'जीवन', start: 'खेल शुरू करें', gameTag: 'पिल परफेक्ट · याददाश्त की चुनौती',
      gamePrompt: 'हिस्सों को मिलाएँ। कैप्सूल पूरा बनाएँ!', left: 'सेकंड शेष', joined: 'जुड़े', mistakes: 'गलत प्रयास',
      parameter: 'SST पैरामीटर', meaning: 'अर्थ', tray: 'आपके पूरे कैप्सूल', pick: 'सही संबंध खोजें। दोनों हिस्सों को जोड़ें।',
      selected: 'अब इसका सही दूसरा हिस्सा चुनें।', wrong: 'यह सही जोड़ी नहीं है — कोई दूसरा हिस्सा आज़माएँ।', complete: 'पाँच कैप्सूल। सभी सही जुड़े!', expired: 'समय समाप्त — संबंध याद रखें!',
      outOfLives: 'सभी जीवन समाप्त!', gameOver: 'आपने तीनों जीवन उपयोग कर लिए। नीचे सही संबंध देखें और पुनः प्रयास करें!',
      resultTag: 'आपके परिणाम', winText: 'आपने हर जोड़ी सही मिलाई। इन संबंधों को याद रखें।', loseText: 'हर सही संबंध एक कदम आगे है। नीचे अर्थ दोहराएँ और फिर कोशिश करें।',
      time: 'लगा समय', correct: 'सही जोड़ियाँ', answers: 'पाँचों संबंध', found: 'सही जोड़ा', missed: 'यह संबंध याद रखें', again: 'फिर सीखें और खेलें', games: 'गेम्स पर वापस जाएँ', unit: 'सेकंड',
      userPill: 'आपकी जोड़ी', correctPill: 'सही कैप्सूल', matchedBadge: 'सही जुड़ा', mismatchedBadge: 'गलत जोड़ी', unmatchedBadge: 'नहीं जोड़ा',
      watchTag: 'देखें और सीखें', watchTitle: 'देखें क्या करना है', watchDesc: 'आराम से देखें कि दोनों हिस्से कैसे जुड़ते हैं। इसके बाद आपको अभ्यास का मौका मिलेगा!',
      continueBtn: 'आगे बढ़ें',
      names: ['%RSD', 'रिज़ॉल्यूशन', 'टेलिंग फैक्टर', 'प्लेट काउंट', 'रिटेंशन टाइम'], meanings: ['परिशुद्धता', 'पीक पृथक्करण', 'पीक सममिति', 'कॉलम दक्षता', 'पीक की पहचान'],
      explanations: ['%RSD बताता है कि बार-बार प्राप्त परिणाम कितने एक जैसे हैं।', 'रिज़ॉल्यूशन बताता है कि दो पीक कितनी अच्छी तरह अलग हुए हैं।', 'टेलिंग फैक्टर बताता है कि पीक कितना सममित है।', 'प्लेट काउंट बताता है कि कॉलम यौगिकों को कितनी कुशलता से अलग करता है।', 'रिटेंशन टाइम किसी पीक के दिखाई देने के समय से उसकी पहचान करने में मदद करता है।']
    },
    te: {
      edition: 'గేమ్ 03 · SST సంబంధాలు', back: '← ఆటలు', footer: 'కొద్దిపాటి సాధన. ఎప్పటికీ గుర్తుండే సంబంధం.',
      off: 'ఆఫ్', on: 'ఆన్', sound: 'శబ్దం', introTag: 'చిన్న క్యాప్సూల్స్. ముఖ్యమైన సంబంధాలు.', title: 'రెండు భాగాలు.<br><em>ఒక జత.</em>',
      intro: 'ప్రతి క్యాప్సూల్ రెండు భాగాలుగా ఉంటుంది — ఒక భాగంపై SST పరామితి, మరో భాగంపై దాని అర్థం ఉంటాయి. భాగాలను దగ్గరకు లాగి జత చేయండి. క్యాప్సూల్‌ను పూర్తి చేసి వాటి సంబంధాన్ని నేర్చుకోండి.',
      watch: 'చూడండి', practice: 'సాధన', play: 'ఆడండి', begin: 'ఎలా ఆడాలో చూపించండి', demo: 'భాగాలు ఎలా కలుస్తాయో చూడండి', prompt: 'భాగాలను కలిపి అర్థాన్ని తెలుసుకోండి.',
      watching: 'రెండు భాగాలు ఎలా కలుస్తాయో చూడండి.', replay: 'మళ్లీ చూడండి', try: 'మీరే ప్రయత్నించండి', practiceTag: 'నేర్చుకుంటూ సాధన చేయండి',
      pair: 'క్యాప్సూల్ {n} / 5', helper: 'ఏ భాగాన్నైనా మరో భాగంపైకి లాగండి. లేదా రెండు భాగాలను వరుసగా ట్యాప్ చేయండి.', next: 'తదుపరి క్యాప్సూల్', matched: 'సరైన జత!',
      praise: ['చక్కగా కలిపారు!', 'సరిగ్గా చేశారు!', 'అద్భుతమైన జత!', 'చాలా బాగా చేశారు!', 'అన్నీ సరిగ్గా కలిపారు!'],
      all: 'ఐదూ కలిశాయి!', allText: 'మీ జ్ఞాపకశక్తిని పరీక్షించుకోవడానికి సిద్ధమేనా?', ready: 'మీ తదుపరి సవాలు', readyTitle: 'ఐదు క్యాప్సూల్స్.<br><em>సమయం లోపే కలపండి!</em>',
      readyText: 'ప్రతి SST పరామితిని దాని అర్థంతో జత చేయండి. సరైన భాగాలను లాగి కలపండి. వీలైనంత త్వరగా ఐదు క్యాప్సూల్స్‌ను పూర్తి చేయండి. మీకు 3 లైవ్స్ ఉన్నాయి!',
      pills: 'క్యాప్సూల్స్', seconds: 'సెకన్లు', halves: 'భాగాలు', lives: 'లైవ్స్', start: 'ఆట ప్రారంభించండి', gameTag: 'పిల్ పర్ఫెక్ట్ · జ్ఞాపకశక్తి సవాలు',
      gamePrompt: 'భాగాలను జత చేయండి. క్యాప్సూల్స్ పూర్తి చేయండి!', left: 'సెకన్లు మిగిలాయి', joined: 'కలిపారు', mistakes: 'తప్పు ప్రయత్నాలు',
      parameter: 'SST పరామితి', meaning: 'అర్థం', tray: 'మీరు పూర్తి చేసిన క్యాప్సూల్స్', pick: 'సరైన సంబంధాన్ని కనుగొని భాగాలను కలపండి.',
      selected: 'ఇప్పుడు దీనికి సరిపోయే మరో భాగాన్ని ఎంచుకోండి.', wrong: 'ఇది సరైన జత కాదు — మరో భాగాన్ని ప్రయత్నించండి.', complete: 'ఐదు క్యాప్సూల్స్. అన్నీ సరిగ్గా కలిశాయి!', expired: 'సమయం ముగిసింది — సంబంధాలను గుర్తుంచుకోండి!',
      outOfLives: 'లైవ్స్ ముగిశాయి!', gameOver: 'మీరు 3 లైవ్స్ ఉపయోగించారు. కింద సరైన సంబంధాలను చూసి మళ్లీ ప్రయత్నించండి!',
      resultTag: 'మీ ఫలితాలు', winText: 'మీరు ప్రతి జతను సరిగ్గా కలిపారు. ఈ సంబంధాలను గుర్తుంచుకోండి.', loseText: 'ప్రతి సరైన జత ఒక ముందడుగు. కింద ఉన్న అర్థాలను చదివి మళ్లీ ప్రయత్నించండి.',
      time: 'పట్టిన సమయం', correct: 'సరైన జతలు', answers: 'ఐదు సంబంధాలు', found: 'సరిగ్గా కలిపారు', missed: 'ఈ సంబంధాన్ని గుర్తుంచుకోండి', again: 'మళ్లీ నేర్చుకొని ఆడండి', games: 'ఆటలకు తిరిగి వెళ్లండి', unit: 'సె',
      userPill: 'మీ జత', correctPill: 'సరైన క్యాప్సూల్', matchedBadge: 'సరిగ్గా కలిసింది', mismatchedBadge: 'తప్పు జత', unmatchedBadge: 'కలపలేదు',
      watchTag: 'చూసి నేర్చుకోండి', watchTitle: 'ఏం చేయాలో చూడండి', watchDesc: 'భాగాలు ఎలా కలుస్తాయో గమనించండి. దీని తర్వాత మీరు సాధన చేయవచ్చు!',
      continueBtn: 'కొనసాగించండి',
      names: ['%RSD', 'రిజల్యూషన్', 'టైలింగ్ ఫ్యాక్టర్', 'ప్లేట్ కౌంట్', 'రిటెన్షన్ టైమ్'], meanings: ['ప్రెసిషన్', 'పీక్‌ల వేర్పాటు', 'పీక్ సమమితి', 'కాలమ్ సామర్థ్యం', 'పీక్ గుర్తింపు'],
      explanations: ['%RSD పదే పదే పొందిన ఫలితాలు ఎంత స్థిరంగా ఉన్నాయో తెలియజేస్తుంది.', 'రిజల్యూషన్ రెండు పీక్‌లు ఎంత బాగా వేరయ్యాయో తెలియజేస్తుంది.', 'టైలింగ్ ఫ్యాక్టర్ ఒక పీక్ ఎంత సమమితిగా ఉందో వివరిస్తుంది.', 'ప్లేట్ కౌంట్ కాలమ్ సమ్మేళనాలను ఎంత సమర్థంగా వేరు చేస్తుందో సూచిస్తుంది.', 'రిటెన్షన్ టైమ్ పీక్ కనిపించే సమయం ఆధారంగా దానిని గుర్తించడంలో సహాయపడుతుంది.']
    }
  };
  let language = 'en';
  try { language = localStorage.getItem('aurobindo-language') || 'en'; } catch (_) { /* Preferences are optional. */ }
  if (!copy[language]) language = 'en';
  let phase = 'intro', practiceIndex = 0, practiceJoined = false, demoJoined = false, demoWatching = false;
  let lessonReady = false;
  let round = null, order = [], selected = null, drag = null, clock = null, demoTimer = null, endTimer = null;
  let sound = true, audio = null, suppressClickUntil = 0, streak = 0;
  const effectTimers = new Set(), motions = new Set();
  const arcade = {
    en: { steps: ['1. Grab', '2. Drag', '3. Release'], snap: 'SNAP!', streak: '{n} in a row!', praise: ['Nailed it!', 'Beautiful!', 'You’re on fire!', 'Unstoppable!', 'PILL PERFECT!'] },
    hi: { steps: ['1. पकड़ें', '2. खींचें', '3. छोड़ें'], snap: 'जुड़ गया!', streak: 'लगातार {n} सही!', praise: ['शाबाश!', 'शानदार!', 'कमाल कर रहे हैं!', 'बहुत खूब!', 'सभी सही जुड़े!'] },
    te: { steps: ['1. పట్టుకోండి', '2. లాగండి', '3. వదలండి'], snap: 'కలిసింది!', streak: 'వరుసగా {n} సరైన జతలు!', praise: ['శభాష్!', 'అద్భుతం!', 'చాలా బాగా చేస్తున్నారు!', 'భలే చేశారు!', 'అన్నీ సరిగ్గా కలిశాయి!'] }
  };
  const demoCopy = {
    en: ['Press and hold the %RSD half.', 'Drag it towards Precision. Watch the edges.', 'Release near the edge — the magnet does the rest!'],
    hi: ['%RSD वाले हिस्से को दबाकर पकड़ें।', 'इसे परिशुद्धता की ओर खींचें। किनारों को देखें।', 'किनारे के पास छोड़ें — दोनों हिस्से अपने आप जुड़ जाएँगे!'],
    te: ['%RSD భాగాన్ని నొక్కి పట్టుకోండి.', 'ప్రెసిషన్ వైపు లాగండి. అంచులను గమనించండి.', 'అంచు దగ్గర వదలండి — భాగాలు వాటంతట అవే కలుస్తాయి!']
  };
  function later(fn, ms) { const id = setTimeout(() => { effectTimers.delete(id); fn(); }, ms); effectTimers.add(id); return id; }
  function clearEffects() {
    clearMagneticField();
    effectTimers.forEach(clearTimeout); effectTimers.clear();
    motions.forEach(animation => animation.cancel()); motions.clear();
    $('effects').replaceChildren();
  }
  function animate(node, frames, options) {
    if (reduced() || !node.animate) return;
    const animation = node.animate(frames, options); motions.add(animation);
    animation.onfinish = () => motions.delete(animation);
    return animation;
  }
  const t = () => copy[language];
  const reduced = () => typeof window !== 'undefined' && window.__reducedMotion !== undefined ? window.__reducedMotion : (typeof navigator === 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false);
  const button = (action, label, secondary = false, disabled = false) => `<button type="button" class="${secondary ? 'secondary' : 'primary'}" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}${secondary ? '' : '<span aria-hidden="true">→</span>'}</button>`;
  const renderLives = count => [0, 1, 2].map(i => `<i class="life-heart ${i < Math.max(0, Math.min(3, count)) ? 'full' : 'lost'}">${i < Math.max(0, Math.min(3, count)) ? '❤️' : '🖤'}</i>`).join('');
  const label = id => id % 2 ? t().meanings[id >> 1] : t().names[id >> 1];
  const half = (id, demo = false, slot = 0) => `<button type="button" class="half ${id % 2 ? 'meaning' : 'parameter'}${round?.matched.has(id >> 1) && phase === 'playing' ? ' used' : ''}" data-half="${id}" style="--tilt:${[-5, 4, -3, 5, -2][slot % 5]}deg;--offset:${slot % 2 ? 5 : -5}px;--delay:-${slot * .37}s" aria-pressed="false" ${demo || (phase === 'practice' && practiceJoined) || (phase === 'playing' && round?.matched.has(id >> 1)) ? 'disabled' : ''}>${label(id)}</button>`;
  const mini = index => `<span class="mini-pill"><span>${t().names[index]}</span><span>${t().meanings[index]}</span></span>`;
  const legend = () => `<div class="legend"><span><i></i>${t().parameter}</span><span><i></i>${t().meaning}</span></div>`;
  function announce(text) { $('announcer').textContent = text; }
  function updateHeader() {
    document.documentElement.lang = language;
    $('language').value = language;
    $('edition').textContent = t().edition;
    $('back').textContent = t().back;
    $('footer').textContent = t().footer;
    $('sound-label').textContent = sound ? t().on : t().off;
    $('sound').setAttribute('aria-label', `${t().sound}: ${sound ? t().on : t().off}`);
    $('sound').setAttribute('aria-pressed', String(sound));
  }
  function render(focus = true) {
    cancelDrag(); clearEffects(); selected = null; updateHeader();
    document.body.dataset.phase = phase;
    let html = '';
    if (phase === 'intro') html = `<section class="panel center intro"><span class="eyebrow">${t().introTag}</span><div class="hero-orbit"><div class="hero-pill" aria-hidden="true"><span>%RSD</span><span>${t().meanings[0]}</span></div></div><h1 tabindex="-1">${t().title}</h1><p>${t().intro}</p><div class="steps"><span><b>1</b>${t().watch}</span><span><b>2</b>${t().practice}</span><span><b>3</b>${t().play}</span></div><div class="actions">${button('demo', t().begin)}</div></section>`;
    if (phase === 'demo' || phase === 'practice') {
      const demo = phase === 'demo', index = demo ? 0 : practiceIndex, joined = demo ? demoJoined : practiceJoined;
      html = `<section class="panel lesson center">${demo && demoWatching ? `<div class="watch-panel-overlay" id="watch-overlay" aria-live="polite"><div class="watch-panel-card"><span class="watch-panel-tag"><span class="watch-icon" aria-hidden="true">👀</span> ${t().watchTag}</span><strong class="watch-panel-title">${t().watchTitle}</strong><div class="watch-panel-visual" aria-hidden="true"><span class="watch-pill param">%RSD</span><span class="watch-arrow">➔</span><span class="watch-pill mean">${t().meanings[0]}</span></div><p class="watch-panel-desc">${t().watchDesc}</p><div class="watch-card-actions"><button type="button" class="primary watch-continue-btn" data-action="continue"><span>${t().continueBtn}</span> <span class="watch-btn-arrow" aria-hidden="true">→</span></button></div></div></div>` : ''}<div class="lesson-top"><span class="eyebrow">${demo ? t().demo : t().practiceTag}</span>${demo ? '' : `<span class="helper">${t().pair.replace('{n}', index + 1)}</span>`}</div><h1 tabindex="-1">${t().prompt}</h1>${!demo ? `<div class="dots" style="justify-content:center" aria-hidden="true">${[0, 1, 2, 3, 4].map(i => `<i class="${i < index || (i === index && joined) ? 'done' : ''} ${i === index ? 'current' : ''}">${i < index || (i === index && joined) ? '?' : i + 1}</i>`).join('')}</div>` : ''}<div id="capsule-stage" class="capsule-stage ${joined ? 'is-joined' : demo && !demoWatching ? 'demo-running' : ''}">${half(index * 2, demo)}${half(index * 2 + 1, demo)}${demo && !joined && !demoWatching ? `<span class="demo-trail" aria-hidden="true"></span>` : ''}</div>${demo ? `<div class="demo-steps" id="demo-steps">${arcade[language].steps.map((step, i) => `<span class="${joined || i === 0 ? 'active' : ''}">${step}</span>`).join('')}</div>` : ''}<div class="lesson-message"><div id="equation" class="equation ${joined ? 'pop' : ''}">${joined ? `${t().names[index]} = ${t().meanings[index]}` : ''}</div><p id="helper" class="helper">${demo ? (joined ? '' : demoCopy[language][0]) : (joined ? '' : t().helper)}</p><div id="lesson-feedback">${joined && lessonReady ? lessonFeedback() : ''}</div></div><div id="lesson-actions" class="actions demo-controls">${demo && joined ? button('replay', t().replay, true) + button('practice', t().try) : !demo ? (joined && lessonReady ? button('next', t().next) : '') : button('practice', t().try, false, true)}</div></section>`;
    }
    if (phase === 'ready') html = `<section class="panel center intro"><span class="eyebrow">${t().ready}</span><div class="report-icon" aria-hidden="true">✦</div><h1 tabindex="-1">${t().readyTitle}</h1><p>${t().readyText}</p><div class="facts"><span><strong>5</strong>${t().pills}</span><span><strong>45</strong>${t().seconds}</span><span><strong>3</strong>${t().lives}</span></div>${legend()}<p class="intro-note">${t().helper}</p><div class="actions">${button('start', t().start)}</div></section>`;
    if (phase === 'playing') html = `<section class="panel game"><div class="game-top"><div><span class="eyebrow">${t().gameTag}</span><h1 tabindex="-1">${t().gamePrompt}</h1></div><div id="clock" class="clock"><strong id="seconds" role="timer" aria-label="${t().left}">45</strong><span>${t().left}</span></div></div><div class="timer-track" aria-hidden="true"><div id="timer-fill"></div></div><div class="status-row"><strong id="progress">${round.matched.size} / 5 ${t().joined}</strong><div class="lives-box" id="lives-box" aria-label="${t().lives}: ${Math.max(0, 3 - round.mistakes)} / 3"><span class="lives-label">${t().lives}</span><span class="lives-icons" aria-hidden="true">${renderLives(3 - round.mistakes)}</span></div><span class="sr-only">${t().mistakes}: <b id="mistakes">${round.mistakes}</b></span></div><div id="board" class="board" aria-label="${t().gamePrompt}">${order.map((id, slot) => half(id, false, slot)).join('')}</div><div id="tray" class="tray">${tray()}</div><p id="game-feedback" class="game-feedback">${t().pick}</p><p class="helper center">${t().helper}</p></section>`;
    if (phase === 'results') {
      const won = round.matched.size === 5;
      const outOfLives = round.mistakes >= 3;
      html = `<section class="panel center results-panel">
        <span class="eyebrow">${t().resultTag}</span>
        <div class="report-icon" aria-hidden="true">${won ? '✦' : outOfLives ? '💔' : '↻'}</div>
        <h1 tabindex="-1">${won ? t().complete : outOfLives ? t().outOfLives : t().expired}</h1>
        <p>${won ? t().winText : outOfLives ? t().gameOver : t().loseText}</p>
        <div class="metrics">
          <div><strong>${(round.elapsed / 1000).toFixed(1)} ${t().unit}</strong><span>${t().time}</span></div>
          <div><strong>${Math.max(0, 3 - round.mistakes)} / 3</strong><span>${t().lives}</span><small class="sr-only">${round.mistakes} ${t().mistakes}</small></div>
          <div><strong>${round.matched.size} / 5</strong><span>${t().correct}</span></div>
        </div>
        <details class="answers" open>
          <summary>${t().answers}</summary>
          <div class="answers-list">
            ${t().names.map((name, i) => {
              const matched = round.matched.has(i);
              const userMeaningIndex = round.userConnections.get(i);
              const hasWrongAttempt = !matched && userMeaningIndex !== undefined && userMeaningIndex !== i;
              return `<div class="answer ${matched ? 'is-correct' : 'is-missed'}">
                <div class="answer-header">
                  <span class="check" aria-hidden="true">${matched ? '✓' : hasWrongAttempt ? '✕' : '○'}</span>
                  <strong class="connection-label">${name} = ${t().meanings[i]}</strong>
                  <span class="status-pill-badge ${matched ? 'badge-match' : hasWrongAttempt ? 'badge-wrong' : 'badge-missed'}">${matched ? t().matchedBadge : hasWrongAttempt ? t().mismatchedBadge : t().unmatchedBadge}</span>
                </div>
                <div class="report-pill-compare">
                  ${hasWrongAttempt ? `
                    <div class="compare-col user-col">
                      <span class="compare-tag wrong-tag">✕ ${t().userPill}</span>
                      <div class="pill-preview wrong" title="${t().userPill}: ${name} + ${t().meanings[userMeaningIndex]}">
                        <span class="pill-half param">${name}</span>
                        <span class="pill-half mean mismatch">${t().meanings[userMeaningIndex]}</span>
                      </div>
                    </div>
                    <div class="compare-arrow" aria-hidden="true">→</div>
                  ` : ''}
                  <div class="compare-col correct-col">
                    <span class="compare-tag correct-tag">${matched ? `✓ ${t().userPill}` : `✓ ${t().correctPill}`}</span>
                    <div class="pill-preview correct" title="${t().correctPill}: ${name} + ${t().meanings[i]}">
                      <span class="pill-half param">${name}</span>
                      <span class="pill-half mean">${t().meanings[i]}</span>
                    </div>
                  </div>
                </div>
                <p class="answer-desc">${t().explanations[i]}</p>
                <small class="sr-only">${matched ? t().found : t().missed}</small>
              </div>`;
            }).join('')}
          </div>
        </details>
        <div class="actions">
          ${button('again', t().again)}
          <a class="secondary" href="index.html#/games">${t().games}</a>
        </div>
      </section>`;
    }
    $('app').innerHTML = html;
    // Keep the action dock outside the content scroller at every viewport size.
    const panel = $('app').querySelector('.panel'), actions = panel.querySelector('.actions');
    const content = document.createElement('div'); content.className = 'screen-content';
    [...panel.children].forEach(node => { node.remove(); if (node !== actions) content.append(node); });
    panel.append(content);
    if (actions) panel.append(actions);
    if (((phase === 'practice' && practiceJoined) || (phase === 'demo' && demoJoined)) && !lessonReady) {
      revealConnection(phase === 'demo' ? 0 : practiceIndex);
    }
    if (phase === 'playing') $('app').querySelectorAll('.board .half').forEach((node, i) => {
      animate(node, [{ opacity: 0, scale: '.35', translate: '0 -28px' }, { opacity: 1, scale: '1.1', offset: .75 }, { opacity: 1, scale: '1', translate: '0 0' }], { duration: 430, delay: i * 35, easing: 'ease-out', fill: 'backwards' });
    });
    if (phase === 'playing') updateClock();
    if (focus) { $('app').querySelector('h1').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
  }
  function lessonFeedback() {
    const index = phase === 'demo' ? 0 : practiceIndex;
    return `<div class="connection-explanation"><span class="sr-only">${t().matched} </span>${t().explanations[index]}${phase === 'practice' && index === 4 ? `<small>${t().all} ${t().allText}</small>` : ''}</div>`;
  }
  function tray() {
    return `<span class="tray-label">${t().tray}</span>${[...round.matched].map(mini).join('')}${Array.from({ length: 5 - round.matched.size }, (_, i) => `<span class="empty-slot" aria-hidden="true">${round.matched.size + i + 1}</span>`).join('')}`;
  }
  function transition(next) {
    clearTimeout(demoTimer); clearTimeout(endTimer); clearInterval(clock);
    clearEffects(); phase = next; render();
    if (next === 'results' && round.matched.size === 5) later(() => {
      celebrate($('app').querySelector('.report-icon'), 48); chime();
    }, 200);
  }
  function startDemo() {
    demoWatching = true; demoJoined = false; lessonReady = false; transition('demo');
  }
  function runDemoAnimation() {
    clearTimeout(demoTimer);
    const stage = $('capsule-stage');
    if (!stage) return;
    const source = stage.querySelector('.parameter'), target = stage.querySelector('.meaning');
    if (!source || !target) return;
    stage.classList.add('demo-running');
    const start = source.getBoundingClientRect(), end = target.getBoundingClientRect();
    const travel = Math.max(0, end.left - start.right);
    stage.dataset.step = 'grab'; source.classList.add('demo-grab');
    const movement = [
      { transform: 'translate(0,0)', offset: 0 },
      { transform: 'translate(0,0)', offset: .12 },
      { transform: `translate(${travel * .55}px,-8px) rotate(-2deg)`, offset: .30 },
      { transform: 'translate(0,-8px) rotate(-2deg)', offset: .46 },
      { transform: `translate(${Math.max(0, travel - 18)}px,-5px)`, offset: .78 },
      { transform: `translate(${travel}px,0) scaleX(.97) scaleY(1.04)`, offset: .96 },
      { transform: `translate(${travel}px,0)`, offset: 1 }
    ];
    movement.forEach(frame => { frame.easing = 'cubic-bezier(.45,0,.2,1)'; });
    const demoMotions = [animate(source, movement, { duration: 4200, fill: 'forwards', easing: 'linear' })].filter(Boolean);
    announce(demoCopy[language][0]);
    [1250, 3300].forEach((ms, index) => later(() => {
      if (phase !== 'demo') return;
      stage.dataset.step = index === 0 ? 'drag' : 'release';
      target.classList.toggle('demo-magnet', index === 1);
      if (index === 1) updateMagneticField(source, target);
      $('helper').textContent = demoCopy[language][index + 1];
      announce(demoCopy[language][index + 1]);
      $('demo-steps').querySelectorAll('span').forEach((node, i) => node.classList.toggle('active', i === index + 1));
    }, ms));
    demoTimer = setTimeout(() => {
      if (phase !== 'demo') return;
      clearMagneticField();
      demoJoined = true;
      const stage = $('capsule-stage'), halves = [...stage.querySelectorAll('.half')];
      const previous = halves.map(node => node.getBoundingClientRect());
      demoMotions.forEach(animation => { animation.cancel(); motions.delete(animation); });
      source.classList.remove('demo-grab'); target.classList.remove('demo-magnet');
      stage.querySelector('.demo-trail')?.remove();
      stage.classList.remove('demo-running'); stage.classList.add('is-joined');
      stage.style.gap = '0px'; stage.style.transition = 'none';
      halves.forEach((node, i) => {
        const rect = node.getBoundingClientRect();
        const initDx = previous[i].left - rect.left, initDy = previous[i].top - rect.top;
        animate(node, [
          { transform: `translate(${initDx}px,${initDy}px) scale(1)`, filter: 'brightness(1)' },
          { transform: 'translate(0,0) scaleX(0.82) scaleY(1.24)', filter: 'brightness(1.6) drop-shadow(0 0 24px #ffffff)', offset: 0.22 },
          { transform: 'translate(0,0) scaleX(1.18) scaleY(0.88)', filter: 'brightness(1.25) drop-shadow(0 0 16px #ffd768)', offset: 0.5 },
          { transform: 'translate(0,0) scaleX(0.96) scaleY(1.04)', filter: 'brightness(1.05)', offset: 0.75 },
          { transform: 'translate(0,0) scale(1)', filter: 'brightness(1)', offset: 1 }
        ], { duration: 500, easing: 'cubic-bezier(.18,1.2,.35,1)' });
      });
      $('demo-steps').querySelectorAll('span').forEach(node => node.classList.add('active'));
      revealConnection(0);
      const snapPoint = stage.getBoundingClientRect();
      const centerX = snapPoint.left + snapPoint.width / 2, centerY = snapPoint.top + snapPoint.height / 2;
      snapLines(centerX, centerY);
      candySnapAnimation(stage, centerX, centerY, 0);
      celebrate(stage, 34); impact(stage); chime(); announce(t().matched);
    }, 4200);
  }
  function revealConnection(index) {
    lessonReady = false;
    $('equation').textContent = ''; $('helper').textContent = '';
    $('lesson-feedback').innerHTML = '';
    $('lesson-actions').innerHTML = '';
    $('lesson-actions').classList.remove('is-ready');
    const equationText = `${t().names[index]} = ${t().meanings[index]}`;
    // Let the capsule finish joining, then carry its connection into the reserved slot.
    later(() => {
      const from = $('capsule-stage').getBoundingClientRect(), to = $('equation').getBoundingClientRect();
      const flight = document.createElement('div'); flight.className = 'equation-flight'; flight.textContent = equationText;
      flight.setAttribute('aria-hidden', 'true');
      flight.style.cssText = `left:${to.left}px;top:${to.top}px;width:${to.width}px;height:${to.height}px;`;
      $('effects').append(flight);
      const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
      const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
      animate(flight, [
        { transform: `translate(${dx}px,${dy}px) scale(.18) rotate(-12deg)`, opacity: 0 },
        { transform: `translate(${dx}px,${dy - 28}px) scale(1.22) rotate(6deg)`, opacity: 1, offset: .18 },
        { transform: `translate(${dx * .52}px,${dy * .48 - 14}px) scale(1.08) rotate(-3deg)`, opacity: 1, offset: .52 },
        { transform: `translate(${dx * .08}px,${dy * .08}px) scale(1.02) rotate(1deg)`, opacity: 1, offset: .85 },
        { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 }
      ], { duration: 650, easing: 'cubic-bezier(.16,.84,.28,1)', fill: 'both' });
      if (!reduced()) {
        for (let i = 0; i < 5; i++) later(() => {
          if (!flight.isConnected) return;
          const rect = flight.getBoundingClientRect();
          const star = document.createElement('i'); star.className = 'spark';
          star.style.cssText = `left:${rect.left + rect.width / 2 + (Math.random() * 24 - 12)}px;top:${rect.top + rect.height / 2 + (Math.random() * 16 - 8)}px;--dx:${(Math.random() - .5) * 32}px;--dy:${(Math.random() - .5) * 32}px;--spin:${Math.random() * 180}deg;background:${['#ffe268', '#7bf6d5', '#ff86cf'][i % 3]};width:7px;height:7px;border-radius:50%;box-shadow:0 0 8px #ffe678;`;
          $('effects').append(star); later(() => star.remove(), 420);
        }, 120 + i * 80);
      }
      later(() => {
        flight.remove();
        $('equation').textContent = equationText;
        $('equation').classList.remove('landed');
        void $('equation').offsetWidth;
        $('equation').classList.add('landed');
        announce(equationText);
        equationLandedEffects(to);
      }, 650);
    }, 650);
    later(() => {
      $('lesson-feedback').innerHTML = lessonFeedback();
      announce(t().explanations[index]);
    }, 2300);
    later(() => {
      lessonReady = true;
      $('lesson-actions').innerHTML = phase === 'demo' ? button('replay', t().replay, true) + button('practice', t().try) : button('next', t().next);
      $('lesson-actions').classList.add('is-ready');
      if (phase === 'practice') $('lesson-actions').querySelector('button').focus({ preventScroll: true });
    }, 3300);
  }
  function startRound() {
    streak = 0;
    order = Array.from({ length: 10 }, (_, i) => i);
    for (let i = 9; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[order[i], order[j]] = [order[j], order[i]]; }
    round = new PillRound(performance.now()); transition('playing');
    clock = setInterval(updateClock, 100);
  }
  function updateClock() {
    if (phase !== 'playing') return;
    const remaining = round.tick(performance.now());
    $('seconds').textContent = Math.ceil(remaining / 1000);
    $('timer-fill').style.transform = `scaleX(${remaining / 45000})`;
    $('clock').classList.toggle('urgent', remaining <= 10000);
    if (round.ended && !endTimer) {
      clearInterval(clock); cancelDrag();
      document.querySelectorAll('[data-half]').forEach(node => { node.disabled = true; });
      endTimer = setTimeout(() => {
        transition('results');
        announce(round.matched.size === 5 ? t().complete : round.mistakes >= 3 ? t().outOfLives : t().expired);
      }, round.matched.size === 5 ? 1250 : round.mistakes >= 3 ? 700 : 0);
    }
  }
  function feedback(message) {
    const node = phase === 'playing' ? $('game-feedback') : $('helper');
    if (node) node.textContent = message;
    announce(message);
  }
  function clearSelection() {
    selected = null;
    document.querySelectorAll('.half.selected').forEach(node => { node.classList.remove('selected'); node.setAttribute('aria-pressed', 'false'); });
  }
  function choose(node) {
    if (!canInteract() || node.disabled) return;
    const id = Number(node.dataset.half);
    if (selected === id) { clearSelection(); return; }
    if (selected === null) { selected = id; node.classList.add('selected'); node.setAttribute('aria-pressed', 'true'); feedback(t().selected); }
    else attempt(selected, id);
  }
  function canInteract() { return (phase === 'practice' && !practiceJoined) || (phase === 'playing' && !round.ended); }
  function attempt(a, b, droppedRect = null) {
    clearSelection();
    if (!canInteract() || a === b) return;
    const outcome = phase === 'practice' ? (a >> 1) === practiceIndex && (b >> 1) === practiceIndex && a !== b ? 'matched' : 'ignored' : round.attempt(a, b, performance.now());
    if (outcome === 'ended') { updateClock(); return; }
    if (outcome === 'ignored') return;
    const nodes = [a, b].map(id => $('app').querySelector(`[data-half="${id}"]`));
    if (outcome === 'wrong') {
      streak = 0;
      nodes.forEach(node => { node.classList.remove('wrong'); void node.offsetWidth; node.classList.add('wrong'); setTimeout(() => node.classList.remove('wrong'), 400); });
      $('mistakes').textContent = round.mistakes;
      const livesBox = $('lives-box');
      if (livesBox) {
        livesBox.setAttribute('aria-label', `${t().lives}: ${Math.max(0, 3 - round.mistakes)} / 3`);
        const icons = livesBox.querySelector('.lives-icons');
        if (icons) icons.innerHTML = renderLives(3 - round.mistakes);
        animate(livesBox, [{ transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 240 });
      }
      feedback(round.ended ? t().gameOver : t().wrong);
      chime(false);
      if (round.ended) updateClock();
      return;
    }
    const index = a >> 1;
    const origins = nodes.map((node, i) => ({ node, rect: i === 0 && droppedRect ? droppedRect : node.getBoundingClientRect() }));
    if (phase === 'practice') {
      practiceJoined = true;
      nodes.forEach(node => { node.disabled = true; });
      $('capsule-stage').classList.add('is-joined');
      joinFlight(index, origins, true);
      revealConnection(index);
      $('app').querySelectorAll('.dots i').forEach((node, i) => {
        if (i <= index) { node.classList.add('done'); node.textContent = '✓'; }
      });
      announce(arcade[language].praise[index]);
    } else {
      streak++;
      nodes.forEach(node => { node.disabled = true; node.classList.add('used'); });
      $('progress').textContent = `${round.matched.size} / 5 ${t().joined}`;
      animate($('progress'), [{ scale: '.9' }, { scale: '1.1', offset: .6 }, { scale: '1' }], { duration: 300 });
      $('tray').innerHTML = tray();
      joinFlight(index, origins, false);
      feedback(`${t().matched} ${t().names[index]} = ${t().meanings[index]}`);
      $('app').querySelector('.half:not(.used)')?.focus({ preventScroll: true });
      updateClock();
    }
  }
  function impact(node) {
    if (reduced()) return;
    node.classList.remove('impact'); void node.offsetWidth; node.classList.add('impact');
    later(() => node.classList.remove('impact'), 300);
  }
  let magnetFieldNode = null;
  function clearMagneticField() {
    if (magnetFieldNode) {
      magnetFieldNode.remove();
      magnetFieldNode = null;
    }
    drag?.ghost?.classList.remove('magnet-attracted');
  }
  function updateMagneticField(ghost, target) {
    if (!ghost || !target || reduced()) { clearMagneticField(); return; }
    const g = ghost.getBoundingClientRect(), t = target.getBoundingClientRect();
    if (!g.width || !t.width) return;
    const isGhostLeft = (g.left + g.width / 2) < (t.left + t.width / 2);
    const leftRect = isGhostLeft ? g : t, rightRect = isGhostLeft ? t : g;
    const seamLeft = leftRect.right, seamRight = rightRect.left;
    const gap = Math.max(10, seamRight - seamLeft);
    const midX = (seamLeft + seamRight) / 2;
    const midY = (leftRect.top + leftRect.height / 2 + rightRect.top + rightRect.height / 2) / 2;
    const height = Math.max(leftRect.height, rightRect.height);

    if (!magnetFieldNode) {
      magnetFieldNode = document.createElement('div');
      magnetFieldNode.className = 'magnetic-field-overlay';
      magnetFieldNode.setAttribute('aria-hidden', 'true');
      $('effects').append(magnetFieldNode);
    }
    const svgW = Math.max(gap + 60, 80), svgH = height + 44;
    const svgX = midX - svgW / 2, svgY = midY - svgH / 2;
    const x1 = 18, x2 = svgW - 18, cy = svgH / 2;
    magnetFieldNode.innerHTML = `<div class="magnetic-flux-pulse" style="left:${midX}px;top:${midY}px;width:${Math.max(gap + 20, 48)}px;height:${height * 0.9}px;"></div><svg class="magnetic-flux-svg" style="left:${svgX}px;top:${svgY}px;width:${svgW}px;height:${svgH}px;" viewBox="0 0 ${svgW} ${svgH}"><defs><linearGradient id="magGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#6df5d4" stop-opacity="0.95" /><stop offset="50%" stop-color="#fff294" stop-opacity="1" /><stop offset="100%" stop-color="#6df5d4" stop-opacity="0.95" /></linearGradient><filter id="magGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><path class="mag-arc arc-outer-top" d="M ${x1} ${cy - height * 0.3} Q ${svgW / 2} ${cy - height * 0.65} ${x2} ${cy - height * 0.3}" stroke="url(#magGrad)" fill="none" filter="url(#magGlow)" /><path class="mag-arc arc-mid-top" d="M ${x1} ${cy - height * 0.15} Q ${svgW / 2} ${cy - height * 0.35} ${x2} ${cy - height * 0.15}" stroke="url(#magGrad)" fill="none" filter="url(#magGlow)" /><path class="mag-arc arc-center" d="M ${x1} ${cy} L ${x2} ${cy}" stroke="#ffffff" fill="none" filter="url(#magGlow)" /><path class="mag-arc arc-mid-bot" d="M ${x1} ${cy + height * 0.15} Q ${svgW / 2} ${cy + height * 0.35} ${x2} ${cy + height * 0.15}" stroke="url(#magGrad)" fill="none" filter="url(#magGlow)" /><path class="mag-arc arc-outer-bot" d="M ${x1} ${cy + height * 0.3} Q ${svgW / 2} ${cy + height * 0.65} ${x2} ${cy + height * 0.3}" stroke="url(#magGrad)" fill="none" filter="url(#magGlow)" /></svg><div class="magnetic-pole-flare left-pole" style="left:${seamLeft}px;top:${midY}px;height:${height * 0.85}px;"></div><div class="magnetic-pole-flare right-pole" style="left:${seamRight}px;top:${midY}px;height:${height * 0.85}px;"></div>`;
  }
  function candySnapAnimation(container, centerX, centerY, strength = 0) {
    if (reduced()) return;
    const flash = document.createElement('div'); flash.className = 'candy-seam-flash';
    flash.style.cssText = `left:${centerX}px;top:${centerY}px;`;
    $('effects').append(flash); later(() => flash.remove(), 420);
    const burst = document.createElement('div'); burst.className = 'candy-sunburst';
    burst.style.cssText = `left:${centerX}px;top:${centerY}px;`;
    $('effects').append(burst); later(() => burst.remove(), 550);
    const shimmer = document.createElement('div'); shimmer.className = 'pill-shimmer';
    container.append(shimmer); later(() => shimmer.remove(), 750);
  }
  function equationLandedEffects(to) {
    if (reduced()) return;
    const centerX = to.left + to.width / 2, centerY = to.top + to.height / 2;
    const ring = document.createElement('div'); ring.className = 'shockwave slot-ring';
    ring.style.cssText = `left:${centerX}px;top:${centerY}px;width:${Math.max(to.width, 140)}px;height:${Math.max(to.height, 60)}px;border-radius:18px;border-color:#ffe268;box-shadow:0 0 25px #ffe075,inset 0 0 15px #ffe075;`;
    $('effects').append(ring); later(() => ring.remove(), 650);
    for (let i = 0; i < 14; i++) {
      const spark = document.createElement('i'); spark.className = 'spark';
      const angle = (Math.PI * 2 * i) / 14, dist = 32 + Math.random() * 42;
      spark.style.cssText = `left:${centerX}px;top:${centerY}px;background:${['#ffe678', '#ffffff', '#6df5d4', '#ff75c4'][i % 4]};--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist - 8}px;--spin:${i * 60}deg;width:8px;height:8px;border-radius:50%;box-shadow:0 0 10px #ffe678;`;
      $('effects').append(spark); later(() => spark.remove(), 650);
    }
  }
  function snapLines(x, y) {
    if (reduced()) return;
    for (let i = 0; i < 12; i++) {
      const ray = document.createElement('i'); ray.className = 'snap-ray';
      ray.style.cssText = `left:${x}px;top:${y}px;--angle:${i * 30}deg;--ray-length:${i % 2 ? 24 : 38}px;`;
      $('effects').append(ray); later(() => ray.remove(), 560);
    }
  }
  function joinFlight(index, origins, lesson) {
    const container = lesson ? $('capsule-stage') : $('board');
    const stageRect = container.getBoundingClientRect();
    const viewportWidth = window.innerWidth || 1000, viewportHeight = window.innerHeight || 800;
    const width = Math.min(lesson ? origins[0].rect.width : 155, (viewportWidth - 54) / 2);
    const height = lesson ? origins[0].rect.height : 82;
    const target = origins[1].rect;
    const centerX = lesson ? stageRect.left + stageRect.width / 2 : Math.max(width + 20, Math.min(viewportWidth - width - 20, target.left + target.width / 2));
    const centerY = lesson ? stageRect.top + stageRect.height / 2 : Math.max(140, Math.min(viewportHeight - 100, target.top + target.height / 2));
    const collected = !lesson && $('tray').querySelectorAll('.mini-pill')[round.matched.size - 1];
    const pocket = collected ? collected.getBoundingClientRect() : null;
    const strength = lesson ? index : round.matched.size - 1;
    const praise = arcade[language].praise[strength];
    const reward = !lesson && streak > 1 ? arcade[language].streak.replace('{n}', streak) : arcade[language].snap;
    if (collected && !reduced()) collected.style.opacity = '0';
    origins.forEach(({ node, rect }) => {
      if (reduced() || !node.animate) return;
      const isRight = Number(node.dataset.half) % 2 === 1;
      const clone = node.cloneNode(true); clone.removeAttribute('data-half'); clone.removeAttribute('disabled');
      clone.className = `half ${isRight ? 'meaning' : 'parameter'} flying-half`;
      clone.setAttribute('aria-hidden', 'true'); clone.tabIndex = -1;
      clone.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;font-size:${lesson ? 17 : 14}px;`;
      $('effects').append(clone);
      if (lesson) node.style.opacity = '0';
      const x = centerX + (isRight ? 0 : -width) - rect.left;
      const y = centerY - height / 2 - rect.top;
      const sx = width / rect.width, sy = height / rect.height;
      clone.style.transformOrigin = 'top left';
      const transform = (dx, dy, scaleX = sx, scaleY = sy) => `translate(${dx}px,${dy}px) scale(${scaleX},${scaleY})`;
      const frames = [
        { transform: transform(0, 0, 1, 1), offset: 0, opacity: 1 },
        { transform: transform(x + (isRight ? 16 : -16), y - 8), offset: .22, opacity: 1 },
        { transform: transform(x, y, sx, sy * 1.09), offset: .32, opacity: 1 },
        { transform: transform(x, y), offset: .43, opacity: 1 },
        { transform: transform(x, y), offset: .66, opacity: 1 },
        { transform: !lesson && pocket ? transform(pocket.left + pocket.width / 2 + (isRight ? 0 : -width * .3) - rect.left, pocket.top - rect.top, sx * .3, sy * .3) : transform(x, y), offset: 1, opacity: lesson ? 1 : 0 }
      ];
      animate(clone, frames, { duration: lesson ? 650 : 1050, easing: 'cubic-bezier(.2,.75,.3,1)', fill: 'forwards' });
      later(() => { clone.remove(); if (lesson) node.style.opacity = ''; }, lesson ? 650 : 1060);
    });
    later(() => {
      impact(container); chime();
      snapLines(centerX, centerY);
      candySnapAnimation(container, centerX, centerY, strength);
      const point = { getBoundingClientRect: () => ({ left: centerX, top: centerY, width: 0, height: 0 }) };
      celebrate(point, 28 + strength * 4);
      const ring = document.createElement('div'); ring.className = 'shockwave';
      ring.style.cssText = `left:${centerX}px;top:${centerY}px;`; $('effects').append(ring); later(() => ring.remove(), 650);
      const flash = document.createElement('div'); flash.className = 'match-flash';
      flash.style.cssText = `left:${centerX}px;top:${centerY}px;`;
      flash.innerHTML = `<strong>${praise}</strong><small>${reward}</small>`;
      $('effects').append(flash); later(() => flash.remove(), 1100);
      if (!reduced() && typeof navigator !== 'undefined') navigator.vibrate?.([18, 25, 35]);
    }, reduced() ? 0 : 270);
    if (collected) later(() => { collected.style.opacity = ''; animate(collected, [{ transform: 'scale(.6)' }, { transform: 'scale(1.2)', offset: .7 }, { transform: 'scale(1)' }], { duration: 300 }); }, reduced() ? 0 : 1030);
  }
  function celebrate(node, count = 28) {
    if (reduced()) return;
    const rect = node.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('i'); spark.className = 'spark';
      const angle = Math.PI * 2 * i / count, distance = 75 + Math.random() * 125;
      spark.style.cssText = `left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;background:${['#75ffe1', '#ff91d1', '#ffdf78', '#bb94ff'][i % 4]};--dx:${Math.cos(angle) * distance}px;--dy:${Math.sin(angle) * distance + 45}px;--spin:${i * 75}deg`;
      $('effects').append(spark); later(() => spark.remove(), 1050);
    }
  }
  function chime(success = true) {
    if (!sound) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume().catch(() => { });
      if (success) {
        const snap = audio.createOscillator(), envelope = audio.createGain(), at = audio.currentTime;
        snap.type = 'triangle'; snap.frequency.setValueAtTime(1500, at);
        snap.frequency.exponentialRampToValueAtTime(180, at + .045);
        envelope.gain.setValueAtTime(.09, at); envelope.gain.exponentialRampToValueAtTime(.001, at + .055);
        snap.connect(envelope); envelope.connect(audio.destination); snap.start(at); snap.stop(at + .06);
      }
      const pitch = 1 + (phase === 'playing' ? Math.min(streak, 5) : practiceIndex) * .045;
      (success ? [523.25, 659.25, 783.99, 1046.5] : [220, 196]).forEach((frequency, i) => {
        const oscillator = audio.createOscillator(), gain = audio.createGain(), at = audio.currentTime + i * .07;
        oscillator.type = i === 0 ? 'triangle' : 'sine'; oscillator.frequency.value = frequency * pitch;
        gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.045, at + .01); gain.gain.exponentialRampToValueAtTime(.001, at + .25);
        oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(at); oscillator.stop(at + .26);
      });
    } catch (_) { /* Visual feedback works without audio support. */ }
  }
  function unlockAudio() {
    if (!sound) return;
    try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume().catch(() => { }); } catch (_) { /* Optional audio. */ }
  }
  function cancelDrag() {
    clearMagneticField();
    if (drag) {
      cancelAnimationFrame(drag.frame);
      drag.node.classList.remove('drag-source'); drag.ghost?.remove();
      if (drag.node.hasPointerCapture?.(drag.pointer)) drag.node.releasePointerCapture(drag.pointer);
      drag = null;
    }
    document.querySelectorAll('.hover-target').forEach(node => node.classList.remove('hover-target'));
  }
  function scrollWhileDragging() {
    if (!drag?.moved) return;
    const content = $('app').querySelector('.screen-content'), bounds = content.getBoundingClientRect();
    const margin = 45;
    const direction = drag.clientY < bounds.top + margin ? -1 : drag.clientY > bounds.bottom - margin ? 1 : 0;
    if (direction && content.scrollHeight > content.clientHeight) content.scrollTop += direction * 7;
    drag.frame = requestAnimationFrame(scrollWhileDragging);
  }
  function dropTarget(x, y, source) {
    // Use the visible capsule, not the finger/cursor inside it, as the magnet.
    drag.ghost.style.left = `${x - drag.offsetX}px`;
    drag.ghost.style.top = `${y - drag.offsetY}px`;
    const moving = drag.ghost.getBoundingClientRect();
    const candidates = [...$('app').querySelectorAll('.half:not(.used):not(:disabled)')].filter(node => node !== source);
    // Prefer the nearest physical edge, then the closest center if shapes overlap.
    // Pair identity never influences targeting: an incorrect connection still counts.
    return candidates.map(node => {
      const r = node.getBoundingClientRect();
      const dx = Math.max(r.left - moving.right, moving.left - r.right, 0);
      const dy = Math.max(r.top - moving.bottom, moving.top - r.bottom, 0);
      const centerDistance = Math.hypot((r.left + r.right - moving.left - moving.right) / 2, (r.top + r.bottom - moving.top - moving.bottom) / 2);
      return { node, distance: Math.hypot(dx, dy), centerDistance };
    }).filter(item => item.distance <= 22).sort((a, b) => a.distance - b.distance || a.centerDistance - b.centerDistance)[0]?.node;
  }
  $('app').addEventListener('pointerdown', event => {
    const node = event.target.closest('[data-half]');
    if (!node || node.disabled || !canInteract() || event.button !== 0 || drag) return;
    unlockAudio();
    const rect = node.getBoundingClientRect();
    drag = { node, pointer: event.pointerId, x: event.clientX, y: event.clientY, clientY: event.clientY, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, width: rect.width, height: rect.height, moved: false };
    node.setPointerCapture(event.pointerId);
  });
  document.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointer) return;
    drag.clientY = event.clientY;
    if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 7) return;
    event.preventDefault();
    if (!drag.moved) {
      clearSelection(); drag.moved = true;
      drag.ghost = drag.node.cloneNode(true); drag.ghost.removeAttribute('data-half'); drag.ghost.setAttribute('aria-hidden', 'true'); drag.ghost.tabIndex = -1;
      drag.ghost.className = `${drag.node.className} drag-ghost`; drag.ghost.style.width = `${drag.width}px`; drag.ghost.style.height = `${drag.height}px`;
      document.body.append(drag.ghost); drag.node.classList.add('drag-source');
      drag.frame = requestAnimationFrame(scrollWhileDragging);
    }
    drag.ghost.style.left = `${event.clientX - drag.offsetX}px`; drag.ghost.style.top = `${event.clientY - drag.offsetY}px`;
    document.querySelectorAll('.hover-target').forEach(node => node.classList.remove('hover-target'));
    const target = dropTarget(event.clientX, event.clientY, drag.node);
    if (target) {
      target.classList.add('hover-target');
      drag.ghost.classList.add('magnet-attracted');
      updateMagneticField(drag.ghost, target);
    } else {
      drag.ghost.classList.remove('magnet-attracted');
      clearMagneticField();
    }
  }, { passive: false });
  document.addEventListener('pointerup', event => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const { node, moved } = drag;
    const target = moved ? dropTarget(event.clientX, event.clientY, node) : null;
    const droppedRect = drag.ghost?.getBoundingClientRect();
    clearMagneticField();
    cancelDrag();
    if (moved) {
      suppressClickUntil = performance.now() + 350;
      if (target) attempt(Number(node.dataset.half), Number(target.dataset.half), droppedRect);
    }
  });
  document.addEventListener('pointercancel', cancelDrag);
  window.addEventListener('blur', cancelDrag);
  window.addEventListener('resize', cancelDrag);
  document.addEventListener('visibilitychange', () => { cancelDrag(); if (!document.hidden) updateClock(); });
  $('app').addEventListener('click', event => {
    unlockAudio();
    const halfNode = event.target.closest('[data-half]');
    if (halfNode) { if (performance.now() >= suppressClickUntil || event.detail === 0) choose(halfNode); return; }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'demo' && phase === 'intro') startDemo();
    if (action === 'continue' && phase === 'demo' && demoWatching) {
      demoWatching = false;
      const overlay = $('watch-overlay');
      if (overlay) {
        overlay.classList.add('fade-out');
        later(() => overlay.remove(), 400);
      }
      runDemoAnimation();
    }
    if (action === 'replay' && phase === 'demo') {
      demoWatching = false; demoJoined = false; lessonReady = false;
      transition('demo');
      runDemoAnimation();
    }
    if (action === 'practice' && phase === 'demo' && demoJoined && lessonReady) { practiceIndex = 0; practiceJoined = false; lessonReady = false; transition('practice'); }
    if (action === 'next' && phase === 'practice' && practiceJoined && lessonReady) {
      if (practiceIndex === 4) transition('ready');
      else { practiceIndex++; practiceJoined = false; lessonReady = false; transition('practice'); }
    }
    if (action === 'start' && phase === 'ready') startRound();
    if (action === 'again' && phase === 'results') { round = null; transition('intro'); }
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { cancelDrag(); clearSelection(); } });
  $('language').addEventListener('change', event => {
    language = copy[event.target.value] ? event.target.value : 'en';
    try { localStorage.setItem('aurobindo-language', language); } catch (_) { /* Optional. */ }
    if (phase === 'demo' && !demoJoined) {
      if (demoWatching) startDemo(); else { transition('demo'); runDemoAnimation(); }
    } else render(false);
  });
  $('sound').addEventListener('click', () => { sound = !sound; updateHeader(); if (sound) chime(); });
  window.addEventListener('pagehide', () => { cancelDrag(); clearEffects(); clearInterval(clock); clearTimeout(demoTimer); clearTimeout(endTimer); audio?.suspend(); });
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    if (phase === 'playing') { endTimer = null; render(false); if (!round.ended) clock = setInterval(updateClock, 100); }
    else if (phase === 'demo' && !demoJoined) startDemo();
    else render(false);
  });
  if (typeof window !== 'undefined') {
    window.__startRound = startRound;
    window.__transition = transition;
  }
  render(false);
})();