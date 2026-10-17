/**
 * Main entry point.
 * Global interactions: nav scroll behavior, mobile menu, scroll reveal, theme.
 */

import '../styles/index.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/animations.css';
import '../styles/project-page.css';

import { initTheme } from './theme.js';
import { initScrollReveal } from './animations.js';
import { initGalleries } from './gallery.js';

// --- Nav scroll behavior ---
function initNavScroll() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 20) {
          nav.classList.add('nav--scrolled');
        } else {
          nav.classList.remove('nav--scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

// --- Mobile menu ---
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-mobile');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isOpen);
    menu.setAttribute('aria-hidden', isOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  // Close menu when a link is clicked
  menu.querySelectorAll('.nav__mobile-link').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
}

// --- Smooth scroll for anchor links ---
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.getElementById('site-nav')?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

        window.scrollTo({ top, behavior: 'smooth' });

        // Update URL without jumping
        history.pushState(null, '', targetId);
      }
    });
  });
}

// --- Dates that would otherwise go stale ---
// [data-year] gets the current year; [data-duration-since="YYYY-MM"] gets a
// LinkedIn-style duration ("4 MOS", "1 YR 2 MOS"), counting both end months.
function initDates() {
  const now = new Date();

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = now.getFullYear();
  });

  document.querySelectorAll('[data-duration-since]').forEach((el) => {
    const [year, month] = el.dataset.durationSince.split('-').map(Number);
    const total = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month) + 1;
    if (!(total > 0)) return;

    const yrs = Math.floor(total / 12);
    const mos = total % 12;
    const parts = [];
    if (yrs) parts.push(`${yrs} ${yrs === 1 ? 'YR' : 'YRS'}`);
    if (mos) parts.push(`${mos} ${mos === 1 ? 'MO' : 'MOS'}`);
    el.textContent = parts.join(' ');
  });
}

// --- Project card hover preview ---
// An <img data-hover-src> inside a .project-card swaps in (e.g. a demo GIF) while the
// card is hovered or focused. The file is only fetched on first hover, and touch
// devices and reduced-motion users keep the static image.
function initHoverPreview() {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || reduceMotion) return;

  document.querySelectorAll('[data-hover-src]').forEach((preview) => {
    const card = preview.closest('.project-card');
    if (!card) return;

    let active = false;

    preview.addEventListener('load', () => {
      if (active) preview.classList.add('is-playing');
    });

    const start = () => {
      active = true;
      if (!preview.getAttribute('src')) {
        preview.src = preview.dataset.hoverSrc;
      } else if (preview.complete) {
        preview.classList.add('is-playing');
      }
    };

    const stop = () => {
      active = false;
      preview.classList.remove('is-playing');
    };

    card.addEventListener('mouseenter', start);
    card.addEventListener('mouseleave', stop);
    card.addEventListener('focus', start);
    card.addEventListener('blur', stop);
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavScroll();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initDates();
  initHoverPreview();
  initGalleries();
});
