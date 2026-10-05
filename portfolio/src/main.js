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

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavScroll();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
});
