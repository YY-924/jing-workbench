(function () {
  'use strict';
  window.Workbench = window.Workbench || {};
  const KEY = 'jing_workbench_data';

  function pad(n) { return String(n).padStart(2, '0'); }
  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function addDays(dateStr, n) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return todayFromDate(d);
  }
  function todayFromDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function weekKey() {
    const now = new Date();
    const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const wk = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return now.getFullYear() + '-W' + pad(wk);
  }
  function daysUntil(dateStr) {
    const a = new Date(today() + 'T00:00:00');
    const b = new Date(dateStr + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }

  function defaultData() {
    return {
      version: 1,
      settings: {
        theme: 'default', soundOn: true,
        whiteNoise: { on: false, type: 'rain', volume: 0.5 },
        petAnimOn: true, pomodoroDefault: 25, examDate: null
      },
      cet4: { wordStates: {}, favorites: [], dailyCount: {}, totalCount: 0, reviews: {} },
      tasks: { list: [], lastOpenDate: null },
      pomodoro: { todayCount: 0, totalFocusMinutes: 0, todayDate: null, totalSessions: 0, maxSession: 0 },
      pet: { hunger: 100, mood: 100, clean: 100, level: 1, exp: 0, bg: 'grass', lastDecayAt: Date.now(), lastPetAt: 0 },
      shop: { backpack: [], worn: {}, totalBought: 0 },
      points: 0,
      achievements: { unlocked: {} },
      signin: { lastDate: null, streak: 0, totalDays: 0 },
      weekly: { week: null, words: 0, focus: 0, tasks: 0, claimed: false }
    };
  }

  function deepMerge(base, extra) {
    if (Array.isArray(extra)) return extra.slice();
    const out = Object.assign({}, base || {});
    for (const k in extra) {
      const ev = extra[k];
      if (ev && typeof ev === 'object' && !Array.isArray(ev) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) {
        out[k] = deepMerge(out[k], ev);
      } else {
        out[k] = ev;
      }
    }
    return out;
  }

  let data = null;
  function load() {
    if (data) return data;
    try {
      const raw = localStorage.getItem(KEY);
      data = raw ? deepMerge(defaultData(), JSON.parse(raw)) : defaultData();
    } catch (e) { data = defaultData(); }
    return data;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(load())); }
    catch (e) { if (window.Workbench.UI) Workbench.UI.toast('保存失败，请检查浏览器存储空间'); }
  }
  function get() { return load(); }
  function set(fn) { fn(load()); save(); }

  function addPoints(n, silent) {
    const d = load();
    d.points = Math.max(0, (d.points || 0) + n);
    if (n > 0) d.pet.exp = (d.pet.exp || 0) + n;
    save();
    if (window.Workbench.UI) {
      Workbench.UI.updatePoints();
      if (!silent && n > 0) Workbench.UI.flyPoints(n);
    }
    if (window.Workbench.Pet) Workbench.Pet.checkLevelUp();
    if (window.Workbench.Achievements) Workbench.Achievements.scan();
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(load(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '静の工作台-存档-' + today() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(a.href);
  }
  function importData(file, cb) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(reader.result);
        data = deepMerge(defaultData(), parsed);
        save();
        cb(null);
      } catch (e) { cb('存档文件解析失败'); }
    };
    reader.readAsText(file);
  }

  // 危险操作
  function clearWords() { const d = load(); d.cet4 = defaultData().cet4; save(); }
  function clearTasks() { const d = load(); d.tasks = defaultData().tasks; save(); }
  function resetPet() {
    const d = load();
    d.pet = defaultData().pet; d.shop = defaultData().shop;
    d.achievements = defaultData().achievements; d.signin = defaultData().signin;
    d.points = 0; save();
  }
  function clearBackpack() { const d = load(); d.shop.backpack = []; d.shop.worn = {}; save(); }

  // 记忆曲线(简化:已掌握词按 1/3/7/15 天间隔复习)
  function dueReviews() {
    const c = load().cet4, t = today(), out = [];
    for (const w in c.reviews) if (c.reviews[w].due <= t) out.push(w);
    return out;
  }
  function markMastered(word) {
    const c = load().cet4;
    c.wordStates[word] = 'mastered';
    const r = c.reviews[word] || { interval: 1 };
    if (!c.reviews[word]) { c.reviews[word] = { interval: 1, due: addDays(today(), 1) }; }
    else {
      const next = Math.min(15, r.interval * 2);
      c.reviews[word] = { interval: next, due: addDays(today(), next) };
    }
    save();
  }

  const Data = {
    KEY, load, save, get, set, addPoints,
    exportData, importData,
    clearWords, clearTasks, resetPet, clearBackpack,
    dueReviews, markMastered,
    today, addDays, weekKey, daysUntil
  };
  Workbench.Data = Data;
})();
