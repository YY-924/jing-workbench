(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};
  const D = () => W.Data.get();
  const $ = W.$, el = W.el, esc = W.esc;

  let idleTimer = null, decayTimer = null;

  function wearable(w) {
    let s = '';
    if (w.hat === 'hat-red') s += '<path d="M48 60 q0 -24 32 -24 q32 0 32 24 q-32 -9 -64 0 z" fill="#c04343"/><path d="M46 58 h68 l-2 7 h-64 z" fill="#a83232"/><circle cx="80" cy="31" r="6" fill="#e07878"/>';
    if (w.hat === 'crown') s += '<path d="M50 60 L56 44 L62 55 L68 41 L74 55 L80 41 L86 55 L92 41 L98 55 L104 44 L110 60 Z" fill="#f2c94c" stroke="#c8901f" stroke-width="1.5"/>';
    if (w.hat === 'cap-blue') s += '<path d="M48 60 q0 -22 32 -22 q32 0 32 22 q-32 -9 -64 0 z" fill="#3f6fb5"/><circle cx="80" cy="33" r="5" fill="#fff"/><path d="M46 58 q34 8 68 0 l2 7 q-36 9 -72 0 z" fill="#2e5690"/>';
    if (w.scarf === 'scarf-yellow') s += '<path d="M48 100 q32 14 64 0 l-2 10 q-30 12 -60 0 z" fill="#f5c542"/><path d="M80 112 q6 16 0 28 l-14 2 q6 -18 -2 -30 z" fill="#e0a92f"/>';
    if (w.scarf === 'scarf-red') s += '<path d="M48 100 q32 14 64 0 l-2 10 q-30 12 -60 0 z" fill="#c94f4f"/><path d="M80 112 q6 16 0 28 l-14 2 q6 -18 -2 -30 z" fill="#a83a3a"/>';
    if (w.bow === 'bow-pink') s += '<path d="M88 52 q12 -11 24 0 q-12 11 -24 0 z M88 52 q12 11 24 0 q-12 -11 -24 0 z" fill="#e88aa0"/><circle cx="100" cy="52" r="3.5" fill="#d56a86"/>';
    if (w.bow === 'bow-blue') s += '<path d="M88 52 q12 -11 24 0 q-12 11 -24 0 z M88 52 q12 11 24 0 q-12 -11 -24 0 z" fill="#5b8dd6"/><circle cx="100" cy="52" r="3.5" fill="#3f6fb5"/>';
    if (w.glasses === 'goggle') s += '<circle cx="63" cy="78" r="9.5" fill="rgba(0,0,0,.15)" stroke="#2b2b2b" stroke-width="3"/><circle cx="97" cy="78" r="9.5" fill="rgba(0,0,0,.15)" stroke="#2b2b2b" stroke-width="3"/><path d="M72.5 78 h3 M101.5 78 h8 M53.5 78 h-9 M106.5 78 h9" stroke="#2b2b2b" stroke-width="3"/>';
    if (w.glasses === 'glasses-round') s += '<circle cx="63" cy="78" r="9.5" fill="rgba(0,0,0,.12)" stroke="#c8901f" stroke-width="2.5"/><circle cx="97" cy="78" r="9.5" fill="rgba(0,0,0,.12)" stroke="#c8901f" stroke-width="2.5"/><path d="M72.5 78 h3 M101.5 78 h8 M53.5 78 h-9 M106.5 78 h9" stroke="#c8901f" stroke-width="2.5"/>';
    if (w.coat === 'coat-brown') s += '<path d="M42 98 q38 12 76 0 q-2 26 -38 30 q-36 -2 -38 -30 z" fill="#8a5a2b"/>';
    if (w.coat === 'coat-denim') s += '<path d="M42 98 q38 12 76 0 q-2 26 -38 30 q-36 -2 -38 -30 z" fill="#4a6fa5"/><path d="M66 116 l5 12 M82 116 l-5 12" stroke="#3a5a8a" stroke-width="4" stroke-linecap="round" fill="none"/>';
    if (w.coat === 'coat-stripe') s += '<path d="M42 98 q38 12 76 0 q-2 26 -38 30 q-36 -2 -38 -30 z" fill="#ece7da"/><path d="M42 116 q38 12 76 0" stroke="#7d5ba6" stroke-width="5" fill="none"/><path d="M44 128 q36 10 72 0" stroke="#7d5ba6" stroke-width="5" fill="none"/>';
    if (w.neck === 'collar') s += '<path d="M44 100 q36 14 72 0 l-4 9 q-32 12 -64 0 z" fill="#c0392b"/><circle cx="80" cy="113" r="5.5" fill="#f2c94c" stroke="#c8901f" stroke-width="1.5"/><circle cx="80" cy="114" r="1.8" fill="#c8901f"/>';
    return s;
  }

  function svgPet() {
    const w = D().shop.worn || {};
    const black = '#241a14', white = '#fdf8ef', tan = '#d69a4e', nose = '#17100b', paw = '#f2a6ac';
    return '<svg viewBox="0 0 160 160" width="160" height="160">' +
      // 后腿(白袜套, 藏在身体后)
      '<g class="legs">' +
      '<ellipse cx="56" cy="138" rx="11" ry="14" fill="' + black + '"/>' +
      '<ellipse cx="56" cy="145" rx="9" ry="7" fill="' + white + '"/>' +
      '<ellipse cx="104" cy="138" rx="11" ry="14" fill="' + black + '"/>' +
      '<ellipse cx="104" cy="145" rx="9" ry="7" fill="' + white + '"/>' +
      '</g>' +
      // 尾巴(粗绒尾)
      '<g class="tail"><path style="transform-origin:118px 100px" d="M118 100 q26 -6 16 -36" stroke="' + black + '" stroke-width="13" stroke-linecap="round" fill="none"/></g>' +
      // 身体: 黑色圆润躯干 + 白色胸毛
      '<g class="body">' +
      '<ellipse cx="80" cy="114" rx="40" ry="30" fill="' + black + '"/>' +
      '<ellipse cx="80" cy="106" rx="23" ry="16" fill="' + white + '"/>' +
      '</g>' +
      // 头: 圆脸 + 白额纹 + 白嘴 + 棕色眉毛/脸颊 + 鼻子嘴巴舌头
      '<g class="head">' +
      '<ellipse cx="80" cy="74" rx="37" ry="34" fill="' + black + '"/>' +
      '<path d="M80 44 q9 18 4 30 q-3 12 -4 12 q-1 0 -4 -12 q-5 -12 4 -30 z" fill="' + white + '"/>' +
      '<ellipse cx="80" cy="95" rx="21" ry="14" fill="' + white + '"/>' +
      '<ellipse cx="62" cy="62" rx="6" ry="4.5" fill="' + tan + '"/>' +
      '<ellipse cx="98" cy="62" rx="6" ry="4.5" fill="' + tan + '"/>' +
      '<ellipse cx="47" cy="90" rx="7" ry="5.5" fill="' + tan + '"/>' +
      '<ellipse cx="113" cy="90" rx="7" ry="5.5" fill="' + tan + '"/>' +
      '<ellipse cx="50" cy="84" rx="4.5" ry="3.2" fill="rgba(247,143,150,.5)"/>' +
      '<ellipse cx="110" cy="84" rx="4.5" ry="3.2" fill="rgba(247,143,150,.5)"/>' +
      '<path d="M74 88 q6 -7 12 0 q0 5 -6 7 q-6 -2 -6 -7 z" fill="' + nose + '"/>' +
      '<path d="M80 95 q0 8 7 7" stroke="' + nose + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M86 100 q2 7 -1 9 q-5 3 -7 -4 q3 -4 8 -5 z" fill="#f28b8b"/>' +
      '</g>' +
      // 耳朵(软垂耳)
      '<g class="ears">' +
      '<path class="ear" d="M50 56 q-22 -22 -4 -32 q15 -5 18 10 z" fill="#17100b"/>' +
      '<path class="ear" d="M110 56 q22 -22 4 -32 q-15 -5 -18 10 z" fill="#17100b"/>' +
      '</g>' +
      // 眼睛(大而亮)
      '<g class="eyes">' +
      '<circle class="eye" cx="63" cy="78" r="7.5" fill="' + nose + '"/>' +
      '<circle class="eye" cx="97" cy="78" r="7.5" fill="' + nose + '"/>' +
      '<circle cx="65.6" cy="75.4" r="2.5" fill="#fff"/>' +
      '<circle cx="99.6" cy="75.4" r="2.5" fill="#fff"/>' +
      '<circle cx="60.5" cy="80.5" r="1.1" fill="#fff"/>' +
      '<circle cx="94.5" cy="80.5" r="1.1" fill="#fff"/>' +
      '</g>' +
      wearable(w) +
      // 前腿(白袜套 + 粉爪垫, 在身体前)
      '<g class="front-legs">' +
      '<ellipse cx="70" cy="138" rx="11" ry="15" fill="' + black + '"/>' +
      '<ellipse cx="70" cy="145" rx="9" ry="8" fill="' + white + '"/>' +
      '<ellipse cx="90" cy="138" rx="11" ry="15" fill="' + black + '"/>' +
      '<ellipse cx="90" cy="145" rx="9" ry="8" fill="' + white + '"/>' +
      '<ellipse cx="66" cy="147" rx="2.6" ry="2" fill="' + paw + '"/>' +
      '<ellipse cx="70" cy="149" rx="2.6" ry="2" fill="' + paw + '"/>' +
      '<ellipse cx="74" cy="147" rx="2.6" ry="2" fill="' + paw + '"/>' +
      '<ellipse cx="86" cy="147" rx="2.6" ry="2" fill="' + paw + '"/>' +
      '<ellipse cx="90" cy="149" rx="2.6" ry="2" fill="' + paw + '"/>' +
      '<ellipse cx="94" cy="147" rx="2.6" ry="2" fill="' + paw + '"/>' +
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

  W.Pet = { init, refresh, refreshStats, refreshStage: renderStage, renderExam, checkLevelUp, celebrate, checkSignin, applyDecay, svg: svgPet, wearable };
})();
