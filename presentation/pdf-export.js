/* ── 발표자료 공통 PDF 내보내기 ──────────────────────────────
   사용: <script src="./pdf-export.js" defer></script>
   - 슬라이드덱(#deck 존재): 슬라이드 1장 = PDF 1쪽 (297×167mm, 16:9 가로)
     · 내용이 페이지보다 길면 자동 축소(화면 맞춤)로 잘림 방지
     · 지도(Leaflet)는 인쇄 크기 기준으로 다시 렌더링
   - 스토리맵(그 외): A4 세로 문서로 자연 분할 인쇄
   "⬇ PDF" 버튼 → 인쇄 대화상자에서 "대상: PDF로 저장" + "배경 그래픽: 켬"
   자동 생성용: URL에 ?pdf=1 을 붙이면 로드 후 PDF 모드로 전환됨 */
(function(){
var isDeck = !!document.getElementById('deck');

/* 297×167mm ≈ 1122×631px(96dpi). 루트 폰트 13px = 원본 clamp()가
   1122px 화면에서 갖는 값 → 화면 PDF 모드와 실제 인쇄가 같은 기하가 됨 */
var css = isDeck ? [
'html.pdfmode{font-size:13px!important}',
'html.pdfmode,html.pdfmode body{height:auto!important;overflow:auto!important}',
'html.pdfmode #deck{display:block!important;height:auto!important;overflow:visible!important;scroll-snap-type:none!important}',
'html.pdfmode .slide{width:1122px!important;height:631px!important;flex:none!important;overflow:hidden!important;margin:0 auto}',
'html.pdfmode #nav,html.pdfmode #progress,html.pdfmode .hint,html.pdfmode #symTip{display:none!important}',
/* 화면 vh 기준으로 크기가 정해지는 요소 → 인쇄 페이지(631px) 기준 고정값 */
'html.pdfmode #map{height:430px!important}',
'html.pdfmode #mapPrio{height:449px!important}',
'html.pdfmode #ehsaFrame{height:481px!important}',
'html.pdfmode .shot img{max-height:358px!important}',
'.pdf-fitwrap{transform-origin:top left}',
'@media print{',
' @page{size:297mm 167mm;margin:0}',
' *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}',
' html{font-size:13px!important}',
' html,body,html.pdfmode,html.pdfmode body{height:auto!important;overflow:visible!important}',
' #deck{display:block!important;height:auto!important;overflow:visible!important}',
' .slide{width:297mm!important;height:167mm!important;flex:none!important;overflow:hidden!important;',
'  margin:0!important;break-after:page;page-break-after:always}',
' .slide:last-child{break-after:auto;page-break-after:auto}',
' body>*:not(#deck){display:none!important}',
' #map{height:430px!important}#mapPrio{height:449px!important}',
' #ehsaFrame{height:481px!important}.shot img{max-height:358px!important}',
' #nav,#progress,.hint,#symTip,#pdfExportBtn{display:none!important}',
'}'].join('\n') : [
'@media print{',
' @page{size:A4;margin:14mm 12mm}',
' *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}',
' html,body{height:auto!important;overflow:visible!important}',
' .reveal{opacity:1!important;transform:none!important;transition:none!important}',
' #secNav,#pdfExportBtn{display:none!important}',
'}'].join('\n');

var st = document.createElement('style');
st.textContent = css;
document.head.appendChild(st);

/* 넘치는 슬라이드를 페이지 안으로 축소(화면 맞춤) */
function fitSlides(){
  document.querySelectorAll('#deck > .slide').forEach(function(s){
    var w = s.querySelector(':scope > .pdf-fitwrap');
    if(!w){
      w = document.createElement('div');
      w.className = 'pdf-fitwrap';
      while(s.firstChild) w.appendChild(s.firstChild);
      s.appendChild(w);
    }
    w.style.transform = '';
    w.style.width = '';
    var cs = getComputedStyle(s);
    var avail = s.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var h = w.scrollHeight;
    if(h > avail + 2){
      var k = avail / h;
      w.style.transform = 'scale(' + k + ')';
      w.style.width = (100 / k) + '%';
    }
  });
}

var inPdf = false, openedDetails = [], savedIdx = 0;
function enterPdf(){
  if(inPdf) return;
  inPdf = true;
  var deck = document.getElementById('deck');
  if(deck) savedIdx = Math.round(deck.scrollLeft / window.innerWidth);
  openedDetails = Array.prototype.slice.call(document.querySelectorAll('details:not([open])'));
  openedDetails.forEach(function(d){ d.open = true; });
  document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('on'); });
  document.documentElement.classList.add('pdfmode');
  if(isDeck) fitSlides();
  try{ if(window._map) window._map.invalidateSize(); }catch(e){}
  try{ if(window._mapP) window._mapP.invalidateSize(); }catch(e){}
}
function exitPdf(){
  if(!inPdf) return;
  inPdf = false;
  document.documentElement.classList.remove('pdfmode');
  document.querySelectorAll('.pdf-fitwrap').forEach(function(w){
    w.style.transform = ''; w.style.width = '';
  });
  openedDetails.forEach(function(d){ d.open = false; });
  openedDetails = [];
  try{ if(window._map) window._map.invalidateSize(); }catch(e){}
  try{ if(window._mapP) window._mapP.invalidateSize(); }catch(e){}
  var deck = document.getElementById('deck');
  if(deck) deck.scrollLeft = savedIdx * window.innerWidth;
}
/* Ctrl+P 직접 인쇄에도 대응 */
window.addEventListener('beforeprint', enterPdf);
window.addEventListener('afterprint', exitPdf);

/* PDF 저장 버튼 — 덱이면 하단 내비에, 스토리맵이면 좌하단 고정 */
var btn = document.createElement('button');
btn.id = 'pdfExportBtn';
btn.textContent = '⬇ PDF';
btn.title = 'PDF로 저장 — 인쇄 대화상자에서 "대상: PDF로 저장", "배경 그래픽: 켬" 선택';
btn.onclick = function(){
  enterPdf();
  setTimeout(function(){ window.print(); }, 900); /* 지도 타일 로딩 여유 */
};
var nav = document.getElementById('nav');
if(nav){
  /* #nav button 공통 규칙(원형 2.4rem)이 덮지 않도록 width:auto 명시 */
  btn.style.cssText = 'background:#1d3350;color:#fff;border:none;border-radius:999px;'+
    'width:auto;height:2.4rem;padding:0 1rem;font-size:.82rem;font-weight:700;cursor:pointer;'+
    'white-space:nowrap;box-shadow:0 3px 12px rgba(29,51,80,.3);font-family:inherit';
  nav.insertBefore(btn, nav.firstChild);
}else{
  btn.style.cssText = 'position:fixed;bottom:26px;left:26px;z-index:1300;'+
    'background:#1d3350;color:#fff;border:none;border-radius:999px;padding:.55rem 1.1rem;'+
    'font-size:.85rem;font-weight:700;cursor:pointer;box-shadow:0 3px 12px rgba(29,51,80,.3);font-family:inherit';
  document.body.appendChild(btn);
}

/* headless 자동 생성: ?pdf=1 → 로드 후 PDF 모드 진입 */
if(/[?&]pdf=1/.test(location.search)){
  window.addEventListener('load', function(){ setTimeout(enterPdf, 2500); });
}
})();
