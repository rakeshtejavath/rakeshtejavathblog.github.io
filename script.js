/* ===== Helpers ===== */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ===== 1. Dark / light mode toggle (remembered between visits) ===== */
const root = document.documentElement;
const themeBtn = $('#themeToggle');
try { const saved = localStorage.getItem('theme'); if (saved) root.dataset.theme = saved; } catch (e) {}
const syncThemeIcon = () => { themeBtn.textContent = root.dataset.theme === 'dark' ? '🌙' : '☀️'; };
syncThemeIcon();
themeBtn.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  syncThemeIcon();
});

/* ===== 2. Mobile menu ===== */
const hamburger = $('#hamburger');
const navLinks = $('#navLinks');
const setMenu = open => {
  navLinks.classList.toggle('open', open);
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
};
hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
// Close the menu after tapping a link (smooth scrolling itself is handled by CSS scroll-behavior)
$$('a[href^="#"]').forEach(a => a.addEventListener('click', () => setMenu(false)));

/* ===== 3. Typing animation ===== */
const roles = ['Full-Stack Developer', 'UI Designer', 'Problem Solver', 'Open-Source Contributor'];
const typingEl = $('#typing');
let roleIdx = 0, charIdx = 0, deleting = false;
function type() {
  const word = roles[roleIdx];
  charIdx += deleting ? -1 : 1;
  typingEl.textContent = word.slice(0, charIdx);
  let delay = deleting ? 45 : 95;
  if (!deleting && charIdx === word.length) { deleting = true; delay = 1400; }   // pause at full word
  else if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 400; }
  setTimeout(type, delay);
}
type();

/* ===== 4. Scroll progress, scroll-to-top button ===== */
const progress = $('#progress');
const toTop = $('#toTop');
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  toTop.classList.toggle('visible', scrollY > 500);
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== 5. Fade-in on scroll (Intersection Observer) ===== */
const revealObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    const fill = $('.fill', e.target);                       // animate skill bar when its card appears
    if (fill) fill.style.width = fill.dataset.level + '%';
    obs.unobserve(e.target);
  });
}, { threshold: 0.15 });
$$('.reveal').forEach(el => revealObs.observe(el));

/* ===== 6. Count-up numbers in About ===== */
const countObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count, start = performance.now();
    const step = now => {
      const t = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(target * t) + (t === 1 ? '+' : '');
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    obs.unobserve(el);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach(el => countObs.observe(el));

/* ===== 7. Active navigation highlighting ===== */
const sections = $$('main section[id]');
const navMap = Object.fromEntries($$('.nav-link').map(a => [a.getAttribute('href').slice(1), a]));
const spyObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    $$('.nav-link').forEach(l => l.classList.remove('active'));
    navMap[e.target.id]?.classList.add('active');
  });
}, { rootMargin: '-45% 0px -50% 0px' });                      // fires when a section crosses mid-screen
sections.forEach(s => spyObs.observe(s));

/* ===== 8. Project filtering ===== */
const filterBtns = $$('.filter');
const projects = $$('.project');
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.filter;
  projects.forEach(p => {
    const match = f === 'all' || p.dataset.category === f;
    p.classList.toggle('hide', !match);
    p.classList.remove('show');
    if (match) { void p.offsetWidth; p.classList.add('show'); } // restart pop animation
  });
}));
// Make sure project cards are visible even though they're not .reveal
projects.forEach(p => p.classList.add('show'));

/* ===== 9. Contact form validation ===== */
const form = $('#contactForm');
const status = $('#formStatus');
const rules = {
  name:    v => v.trim().length >= 2 ? '' : 'Enter your name (at least 2 characters).',
  email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address.',
  subject: v => v.trim().length >= 3 ? '' : 'Enter a subject (at least 3 characters).',
  message: v => v.trim().length >= 10 ? '' : 'Write a message of at least 10 characters.'
};
function check(input) {
  const msg = rules[input.name](input.value);
  const field = input.closest('.field');
  field.classList.toggle('invalid', !!msg);
  $('.error', field).textContent = msg;
  return !msg;
}
$$('input, textarea', form).forEach(i => {
  i.addEventListener('blur', () => check(i));
  i.addEventListener('input', () => i.closest('.field').classList.contains('invalid') && check(i));
});
form.addEventListener('submit', e => {
  e.preventDefault();
  status.textContent = '';
  const ok = $$('input, textarea', form).map(check).every(Boolean);
  if (!ok) { $('.invalid input, .invalid textarea', form)?.focus(); return; }
  // No backend: connect this to a service (e.g. Formspree) or a mailto link when you deploy.
  status.textContent = 'Thanks! Your message is ready to send once a form service is connected.';
  form.reset();
});

/* ===== 10. Footer year ===== */
$('#year').textContent = new Date().getFullYear();