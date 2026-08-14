/* 논문 × 주제 × 방법론 네트워크 (Publications 섹션 상단)
   스타일: 직선 가는 링크 + 허브 글로우 + 맥박 링 + 사인파 유영 + 호버 포커스
   - 왼쪽: 주제 허브(네이비). 클릭하면 세부 주제 소노드로 펼쳐짐/접힘
   - 오른쪽: 방법론 계층 — 공간통계 → (공간필터링 → 다수준모형) · 패턴·군집 · GW모형,
     GeoAI는 독립 허브지만 공간통계와 연결, 코호트·통계는 독립
   - 세부 주제·방법론 클릭 = 논문 목록 팝업(하위 방법 논문 포함), 논문 점 클릭 = 원문 이동
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
  /* 방법론 계층: 다수준모형은 공간필터링의 하위 */
  const METHODS = {
    stat: { label: '공간통계', parent: null },
    esf: { label: '공간필터링', parent: 'stat' },
    ml: { label: '다수준모형', parent: 'esf' },
    pat: { label: '패턴·군집', parent: 'stat' },
    gwr: { label: 'GW모형', parent: 'stat' },
    ai: { label: 'GeoAI', parent: null },
    coh: { label: '코호트·통계', parent: null },
  };
  const M_ANC = mk => { const out = []; let p = METHODS[mk].parent; while (p) { out.push(p); p = METHODS[p].parent; } return out; };
  const TAGS = [
    { k: 'GeoAI-driven', s: ['dep'], m: ['ai'] },
    { k: 'commuting', s: ['covid'], m: ['pat'] },
    { k: '10.1016/j.apgeog.2024.103470', s: ['drug'], m: ['ai'] },
    { k: '10.1155/2024/8824971', s: ['asf'], m: ['pat'] },
    { k: '10.5933/JKAPD.2024.51.1.40', s: ['dental'], m: ['ml'] },
    { k: '10.1016/j.foreco.2022.120763', s: ['forest'], m: ['esf'] },
    { k: 'special-purpose district', s: ['park'], m: ['pat'] },
    { k: '10.3390/ijerph182312595', s: ['covid'], m: ['gwr'] },
    { k: '10.1186/s12199-021-00942-4', s: ['air'], m: ['coh'] },
    { k: '10.1371/journal.pone.0255985', s: ['land'], m: ['coh'] },
    { k: '10.14249/EIA.2021.30.2.89', s: ['park'], m: ['coh'] },
    { k: '10.21032/jhis.2021.46.1.88', s: ['tb'], m: ['ml'] },
    { k: '10.1371/journal.pone.0255727', s: ['tb'], m: ['pat'] },
    { k: '10.1371/journal.pone.0240689', s: ['noise'], m: ['coh'] },
    { k: '10.16879/jkca.2016.16.3.089', s: ['tb'], m: ['esf'] },
  ];
  const tagOf = p => TAGS.find(g => (p.doi && p.doi === g.k) || p.t.includes(g.k));
  const topicOf = subKey => SUBS[subKey].parent;

  const NAVY = '#043786', GREEN = '#00833F', DOT = '#7E96C8';
  const tip = d3.select('body').append('div').attr('class', 'gtip');
  const expanded = new Set();
  const posCache = {};
  let sim = null;

  function papersFor(d) {
    return window.LAB_PUBS.map(p => ({ p, g: tagOf(p) })).filter(x => {
      if (!x.g) return false;
      if (d.kind === 'topic') return x.g.s.some(sk => topicOf(sk) === d.key);
      if (d.kind === 'sub') return x.g.s.includes(d.key);
      if (d.kind === 'method')
        return x.g.m.some(mk => mk === d.key || M_ANC(mk).includes(d.key));
      return false;
    });
  }

  function render() {
    const W = el.clientWidth || 900;
    const mobile = W < 640;
    const H = mobile ? 470 : 560;
    if (sim) sim.stop();
    el.innerHTML = '';

    /* ----- 그래프 구성 (expanded 상태 반영) ----- */
    const nodes = [], links = [], deg = {};
    const add = n => {
      const c = posCache[n.id];
      if (c) { n.x = c.x; n.y = c.y; }
      n.ph = Math.random() * Math.PI * 2;   /* 유영 위상 */
      nodes.push(n); return n;
    };
    const bump = id => { deg[id] = (deg[id] || 0) + 1; };

    Object.entries(TOPICS).forEach(([k, label]) =>
      add({ id: 't:' + k, key: k, label, kind: 'topic' }));
    Object.entries(METHODS).forEach(([k, v]) => {
      add({ id: 'm:' + k, key: k, label: v.label, kind: 'method', parent: v.parent });
      if (v.parent) links.push({ source: 'm:' + k, target: 'm:' + v.parent });
    });
    /* GeoAI(공간 머신러닝)는 공간통계와도 이어짐 */
    links.push({ source: 'm:ai', target: 'm:stat' });
    Object.entries(SUBS).forEach(([k, v]) => {
      if (!expanded.has(v.parent)) return;
      const n = add({ id: 's:' + k, key: k, label: v.label, kind: 'sub', parent: v.parent });
      if (n.x == null && posCache['t:' + v.parent]) {
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
        M_ANC(mk).forEach(a => bump('m:' + a));
      });
    });

    const r = d => {
      if (d.kind === 'paper') return mobile ? 5.5 : 7;
      if (d.kind === 'sub') return (mobile ? 15 : 19) + (deg[d.id] || 0) * 1.5;
      if (d.kind === 'method' && d.key === 'stat')
        return (mobile ? 27 : 34) + (deg[d.id] || 0) * (mobile ? .8 : 1.1);
      return (mobile ? 22 : 27) + (deg[d.id] || 0) * (mobile ? 1.4 : 2);
    };

    const svg = d3.select(el).append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);

    /* 허브 글로우 */
    const filt = svg.append('defs').append('filter').attr('id', 'pub-glow')
      .attr('x', '-60%').attr('y', '-60%').attr('width', '220%').attr('height', '220%');
    filt.append('feGaussianBlur').attr('stdDeviation', 5).attr('result', 'b');
    const mrg = filt.append('feMerge');
    mrg.append('feMergeNode').attr('in', 'b');
    mrg.append('feMergeNode').attr('in', 'SourceGraphic');

    const link = svg.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', '#C9D4E6').attr('stroke-width', .9).attr('stroke-opacity', .75);

    const node = svg.append('g').selectAll('g').data(nodes, d => d.id).join('g')
      .attr('cursor', d => d.kind === 'paper' && !d.p.doi ? 'grab' : 'pointer');

    /* 맥박 링 (주제 허브 + 공간통계) */
    node.filter(d => d.kind === 'topic' || (d.kind === 'method' && d.key === 'stat'))
      .append('circle')
      .attr('fill', 'none')
      .attr('stroke', d => d.kind === 'topic' ? NAVY : GREEN)
      .attr('stroke-width', 1.2)
      .style('animation', 'hubpulse 2.8s ease-out infinite')
      .style('animation-delay', () => (Math.random() * 2.4).toFixed(2) + 's');

    node.filter(d => d.kind === 'topic').append('circle')
      .attr('r', r).attr('fill', NAVY).attr('fill-opacity', .92)
      .attr('filter', 'url(#pub-glow)');
    node.filter(d => d.kind === 'method').append('circle')
      .attr('r', r).attr('fill', GREEN)
      .attr('fill-opacity', d => d.key === 'stat' ? 1 : .88)
      .attr('filter', 'url(#pub-glow)');
    node.filter(d => d.kind === 'sub').append('circle')
      .attr('r', r).attr('fill', '#E8EEF9').attr('stroke', NAVY).attr('stroke-width', 1.4);
    node.filter(d => d.kind === 'paper').append('circle')
      .attr('r', r).attr('fill', DOT).attr('stroke', '#fff').attr('stroke-width', 1.5);

    node.filter(d => d.kind !== 'paper').append('text')
      .text(d => d.label).attr('text-anchor', 'middle').attr('dy', '0.34em')
      .attr('fill', d => d.kind === 'sub' ? NAVY : '#fff')
      .attr('font-size', d => d.kind === 'sub' ? (mobile ? 8.5 : 9.5) : (mobile ? 10 : 11.5))
      .attr('font-weight', 700).attr('pointer-events', 'none');
    node.filter(d => d.kind === 'topic').append('text')
      .text(d => expanded.has(d.key) ? '−' : '+')
      .attr('text-anchor', 'middle').attr('dy', d => r(d) - 6)
      .attr('fill', '#fff').attr('font-size', 11).attr('opacity', .8)
      .attr('pointer-events', 'none');

    /* ----- 호버 포커스: 연결된 것만 남기기 ----- */
    const nbr = {};
    links.forEach(l => {
      const s = l.source.id || l.source, t = l.target.id || l.target;
      (nbr[s] = nbr[s] || new Set()).add(t);
      (nbr[t] = nbr[t] || new Set()).add(s);
    });
    node.on('mouseenter.focus', (e, d) => {
      node.attr('opacity', n => n.id === d.id || (nbr[d.id] && nbr[d.id].has(n.id)) ? 1 : .16);
      link.attr('stroke-opacity', l =>
        (l.source.id === d.id || l.target.id === d.id) ? 1 : .06);
    }).on('mouseleave.focus', () => {
      node.attr('opacity', 1);
      link.attr('stroke-opacity', .75);
    });

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
      .on('mouseenter.tip', (e, d) => tip.style('opacity', 1)
        .html(`<b>${d.p.y}</b> · ${d.p.t.replace(/</g, '&lt;')}`))
      .on('mousemove.tip', e => tip.style('left', (e.clientX + 14) + 'px').style('top', (e.clientY - 10) + 'px'))
      .on('mouseleave.tip', () => tip.style('opacity', 0))
      .on('click', (e, d) => { if (d.p.doi) window.open('https://doi.org/' + d.p.doi, '_blank', 'noopener'); });

    /* ----- 시뮬레이션 ----- */
    const bandX = d => {
      if (d.kind === 'topic') return W * 0.12;
      if (d.kind === 'sub') return W * 0.30;
      if (d.kind === 'paper') return W * 0.52;
      if (d.key === 'stat') return W * 0.90;
      if (d.parent === 'esf') return W * 0.66;    /* 다수준모형: 공간필터링보다 논문 쪽 */
      if (d.parent === 'stat') return W * 0.76;
      return W * 0.80;                            /* GeoAI · 코호트·통계 */
    };
    sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(mobile ? 46 : 64).strength(.5))
      .force('charge', d3.forceManyBody().strength(d =>
        d.kind === 'paper' ? -40 : d.kind === 'sub' ? -90 : -220))
      .force('x', d3.forceX(bandX).strength(.15))
      .force('y', d3.forceY(H / 2).strength(.07))
      .force('collide', d3.forceCollide(d => r(d) + (mobile ? 4 : 7)))
      .on('tick', () => {
        const tm = performance.now() * .001;
        nodes.forEach(d => {
          /* 사인파 유영: 논문은 크게, 허브는 미세하게 */
          if (d.fx == null) {
            const a = d.kind === 'paper' ? .17 : .035;
            d.vx += Math.sin(tm * 1.1 + d.ph) * a;
            d.vy += Math.cos(tm * .9 + d.ph * 1.7) * a;
          }
          d.x = Math.max(r(d) + 4, Math.min(W - r(d) - 4, d.x));
          d.y = Math.max(r(d) + 4, Math.min(H - r(d) - 4, d.y));
        });
        link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        node.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    /* 시뮬레이션이 잠들지 않게 유지 */
    sim.velocityDecay(.34).alphaDecay(.012).alphaTarget(.06).restart();
    if (el._kick) clearInterval(el._kick);
    el._kick = setInterval(() => { if (sim.alpha() < .15) sim.alpha(.15); }, 900);

    node.call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) sim.alphaTarget(.06); d.fx = null; d.fy = null; }));
  }

  render();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(render, 200); });
})();
