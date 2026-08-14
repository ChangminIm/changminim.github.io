/* 논문 × 주제 × 방법론 네트워크 (Publications 섹션 상단)
   주제 허브(네이비)는 왼쪽, 방법론 허브(그린)는 오른쪽, 논문(점)이 가운데서 연결.
   새 논문 추가 시 TAGS에 {k: doi 또는 제목 일부, t:[주제], m:[방법]} 한 줄만 추가 */
(function () {
  const el = document.getElementById('pub-graph');
  if (!el || !window.LAB_PUBS || !window.d3) return;

  const TOPICS = {
    inf: '감염병', mh: '정신건강', env: '환경보건', eco: '생태·공원', child: '아동건강'
  };
  const METHODS = {
    esf: '공간필터링', ml: '다수준모형', ai: 'ML·XAI', pat: '패턴·군집', coh: '코호트·통계'
  };
  const TAGS = [
    { k: 'GeoAI-driven', t: ['mh'], m: ['ai'] },
    { k: 'commuting', t: ['inf'], m: ['pat'] },
    { k: '10.1016/j.apgeog.2024.103470', t: ['mh'], m: ['ai'] },
    { k: '10.1155/2024/8824971', t: ['inf'], m: ['pat'] },
    { k: '10.5933/JKAPD.2024.51.1.40', t: ['child'], m: ['ml'] },
    { k: '10.1016/j.foreco.2022.120763', t: ['eco'], m: ['esf'] },
    { k: 'special-purpose district', t: ['eco'], m: ['pat'] },
    { k: '10.3390/ijerph182312595', t: ['inf'], m: ['pat'] },
    { k: '10.1186/s12199-021-00942-4', t: ['env'], m: ['coh'] },
    { k: '10.1371/journal.pone.0255985', t: ['env'], m: ['coh'] },
    { k: '10.14249/EIA.2021.30.2.89', t: ['eco'], m: ['coh'] },
    { k: '10.21032/jhis.2021.46.1.88', t: ['inf'], m: ['esf', 'ml'] },
    { k: '10.1371/journal.pone.0255727', t: ['inf'], m: ['pat'] },
    { k: '10.1371/journal.pone.0240689', t: ['env'], m: ['coh'] },
    { k: '10.16879/jkca.2016.16.3.089', t: ['inf'], m: ['esf'] },
  ];
  const tagOf = p => TAGS.find(g => (p.doi && p.doi === g.k) || p.t.includes(g.k));

  const NAVY = '#043786', GREEN = '#00833F', DOT = '#94A6C4';
  const tip = d3.select('body').append('div').attr('class', 'gtip');

  function render() {
    const W = el.clientWidth || 900;
    const mobile = W < 640;
    const H = mobile ? 440 : 520;
    el.innerHTML = '';

    const nodes = [], links = [];
    const deg = {};
    Object.entries(TOPICS).forEach(([k, label]) =>
      nodes.push({ id: 't:' + k, label, kind: 'topic' }));
    Object.entries(METHODS).forEach(([k, label]) =>
      nodes.push({ id: 'm:' + k, label, kind: 'method' }));
    window.LAB_PUBS.forEach((p, i) => {
      const g = tagOf(p);
      if (!g) return;
      const id = 'p:' + i;
      nodes.push({ id, kind: 'paper', p });
      g.t.forEach(t => { links.push({ source: id, target: 't:' + t }); deg['t:' + t] = (deg['t:' + t] || 0) + 1; });
      g.m.forEach(m => { links.push({ source: id, target: 'm:' + m }); deg['m:' + m] = (deg['m:' + m] || 0) + 1; });
    });
    const hubR = d => (mobile ? 24 : 30) + (deg[d.id] || 0) * (mobile ? 1.6 : 2.2);
    const r = d => d.kind === 'paper' ? (mobile ? 5.5 : 7) : hubR(d);

    const svg = d3.select(el).append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);

    const link = svg.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', '#C9D4E6').attr('stroke-width', 1.1).attr('stroke-opacity', .8);

    const node = svg.append('g').selectAll('g').data(nodes).join('g')
      .attr('cursor', d => d.kind === 'paper' && d.p.doi ? 'pointer' : 'grab');

    node.filter(d => d.kind !== 'paper').append('circle')
      .attr('r', r).attr('fill', d => d.kind === 'topic' ? NAVY : GREEN)
      .attr('fill-opacity', .92);
    node.filter(d => d.kind === 'paper').append('circle')
      .attr('r', r).attr('fill', DOT).attr('stroke', '#fff').attr('stroke-width', 1.5);

    node.filter(d => d.kind !== 'paper').append('text')
      .text(d => d.label).attr('text-anchor', 'middle').attr('dy', '0.34em')
      .attr('fill', '#fff').attr('font-size', mobile ? 10 : 11.5).attr('font-weight', 700)
      .attr('pointer-events', 'none');

    node.filter(d => d.kind === 'paper')
      .on('mouseenter', (e, d) => tip.style('opacity', 1)
        .html(`<b>${d.p.y}</b> · ${d.p.t.replace(/</g, '&lt;')}`))
      .on('mousemove', e => tip.style('left', (e.clientX + 14) + 'px').style('top', (e.clientY - 10) + 'px'))
      .on('mouseleave', () => tip.style('opacity', 0))
      .on('click', (e, d) => { if (d.p.doi) window.open('https://doi.org/' + d.p.doi, '_blank', 'noopener'); });

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(mobile ? 52 : 72).strength(.5))
      .force('charge', d3.forceManyBody().strength(d => d.kind === 'paper' ? -40 : -220))
      .force('x', d3.forceX(d =>
        d.kind === 'topic' ? W * 0.16 : d.kind === 'method' ? W * 0.84 : W * 0.5).strength(.14))
      .force('y', d3.forceY(H / 2).strength(.07))
      .force('collide', d3.forceCollide(d => r(d) + (mobile ? 4 : 7)))
      .on('tick', () => {
        nodes.forEach(d => {
          d.x = Math.max(r(d) + 4, Math.min(W - r(d) - 4, d.x));
          d.y = Math.max(r(d) + 4, Math.min(H - r(d) - 4, d.y));
        });
        link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        node.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    node.call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(.25).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));
  }

  render();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(render, 200); });
})();
