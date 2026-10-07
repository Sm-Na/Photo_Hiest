(() => {
'use strict';
const C = CONFIG, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const KEY = 'photoHeist.v1'; let mem = null;
const store = {
  get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return mem; } },
  set(v) { mem = v; try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} },
  clear() { mem = null; try { localStorage.removeItem(KEY); } catch (e) {} }
};
const S = Object.assign({ screen: 'landing', q: 0, score: 0, ch: 0, vault: false, shown: 0, final: false, sound: false }, store.get() || {});
const save = () => store.set(S);
const pick = a => a[Math.floor(Math.random() * a.length)];
const strip = t => String(t).trim().toLowerCase().replace(/[\s-]+/g, '');
const same = (a, b) => strip(a) === strip(b);
const wait = ms => new Promise(r => setTimeout(r, RM ? Math.min(ms, 150) : ms));
const say = (el, t, c) => { el.textContent = t; el.className = 'msg ' + (c || ''); };
const fx = (el, c) => { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); };
const pad = n => String(n).padStart(2, '0');
const total = C.photos.length;
const frags = () => [C.quizFragment, ...C.challenges.map(c => c.fragment)];
const vaultCode = () => C.vaultCode || frags().join('');
const after = () => S.uploaded ? (total ? 'gallery' : 'done') : 'upload';
const init = {};
let nextFrom = null;

function play(n) {
  if (!S.sound || !C.sounds || !C.sounds[n]) return;
  try { const a = new Audio(C.sounds[n]); a.volume = .5; a.play().catch(() => {}); } catch (e) {}
}

// ---------- confetti ----------
const cv = $('#fx'), cx = cv.getContext('2d'); let parts = [], raf = 0;
function confetti() {
  if (RM) return;
  cv.width = innerWidth; cv.height = innerHeight;
  const cols = ['#ffb347', '#4de1ff', '#ff6b9a', '#b6ff6b', '#ffffff'];
  parts = Array.from({ length: 90 }, () => ({ x: innerWidth / 2, y: innerHeight * .4, vx: (Math.random() - .5) * 12, vy: -Math.random() * 12 - 3, s: 4 + Math.random() * 5, c: pick(cols), r: Math.random() * 6 }));
  cancelAnimationFrame(raf);
  (function f() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += .2; cx.fillStyle = p.c; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); cx.restore(); });
    parts = parts.filter(p => p.y < cv.height + 20);
    if (parts.length) raf = requestAnimationFrame(f); else cx.clearRect(0, 0, cv.width, cv.height);
  })();
}

// ---------- navigation ----------
const order = ['landing', 'm1', 'm2', 'm3', 'vault', 'upload', 'gallery', 'done'];
if (!order.includes(S.screen)) S.screen = 'landing';
function go(id) {
  S.screen = id; save();
  $$('.screen').forEach(s => s.classList.toggle('on', s.id === id));
  $('#pbar').style.width = (order.indexOf(id) / (order.length - 1) * 100) + '%';
  scrollTo(0, 0);
  const h = $('#' + id + ' h1,#' + id + ' h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  if (init[id]) init[id]();
}

// ---------- static text ----------
document.title = C.missionTitle;
$$('[data-title]').forEach(e => e.textContent = C.missionTitle);
$$('[data-her]').forEach(e => e.textContent = C.herName);
$$('[data-me]').forEach(e => e.textContent = C.myName);
const n10 = Math.round(C.difficulty / 10);
$('#diff').textContent = '█'.repeat(n10) + '░'.repeat(10 - n10) + ' ' + C.difficulty + '%';
$('#start').onclick = () => { play('click'); go('m1'); };

// ---------- mission 01 ----------
const file = $('#file');
file.addEventListener('change', async () => {
  const f = file.files && file.files[0], m = $('#m1msg');
  if (!f || !f.type.startsWith('image/')) { say(m, 'No image selected. The vault is still waiting. 👀', 'bad'); return; }
  try { $('#prev').src = URL.createObjectURL(f); } catch (e) {}
  $('#prevwrap').hidden = false; $('#scan').classList.add('on'); $('#m1next').hidden = true;
  say(m, 'Scanning evidence…', ''); play('scan');
  await wait(2400);
  $('#scan').classList.remove('on');
  say(m, 'Evidence accepted. We have confirmed the existence of the classified material. NEW EVIDENCE ACQUIRED ✅', 'ok');
  play('right'); $('#m1next').hidden = false;
});
$('#m1next').onclick = () => go('m2');

// ---------- mission 02 ----------
let tries = 0;
function renderQ() {
  const done = S.q >= C.quiz.length;
  $('#quiz').hidden = done; $('#qdone').hidden = !done;
  if (done) { $('#frag').textContent = C.vaultCode ? '🔑' : C.quizFragment; $('#score').textContent = `SCORE: ${S.score}/${C.quiz.length}`; return; }
  const q = C.quiz[S.q]; tries = 0;
  $('#qcount').textContent = `QUESTION ${S.q + 1}/${C.quiz.length}`;
  $('#qbar').style.width = (S.q / C.quiz.length * 100) + '%';
  $('#qtext').textContent = q.question; $('#qtext').dir = 'auto';
  const o = $('#opts'); o.replaceChildren();
  q.options.forEach(t => {
    const l = document.createElement('label'), r = document.createElement('input'), s = document.createElement('span');
    l.className = 'opt'; r.type = 'radio'; r.name = 'o'; r.value = t; s.textContent = t; s.dir = 'auto'; l.append(r, s); o.append(l);
  });
  say($('#qmsg'), '', '');
}
init.m2 = renderQ;
$('#qsubmit').onclick = async () => {
  const r = $('input[name=o]:checked'), m = $('#qmsg'), b = $('#qsubmit');
  if (!r) { say(m, 'Pick an answer first.', 'bad'); return; }
  const q = C.quiz[S.q];
  if (q.answers.some(a => same(a, r.value))) {
    if (!tries) S.score++; S.q++; save();
    say(m, pick(C.messages.right), 'ok'); fx($('#quiz'), 'glow'); play('right');
    b.disabled = true; await wait(1100); b.disabled = false; renderQ();
  } else {
    tries++; say(m, pick(C.messages.wrong), 'bad'); fx($('#quiz'), 'shake'); play('wrong'); r.checked = false;
  }
};
$('#m2next').onclick = () => go('m3');

// ---------- mission 03 ----------
function renderCh() {
  const done = S.ch >= C.challenges.length;
  $('#chbox').hidden = done; $('#chdone').hidden = !done;
  if (done) { $('#chfrags').textContent = C.vaultCode ? frags().map(() => '🔑').join(' ') : frags().join(' '); return; }
  const c = C.challenges[S.ch];
  $('#chcount').textContent = `CHALLENGE ${S.ch + 1}/${C.challenges.length}`;
  $('#chtitle').textContent = c.title; $('#chtext').textContent = c.text;
  $('#chcode').value = ''; say($('#chmsg'), '', '');
}
init.m3 = renderCh;
$('#chverify').onclick = async () => {
  const v = $('#chcode').value, m = $('#chmsg');
  if (!v.trim()) { say(m, 'Enter the code first. The vault cannot read minds. 🧠', 'bad'); return; }
  if (same(v, C.challenges[S.ch].code)) {
    S.ch++; save(); play('right'); say(m, 'Challenge verified. ✅ SECURITY LAYER BYPASSED', 'ok'); fx($('#chbox'), 'glow');
    await wait(1100); renderCh();
  } else { say(m, 'Nice attempt. The vault remains closed. 😂', 'bad'); fx($('#chbox'), 'shake'); play('wrong'); }
};
$('#m3next').onclick = () => go('vault');

// ---------- vault ----------
init.vault = () => {
  if (S.vault) { go(after()); return; }
  $('#vault').classList.remove('open'); $('#vfill').style.width = '0';
  $('#vlock').textContent = '🔒'; const st = $('#vstatus'); st.textContent = 'LOCKED'; st.className = 'bad mono';
  $('#vhint').textContent = C.vaultHint ? '🗝️ ' + C.vaultHint : ''; $('#vhint').hidden = !C.vaultHint;
  $('#vcount').textContent = C.photoCount || total; $('#vlevel').textContent = C.accessLevel + '%'; $('#vfrags').textContent = C.vaultCode ? frags().map(() => '🔑').join(' ') : frags().join(' ');
};
$('#vgo').onclick = async () => {
  const v = $('#vcode').value, m = $('#vmsg'), b = $('#vgo');
  if (!v.trim()) { say(m, 'Access code required. Empty guesses do not count. 😂', 'bad'); return; }
  if (!same(v, vaultCode())) { say(m, 'ACCESS DENIED. Nice attempt. 😂', 'bad'); fx($('#vault .panel:last-child'), 'shake'); play('wrong'); return; }
  b.disabled = true; say(m, '', ''); play('unlock');
  $('#vault').classList.add('open'); $('#vstatus').textContent = 'UNLOCKING…'; $('#vfill').style.width = '100%';
  await wait(2600);
  $('#vlock').textContent = '🔓'; const st = $('#vstatus'); st.textContent = 'ACCESS GRANTED'; st.className = 'ok mono';
  confetti(); S.vault = true; S.shown = Math.max(S.shown, Math.min(C.revealFirst, total)); save(); nextFrom = 0;
  await wait(1600); b.disabled = false; go('upload');
};

// ---------- upload (extraction) ----------
const U = C.upload || {}; let files = []; const sent = new Set();
$('#ufiles').addEventListener('change', () => {
  files = [...$('#ufiles').files].filter(f => f.type.startsWith('image/')); sent.clear();
  const ul = $('#ulist'); ul.replaceChildren();
  files.forEach(f => { const li = document.createElement('li'); li.textContent = '📷 ' + f.name; ul.append(li); });
  $('#ubar').style.width = '0'; $('#usend').hidden = !files.length;
  say($('#umsg'), files.length ? `${files.length} photo(s) selected.` : 'No photos selected. The vault is still waiting. 👀', files.length ? 'ok' : 'bad');
});
async function up(f) {
  const fd = new FormData(); fd.append('file', f); fd.append('upload_preset', U.preset); if (U.folder) fd.append('folder', U.folder);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${U.cloudName}/image/upload`, { method: 'POST', body: fd });
  if (!r.ok) throw new Error(r.status);
}
function uploaded(n) { S.uploaded = n; save(); say($('#umsg'), 'EXTRACTION COMPLETE. Classified material delivered. ✅', 'ok'); play('complete'); confetti(); $('#usend').hidden = true; $('#unext').hidden = false; }
$('#usend').onclick = async () => {
  const m = $('#umsg'), b = $('#usend');
  if (!files.length) { say(m, 'Select photos first.', 'bad'); return; }
  if (!(U.cloudName && U.preset)) {
    try {
      if (navigator.canShare && navigator.canShare({ files })) { await navigator.share({ files, title: C.missionTitle, text: 'Classified photos 📸' }); uploaded(files.length); }
      else say(m, `Sending is not available on this device. Send the photos to ${C.myName} directly.`, 'bad');
    } catch (e) { say(m, 'Sharing was cancelled. Tap send to try again.', 'bad'); }
    return;
  }
  b.disabled = true; say(m, 'Transmitting…', ''); play('scan');
  const items = $$('#ulist li');
  for (let i = 0; i < files.length; i++) {
    if (sent.has(i)) continue;
    items[i].textContent = '⏳ ' + files[i].name;
    try { await up(files[i]); sent.add(i); items[i].textContent = '✅ ' + files[i].name; }
    catch (e) { items[i].textContent = '❌ ' + files[i].name; }
    $('#ubar').style.width = (sent.size / files.length * 100) + '%';
  }
  b.disabled = false;
  if (sent.size === files.length) uploaded(files.length);
  else { say(m, 'Some photos failed. Tap send to retry the failed ones.', 'bad'); play('wrong'); }
};
$('#unext').onclick = () => go(total ? 'gallery' : 'done');

// ---------- gallery ----------
const PH = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="#10131c"/><text x="50%" y="50%" fill="#6b7390" font-family="monospace" font-size="18" text-anchor="middle">IMAGE MISSING</text></svg>');
function renderGrid(from) {
  const g = $('#grid'); g.replaceChildren();
  for (let i = 0; i < total; i++) {
    const b = document.createElement(i < S.shown ? 'button' : 'div'); b.className = 'tile';
    if (i < S.shown) {
      const p = C.photos[i], img = new Image(), l = document.createElement('span'), c = document.createElement('em');
      b.type = 'button'; img.loading = 'lazy'; img.alt = p.caption || `Memory ${i + 1}`;
      img.onerror = () => { img.onerror = null; img.src = PH; }; img.src = p.src;
      l.className = 'lbl'; l.textContent = `MEMORY ${pad(i + 1)} 🔓`; c.textContent = p.caption || '';
      b.append(img, l, c); b.onclick = () => openLb(i);
      if (i >= from) { b.classList.add('rev'); b.style.animationDelay = ((i - from) * 150) + 'ms'; }
    } else { b.classList.add('locked'); b.setAttribute('aria-label', 'Locked photo'); b.textContent = '🔒'; }
    g.append(b);
  }
}
function setupGallery(from) {
  renderGrid(from);
  const left = total - S.shown, over = S.final || left <= 0;
  $('#gcount').textContent = `${S.shown}/${total} RECOVERED`;
  $('#locked').hidden = over; $('#finish').hidden = !over;
  $('#leftn').textContent = left; $('#fctext').textContent = C.finalChallenge.text;
}
init.gallery = () => { setupGallery(nextFrom === null ? S.shown : nextFrom); nextFrom = null; };
$('#fgo').onclick = async () => {
  const v = $('#fcode').value, m = $('#fmsg');
  if (!v.trim()) { say(m, 'Enter the final code first.', 'bad'); return; }
  if (!same(v, C.finalChallenge.code)) { say(m, 'Nice attempt. The remaining photos stay locked. 😂', 'bad'); fx($('#locked'), 'shake'); play('wrong'); return; }
  const from = S.shown; S.final = true; S.shown = total; save();
  play('unlock'); confetti(); say(m, '', ''); setupGallery(from);
};
$('#finish').onclick = () => go('done');
$$('[data-x]').forEach(() => {});
[['chcode', 'chverify'], ['vcode', 'vgo'], ['fcode', 'fgo']].forEach(([i, b]) => $('#' + i).addEventListener('keydown', e => { if (e.key === 'Enter') $('#' + b).click(); }));

// ---------- lightbox ----------
const lb = $('#lb'); let cur = 0, last = null, tx = 0;
function showLb(i) {
  cur = (i + S.shown) % S.shown; const p = C.photos[cur], im = $('#lbimg');
  im.onerror = () => { im.onerror = null; im.src = PH; }; im.src = p.src; im.alt = p.caption || '';
  $('#lbcap').textContent = `MEMORY ${pad(cur + 1)} ${p.caption ? '· ' + p.caption : ''}`;
}
function openLb(i) { last = document.activeElement; lb.hidden = false; document.body.style.overflow = 'hidden'; showLb(i); $('#lbclose').focus(); }
function closeLb() { lb.hidden = true; document.body.style.overflow = ''; if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); if (last) last.focus(); }
$('#lbclose').onclick = closeLb; $('#lbprev').onclick = () => showLb(cur - 1); $('#lbnext').onclick = () => showLb(cur + 1);
$('#lbfs').onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : lb.requestFullscreen && lb.requestFullscreen().catch(() => {}); } catch (e) {} };
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') showLb(cur - 1); if (e.key === 'ArrowRight') showLb(cur + 1);
});
lb.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) showLb(cur + (d < 0 ? 1 : -1)); }, { passive: true });

// ---------- final screen ----------
init.done = () => {
  $('#dcount').textContent = total ? `${S.shown} / ${total}` : `${S.uploaded || 0}`; $('#dview').hidden = !total;
  $('#fmessage').textContent = `${C.finalMessage}  — ${C.myName}`;
  play('complete'); confetti();
};
$('#dview').onclick = () => go('gallery');

// ---------- sound / settings ----------
const snd = $('#snd');
const syncSnd = () => { snd.textContent = S.sound ? '🔊' : '🔇'; snd.setAttribute('aria-pressed', S.sound); };
snd.onclick = () => { S.sound = !S.sound; save(); syncSnd(); play('click'); };
syncSnd();
$('#gear').onclick = () => { const m = $('#menu'); m.hidden = !m.hidden; $('#gear').setAttribute('aria-expanded', !m.hidden); };
$('#reset').onclick = () => { if (confirm('Reset all mission progress?')) { store.clear(); location.reload(); } };
document.addEventListener('click', e => { if (e.target.closest('.btn')) play('click'); });

go(S.screen);
})();
