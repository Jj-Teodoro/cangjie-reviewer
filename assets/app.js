/* ---------- Helpers ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('cjacademy.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('cjacademy.' + k, JSON.stringify(v)); } catch (e) {} }
};
let progress = store.get('progress', {});

/* Each visitor gets their own random seed, so two people see different papers.
   The seed plus an attempt counter fixes one paper; a retry moves to a new one. */
function newSeed() {
  try { return crypto.getRandomValues(new Uint32Array(1))[0]; } catch (e) { return Math.floor(Math.random() * 4294967296); }
}
let visitorSeed = store.get('seed', null);
if (visitorSeed == null) { visitorSeed = newSeed(); store.set('seed', visitorSeed); }
let attempts = store.get('attempts', {});
function rngFor(key) {
  let h = visitorSeed >>> 0;
  const salt = key + ':' + (attempts[key] || 0);
  for (let i = 0; i < salt.length; i++) h = Math.imul(h ^ salt.charCodeAt(i), 2654435761);
  return () => { // mulberry32
    h = (h + 0x6D2B79F5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function nextAttempt(key) { attempts[key] = (attempts[key] || 0) + 1; store.set('attempts', attempts); }
function shuffle(a, rand) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function shuffleOptions(q, rand) {
  const order = shuffle(q.o.map((_, i) => i), rand);
  return Object.assign({}, q, { o: order.map(i => q.o[i]), a: order.indexOf(q.a) });
}
const quizCache = {};
function lessonQuiz(id) {
  if (!quizCache[id]) {
    const rand = rngFor('lesson-' + id);
    quizCache[id] = shuffle(LESSONS.find(l => l.id === id).quiz, rand).map(q => shuffleOptions(q, rand));
  }
  return quizCache[id];
}
let examBest = store.get('examBest', null);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = n => String(n).padStart(2, '0');

const KW = new Set(('func let var const class struct interface enum extend open override abstract sealed public private protected internal static init this super ' +
  'if else while do for in where match case return break continue throw try catch finally import package spawn synchronized prop mut operator redef ' +
  'true false is as unsafe main Some None get set').split(' '));
function hl(src) {
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|[rb]'(?:[^'\\]|\\.)*'|'(?:[^'\\\n]|\\.)*')|(\b0[xXbBoO][\da-fA-F_]+(?:[iu](?:8|16|32|64))?\b|\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?(?:[iuf](?:8|16|32|64))?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;
  let out = '', last = 0, m;
  while ((m = re.exec(src))) {
    out += esc(src.slice(last, m.index));
    if (m[1]) out += '<span class="c">' + esc(m[1]) + '</span>';
    else if (m[2]) out += '<span class="s">' + esc(m[2]) + '</span>';
    else if (m[3]) out += '<span class="n">' + esc(m[3]) + '</span>';
    else if (KW.has(m[4])) out += '<span class="k">' + m[4] + '</span>';
    else if (/^[A-Z]/.test(m[4])) out += '<span class="t">' + m[4] + '</span>';
    else out += m[4];
    last = re.lastIndex;
  }
  return out + esc(src.slice(last));
}
let codeStore = [];
function codeBlock(src, out, file) {
  const id = codeStore.push(src) - 1;
  return '<div class="code"><div class="code-head"><span>' + esc(file || 'Cangjie') + '</span><button class="copy" data-copy="' + id + '">Copy</button></div>' +
    '<pre><code>' + hl(src) + '</code></pre>' + (out != null ? '<div class="out">' + esc(out) + '</div>' : '') + '</div>';
}
function shellBlock(src) {
  const id = codeStore.push(src.split('\n').map(l => l.replace(/\s+#.*$/, '')).join('\n')) - 1;
  const lines = src.split('\n').map(l => {
    const i = l.search(/\s+#/);
    const cmd = i >= 0 ? l.slice(0, i) : l, com = i >= 0 ? l.slice(i) : '';
    return '<span class="p">$ </span>' + esc(cmd) + (com ? '<span class="c">' + esc(com) + '</span>' : '');
  }).join('\n');
  return '<div class="code shell"><div class="code-head"><span>Terminal</span><button class="copy" data-copy="' + id + '">Copy</button></div><pre><code>' + lines + '</code></pre></div>';
}
function tableBlock(rows) {
  return '<div class="tbl"><table><thead><tr>' + rows[0].map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
    rows.slice(1).map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
}
function status(id) {
  const p = progress[id];
  if (!p) return 'new';
  const L = LESSONS.find(l => l.id === id);
  if (p.best != null && p.best >= Math.ceil(L.quiz.length * 0.75)) return 'done';
  return 'read';
}
const statusLabel = { new: 'Not started', read: 'In progress', done: 'Passed' };

/* ---------- Navigation ---------- */
function renderNav(current) {
  const items = LESSONS.map((l, i) => {
    const st = status(l.id);
    return '<li><a class="nav-link" href="#l-' + l.id + '"' + (current === 'l-' + l.id ? ' aria-current="page"' : '') + '><span class="nav-num">' + pad(i + 1) + '</span><span>' + l.title + '</span><span class="dot ' + st + '" title="' + statusLabel[st] + '"></span></a></li>';
  }).join('');
  document.getElementById('nav').innerHTML =
    '<ul class="nav-list"><li><a class="nav-link" href="#home"' + (current === 'home' ? ' aria-current="page"' : '') + '><span class="nav-num">⌂</span><span>Overview</span><span></span></a></li></ul>' +
    '<div class="rail-label">Lessons</div><ul class="nav-list">' + items + '</ul>' +
    '<div class="rail-label">Assessment</div><ul class="nav-list"><li><a class="nav-link" href="#exam"' + (current === 'exam' ? ' aria-current="page"' : '') + '><span class="nav-num">✎</span><span>Final exam</span><span class="dot ' + (examBest != null && examBest >= 70 ? 'done' : examBest != null ? 'read' : '') + '"></span></a></li></ul>' +
    '<div class="rail-label">Resources</div><ul class="nav-list"><li><a class="nav-link" href="#references"' + (current === 'references' ? ' aria-current="page"' : '') + '><span class="nav-num">↗</span><span>References</span><span></span></a></li></ul>';
}

/* ---------- Home ---------- */
function renderHome() {
  const done = LESSONS.filter(l => status(l.id) === 'done').length;
  const answered = LESSONS.reduce((s, l) => s + (progress[l.id] && progress[l.id].best != null ? progress[l.id].best : 0), 0);
  const totalQ = LESSONS.reduce((s, l) => s + l.quiz.length, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.find(l => status(l.id) !== 'done') || LESSONS[0];
  return '<div class="col"><section class="hero"><div class="eyebrow">Cangjie 1.0 · self-paced course</div>' +
    '<h1>Learn Cangjie, one runnable example at a time</h1>' +
    '<p class="lede">Thirteen short lessons cover the language from installing <code>cjc</code> to spawning threads. Each lesson ends with a quiz, and a timed final exam draws questions from the whole course.</p>' +
    '<div class="cta-row"><a class="btn" href="#l-' + next.id + '">' + (done || answered ? 'Continue: ' : 'Start: ') + next.title + '</a><a class="btn ghost" href="#exam">Take the final exam</a></div></section>' +
    '<div class="stats"><div class="stat"><b>' + done + ' / ' + LESSONS.length + '</b><span>lessons passed</span><div class="track"><i style="width:' + pct + '%"></i></div></div>' +
    '<div class="stat"><b>' + answered + ' / ' + totalQ + '</b><span>best quiz answers correct</span><div class="track"><i style="width:' + Math.round(answered / totalQ * 100) + '%"></i></div></div>' +
    '<div class="stat"><b>' + (examBest == null ? '—' : examBest + '%') + '</b><span>best exam score (pass at 70%)</span><div class="track"><i style="width:' + (examBest || 0) + '%"></i></div></div></div>' +
    '<h2>Course outline</h2><ol class="lessons">' + LESSONS.map((l, i) => {
      const st = status(l.id);
      return '<li><a href="#l-' + l.id + '"><span class="l-num">' + pad(i + 1) + '</span><span><span class="l-title">' + l.title + '</span><span class="l-blurb">' + l.blurb + '</span></span><span class="chip ' + st + '">' + statusLabel[st] + '</span></a></li>';
    }).join('') + '</ol>' +
    '<h2>How to use this course</h2><p>Read the lesson, copy each example into a <code>.cj</code> file and run it with <code>cjc file.cj -o app &amp;&amp; ./app</code>. The expected output sits under each example so you can check your result. This site does not run code itself. To skip the install, try the community <a href="https://playground.cj.zxilly.dev" target="_blank" rel="noopener">Cangjie Playground</a>.</p>' +
    '<p>A lesson counts as passed when you get at least three quarters of its quiz right. Your progress is kept in this browser only.</p>' +
    '<div class="cta-row"><button class="btn ghost" id="reset-progress">Reset my progress</button></div><p id="reset-confirm" hidden></p>' +
    sourceNote() + '</div>';
}
function sourceNote() {
  return '<p class="src">Content follows the <a href="https://cangjie-lang.cn/en/docs?url=%2F1.0.0%2Fuser_manual%2Fsource_en%2Ffirst_understanding%2Finstall_Community.html" target="_blank" rel="noopener">Cangjie 1.0 developer guide</a> (source on <a href="https://gitcode.com/Cangjie/cangjie_docs" target="_blank" rel="noopener">GitCode</a>). Check the official docs for exact library signatures.</p>';
}

/* ---------- Lesson ---------- */
const quizState = {};
function renderLesson(id) {
  const idx = LESSONS.findIndex(l => l.id === id);
  const L = LESSONS[idx];
  if (!progress[id]) { progress[id] = { best: null }; store.set('progress', progress); }
  const body = L.body.map(([t, a, b, c]) => {
    if (t === 'p') return '<p>' + a + '</p>';
    if (t === 'h') return '<h2>' + a + '</h2>';
    if (t === 'code') return codeBlock(a, b, c);
    if (t === 'shell') return shellBlock(a);
    if (t === 'note') return '<div class="note">' + a + '</div>';
    if (t === 'table') return tableBlock(a);
    return '';
  }).join('');
  quizState[id] = quizState[id] || {};
  const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
  return '<div class="col"><div class="eyebrow">Lesson ' + pad(idx + 1) + ' of ' + LESSONS.length + '</div><h1>' + L.title + '</h1><p class="lede">' + L.blurb + '</p>' + body +
    '<section class="quiz" id="quiz-' + id + '"><h2 style="margin-top:12px">Check your understanding</h2><p style="color:var(--muted);margin:0">' + L.quiz.length + ' questions. Question and answer order is shuffled for you, and Retry deals a new order.</p>' + quizBody(L) + '</section>' +
    '<div class="pager">' + (prev ? '<a href="#l-' + prev.id + '"><small>← Previous</small><span>' + prev.title + '</span></a>' : '<span></span>') +
    (next ? '<a href="#l-' + next.id + '" style="text-align:right"><small>Next →</small><span>' + next.title + '</span></a>' : '<a href="#exam" style="text-align:right"><small>Finished the lessons →</small><span>Final exam</span></a>') + '</div>' +
    sourceNote() + '</div>';
}
function optionHTML(q, i, picked, reveal, attrs) {
  let cls = 'opt';
  if (reveal) { if (i === q.a) cls += ' right'; else if (i === picked) cls += ' wrong'; }
  else if (i === picked) cls += ' picked';
  return '<button class="' + cls + '" ' + attrs + (reveal ? ' disabled' : '') + '><span class="letter">' + 'ABCD'[i] + '</span><span>' + q.o[i] + '</span></button>';
}
function quizBody(L) {
  const st = quizState[L.id];
  const quiz = lessonQuiz(L.id);
  const qs = quiz.map((q, qi) => {
    const picked = st[qi];
    const answered = picked != null;
    return '<div class="q"><div class="q-n">Q' + (qi + 1) + '</div><p class="q-text">' + q.q + '</p>' + (q.code ? codeBlock(q.code, null) : '') +
      '<div class="opts">' + q.o.map((_, i) => optionHTML(q, i, picked, answered, 'data-lq="' + L.id + '" data-qi="' + qi + '" data-oi="' + i + '"')).join('') + '</div>' +
      (answered ? '<div class="why' + (picked === q.a ? '' : ' bad') + '"><b>' + (picked === q.a ? 'Correct.' : 'Not quite.') + '</b> ' + q.why + '</div>' : '') + '</div>';
  }).join('');
  const n = Object.keys(st).length;
  let foot = '';
  if (n === L.quiz.length) {
    const right = quiz.filter((q, i) => st[i] === q.a).length;
    const pass = right >= Math.ceil(L.quiz.length * 0.75);
    foot = '<div class="score"><div><b>' + right + ' / ' + L.quiz.length + '</b> <span>' + (pass ? 'Lesson passed.' : 'You need ' + Math.ceil(L.quiz.length * 0.75) + ' to pass.') + '</span></div><button class="btn ghost" data-retry="' + L.id + '">Retry quiz</button></div>';
  }
  return qs + foot;
}

/* ---------- Exam ---------- */
const EXAM_SIZE = 20, EXAM_MINUTES = 25, PASS = 70;
let exam = null, timer = null;
function buildExam() {
  nextAttempt('exam');
  const rand = rngFor('exam');
  // One question from every lesson so the paper covers the whole course, then fill at random.
  const picked = [], rest = EXAM_EXTRA.slice();
  LESSONS.forEach(l => {
    const qs = shuffle(l.quiz.map(q => Object.assign({ from: l.title }, q)), rand);
    picked.push(qs[0]);
    rest.push(...qs.slice(1));
  });
  picked.push(...shuffle(rest, rand).slice(0, EXAM_SIZE - picked.length));
  return shuffle(picked, rand).map(q => shuffleOptions(q, rand));
}
function renderExam() {
  if (!exam) {
    return '<div class="col"><div class="eyebrow">Final exam</div><h1>Cangjie 1.0 final exam</h1><p class="lede">Your paper is generated for you: at least one question from every lesson, the rest drawn at random from the full bank, with the answers shuffled. Each attempt deals a new paper.</p>' +
      '<div class="rules"><div class="stat"><b>' + EXAM_SIZE + '</b><span>questions</span></div><div class="stat"><b>' + EXAM_MINUTES + ' min</b><span>time limit</span></div><div class="stat"><b>' + PASS + '%</b><span>to pass</span></div></div>' +
      '<p>You can move between questions and change answers until you submit. Answers are revealed only after you submit or time runs out.' + (examBest != null ? ' Your best score so far is <b>' + examBest + '%</b>.' : '') + '</p>' +
      '<div class="cta-row"><button class="btn" id="exam-start">Start the exam</button></div>' + sourceNote() + '</div>';
  }
  if (exam.done) return examResults();
  const q = exam.qs[exam.i];
  const answeredCount = exam.answers.filter(a => a != null).length;
  return '<div class="col"><div class="exam-bar"><span><b>Question ' + (exam.i + 1) + '</b> of ' + EXAM_SIZE + ' · ' + answeredCount + ' answered</span><span class="timer" id="timer">' + fmtTime() + '</span></div>' +
    '<div class="grid-nav">' + exam.qs.map((_, i) => '<button data-goto="' + i + '" class="' + (exam.answers[i] != null ? 'ans' : '') + (i === exam.i ? ' cur' : '') + '" aria-label="Question ' + (i + 1) + '">' + (i + 1) + '</button>').join('') + '</div>' +
    '<div class="q"><p class="q-text">' + q.q + '</p>' + (q.code ? codeBlock(q.code, null) : '') +
    '<div class="opts">' + q.o.map((_, i) => optionHTML(q, i, exam.answers[exam.i], false, 'data-ex="' + i + '"')).join('') + '</div><div class="from">Topic: ' + q.from + '</div></div>' +
    '<div class="pager"><button class="btn ghost" data-step="-1"' + (exam.i === 0 ? ' disabled' : '') + '>← Previous</button>' +
    (exam.i < EXAM_SIZE - 1 ? '<button class="btn" data-step="1">Next →</button>' : '<button class="btn" id="exam-submit">Submit exam</button>') + '</div>' +
    '<div id="submit-confirm" hidden></div></div>';
}
function fmtTime() {
  const s = Math.max(0, Math.round((exam.endAt - Date.now()) / 1000));
  return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
}
function tick() {
  if (!exam || exam.done) { clearInterval(timer); return; }
  if (Date.now() >= exam.endAt) { finishExam(true); return; }
  const t = document.getElementById('timer');
  if (t) { t.textContent = fmtTime(); t.classList.toggle('low', exam.endAt - Date.now() < 120000); }
}
function finishExam(timedOut) {
  exam.done = true; exam.timedOut = !!timedOut;
  clearInterval(timer);
  exam.score = Math.round(exam.qs.filter((q, i) => exam.answers[i] === q.a).length / EXAM_SIZE * 100);
  if (examBest == null || exam.score > examBest) { examBest = exam.score; store.set('examBest', examBest); }
  route();
}
function examResults() {
  const right = exam.qs.filter((q, i) => exam.answers[i] === q.a).length;
  const pass = exam.score >= PASS;
  const byTopic = {};
  exam.qs.forEach((q, i) => { byTopic[q.from] = byTopic[q.from] || [0, 0]; byTopic[q.from][1]++; if (exam.answers[i] === q.a) byTopic[q.from][0]++; });
  const weak = Object.entries(byTopic).filter(([, v]) => v[0] < v[1]).map(([k]) => LESSONS.find(l => l.title === k)).filter(Boolean);
  return '<div class="col"><div class="eyebrow">Exam results' + (exam.timedOut ? ' · time ran out' : '') + '</div>' +
    '<div class="verdict ' + (pass ? 'pass' : 'fail') + '" style="margin-top:10px">' + exam.score + '% · ' + (pass ? 'Passed' : 'Not passed') + '</div>' +
    '<p class="lede" style="margin-top:12px">' + right + ' of ' + EXAM_SIZE + ' correct. Best score: ' + examBest + '%.</p>' +
    (weak.length ? '<p>Review these lessons: ' + weak.map(l => '<a href="#l-' + l.id + '">' + l.title + '</a>').join(', ') + '.</p>' : '<p>Every topic in this attempt was answered correctly.</p>') +
    '<div class="cta-row"><button class="btn" id="exam-again">Take a new exam</button><a class="btn ghost" href="#home">Back to overview</a></div>' +
    '<h2>Review</h2>' + exam.qs.map((q, qi) => {
      const p = exam.answers[qi];
      return '<div class="q"><div class="q-n">Q' + (qi + 1) + ' · ' + q.from + (p == null ? ' · unanswered' : '') + '</div><p class="q-text">' + q.q + '</p>' + (q.code ? codeBlock(q.code, null) : '') +
        '<div class="opts">' + q.o.map((_, i) => optionHTML(q, i, p, true, '')).join('') + '</div><div class="why' + (p === q.a ? '' : ' bad') + '">' + q.why + '</div></div>';
    }).join('') + '</div>';
}

/* ---------- References ---------- */
function renderReferences() {
  return '<div class="col"><div class="eyebrow">Further reading</div><h1>References</h1><p class="lede">Where to go next. Official docs win whenever a source disagrees, and older guides may use syntax from before 1.0.</p>' +
    REFERENCES.map(g => '<h2>' + g.group + '</h2><ul class="refs">' + g.items.map(r =>
      '<li><a href="' + r[1] + '" target="_blank" rel="noopener">' + r[0] + '</a> <span class="chip">' + r[3] + '</span><p>' + r[2] + '</p></li>').join('') + '</ul>').join('') + '</div>';
}

/* ---------- Router ---------- */
const main = document.getElementById('main');
function route() {
  const h = (location.hash || '#home').slice(1);
  codeStore = [];
  let view = 'home';
  if (h.startsWith('l-') && LESSONS.some(l => 'l-' + l.id === h)) { view = h; main.innerHTML = renderLesson(h.slice(2)); }
  else if (h === 'exam') { view = 'exam'; main.innerHTML = renderExam(); }
  else if (h === 'references') { view = 'references'; main.innerHTML = renderReferences(); }
  else { main.innerHTML = renderHome(); }
  renderNav(view);
  document.getElementById('rail').classList.remove('open');
  document.getElementById('menu-btn').setAttribute('aria-expanded', 'false');
}
let lastHash = location.hash;
window.addEventListener('hashchange', () => { lastHash = location.hash; route(); window.scrollTo(0, 0); });

function rerenderKeepScroll() {
  const y = window.scrollY; route(); window.scrollTo(0, y);
}

document.addEventListener('click', e => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.id === 'menu-btn') {
    const open = document.getElementById('rail').classList.toggle('open');
    t.setAttribute('aria-expanded', String(open)); return;
  }
  if (t.dataset.copy != null) {
    const text = codeStore[+t.dataset.copy];
    const ok = () => { t.textContent = 'Copied'; setTimeout(() => (t.textContent = 'Copy'), 1400); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(t.closest('.code').querySelector('pre')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); t.textContent = 'Selected'; };
    try { navigator.clipboard.writeText(text).then(ok, fallback); } catch (err) { fallback(); }
    return;
  }
  if (t.dataset.lq) {
    const id = t.dataset.lq, qi = +t.dataset.qi, oi = +t.dataset.oi;
    const st = quizState[id];
    if (st[qi] != null) return;
    st[qi] = oi;
    const L = LESSONS.find(l => l.id === id);
    if (Object.keys(st).length === L.quiz.length) {
      const right = lessonQuiz(id).filter((q, i) => st[i] === q.a).length;
      const p = progress[id] || {};
      if (p.best == null || right > p.best) { p.best = right; progress[id] = p; store.set('progress', progress); }
    }
    document.getElementById('quiz-' + id).querySelectorAll('.q, .score').forEach(n => n.remove());
    rerenderKeepScroll(); return;
  }
  if (t.dataset.retry) { quizState[t.dataset.retry] = {}; delete quizCache[t.dataset.retry]; nextAttempt('lesson-' + t.dataset.retry); rerenderKeepScroll(); document.getElementById('quiz-' + t.dataset.retry).scrollIntoView(); return; }
  if (t.id === 'exam-start' || t.id === 'exam-again') {
    exam = { qs: buildExam(), answers: Array(EXAM_SIZE).fill(null), i: 0, endAt: Date.now() + EXAM_MINUTES * 60000, done: false };
    clearInterval(timer); timer = setInterval(tick, 1000);
    route(); window.scrollTo(0, 0); return;
  }
  if (t.dataset.ex != null && exam && !exam.done) { exam.answers[exam.i] = +t.dataset.ex; rerenderKeepScroll(); return; }
  if (t.dataset.goto != null) { exam.i = +t.dataset.goto; rerenderKeepScroll(); return; }
  if (t.dataset.step) { exam.i = Math.min(EXAM_SIZE - 1, Math.max(0, exam.i + +t.dataset.step)); rerenderKeepScroll(); return; }
  if (t.id === 'exam-submit') {
    const left = exam.answers.filter(a => a == null).length;
    const box = document.getElementById('submit-confirm');
    if (left && box.hidden) {
      box.hidden = false;
      box.innerHTML = '<div class="score"><span>' + left + ' question' + (left > 1 ? 's are' : ' is') + ' unanswered and will count as wrong.</span><button class="btn" id="exam-submit-now">Submit anyway</button></div>';
      return;
    }
    finishExam(false); window.scrollTo(0, 0); return;
  }
  if (t.id === 'exam-submit-now') { finishExam(false); window.scrollTo(0, 0); return; }
  if (t.id === 'reset-progress') {
    const box = document.getElementById('reset-confirm');
    box.hidden = false;
    box.innerHTML = 'This clears quiz scores and your best exam score in this browser. <button class="btn ghost" id="reset-now">Clear progress</button>';
    return;
  }
  if (t.id === 'reset-now') {
    progress = {}; examBest = null; store.set('progress', progress); store.set('examBest', null);
    Object.keys(quizState).forEach(k => delete quizState[k]); Object.keys(quizCache).forEach(k => delete quizCache[k]); route(); return;
  }
});

route();
