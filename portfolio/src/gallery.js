/**
 * Screenshot gallery for case study pages.
 * Markup: [data-gallery] containing .gallery__slide figures (with data-caption),
 * .gallery__thumb buttons, [data-gallery-prev]/[data-gallery-next], .gallery__caption and .gallery__count.
 * Supports buttons, thumbnails, arrow keys and swipe. Wraps around at both ends.
 */

export function initGalleries() {
  document.querySelectorAll('[data-gallery]').forEach(setupGallery);
}

function setupGallery(root) {
  const slides = [...root.querySelectorAll('.gallery__slide')];
  const thumbs = [...root.querySelectorAll('.gallery__thumb')];
  const strip = root.querySelector('.gallery__thumbs');
  const caption = root.querySelector('.gallery__caption');
  const count = root.querySelector('.gallery__count');
  const viewport = root.querySelector('.gallery__viewport');
  if (slides.length === 0) return;

  let current = 0;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
    });
    thumbs.forEach((thumb, i) => {
      thumb.setAttribute('aria-current', i === current ? 'true' : 'false');
    });

    caption.textContent = slides[current].dataset.caption || '';
    count.textContent = `${current + 1} / ${slides.length}`;

    // Start loading the next image so it doesn't pop in when the user clicks next
    const nextImg = slides[(current + 1) % slides.length].querySelector('img');
    if (nextImg) nextImg.loading = 'eager';

    // Keep the active thumbnail in view without scrolling the page
    const thumb = thumbs[current];
    if (strip && thumb) {
      strip.scrollTo({
        left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2,
        behavior: 'smooth',
      });
    }
  }

  root.querySelector('[data-gallery-prev]')?.addEventListener('click', () => show(current - 1));
  root.querySelector('[data-gallery-next]')?.addEventListener('click', () => show(current + 1));
  thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => show(i)));

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(current - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(current + 1);
    }
  });

  // Swipe on touch screens
  let touchStartX = null;
  viewport?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  viewport?.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) show(dx < 0 ? current + 1 : current - 1);
    touchStartX = null;
  });

  show(0);
}
