(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};
  const D = () => W.Data.get();
  const $ = W.$, el = W.el, esc = W.esc;

  let remain = 1500, total = 1500, mode = 'focus', running = false, timer = null;
  let timeEl = null;

  function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }

  function setLength(min) {
    total = Math.max(1, Math.round(min)) * 60;
    remain = total; running = false; stopTimer(); mode = 'focus';
    D().settings.pomodoroDefault = Math.round(min); W.Data.save();
    updateTime();
    updateControls();
  }

  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function tick() {
    remain--;
    if (remain <= 0) { stopTimer(); running = false; onFinish(); return; }
    updateTime();
  }

  function updateTime() {
    if (timeEl) {
      timeEl.textContent = fmt(remain);
      timeEl.style.color = remain <= 60 ? 'var(--danger)' : '';
    }
    const m = $('#pomo-mode'); if (m) m.textContent = mode === 'break' ? '短休息' : (running ? '专注中' : '专注');
  }

  function onFinish() {
    const A = W.UI.AudioMgr;
    if (mode === 'break') {
      A.ding(); A.ding();
      mode = 'focus'; setLength(D().settings.pomodoroDefault);
      W.UI.modal({ title: '🌿 休息结束', body: '休息结束啦，准备好开启新的一轮了吗？' });
    } else {
      const minutes = total / 60;
      A.ding();
      // 统计
      const p = D().pomodoro;
      const today = W.Data.today();
      if (p.todayDate !== today) { p.todayDate = today; p.todayCount = 0; }
      p.todayCount++;
      p.totalFocusMinutes += minutes;
      p.totalSessions++;
      p.maxSession = Math.max(p.maxSession || 0, minutes);
      W.Data.save();
      if (W.Weekly) W.Weekly.addFocus(minutes);
      if (W.Tasks) W.Tasks.markPomodoroDone(minutes);
      W.Data.addPoints(20);
      if (W.Pet) W.Pet.celebrate();
      updateStats();
      W.UI.modal({ title: '🍅 专注完成', body: '完整跑完 ' + minutes + ' 分钟，+20 积分。<br>接下来休息 5 分钟吧~' });
      // 自动进入 5 分钟短休息
      mode = 'break'; total = 300; remain = 300; running = false;
      updateTime(); updateControls();
    }
  }

  function toggleStart() {
    const A = W.UI.AudioMgr;
    if (running) { running = false; stopTimer(); updateControls(); return; }
    if (remain <= 0) return;
    A.ensure();
    running = true;
    timer = setInterval(tick, 1000);
    updateControls();
  }
  function reset() { stopTimer(); running = false; remain = total; updateTime(); updateControls(); }

  function updateControls() {
    const b = $('#pomo-start');
    if (b) b.textContent = running ? '⏸ 暂停' : '▶ 开始';
    const st = D().settings.whiteNoise;
    const nb = $('#noise-state'); if (nb) nb.textContent = st.on ? '白噪音：' + (st.type === 'rain' ? '🌧 雨声' : st.type === 'cafe' ? '☕ 咖啡馆' : st.type === 'music' ? '🎵 轻音乐' : '') : '';
  }

  function updateStats() {
    const p = D().pomodoro;
    const today = W.Data.today();
    if (p.todayDate !== today) { p.todayDate = today; p.todayCount = 0; W.Data.save(); }
    const s = $('#pomo-stats');
    if (s) s.innerHTML = '今日 🍅 ' + p.todayCount + ' 个 · 累计专注 ' + p.totalFocusMinutes + ' 分钟';
  }

  function setNoise(type) {
    const st = D().settings.whiteNoise;
    const A = W.UI.AudioMgr;
    if (type === 'off' || st.on && st.type === type && false) { }
    st.on = type !== 'off';
    st.type = type === 'off' ? 'rain' : type;
    W.Data.save();
    if (st.on) A.noisePlay(st.type); else A.noiseStop();
    updateControls();
    syncNoiseBtns();
  }

  function syncNoiseBtns() {
    const st = D().settings.whiteNoise;
    W.$$('#pomo-noise .chip-btn').forEach(b => {
      b.classList.toggle('active', st.on && b.dataset.noise === st.type || !st.on && b.dataset.noise === 'off');
    });
    const vol = $('#noise-vol'); if (vol) vol.value = Math.round(st.volume * 100);
  }

  function render() {
    const v = $('#view-pomo'); if (!v) return;
    const def = D().settings.pomodoroDefault || 25;
    if (mode === 'focus' && !running) setLength(def);
    v.innerHTML = '';
    const dial = el('div', 'pomo-dial');
    dial.innerHTML = '<span class="pomo-time">' + fmt(remain) + '</span><span class="pomo-mode" id="pomo-mode">专注</span>';
    v.appendChild(dial);

    const presets = el('div', 'pomo-presets');
    [25, 45, 60].forEach(m => {
      const b = el('button', 'chip-btn' + (total / 60 === m ? ' active' : ''), m + ' 分钟');
      b.dataset.min = m; b.dataset.action = 'preset'; presets.appendChild(b);
    });
    const custom = el('div', 'pomo-custom');
    custom.innerHTML = '<span style="font-size:13px;color:var(--text-sub)">自定义</span>';
    const ci = el('input', 'word-input'); ci.type = 'number'; ci.min = 1; ci.max = 120;
    ci.style.width = '70px'; ci.value = def; ci.dataset.role = 'pomo-custom';
    ci.onkeydown = e => { if (e.key === 'Enter') setLength(parseFloat(ci.value) || 25); };
    const cbtn = el('button', 'chip-btn sm', '设置'); cbtn.dataset.action = 'custom';
    custom.appendChild(ci); custom.appendChild(cbtn);
    presets.appendChild(custom);
    v.appendChild(presets);

    const noise = el('div', 'pomo-settings', null);
    noise.id = 'pomo-noise';
    const nrow = el('div', null);
    [['rain', '🌧 雨声'], ['cafe', '☕ 咖啡馆'], ['music', '🎵 轻音乐'], ['off', '🔇 关闭']].forEach(([t, l]) => {
      const b = el('button', 'chip-btn sm', l); b.dataset.noise = t; b.dataset.action = 'noise'; nrow.appendChild(b);
    });
    noise.appendChild(nrow);
    const vrow = el('div', 'set-row');
    vrow.innerHTML = '<span>音量</span>';
    const vol = el('input'); vol.type = 'range'; vol.min = 0; vol.max = 100; vol.id = 'noise-vol';
    vol.oninput = () => W.UI.AudioMgr.setNoiseVolume(parseInt(vol.value, 10) / 100);
    vrow.appendChild(vol);
    noise.appendChild(vrow);
    noise.appendChild(el('div', null, '<span id="noise-state" style="font-size:12px;color:var(--text-sub)"></span>'));
    v.appendChild(noise);

    const ctrl = el('div', 'pomo-controls');
    const start = el('button', 'chip-btn', running ? '⏸ 暂停' : '▶ 开始'); start.id = 'pomo-start'; start.dataset.action = 'start'; ctrl.appendChild(start);
    const rst = el('button', 'chip-btn', '↺ 重置'); rst.dataset.action = 'reset'; ctrl.appendChild(rst);
    v.appendChild(ctrl);

    const stats = el('div', 'pomo-today', ''); stats.id = 'pomo-stats'; v.appendChild(stats);

    v.onclick = onClick;
    timeEl = $('#view-pomo .pomo-time');
    updateStats(); syncNoiseBtns(); updateControls(); updateTime();
  }

  function onClick(e) {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    if (a === 'preset') setLength(parseInt(t.dataset.min, 10));
    else if (a === 'custom') { const ci = $('#view-pomo [data-role="pomo-custom"]'); setLength(parseFloat(ci.value) || 25); }
    else if (a === 'noise') setNoise(t.dataset.noise);
    else if (a === 'start') toggleStart();
    else if (a === 'reset') reset();
  }

  W.Pomodoro = { render, setLength, updateStats };
})();
