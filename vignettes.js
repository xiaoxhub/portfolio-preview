/* Looping product illustrations. Paused off screen; static under reduced motion. */
/* Product vignettes: short looping illustrations, paused off screen and under reduced motion. */
(function () {
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setOn(fig, step) {
    Array.prototype.forEach.call(fig.querySelectorAll('[data-n]'), function (el) {
      el.classList.toggle('on', +el.getAttribute('data-n') <= step);
    });
  }
  function visible(fig, onChange) {
    if (!('IntersectionObserver' in window)) { onChange(true); return; }
    new IntersectionObserver(function (es) { onChange(es[0].isIntersecting); }, { threshold: 0.25 }).observe(fig);
  }
  /* Each illustration plays once when it scrolls into view, then rests on its last frame.
     Replay: the button in the caption, or a click on the picture. */
  function loop(fig, draw, rest, dur, opts) {
    opts = opts || {};
    if (still) { rest(); return { play: function () {} }; }
    var raf = null, t0 = null, ended = false, btn = null;
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }
    function setEnded(v) { ended = v; fig.classList.toggle('ended', v); if (btn) btn.hidden = !v; if (opts.onEnded) opts.onEnded(v); }
    function frame(now) {
      if (t0 === null) t0 = now;
      var sec = (now - t0) / 1000, d = dur();
      if (sec >= d) { draw(d - 0.02); raf = null; setEnded(true); return; }
      draw(sec); raf = requestAnimationFrame(frame);
    }
    function play() { stop(); t0 = null; setEnded(false); raf = requestAnimationFrame(frame); }
    if (!opts.ownControls) {
      var cap = fig.querySelector('figcaption'), stage = fig.querySelector('.vig-stage');
      if (cap) {
        btn = document.createElement('button'); btn.type = 'button'; btn.className = 'vig-replay'; btn.textContent = 'Replay'; btn.hidden = true;
        cap.appendChild(document.createTextNode(' ')); cap.appendChild(btn); btn.addEventListener('click', play);
      }
      if (stage) {
        stage.addEventListener('click', function () { if (ended) play(); });
      }
    }
    visible(fig, function (v) { if (!v) stop(); else if (!ended && !raf) play(); });
    return { play: play };
  }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x * x * (3 - 2 * x); }

  /* InLicense: candidates pass three rules; an unknown goes to a person. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-vig="gates"]'), function (fig) {
    function q(k) { return fig.querySelector('[data-cv="' + k + '"]'); }
    var NS = 'http://www.w3.org/2000/svg', host = q('cards'), passEl = q('pass'), askEl = q('ask'), reason = q('reason');
    var plan = [{ k: 'pass' }, { k: 'ask', g: 0 }, { k: 'pass' }, { k: 'fail', g: 1 }, { k: 'pass' }];
    var GX = [140, 250, 360], X0 = 20, Y = 118, V = 110, STAG = 1.5, BIN = 455, tBin = (BIN - X0) / V;
    var total = (plan.length - 1) * STAG + tBin + 2.6;
    var cards = plan.map(function () {
      var g = document.createElementNS(NS, 'g'), b = document.createElementNS(NS, 'rect'), p = document.createElementNS(NS, 'rect');
      b.setAttribute('class', 'b'); b.setAttribute('x', -22); b.setAttribute('y', -14); b.setAttribute('width', 44); b.setAttribute('height', 28); b.setAttribute('rx', 8);
      p.setAttribute('class', 'p'); p.setAttribute('x', -11); p.setAttribute('y', -4); p.setAttribute('width', 22); p.setAttribute('height', 8); p.setAttribute('rx', 4);
      g.appendChild(b); g.appendChild(p); g.style.opacity = '0'; host.appendChild(g); return g;
    });
    function put(g, x, y, op, cls) { g.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')'); g.style.opacity = op.toFixed(2); g.setAttribute('class', 'cv-card ' + cls); }
    function draw(sec) {
      var T = sec % total, pass = 0, ask = 0, why = false;
      plan.forEach(function (c, i) {
        var t = T - i * STAG, g = cards[i], x, y = Y, op, cls = '';
        if (t < 0) { put(g, X0, Y, 0, ''); return; }
        op = clamp(t / 0.3);
        if (c.k === 'pass') {
          x = X0 + V * Math.min(t, tBin); if (x > GX[2]) cls = 'ok';
          if (t >= tBin) { pass++; op = 0; }
        } else {
          var stop = GX[c.g] - 28, tg = (stop - X0) / V;
          if (t < tg) x = X0 + V * t;
          else if (c.k === 'fail') { var e = ease((t - tg - 0.25) / 0.9); x = stop; y = Y + 56 * e; op = 1 - e; cls = 'no'; why = t < tg + 2.2; }
          else { var m = ease((t - tg - 0.35) / 0.8); x = stop + (92 - stop) * m; y = Y + (206 - Y) * m; cls = 'ask'; if (m >= 1) { ask++; op = 0; } }
        }
        put(g, x, y, op, cls);
      });
      passEl.textContent = String(pass); askEl.textContent = String(ask);
      reason.style.opacity = why ? 1 : 0;
    }
    loop(fig, draw, function () { cards.forEach(function (g) { put(g, X0, Y, 0, ''); }); passEl.textContent = '3'; askEl.textContent = '1'; }, function () { return total; });
  });

  /* InLicense: the BD starts a batch and spends the day with people while the pipeline runs. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-vig="day"]'), function (fig) {
    function q(k) { return fig.querySelector('[data-bd="' + k + '"]'); }
    var me = q('me'), clock = q('clock'), fill = q('fill'), done = q('done');
    var S = [q('s0'), q('s1'), q('s2'), q('s3')], P = [q('p0'), q('p1'), q('p2'), q('p3')];
    var X = [66, 184, 302, 420], W = 458;
    function state(x, at, p, ready) {
      me.setAttribute('transform', 'translate(' + x.toFixed(1) + ',30)');
      S.forEach(function (g, i) { g.classList.toggle('on', i === at); });
      fill.setAttribute('width', (W * p).toFixed(1));
      [0, 0.3, 0.55, 0.75].forEach(function (th, i) { P[i].classList.toggle('on', p > th || (i === 0 && p > 0)); });
      var mins = Math.round(360 * p / 15) * 15, h = 9 + Math.floor(mins / 60), m = mins % 60;
      clock.textContent = (h > 12 ? h - 12 : h) + ':' + (m < 10 ? '0' + m : m) + (h >= 12 ? ' pm' : ' am');
      done.classList.toggle('on', ready);
    }
    function draw(sec) {
      var t = sec % 11.5, p, x, at = -1;
      if (t < 1.0) { state(X[0], t > 0.3 ? 0 : -1, 0, false); return; }
      if (t >= 7.9) { state(X[3], 3, 1, true); return; }
      if (t >= 7.6) { state(X[3], 3, 1, false); return; }
      p = (t - 1.0) / 6.6;
      if (p < 0.1) x = X[0] + (X[1] - X[0]) * ease(p / 0.1);
      else if (p < 0.33) { x = X[1]; at = 1; }
      else if (p < 0.43) x = X[1] + (X[2] - X[1]) * ease((p - 0.33) / 0.1);
      else if (p < 0.66) { x = X[2]; at = 2; }
      else if (p < 0.76) x = X[2] + (X[3] - X[2]) * ease((p - 0.66) / 0.1);
      else { x = X[3]; at = 3; }
      state(x, at, p, false);
    }
    loop(fig, draw, function () { state(X[3], 3, 1, true); }, function () { return 9.4; });
  });

  /* DART: one mission in three levels. Learn (case file), Practice (the lens), Evaluation (shield). */
  Array.prototype.forEach.call(document.querySelectorAll('[data-vig="mission"]'), function (fig) {
    function q(k) { return fig.querySelector('[data-da="' + k + '"]'); }
    function all(sel) { return Array.prototype.slice.call(fig.querySelectorAll(sel)); }
    var lens = q('lens'), pts = q('pts'), T1 = q('t1'), T2 = q('t2'), H = [q('h1'), q('h2')], rise = q('rise'), check = q('check'), box = [];
    var tabs = all('[data-lv]'), panels = all('[data-ms]'), cf = all('[data-cf]'), sg = all('[data-sg]'), ev = all('[data-ev]');
    function measure() {
      [T1, T2].forEach(function (t, i) {
        var b; try { b = t.getBBox(); } catch (e) { b = null; }
        if (!b || !b.width) b = { x: 26, y: 58 + i * 32, width: 170, height: 20 };
        box[i] = { x: b.x - 5, y: b.y - 2, w: b.width + 10, h: b.height + 4 };
        H[i].setAttribute('x', box[i].x); H[i].setAttribute('y', box[i].y); H[i].setAttribute('height', box[i].h);
      });
    }
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    function level(n) {
      tabs.forEach(function (el, i) { el.classList.toggle('on', i === n); el.classList.toggle('done', i < n); });
      panels.forEach(function (el, i) { el.classList.toggle('on', i === n); });
    }
    function upTo(list, n) { list.forEach(function (el, i) { el.classList.toggle('on', i < n); }); }
    function marks(p1, p2) {
      H[0].setAttribute('width', (box[0].w * p1).toFixed(1)); H[1].setAttribute('width', (box[1].w * p2).toFixed(1));
      T1.classList.toggle('lit', p1 > 0.5); T2.classList.toggle('lit', p2 > 0.5);
      upTo(sg, p2 >= 1 ? 2 : p1 >= 1 ? 1 : 0);
    }
    function at(x, y, op) { lens.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')'); lens.style.opacity = op.toFixed(2); }
    function shield(f) { rise.setAttribute('y', (140 - 132 * f).toFixed(1)); check.classList.toggle('on', f >= 1); }
    function practice(t) {
      var y0 = 37, y1 = box[0].y + box[0].h / 2, y2 = box[1].y + box[1].h / 2;
      var a1 = box[0].x, b1 = box[0].x + box[0].w, a2 = box[1].x, b2 = box[1].x + box[1].w, e;
      if (t < 0.6) { e = ease(t / 0.6); at(300 + (30 - 300) * e, 8 + (y0 - 8) * e, e); marks(0, 0); return 0; }
      if (t < 1.5) { e = (t - 0.6) / 0.9; at(30 + 185 * e, y0, 1); marks(0, 0); return 0; }
      if (t < 1.9) { e = ease((t - 1.5) / 0.4); at(215 + (a1 - 215) * e, y0 + (y1 - y0) * e, 1); marks(0, 0); return 0; }
      if (t < 3.0) { e = (t - 1.9) / 1.1; at(a1 + (b1 - a1) * e, y1, 1); marks(e, 0); return 0; }
      if (t < 3.4) { e = ease((t - 3.0) / 0.4); at(b1 + (a2 - b1) * e, y1 + (y2 - y1) * e, 1); marks(1, 0); return 50; }
      if (t < 4.5) { e = (t - 3.4) / 1.1; at(a2 + (b2 - a2) * e, y2, 1); marks(1, e); return 50; }
      e = ease((t - 4.5) / 0.5); at(b2 + (310 - b2) * e, y2 + 30 * e, 1 - e); marks(1, 1); return 100;
    }
    function render(t) {
      var p = 0;
      if (t < 3.8) { level(0); upTo(cf, t < 0.5 ? 0 : t < 1.4 ? 1 : t < 2.3 ? 2 : 3); marks(0, 0); at(300, 8, 0); shield(0); upTo(ev, 0); }
      else if (t < 11.6) { level(1); upTo(cf, 3); p = practice((t - 3.8) / 1.4); shield(0); upTo(ev, 0); }
      else {
        var u = t - 11.6, f = ease(u / 1.5);
        level(2); marks(1, 1); at(310, 140, 0); shield(f);
        upTo(ev, u < 1.5 ? 0 : u < 2.2 ? 1 : u < 2.9 ? 2 : 3); p = f >= 1 ? 150 : 100;
      }
      pts.textContent = String(p);
    }
    /* A viewer can pick a level: it plays once and holds there until they press Play all. */
    var START = [0, 3.8, 11.6], END = [3.8, 11.6, 16.2], TOTAL = 16.2;
    var pin = null, over = false, ctl = null;
    var buttons = all('[data-lv] button'), playAll = fig.querySelector('.ms-play');
    function mark() {
      buttons.forEach(function (bt, i) { bt.setAttribute('aria-pressed', pin === i ? 'true' : 'false'); });
      if (playAll) playAll.hidden = pin === null && !over;
      fig.classList.toggle('pinned', pin !== null);
    }
    function draw(sec) { render(pin !== null ? START[pin] + sec : sec); }
    function showLast() { level(1); marks(1, 1); at(310, 140, 0); pts.textContent = '100'; }
    buttons.forEach(function (bt, i) {
      bt.addEventListener('click', function () {
        pin = i; mark();
        if (still) render(END[i] - 0.01); else ctl.play();
      });
    });
    if (playAll) playAll.addEventListener('click', function () {
      pin = null; mark();
      if (still) showLast(); else ctl.play();
    });
    ctl = loop(fig, draw, showLast, function () { return pin !== null ? END[pin] - START[pin] : TOTAL; },
      { ownControls: true, onEnded: function (v) { over = v; mark(); } });
    mark();
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-vig="squat"]'), function (fig) {
    function q(k) { return fig.querySelector('[data-ex="' + k + '"]'); }
    var body = q('body'), arm = q('arm'), head = q('head'), count = q('count'), status = q('status');
    var J = [q('j0'), q('j1'), q('j2'), q('j3')];
    var A = { x: 105, y: 205 }, R = Math.PI / 180;
    function pose(d) {
      var t1 = 28 * d * R, t2 = -75 * d * R, t3 = 40 * d * R, ph = 90 * (1 - d) * R;
      var k = { x: A.x + 52 * Math.sin(t1), y: A.y - 52 * Math.cos(t1) };
      var h = { x: k.x + 54 * Math.sin(t2), y: k.y - 54 * Math.cos(t2) };
      var s = { x: h.x + 60 * Math.sin(t3), y: h.y - 60 * Math.cos(t3) };
      var hd = { x: s.x + 22 * Math.sin(t3), y: s.y - 22 * Math.cos(t3) };
      var hand = { x: s.x + 42 * Math.cos(ph), y: s.y + 42 * Math.sin(ph) };
      var P = [A, k, h, s];
      body.setAttribute('points', P.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '));
      P.forEach(function (p, i) { J[i].setAttribute('cx', p.x.toFixed(1)); J[i].setAttribute('cy', p.y.toFixed(1)); });
      arm.setAttribute('x1', s.x.toFixed(1)); arm.setAttribute('y1', s.y.toFixed(1));
      arm.setAttribute('x2', hand.x.toFixed(1)); arm.setAttribute('y2', hand.y.toFixed(1));
      head.setAttribute('cx', hd.x.toFixed(1)); head.setAttribute('cy', hd.y.toFixed(1));
    }
    function say(s, text) { if (status.getAttribute('data-s') !== s) { status.setAttribute('data-s', s); status.textContent = text; } }
    var reps = [1, 1, 0.45, 1], REP = 2400, HOLD = 1600, total = reps.length * REP + HOLD;
    if (still) { pose(1); count.textContent = '3'; say('ok', 'Counted'); return; }
    function draw(sec) {
      var t = (sec * 1000) % total, i = Math.floor(t / REP), counted = 0, j;
      if (i >= reps.length) { pose(0); count.textContent = '3'; say('idle', 'Session complete'); }
      else {
        var u = (t - i * REP) / 2000, d = u < 1 ? reps[i] * Math.pow(Math.sin(Math.PI * u), 2) : 0;
        pose(d);
        for (j = 0; j < i; j++) if (reps[j] > 0.9) counted++;
        var past = u >= 0.5;
        if (past && reps[i] > 0.9) counted++;
        count.textContent = String(counted);
        if (!past) say('idle', 'Tracking on device');
        else if (reps[i] > 0.9) say('ok', 'Counted');
        else say('no', 'Not counted: range too small');
        fig.classList.toggle('miss', past && reps[i] <= 0.9);
      }
    }
    loop(fig, draw, function () {}, function () { return total / 1000; });
  });
})();
