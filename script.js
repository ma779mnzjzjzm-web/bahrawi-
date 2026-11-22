
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let pieces = [];
let animationId = null;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function boom(count = 180) {
  const colors = ['#d4af37', '#f6e27a', '#ffffff', '#b8860b'];
  for (let i = 0; i < count; i++) {
    pieces.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight * .35,
      w: 5 + Math.random() * 7,
      h: 8 + Math.random() * 10,
      vx: -2.5 + Math.random() * 5,
      vy: 2 + Math.random() * 4,
      rotation: Math.random() * 6,
      spin: -.12 + Math.random() * .24,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
  if (!animationId) animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  pieces.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    p.vy += .025;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });
  pieces = pieces.filter(p => p.y < window.innerHeight + 30);
  if (pieces.length) {
    animationId = requestAnimationFrame(animateConfetti);
  } else {
    cancelAnimationFrame(animationId);
    animationId = null;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function observeReveals() {
  const elements = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('show'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach(el => observer.observe(el));
}

function enterSite() {
  const intro = document.getElementById('intro');
  const site = document.getElementById('site');
  intro.classList.add('leaving');
  intro.style.opacity = '0';
  window.setTimeout(() => {
    intro.classList.add('hidden');
    site.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'instant' });
    observeReveals();
    boom(190);
  }, 450);
}

document.getElementById('enterBtn').addEventListener('click', enterSite);
document.getElementById('boomBtn').addEventListener('click', () => boom(300));
document.getElementById('topBtn').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = percent + '%';
}, { passive: true });

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightbox = () => {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
};

document.querySelectorAll('.photo').forEach(photo => {
  photo.addEventListener('click', () => {
    const img = photo.querySelector('img');
    if (!img || !img.complete || img.naturalWidth === 0) return;
    lightboxImage.src = photo.dataset.full;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  });
});

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeLightbox();
});

document.querySelectorAll('.photo img').forEach(img => {
  img.addEventListener('error', () => {
    const parent = img.parentElement;
    parent.classList.add('missing');
    img.remove();
    const note = document.createElement('span');
    note.textContent = 'ضيف صورتك هنا';
    parent.appendChild(note);
  });
});

document.querySelectorAll('video').forEach(video => {
  video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach(other => {
      if (other !== video) other.pause();
    });
  });
});
