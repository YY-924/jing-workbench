(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};
  const D = () => W.Data.get();
  const $ = W.$, el = W.el, esc = W.esc;

  let uid = 1;
  function nextId() {
    const ids = D().notes.list.map(n => n.id || 0);
    while (ids.includes(uid)) uid++;
    return uid;
  }
  function nowStr() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  const st = { editing: null };

  function render() {
    const v = $('#view-notes'); if (!v) return;
    v.innerHTML = '';
    const list = D().notes.list.slice().sort((a, b) => (b.time || '').localeCompare(a.time || ''));

    // 编辑表单
    const editing = st.editing != null ? list.find(n => n.id === st.editing) : null;
    const f = el('div', 'card note-form');
    f.appendChild(el('div', 'note-form-title', editing ? '✎ 编辑随笔' : '📝 写随笔'));
    const title = el('input', 'word-input'); title.id = 'note-title';
    title.placeholder = '标题（可选）';
    if (editing) title.value = editing.title || '';
    f.appendChild(title);
    const content = el('textarea', 'note-content'); content.id = 'note-content';
    content.placeholder = '记录此刻的想法、心情、灵感…';
    content.rows = 4;
    if (editing) content.value = editing.content || '';
    f.appendChild(content);
    const btnRow = el('div', 'btn-row');
    const save = el('button', 'chip-btn primary', editing ? '✓ 保存修改' : '✓ 保存');
    save.dataset.action = 'note-save';
    btnRow.appendChild(save);
    if (editing) {
      const cancel = el('button', 'chip-btn', '取消');
      cancel.dataset.action = 'note-cancel';
      btnRow.appendChild(cancel);
    }
    f.appendChild(btnRow);
    v.appendChild(f);

    if (!list.length) {
      v.appendChild(W.UI.emptyState('💭', '还没有随笔，写下今天的心情吧~'));
    } else {
      const box = el('div', 'note-list');
      list.forEach(n => {
        const it = el('div', 'note-item' + (st.editing === n.id ? ' editing' : ''));
        it.dataset.id = n.id;
        const head = el('div', 'note-head');
        head.appendChild(el('span', 'note-title', esc(n.title || '无标题')));
        head.appendChild(el('span', 'note-time', esc(n.time || '')));
        it.appendChild(head);
        if (n.content) it.appendChild(el('div', 'note-body', esc(n.content)));
        const ops = el('div', 'note-ops');
        const ed = el('button', 'chip-btn sm', '✎'); ed.dataset.action = 'note-edit';
        const del = el('button', 'chip-btn sm danger', '✕'); del.dataset.action = 'note-del';
        ops.appendChild(ed); ops.appendChild(del);
        it.appendChild(ops);
        box.appendChild(it);
      });
      v.appendChild(box);
    }
    v.onclick = onClick;
  }

  function save() {
    const title = (($('#note-title') || {}).value || '').trim();
    const content = (($('#note-content') || {}).value || '').trim();
    if (!title && !content) { W.UI.toast('写点什么再保存吧~'); return; }
    const notes = D().notes.list;
    if (st.editing != null) {
      const n = notes.find(x => x.id === st.editing);
      if (n) { n.title = title; n.content = content; n.time = nowStr(); }
      st.editing = null;
      W.Data.save(); render();
      W.UI.toast('已保存修改');
    } else {
      notes.unshift({ id: nextId(), title, content, time: nowStr() });
      W.Data.save(); render();
      W.UI.toast('已保存，记录成功~');
    }
  }
  function del(id) {
    D().notes.list = D().notes.list.filter(n => n.id !== id);
    if (st.editing === id) st.editing = null;
    W.Data.save(); render();
  }
  function edit(id) {
    st.editing = id;
    render();
    const f = $('.note-form');
    if (f) f.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function onClick(e) {
    const t = e.target.closest('[data-action]'); if (!t) return;
    const a = t.dataset.action;
    const item = t.closest('.note-item');
    const id = item ? parseInt(item.dataset.id, 10) : null;
    if (a === 'note-save') save();
    else if (a === 'note-cancel') { st.editing = null; render(); }
    else if (a === 'note-del' && id != null) del(id);
    else if (a === 'note-edit' && id != null) edit(id);
  }

  W.Notes = { render };
})();
