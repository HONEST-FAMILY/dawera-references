(function () {
  var d = document;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var A = '../assets/';
  var W = 'https://www.dawera.co.kr/work/list?viewMode=view&idx=';

  var vids = [];
  var vis = new Map();
  function pump() {
    var arr = [];
    vis.forEach(function (r, v) { if (r > 0.2 && d.contains(v) && v.offsetParent !== null) arr.push([v, r]); });
    arr.sort(function (a, b) { return b[1] - a[1]; });
    var allow = arr.slice(0, 2).map(function (x) { return x[0]; });
    vids.forEach(function (v) {
      if (!reduce && allow.indexOf(v) > -1) {
        if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      } else if (!v.paused) v.pause();
    });
  }
  var vio = hasIO ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { vis.set(e.target, e.isIntersecting ? e.intersectionRatio : 0); });
    pump();
  }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }) : null;
  function watch(v) { v.muted = true; vids.push(v); if (vio) vio.observe(v); }
  function unwatch(v) { if (vio) vio.unobserve(v); vis.delete(v); vids = vids.filter(function (x) { return x !== v; }); v.pause(); }
  [].forEach.call(d.querySelectorAll('video[data-auto]'), watch);

  var C = {
    ani: { n: '3D 애니메이션', u: 'https://www.dawera.co.kr/curriculum/portfolio?name=portfolio1', ind: ['film', 'ad'], want: '캐릭터가 생동감 있게 움직이는 작품', indq: '영화, 애니메이션, 광고, 전시 업계 취업 희망', m: ['c3', 'w555'] },
    vfx: { n: 'VFX', u: 'https://www.dawera.co.kr/curriculum/portfolio?name=portfolio2', ind: ['film', 'ad', 'game'], want: '실사 촬영본에 3D를 입히는 작품의 실무 공정', indq: '영화, 애니메이션, 광고, 게임 업계 취업 희망', m: null },
    mg: { n: '모션그래픽', u: 'https://www.dawera.co.kr/curriculum/portfolio?name=portfolio3', ind: ['ad'], want: '감각적인 제품 영상 제작의 실무 공정', indq: '광고, 전시 업계 취업 희망', m: ['c7', 'w568'] },
    ue: { n: '언리얼엔진', u: 'https://www.dawera.co.kr/curriculum/portfolio?name=portfolio4', ind: ['film', 'ad', 'game'], want: '언리얼엔진만의 효율적인 신기술을 활용한 영상 제작 공정', indq: '영화, 애니메이션, 광고, 전시, 게임 업계 취업 희망', m: ['c4', 'w550'] }
  };
  var M = {
    c3: { v: 'c3', t: '내 달걀 내 곁에', s: '장예지', f: '3D 애니메이션', i: 569 },
    w555: { w: 'w555', t: '최장신 애니메이터의 작품', s: '이건화', f: '애니메이션', i: 555 },
    c7: { v: 'c7', t: 'rhode 갖고 싶다', s: '김윤하', f: '모션그래픽', i: 553 },
    w568: { w: 'w568', t: '화성에 상륙해 버린 롯데리아', s: '오소영', f: '모션그래픽', i: 568 },
    c4: { v: 'c4', t: 'The Hunter', s: '김승연', f: '언리얼엔진', i: 567 },
    w550: { w: 'w550', t: '경복궁 향원정 맵', s: '류현주', f: '언리얼엔진', i: 550 }
  };
  var IND = { film: '영화·애니메이션', ad: '광고·전시', game: '게임' };
  var WANT = { char: 'ani', vfx: 'vfx', product: 'mg', unreal: 'ue' };
  var INDC = { film: 'ani', ad: 'mg', game: 'ue' };
  var FAQ5 = '당연히 수강 가능합니다. 6개월이상 소요되는 일반적인 커리큘럼 과정을 다워라에서는 3개월 기초과정으로 핵심만 공략해서 교육을 합니다.';
  var FAQ7 = '작업물에 관해서는 그 어떤 제한이나 예외없이 무조건 도움받을 수 있는 케어시스템으로 운영되고 있습니다.';

  var form = d.getElementById('fd-form');
  var lastMedia = 'c3,w550';
  var result = d.getElementById('result');
  function val(n) { var el = form.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; }

  function mediaHTML(key) {
    var m = M[key];
    var alt = m.s + ' 수강생 작품 「' + m.t + '」 — ' + m.f;
    var inner = m.v
      ? '<video data-auto muted playsinline loop preload="metadata" poster="' + A + 'video/' + m.v + '.jpg" src="' + A + 'video/' + m.v + '.mp4" aria-label="' + alt + ' 영상"></video>'
      : '<img src="' + A + 'works/' + m.w + '.jpg" alt="' + alt + '" width="440" height="248">';
    return '<figure class="rm-fig"><a href="' + W + m.i + '"><div class="media">' + inner + '</div></a><figcaption><b>' + m.t + '</b> ' + m.s + ' · ' + m.f + '</figcaption></figure>';
  }

  function render(animate) {
    var st = val('stage'), ind = val('ind'), want = val('want');
    var n = (st ? 1 : 0) + (ind ? 1 : 0) + (want ? 1 : 0);
    d.getElementById('fd-n').textContent = n;
    d.getElementById('fd-bar').style.width = (n / 3 * 100) + '%';
    [].forEach.call(form.querySelectorAll('.q'), function (q) { q.classList.toggle('done', !!q.querySelector('input:checked')); });

    var key = want ? WANT[want] : (ind && ind !== 'none' ? INDC[ind] : '');
    var c = key ? C[key] : null;
    var pf = c ? c.n + ' 포트폴리오' : '포트폴리오 과정';
    var pfB = c ? '<a href="' + c.u + '">' + pf + '</a>' : pf;
    var steps, title, why = [];
    if (st === 'other') {
      steps = [
        { k: '지금', b: '하던 작업 그대로', v: '제한 없이 도움' },
        { k: '다음', b: pfB, v: '평균 4~12개월', note: '본원이 처음이면 보통 2~3달 더', hl: 1 },
        { k: '목표', b: '포트폴리오 완성', v: '98%에 육박', note: '포폴 완성률 · 수강생 기준' }
      ];
      title = (c ? c.n + ' 포트폴리오' : '포트폴리오 과정') + '(평균 4~12개월)으로 하던 작업 이어서 완성까지';
      why.push({ s: '자주 묻는 질문 7', q: FAQ7 });
    } else {
      steps = [
        { k: '1단계', b: '통합 기초 과정', v: '3개월', note: '온라인 수강 가능' },
        { k: '2단계', b: pfB, v: '평균 4~12개월', note: '100% 대면 · 현장 피드백', hl: !!c },
        { k: '3단계', b: '포트폴리오 완성', v: '98%에 육박', note: '포폴 완성률 · 수강생 기준' }
      ];
      title = '통합 기초 과정 3개월 → ' + pf + '(평균 4~12개월)';
      if (st === 'new') why.push({ s: '자주 묻는 질문 5', q: FAQ5 });
      if (st === 'self') why.push({ s: '통합 기초 과정 · 이런 분께', q: '유튜브와 온라인 강의로 독학하다가 혼자서는 답을 찾지 못한 분' });
    }
    if (c) {
      if (want) why.push({ s: c.n + ' · 이런 분께', q: c.want });
      if (ind && ind !== 'none') {
        if (c.ind.indexOf(ind) > -1) why.push({ s: c.n + ' · 이런 분께', q: c.indq });
        else {
          var alt = Object.keys(C).filter(function (k) { return C[k].ind.indexOf(ind) > -1; }).map(function (k) { return C[k].n; });
          why.push({ s: '함께 상담해 보세요', p: IND[ind] + ' 업계 취업 희망은 ' + alt.join('·') + ' 과정의 ‘이런 분께’에 들어 있어요.' });
        }
      }
    } else if (ind === 'none') {
      why.push({ s: '통합 기초 과정 · 이런 분께', q: '다양한 파트와 프로그램으로 CG 방향이 안 잡히는 분' });
    }
    if (!st && !c) {
      if (!why.length || ind === 'none') why.unshift({ s: '자주 묻는 질문 5', q: FAQ5 });
      if (why.length < 2) why.push({ s: '통합 기초 과정 · 이런 분께', q: 'CG를 하고 싶은데 뭐부터 시작해야 할 지 막막한 분' });
    }
    why = why.slice(0, 3);

    d.getElementById('rs-hint').textContent = n ? n + '개 답을 반영했어요' : '질문에 답하면 바로 바뀌어요';
    d.getElementById('rs-title').textContent = title;
    d.getElementById('rs-path').innerHTML = steps.map(function (s) {
      return '<li' + (s.hl ? ' class="hl"' : '') + '><span class="rp-k">' + s.k + '</span><b>' + s.b + '</b><span class="rp-v">' + s.v + '</span>' + (s.note ? '<span class="rp-n">' + s.note + '</span>' : '') + '</li>';
    }).join('');
    d.getElementById('rs-why').innerHTML = why.map(function (w) {
      return '<li><span class="rw-src">' + w.s + '</span>' + (w.q ? '<q>' + w.q + '</q>' : '<span class="rw-p">' + w.p + '</span>') + '</li>';
    }).join('');

    var box = d.getElementById('rs-media');
    var mk = c ? (c.m ? c.m.join(',') : 'vfx') : 'c3,w550';
    if (mk !== lastMedia) {
    lastMedia = mk;
    [].forEach.call(box.querySelectorAll('video'), unwatch);
    if (c && !c.m) {
      box.innerHTML = '<div class="rs-steps"><p>VFX 포트폴리오 특화 단계 · 실사 촬영본에 3D를 입히는 공정</p><ol><li>카메라 트래킹(실사 합성)</li><li>프랍 배치</li><li>실사 촬영 현장과의 라이팅 매칭</li><li>실사 촬영본 합성</li></ol></div>';
    } else {
      var keys = c ? c.m : ['c3', 'w550'];
      box.innerHTML = keys.map(mediaHTML).join('');
    }
    [].forEach.call(box.querySelectorAll('video'), watch);
    }
    if (animate && !reduce) { result.classList.remove('swap'); void result.offsetWidth; result.classList.add('swap'); }
  }
  if (form) {
    form.addEventListener('change', function () { render(true); });
    render(false);
  }

  var rm = d.getElementById('rmap');
  if (rm) {
    var nodes = [].slice.call(rm.querySelectorAll('.rmap-node'));
    var panels = nodes.map(function (b) { return d.getElementById(b.getAttribute('aria-controls')); });
    var dots = nodes.map(function (b) { return b.querySelector('.rmap-dot'); });
    var rail = rm.querySelector('.rmap-rail');
    var th = [0, 0.5, 1], vert = false, maxP = -1;
    var mq = window.matchMedia('(max-width: 900px)');
    var setOpen = function (i) {
      nodes.forEach(function (b, j) {
        var on = j === i;
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
        panels[j].classList.toggle('open', on);
      });
      if (i > -1) [].forEach.call(panels[i].querySelectorAll('.unit-chips li'), function (li, k) { li.style.setProperty('--i', k); });
      layout();
    };
    nodes.forEach(function (b, i) {
      b.addEventListener('click', function () {
        var isOpen = b.getAttribute('aria-expanded') === 'true';
        setOpen(isOpen && mq.matches ? -1 : i);
      });
    });
    var layout = function () {
      var r = rm.getBoundingClientRect(), a = dots[0].getBoundingClientRect(), z = dots[2].getBoundingClientRect();
      vert = Math.abs(z.left - a.left) < 8;
      rm.classList.toggle('is-vert', vert);
      if (vert) {
        rail.style.left = (a.left - r.left + a.width / 2 - 1) + 'px';
        rail.style.top = (a.top - r.top + a.height / 2) + 'px';
        rail.style.width = '2px';
        rail.style.height = Math.max(0, z.top - a.top) + 'px';
      } else {
        rail.style.left = (a.left - r.left + a.width / 2) + 'px';
        rail.style.top = (a.top - r.top + a.height / 2 - 1) + 'px';
        rail.style.height = '2px';
        rail.style.width = Math.max(0, z.left - a.left) + 'px';
      }
      th = dots.map(function (dt) {
        var b = dt.getBoundingClientRect();
        var len = vert ? (z.top - a.top) : (z.left - a.left);
        return len > 0 ? (vert ? (b.top - a.top) : (b.left - a.left)) / len : 0;
      });
      apply();
    };
    var countUp = function (b) {
      [].forEach.call(b.querySelectorAll('[data-count]'), function (el) {
        var to = +el.getAttribute('data-count');
        if (reduce) { el.textContent = to; return; }
        var t0 = performance.now(), dur = 1200;
        var f = function (t) {
          var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(to * e);
          if (k < 1) requestAnimationFrame(f); else el.textContent = to;
        };
        requestAnimationFrame(f);
      });
    };
    var apply = function () {
      var q = Math.max(0, maxP);
      rm.style.setProperty('--p', q.toFixed(4));
      if (maxP < 0) return;
      nodes.forEach(function (b, i) {
        if (q >= th[i] - 0.002 && !b.classList.contains('on')) { b.classList.add('on'); countUp(b); }
      });
    };
    var prog = function () {
      var vh = innerHeight, a = dots[0].getBoundingClientRect(), z = dots[2].getBoundingClientRect(), p;
      if (vert) p = (vh * 0.62 - (a.top + a.height / 2)) / Math.max(1, z.top - a.top);
      else p = (vh * 0.86 - (a.top + a.height / 2)) / (vh * 0.42);
      p = Math.max(-1, Math.min(1, p));
      if (p > maxP) { maxP = p; apply(); }
    };
    if (reduce) { maxP = 1; }
    else [].forEach.call(rm.querySelectorAll('[data-count]'), function (el) { el.textContent = '0'; });
    setOpen(0);
    var tick = false;
    var onScroll = function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; prog(); reveal(); }); };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', function () { layout(); prog(); });
    if (mq.addEventListener) mq.addEventListener('change', function () { setOpen(0); });
    prog();
  }

  var rvs = [].slice.call(d.querySelectorAll('.sec-head, .tile, .course, .why li, .st, .work, .rv-card, .faq details, .visit > div, .iv-list li, .rmap-node'));
  function reveal() {
    var vh = innerHeight;
    rvs.forEach(function (el) {
      if (el.classList.contains('rv') && !el.classList.contains('in') && el.getBoundingClientRect().top < vh * 0.94) el.classList.add('in');
    });
  }
  if (!reduce && hasIO) {
    var groups = new Map();
    rvs.forEach(function (el) {
      if (el.getBoundingClientRect().top < innerHeight * 0.96) return;
      var p = el.parentNode, k = groups.get(p) || 0;
      groups.set(p, k + 1);
      el.style.setProperty('--d', ((k % 4) * 0.07) + 's');
      el.classList.add('rv');
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    rvs.forEach(function (el) { if (el.classList.contains('rv')) io.observe(el); });
    setTimeout(reveal, 900);
    if (!rm) addEventListener('scroll', function () { requestAnimationFrame(reveal); }, { passive: true });
  }

  var tabs = [].slice.call(d.querySelectorAll('.tab'));
  var items = [].slice.call(d.querySelectorAll('#works-grid .work'));
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var f = t.getAttribute('data-f');
      tabs.forEach(function (x) { x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); });
      items.forEach(function (it) {
        var ok = f === 'all' || it.getAttribute('data-f').split(' ').indexOf(f) > -1;
        it.hidden = !ok;
        if (ok) {
          it.classList.add('in');
          if (!reduce) { it.classList.remove('pop'); void it.offsetWidth; it.classList.add('pop'); }
        }
      });
      setTimeout(pump, 60);
    });
  });
})();
