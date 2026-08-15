(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};
  const D = () => W.Data.get();
  const $ = W.$, el = W.el;

  function weekKeyFor(dateStr) {
    const now = new Date(dateStr + 'T00:00:00');
    const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const wk = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return now.getFullYear() + '-W' + String(wk).padStart(2, '0');
  }

  function thisWeekWords() {
    const cur = W.Data.weekKey(), c = D().cet4.dailyCount;
    let sum = 0;
    for (const date in c) if (weekKeyFor(date) === cur) sum += c[date];
    return sum;
  }

  function resetIfNewWeek() {
    const wk = D().weekly, cur = W.Data.weekKey();
    if (wk.week !== cur) {
      wk.week = cur; wk.focus = 0; wk.tasks = 0; wk.claimed = false;
      W.Data.save();
    }
  }

  function addFocus(min) { resetIfNewWeek(); D().weekly.focus += min; W.Data.save(); }
  function addTaskDone() { resetIfNewWeek(); D().weekly.tasks += 1; W.Data.save(); }

  async function claimGift() {
    const wk = D().weekly;
    if (wk.claimed) { W.UI.toast('本周礼包已领取，下周再来~'); return; }
    const ok = await W.UI.modal({ title: '🎁 周度学习礼包', body: '本周表现不错！礼包包含：<br>🍖 肉肉零食 ×1 · ⭐ 积分 +30', actions: [
      { label: '收下', value: true }
    ] });
    if (!ok) return;
    wk.claimed = true;
    D().shop.backpack.push({ id: 'meat', t: Date.now() });
    W.Data.save();
    W.Data.addPoints(30);
    render();
    W.UI.toast('礼包已放入背包，+30 积分');
  }

  function render() {
    const v = $('#weekly-view'); if (!v) return;
    resetIfNewWeek();
    const wk = D().weekly;
    const words = thisWeekWords();
    v.innerHTML = '';
    const grid = el('div', 'weekly-grid');
    [['📖 背词', words], ['⏱ 专注', Math.round(wk.focus) + '分'], ['✅ 任务', wk.tasks]].forEach(([l, n]) => {
      grid.appendChild(el('div', 'weekly-card', '<div class="num">' + n + '</div><div class="lbl">' + l + '</div>'));
    });
    v.appendChild(grid);
    const acts = el('div', 'weekly-actions');
    const claim = el('button', 'chip-btn' + (wk.claimed ? ' active' : ''), wk.claimed ? '✅ 本周礼包已领' : '🎁 领取本周礼包');
    claim.dataset.action = 'claim';
    acts.appendChild(claim);
    v.appendChild(acts);
    const ach = el('div', null, '');
    ach.id = 'ach-area';
    v.appendChild(ach);
    v.onclick = e => { const t = e.target.closest('[data-action]'); if (t && t.dataset.action === 'claim') claimGift(); };
    W.Achievements.renderInto($('#ach-area'));
  }

  W.Weekly = { render, addFocus, addTaskDone };
})();
