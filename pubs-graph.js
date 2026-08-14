/* 논문 × 주제 × 방법론 네트워크 (Publications 섹션 상단)
   - 왼쪽: 주제 허브(네이비). 클릭하면 세부 주제 소노드로 펼쳐짐/접힘
   - 오른쪽: 방법론. 상위 허브 '공간통계' 아래에 공간필터링·다수준모형·패턴·군집이 이어짐
   - 세부 주제·방법론 노드를 클릭하면 해당 논문 목록 팝업, 논문 점 클릭 시 원문 이동
   새 논문 추가 시 TAGS에 {k: doi 또는 제목 일부, s:[세부주제], m:[방법]} 한 줄만 추가 */
(function () {
  const el = document.getElementById('pub-graph');
  if (!el || !window.LAB_PUBS || !window.d3) return;

  const TOPICS = {
    inf: '감염병', mh: '정신건강', env: '환경보건', eco: '생태·공원', child: '아동건강'
  };
  const SUBS = {
    covid: { label: '코로나19', parent: 'inf' },
    tb: { label: '결핵', parent: 'inf' },
    asf: { label: '동물감염병', parent: 'inf' },
    dep: { label: '우울', parent: 'mh' },
    drug: { label: '중독·마약', parent: 'mh' },
    air: { label: '대기오염', parent: 'env' },
    land: { label: '토지이용', parent: 'env' },
    noise: { label: '소음', parent: 'env' },
    forest: { label: '산림생태', parent: 'eco' },
    park: { label: '국립공원', parent: 'eco' },
    dental: { label: '구강건강', parent: 'child' },
  };
  /* 방법론: stat(공간통계)이 상위 허브, esf/ml/pat이 하위 */
  const METHODS = {
    stat: { label: '공간통계', parent: null },
    esf: { label: '공간필터링', parent: 'stat' },
    ml: { label: '다수준모형', parent: 'stat' },
    pat: { label: '패턴·군집', parent: 'stat' },
    ai: { label: 'ML·XAI', parent: null },
    coh: { label: '코호트·통계', parent: null },
  };
  const TAGS = [
    { k: 'GeoAI-driven', s: ['dep'], m: ['ai'] },
    { k: 'commuting', s: ['covid'], m: ['pat'] },
    { k: '10.1016/j.apgeog.2024.103470', s: ['drug'], m: ['ai'] },
    { k: '10.1155/2024/8824971', s: ['asf'], m: ['pat'] },
    { k: '10.5933/JKAPD.2024.51.1.40', s: ['dental'], m: ['ml'] },
    { k: '10.1016/j.foreco.2022.120763', s: ['forest'], m: ['esf'] },
    { k: 'special-purpose district', s: ['park'], m: ['pat'] },
    { k: '10.3390/ijerph182312595', s: ['covid'], m: ['pat'] },
    { k: '10.1186/s12199-021-00942-4', s: ['air'], m: ['coh'] },
    { k: '10.1371/journal.pone.0255985', s: ['land'], m: ['coh'] },
    { k: '10.14249/EIA.2021.30.2.89', s: ['park'], m: ['coh'] },
    { k: '10.21032/jhis.2021.46.1.88', s: ['tb'], m: ['esf', 'ml'] },
    { k: '10.1371/journal.pone.0255727', s: ['tb'], m: ['pat'] },
    { k: '10.1371/journal.pone.0240689', s: ['noise'], m: ['coh'] },
    { k: '10.16879/jkca.2016.16.3.089', s: ['tb'], m: ['esf'] },
  ];
  const tagOf = p => TAGS.find(g => (p.doi && p.doi === g.k) || p.t.includes(g.k));
  const topicOf = subKey => SUBS[subKey].parent;

  const NAVY = '#043786', GREEN = '#00833F', DOT = '#94A6C4';
  const tip = d3.select('body').append('div').attr('class', 'gtip');
  const expanded = new Set();   /* 펼쳐진 주제 키 */
  const posCache = {};          /* 재구성 시 위치 유지 */
  let sim = null;

  /* 노드별 논문 목록 */
  function papersFor(d) {
    return window.LAB_PUBS.map(p => ({ p, g: tagOf(p) })).filter(x => {
      if (!x.g) return false;
      if (d.kind === 'topic') return x.g.s.some(sk => topicOf(sk) === d.key);
      if (d.kind === 'sub') return x.g.s.includes(d.key);
      if (d.kind === 'method') {
        if (METHODS[d.key].parent === null && d.key === 'stat')
          return x.g.m.some(mk => METHODS[mk].parent === 'stat');
        return x.g.m.includes(d.key);
      }
      return false;
    });
  }

  function render() {
    const W = el.clientWidth || 900;
    const mobile = W < 640;
    const H = mobile ? 470 : 560;
    if (sim) sim.stop();
    if (el._kick) clearInterval(el._kick);
    el.innerHTML = '';

    /* ----- 그래프 구성 (expanded 상태 반영) ----- */
    const nodes = [], links = [], deg = {};
    const add = n => { const c = posCache[n.id]; if (c) { n.x = c.x; n.y = c.y; } nodes.push(n); return n; };
    const bump = id => { deg[id] = (deg[id] || 0) + 1; };

    Object.entries(TOPICS).forEach(([k, label]) =>
      add({ id: 't:' + k, key: k, label, kind: 'topic' }));
    Object.entries(METHODS).forEach(([k, v]) => {
      add({ id: 'm:' + k, key: k, label: v.label, kind: 'method', parent: v.parent });
      if (v.parent) links.push({ source: 'm:' + k, target: 'm:' + v.parent });
    });
    Object.entries(SUBS).forEach(([k, v]) => {
      if (!expanded.has(v.parent)) return;
      const n = add({ id: 's:' + k, key: k, label: v.label, kind: 'sub', parent: v.parent });
      if (n.x == null && posCache['t:' + v.parent]) {   /* 부모 위치에서 태어나 퍼져 나감 */
        n.x = posCache['t:' + v.parent].x + (Math.random() - .5) * 30;
        n.y = posCache['t:' + v.parent].y + (Math.random() - .5) * 30;
      }
      links.push({ source: 's:' + k, target: 't:' + v.parent });
    });
    window.LAB_PUBS.forEach((p, i) => {
      const g = tagOf(p);
      if (!g) return;
      const id = 'p:' + i;
      add({ id, kind: 'paper', p });
      g.s.forEach(sk => {
        const t = topicOf(sk);
        if (expanded.has(t)) { links.push({ source: id, target: 's:' + sk }); bump('s:' + sk); }
        else links.push({ source: id, target: 't:' + t });
        bump('t:' + t);
      });
      g.m.forEach(mk => {
        links.push({ source: id, target: 'm:' + mk });
        bump('m:' + mk);
        if (METHODS[mk].parent) bump('m:' + METHODS[mk].parent);
      });
    });

    const r = d => {
      if (d.kind === 'paper') return mobile ? 5.5 : 7;
      if (d.kind === 'sub') return (mobile ? 15 : 19) + (deg[d.id] || 0) * 1.5;
      if (d.kind === 'method' && d.parent === null && d.key === 'stat')
        return (mobile ? 27 : 34) + (deg[d.id] || 0) * (mobile ? .8 : 1.1);
      return (mobile ? 22 : 27) + (deg[d.id] || 0) * (mobile ? 1.4 : 2);
    };

    const svg = d3.select(el).append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);

    const link = svg.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', '#C9D4E6').attr('stroke-width', 1.1).attr('stroke-opacity', .8);

    const node = svg.append('g').selectAll('g').data(nodes, d => d.id).join('g')
      .attr('cursor', d => d.kind === 'paper' && !d.p.doi ? 'grab' : 'pointer');

    node.filter(d => d.kind === 'topic').append('circle')
      .attr('r', r).attr('fill', NAVY).attr('fill-opacity', .92);
    node.filter(d => d.kind === 'method').append('circle')
      .attr('r', r).attr('fill', GREEN)
      .attr('fill-opacity', d => d.key === 'stat' ? 1 : .88);
    node.filter(d => d.kind === 'sub').append('circle')
      .attr('r', r).attr('fill', '#E8EEF9').attr('stroke', NAVY).attr('stroke-width', 1.4);
    node.filter(d => d.kind === 'paper').append('circle')
      .attr('r', r).attr('fill', DOT).attr('stroke', '#fff').attr('stroke-width', 1.5);

    node.filter(d => d.kind !== 'paper').append('text')
      .text(d => d.label).attr('text-anchor', 'middle').attr('dy', '0.34em')
      .attr('fill', d => d.kind === 'sub' ? NAVY : '#fff')
      .attr('font-size', d => d.kind === 'sub' ? (mobile ? 8.5 : 9.5) : (mobile ? 10 : 11.5))
      .attr('font-weight', 700).attr('pointer-events', 'none');
    /* 펼쳐진 주제 표시 */
    node.filter(d => d.kind === 'topic').append('text')
      .text(d => expanded.has(d.key) ? '−' : '+')
      .attr('text-anchor', 'middle').attr('dy', d => r(d) - 6).attr('dx', 0)
      .attr('fill', '#fff').attr('font-size', 11).attr('opacity', .8)
      .attr('pointer-events', 'none');

    /* ----- 팝업 패널 ----- */
    const panel = d3.select(el).append('div').attr('class', 'gpanel').style('display', 'none');
    function showPanel(d) {
      const items = papersFor(d);
      const color = d.kind === 'method' ? GREEN : NAVY;
      const rows = items.map(x => {
        const inner = `<b>${x.p.y}</b> · ${x.p.t.replace(/</g, '&lt;')}`;
        return x.p.doi
          ? `<a href="https://doi.org/${x.p.doi}" target="_blank" rel="noopener">${inner}</a>`
          : `<span>${inner}</span>`;
      }).join('');
      panel.html(`<div class="gp-head"><span style="background:${color}"></span>` +
        `${d.label} · ${items.length}편<button type="button" aria-label="닫기">×</button></div>` + rows)
        .style('display', 'block');
      panel.select('button').on('click', () => panel.style('display', 'none'));
    }

    /* ----- 클릭 동작 ----- */
    node.filter(d => d.kind === 'topic').on('click', (e, d) => {
      e.stopPropagation();
      nodes.forEach(n => { posCache[n.id] = { x: n.x, y: n.y }; });
      if (expanded.has(d.key)) expanded.delete(d.key); else expanded.add(d.key);
      render();
    });
    node.filter(d => d.kind === 'sub' || d.kind === 'method')
      .on('click', (e, d) => { e.stopPropagation(); showPanel(d); });
    node.filter(d => d.kind === 'paper')
      .on('mouseenter', (e, d) => tip.style('opacity', 1)
        .html(`<b>${d.p.y}</b> · ${d.p.t.replace(/</g, '&lt;')}`))
      .on('mousemove', e => tip.style('left', (e.clientX + 14) + 'px').style('top', (e.clientY - 10) + 'px'))
      .on('mouseleave', () => tip.style('opacity', 0))
      .on('click', (e, d) => { if (d.p.doi) window.open('https://doi.org/' + d.p.doi, '_blank', 'noopener'); });

    /* ----- 시뮬레이션 ----- */
    const bandX = d =>
      d.kind === 'topic' ? W * 0.12 :
      d.kind === 'sub' ? W * 0.30 :
      d.kind === 'paper' ? W * 0.52 :
      d.parent ? W * 0.74 : (d.key === 'stat' ? W * 0.90 : W * 0.80);
    sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(mobile ? 46 : 64).strength(.5))
      .force('charge', d3.forceManyBody().strength(d =>
        d.kind === 'paper' ? -40 : d.kind === 'sub' ? -90 : -220))
      .force('x', d3.forceX(bandX).strength(.16))
      .force('y', d3.forceY(H / 2).strength(.07))
      .force('collide', d3.forceCollide(d => r(d) + (mobile ? 4 : 7)))
      .on('tick', () => {
        nodes.forEach(d => {
          /* 평형에 도달해도 멈춰 보이지 않게: 논문 점은 매 틱 미세한 브라운 운동 */
          if (d.fx == null) {
            const w = d.kind === 'paper' ? .55 : .12;
            d.vx += (Math.random() - .5) * w;
            d.vy += (Math.random() - .5) * w;
          }
          d.x = Math.max(r(d) + 4, Math.min(W - r(d) - 4, d.x));
          d.y = Math.max(r(d) + 4, Math.min(H - r(d) - 4, d.y));
        });
        link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        node.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    /* 계속 살아있는 움직임: 시뮬레이션이 멈추지 않게 + 주기적 강한 출렁임 */
    sim.velocityDecay(.35).alphaDecay(.012).alphaTarget(.05).restart();
    el._kick = setInterval(() => {
      const papers = nodes.filter(n => n.kind === 'paper' && n.fx == null);
      d3.shuffle(papers).slice(0, 4).forEach(n => {
        n.vx += (Math.random() - .5) * 9;
        n.vy += (Math.random() - .5) * 9;
      });
      if (sim.alpha() < .15) sim.alpha(.15);
    }, 1100);

    node.call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) sim.alphaTarget(.03); d.fx = null; d.fy = null; }));
  }

  render();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(render, 200); });
})();
