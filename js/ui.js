(function () {
  'use strict';
  const W = window.Workbench = window.Workbench || {};

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function toast(msg, ms) {
    const root = $('#toast-root');
    if (!root) return;
    const t = el('div', 'toast', msg);
    root.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 320); }, ms || 2200);
  }

  function modal(opts) {
    return new Promise(resolve => {
      const mask = el('div', 'modal-mask');
      const box = el('div', 'modal');
      if (opts.title) box.appendChild(el('h3', null, opts.title));
      if (typeof opts.body === 'string') box.appendChild(el('div', null, opts.body));
      else if (opts.body) box.appendChild(opts.body);
      const row = el('div', 'modal-actions');
      (opts.actions || []).forEach(a => {
        const b = el('button', 'chip-btn' + (a.danger ? ' danger' : ''), a.label || '确定');
        b.onclick = () => { mask.remove(); resolve(a.value !== undefined ? a.value : a.label); };
        row.appendChild(b);
      });
      box.appendChild(row);
      mask.appendChild(box);
      mask.onclick = e => { if (e.target === mask) { mask.remove(); resolve(null); } };
      $('#modal-root').appendChild(mask);
    });
  }
  function confirmDanger(title, text) {
    return modal({ title, body: text, actions: [
      { label: '取消', value: false },
      { label: '确认操作', value: true, danger: true }
    ] });
  }

  function updatePoints() {
    const n = $('#points-num');
    if (n) n.textContent = Workbench.Data.get().points;
    const chip = $('#points-chip');
    if (chip) { chip.classList.add('pop'); setTimeout(() => chip.classList.remove('pop'), 320); }
  }
  function flyPoints(n) {
    const chip = $('#points-chip');
    if (!chip) return;
    const f = el('span', 'fly-point', '+' + n);
    chip.appendChild(f);
    setTimeout(() => f.remove(), 950);
  }

  function emptyState(emoji, text) {
    const d = el('div', 'empty-tip', '<span class="big">' + emoji + '</span>' + text);
    return d;
  }

  // ---------------- Web Audio 音效 ----------------
  let actx = null;
  function ac() {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    return actx;
  }
  function noiseBuffer(c) {
    const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    return buf;
  }

  const AudioMgr = {
    _nodes: null, _musicTimer: null, _cafeTimer: null, _cafeGain: null,

    ensure() { ac(); if (actx.state === 'suspended') actx.resume(); },

    ding() {
      if (!Workbench.Data.get().settings.soundOn) return;
      this.ensure();
      const c = actx, t = c.currentTime;
      [880, 1175].forEach((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.22, t + 0.02 + i * 0.13);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7 + i * 0.13);
        o.connect(g); g.connect(c.destination);
        o.start(t + i * 0.13); o.stop(t + 0.9 + i * 0.13);
      });
    },

    noisePlay(type) {
      this.noiseStop();
      const st = Workbench.Data.get().settings.whiteNoise;
      this.ensure();
      const c = actx;
      if (type === 'music') { this._playMusic(st.volume); return; }
      const src = c.createBufferSource(); src.buffer = noiseBuffer(c); src.loop = true;
      const filter = c.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.value = type === 'rain' ? 650 : 1000;
      const g = c.createGain(); g.gain.value = st.volume * 0.45;
      src.connect(filter); filter.connect(g); g.connect(c.destination);
      src.start();
      this._nodes = { src, filter, g, type };
      if (type === 'cafe') {
        this._cafeGain = g;
        this._cafeTimer = setInterval(() => {
          g.gain.value = st.volume * (0.35 + Math.random() * 0.25);
          filter.frequency.value = 800 + Math.random() * 500;
        }, 700);
      }
    },

    _playMusic(vol) {
      this.ensure();
      const c = actx, g = c.createGain();
      g.gain.value = vol * 0.4; g.connect(c.destination);
      this._nodes = { music: true, g };
      const notes = [262, 330, 392, 494, 523, 392, 440, 494];
      let i = 0;
      const step = () => {
        const f = notes[i % notes.length]; i++;
        const o = c.createOscillator(), og = c.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        og.gain.setValueAtTime(0.0001, c.currentTime);
        og.gain.exponentialRampToValueAtTime(vol * 0.22, c.currentTime + 0.04);
        og.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1.6);
        o.connect(og); og.connect(g);
        o.start(); o.stop(c.currentTime + 1.8);
      };
      step();
      this._musicTimer = setInterval(step, 600);
    },

    setNoiseVolume(v) {
      const st = Workbench.Data.get().settings.whiteNoise;
      st.volume = v; Workbench.Data.save();
      const n = this._nodes;
      if (!n) return;
      if (n.music) { n.g.gain.value = v * 0.4; return; }
      if (this._cafeGain) { this._cafeGain.gain.value = v * 0.4; }
      else { n.g.gain.value = v * 0.45; }
    },

    noiseStop() {
      if (this._nodes) {
        try {
          if (this._nodes.src) this._nodes.src.stop();
          if (this._nodes.g && !this._nodes.music) this._nodes.g.disconnect();
        } catch (e) { }
        this._nodes = null;
      }
      if (this._musicTimer) { clearInterval(this._musicTimer); this._musicTimer = null; }
      if (this._cafeTimer) { clearInterval(this._cafeTimer); this._cafeTimer = null; }
      this._cafeGain = null;
    }
  };

  W.$ = $; W.$$ = $$; W.el = el; W.esc = esc;
  W.UI = { toast, modal, confirmDanger, updatePoints, flyPoints, emptyState, AudioMgr };
})();
