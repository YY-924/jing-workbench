(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};
  const D = () => W.Data.get();
  const $ = W.$, $$ = W.$$, el = W.el, esc = W.esc;

  function bankInfo() {
    const key = D().settings.wordbank === 'full' ? 'full' : 'curated';
    if (key === 'full' && window.CET4_WORDS_3000) {
      return { key: 'full', name: '完整词库', words: window.CET4_WORDS_3000 };
    }
    return { key: 'curated', name: '精选词库', words: window.CET4_WORDS || [] };
  }
  function allWords() { return bankInfo().words; }
  function wordObj(w) { return allWords().find(x => x.word === w); }

  const st = { mode: 'browse', idx: 0, lastIdx: 0, answer: '', result: null, reviewList: [], reviewIdx: 0 };

  function view() { return $('#view-cet4'); }

  function todayMarked(word) { return D().cet4.viewed && D().cet4.viewed[word] === W.Data.today(); }
  function markViewed(word) {
    const c = D().cet4;
    c.viewed = c.viewed || {};
    if (!c.viewed[word]) {
      c.viewed[word] = W.Data.today();
      c.totalCount = (c.totalCount || 0) + 1;
      c.dailyCount[W.Data.today()] = (c.dailyCount[W.Data.today()] || 0) + 1;
      W.Data.save();
      W.Data.addPoints(1);
    }
  }
  function countState(s) {
    const c = D().cet4, out = [];
    for (const w in c.wordStates) if (c.wordStates[w] === s) out.push(w);
    return out;
  }
  function favoriteList() { return D().cet4.favorites || []; }
  function isFav(w) { return favoriteList().includes(w); }

  let voicesReady = false;
  function enVoice() {
    const vs = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    return vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  }
  function warmVoices() {
    if (!('speechSynthesis' in window)) return;
    // 预先触发一次 getVoices(),让浏览器尽早加载语音列表
    window.speechSynthesis.getVoices();
    if (!voicesReady) {
      voicesReady = true;
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }
  function speak(word) {
    if (!('speechSynthesis' in window)) { W.UI.AudioMgr.ding(); return; }
    try {
      speechSynthesis.cancel();
      speechSynthesis.resume();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-US'; u.rate = 0.85; u.pitch = 1;
      const v = enVoice();
      if (v) u.voice = v;
      let started = false;
      u.onstart = () => { started = true; };
      u.onerror = e => {
        if (e && (e.error === 'canceled' || e.error === 'interrupted')) return;
        if (!started) W.UI.AudioMgr.ding();
      };
      // 必须同步调用 speak(),延迟会脱离用户点击的音频许可上下文导致无声
      speechSynthesis.speak(u);
      setTimeout(() => { if (!started) { try { speechSynthesis.cancel(); } catch (e) {} W.UI.AudioMgr.ding(); } }, 1800);
    } catch (e) { W.UI.AudioMgr.ding(); }
  }

  function render() {
    const v = view(); if (!v) return;
    v.innerHTML = '';
    const tb = el('div', 'cet4-toolbar');
    [['browse', '📖 背诵'], ['dictation', '✍ 默写'], ['weak', '🎯 薄弱词'], ['review', '🔁 复习'], ['fav', '📌 生词本'], ['lib', '📚 词库']].forEach(([m, t]) => {
      const b = el('button', 'chip-btn' + (st.mode === m ? ' active' : ''), t);
      b.dataset.action = 'mode-' + m; tb.appendChild(b);
    });
    const btnExam = el('button', 'chip-btn sm', '⏰ 倒计时');
    btnExam.dataset.action = 'exam'; tb.appendChild(btnExam);
    const btnExport = el('button', 'chip-btn sm', '📤 导出生词');
    btnExport.dataset.action = 'export'; tb.appendChild(btnExport);
    v.appendChild(tb);
    v.appendChild(stats());
    v.appendChild(el('div', null, '<div id="cet4-main"></div>'));
    renderMode();
  }

  function stats() {
    const c = D().cet4;
    const todayN = c.dailyCount[W.Data.today()] || 0;
    const favN = favoriteList().length;
    const box = el('div', 'cet4-stats');
    [['今日背词', todayN], ['累计', c.totalCount || 0], ['生词', favN]].forEach(([l, n]) => {
      box.appendChild(el('div', 'card', '<div class="num">' + n + '</div><div class="lbl">' + l + '</div>'));
    });
    return box;
  }

  function renderMode() {
    const m = $('#cet4-main'); if (!m) return;
    if (!allWords().length) {
      m.appendChild(W.UI.emptyState('📚', '还没有内置词库。<br>可在设置中导入词库 JSON 文件。'));
      return;
    }
    if (st.mode === 'browse') renderBrowse(m);
    else if (st.mode === 'dictation') renderDictation(m);
    else if (st.mode === 'weak') renderWeak(m);
    else if (st.mode === 'review') renderReview(m);
    else if (st.mode === 'fav') renderFav(m);
    else if (st.mode === 'lib') renderLib(m);
  }

  // ---- 背诵 ----
  function renderBrowse(m) {
    const words = allWords();
    st.idx = Math.min(st.idx, words.length - 1);
    const w = words[st.idx];
    const card = el('div', 'word-card');
    const inner = el('div', 'flip-inner');
    inner.innerHTML =
      '<div class="face">' +
      '<div class="word-main">' + esc(w.word) + '</div>' +
      '<div class="word-phonetic">' + esc(w.phonetic || '') + '</div>' +
      '<button class="chip-btn sm" data-action="speak">🔊 朗读</button>' +
      '</div>' +
      '<div class="face back">' +
      '<div class="word-meaning">' + esc(w.meaning) + '</div>' +
      '<div class="word-example">' + esc(w.example || '') + '</div>' +
      '</div>';
    card.appendChild(inner);
    const flipBtn = el('button', 'chip-btn', '🔁 翻面');
    flipBtn.dataset.action = 'flip'; card.appendChild(flipBtn);
    const actions = el('div', 'word-actions');
    [['master', '✅ 已掌握'], ['unfamiliar', '😖 不熟'], ['fav', isFav(w.word) ? '📌 移出生词本' : '📌 加入生词本']].forEach(([a, t]) => {
      const b = el('button', 'chip-btn sm', t); b.dataset.action = a; actions.appendChild(b);
    });
    card.appendChild(actions);
    const nav = el('div', 'word-nav');
    const prev = el('button', 'chip-btn sm', '‹ 上一张'); prev.dataset.action = 'prev'; nav.appendChild(prev);
    nav.appendChild(el('span', null, (st.idx + 1) + ' / ' + words.length));
    const next = el('button', 'chip-btn sm', '下一张 ›'); next.dataset.action = 'next'; nav.appendChild(next);
    card.appendChild(nav);
    m.appendChild(card);
  }

  // ---- 默写 ----
  function renderDictation(m) {
    const words = allWords();
    st.idx = Math.min(st.idx, words.length - 1);
    const w = words[st.idx];
    const card = el('div', 'word-card');
    card.innerHTML = '<div class="word-main">???</div><div class="word-phonetic">请默写下列单词</div>' +
      '<div class="word-meaning">' + esc(w.meaning) + '</div>' +
      '<div class="word-example">' + esc((w.example || '').replace(new RegExp(esc(w.word), 'gi'), '______')) + '</div>';
    if (st.result) {
      const ok = st.result === true;
      card.appendChild(el('div', 'word-meaning', (ok ? '🎉 答对了！' : '❌ 正确答案：') + '<b>' + esc(w.word) + '</b>'));
    }
    const inp = el('input', 'word-input');
    inp.placeholder = '输入英文单词…'; inp.value = st.answer || '';
    inp.dataset.role = 'dict-input';
    inp.onkeydown = e => { if (e.key === 'Enter') submitDict(); };
    card.appendChild(inp);
    const row = el('div', 'word-actions');
    const ok = el('button', 'chip-btn', '✓ 提交'); ok.dataset.action = 'dict-submit'; row.appendChild(ok);
    const skip = el('button', 'chip-btn', '跳过 ›'); skip.dataset.action = 'dict-skip'; row.appendChild(skip);
    card.appendChild(row);
    m.appendChild(card);
  }
  function submitDict() {
    const inp = $('#view-cet4 [data-role="dict-input"]');
    const answer = (inp ? inp.value : st.answer || '').trim().toLowerCase();
    const words = allWords(); const w = words[st.idx];
    if (!answer) return;
    const ok = answer === w.word.toLowerCase();
    st.answer = answer; st.result = ok;
    if (ok) { W.Data.addPoints(5); markViewed(w.word); }
    renderMode();
    if (ok && inp) setTimeout(() => next(1), 900);
  }

  // ---- 薄弱词 ----
  function renderWeak(m) {
    const weak = countState('unfamiliar');
    if (!weak.length) {
      m.appendChild(W.UI.emptyState('🎯', '暂无薄弱词。<br>背诵时把不会的单词标记为「不熟」，会自动汇总到这里专项训练。'));
      return;
    }
    st.weakIdx = Math.min(st.weakIdx || 0, weak.length - 1);
    const w = wordObj(weak[st.weakIdx]);
    const card = el('div', 'word-card');
    card.innerHTML = '<div class="word-main">??</div><div class="word-phonetic">薄弱词专项 ' + (st.weakIdx + 1) + ' / ' + weak.length + '</div>' +
      '<div class="word-meaning">' + esc(w.meaning) + '</div>' +
      '<div class="word-example">' + esc((w.example || '').replace(new RegExp(esc(w.word), 'gi'), '______')) + '</div>';
    if (st.result !== null && st.result === true) card.appendChild(el('div', 'word-meaning', '🎉 答对！<b>' + esc(w.word) + '</b>'));
    else if (st.result === false) card.appendChild(el('div', 'word-meaning', '❌ 正确答案：<b>' + esc(w.word) + '</b>'));
    const inp = el('input', 'word-input'); inp.placeholder = '输入英文单词…'; inp.dataset.role = 'weak-input';
    inp.onkeydown = e => { if (e.key === 'Enter') submitWeak(); };
    card.appendChild(inp);
    const row = el('div', 'word-actions');
    const ok = el('button', 'chip-btn', '✓ 提交'); ok.dataset.action = 'weak-submit'; row.appendChild(ok);
    const reveal = el('button', 'chip-btn sm', '👀 显示答案'); reveal.dataset.action = 'weak-reveal'; row.appendChild(reveal);
    const markM = el('button', 'chip-btn sm', '✅ 已掌握'); markM.dataset.action = 'weak-master'; row.appendChild(markM);
    card.appendChild(row);
    m.appendChild(card);
  }
  function submitWeak() {
    const inp = $('#view-cet4 [data-role="weak-input"]');
    const answer = (inp ? inp.value : '').trim().toLowerCase();
    const weak = countState('unfamiliar'); if (!weak.length) return;
    const w = wordObj(weak[st.weakIdx]); if (!w) return;
    st.result = answer === w.word.toLowerCase();
    if (st.result) { W.Data.addPoints(3); markViewed(w.word); }
    renderMode();
    if (st.result) setTimeout(() => { st.weakIdx++; st.result = null; renderMode(); }, 900);
  }

  // ---- 记忆曲线复习 ----
  function renderReview(m) {
    if (!st.reviewList.length) st.reviewList = W.Data.dueReviews();
    if (!st.reviewList.length) {
      m.appendChild(W.UI.emptyState('🔁', '今天没有到期的复习单词。<br>把单词标记为「已掌握」后，会按记忆曲线安排复习。'));
      return;
    }
    st.reviewIdx = Math.min(st.reviewIdx, st.reviewList.length - 1);
    const w = wordObj(st.reviewList[st.reviewIdx]);
    const card = el('div', 'word-card');
    const inner = el('div', 'flip-inner');
    inner.innerHTML = '<div class="face"><div class="word-main">' + esc(w.word) + '</div>' +
      '<div class="word-phonetic">' + esc(w.phonetic || '') + '</div></div>' +
      '<div class="face back"><div class="word-meaning">' + esc(w.meaning) + '</div>' +
      '<div class="word-example">' + esc(w.example || '') + '</div></div>';
    card.appendChild(inner);
    const flip = el('button', 'chip-btn sm', '🔁 翻面'); flip.dataset.action = 'flip'; card.appendChild(flip);
    const row = el('div', 'word-actions');
    const still = el('button', 'chip-btn sm danger', '😖 仍不熟'); still.dataset.action = 'review-again'; row.appendChild(still);
    const ok = el('button', 'chip-btn', '✅ 记住了'); ok.dataset.action = 'review-ok'; row.appendChild(ok);
    card.appendChild(row);
    card.appendChild(el('div', 'word-nav', '<span>' + (st.reviewIdx + 1) + ' / ' + st.reviewList.length + '</span>'));
    m.appendChild(card);
  }
  function reviewNext(got) {
    const word = st.reviewList[st.reviewIdx];
    const c = D().cet4;
    if (got) {
      W.Data.markMastered(word);
      W.Data.addPoints(3);
    } else {
      c.wordStates[word] = 'unfamiliar';
      W.Data.save();
    }
    st.reviewList.splice(st.reviewIdx, 1);
    renderMode();
  }

  // ---- 生词本 ----
  function renderFav(m) {
    const favs = favoriteList();
    if (!favs.length) {
      m.appendChild(W.UI.emptyState('📌', '生词本还是空的。<br>背诵时点「加入生词本」，或把不熟的单词加进来。'));
      return;
    }
    const box = el('div', 'card');
    box.appendChild(el('div', 'word-nav', '<b>生词 ' + favs.length + ' 个</b><button class="chip-btn sm" data-action="export">📤 复制导出</button>'));
    const list = el('div', 'dict-list');
    favs.forEach(wd => {
      const w = wordObj(wd);
      if (!w) return;
      const it = el('div', 'dict-item');
      it.innerHTML = '<span class="w">' + esc(w.word) + '</span><span class="m">' + esc(w.meaning) + '</span>' +
        '<button class="t" data-action="fav-remove" data-word="' + esc(wd) + '">移除</button>';
      list.appendChild(it);
    });
    box.appendChild(list);
    m.appendChild(box);
  }

  // ---- 词库 ----
  function renderLib(m) {
    const words = allWords();
    const box = el('div', 'card');
    const bankRow = el('div', 'dict-filter');
    [['curated', '精选词库'], ['full', '完整词库']].forEach(([k, t]) => {
      const b = el('button', 'chip-btn sm' + (bankInfo().key === k ? ' active' : ''), t);
      b.dataset.action = 'bank-' + k; bankRow.appendChild(b);
    });
    box.appendChild(bankRow);
    const filter = el('div', 'dict-filter');
    [['all', '全部 ' + words.length], ['mastered', '已掌握'], ['unfamiliar', '不熟'], ['fav', '生词']].forEach(([f, t]) => {
      const b = el('button', 'chip-btn sm' + (st.libFilter === f ? ' active' : ''), t);
      b.dataset.action = 'lib-filter-' + f; filter.appendChild(b);
    });
    box.appendChild(filter);
    const list = el('div', 'dict-list');
    const c = D().cet4;
    const filtered = words.filter(w => {
      const s = c.wordStates[w.word];
      if (st.libFilter === 'mastered') return s === 'mastered';
      if (st.libFilter === 'unfamiliar') return s === 'unfamiliar';
      if (st.libFilter === 'fav') return isFav(w.word);
      return true;
    });
    if (!filtered.length) list.appendChild(el('div', 'empty-tip', '这里还没有单词~'));
    filtered.forEach(w => {
      const it = el('div', 'dict-item');
      it.innerHTML = '<span class="w">' + esc(w.word) + '</span><span class="m">' + esc(w.meaning) + '</span>' +
        '<span class="t" data-action="speak" data-word="' + esc(w.word) + '">🔊</span>';
      list.appendChild(it);
    });
    box.appendChild(list);
    m.appendChild(box);
  }

  // ---- 导出 ----
  function exportFavs() {
    const favs = favoriteList().map(w => {
      const o = wordObj(w); return o ? w + '  ' + o.phonetic + '  ' + o.meaning + (o.example ? '  e.g. ' + o.example : '') : w;
    }).join('\n');
    if (!favs) { W.UI.toast('生词本为空'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(favs).then(() => W.UI.toast('已复制到剪贴板，可粘贴打印'), () => download(favs));
    } else download(favs);
    function download(txt) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));
      a.download = '生词本.txt'; a.click(); URL.revokeObjectURL(a.href);
    }
  }

  // ---- 倒计时设置 ----
  async function setExam() {
    const d = D().settings;
    const body = el('div', null, '<label class="set-row"><span>四级考试日期</span><input type="date" id="exam-date-input" value="' + (d.examDate || '') + '"></label>');
    const res = await W.UI.modal({ title: '⏰ 四级考试倒计时', body, actions: [
      { label: '清除', value: 'clear' },
      { label: '保存', value: 'save' }
    ] });
    if (res === 'clear') { d.examDate = null; W.Data.save(); W.UI.toast('已清除考试日期'); }
    if (res === 'save') {
      const v = $('#exam-date-input').value;
      if (v) { d.examDate = v; W.Data.save(); W.UI.toast('已设置，剩余天数会显示在宠物区角落'); }
      else W.UI.toast('请选择日期');
    }
    if (res) { W.Pet.renderExam(); }
  }

  function next(d) { st.result = null; st.answer = ''; st.idx = (st.idx + d + allWords().length) % allWords().length; renderMode(); }
  function setMode(m) { st.mode = m; st.result = null; st.answer = ''; st.reviewList = []; render(); }
  function switchBank(k) {
    if (bankInfo().key === k) return;
    D().settings.wordbank = k;
    W.Data.save();
    st.idx = 0; st.result = null; st.answer = ''; st.reviewList = [];
    render();
    W.UI.toast('已切换为' + (k === 'full' ? '完整词库' : '精选词库'));
  }

  // ---- 事件委托 ----
  function onClick(e) {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action, w = t.dataset.word;
    const c = D().cet4;
    if (a === 'mode-browse') setMode('browse');
    else if (a === 'mode-dictation') setMode('dictation');
    else if (a === 'mode-weak') setMode('weak');
    else if (a === 'mode-review') setMode('review');
    else if (a === 'mode-fav') setMode('fav');
    else if (a === 'mode-lib') setMode('lib');
    else if (a === 'lib-filter-all') st.libFilter = null;
    else if (a === 'lib-filter-mastered') st.libFilter = 'mastered';
    else if (a === 'lib-filter-unfamiliar') st.libFilter = 'unfamiliar';
    else if (a === 'lib-filter-fav') st.libFilter = 'fav';
    else if (a === 'speak') { speak(w || (allWords()[st.idx] && allWords()[st.idx].word)); }
    else if (a === 'flip') { const card = t.closest('.word-card'); if (card) card.classList.toggle('flipped'); markViewed(allWords()[st.idx].word); }
    else if (a === 'prev') next(-1);
    else if (a === 'next') next(1);
    else if (a === 'master') { const wd = allWords()[st.idx].word; c.wordStates[wd] = 'mastered'; W.Data.markMastered(wd); W.Data.addPoints(2); W.UI.toast('已掌握，进入记忆曲线复习'); next(1); }
    else if (a === 'unfamiliar') { const wd = allWords()[st.idx].word; c.wordStates[wd] = 'unfamiliar'; W.Data.save(); W.UI.toast('已标记为不熟'); next(1); }
    else if (a === 'fav') {
      const wd = allWords()[st.idx].word;
      if (isFav(wd)) { c.favorites = c.favorites.filter(x => x !== wd); W.UI.toast('已移出生词本'); }
      else { c.favorites.push(wd); W.UI.toast('已加入生词本'); }
      W.Data.save(); render();
    }
    else if (a === 'fav-remove') { c.favorites = c.favorites.filter(x => x !== w); W.Data.save(); renderMode(); }
    else if (a === 'dict-submit') submitDict();
    else if (a === 'dict-skip') { st.result = false; st.answer = ''; renderMode(); }
    else if (a === 'weak-submit') submitWeak();
    else if (a === 'weak-reveal') { st.result = false; renderMode(); }
    else if (a === 'weak-master') {
      const weak = countState('unfamiliar'); if (!weak.length) return;
      const wd = weak[st.weakIdx]; c.wordStates[wd] = 'mastered'; W.Data.markMastered(wd); W.Data.addPoints(2);
      st.weakIdx = Math.min(st.weakIdx, countState('unfamiliar').length - 1); renderMode();
    }
    else if (a === 'review-ok') reviewNext(true);
    else if (a === 'review-again') reviewNext(false);
    else if (a === 'export') exportFavs();
    else if (a === 'exam') setExam();
    else if (a === 'bank-curated') switchBank('curated');
    else if (a === 'bank-full') switchBank('full');
  }

  function init() {
    const v = view();
    if (v) { v.onclick = onClick; v.oninput = null; }
    st.libFilter = st.libFilter || null;
    warmVoices();
    render();
  }

  W.CET4 = { init, render, setMode };
})();
