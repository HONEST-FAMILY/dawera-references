(() => {
  const d = document;
  const root = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const EASE = 'cubic-bezier(.2,.7,.1,1)';
  const canAnim = !!Element.prototype.animate;

  const theater = d.getElementById('top');
  const reels = [...d.querySelectorAll('.reel')];
  const byId = {};
  reels.forEach(v => { byId[v.dataset.id] = v; v.muted = true; });
  const order = ['c1', 'c4', 'c3', 'c7', 'c2', 'c9'];
  const segs = [...d.querySelectorAll('#progress li')];
  const now = d.getElementById('now');
  const nowText = d.getElementById('nowText');
  const pauseBtn = d.getElementById('reelPause');
  const DUR = 5000;
  let idx = 0, cur = byId.c1, elapsed = 0, last = 0, held = null, inView = true, userPaused = reduce, capTok = 0;

  const ensure = v => { if (v && !v.getAttribute('src') && v.dataset.src) v.setAttribute('src', v.dataset.src); };
  const play = v => { if (!v) return; ensure(v); const p = v.play(); if (p && p.catch) p.catch(() => {}); };

  function caption(v) {
    const txt = '「' + v.dataset.title + '」 ' + v.dataset.student + ' 학생 · ' + v.dataset.course;
    now.href = v.dataset.href;
    const t = ++capTok;
    if (nowText.textContent === txt) return;
    if (reduce || !canAnim) { nowText.textContent = txt; return; }
    nowText.getAnimations().forEach(a => a.cancel());
    const out = nowText.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-115%)' }], { duration: 260, easing: 'cubic-bezier(.55,0,.8,.2)', fill: 'forwards' });
    out.onfinish = () => {
      if (t !== capTok) return;
      nowText.textContent = txt;
      out.cancel();
      nowText.animate([{ transform: 'translateY(115%)' }, { transform: 'translateY(0)' }], { duration: 700, easing: EASE });
    };
  }

  function show(v) {
    if (!v || v === cur) return;
    const prev = cur;
    cur = v;
    ensure(v);
    v.preload = 'auto';
    try { v.currentTime = 0; } catch (e) {}
    if (!userPaused && inView) play(v);
    v.classList.add('is-on');
    prev.classList.remove('is-on');
    reels.forEach(r => { if (r !== cur && r !== prev) r.pause(); });
    clearTimeout(prev._t);
    prev._t = setTimeout(() => { if (prev !== cur) prev.pause(); }, 1300);
    caption(v);
  }

  function paint() {
    segs.forEach((li, i) => {
      const p = i < idx ? 1 : i === idx ? Math.min(elapsed / DUR, 1) : 0;
      li.style.setProperty('--p', p.toFixed(4));
      li.classList.toggle('is-on', i === idx);
    });
  }

  function go(i) {
    idx = i;
    elapsed = 0;
    show(byId[order[i]]);
    const nx = byId[order[(i + 1) % order.length]];
    if (nx) { ensure(nx); nx.preload = 'auto'; }
    paint();
  }

  function tick(t) {
    requestAnimationFrame(tick);
    const dt = last ? Math.min(t - last, 100) : 0;
    last = t;
    if (held || userPaused || !inView || d.hidden) return;
    elapsed += dt;
    if (elapsed >= DUR) { go((idx + 1) % order.length); return; }
    paint();
  }

  function hold(id) {
    const v = byId[id];
    if (!v) return;
    held = id;
    theater.classList.add('is-held');
    show(v);
  }

  function release() {
    if (!held) return;
    const i = order.indexOf(held);
    held = null;
    theater.classList.remove('is-held');
    if (i >= 0) { idx = i; elapsed = 0; paint(); }
    else go(idx);
  }

  function setPaused(p) {
    userPaused = p;
    pauseBtn.textContent = p ? '재생' : '일시정지';
    pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
    if (p) reels.forEach(r => r.pause());
    else if (inView) play(cur);
  }

  if (theater && cur) {
    segs.forEach((li, i) => li.querySelector('button').addEventListener('click', () => { held = null; theater.classList.remove('is-held'); go(i); }));
    pauseBtn.addEventListener('click', () => setPaused(!userPaused));
    setPaused(userPaused);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => {
        inView = es[0].isIntersecting;
        if (!inView) reels.forEach(r => r.pause());
        else if (!userPaused) play(cur);
      }, { threshold: 0.1 }).observe(theater);
    }
    d.addEventListener('visibilitychange', () => {
      if (d.hidden) reels.forEach(r => r.pause());
      else if (!userPaused && inView) play(cur);
    });
    addEventListener('load', () => setTimeout(() => { const nx = byId[order[1]]; ensure(nx); nx.preload = 'auto'; }, 1200));
    paint();
    requestAnimationFrame(tick);

    if (!reduce && canAnim) {
      theater.querySelectorAll('.theater__h1 .ln > span').forEach((s, i) => {
        s.animate([{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], { duration: 1000, delay: 150 + i * 110, easing: EASE, fill: 'backwards' });
      });
      theater.querySelectorAll('.theater__kicker, .theater__lede, .theater__cta, .theater__foot').forEach((el, i) => {
        el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 380 + i * 90, easing: EASE, fill: 'backwards' });
      });
    }
  }

  const cbar = d.getElementById('cbar');
  if (cbar) {
    const courses = [...cbar.querySelectorAll('.course')];
    const activate = c => {
      courses.forEach(x => x.classList.toggle('is-hot', x === c));
      if (c.dataset.clip) hold(c.dataset.clip);
    };
    const reset = () => { courses.forEach(x => x.classList.remove('is-hot')); release(); };
    courses.forEach(c => {
      c.addEventListener('mouseenter', () => { if (fine.matches) activate(c); });
      c.addEventListener('focusin', () => { if (fine.matches) activate(c); });
    });
    cbar.addEventListener('pointerenter', () => courses.forEach(c => ensure(byId[c.dataset.clip])), { once: true });
    cbar.addEventListener('mouseleave', () => { if (fine.matches) reset(); });
    cbar.addEventListener('focusout', e => { if (!cbar.contains(e.relatedTarget)) reset(); });
  }

  const film = d.getElementById('film');
  const chips = [...d.querySelectorAll('#chips .chip')];
  const more = d.getElementById('filmMore');
  const cards = film ? [...film.children] : [];
  const STEP = 12;
  let filter = 'all', limit = STEP;

  function layout(animate) {
    const first = new Map();
    if (animate) cards.forEach(c => { if (!c.hidden) first.set(c, c.getBoundingClientRect()); });
    let n = 0, total = 0;
    cards.forEach(c => {
      const ok = filter === 'all' || c.dataset.tags.split('|').indexOf(filter) > -1;
      if (ok) total++;
      const vis = ok && n < limit;
      if (vis) n++;
      c.hidden = !vis;
    });
    more.hidden = total <= limit;
    if (!animate || reduce || !canAnim) return;
    let k = 0;
    cards.forEach(c => {
      if (c.hidden) return;
      c.getAnimations().forEach(a => a.cancel());
      const f = first.get(c);
      const l = c.getBoundingClientRect();
      if (f) {
        const dx = f.left - l.left, dy = f.top - l.top;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 750, easing: EASE });
        }
      } else {
        c.animate([{ opacity: 0, transform: 'translateY(32px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 160 + (k++) * 45, easing: EASE, fill: 'backwards' });
      }
    });
  }

  if (film && more) {
    layout(false);
    chips.forEach(ch => ch.addEventListener('click', () => {
      if (ch.dataset.f === filter) return;
      filter = ch.dataset.f;
      limit = STEP;
      chips.forEach(x => { const on = x === ch; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      layout(true);
    }));
    more.addEventListener('click', () => { limit += STEP; layout(true); });
  }

  if (reduce || !('IntersectionObserver' in window)) return;

  root.classList.add('js-ready');
  d.querySelectorAll('.h2').forEach(h => { h.innerHTML = '<span class="m"><span class="mi">' + h.innerHTML + '</span></span>'; });
  d.querySelectorAll('.str, .quotes, .iv').forEach(g => [...g.querySelectorAll('.rv')].forEach((el, i) => el.style.setProperty('--d', (i % 4) * 90 + 'ms')));

  const targets = [...d.querySelectorAll('.rv, .h2')];
  const reveal = el => el.classList.add('in');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    reveal(e.target);
  }), { rootMargin: '0px 0px -6% 0px' });
  targets.forEach(el => io.observe(el));
  const safety = () => targets.forEach(el => { if (!el.classList.contains('in') && el.getBoundingClientRect().top < innerHeight) { io.unobserve(el); reveal(el); } });
  setTimeout(safety, 900);
  addEventListener('scroll', () => { clearTimeout(safety._t); safety._t = setTimeout(safety, 900); }, { passive: true });

  const count = el => {
    const to = +el.dataset.count;
    const t0 = performance.now();
    const step = t => {
      const p = Math.min((t - t0) / 1500, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  };
  const stats = d.getElementById('stats');
  if (stats) {
    const so = new IntersectionObserver(es => { if (es[0].isIntersecting) { so.disconnect(); stats.querySelectorAll('[data-count]').forEach(count); } }, { rootMargin: '0px 0px 8% 0px' });
    so.observe(stats);
  }

  if (film && canAnim) {
    const fo = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return;
      fo.disconnect();
      cards.filter(c => !c.hidden).forEach((c, i) => {
        const img = c.querySelector('img');
        c.animate([{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: (i % 4) * 80 + Math.floor(i / 4) * 120, easing: EASE, fill: 'backwards' });
        if (img) img.animate([{ scale: '1.14' }, { scale: '1' }], { duration: 1600, delay: (i % 4) * 80 + Math.floor(i / 4) * 120, easing: EASE, fill: 'backwards' });
      });
    }, { rootMargin: '0px 0px 6% 0px' });
    fo.observe(film);
  }
})();
