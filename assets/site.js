document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu(returnFocus = false) {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open menu');
  navigation?.classList.remove('is-open');
  if (returnFocus) menuButton?.focus();
}
menuButton?.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
  navigation.classList.toggle('is-open', opening);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
navigation?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
matchMedia('(min-width: 951px)').addEventListener('change', () => closeMenu());
window.addEventListener('pageshow', () => closeMenu());

// Date checks run on restored tabs too, so stale HTML never advertises expired prices.
function refreshPricing() {
  const offers = document.querySelector('[data-early-bird]');
  if (!offers) return;
  const current = new Intl.DateTimeFormat('en-CA', { timeZone: offers.dataset.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const active = current <= offers.dataset.endDate;
  offers.hidden = !active;
  document.querySelector('[data-current-pricing]').hidden = active;
}
refreshPricing();
window.addEventListener('pageshow', refreshPricing);
document.addEventListener('visibilitychange', refreshPricing);
setInterval(refreshPricing, 60000);

const form = document.querySelector('#contact-form');
form?.addEventListener('input', () => {
  const draft = document.querySelector('#draft-link');
  draft.hidden = true;
  draft.removeAttribute('href');
  document.querySelector('#form-status').textContent = '';
});
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const name = String(fields.get('name')).trim();
  const email = String(fields.get('email')).trim();
  const subject = String(fields.get('subject')).trim();
  const message = String(fields.get('message')).trim();
  if (![name, email, subject, message].every(Boolean)) {
    document.querySelector('#form-status').textContent = 'Please complete all four fields.';
    return;
  }
  const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
  const draft = document.querySelector('#draft-link');
  draft.href = `${form.getAttribute('action')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  draft.hidden = false;
  document.querySelector('#form-status').textContent = 'Your draft is ready. Open it in your email app to review and send. Nothing has been sent yet.';
  draft.focus();
});
