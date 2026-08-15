(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};
  const D = () => W.Data.get();
  const $ = W.$, el = W.el, esc = W.esc;

  let idleTimer = null, decayTimer = null;

  function wearable(w) {
    let s = '';
    if (w.hat === 'hat-red') s += '<path d="M44 56 q18 -22 36 0 l8 9 h-52 z" fill="#c04343"/>';
    if (w.hat === 'crown') s += '<path d="M42 58 l8 -20 7 14 5 -18 7 18 7 -14 8 20 z" fill="#f2c94c" stroke="#c8901f" stroke-width="1.5"/>';
    if (w.hat === 'cap-blue') s += '<path d="M42 58 q0 -22 36 -22 q36 0 36 22 q-36 -8 -72 0 z" fill="#3f6fb5"/><circle cx="60" cy="34" r="5" fill="#fff"/>';
    if (w.scarf === 'scarf-yellow') s += '<path d="M42 98 q20 12 40 0 q-4 14 -20 18 q-18 -4 -20 -18 z" fill="#f5c542"/><path d="M62 110 q8 16 0 30 l-12 2 q4 -18 -2 -30 z" fill="#e0a92f"/>';
    if (w.scarf === 'scarf-red') s += '<path d="M42 98 q20 12 40 0 q-4 14 -20 18 q-18 -4 -20 -18 z" fill="#c94f4f"/><path d="M62 110 q8 16 0 30 l-12 2 q4 -18 -2 -30 z" fill="#a83a3a"/>';
    if (w.bow === 'bow-pink') s += '<path d="M82 50 q12 -10 24 0 q-12 10 -24 0 z M82 50 q12 10 24 0 q-12 -10 -24 0 z" fill="#e88aa0"/><circle cx="94" cy="50" r="3.5" fill="#d56a86"/>';
    if (w.bow === 'bow-blue') s += '<path d="M82 50 q12 -10 24 0 q-12 10 -24 0 z M82 50 q12 10 24 0 q-12 -10 -24 0 z" fill="#5b8dd6"/><circle cx="94" cy="50" r="3.5" fill="#3f6fb5"/>';
    if (w.glasses === 'goggle') s += '<circle cx="50" cy="76" r="8.5" fill="rgba(0,0,0,.15)" stroke="#2b2b2b" stroke-width="3"/><circle cx="72" cy="76" r="8.5" fill="rgba(0,0,0,.15)" stroke="#2b2b2b" stroke-width="3"/><path d="M58.5 76 h3 M80.5 76 h9" stroke="#2b2b2b" stroke-width="3"/>';
    if (w.glasses === 'glasses-round') s += '<circle cx="49" cy="75" r="9" fill="rgba(0,0,0,.12)" stroke="#c8901f" stroke-width="2.5"/><circle cx="71" cy="75" r="9" fill="rgba(0,0,0,.12)" stroke="#c8901f" stroke-width="2.5"/><path d="M58 75 h3 M80 75 h8" stroke="#c8901f" stroke-width="2.5"/>';
    if (w.coat === 'coat-brown') s += '<path d="M44 106 q36 14 72 0 q-2 24 -36 28 q-34 -2 -36 -28 z" fill="#8a5a2b"/>';
    if (w.coat === 'coat-denim') s += '<path d="M44 106 q36 14 72 0 q-2 24 -36 28 q-34 -2 -36 -28 z" fill="#4a6fa5"/><path d="M66 114 l5 12 M78 114 l-5 12" stroke="#3a5a8a" stroke-width="4" stroke-linecap="round" fill="none"/>';
    if (w.coat === 'coat-stripe') s += '<path d="M44 106 q36 14 72 0 q-2 24 -36 28 q-34 -2 -36 -28 z" fill="#ece7da"/><path d="M44 118 q36 12 72 0" stroke="#7d5ba6" stroke-width="5" fill="none"/><path d="M45 128 q34 12 70 0" stroke="#7d5ba6" stroke-width="5" fill="none"/>';
    if (w.neck === 'collar') s += '<path d="M44 103 q36 16 72 0 l-4 8 q-32 12 -64 0 z" fill="#c0392b"/><circle cx="80" cy="113" r="5.5" fill="#f2c94c" stroke="#c8901f" stroke-width="1.5"/><circle cx="80" cy="114" r="1.8" fill="#c8901f"/>';
    return s;
  }

  function svgPet() {
    const w = D().shop.worn || {};
    const black = '#2a1f18', white = '#fbf8f0', tan = '#d89a4e', nose = '#221a14';
    return '<svg viewBox="0 0 160 160" width="160" height="160">' +
      // 后腿(白袜子, 藏在身体后)
      '<g class="legs">' +
      '<ellipse cx="90" cy="144" rx="11" ry="13" fill="' + black + '"/>' +
      '<ellipse cx="90" cy="150" rx="9" ry="8" fill="' + white + '"/>' +
      '<ellipse cx="102" cy="146" rx="10" ry="12" fill="' + black + '"/>' +
      '<ellipse cx="102" cy="151" rx="8" ry="7" fill="' + white + '"/>' +
      '</g>' +
      // 尾巴
      '<g class="tail"><path style="transform-origin:116px 104px" d="M116 104 q26 -6 18 -38" stroke="' + black + '" stroke-width="13" stroke-linecap="round" fill="none"/></g>' +
      // 身体: 黑色圆润躯干 + 白色胸毛
      '<g class="body">' +
      '<path d="M42 118 q0 -28 36 -28 q36 0 36 28 q0 30 -36 30 q-36 0 -36 -30 z" fill="' + black + '"/>' +
      '<path d="M56 110 q0 -18 24 -18 q24 0 24 18 q0 24 -24 24 q-24 0 -24 -24 z" fill="' + white + '"/>' +
      '</g>' +
      wearable(w) +
      // 头: 圆脸 + 白额纹 + 白嘴 + 棕色眉毛/脸颊 + 鼻子嘴巴舌头
      '<g class="head">' +
      '<path d="M60 42 q22 -4 30 9 q11 11 3 24 q-5 13 -33 13 q-28 0 -33 -13 q-8 -13 3 -24 q8 -13 30 -9 z" fill="' + black + '"/>' +
      '<path d="M60 46 q8 -2 10 7 q2 12 -4 20 q-3 5 -6 5 q-3 0 -6 -5 q-6 -8 -4 -20 q2 -9 10 -7 z" fill="' + white + '"/>' +
      '<ellipse cx="60" cy="92" rx="21" ry="14" fill="' + white + '"/>' +
      '<ellipse cx="44" cy="64" rx="6.5" ry="4.5" fill="' + tan + '"/>' +
      '<ellipse cx="76" cy="64" rx="6.5" ry="4.5" fill="' + tan + '"/>' +
      '<ellipse cx="37" cy="86" rx="6" ry="5" fill="' + tan + '"/>' +
      '<ellipse cx="83" cy="86" rx="6" ry="5" fill="' + tan + '"/>' +
      '<ellipse cx="40" cy="79" rx="4.5" ry="3" fill="rgba(242,139,139,.5)"/>' +
      '<ellipse cx="80" cy="79" rx="4.5" ry="3" fill="rgba(242,139,139,.5)"/>' +
      '<path d="M56 84 q4 -5 8 0 q2 4 -4 6 q-4 -2 -4 -6 z" fill="' + nose + '"/>' +
      '<path d="M60 91 q1 6 8 6" stroke="' + nose + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M66 97 q2 6 -1 8 q-5 3 -6 -5 q3 -4 7 -3 z" fill="#f28b8b"/>' +
      '</g>' +
      // 耳朵(垂耳)
      '<g class="ears">' +
      '<path class="ear" d="M33 58 q-18 -18 -2 -30 q14 -4 19 10 z" fill="#1b130d"/>' +
      '<path class="ear" d="M87 58 q18 -18 2 -30 q-14 -4 -19 10 z" fill="#1b130d"/>' +
      '</g>' +
      // 眼睛(大而圆)
      '<g class="eyes">' +
      '<circle class="eye" cx="49" cy="75" r="6" fill="' + nose + '"/>' +
      '<circle class="eye" cx="71" cy="75" r="6" fill="' + nose + '"/>' +
      '<circle cx="51" cy="73" r="2.1" fill="#fff"/>' +
      '<circle cx="73" cy="73" r="2.1" fill="#fff"/>' +
      '</g>' +
      // 前腿(白袜子, 在身体前)
      '<g class="front-legs">' +
      '<ellipse cx="58" cy="143" rx="11" ry="15" fill="' + black + '"/>' +
      '<ellipse cx="58" cy="150" rx="9" ry="8" fill="' + white + '"/>' +
      '<ellipse cx="78" cy="145" rx="11" ry="15" fill="' + black + '"/>' +
      '<ellipse cx="78" cy="152" rx="9" ry="8" fill="' + white + '"/>' +
      '</g>' +
      '</svg>';
  }

  function renderStage() {
    const stage = $('#pet-stage'); if (!stage) return;
    stage.innerHTML = '';
    stage.className = 'pet-stage pet-bg-' + (D().pet.bg || 'grass');
    const wrap = el('div', 'pet-wrap');
    wrap.innerHTML = svgPet();
    stage.appendChild(wrap);
    stage.style.setProperty('--stage-w', Math.max(60, stage.clientWidth - 30) + 'px');
    const animOn = D().settings.petAnimOn;
    if (animOn) wrap.classList.add('walking');
    const hunger = D().pet.hunger || 100;
    if (hunger >= 92) wrap.classList.add('sleep-anim');
    if ((D().pet.clean || 100) < 30) wrap.classList.add('sad-anim');
    // 点击小狗 = 抚摸
    stage.onclick = () => pet();
  }

  function refreshStats() {
    const p = D().pet;
    const set = (id, v) => { const b = $(id); if (b) b.style.width = Math.max(0, Math.min(100, v)) + '%'; };
    set('#bar-hunger', p.hunger); set('#bar-mood', p.mood); set('#bar-clean', p.clean);
    const num = (id, v) => { const n = $(id); if (n) n.textContent = Math.round(v); };
    num('#num-hunger', p.hunger); num('#num-mood', p.mood); num('#num-clean', p.clean);
    const lv = $('#pet-level'); if (lv) lv.textContent = 'Lv.' + (p.level || 1);
    renderExam();
    const wrap = $('.pet-wrap');
    if (wrap) {
      const animOn = D().settings.petAnimOn;
      wrap.classList.toggle('walking', animOn && (p.hunger || 100) < 92);
      wrap.classList.toggle('sleep-anim', (p.hunger || 100) >= 92);
      wrap.classList.toggle('sad-anim', (p.clean || 100) < 30);
    }
  }

  function renderExam() {
    const ex = D().settings.examDate;
    const c = $('#exam-corner');
    if (!ex || !c) return;
    const days = W.Data.daysUntil(ex);
    c.hidden = false;
    c.innerHTML = days >= 0
      ? '🎯 距离四级考试<br><span class="days">' + days + '</span> 天'
      : '🎉 四级考试已结束，辛苦了！';
  }

  // ---- 属性衰减 ----
  function applyDecay() {
    const p = D().pet;
    const now = Date.now();
    const min = Math.floor((now - (p.lastDecayAt || now)) / 60000);
    if (min >= 10) {
      const steps = Math.floor(min / 10);
      p.hunger = Math.max(0, (p.hunger || 100) - steps);
      p.mood = Math.max(0, (p.mood || 100) - steps * 0.8);
      p.clean = Math.max(0, (p.clean || 100) - steps);
      p.lastDecayAt += steps * 10 * 60000;
      W.Data.save();
      refreshStats();
    }
  }

  // ---- 互动 ----
  function pet() {
    const p = D().pet;
    const now = Date.now();
    if (now - (p.lastPetAt || 0) < 10 * 60 * 1000) {
      const left = Math.ceil((10 * 60 * 1000 - (now - p.lastPetAt)) / 60000);
      W.UI.toast('毛毛正开心，等 ' + left + ' 分钟再摸它吧~'); return;
    }
    p.lastPetAt = now;
    p.mood = Math.min(100, (p.mood || 100) + 5);
    W.Data.save();
    happy(); refreshStats();
    W.UI.AudioMgr.woof();
    W.UI.toast('毛毛蹭了蹭你的手，心情 +5');
  }

  function happy() {
    const wrap = $('.pet-wrap'); if (!wrap) return;
    wrap.classList.add('tail-wag'); heart();
    setTimeout(() => wrap.classList.remove('tail-wag'), 1500);
  }
  function heart() {
    const stage = $('#pet-stage'); if (!stage) return;
    const h = el('span', 'heart', '💖');
    h.style.cssText = 'position:absolute;left:56%;top:26%;font-size:24px;animation:floatHeart 1s ease-out forwards;pointer-events:none;z-index:5';
    stage.appendChild(h); setTimeout(() => h.remove(), 1100);
  }

  async function feed() {
    const good = W.Shop.good;
    const foods = D().shop.backpack.map((b, i) => ({ i, g: good(b.id) })).filter(x => x.g && x.g.effect === 'hunger');
    if (!foods.length) { W.UI.toast('背包里没有食物，先去商城买点吧~'); W.Shop.showPanel('panel-shop'); return; }
    const list = el('div', 'dict-list');
    foods.forEach(f => {
      const it = el('div', 'dict-item', '<span class="w">' + f.g.icon + ' ' + esc(f.g.name) + '</span><span class="m">饥饿 +' + f.g.val + '</span>');
      it.style.cursor = 'pointer';
      it.onclick = () => { W.Shop.use(f.i); spin(); W.UI.AudioMgr.bark(2); W.UI.toast('毛毛吃得津津有味~'); };
      list.appendChild(it);
    });
    W.UI.modal({ title: '🍖 喂食', body: list });
  }
  function spin() {
    const wrap = $('.pet-wrap'); if (!wrap) return;
    wrap.classList.add('tail-wag', 'roll-anim');
    setTimeout(() => wrap.classList.remove('tail-wag', 'roll-anim'), 1400);
  }

  async function cleanPet() {
    const good = W.Shop.good;
    const items = D().shop.backpack.map((b, i) => ({ i, g: good(b.id) })).filter(x => x.g && x.g.effect === 'clean');
    if (!items.length) { W.UI.toast('背包里没有清洁道具~'); W.Shop.showPanel('panel-shop'); return; }
    const list = el('div', 'dict-list');
    items.forEach(f => {
      const it = el('div', 'dict-item', '<span class="w">' + f.g.icon + ' ' + esc(f.g.name) + '</span><span class="m">清洁 +' + f.g.val + '</span>');
      it.style.cursor = 'pointer';
      it.onclick = () => { W.Shop.use(f.i); happy(); W.UI.AudioMgr.splash(); };
      list.appendChild(it);
    });
    W.UI.modal({ title: '🛁 清洁', body: list });
  }

  // ---- 等级 ----
  function levelFromExp(exp) { return Math.floor((exp || 0) / 150) + 1; }
  function checkLevelUp() {
    const p = D().pet;
    const lv = levelFromExp(p.exp);
    if (lv > (p.level || 1)) {
      p.level = lv; W.Data.save();
      refreshStats();
      W.UI.AudioMgr.bark(2);
      W.UI.toast('🎉 毛毛升到 Lv.' + lv + ' 啦！');
      if (lv >= 3) W.UI.toast('解锁新背景：书桌');
      if (lv >= 5) W.UI.toast('解锁新背景：飘窗');
    }
  }

  // ---- 背景 ----
  async function pickBg() {
    const lv = D().pet.level || 1;
    const bgs = [['grass', '🌿 草地', 1], ['desk', '🪵 书桌', 3], ['window', '🪟 飘窗', 5]];
    const body = el('div', 'dict-list');
    bgs.forEach(([id, name, need]) => {
      const it = el('div', 'dict-item', '<span class="w">' + name + '</span><span class="m">' + (lv >= need ? '✓ 已解锁' : need + ' 级解锁') + '</span>');
      if (lv >= need) {
        it.style.cursor = 'pointer';
        it.onclick = () => { D().pet.bg = id; W.Data.save(); renderStage(); W.UI.toast('已切换到 ' + name); };
      }
      body.appendChild(it);
    });
    await W.UI.modal({ title: '🏞 宠物背景', body });
  }

  // ---- 签到 ----
  function signinHTML() {
    const s = D().signin;
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    let cells = '';
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
      const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const checked = (s.lastDate || '') === ds;
      cells += '<div class="signin-day' + (checked ? ' checked' : '') + '">' + (i === 6 ? '日' : '一二三四五六'[i]) + (checked ? ' ✓' : '') + '</div>';
    }
    return '<div class="signin-streak">🔥 已连续签到 <b>' + (s.streak || 0) + '</b> 天 · 累计 ' + (s.totalDays || 0) + ' 天</div>' +
      '<div class="signin-week">' + cells + '</div>' +
      '<div class="signin-streak" style="color:var(--text-sub)">今天签到：积分 +' + (10 + ((s.streak || 0) + 1) * 5) + '</div>';
  }
  async function checkSignin() {
    const s = D().signin; const t = W.Data.today();
    if (s.lastDate === t) return;
    const body = el('div', null); body.innerHTML = signinHTML();
    const res = await W.UI.modal({ title: '📅 每日签到', body, actions: [
      { label: '先不签', value: false }, { label: '✍️ 签到', value: true }
    ] });
    if (res) doSignin();
  }
  function doSignin() {
    const s = D().signin; const t = W.Data.today();
    const isConsecutive = s.lastDate === W.Data.addDays(t, -1);
    s.streak = isConsecutive ? (s.streak || 0) + 1 : 1;
    s.totalDays = (s.totalDays || 0) + 1;
    s.lastDate = t;
    const reward = 10 + s.streak * 5;
    W.Data.save();
    W.Data.addPoints(reward);
    let extra = '';
    if (s.streak % 7 === 0) { D().shop.backpack.push({ id: 'meat', t: Date.now() }); W.Data.save(); extra = ' 🎁 连签礼包：肉肉零食 ×1'; }
    W.UI.toast('签到成功！连续 ' + s.streak + ' 天，+' + reward + ' 积分' + extra);
    W.UI.AudioMgr.bark(1);
    refreshStats();
  }
  async function manualSignin() {
    const s = D().signin; const t = W.Data.today();
    if (s.lastDate === t) { W.UI.toast('今天已经签过到啦，明天再来~'); return; }
    const body = el('div', null); body.innerHTML = signinHTML();
    const res = await W.UI.modal({ title: '📅 每日签到', body, actions: [{ label: '取消', value: false }, { label: '✍️ 签到', value: true }] });
    if (res) doSignin();
  }

  // ---- 学习完成庆祝 ----
  function celebrate() {
    const wrap = $('.pet-wrap'); if (!wrap) return;
    wrap.classList.remove('jump-anim'); void wrap.offsetWidth;
    wrap.classList.add('jump-anim');
    heart();
    W.UI.AudioMgr.bark(2);
    setTimeout(() => wrap.classList.remove('jump-anim'), 900);
  }

  function refresh() { renderStage(); refreshStats(); }

  function init() {
    applyDecay();
    // 绑定互动
    $('#btn-feed').onclick = feed;
    $('#btn-pet').onclick = pet;
    $('#btn-clean').onclick = cleanPet;
    $('#btn-signin').onclick = manualSignin;
    $('#btn-shop').onclick = () => { W.Shop.renderShop(); W.Shop.showPanel('panel-shop'); };
    $('#btn-backpack').onclick = () => { W.Shop.renderBackpack(); W.Shop.showPanel('panel-backpack'); };
    const toggle = $('#toggle-anim');
    toggle.checked = D().settings.petAnimOn;
    toggle.onchange = () => { D().settings.petAnimOn = toggle.checked; W.Data.save(); renderStage(); };
    // 背景按钮
    const acts = $('.pet-actions');
    if (acts && !$('#btn-bg')) {
      const bg = el('button', 'chip-btn act', '🏞 背景'); bg.id = 'btn-bg'; bg.onclick = pickBg;
      acts.insertBefore(bg, acts.querySelector('.anim-toggle'));
    }
    refresh();
    idleTimer = setInterval(() => {
      if (!D().settings.petAnimOn) return;
      const wrap = $('.pet-wrap'); if (!wrap) return;
      if (wrap.classList.contains('sleep-anim')) return;
      const r = Math.random();
      if (r < 0.45) { wrap.classList.add('eye-blink'); setTimeout(() => wrap.classList.remove('eye-blink'), 260); }
      else if (r < 0.72) { wrap.classList.add('tail-wag'); setTimeout(() => wrap.classList.remove('tail-wag'), 1400); }
      else if (r < 0.85) { wrap.classList.add('roll-anim'); setTimeout(() => wrap.classList.remove('roll-anim'), 1300); }
      else { heart(); }
    }, 2800);
    decayTimer = setInterval(applyDecay, 60000);
    window.addEventListener('resize', () => { const st = $('#pet-stage'); if (st) st.style.setProperty('--stage-w', Math.max(60, st.clientWidth - 30) + 'px'); });
  }

  W.Pet = { init, refresh, refreshStats, refreshStage: renderStage, renderExam, checkLevelUp, celebrate, checkSignin, applyDecay };
})();
