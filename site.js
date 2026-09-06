(function () {
  var layer = document.createElement('div');
  layer.className = 'page-transition';
  layer.setAttribute('aria-hidden', 'true');
  document.documentElement.appendChild(layer);

  function dismiss() { layer.classList.add('is-gone'); }
  window.addEventListener('load', dismiss, { once: true });
  setTimeout(dismiss, 900);

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link || link.target === '_blank' || link.origin !== window.location.origin) return;
    if (link.pathname === window.location.pathname && link.hash) return;
    layer.classList.remove('is-gone');
  });
}());
