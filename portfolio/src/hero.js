/**
 * Homepage hero: name decode, rotating tagline phrase, the ship.log terminal
 * card and the cursor-following dot grid. Every part no-ops when its element
 * is missing, so this is safe on pages without a hero.
 *
 * Choreography: the name decodes first; the phrase rotation and terminal
 * stream start once it settles, so only one thing moves at a time on load.
 */

const SCRAMBLE_GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ#%&*+=/<>?';

// Terminal script. Only real facts from the case studies, no invented numbers.
const LOG_SCRIPT = [
  { kind: 'cmd', text: 'tail -f ship.log' },
  { kind: 'ok', project: 'task-tracker', text: '390 users/day · RLS enforced' },
  { kind: 'ok', project: 'event-desk', text: 'daily reminder emails sent' },
  { kind: 'info', project: 'support-desk', text: 'email classified → order found' },
  { kind: 'info', project: 'support-desk', text: 'reply drafted for review' },
  { kind: 'ok', project: 'smartsms', text: 'announcement texted to residents' },
  { kind: 'info', project: 'ambot', text: 'answer names its source' },
  { kind: 'cmd', text: 'git push origin main' },
  { kind: 'ok', project: 'deploy', text: 'built and shipped' },
];

const MAX_LOG_LINES = 12;

export function initHero() {
  const section = document.querySelector('.section--hero');
  if (!section) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const visibility = trackVisibility(section);

  const rotator = initRotator(reduceMotion, visibility);
  const terminal = initTerminal(reduceMotion, visibility);

  initNameDecode(reduceMotion).then(() => {
    rotator?.start();
    terminal?.start();
  });

  if (!reduceMotion) initPointerEffects(section);
}

// --- Visibility: pause loops when the hero is off-screen or the tab is hidden ---
function trackVisibility(section) {
  let onScreen = true;
  const listeners = new Set();
  const isVisible = () => onScreen && !document.hidden;
  const notify = () => listeners.forEach((fn) => isVisible() && fn());

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    notify();
  }).observe(section);

  document.addEventListener('visibilitychange', notify);

  return {
    isVisible,
    onResume: (fn) => listeners.add(fn),
  };
}

// Runs fn after ms, but holds it until the hero is visible again.
function makeScheduler(visibility) {
  let pending = null;
  visibility.onResume(() => {
    if (!pending) return;
    const fn = pending;
    pending = null;
    fn();
  });

  return (fn, ms) => {
    setTimeout(() => {
      if (visibility.isVisible()) fn();
      else pending = fn;
    }, ms);
  };
}

// --- Name decode ---
function initNameDecode(reduceMotion) {
  const name = document.getElementById('hero-name');
  if (!name || reduceMotion) return Promise.resolve();

  const chars = [];
  const lines = name.querySelectorAll('.hero__name-line');
  lines.forEach((line) => {
    const text = line.textContent.trim();
    line.dataset.text = text;
    line.textContent = '';
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'hero__char';
      span.textContent = ch === ' ' ? ' ' : ch;
      line.appendChild(span);
      chars.push({ span, final: span.textContent, isSpace: ch === ' ' });
    }
  });

  // Hide the name until the fonts are in and widths are locked, so it doesn't
  // flash in once and then scramble. Capped so a slow font never hides it.
  name.style.visibility = 'hidden';
  const fontsReady = Promise.race([
    document.fonts.load('700 1em "Instrument Sans"'),
    new Promise((r) => setTimeout(r, 800)),
  ]);

  return fontsReady.then(
    () =>
      new Promise((resolve) => {
        name.style.removeProperty('visibility');
        // Lock each letter's width so scrambled glyphs can't shift the layout
        chars.forEach((c) => {
          c.span.style.width = `${c.span.getBoundingClientRect().width}px`;
        });

        const letters = chars.filter((c) => !c.isSpace);
        const start = performance.now();
        letters.forEach((c, i) => {
          c.resolveAt = 250 + i * 55;
          c.span.classList.add('is-scrambling');
        });

        let lastSwap = 0;
        const frame = (now) => {
          const elapsed = now - start;
          const swap = now - lastSwap > 55;
          if (swap) lastSwap = now;

          let remaining = 0;
          letters.forEach((c) => {
            if (c.done) return;
            if (elapsed >= c.resolveAt) {
              c.done = true;
              c.span.textContent = c.final;
              c.span.classList.remove('is-scrambling');
              c.span.classList.add('is-settled');
              return;
            }
            remaining++;
            if (swap) {
              c.span.textContent = SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
            }
          });

          if (remaining) {
            requestAnimationFrame(frame);
          } else {
            // Back to plain text: restores kerning between letters and lets
            // later resizes reflow normally
            setTimeout(() => {
              lines.forEach((line) => {
                line.textContent = line.dataset.text;
              });
              resolve();
            }, 450);
          }
        };
        requestAnimationFrame(frame);
      })
  );
}

// --- Rotating tagline phrase ---
function initRotator(reduceMotion, visibility) {
  const rotator = document.getElementById('hero-rotator');
  if (!rotator) return null;

  if (reduceMotion) {
    // Show the full sentence instead of a single phrase
    const tagline = rotator.closest('.hero__tagline');
    tagline.querySelector('.visually-hidden')?.classList.remove('visually-hidden');
    rotator.parentElement.hidden = true;
    return null;
  }

  const words = [...rotator.querySelectorAll('.hero__rotator-word')];
  const schedule = makeScheduler(visibility);
  let index = 0;

  const next = () => {
    words.forEach((w) => w.classList.remove('is-leaving'));
    words[index].classList.replace('is-active', 'is-leaving');
    index = (index + 1) % words.length;
    words[index].classList.add('is-active');
    schedule(next, 2800);
  };

  return { start: () => schedule(next, 2400) };
}

// --- Terminal card ---
function initTerminal(reduceMotion, visibility) {
  const terminal = document.getElementById('hero-terminal');
  const body = terminal?.querySelector('.hero-terminal__body');
  if (!body) return null;

  if (reduceMotion) {
    LOG_SCRIPT.slice(0, 7).forEach((entry) => body.appendChild(renderLine(entry, entry.text)));
    return null;
  }

  const schedule = makeScheduler(visibility);
  let step = 0;

  const append = (li) => {
    body.appendChild(li);
    while (body.children.length > MAX_LOG_LINES) body.firstElementChild.remove();
  };

  const typeCommand = (entry, done) => {
    const li = renderLine(entry, '');
    const out = li.querySelector('.hero-terminal__text');
    const caret = document.createElement('span');
    caret.className = 'hero-terminal__caret';
    li.appendChild(caret);
    append(li);

    let i = 0;
    const typeChar = () => {
      out.textContent = entry.text.slice(0, ++i);
      if (i < entry.text.length) {
        schedule(typeChar, 45 + Math.random() * 60);
      } else {
        schedule(() => {
          caret.remove();
          done();
        }, 500);
      }
    };
    schedule(typeChar, 400);
  };

  const run = () => {
    const entry = LOG_SCRIPT[step];
    step = (step + 1) % LOG_SCRIPT.length;

    if (entry.kind === 'cmd') {
      typeCommand(entry, () => schedule(run, 350));
    } else {
      append(renderLine(entry, entry.text));
      schedule(run, step === 0 ? 2600 : 700 + Math.random() * 600);
    }
  };

  return { start: run };
}

function renderLine(entry, text) {
  const li = document.createElement('li');
  li.className = `hero-terminal__line hero-terminal__line--${entry.kind}`;

  const time = new Date().toTimeString().slice(0, 8);
  const mark = { cmd: '$', ok: '✓', info: '→' }[entry.kind];

  li.innerHTML =
    entry.kind === 'cmd'
      ? `<span class="hero-terminal__time">${time}</span><span class="hero-terminal__mark">${mark}</span><span><span class="hero-terminal__text"></span></span>`
      : `<span class="hero-terminal__time">${time}</span><span class="hero-terminal__mark">${mark}</span><span><span class="hero-terminal__project">${entry.project}</span> <span class="hero-terminal__text"></span></span>`;

  li.querySelector('.hero-terminal__text').textContent = text;
  return li;
}

// --- Cursor: dot grid glow follows the pointer, terminal tilts toward it ---
function initPointerEffects(section) {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const grid = document.getElementById('hero-grid');
  const terminal = document.getElementById('hero-terminal');
  if (!canHover || !grid) return;

  const pos = { x: 78, y: 32 };
  const target = { ...pos };
  let animating = false;

  const step = () => {
    pos.x += (target.x - pos.x) * 0.12;
    pos.y += (target.y - pos.y) * 0.12;
    grid.style.setProperty('--mx', `${pos.x.toFixed(2)}%`);
    grid.style.setProperty('--my', `${pos.y.toFixed(2)}%`);

    if (Math.abs(target.x - pos.x) > 0.05 || Math.abs(target.y - pos.y) > 0.05) {
      requestAnimationFrame(step);
    } else {
      animating = false;
    }
  };

  section.addEventListener('pointermove', (e) => {
    const rect = section.getBoundingClientRect();
    target.x = ((e.clientX - rect.left) / rect.width) * 100;
    target.y = ((e.clientY - rect.top) / rect.height) * 100;

    // Entering: jump straight to the cursor so the glow doesn't slide in from
    // wherever it was last
    if (!grid.classList.contains('is-active')) {
      pos.x = target.x;
      pos.y = target.y;
      grid.classList.add('is-active');
    }

    if (!animating) {
      animating = true;
      requestAnimationFrame(step);
    }

    if (terminal) {
      const t = terminal.getBoundingClientRect();
      const dx = clamp((e.clientX - (t.left + t.width / 2)) / (rect.width / 2), -1, 1);
      const dy = clamp((e.clientY - (t.top + t.height / 2)) / (rect.height / 2), -1, 1);
      terminal.style.setProperty('--tilt-y', `${(dx * 6).toFixed(2)}deg`);
      terminal.style.setProperty('--tilt-x', `${(-dy * 5).toFixed(2)}deg`);
    }
  });

  section.addEventListener('pointerleave', () => {
    grid.classList.remove('is-active');
    terminal?.style.setProperty('--tilt-x', '0deg');
    terminal?.style.setProperty('--tilt-y', '0deg');
  });
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
