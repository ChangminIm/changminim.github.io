(() => {
  'use strict';
  const frame = document.getElementById('atlas');
  const full = document.getElementById('full-link');
  const status = document.getElementById('frame-status');
  const buttons = Array.from(document.querySelectorAll('[data-view]'));
  for (const button of buttons) button.addEventListener('click', () => {
    const view = button.dataset.view;
    const url = 'atlas.html?view=1&tab=' + encodeURIComponent(view);
    if (frame.getAttribute('src') !== url) frame.src = url;
    full.href = url;
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
    status.textContent = button.textContent.replace(/^\s*\d+\s*/, '').trim() + ' 화면';
  });
})();
