/* 논문 목록 데이터 — 새 논문은 맨 위에 한 항목만 추가하면 됨.
   필드: y(연도), a(저자, 본인은 **Im C**), t(제목), j(저널·권호), doi(없으면 생략), review(심사중이면 true) */
window.LAB_PUBS = [
  { y: 2025, a: "**Im C**, Kim Y.", t: "GeoAI-driven spatial analysis of urban environmental factors and their impact on mental health.", j: "Applied Geography", review: true },
  { y: 2025, a: "**Im C**, Kim Y.", t: "Daily commuting population and corresponding spread of infectious disease.", j: "SSM–Population Health", review: true },
  { y: 2025, a: "**Im C**, Kim Y.", t: "Methamphetamine spread in the Seoul metropolitan area: a geographical random forest modeling approach.", j: "Applied Geography, 174, 103470", doi: "10.1016/j.apgeog.2024.103470" },
  { y: 2024, a: "**Im C**, Curtis A, Song D, Kim OS.", t: "Mapping African swine fever and highly pathogenic avian influenza outbreaks along the Demilitarized Zone in the Korean peninsula.", j: "Transboundary and Emerging Diseases", doi: "10.1155/2024/8824971" },
  { y: 2024, a: "Park S, **Im C**, Kim B.", t: "Multilevel analysis on spatial distribution and socio-environmental factors of dental caries in Korean children.", j: "J. Korean Acad. Pediatric Dentistry, 51(1), 40–54", doi: "10.5933/JKAPD.2024.51.1.40" },
  { y: 2023, a: "**Im C**, Chung J, Kim H, Chung S, Yoon TK.", t: "Are seed dispersal and seedling establishment distance- and/or density-dependent in naturally regenerating larch patches? Within-patch scale analysis using an eigenvector spatial filtering model.", j: "Forest Ecology and Management, 531, 120763", doi: "10.1016/j.foreco.2022.120763" },
  { y: 2022, a: "Koo K, **Im C**, Yang B.", t: "Advancement of an ecosystem-based assessment system to determine a new special-purpose district in national park management.", j: "The Geographical Journal of Korea, 46(4), 353–366" },
  { y: 2021, a: "**Im C**, Kim Y.", t: "Local characteristics related to SARS-CoV-2 transmissions in the Seoul metropolitan area, South Korea.", j: "Int. J. Environmental Research and Public Health, 18(23), 12595", doi: "10.3390/ijerph182312595" },
  { y: 2021, a: "Kim H, Choe SA, Kim OJ, Kim SY, Kim S, **Im C**, Kim YS, Yoon TK.", t: "Outdoor air pollution and diminished ovarian reserve among infertile Korean women.", j: "Environmental Health and Preventive Medicine, 26(1), 1–8", doi: "10.1186/s12199-021-00942-4" },
  { y: 2021, a: "Choe SA, Kim S, **Im C**, Kim SY, Wellenius G, Kim YS, Yoon TK, Kim DK.", t: "Land use and semen quality: a fertility center cohort study.", j: "PLOS ONE, 16(8), e0255985", doi: "10.1371/journal.pone.0255985" },
  { y: 2021, a: "Lee S, Koo KA, **Im C**, Yoon TK.", t: "Citizens' perception on and attitudes toward use and management of national parks in South Korea.", j: "J. Environmental Impact Assessment, 30(2), 89–104", doi: "10.14249/EIA.2021.30.2.89" },
  { y: 2021, a: "**Im C**, Kim Y.", t: "Spatially filtered multilevel analysis on spatial inequality of tuberculosis in Gyeongsangbuk-do, Korea.", j: "J. Health Informatics and Statistics, 46(1), 88–99", doi: "10.21032/jhis.2021.46.1.88" },
  { y: 2021, a: "**Im C**, Kim Y.", t: "Spatial pattern of tuberculosis (TB) and related socio-environmental factors in South Korea, 2008–2016.", j: "PLOS ONE, 16(8), e0255727", doi: "10.1371/journal.pone.0255727" },
  { y: 2020, a: "Choe SA, Kim S, **Im C**, Kim SY, Kim YS, Yoon TK, Kim DK.", t: "Nighttime environmental noise and semen quality: a single fertility center cohort study.", j: "PLOS ONE, 15(11), e0240689", doi: "10.1371/journal.pone.0240689" },
  { y: 2016, a: "**Im C**, Kim Y.", t: "Spatial socio-environmental analysis of tuberculosis in South Korea using eigenvector spatial filtering methodology.", j: "J. Korean Cartographic Association, 16(3), 89–101", doi: "10.16879/jkca.2016.16.3.089" },
];

/* 렌더러 — 연도 그룹(2023—present / 2020—2022 / 2016—2019)으로 출력 */
(function () {
  const box = document.getElementById('pub-list');
  if (!box || !window.LAB_PUBS) return;
  const groups = [
    { label: '2023 — Present', test: y => y >= 2023 },
    { label: '2020 — 2022', test: y => y >= 2020 && y <= 2022 },
    { label: '2016 — 2019', test: y => y <= 2019 },
  ];
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const authors = a => esc(a).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  let html = '';
  groups.forEach(g => {
    const items = window.LAB_PUBS.filter(p => g.test(p.y));
    if (!items.length) return;
    html += `<div class="pub-group">${g.label}</div>`;
    items.forEach(p => {
      const jj = p.review
        ? `Under review · <i>${esc(p.j)}</i>`
        : `<i>${esc(p.j).replace(/,.*$/, '')}</i>${esc(p.j).includes(',') ? esc(p.j).slice(esc(p.j).indexOf(',')) : ''}`;
      const doi = p.doi
        ? ` · <a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">doi:${p.doi}</a>` : '';
      html += `<div class="pub"><div class="y mono">${p.y}</div><div>
        <div class="t">${authors(p.a)} ${esc(p.t)}</div>
        <div class="j">${jj}${doi}</div></div></div>`;
    });
  });
  box.innerHTML = html;
})();
