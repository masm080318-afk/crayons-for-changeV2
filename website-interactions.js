(() => {
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  const programsDropdown = document.querySelector('.programs-dropdown');
  const hoverNavigation = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 801px)');
  let dropdownCloseTimer;
  programsDropdown?.addEventListener('pointerenter', () => {
    clearTimeout(dropdownCloseTimer);
    if (hoverNavigation.matches) programsDropdown.open = true;
  });
  programsDropdown?.addEventListener('pointerleave', () => {
    if (hoverNavigation.matches) dropdownCloseTimer = setTimeout(() => {
      if (!programsDropdown.contains(document.activeElement)) programsDropdown.open = false;
    }, 180);
  });
  const closeMenu = () => {
    clearTimeout(dropdownCloseTimer);
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    if (programsDropdown) programsDropdown.open = false;
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
    if (event.key === 'Escape' && programsDropdown?.open) {
      programsDropdown.open = false;
      programsDropdown.querySelector('summary').focus();
      return;
    }
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
    else if (programsDropdown && !programsDropdown.contains(event.target)) programsDropdown.open = false;
  });
  programsDropdown?.addEventListener('focusout', event => {
    if (!programsDropdown.contains(event.relatedTarget)) programsDropdown.open = false;
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);
  document.getElementById('year').textContent = new Date().getFullYear();
  const content = window.C4C_CONTENT || { links: {}, photos: {} };
  const prepareExternalLink = link => {
    const url = new URL(link.href, document.baseURI);
    if (/^https?:$/.test(url.protocol) && url.origin !== location.origin) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (!link.querySelector('.new-tab-note')) {
        const note = document.createElement('span');
        note.className = 'sr-only new-tab-note';
        note.textContent = ' (opens in a new tab)';
        link.append(note);
      }
    }
  };
  document.querySelectorAll('[data-link]').forEach(link => {
    const key = link.dataset.link;
    const target = content.links?.[key];
    if (!target) return;
    try {
      const url = new URL(target, document.baseURI);
      if (url.protocol !== 'https:' && url.origin !== location.origin) return;
      link.href = url.href;
      prepareExternalLink(link);
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
  document.querySelectorAll('a[href]').forEach(prepareExternalLink);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let stopScroll = () => {};
  const flowTo = (target, hash) => {
    stopScroll();
    const start = window.scrollY;
    const end = target.id === 'main' ? 0 : Math.max(0, Math.min(
      target.getBoundingClientRect().top + start - 24,
      document.documentElement.scrollHeight - window.innerHeight
    ));
    const duration = reducedMotion.matches ? 0 : Math.min(1150, 600 + Math.abs(end - start) * 0.13);
    const startTime = performance.now();
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    let frame;
    const cancel = () => {
      cancelAnimationFrame(frame);
      document.documentElement.style.scrollBehavior = previousBehavior;
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', cancel);
      stopScroll = () => {};
    };
    stopScroll = cancel;
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('keydown', cancel);
    const tick = now => {
      const progress = duration ? Math.min((now - startTime) / duration, 1) : 1;
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - ((-2 * progress + 2) ** 3) / 2;
      window.scrollTo(0, start + (end - start) * eased);
      if (progress < 1) { frame = requestAnimationFrame(tick); return; }
      cancel();
      if (location.hash !== hash) history.pushState(null, '', hash || location.pathname);
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
      target.focus({ preventScroll: true });
    };
    frame = requestAnimationFrame(tick);
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const url = new URL(link.href, document.baseURI);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !link.getAttribute('href').includes('#')) return;
    const target = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : document.getElementById('main');
    if (!target) return;
    event.preventDefault();
    flowTo(target, url.hash);
  });
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section-heading, .mission-grid, .mission-facts, .project-card, .featured-event, .event-list article, .founder-card, .story-copy, .team-role, .program-preview, .project-detail-body').forEach(element => {
      // Never hide a block already visible when the page opens.
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      element.classList.add('reveal-on-scroll');
      reveal.observe(element);
    });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) {
        stopScroll();
        reveal.disconnect();
        document.querySelectorAll('.reveal-on-scroll').forEach(element => element.classList.add('is-visible'));
      }
    });
  }
})();
