(() => {
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  };
  menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!expanded));
    navigation.classList.toggle('is-open', !expanded);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);
  document.getElementById('year').textContent = new Date().getFullYear();
  const content = window.C4C_CONTENT || { links: {}, photos: {} };
  document.querySelectorAll('[data-link]').forEach(link => {
    const key = link.dataset.link;
    const target = content.links?.[key];
    if (!target) return;
    try {
      const url = new URL(target);
      if (url.protocol !== 'https:') return;
      link.href = url.href;
      link.hidden = false;
      document.querySelectorAll(`[data-pending="${key}"]`).forEach(label => { label.hidden = true; });
    } catch { /* Keep the honest placeholder until a valid link is provided. */ }
  });
  document.querySelectorAll('[data-photo]').forEach(container => {
    const photo = content.photos?.[container.dataset.photo];
    if (!photo?.src || !photo.alt) return;
    let url;
    try { url = new URL(photo.src, document.baseURI); } catch { return; }
    if (url.origin !== location.origin && url.protocol !== 'https:') return;
    const image = new Image();
    image.alt = photo.alt;
    image.decoding = 'async';
    image.addEventListener('load', () => {
      container.replaceChildren(image);
      container.classList.add('has-photo');
    });
    image.src = url.href;
  });
})();
