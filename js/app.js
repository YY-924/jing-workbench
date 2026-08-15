(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};
  const D = () => W.Data.get();
  const $ = W.$, $$ = W.$$;

  function applyTheme() { document.body.dataset.theme = D().settings.theme || 'default'; }

  function initTabs() {
    $$('.learn-tabs .tab-btn').forEach(btn => {
      btn.onclick = () => {
        const mod = btn.dataset.mod;
        $$('.learn-tabs .tab-btn').forEach(x => x.classList.toggle('active', x === btn));
        $$('.mod-view').forEach(v => v.classList.toggle('active', v.id === 'view-' + mod));
        if (mod === 'cet4') W.CET4.render();
        if (mod === 'tasks') W.Tasks.render();
        if (mod === 'pomo') W.Pomodoro.render();
      };
    });
  }

  function switchPage(page) {
    $$('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
    $$('.mob-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    if (page === 'settings') $('#panel-settings').hidden = false;
    else $('#panel-settings').hidden = true;
  }
  function initMobileTabs() {
    $$('.mob-btn').forEach(b => { b.onclick = () => switchPage(b.dataset.page); });
  }

  function initSettings() {
    const s = D().settings;
    $('#set-sound').checked = !!s.soundOn;
    $('#set-anim').checked = !!s.petAnimOn;
    $('#set-exam-date').value = s.examDate || '';
    $('#set-pomo-len').value = s.pomodoroDefault || 25;
    $('#set-noise-vol').value = Math.round(s.whiteNoise.volume * 100);
    if ($('#set-wordbank')) {
      $('#set-wordbank').value = s.wordbank || 'curated';
      $('#set-wordbank').onchange = e => {
        s.wordbank = e.target.value; W.Data.save();
        if (W.CET4) W.CET4.render();
        W.UI.toast('已切换词库：' + (s.wordbank === 'full' ? '完整词库' : '精选词库'));
      };
    }

    $('#set-sound').onchange = e => { s.soundOn = e.target.checked; W.Data.save(); };
    $('#set-anim').onchange = e => { s.petAnimOn = e.target.checked; W.Data.save(); if (W.Pet) W.Pet.refresh(); };
    $('#set-exam-date').onchange = e => { s.examDate = e.target.value || null; W.Data.save(); if (W.Pet) W.Pet.renderExam(); };
    $('#set-pomo-len').onchange = e => {
      const v = parseInt(e.target.value, 10);
      if (v > 0) { s.pomodoroDefault = v; W.Data.save(); if (W.Pomodoro) W.Pomodoro.render(); }
    };
    $('#set-noise-vol').oninput = e => W.UI.AudioMgr.setNoiseVolume(parseInt(e.target.value, 10) / 100);

    $$('#theme-row .theme-dot').forEach(d => {
      d.onclick = () => {
        s.theme = d.dataset.theme; W.Data.save(); applyTheme();
        $$('#theme-row .theme-dot').forEach(x => x.classList.toggle('active', x === d));
        W.UI.toast('已切换主题');
      };
    });
    $$('#theme-row .theme-dot').forEach(x => x.classList.toggle('active', x.dataset.theme === s.theme));

    $$('#noise-type-row .chip-btn').forEach(b => {
      b.onclick = () => {
        const t = b.dataset.noise;
        if (t === 'off') { s.whiteNoise.on = false; W.UI.AudioMgr.noiseStop(); }
        else { s.whiteNoise.on = true; s.whiteNoise.type = t; W.UI.AudioMgr.noisePlay(t); }
        W.Data.save();
        $$('#noise-type-row .chip-btn').forEach(x => x.classList.toggle('active', x === b));
      };
    });

    $('#btn-export').onclick = () => W.Data.exportData();
    $('#btn-import').onclick = () => $('#import-file').click();
    $('#import-file').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      W.Data.importData(f, err => {
        e.target.value = '';
        if (err) { W.UI.toast(err); return; }
        W.UI.toast('存档导入成功！');
        applyTheme(); location.reload();
      });
    };

    const dangerMap = {
      'clear-words': ['清空单词记录', '确定清除所有单词掌握标记、生词本和记忆曲线记录吗？', W.Data.clearWords],
      'clear-tasks': ['删除全部任务', '确定删除今天的全部任务吗？', W.Data.clearTasks],
      'reset-pet': ['重置宠物数据', '确定重置宠物等级、属性、积分、背包、签到和成就吗？此操作不可恢复！', W.Data.resetPet],
      'clear-backpack': ['清空背包', '确定清空背包里所有道具吗？', W.Data.clearBackpack]
    };
    $$('[data-danger]').forEach(b => {
      b.onclick = async () => {
        const [title, text, fn] = dangerMap[b.dataset.danger];
        const ok = await W.UI.confirmDanger(title, text);
        if (!ok) return;
        fn(); W.UI.toast('已重置');
        location.reload();
      };
    });
  }

  function init() {
    applyTheme();
    switchPage(window.innerWidth < 1024 ? 'learn' : 'learn');

    W.CET4.init();
    W.Tasks.render();
    W.Pomodoro.render();
    W.Pet.init();
    W.Weekly.render();
    W.UI.updatePoints();

    initTabs(); initMobileTabs(); initSettings();
    document.addEventListener('click', e => {
      const c = e.target.closest('[data-close]');
      if (c) document.getElementById(c.dataset.close).hidden = true;
    });
    $('#btn-settings').onclick = () => {
      if (window.innerWidth < 1024) switchPage('settings');
      else $('#panel-settings').hidden = !$('#panel-settings').hidden;
    };

    // 每日流程：任务顺延 → 备考激励 → 签到
    W.Tasks.checkRollover();
    const s = D().settings;
    if (s.examDate) {
      const c = D().cet4;
      if (c.examBonusDate !== W.Data.today()) {
        c.examBonusDate = W.Data.today();
        W.Data.save();
        W.Data.addPoints(8);
        W.UI.toast('📅 备考激励 +8 积分，继续加油！');
      }
    }
    W.Pet.checkSignin();
    if (W.Achievements) W.Achievements.scan();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => { });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
