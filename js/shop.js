(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};
  const D = () => W.Data.get();
  const $ = W.$, el = W.el, esc = W.esc;

  const GOODS = [
    { id: 'coat-brown', cat: 'clothing', name: '棕色小马甲', icon: '🧥', price: 60, desc: '经典伯恩山配色', type: 'wear', slot: 'coat' },
    { id: 'coat-denim', cat: 'clothing', name: '牛仔背带裤', icon: '👖', price: 120, desc: '帅气牛仔风', type: 'wear', slot: 'coat', lv: 3 },
    { id: 'hat-red', cat: 'clothing', name: '小红帽', icon: '🎩', price: 40, desc: '精神又可爱', type: 'wear', slot: 'hat' },
    { id: 'scarf-yellow', cat: 'clothing', name: '暖黄围巾', icon: '🧣', price: 50, desc: '软软暖暖', type: 'wear', slot: 'scarf' },
    { id: 'goggle', cat: 'clothing', name: '酷酷墨镜', icon: '🕶️', price: 80, desc: '气场全开', type: 'wear', slot: 'glasses' },
    { id: 'bow-pink', cat: 'clothing', name: '粉色蝴蝶结', icon: '🎀', price: 70, desc: '可爱值+100', type: 'wear', slot: 'bow' },
    { id: 'crown', cat: 'clothing', name: '小皇冠', icon: '👑', price: 200, desc: '5级限定', type: 'wear', slot: 'hat', lv: 5 },
    { id: 'cap-blue', cat: 'clothing', name: '蓝色毛线帽', icon: '🧢', price: 55, desc: '冬日暖帽 + 小绒球', type: 'wear', slot: 'hat' },
    { id: 'scarf-red', cat: 'clothing', name: '红格围巾', icon: '🧣', price: 45, desc: '软软的红格子', type: 'wear', slot: 'scarf' },
    { id: 'glasses-round', cat: 'clothing', name: '圆框眼镜', icon: '👓', price: 70, desc: '斯文气质拉满', type: 'wear', slot: 'glasses' },
    { id: 'bow-blue', cat: 'clothing', name: '蓝色蝴蝶结', icon: '🎀', price: 65, desc: '清爽小绅士', type: 'wear', slot: 'bow' },
    { id: 'collar', cat: 'clothing', name: '铃铛项圈', icon: '🔔', price: 60, desc: '走起路叮当响', type: 'wear', slot: 'neck' },
    { id: 'coat-stripe', cat: 'clothing', name: '条纹卫衣', icon: '👕', price: 110, desc: '潮酷条纹风', type: 'wear', slot: 'coat', lv: 3 },
    { id: 'kibble', cat: 'food', name: '香香狗粮', icon: '🍚', price: 15, desc: '饥饿 +40', type: 'use', effect: 'hunger', val: 40 },
    { id: 'meat', cat: 'food', name: '肉肉零食', icon: '🥩', price: 30, desc: '饥饿 +70', type: 'use', effect: 'hunger', val: 70 },
    { id: 'can', cat: 'food', name: '罐头大餐', icon: '🥫', price: 50, desc: '饥饿 +100', type: 'use', effect: 'hunger', val: 100 },
    { id: 'fish', cat: 'food', name: '三文鱼饭', icon: '🐟', price: 22, desc: '饥饿 +55', type: 'use', effect: 'hunger', val: 55 },
    { id: 'cheese', cat: 'food', name: '芝士块', icon: '🧀', price: 18, desc: '饥饿 +35', type: 'use', effect: 'hunger', val: 35 },
    { id: 'dumpling', cat: 'food', name: '鲜肉水饺', icon: '🥟', price: 20, desc: '饥饿 +50', type: 'use', effect: 'hunger', val: 50 },
    { id: 'honey', cat: 'food', name: '蜂蜜小饼', icon: '🍯', price: 16, desc: '饥饿 +30', type: 'use', effect: 'hunger', val: 30 },
    { id: 'milk-tea', cat: 'drink', name: '香草奶茶', icon: '🧋', price: 25, desc: '心情 +40', type: 'use', effect: 'mood', val: 40 },
    { id: 'juice', cat: 'drink', name: '鲜榨果汁', icon: '🧃', price: 35, desc: '心情 +70', type: 'use', effect: 'mood', val: 70 },
    { id: 'water', cat: 'drink', name: '矿泉水', icon: '💧', price: 10, desc: '心情 +20', type: 'use', effect: 'mood', val: 20 },
    { id: 'coffee', cat: 'drink', name: '狗狗拿铁', icon: '☕', price: 20, desc: '心情 +30', type: 'use', effect: 'mood', val: 30 },
    { id: 'smoothie', cat: 'drink', name: '草莓奶昔', icon: '🍹', price: 40, desc: '心情 +60', type: 'use', effect: 'mood', val: 60 },
    { id: 'tea', cat: 'drink', name: '菊花茶', icon: '🍵', price: 18, desc: '心情 +25', type: 'use', effect: 'mood', val: 25 },
    { id: 'milk', cat: 'drink', name: '热牛奶', icon: '🥛', price: 22, desc: '心情 +35', type: 'use', effect: 'mood', val: 35 },
    { id: 'shower', cat: 'clean', name: '香香沐浴露', icon: '🧴', price: 25, desc: '清洁 +60', type: 'use', effect: 'clean', val: 60 },
    { id: 'brush', cat: 'clean', name: '顺毛梳', icon: '🪮', price: 15, desc: '清洁 +35', type: 'use', effect: 'clean', val: 35 },
    { id: 'shampoo', cat: 'clean', name: '蓝莓香波', icon: '🧼', price: 35, desc: '清洁 +80', type: 'use', effect: 'clean', val: 80 },
    { id: 'towel', cat: 'clean', name: '吸水毛巾', icon: '🧻', price: 18, desc: '清洁 +40', type: 'use', effect: 'clean', val: 40 },
    { id: 'sponge', cat: 'clean', name: '魔力海绵', icon: '🧽', price: 28, desc: '清洁 +55', type: 'use', effect: 'clean', val: 55 },
    { id: 'dental', cat: 'clean', name: '洁牙骨', icon: '🦷', price: 15, desc: '清洁 +30', type: 'use', effect: 'clean', val: 30 }
  ];
  const CATS = [['clothing', '👗 服饰穿搭'], ['food', '🍖 食物主食'], ['drink', '🧋 饮品类'], ['clean', '🧴 清洁道具']];

  let cat = 'clothing';
  function good(id) { return GOODS.find(g => g.id === id); }

  function showPanel(id) {
    document.querySelectorAll('.panel').forEach(p => { p.hidden = true; });
    const p = document.getElementById(id); if (p) p.hidden = false;
  }
  function hidePanel(id) { const p = document.getElementById(id); if (p) p.hidden = true; }

  function ownedCount(id) { return D().shop.backpack.filter(b => b.id === id).length; }

  function renderShop() {
    const panel = $('#panel-shop'); if (!panel) return;
    panel.innerHTML = '';
    const head = el('div', 'panel-head', '<h2>🛍 积分商城</h2><button class="icon-btn close" data-close="panel-shop" aria-label="关闭">✕</button>');
    panel.appendChild(head);
    const body = el('div', 'panel-body');
    const tabs = el('div', 'shop-tabs');
    CATS.forEach(([c, t]) => {
      const b = el('button', 'chip-btn sm' + (cat === c ? ' active' : ''), t);
      b.dataset.cat = c; b.dataset.action = 'shop-cat'; tabs.appendChild(b);
    });
    body.appendChild(tabs);
    body.appendChild(el('div', 'shop-tabs', '<span style="color:var(--text-sub);font-size:13px">我的积分：<b style="color:var(--accent-dark)">⭐ ' + D().points + '</b></span>'));
    const grid = el('div', 'shop-grid');
    const lv = D().pet.level || 1;
    GOODS.filter(g => g.cat === cat).forEach(g => {
      const locked = g.lv && lv < g.lv;
      const it = el('div', 'card shop-item' + (locked ? ' locked' : ''));
      it.innerHTML = '<div class="icon">' + g.icon + '</div><div class="name">' + esc(g.name) + '</div>' +
        '<div class="desc">' + esc(g.desc) + '</div><div class="price">' + (locked ? '🔒 Lv.' + g.lv : '⭐ ' + g.price) + '</div>';
      const buy = el('button', 'chip-btn sm', locked ? '未解锁' : '购买');
      buy.dataset.action = 'buy'; buy.dataset.id = g.id;
      if (locked) buy.disabled = true;
      it.appendChild(buy);
      grid.appendChild(it);
    });
    body.appendChild(grid);
    panel.appendChild(body);
    panel.onclick = onClick;
  }

  function renderBackpack() {
    const panel = $('#panel-backpack'); if (!panel) return;
    panel.innerHTML = '';
    const head = el('div', 'panel-head', '<h2>🎒 背包</h2><button class="icon-btn close" data-close="panel-backpack" aria-label="关闭">✕</button>');
    panel.appendChild(head);
    const body = el('div', 'panel-body');
    const bp = D().shop.backpack;
    if (!bp.length) {
      body.appendChild(W.UI.emptyState('🎒', '背包空空的，去商城给毛毛添置点好东西吧~'));
    } else {
      const grid = el('div', 'bp-grid');
      bp.forEach((item, idx) => {
        const g = good(item.id); if (!g) return;
        const worn = D().shop.worn[g.slot] === item.id;
        const it = el('div', 'card bp-item' + (worn ? ' worn' : ''));
        if (worn) it.appendChild(el('span', 'worn-tag', '穿戴中'));
        it.appendChild(el('div', 'icon', g.icon));
        it.appendChild(el('div', 'name', esc(g.name)));
        const btn = el('button', 'chip-btn sm use-btn', g.type === 'wear' ? (worn ? '脱下' : '穿戴') : '使用');
        btn.dataset.action = g.type === 'wear' ? 'wear' : 'use';
        btn.dataset.idx = idx;
        it.appendChild(btn);
        grid.appendChild(it);
      });
      body.appendChild(grid);
    }
    panel.appendChild(body);
    panel.onclick = onClick;
  }

  function buy(id) {
    const g = good(id); if (!g) return;
    if (g.lv && (D().pet.level || 1) < g.lv) { W.UI.toast('等级不足，无法购买'); return; }
    if (D().points < g.price) { W.UI.toast('积分不足，先去学习赚积分吧'); return; }
    D().shop.backpack.push({ id, t: Date.now() });
    D().shop.totalBought++;
    W.Data.addPoints(-g.price, true);
    W.Data.save();
    W.UI.toast('购买成功：' + g.name);
    renderShop();
    if (W.Achievements) W.Achievements.scan();
  }

  function wear(idx) {
    const item = D().shop.backpack[idx]; if (!item) return;
    const g = good(item.id); if (!g || g.type !== 'wear') return;
    const worn = D().shop.worn;
    worn[g.slot] = worn[g.slot] === item.id ? null : item.id;
    W.Data.save();
    renderBackpack();
    if (W.Pet) W.Pet.refresh();
  }

  function use(idx) {
    const item = D().shop.backpack[idx]; if (!item) return;
    const g = good(item.id); if (!g || g.type !== 'use') return;
    const pet = D().pet;
    pet[g.effect] = Math.min(100, (pet[g.effect] || 0) + g.val);
    D().shop.backpack.splice(idx, 1);
    W.Data.save();
    renderBackpack();
    if (W.Pet) W.Pet.refreshStats();
    W.UI.toast('使用成功：' + g.name + '，' + ({ hunger: '🍖 饥饿', mood: '😊 心情', clean: '🛁 清洁' })[g.effect] + ' +' + g.val);
  }

  function onClick(e) {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    if (a === 'shop-cat') { cat = t.dataset.cat; renderShop(); }
    else if (a === 'buy') buy(t.dataset.id);
    else if (a === 'wear') wear(parseInt(t.dataset.idx, 10));
    else if (a === 'use') use(parseInt(t.dataset.idx, 10));
  }

  W.Shop = { renderShop, renderBackpack, showPanel, hidePanel, good, ownedCount, use };
})();
