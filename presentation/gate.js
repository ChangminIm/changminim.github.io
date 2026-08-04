/* 발표자료 비밀번호 게이트 — changminim.com/presentation
 * 사용법: 보호할 페이지의 <head> 최상단에 추가
 *   <script src="/presentation/gate.js" data-item="자료ID"></script>
 * 자료ID는 presentation/locks.json 의 items 키와 일치해야 함.
 * 비밀번호 설정/변경은 아카이브 페이지 관리자 패널에서.
 */
(function () {
  var SALT = 'changminim/pa/v1|';
  var ITEM = (document.currentScript && document.currentScript.getAttribute('data-item')) || '';
  var LS_MASTER = 'pa_master_v1';
  var SS_OK = 'pa_ok_' + ITEM;

  /* 검증 전까지 페이지 숨김 */
  var hide = document.createElement('style');
  hide.id = 'pa-gate-hide';
  hide.textContent = 'html{visibility:hidden!important}';
  document.documentElement.appendChild(hide);

  function reveal() {
    var h = document.getElementById('pa-gate-hide');
    if (h) h.remove();
    var ov = document.getElementById('pa-gate');
    if (ov) ov.remove();
  }

  function sha256(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + text))
      .then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return b.toString(16).padStart(2, '0');
        }).join('');
      });
  }

  function onReady(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function showGate(itemHash, masterHash) {
    onReady(function () {
      var ov = document.createElement('div');
      ov.id = 'pa-gate';
      ov.innerHTML =
        '<style>' +
        '#pa-gate{visibility:visible!important;position:fixed;inset:0;z-index:99999;' +
        'background:#fafbfc;display:flex;align-items:center;justify-content:center;padding:24px;' +
        "font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#1c2430}" +
        '#pa-gate .box{background:#fff;border:1px solid #e4e7ea;border-radius:16px;max-width:420px;width:100%;' +
        'padding:32px 28px;box-shadow:0 18px 60px rgba(28,36,48,.12);text-align:left}' +
        '#pa-gate .k{font-size:11.5px;letter-spacing:.1em;color:#00a44f;font-weight:700;margin-bottom:8px}' +
        '#pa-gate h2{font-size:17px;font-weight:900;margin:0 0 6px}' +
        '#pa-gate .d{font-size:13px;color:#66707c;margin-bottom:18px;line-height:1.6}' +
        '#pa-gate input{width:100%;box-sizing:border-box;border:1.5px solid #e4e7ea;border-radius:10px;' +
        'padding:11px 14px;font-size:15px;outline:none}' +
        '#pa-gate input:focus{border-color:#1d4189}' +
        '#pa-gate .err{display:none;font-size:12.5px;color:#c23b3b;margin-top:8px}' +
        '#pa-gate button{width:100%;border:none;border-radius:10px;padding:12px 0;font-size:14px;font-weight:700;' +
        'cursor:pointer;background:#1d4189;color:#fff;margin-top:14px;font-family:inherit}' +
        '#pa-gate .back{display:block;text-align:center;font-size:12px;color:#66707c;margin-top:14px;text-decoration:none}' +
        '#pa-gate .back:hover{color:#1d4189}' +
        '</style>' +
        '<div class="box">' +
        '<div class="k">PROTECTED</div>' +
        '<h2>비밀번호가 필요합니다</h2>' +
        '<div class="d">이 발표자료는 비공개입니다. 안내받은 비밀번호를 입력해 주세요.</div>' +
        '<input type="password" placeholder="비밀번호 입력" autocomplete="off">' +
        '<div class="err">비밀번호가 일치하지 않습니다.</div>' +
        '<button>열기</button>' +
        '<a class="back" href="/presentation/">← 발표자료 아카이브로</a>' +
        '</div>';
      document.body.appendChild(ov);

      var input = ov.querySelector('input');
      var err = ov.querySelector('.err');

      function submit() {
        var val = input.value;
        if (!val) return;
        sha256(val).then(function (hash) {
          if (masterHash && hash === masterHash) {
            localStorage.setItem(LS_MASTER, hash);
            reveal();
          } else if (itemHash && hash === itemHash) {
            sessionStorage.setItem(SS_OK, '1');
            reveal();
          } else {
            err.style.display = 'block';
            input.select();
          }
        });
      }
      ov.querySelector('button').addEventListener('click', submit);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
      setTimeout(function () { input.focus(); }, 50);
    });
  }

  fetch('/presentation/locks.json?ts=' + Date.now(), { cache: 'no-store' })
    .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then(function (locks) {
      var itemHash = (locks.items && locks.items[ITEM]) || null;
      if (!itemHash) { reveal(); return; }                                  // 공개 자료
      if (localStorage.getItem(LS_MASTER) === locks.master) { reveal(); return; }  // 마스터
      if (sessionStorage.getItem(SS_OK) === '1') { reveal(); return; }      // 이미 인증됨
      showGate(itemHash, locks.master);
    })
    .catch(function () {
      /* 설정을 못 불러오면 잠그지 않고 통과시키는 대신, 입력창을 띄워 마스터키로만 열 수 있게 함 */
      showGate(null, null);
      onReady(function () {
        var d = document.querySelector('#pa-gate .d');
        if (d) d.textContent = '접근 설정을 불러오지 못했습니다. 네트워크 확인 후 새로고침 해주세요.';
      });
    });
})();
