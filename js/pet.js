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
    if (w.scarf === 'scarf-yellow') s += '<path d="M42 98 q20 12 40 0 q-4 14 -20 18 q-18 -4 -20 -18 z" fill="#f5c542"/><path d="M62 110 q8 16 0 30 l-12 2 q4 -18 -2 -30 z" fill="#e0a92f"/>';
    if (w.bow === 'bow-pink') s += '<path d="M82 50 q12 -10 24 0 q-12 10 -24 0 z M82 50 q12 10 24 0 q-12 -10 -24 0 z" fill="#e88aa0"/><circle cx="94" cy="50" r="3.5" fill="#d56a86"/>';
    if (w.glasses === 'goggle') s += '<circle cx="50" cy="76" r="8.5" fill="rgba(0,0,0,.15)" stroke="#2b2b2b" stroke-width="3"/><circle cx="72" cy="76" r="8.5" fill="rgba(0,0,0,.15)" stroke="#2b2b2b" stroke-width="3"/><path d="M58.5 76 h3 M80.5 76 h9" stroke="#2b2b2b" stroke-width="3"/>';
    if (w.coat === 'coat-brown') s += '<path d="M44 106 q36 14 72 0 q-2 24 -36 28 q-34 -2 -36 -28 z" fill="#8a5a2b"/>';
    if (w.coat === 'coat-denim') s += '<path d="M44 106 q36 14 72 0 q-2 24 -36 28 q-34 -2 -36 -28 z" fill="#4a6fa5"/><path d="M66 114 l5 12 M78 114 l-5 12" stroke="#3a5a8a" stroke-width="4" stroke-linecap="round" fill="none"/>';
    return s;
  }

  function svgPet() {
    const w = D().shop.worn || {};
    return '<svg viewBox="0 0 160 160" width="160" height="160">' +
      '<g class="legs">' +
      '<ellipse cx="64" cy="142" rx="11" ry="13" fill="#5b3a1e"/>' +
      '<ellipse cx="96" cy="142" rx="11" ry="13" fill="#5b3a1e"/>' +
      '<ellipse cx="57" cy="147" rx="8" ry="9" fill="#f4ead9"/>' +
      '<ellipse cx="103" cy="147" rx="8" ry="9" fill="#f4ead9"/>' +
      '</g>' +
      '<g class="tail"><path d="M120 106 q24 -8 18 -34" stroke="#5b3a1e" stroke-width="12" stroke-linecap="round" fill="none"/></g>' +
      '<g class="body">' +
      '<ellipse cx="80" cy="118" rx="41" ry="27" fill="#5b3a1e"/>' +
      '<ellipse cx="80" cy="122" rx="22" ry="16" fill="#f4ead9"/>' +
      '</g>' +
      wearable(w) +
      '<g class="head">' +
      '<ellipse cx="62" cy="78" rx="32" ry="27" fill="#5b3a1e"/>' +
      '<ellipse cx="62" cy="92" rx="21" ry="13" fill="#f4ead9"/>' +
      '<ellipse cx="70" cy="85" rx="7" ry="5" fill="#2b1a0e"/>' +
      '<path d="M62 90 q1 10 8 12" stroke="#2b1a0e" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="46" cy="68" r="5.5" fill="#c79a5e"/>' +
      '<circle cx="78" cy="68" r="5.5" fill="#c79a5e"/>' +
      '</g>' +
      '<g class="ears">' +
      '<path class="ear" d="M38 68 q-16 -20 0 -32 q10 -5 16 8 z" fill="#3a2410"/>' +
      '<path class="ear" d="M86 68 q16 -20 0 -32 q-10 -5 -16 8 z" fill="#3a2410"/>' +
      '</g>' +
      '<g class="eyes">' +
      '<circle class="eye" cx="52" cy="77" r="5.5" fill="#24150a"/>' +
      '<circle class="eye" cx="72" cy="77" r="5.5" fill="#24150a"/>' +
      '<circle cx="54" cy="75" r="1.8" fill="#fff"/>' +
      '<circle cx="74" cy="75" r="1.8" fill="#fff"/>' +
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
      it.onclick = () => { W.Shop.use(f.i); spin(); W.UI.toast('毛毛吃得津津有味~'); };
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
      it.onclick = () => { W.Shop.use(f.i); happy(); };
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
