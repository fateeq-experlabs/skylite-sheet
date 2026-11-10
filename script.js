(() => {
  const WA_NUMBER = '923028431293';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Year
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // Header shadow on scroll
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav
  const toggle = $('.nav-toggle'), nav = $('#main-nav');
  const setNav = open => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });

  // Active nav link while scrolling
  const links = $$('.main-nav a');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));

    // Reveal on scroll
    const rev = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; rev.observe(el); });
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  // Gallery filters
  const chips = $$('.chip');
  const items = $$('.g-item');
  const applyFilter = f => {
    chips.forEach(c => { const on = c.dataset.filter === f; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', String(on)); });
    items.forEach(it => it.classList.toggle('is-hidden', f !== 'all' && it.dataset.cat !== f));
  };
  chips.forEach(c => c.addEventListener('click', () => applyFilter(c.dataset.filter)));
  // Application tiles jump to gallery pre-filtered
  $$('.app-tile').forEach(t => t.addEventListener('click', () => applyFilter(t.dataset.filter)));

  // Lightbox
  const lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
  let idx = 0, lastFocus = null;
  const visible = () => items.filter(i => !i.classList.contains('is-hidden'));
  const show = i => {
    const v = visible(); idx = (i + v.length) % v.length;
    const img = $('img', v[idx]);
    lbImg.src = img.src; lbImg.alt = img.alt; lbCap.textContent = $('figcaption', v[idx]).textContent;
  };
  const open = item => {
    lastFocus = document.activeElement;
    show(visible().indexOf(item)); lb.hidden = false; document.body.style.overflow = 'hidden';
    $('.lb-close', lb).focus();
  };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; lastFocus && lastFocus.focus(); };
  items.forEach(it => $('button', it).addEventListener('click', () => open(it)));
  $('.lb-close', lb).addEventListener('click', close);
  $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
  $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // Product "Get a quote" links pre-select the product in the form
  const productSelect = $('#product-select');
  $$('[data-product]').forEach(a => a.addEventListener('click', () => {
    const want = a.dataset.product;
    const opt = [...productSelect.options].find(o => o.text === want);
    if (opt) productSelect.value = opt.value;
  }));

  // Quote form → WhatsApp
  const form = $('#quote-form'), err = $('#form-error');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const nameInput = form.elements.name;
    if (!d.name.trim()) {
      err.hidden = false; nameInput.setAttribute('aria-invalid', 'true'); nameInput.focus(); return;
    }
    err.hidden = true; nameInput.removeAttribute('aria-invalid');
    const lines = [
      'Hello Skylite Sheet, I would like a quote.',
      '',
      `Name: ${d.name.trim()}`,
      d.phone.trim() ? `Phone: ${d.phone.trim()}` : null,
      `Product: ${d.product}`,
      `Colour: ${d.colour}`,
      `For: ${d.application}`,
      d.size.trim() ? `Size / quantity: ${d.size.trim()}` : null,
      d.message.trim() ? `Notes: ${d.message.trim()}` : null
    ];
    const text = lines.filter(l => l !== null).join('\n');
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
})();
