(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var visibleVideos = new Map();
  var heroVisible = true;
  var heroVideo = null;

  function play(v) {
    if (!v.paused) return;
    try {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  function syncVideos() {
    var all = $$('video');
    var want = [];
    if (!reduce) {
      if (heroVisible && heroVideo) want.push(heroVideo);
      var rest = [];
      visibleVideos.forEach(function (ratio, v) { if (v !== heroVideo && !v.closest('.hero')) rest.push([ratio, v]); });
      rest.sort(function (a, b) { return b[0] - a[0]; });
      rest.forEach(function (r) { want.push(r[1]); });
      want = want.slice(0, 2);
    }
    all.forEach(function (v) {
      if (want.indexOf(v) > -1) play(v);
      else if (!v.paused) v.pause();
    });
  }

  var slot = $('.slot');
  var roll = slot && $('.roll', slot);
  var words = roll ? $$('i', roll) : [];
  var figs = $$('.hm');
  var idx = 0;
  var N = 4;
  var outTimer = null;
  var stepTimer = null;

  function wordWidth(i) { return words[i] ? words[i].getBoundingClientRect().width : 0; }
  function setSlotWidth(i) {
    var w = wordWidth(i);
    if (w > 0 && slot) slot.style.width = Math.ceil(w + 1) + 'px';
  }
  function heroVideoFor(i) {
    var f = figs[i];
    return f ? $('video', f) : null;
  }
  function showFig(i) {
    var cur = null;
    figs.forEach(function (f) { if (f.classList.contains('is-on')) cur = f; });
    var nxt = figs[i];
    if (!nxt || cur === nxt) return;
    figs.forEach(function (f) { if (f !== cur) f.classList.remove('is-out'); });
    if (cur) { cur.classList.remove('is-on', 'is-anim'); cur.classList.add('is-out'); }
    nxt.classList.remove('is-anim', 'is-out');
    void nxt.offsetWidth;
    nxt.classList.add('is-on', 'is-anim');
    heroVideo = heroVideoFor(i);
    if (heroVideo) { try { heroVideo.currentTime = 0; } catch (e) {} }
    clearTimeout(outTimer);
    outTimer = setTimeout(function () { if (cur) cur.classList.remove('is-out'); }, 1150);
    syncVideos();
  }
  function step() {
    if (!roll) return;
    if (document.hidden || !heroVisible) { schedule(); return; }
    idx += 1;
    roll.style.transform = 'translateY(' + (-1.14 * idx) + 'em)';
    setSlotWidth(idx);
    showFig(idx % N);
    if (idx === N) {
      setTimeout(function () {
        roll.style.transition = 'none';
        idx = 0;
        roll.style.transform = 'translateY(0)';
        void roll.offsetWidth;
        roll.style.transition = '';
      }, 1050);
    }
    schedule();
  }
  function schedule() {
    clearTimeout(stepTimer);
    stepTimer = setTimeout(step, 3200);
  }
  if (roll && !reduce) {
    setSlotWidth(0);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setSlotWidth(idx); });
    window.addEventListener('resize', function () { setSlotWidth(idx); });
    schedule();
  } else if (roll) {
    doc.classList.remove('js');
    doc.classList.add('rm');
  }
  heroVideo = heroVideoFor(0);

  if (hasIO) {
    var hero = $('.hero');
    if (hero) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { heroVisible = e.isIntersecting; });
        syncVideos();
      }, { threshold: 0.15 }).observe(hero);
    }
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio >= 0.3) visibleVideos.set(e.target, e.intersectionRatio);
        else visibleVideos.delete(e.target);
      });
      syncVideos();
    }, { threshold: [0, 0.3, 0.6, 0.9] });
    $$('video').forEach(function (v) { if (!v.closest('.hero')) vio.observe(v); });
  }

  var spreads = $$('.spread');
  if (hasIO && !reduce) {
    doc.classList.add('io');
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); sio.unobserve(e.target); }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    spreads.forEach(function (s) { sio.observe(s); });
    setTimeout(function () {
      var vh = window.innerHeight;
      spreads.forEach(function (s) {
        var r = s.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) s.classList.add('is-in');
      });
    }, 900);
  }

  var frames = $$('.sp-media .frame');
  var ticking = false;
  function settle() {
    ticking = false;
    var vh = window.innerHeight;
    frames.forEach(function (f) {
      var r = f.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var p = (vh - r.top) / (vh * 0.85);
      p = Math.max(0, Math.min(1, p));
      var e = 1 - Math.pow(1 - p, 3);
      f.style.setProperty('--sc', (1.08 - 0.08 * e).toFixed(4));
    });
  }
  if (!reduce && frames.length) {
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(settle); }
    }, { passive: true });
    window.addEventListener('resize', settle);
    settle();
  }

  var index = $('.index');
  if (index) {
    $$('.index-list li', index).forEach(function (li) {
      li.addEventListener('mouseenter', function () {
        index.style.setProperty('--y', (li.offsetTop + li.offsetHeight / 2) + 'px');
      });
    });
  }

  var nums = $('.num-list');
  if (nums && hasIO && !reduce) {
    var done = false;
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || done) return;
        done = true;
        nio.disconnect();
        $$('.count', nums).forEach(function (el) {
          var to = parseFloat(el.getAttribute('data-to')) || 0;
          var suf = el.getAttribute('data-suffix') || '';
          var t0 = null;
          var dur = to > 50 ? 1600 : 900;
          function f(t) {
            if (t0 === null) t0 = t;
            var k = Math.min(1, (t - t0) / dur);
            var v = Math.round(to * (1 - Math.pow(1 - k, 3)));
            el.textContent = v + suf;
            if (k < 1) requestAnimationFrame(f);
          }
          requestAnimationFrame(f);
        });
      });
    }, { threshold: 0.4 });
    nio.observe(nums);
  }
})();
