(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};
  const D = () => W.Data.get();
  const $ = W.$, el = W.el, esc = W.esc;

  const ICONS = ['🎓', '💍', '🎂', '✈️', '🏮', '📅'];

  let uid = 1;
  function nextId() {
    const ids = D().countdowns.list.map(c => c.id || 0);
    while (ids.includes(uid)) uid++;
    return uid;
  }

  const st = { icon: '🎓' };

  function sortedList() {
    const t = W.Data.today();
    const list = D().countdowns.list.slice();
    const upcoming = list.filter(c => c.date >= t).sort((a, b) => a.date < b.date ? -1 : 1);
    const past = list.filter(c => c.date < t).sort((a, b) => a.date < b.date ? 1 : -1);
    return upcoming.concat(past);
  }

  function dayLabel(date) {
    const n = W.Data.daysUntil(date);
    if (n === 0) return '就是今天 🎉';
    if (n > 0) return '还有 ' + n + ' 天';
    return '已过 ' + (-n) + ' 天';
  }

  function render() {
    const v = $('#view-countdown'); if (!v) return;
    v.innerHTML = '';
    const list = sortedList();

    const f = el('div', 'card cd-form');
    const row1 = el('div', 'cd-row');
    const title = el('input', 'word-input'); title.id = 'cd-title'; title.placeholder = '名称：如四级考试 / 相识纪念日';
    row1.appendChild(title);
    f.appendChild(row1);
    const row2 = el('div', 'cd-row');
    const iconRow = el('div', 'cd-icons');
    ICONS.forEach(i => {
      const b = el('button', 'cd-icon' + (st.icon === i ? ' active' : ''), i);
      b.dataset.action = 'cd-icon-' + i;
      iconRow.appendChild(b);
    });
    row2.appendChild(iconRow);
    const date = el('input', 'cd-date'); date.type = 'date'; date.id = 'cd-date';
    const def = new Date(); def.setDate(def.getDate() + 30);
    date.value = def.getFullYear() + '-' + String(def.getMonth() + 1).padStart(2, '0') + '-' + String(def.getDate()).padStart(2, '0');
    row2.appendChild(date);
    f.appendChild(row2);
    const addBtn = el('button', 'chip-btn primary', '＋ 添加倒计时');
    addBtn.dataset.action = 'cd-add';
    f.appendChild(addBtn);
    v.appendChild(f);

    if (!list.length) {
      v.appendChild(W.UI.emptyState('⏳', '还没有倒计时，添加一个纪念日或考试吧~'));
    } else {
      // 最近的未来事件高亮
      const next = list.find(c => c.date >= W.Data.today());
      if (next) {
        const n = W.Data.daysUntil(next.date);
        const hl = el('div', 'cd-hero');
        hl.appendChild(el('div', 'cd-hero-icon', next.icon));
        hl.appendChild(el('div', 'cd-hero-title', esc(next.title)));
        const days = el('div', 'cd-hero-days', n === 0 ? '今天' : String(n));
        days.appendChild(el('div', 'cd-hero-unit', n === 0 ? '就是今天 🎉' : '天后'));
        hl.appendChild(days);
        hl.appendChild(el('div', 'cd-hero-date', esc(next.date)));
        v.appendChild(hl);
      }
      const box = el('div', 'card');
      box.appendChild(el('div', 'card-title', '全部倒计时'));
      const ul = el('div', 'cd-list');
      list.forEach(c => {
        const n = W.Data.daysUntil(c.date);
        const past = n < 0;
        const it = el('div', 'cd-item' + (past ? ' past' : ''));
        it.dataset.id = c.id;
        it.appendChild(el('span', 'cd-item-icon', c.icon));
        const mid = el('div', 'cd-item-mid');
        mid.appendChild(el('div', 'cd-item-title', esc(c.title)));
        mid.appendChild(el('div', 'cd-item-date', esc(c.date)));
        it.appendChild(mid);
        it.appendChild(el('span', 'cd-item-days', dayLabel(c.date)));
        const del = el('button', 'del', '✕'); del.dataset.action = 'cd-del';
        it.appendChild(del);
        ul.appendChild(it);
      });
      box.appendChild(ul);
      v.appendChild(box);
    }
    v.onclick = onClick;
  }

  function add() {
    const t = (($('#cd-title') || {}).value || '').trim();
    if (!t) { W.UI.toast('先填写名称'); return; }
    const date = (($('#cd-date') || {}).value || '');
    if (!date) { W.UI.toast('选择日期'); return; }
    D().countdowns.list.push({ id: nextId(), title: t, icon: st.icon, date });
    W.Data.save();
    if ($('#cd-title')) $('#cd-title').value = '';
    render();
    W.UI.toast('已添加倒计时：' + t);
  }
  function del(id) {
    D().countdowns.list = D().countdowns.list.filter(c => c.id !== id);
    W.Data.save(); render();
  }
  function onClick(e) {
    const t = e.target.closest('[data-action]'); if (!t) return;
    const a = t.dataset.action;
    const item = t.closest('.cd-item');
    const id = item ? parseInt(item.dataset.id, 10) : null;
    if (a === 'cd-add') add();
    else if (a === 'cd-del' && id != null) del(id);
    else if (a.startsWith('cd-icon-')) { st.icon = a.slice(8); render(); }
  }

  W.Countdown = { render };
})();
