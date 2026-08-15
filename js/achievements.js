(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};
  const D = () => W.Data.get();
  const $ = W.$, el = W.el, esc = W.esc;

  function consecutiveWordDays(d) {
    let n = 0; const t = W.Data.today();
    for (let i = 0; i < 365; i++) {
      if (d.cet4.dailyCount[W.Data.addDays(t, -i)]) n++;
      else break;
    }
    return n;
  }

  const ACH = [
    { id: 'first-buy', name: '第一次购物', icon: '🛍️', desc: '在商城买一件商品', reward: 30 },
    { id: '100-words', name: '百词斩', icon: '💯', desc: '累计背诵100个单词', reward: 100 },
    { id: 'task5', name: '任务达人', icon: '✅', desc: '单周完成5条任务', reward: 60 },
    { id: 'focus60', name: '深度专注', icon: '⏱️', desc: '单次专注满60分钟', reward: 80 },
    { id: 'pomo30', name: '番茄收割机', icon: '🍅', desc: '累计完成30轮番茄', reward: 120 },
    { id: 'words7', name: '连续背词', icon: '🔥', desc: '连续7天背单词', reward: 150 },
    { id: 'signin7', name: '持之以恒', icon: '📅', desc: '连续签到7天', reward: 120 },
    { id: 'lv5', name: '宠物专家', icon: '🐕', desc: '毛毛升到5级', reward: 100 }
  ];
  function cond(a) {
    const d = D();
    switch (a.id) {
      case 'first-buy': return (d.shop.totalBought || 0) >= 1;
      case '100-words': return (d.cet4.totalCount || 0) >= 100;
      case 'task5': return (d.weekly.tasks || 0) >= 5;
      case 'focus60': return (d.pomodoro.maxSession || 0) >= 60;
      case 'pomo30': return (d.pomodoro.totalSessions || 0) >= 30;
      case 'words7': return consecutiveWordDays(d) >= 7;
      case 'signin7': return (d.signin.streak || 0) >= 7;
      case 'lv5': return (d.pet.level || 1) >= 5;
    }
    return false;
  }

  function scan() {
    const d = D();
    let changed = false;
    ACH.forEach(a => {
      if (!d.achievements.unlocked[a.id] && cond(a)) {
        d.achievements.unlocked[a.id] = true;
        changed = true;
        W.Data.addPoints(a.reward);
        W.UI.toast('🏆 解锁成就「' + a.name + '」 +' + a.reward + ' 积分');
      }
    });
    if (changed) { W.Data.save(); if (W.Weekly) W.Weekly.render(); }
  }

  function renderInto(container) {
    if (!container) return;
    container.innerHTML = '';
    container.appendChild(el('h3', 'zone-title', '🏆 成就'));
    const grid = el('div', 'ach-grid');
    ACH.forEach(a => {
      const on = !!D().achievements.unlocked[a.id];
      const it = el('div', 'card ach-item' + (on ? ' unlocked' : ''));
      it.innerHTML = '<div class="icon">' + a.icon + '</div><div class="name">' + esc(a.name) + '</div>' +
        '<div class="desc">' + esc(a.desc) + '</div>';
      grid.appendChild(it);
    });
    container.appendChild(grid);
  }

  W.Achievements = { scan, renderInto, ACH };
})();
