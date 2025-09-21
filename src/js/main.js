document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('siteNav');
    const menu = document.getElementById('navMenu');
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = [...document.querySelectorAll('[data-nav]')];
    const sections = [...document.querySelectorAll('main > section, main > header')];
  
    /* ===== Mobile menu ===== */
    toggle?.addEventListener('click', () => menu.classList.toggle('open'));
    navLinks.forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  
    /* ===== Smooth scroll with offset ===== */
    navLinks.forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || !id.startsWith('#')) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const navH = nav.getBoundingClientRect().height;
        const y = window.scrollY + target.getBoundingClientRect().top - (navH - 1);
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  
    /* ===== Navbar resize ===== */
    const onScrollResizeNav = () => {
      const threshold = 80;
      if (window.scrollY > threshold) nav.classList.add('shrink');
      else nav.classList.remove('shrink');
    };
  
    /* ===== ScrollSpy (position indicator) ===== */
    let activeId = '';
    const onScrollSpy = () => {
      const navBottom = nav.getBoundingClientRect().bottom;
      const atBottom = Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight;
      const targetSection = atBottom
        ? sections[sections.length - 1]
        : sections.find(sec => sec.getBoundingClientRect().top - navBottom >= -1) || sections[0];
  
      if (targetSection && activeId !== targetSection.id) {
        activeId = targetSection.id;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${activeId}`));
      }
    };
  
    /* combine scroll handlers */
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        onScrollResizeNav();
        onScrollSpy();
        ticking = false;
      });
      ticking = true;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init
  
    /* ===== Carousel (arrows + drag/swipe + keyboard) ===== */
    const carousel = document.querySelector('.carousel');
    if (carousel) {
      const track = carousel.querySelector('.track');
      const viewport = carousel.querySelector('.viewport');
      const slides = [...carousel.querySelectorAll('.slide')];
      const prev = carousel.querySelector('.prev');
      const next = carousel.querySelector('.next');
      let index = 0;
  
      const go = (to, withAnim = true) => {
        index = Math.max(0, Math.min(slides.length - 1, to));
        track.style.transition = withAnim ? 'transform 400ms ease' : 'none';
        track.style.transform = `translateX(-${index * 100}%)`;
        prev.disabled = index === 0;
        next.disabled = index === slides.length - 1;
      };
      prev.addEventListener('click', () => go(index - 1));
      next.addEventListener('click', () => go(index + 1));
      carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') go(index - 1);
        if (e.key === 'ArrowRight') go(index + 1);
      });
  
      // drag / swipe
      let isDown = false;
      let startX = 0;
      let currentX = 0;
      const pointerX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);
  
      const onDown = (e) => {
        isDown = true;
        startX = pointerX(e);
        currentX = startX;
        track.style.transition = 'none';
        carousel.classList.add('dragging');
      };
      const onMove = (e) => {
        if (!isDown) return;
        currentX = pointerX(e);
        const dx = currentX - startX;
        track.style.transform = `translateX(calc(-${index * 100}% + ${dx}px))`;
      };
      const onUp = () => {
        if (!isDown) return;
        isDown = false;
        const dx = currentX - startX;
        const threshold = viewport.clientWidth * 0.15;
        if (dx > threshold) go(index - 1, true);
        else if (dx < -threshold) go(index + 1, true);
        else go(index, true);
        carousel.classList.remove('dragging');
      };
  
      viewport.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      viewport.addEventListener('touchstart', onDown, { passive: true });
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onUp);
  
      go(0);
    }
  
    /* ===== Modals (open/close + ESC + background click) ===== */
    const modals = document.querySelectorAll('.modal');
    const openers = document.querySelectorAll('[data-open-modal]');
    const closers = document.querySelectorAll('[data-close-modal]');
  
    const openModal = (id) => {
      const modal = document.getElementById(`modal-${id}`);
      if (!modal) return;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modal.querySelector('.modal-dialog')?.focus();
    };
    const closeModal = (modal) => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
  
    openers.forEach(opener => {
      opener.addEventListener('click', () => openModal(opener.dataset.openModal));
    });
    modals.forEach(modal => {
      modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
    });
    closers.forEach(closer => {
      closer.addEventListener('click', () => {
        const modal = closer.closest('.modal');
        if (modal) closeModal(modal);
      });
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modals.forEach(m => m.classList.contains('open') && closeModal(m));
    });
  });
  