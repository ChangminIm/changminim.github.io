/* ==== v2 hero — MapLibre GL scrollytelling ==== */
(function () {
  const D = window.LAB_DATA;
  const YEARS = D.years, Y0 = YEARS[0], Y1 = YEARS[YEARS.length - 1];
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroEl = document.querySelector('.hero');
  const cs = getComputedStyle(heroEl);
  const tv = n => cs.getPropertyValue(n).trim();
  const RAMP = [tv('--ramp-lo'), tv('--ramp-mid'), tv('--ramp-hi')];
  const POS = tv('--pos'), NEG = tv('--neg');

  /* ---------- data helpers ---------- */
  const allDep = [];
  Object.values(D.dep).forEach(o => Object.values(o).forEach(x => { if (x != null) allDep.push(x); }));
  allDep.sort((a, b) => a - b);
  const q = p => allDep[Math.floor(p * (allDep.length - 1))];
  const DMIN = q(0.02), DMAX = q(0.98);
  const depAt = (cd, yf) => {
    const s = D.dep[cd]; if (!s) return null;
    const y0 = Math.max(Y0, Math.min(Y1, Math.floor(yf)));
    const y1 = Math.min(Y1, y0 + 1);
    const a = s[y0], b = s[y1];
    if (a == null) return b; if (b == null) return a;
    return a + (b - a) * (yf - y0);
  };

  /* ---------- map ---------- */
  const map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [127.9, 36.1], zoom: 5.3, pitch: 0, bearing: 0,
    scrollZoom: false, dragPan: false, dragRotate: false,
    doubleClickZoom: false, keyboard: false, touchZoomRotate: false,
    attributionControl: false
  });
  map.addControl(new maplibregl.AttributionControl({
    compact: true,
    customAttribution: 'NASA GIBS Black Marble · © CARTO · © OpenStreetMap'
  }), 'bottom-left');

  let mapReady = false, curYear = Y0, lastPaintedYear = null, selected = null, hotCenter = null;

  const baseSymbols = [];
  let labelsOn = false;
  map.on('load', () => {
    const firstSymbol = (map.getStyle().layers.find(l => l.type === 'symbol') || {}).id;

    /* 바다 명칭(Sea of Japan 등)은 완전히 제거, 나머지 지명은 지도 씬 전까지 숨김 */
    map.getStyle().layers.forEach(l => {
      if (l.type !== 'symbol') return;
      const sl = (l['source-layer'] || '') + ' ' + l.id;
      if (/water|marine|ocean|sea/i.test(sl)) {
        map.setLayoutProperty(l.id, 'visibility', 'none');
      } else {
        baseSymbols.push(l.id);
        map.setLayoutProperty(l.id, 'visibility', 'none');
      }
    });

    /* 동해·황해 — 직접 라벨링 */
    [{ ko: '동  해', en: 'EAST SEA', c: [129.6, 38.1] },
     { ko: '황  해', en: 'YELLOW SEA', c: [124.7, 36.4] }].forEach(s => {
      const el = document.createElement('div');
      el.className = 'sea-label';
      el.innerHTML = `<span>${s.ko}</span><small>${s.en}</small>`;
      new maplibregl.Marker({ element: el }).setLngLat(s.c).addTo(map);
    });

    map.addSource('bm', {
      type: 'raster', tileSize: 256, maxzoom: 8,
      tiles: ['https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png']
    });
    map.addLayer({ id: 'bm', type: 'raster', source: 'bm',
      paint: { 'raster-opacity': 1, 'raster-fade-duration': 0 } }, firstSymbol);

    map.addSource('sma', { type: 'geojson', data: D.geo, promoteId: 'cd' });
    map.addSource('sma-out', { type: 'geojson', data: D.outline });

    map.addLayer({ id: 'chor', type: 'fill', source: 'sma', paint: {
      'fill-color': ['interpolate', ['linear'],
        ['coalesce', ['feature-state', 'dep'], DMIN],
        DMIN, RAMP[0], (DMIN + DMAX) / 2, RAMP[1], DMAX, RAMP[2]],
      'fill-opacity': 0
    } }, firstSymbol);

    map.addLayer({ id: 'chor-line', type: 'line', source: 'sma', paint: {
      'line-color': tv('--map-outline'), 'line-width': 0.7, 'line-opacity': 0
    } }, firstSymbol);

    map.addLayer({ id: 'out-line', type: 'line', source: 'sma-out', paint: {
      'line-color': tv('--map-outline'), 'line-width': 1.4, 'line-opacity': 0
    } }, firstSymbol);

    map.addLayer({ id: 'hot-line', type: 'line', source: 'sma',
      filter: ['in', ['get', 'cd'], ['literal', hotList.map(h => h.cd)]],
      paint: { 'line-color': tv('--accent-strong'), 'line-width': 2, 'line-opacity': 0 } }, firstSymbol);

    map.addLayer({ id: 'sel-line', type: 'line', source: 'sma',
      filter: ['==', ['get', 'cd'], ''],
      paint: { 'line-color': tv('--accent-strong'), 'line-width': 2.4, 'line-opacity': 0 } }, firstSymbol);

    setYear(Y0, true);
    mapReady = true;

    if (REDUCED) {
      /* 정적 모드: 최종 상태로 고정 */
      map.jumpTo({ center: [126.95, 37.42], zoom: 8.0, pitch: 30, bearing: -8 });
      map.setPaintProperty('bm', 'raster-opacity', 0.35);
      map.setPaintProperty('chor', 'fill-opacity', 0.85);
      map.setPaintProperty('chor-line', 'line-opacity', 0.4);
      map.setPaintProperty('out-line', 'line-opacity', 0.7);
      setYear(Y1, true);
      baseSymbols.forEach(id => map.setLayoutProperty(id, 'visibility', 'visible'));
      labelsOn = true;
    }

    /* interactions */
    map.on('mousemove', 'chor', e => {
      map.getCanvas().style.cursor = 'pointer';
      const f = e.features[0];
      const v = depAt(f.properties.cd, curYear);
      tip.style('opacity', 1)
        .style('left', (e.originalEvent.clientX + 16) + 'px')
        .style('top', (e.originalEvent.clientY - 10) + 'px')
        .html(`<b>${f.properties.nm}</b> · ${Math.round(curYear)}<br>우울감경험률 ${v == null ? '-' : v.toFixed(1)}%`);
    });
    map.on('mouseleave', 'chor', () => { map.getCanvas().style.cursor = ''; tip.style('opacity', 0); });
    map.on('click', 'chor', e => select(e.features[0].properties.cd, curP > 0.46));

    /* hotspot markers — 기울인 지도에 밀착(pitchAlignment)시키고,
       스크롤에 따라 군집 중심(진앙) 한 점에서 각 지역으로 퍼져 나감 */
    hotList.forEach(h => {
      const f = D.geo.features.find(x => x.properties.cd === h.cd);
      h.pos = d3.geoCentroid(f);
      const el = document.createElement('div');
      el.className = 'hs';
      el.title = D.names[h.cd];
      el.innerHTML = '<span class="ring"></span><span class="ring r2"></span><span class="dot"></span>';
      el.addEventListener('click', ev => { ev.stopPropagation(); select(h.cd, curP > 0.46); });
      h.marker = new maplibregl.Marker({ element: el, pitchAlignment: 'map', rotationAlignment: 'map' })
        .setLngLat(h.pos).addTo(map);
    });
    hotCenter = [
      d3.mean(hotList, h => h.pos[0]),
      d3.mean(hotList, h => h.pos[1])
    ];
    /* 로드 직후 현재 스크롤 위치 기준으로 마커·레이어 상태 동기화
       (첫 화면에서 진앙이 한 점으로 보이게) */
    if (!REDUCED) drive(curP);
  });

  function setYear(yf, force) {
    curYear = yf;
    if (!force && lastPaintedYear != null && Math.abs(yf - lastPaintedYear) < 0.03) return;
    lastPaintedYear = yf;
    Object.keys(D.dep).forEach(cd =>
      map.setFeatureState({ source: 'sma', id: cd }, { dep: depAt(cd, yf) }));
    document.querySelector('.year-hud .y').textContent = Math.round(yf);
  }

  const tip = d3.select('body').append('div').attr('class', 'tip')
    .style('background', tv('--panel-bg')).style('border-color', tv('--panel-line'))
    .style('color', tv('--panel-ink'));
  const st0 = document.createElement('style');
  st0.textContent = `.tip b{color:${tv('--accent-strong')}}`;
  document.head.appendChild(st0);

  /* ---------- legend ---------- */
  document.querySelector('.legend .bar').style.background =
    `linear-gradient(90deg, ${RAMP[0]}, ${RAMP[1]}, ${RAMP[2]})`;
  document.querySelector('.legend .lab').innerHTML =
    `<span>${DMIN.toFixed(0)}%</span><span>우울감경험률</span><span>${DMAX.toFixed(0)}%+</span>`;

  /* ---------- hotspots / panel / importance (v1 재사용) ---------- */
  /* 핫스팟 = 팬데믹기(P2) 또는 그 이후(P3) LISA High-High 군집만 */
  const hotList = Object.entries(D.hotspots)
    .filter(([cd, h]) => h.P2.lisa === 'HH' || h.P3.lisa === 'HH')
    .map(([cd, h]) => ({ cd, dep: Math.max(h.P2.dep, h.P3.dep) }))
    .sort((a, b) => b.dep - a.dep);

  function select(cd, show) {
    selected = cd;
    if (mapReady) {
      map.setFilter('sel-line', ['==', ['get', 'cd'], cd]);
      map.setPaintProperty('sel-line', 'line-opacity', 1);
    }
    const nm = D.names[cd], s = D.dep[cd], hot = D.hotspots[cd];
    const isHot = hot && (hot.P2.lisa === 'HH' || hot.P3.lisa === 'HH');
    document.querySelector('.panel h3').textContent = nm;
    const last = s[Y1], first = s[Y0];
    const delta = (last != null && first != null) ? (last - first) : null;
    document.querySelector('.panel .p-sub').innerHTML =
      `${Y1}년 우울감경험률 <b style="color:${POS}">${last?.toFixed(1)}%</b>` +
      (delta == null ? '' : ` · ${Y0}년 대비 ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%p`) +
      (isHot ? `<br><b style="color:${POS}">팬데믹기(2020-22) 핫스팟</b> · 평균 ${hot.P2.dep.toFixed(1)}%로 주변 지역과 함께 높았던 군집 (LISA High-High)` : '');

    /* 헤드라인 — 가장 크게 끌어올린 요인 */
    const rows0 = D.shapLocal[cd] || [];
    const topPos = rows0.filter(r => r[0] !== 'GEO' && r[1] > 0).sort((a, b) => b[1] - a[1])[0];
    document.querySelector('.panel .p-head').innerHTML = topPos
      ? `이 지역 우울감을 가장 끌어올린 요인은 <b>${D.labels[topPos[0]].ko}</b> (+${topPos[1].toFixed(2)}%p)`
      : `이 지역은 주요 요인들이 우울감을 <b>낮추는 방향</b>으로 작용했습니다`;
    if (show) gsap.set('.panel', { autoAlpha: 1 });

    const sw = 320, sh = 66, pad = 8;
    const xs = d3.scaleLinear().domain([Y0, Y1]).range([pad, sw - pad - 34]);
    const vals = YEARS.map(y => [y, s[y]]).filter(d => d[1] != null);
    const ys = d3.scaleLinear().domain(d3.extent(vals, d => d[1])).range([sh - pad - 10, pad]);
    const sp = d3.select('.panel .spark').html('').append('svg').attr('width', sw).attr('height', sh);
    sp.append('path').datum(vals)
      .attr('d', d3.line().x(d => xs(d[0])).y(d => ys(d[1])).curve(d3.curveMonotoneX))
      .attr('fill', 'none').attr('stroke', POS).attr('stroke-width', 2);
    const lastPt = vals[vals.length - 1];
    sp.append('circle').attr('cx', xs(lastPt[0])).attr('cy', ys(lastPt[1])).attr('r', 3.5).attr('fill', POS);
    sp.append('text').attr('x', xs(lastPt[0]) + 8).attr('y', ys(lastPt[1]) + 4)
      .attr('fill', tv('--panel-ink')).attr('font-size', 11).attr('opacity', .85)
      .text(lastPt[1].toFixed(1) + '%');
    [Y0, Y1].forEach(y => sp.append('text').attr('x', xs(y)).attr('y', sh - 2)
      .attr('fill', tv('--panel-ink')).attr('font-size', 9.5).attr('opacity', .45)
      .attr('text-anchor', y === Y0 ? 'start' : 'middle').text(y));

    const rows = D.shapLocal[cd] || [];
    const maxAbs = d3.max(rows, r => Math.abs(r[1])) || 1;
    const box = document.querySelector('.panel .shap-rows');
    box.innerHTML = '';
    rows.forEach(([f, v]) => {
      const lab = D.labels[f] ? D.labels[f].ko : f;
      const w = Math.abs(v) / maxAbs * 50;
      const row = document.createElement('div');
      row.className = 'shap-row';
      row.innerHTML = `<div class="n">${lab}</div>
        <div class="shap-track"><div class="zero"></div>
          <div class="bar" style="background:${v >= 0 ? POS : NEG};${v >= 0 ? 'left:50%' : 'right:50%'};width:${w}%"></div></div>
        <div class="v">${v >= 0 ? '+' : ''}${v.toFixed(2)}</div>`;
      box.appendChild(row);
    });
  }
  select(hotList[0].cd);

  const impBox = document.querySelector('.imp-wrap .imp-rows');
  const TOP = D.importance.slice(0, 10);
  const maxPhi = TOP[0].phi;
  TOP.forEach(r => {
    const lab = D.labels[r.f] ? D.labels[r.f].ko : r.f;
    const row = document.createElement('div');
    row.className = 'imp-row' + (r.f === 'GEO' ? ' geo' : '');
    row.innerHTML = `<div class="n">${lab}</div>
      <div class="imp-track"><div class="bar" data-w="${(r.phi / maxPhi * 100).toFixed(1)}"></div></div>
      <div class="v">${r.phi.toFixed(2)}</div>`;
    impBox.appendChild(row);
  });

  /* ---------- camera keyframes ---------- */
  const K = [
    { t: 0.00, c: [127.9, 36.1], z: 5.3, pi: 0, b: 0 },
    { t: 0.10, c: [127.9, 36.1], z: 5.3, pi: 0, b: 0 },
    { t: 0.34, c: [126.95, 37.45], z: 8.2, pi: 38, b: -10 },
    { t: 0.56, c: [127.10, 37.44], z: 8.9, pi: 48, b: -18 },
    { t: 0.78, c: [127.14, 37.40], z: 9.0, pi: 50, b: -22 },
    { t: 0.90, c: [126.95, 37.42], z: 8.3, pi: 26, b: -6 },
    { t: 1.00, c: [126.95, 37.42], z: 8.3, pi: 26, b: -6 },
  ];
  const smooth = x => x * x * (3 - 2 * x);
  const lerp = (a, b, x) => a + (b - a) * x;
  function camAt(p) {
    let i = 0;
    while (i < K.length - 2 && p > K[i + 1].t) i++;
    const a = K[i], b = K[i + 1];
    const x = smooth(Math.max(0, Math.min(1, (p - a.t) / (b.t - a.t || 1))));
    return {
      center: [lerp(a.c[0], b.c[0], x), lerp(a.c[1], b.c[1], x)],
      zoom: lerp(a.z, b.z, x), pitch: lerp(a.pi, b.pi, x), bearing: lerp(a.b, b.b, x)
    };
  }
  const range = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));

  /* ---------- scroll drive ---------- */
  gsap.registerPlugin(ScrollTrigger);
  const PIN = 3400;
  /* 씬 앵커 (progress 기준) — 스냅과 도트 내비 공용 */
  const SCENES = [
    { p: 0.00, label: 'Intro' },
    { p: 0.15, label: '위성' },
    { p: 0.40, label: '지도' },
    { p: 0.55, label: '변화' },
    { p: 0.70, label: '핫스팟' },
    { p: 0.80, label: '지역 분석' },
    { p: 0.95, label: '결론' },
  ];

  let curP = 0, seenMarked = false;
  function drive(p) {
    curP = p;
    if (p > 0.9 && !seenMarked) {
      seenMarked = true;
      try { localStorage.setItem('knuIntroSeen', '1'); } catch (e) {}
    }
    if (!mapReady) return;
    map.jumpTo(camAt(p));
    map.setPaintProperty('bm', 'raster-opacity', 1 - 0.78 * range(p, 0.30, 0.44));
    const cop = 0.92 * range(p, 0.34, 0.46);
    map.setPaintProperty('chor', 'fill-opacity', cop * (1 - 0.75 * range(p, 0.84, 0.92)));
    map.setPaintProperty('chor-line', 'line-opacity', 0.5 * range(p, 0.36, 0.48));
    map.setPaintProperty('out-line', 'line-opacity', 0.8 * range(p, 0.34, 0.44));
    /* 핫스팟 경계선은 마커 분할이 끝난 뒤에 켜짐 */
    map.setPaintProperty('hot-line', 'line-opacity', 0.95 * range(p, 0.685, 0.72) * (1 - range(p, 0.84, 0.90)));
    /* 진앙 마커: 첫 화면부터 수도권(군집 중심) 한 점에서 맥동,
       핫스팟 씬으로 확대해 들어가는 0.60-0.685 구간에서 6개 시군구로 분할 */
    if (hotCenter) hotList.forEach((h, i) => {
      const t = smooth(range(p, 0.60 + i * 0.005, 0.66 + i * 0.005));
      h.marker.setLngLat([lerp(hotCenter[0], h.pos[0], t), lerp(hotCenter[1], h.pos[1], t)]);
    });
    if (p >= 0.46 && p <= 0.66) setYear(Y0 + (Y1 - Y0) * range(p, 0.46, 0.64));
    else if (p > 0.66) setYear(Y1);
    heroEl.classList.toggle('pulses-on', p < 0.86);
    heroEl.classList.toggle('sea-on', p > 0.02 && p < 0.40);
    if (typeof updateDots === 'function') updateDots(p);
    const wantLabels = p > 0.42;
    if (wantLabels !== labelsOn) {
      labelsOn = wantLabels;
      baseSymbols.forEach(id =>
        map.setLayoutProperty(id, 'visibility', wantLabels ? 'visible' : 'none'));
    }
    document.querySelector('.map-dim').style.opacity = 0.55 * range(p, 0.86, 0.94);
  }

  /* DOM timeline (0-100 == progress 0-1) */
  const fade = (tl, sel, at, dur, show) =>
    tl.to(sel, { autoAlpha: show ? 1 : 0, duration: dur, ease: 'none' }, at);
  let tl = null;
  if (REDUCED) {
    /* 모션 최소화: 인트로 없이 정적 히어로 */
    document.querySelector('.scroll-cue').style.display = 'none';
    document.querySelector('.skip').style.display = 'none';
  } else {
  tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero', start: 'top top', end: '+=' + PIN, scrub: 0.4, pin: true,
      snap: { snapTo: SCENES.map(s => s.p), duration: { min: 0.2, max: 0.7 }, delay: 0.08, ease: 'power1.inOut' },
      onUpdate: self => drive(self.progress)
    }
  });
  tl.to({}, { duration: 100 }, 0); /* 타임라인 길이 고정 */
  fade(tl, '.hero-title', 9, 3, false);
  fade(tl, '.scroll-cue', 9, 2, false);
  fade(tl, '.cap-1', 13, 3, true);  fade(tl, '.cap-1', 28, 3, false);
  fade(tl, '.cap-2', 37, 3, true);  fade(tl, '.cap-2', 45, 3, false);
  fade(tl, '.year-hud', 44, 3, true);
  fade(tl, '.cap-3', 64, 3, true);  fade(tl, '.cap-3', 76, 3, false);
  fade(tl, '.panel', 68, 3, true);  fade(tl, '.panel', 85, 3, false);
  fade(tl, '.year-hud', 86, 3, false);
  fade(tl, '.imp-wrap', 88, 4, true);
  tl.to('.imp-wrap .bar', {
    width: (i, el) => el.dataset.w + '%', duration: 8, ease: 'power1.out', stagger: 0.5
  }, 90);
  fade(tl, '.cap-4', 96, 3, true);
  }

  /* ---------- intro-gate mode (data-mode="gate") ---------- */
  const GATE = document.body.dataset.mode === 'gate';
  if (GATE && tl) fade(tl, '.enter-btn', 97, 3, true);

  function enterSite() {
    if (!document.body.classList.contains('entered')) {
      document.body.classList.add('entered');
      tl.scrollTrigger.kill(true);
      tl.kill();
      gsap.set(['.caption', '.panel', '.imp-wrap', '.year-hud', '.enter-btn', '.map-dim', '.scroll-cue', '.skip'],
        { autoAlpha: 0 });
      gsap.set('.hero-title', { autoAlpha: 1 });
      document.querySelector('.map-dim').style.opacity = 0;
      heroEl.classList.remove('pulses-on');
      if (mapReady) {
        map.jumpTo({ center: [126.95, 37.42], zoom: 8.0, pitch: 30, bearing: -8 });
        map.setPaintProperty('bm', 'raster-opacity', 0.35);
        map.setPaintProperty('chor', 'fill-opacity', 0.85);
        map.setPaintProperty('chor-line', 'line-opacity', 0.4);
        map.setPaintProperty('out-line', 'line-opacity', 0.7);
        setYear(Y1, true);
      }
      window.scrollTo({ top: 0 });
      setTimeout(() => map.resize(), 60);
      ScrollTrigger.refresh();
    }
  }
  if (GATE) document.querySelector('.enter-btn').addEventListener('click', enterSite);

  /* ---------- 씬 도트 내비게이션 ---------- */
  if (!REDUCED) {
  const dotsNav = document.createElement('nav');
  dotsNav.className = 'dots';
  SCENES.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'dot';
    b.innerHTML = `<span>${s.label}</span><i></i>`;
    b.addEventListener('click', () => {
      const st = tl.scrollTrigger;
      window.scrollTo({ top: st.start + s.p * (st.end - st.start), behavior: 'smooth' });
    });
    dotsNav.appendChild(b);
  });
  heroEl.appendChild(dotsNav);
  }
  function updateDots(p) {
    const nav = document.querySelector('.hero .dots');
    if (!nav) return;
    let act = 0;
    SCENES.forEach((s, i) => { if (p >= s.p - 0.04) act = i; });
    nav.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('on', i === act));
  }

  /* skip intro */
  document.querySelector('.skip').addEventListener('click', () => {
    if (GATE) { enterSite(); return; }
    if (!tl) return;
    try { localStorage.setItem('knuIntroSeen', '1'); } catch (e) {}
    window.scrollTo({ top: contentStart(), behavior: 'smooth' });
  });

  /* nav chrome switch (variant B: light-chrome body class) */
  const nav = document.querySelector('header.nav');
  ScrollTrigger.create({
    trigger: '.site', start: 'top 100',
    onEnter: () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled')
  });

  /* ---------- news carousel ---------- */
  const track = document.querySelector('.car-track');
  if (track) {
    const step = () => Math.min(track.clientWidth * 0.9, 520);
    const prevB = document.querySelector('.car-btn.prev');
    const nextB = document.querySelector('.car-btn.next');
    const sync = () => {
      prevB.disabled = track.scrollLeft <= 4;
      nextB.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    };
    prevB.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    nextB.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);
    sync();
    /* 카드 클릭: 사진 여러 장이면 다음 사진으로 전환, 아니면 진동 */
    track.querySelectorAll('.news-card').forEach(c => {
      const sw = c.querySelector('.imgswap');
      c.addEventListener('click', () => {
        if (sw) {
          const imgs = Array.from(sw.querySelectorAll('img'));
          const dots = Array.from(sw.querySelectorAll('.idots i'));
          const i = imgs.findIndex(im => im.classList.contains('on'));
          const n = (i + 1) % imgs.length;
          imgs[i].classList.remove('on');
          imgs[n].classList.add('on');
          dots.forEach((d, k) => d.classList.toggle('on', k === n));
        } else if (!REDUCED) {
          c.classList.remove('shake');
          void c.offsetWidth; /* 애니메이션 재시작 트리거 */
          c.classList.add('shake');
        }
      });
    });
    if (!REDUCED) gsap.from('.news-card', {
      y: 26, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: '.carousel', start: 'top 82%', once: true }
    });
  }

  /* ---------- 재방문 시 인트로 자동 스킵 (소식 섹션에서 시작) ---------- */
  function contentStart() {
    const news = document.querySelector('#news');
    if (!news) return tl ? tl.scrollTrigger.end + 10 : 0;
    return news.getBoundingClientRect().top + window.scrollY - 70;
  }
  try {
    if (tl && !location.hash && localStorage.getItem('knuIntroSeen') === '1') {
      window.addEventListener('load', () => {
        requestAnimationFrame(() => window.scrollTo(0, contentStart()));
      });
    }
  } catch (e) { /* localStorage 차단 환경 무시 */ }
})();
