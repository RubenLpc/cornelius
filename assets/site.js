/* ============================================================
   HOT PEPPER CAFFE — interactions
   ============================================================ */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- image fallback ---- */
  $$('.ph img').forEach((img) => {
    const fail = () => img.closest('.ph')?.classList.add('noimg');
    if (img.complete && img.naturalWidth === 0) fail();
    img.addEventListener('error', fail, { once: true });
  });

  /* ---- nav scrolled state ---- */
  const nav = $('#nav');
  const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScrollNav();
  addEventListener('scroll', onScrollNav, { passive: true });

  /* ---- mobile menu ---- */
  const hamb = $('#hamb'), mnav = $('#mnav');
  const toggleM = (open) => {
    const on = open ?? !mnav.classList.contains('open');
    mnav.classList.toggle('open', on);
    hamb.classList.toggle('open', on);
    hamb.setAttribute('aria-expanded', on);
    document.body.style.overflow = on ? 'hidden' : '';
  };
  hamb.addEventListener('click', () => toggleM());
  $$('#mnav a').forEach((a) => a.addEventListener('click', () => toggleM(false)));

  /* ---- reveal on scroll (fade + slide, stagger via --i) ---- */
  if (reduce) {
    $$('.reveal').forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
  }

  /* ---- scrollspy (active nav link) ---- */
  const spies = $$('.nav-links a[data-spy]');
  const spyMap = new Map(spies.map((a) => [a.dataset.spy, a]));
  const sections = $$('section[id]');
  const spyIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        spies.forEach((a) => a.classList.remove('active'));
        const link = spyMap.get(e.target.id);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach((s) => spyIO.observe(s));

  /* ---- floating controls ---- */
  const fab = $('#fab'), topBtn = $('#topBtn');
  const onScrollFab = () => fab.classList.toggle('show', window.scrollY > 600);
  onScrollFab();
  addEventListener('scroll', onScrollFab, { passive: true });
  topBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ---- web share ---- */
  const shareData = {
    title: 'Casa Cornelius — Sală de Nunți · Rădăuți',
    text: 'Sala de nunți de vis din Rădăuți — până la 300 de invitați 🤍',
    url: location.href,
  };
  $$('[data-share]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        if (navigator.share) { await navigator.share(shareData); }
        else {
          await navigator.clipboard.writeText(shareData.url);
          const t = btn.querySelector('.arr') ? null : btn;
          if (t && t.dataset.share !== undefined && t.textContent.trim()) {
            const old = t.textContent; t.textContent = 'Link copiat ✓';
            setTimeout(() => (t.textContent = old), 1800);
          }
        }
      } catch (e) { /* user dismissed */ }
    });
  });

  /* ---- live hours indicator ---- */
  const schedule = { 0: [10, 21], 1: [8, 21], 2: [8, 21], 3: [8, 21], 4: [8, 21], 5: [8, 21], 6: [8, 21] };
  const dayNames = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
  function refreshLive() {
    const live = $('#live'), txt = $('#live-txt');
    if (!live || !txt) return;
    const now = new Date();
    const d = now.getDay();
    const h = now.getHours() + now.getMinutes() / 60;
    const [open, close] = schedule[d];
    const isOpen = h >= open && h < close;
    live.classList.toggle('open', isOpen);
    live.classList.toggle('closed', !isOpen);
    if (isOpen) {
      const mins = Math.round((close - h) * 60);
      txt.textContent = mins > 90
        ? `Deschis acum · până la ${String(close).padStart(2, '0')}:00`
        : `Deschis · se închide în ${mins} min`;
    } else {
      let nd = d, add = 0;
      if (h >= close) { nd = (d + 1) % 7; add = 1; }
      const [no] = schedule[nd];
      txt.textContent = add === 0 && h < open
        ? `Închis · deschidem azi la ${String(no).padStart(2, '0')}:00`
        : `Închis · deschidem ${add === 1 ? (nd === (new Date().getDay() + 1) % 7 ? 'mâine' : dayNames[nd]) : dayNames[nd]} la ${String(no).padStart(2, '0')}:00`;
    }
    $$('#hours .row').forEach((r) => r.classList.toggle('now', +r.dataset.day === d));
  }
  refreshLive();
  setInterval(refreshLive, 60000);

  /* ---- lightbox ---- */
  const lb = $('#lb'), lbImg = $('#lb-img'), lbCur = $('#lb-cur'), lbTotal = $('#lb-total');
  const items = $$('#gal .ph');
  const sources = items.map((el) => {
    const im = el.querySelector('img');
    return { full: (im.currentSrc || im.src).replace(/w=\d+/, 'w=1600'), alt: im.alt || '' };
  });
  let idx = 0;
  lbTotal.textContent = sources.length;
  function openLb(i) {
    idx = (i + sources.length) % sources.length;
    lbImg.src = sources[idx].full;
    lbImg.alt = sources[idx].alt;
    lbCur.textContent = idx + 1;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  items.forEach((el, i) => el.addEventListener('click', () => openLb(i)));
  $('.lb-close').addEventListener('click', closeLb);
  $('.lb-prev').addEventListener('click', (e) => { e.stopPropagation(); openLb(idx - 1); });
  $('.lb-next').addEventListener('click', (e) => { e.stopPropagation(); openLb(idx + 1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb(idx - 1);
    if (e.key === 'ArrowRight') openLb(idx + 1);
  });

  /* ---- smooth-scroll offset for fixed nav on hash links ---- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 58;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
