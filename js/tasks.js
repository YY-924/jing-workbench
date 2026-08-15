(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};
  const D = () => W.Data.get();
  const $ = W.$, el = W.el, esc = W.esc;

  let uid = 1;
  function nextId() {
    const ids = D().tasks.list.map(t => t.id || 0);
    while (ids.includes(uid)) uid++;
    return uid;
  }

  function render() {
    const v = $('#view-tasks'); if (!v) return;
    const list = D().tasks.list;
    v.innerHTML = '';
    const add = el('div', 'task-add');
    const inp = el('input', 'word-input');
    inp.id = 'task-input'; inp.placeholder = '新增今日任务，回车添加…';
    inp.onkeydown = e => { if (e.key === 'Enter') addTask(); };
    add.appendChild(inp);
    const sel = el('select', null);
    sel.id = 'task-pomo'; sel.title = '绑定番茄时长';
    [['0', '无绑定'], ['25', '🍅 25分'], ['45', '🍅 45分'], ['60', '🍅 60分']].forEach(([v2, t]) => {
      const o = el('option', null, t); o.value = v2; sel.appendChild(o);
    });
    add.appendChild(sel);
    const btn = el('button', 'chip-btn', '＋'); btn.dataset.action = 'task-add'; add.appendChild(btn);
    v.appendChild(add);

    if (!list.length) {
      v.appendChild(W.UI.emptyState('📝', '今天还没有任务，加一件小事开始吧~'));
    } else {
      const box = el('div', 'card');
      const listEl = el('div', null);
      list.forEach(t => {
        const it = el('div', 'task-item' + (t.done ? ' done' : ''));
        it.dataset.id = t.id;
        const ck = el('span', 'ck', '✓'); ck.dataset.action = 'task-toggle';
        it.appendChild(ck);
        it.appendChild(el('span', 'task-text', esc(t.text)));
        if (t.bound) it.appendChild(el('span', 'pomo-tag', '🍅' + t.bound + '分'));
        const del = el('button', 'del', '✕'); del.dataset.action = 'task-del'; it.appendChild(del);
        listEl.appendChild(it);
      });
      box.appendChild(listEl);
      const clearRow = el('div', 'task-clear-row');
      const clear = el('button', 'chip-btn sm danger', '🗑 清空已完成');
      clear.dataset.action = 'task-clear-done';
      clearRow.appendChild(clear);
      box.appendChild(clearRow);
      v.appendChild(box);
    }
    v.onclick = onClick;
  }

  function addTask() {
    const inp = $('#task-input');
    const text = inp && inp.value.trim();
    if (!text) { W.UI.toast('先输入任务内容'); return; }
    const bound = parseInt(($('#task-pomo') || {}).value || '0', 10);
    const t = D().tasks;
    t.list.unshift({ id: nextId(), text, done: false, bound: bound || null, createdAt: W.Data.today() });
    W.Data.save();
    if (inp) inp.value = '';
    render();
    W.UI.toast('任务已添加' + (bound ? '，绑定番茄 ' + bound + ' 分钟' : ''));
  }

  function toggle(id) {
    const t = D().tasks;
    const task = t.list.find(x => x.id === id);
    if (!task) return;
    task.done = !task.done;
    W.Data.save();
    if (task.done) {
      W.Data.addPoints(10);
      if (W.Weekly) W.Weekly.addTaskDone();
      W.UI.toast('任务完成 +10 分，毛毛很开心~');
      if (W.Pet) W.Pet.celebrate();
    }
    render();
  }
  function del(id) {
    const t = D().tasks;
    t.list = t.list.filter(x => x.id !== id);
    W.Data.save(); render();
  }
  async function clearDone() {
    const has = D().tasks.list.some(x => x.done);
    if (!has) return;
    const ok = await W.UI.modal({ title: '清空已完成任务', body: '确定清除今天所有已完成的任务吗？', actions: [
      { label: '取消', value: false }, { label: '清除', value: true, danger: true }
    ] });
    if (!ok) return;
    D().tasks.list = D().tasks.list.filter(x => !x.done);
    W.Data.save(); render();
  }

  // 番茄结束：标记绑定时长匹配的未完成任务为完成
  function markPomodoroDone(minutes) {
    let hit = false;
    D().tasks.list.forEach(t => {
      if (!t.done && t.bound === minutes) { t.done = true; hit = true; }
    });
    if (hit) {
      W.Data.save();
      W.Data.addPoints(10);
      if (W.Weekly) W.Weekly.addTaskDone();
      if (W.Pet) W.Pet.celebrate();
      render();
      W.UI.toast('🍅 绑定的任务已标记完成，+10 分');
    }
  }

  // 次日顺延检查
  async function checkRollover() {
    const t = D().tasks;
    const today = W.Data.today();
    if (t.lastOpenDate && t.lastOpenDate !== today) {
      const undone = t.list.filter(x => !x.done);
      if (undone.length) {
        const ok = await W.UI.modal({ title: '☀️ 新的一天', body: '昨天还有 <b>' + undone.length + '</b> 条任务未完成，要顺延到今天吗？', actions: [
          { label: '不要了', value: false }, { label: '顺延', value: true }
        ] });
        t.list = ok
          ? undone.map(x => ({ ...x, done: false, createdAt: today }))
          : [];
      } else {
        t.list = [];
      }
      W.Data.save();
    }
    t.lastOpenDate = today;
    W.Data.save();
  }

  function onClick(e) {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    const item = t.closest('.task-item');
    const id = item ? parseInt(item.dataset.id, 10) : null;
    if (a === 'task-add') addTask();
    else if (a === 'task-toggle' && id != null) toggle(id);
    else if (a === 'task-del' && id != null) del(id);
    else if (a === 'task-clear-done') clearDone();
  }

  W.Tasks = { render, checkRollover, markPomodoroDone };
})();
