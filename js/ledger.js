(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};
  const D = () => W.Data.get();
  const $ = W.$, el = W.el, esc = W.esc;

  const CATS = {
    in: [
      ['salary', '💰', '工资'], ['bonus', '🎁', '奖金'], ['invest', '📈', '理财'],
      ['parttime', '💼', '兼职'], ['redpacket', '🧧', '红包'], ['other', '💵', '其他']
    ],
    out: [
      ['food', '🍜', '餐饮'], ['transport', '🚌', '交通'], ['shopping', '🛍', '购物'],
      ['entertainment', '🎮', '娱乐'], ['housing', '🏠', '居住'], ['medical', '💊', '医疗'],
      ['study', '📚', '学习'], ['phone', '📱', '通讯'], ['other', '📦', '其他']
    ]
  };
  const CAT_MAP = {};
  CATS.in.forEach(([k, i, n]) => { CAT_MAP[k] = { type: 'in', icon: i, name: n }; });
  CATS.out.forEach(([k, i, n]) => { CAT_MAP[k] = { type: 'out', icon: i, name: n }; });

  let uid = 1;
  function nextId() {
    const ids = D().ledger.records.map(r => r.id || 0);
    while (ids.includes(uid)) uid++;
    return uid;
  }

  const st = { type: 'out', cat: 'food', ym: null };
  function currentYM() {
    if (!st.ym) { const n = new Date(); st.ym = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0'); }
    return st.ym;
  }
  function monthRecords(ym) {
    return D().ledger.records
      .filter(r => (r.date || '').startsWith(ym))
      .sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id);
  }
  function money(n) {
    if (isNaN(n)) n = 0;
    return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function render() {
    const v = $('#view-ledger'); if (!v) return;
    v.innerHTML = '';
    const ym = currentYM();

    const nav = el('div', 'ledger-nav');
    const prev = el('button', 'chip-btn sm', '◀ 上月'); prev.dataset.action = 'ledger-prev';
    nav.appendChild(prev);
    nav.appendChild(el('span', 'ledger-month', ym));
    const next = el('button', 'chip-btn sm', '下月 ▶'); next.dataset.action = 'ledger-next';
    nav.appendChild(next);
    v.appendChild(nav);

    const recs = monthRecords(ym);
    let inc = 0, exp = 0;
    recs.forEach(r => { if (r.type === 'in') inc += r.amount; else exp += r.amount; });
    const sum = el('div', 'ledger-sum');
    sum.appendChild(sumCard('📈 本月收入', money(inc), 'in'));
    sum.appendChild(sumCard('📉 本月支出', money(exp), 'out'));
    sum.appendChild(sumCard('结余', money(inc - exp), (inc - exp) >= 0 ? 'in' : 'out'));
    v.appendChild(sum);

    v.appendChild(form());

    if (!recs.length) {
      v.appendChild(W.UI.emptyState('🧾', '本月还没有记账，记一笔吧~'));
    } else {
      const box = el('div', 'card');
      box.appendChild(el('div', 'card-title', '本月明细（' + recs.length + ' 笔）'));
      const list = el('div', 'ledger-list');
      recs.forEach(r => {
        const m = CAT_MAP[r.cat] || { icon: '📦', name: '其他' };
        const it = el('div', 'ledger-item');
        it.dataset.id = r.id;
        it.appendChild(el('span', 'ledger-icon', m.icon));
        const mid = el('div', 'ledger-mid');
        mid.appendChild(el('div', 'ledger-name', esc(m.name) + (r.note ? ' · ' + esc(r.note) : '')));
        mid.appendChild(el('div', 'ledger-date-txt', esc(r.date)));
        it.appendChild(mid);
        const amt = el('span', 'ledger-amt ' + (r.type === 'in' ? 'in' : 'out'), (r.type === 'in' ? '+' : '−') + money(r.amount));
        it.appendChild(amt);
        const del = el('button', 'del', '✕'); del.dataset.action = 'ledger-del';
        it.appendChild(del);
        list.appendChild(it);
      });
      box.appendChild(list);
      v.appendChild(box);
    }
    v.onclick = onClick;
  }

  function sumCard(lbl, val, cls) {
    const c = el('div', 'ledger-sum-card');
    c.appendChild(el('div', 'ledger-sum-lbl', lbl));
    c.appendChild(el('div', 'ledger-sum-val ' + cls, val));
    return c;
  }

  function form() {
    const f = el('div', 'card ledger-form');
    const typeRow = el('div', 'ledger-type-row');
    [['out', '💸 支出'], ['in', '💰 收入']].forEach(([t, lbl]) => {
      const b = el('button', 'chip-btn' + (st.type === t ? ' active' : ''), lbl);
      b.dataset.action = 'ledger-type-' + t;
      typeRow.appendChild(b);
    });
    f.appendChild(typeRow);

    const grid = el('div', 'ledger-cats');
    CATS[st.type].forEach(([k, i, n]) => {
      const c = el('button', 'ledger-cat' + (st.cat === k ? ' active' : ''), i + '<span>' + n + '</span>');
      c.dataset.action = 'ledger-cat-' + k;
      grid.appendChild(c);
    });
    f.appendChild(grid);

    const row = el('div', 'ledger-inputs');
    const amt = el('input', 'ledger-amount');
    amt.type = 'number'; amt.min = '0'; amt.step = '0.01'; amt.placeholder = '金额'; amt.id = 'ledger-amount';
    const note = el('input', 'word-input'); note.id = 'ledger-note'; note.placeholder = '备注（可选）';
    const date = el('input', 'ledger-date'); date.type = 'date'; date.id = 'ledger-date'; date.value = W.Data.today();
    row.appendChild(amt); row.appendChild(note); row.appendChild(date);
    f.appendChild(row);

    const hint = el('div', 'ledger-cat-hint', (st.type === 'in' ? '收入' : '支出') + ' · ' + (CAT_MAP[st.cat] ? CAT_MAP[st.cat].icon + ' ' + CAT_MAP[st.cat].name : ''));
    const saveBtn = el('button', 'chip-btn primary', '✓ 记一笔');
    saveBtn.dataset.action = 'ledger-add';
    f.appendChild(saveBtn);
    f.appendChild(hint);
    return f;
  }

  function add() {
    const amtEl = $('#ledger-amount');
    const amount = Math.round((parseFloat((amtEl && amtEl.value) || '0')) * 100) / 100;
    if (!amount || amount <= 0) { W.UI.toast('请输入有效金额'); return; }
    const note = (($('#ledger-note') || {}).value || '').trim();
    const date = (($('#ledger-date') || {}).value || W.Data.today());
    D().ledger.records.push({ id: nextId(), type: st.type, cat: st.cat, amount, note, date });
    W.Data.save();
    if (amtEl) amtEl.value = '';
    if ($('#ledger-note')) $('#ledger-note').value = '';
    render();
    W.UI.toast('已记一笔 ' + (CAT_MAP[st.cat] || {}).name);
  }
  function del(id) {
    D().ledger.records = D().ledger.records.filter(r => r.id !== id);
    W.Data.save(); render();
  }
  function nav(delta) {
    const [y, m] = currentYM().split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    st.ym = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    render();
  }
  function onClick(e) {
    const t = e.target.closest('[data-action]'); if (!t) return;
    const a = t.dataset.action;
    const item = t.closest('.ledger-item');
    const id = item ? parseInt(item.dataset.id, 10) : null;
    if (a === 'ledger-add') add();
    else if (a === 'ledger-del' && id != null) del(id);
    else if (a === 'ledger-prev') nav(-1);
    else if (a === 'ledger-next') nav(1);
    else if (a.startsWith('ledger-type-')) { st.type = a.slice(12); st.cat = CATS[st.type][0][0]; render(); }
    else if (a.startsWith('ledger-cat-')) { st.cat = a.slice(11); render(); }
  }

  W.Ledger = { render };
})();
