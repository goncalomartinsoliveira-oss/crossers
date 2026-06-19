(function () {
  var PASSWORD = '182026';
  var KEY = 'crossers_auth';

  if (sessionStorage.getItem(KEY) === 'ok') return;

  var overlay = document.createElement('div');
  overlay.id = 'pw-gate';
  overlay.innerHTML = [
    '<style>',
    '#pw-gate{position:fixed;inset:0;z-index:99999;background:#0a0a0a;display:flex;align-items:center;justify-content:center;font-family:"Inter",sans-serif;}',
    '#pw-box{text-align:center;max-width:360px;width:100%;padding:0 24px;}',
    '#pw-logo{font-family:"Bebas Neue",sans-serif;font-size:3rem;letter-spacing:0.12em;color:#fff;margin-bottom:8px;}',
    '#pw-sub{font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:40px;}',
    '#pw-input{width:100%;background:#111;border:1px solid #2a2a2a;color:#fff;font-size:1.2rem;letter-spacing:0.3em;text-align:center;padding:14px 20px;outline:none;font-family:"Inter",sans-serif;transition:border-color 0.2s;}',
    '#pw-input:focus{border-color:rgba(255,255,255,0.25);}',
    '#pw-btn{margin-top:16px;width:100%;background:#fff;color:#0a0a0a;border:none;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px;cursor:pointer;transition:opacity 0.2s;}',
    '#pw-btn:hover{opacity:0.85;}',
    '#pw-error{margin-top:14px;font-size:11px;letter-spacing:0.1em;color:#e05555;opacity:0;transition:opacity 0.2s;}',
    '#pw-error.show{opacity:1;}',
    '</style>',
    '<div id="pw-box">',
    '  <div id="pw-logo">CROSSERS</div>',
    '  <div id="pw-sub">Acesso restrito — em desenvolvimento</div>',
    '  <input id="pw-input" type="password" placeholder="· · · · · ·" autocomplete="off" />',
    '  <button id="pw-btn">Entrar</button>',
    '  <div id="pw-error">Password incorreta</div>',
    '</div>',
  ].join('');

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  function attempt() {
    var val = document.getElementById('pw-input').value.trim();
    if (val === PASSWORD) {
      sessionStorage.setItem(KEY, 'ok');
      document.body.style.overflow = '';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.4s';
      setTimeout(function () { overlay.remove(); }, 400);
    } else {
      var err = document.getElementById('pw-error');
      err.classList.add('show');
      document.getElementById('pw-input').value = '';
      setTimeout(function () { err.classList.remove('show'); }, 2000);
    }
  }

  document.getElementById('pw-btn').addEventListener('click', attempt);
  document.getElementById('pw-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') attempt();
  });
})();
