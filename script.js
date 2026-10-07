'use strict';

(() => {
  const root = document.documentElement;
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navegacao');
  const mobileMenu = window.matchMedia('(max-width: 950px)');

  if (menuButton && navigation) {
    function setMenu(open, returnFocus = false) {
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      navigation.classList.toggle('is-open', open);
      if (returnFocus && mobileMenu.matches) menuButton.focus();
    }

    menuButton.addEventListener('click', () => {
      setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    navigation.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link || !mobileMenu.matches) return;

      let destination = null;
      if (link.hash && link.origin === window.location.origin && link.pathname === window.location.pathname) {
        try {
          destination = document.getElementById(decodeURIComponent(link.hash.slice(1)));
        } catch {
          // A malformed fragment should still allow ordinary link navigation.
        }
      }

      if (destination) {
        if (!destination.hasAttribute('tabindex')) destination.setAttribute('tabindex', '-1');
        // Move focus before hiding the menu; the native fragment link performs scrolling.
        destination.focus({ preventScroll: true });
        setMenu(false);
      } else {
        setMenu(false, navigation.contains(document.activeElement));
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        event.preventDefault();
        setMenu(false, true);
      }
    });

    document.addEventListener('click', (event) => {
      if (!navigation.contains(event.target) && !menuButton.contains(event.target)) {
        setMenu(false, navigation.contains(document.activeElement));
      }
    });

    const resetAtBreakpoint = () => setMenu(false, navigation.contains(document.activeElement));
    if (mobileMenu.addEventListener) mobileMenu.addEventListener('change', resetAtBreakpoint);
    else mobileMenu.addListener(resetAtBreakpoint);

    setMenu(false);
    // Progressive enhancement: links stay visible unless initialization reaches this point.
    root.classList.add('nav-ready');
  }

  const contactBar = document.querySelector('.mobile-contact');
  if (contactBar) {
    function keepFocusAboveBar() {
      const focused = document.activeElement;
      if (!focused || focused === document.body || contactBar.contains(focused)) return;
      const barHeight = contactBar.getBoundingClientRect().height;
      const bounds = focused.getBoundingClientRect();
      // Sections can be taller than the viewport; keep their beginning visible.
      if (barHeight && bounds.height < window.innerHeight - barHeight && bounds.bottom > window.innerHeight - barHeight - 8) {
        focused.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      }
    }

    function updateContactBarHeight() {
      const height = Math.ceil(contactBar.getBoundingClientRect().height);
      root.style.setProperty('--mobile-contact-height', `${height}px`);
      keepFocusAboveBar();
    }

    updateContactBarHeight();
    if ('ResizeObserver' in window) new ResizeObserver(updateContactBarHeight).observe(contactBar);
    window.addEventListener('resize', updateContactBarHeight);
    document.addEventListener('focusin', () => window.requestAnimationFrame(keepFocusAboveBar));
  }

  const year = document.getElementById('ano');
  if (year) year.textContent = String(new Date().getFullYear());
})();
