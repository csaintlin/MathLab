const fullscreenButton = document.querySelector('.site-fullscreen');

if (document.fullscreenEnabled && fullscreenButton) {
  const label = fullscreenButton.querySelector('.site-fullscreen-text');
  function syncFullscreen() {
    const active = Boolean(document.fullscreenElement);
    label.textContent = active ? '離開全螢幕' : '全螢幕';
    fullscreenButton.setAttribute('aria-label', active ? '離開全螢幕' : '切換全螢幕');
    fullscreenButton.setAttribute('aria-pressed', String(active));
  }

  syncFullscreen();
  fullscreenButton.hidden = false;
  document.addEventListener('fullscreenchange', syncFullscreen);
  fullscreenButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      label.textContent = '目前無法切換全螢幕';
      fullscreenButton.setAttribute('aria-label', label.textContent);
    }
  });
}

import('./site-feedback.js').then(({mountFeedback}) => mountFeedback());
