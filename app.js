const navToggle = document.querySelector('#navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
 
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});
    // Build animated film‑strip holes
    function buildStrip(id) {
        const el = document.getElementById(id);
        if (!el) return;
        let h = '';
        for (let i = 0; i < 80; i++) h += '<span class="hole"></span>';
        el.innerHTML = h + h; // duplicate for seamless loop
    }
    buildStrip('strip1');
    buildStrip('strip2');

    // Sticky nav on scroll
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
    // Africa/Harare = UTC+2, no DST
    const CAT_OFFSET_MS = 2 * 60 * 60 * 1000;
 
    function getCATTime() {
      const nowUTC = Date.now();
      return new Date(nowUTC + CAT_OFFSET_MS);
    }
 
    function getScreeningTarget() {
      const cat = getCATTime();
      const day = cat.getUTCDay();   // 0=Sun, 5=Fri
      const h   = cat.getUTCHours();
      const m   = cat.getUTCMinutes();
 
      // Screening window: Friday 18:30–21:00 CAT
      const afterStart = h > 18 || (h === 18 && m >= 30);
      const beforeEnd  = h < 21;
 
      if (day === 5 && afterStart && beforeEnd) {
        return { state: 'screening' };
      }
 
      // Days until next Friday
      let daysToAdd;
      if (day === 5 && !afterStart) {
        daysToAdd = 0; // This Friday, not yet started
      } else if (day === 5 && !beforeEnd) {
        daysToAdd = 7; // Past screening
      } else {
        daysToAdd = (5 - day + 7) % 7 || 7;
      }
 
      // Target = midnight CAT of today + daysToAdd + 18:30
      // 18:30 CAT = 16:30 UTC
      const midnightCAT = new Date(cat);
      midnightCAT.setUTCHours(0, 0, 0, 0);
      const targetUTC = midnightCAT.getTime() + daysToAdd * 86400000 + 16 * 3600000 + 30 * 60000;
 
      return { state: 'countdown', targetUTC };
    }
 
    function formatDate(targetUTC) {
      // Display target date in CAT
      const d = new Date(targetUTC - CAT_OFFSET_MS); // back to real UTC for display
      const target = new Date(targetUTC);
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
      const catDate = new Date(targetUTC);
      return catDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
    }
 
    function pad(n) {
      return String(n).padStart(2, '0');
    }
 
    const countdownEl  = document.getElementById('countdown-state');
    const screeningEl  = document.getElementById('screening-state');
    const dateEl       = document.getElementById('screening-date');
    const daysEl       = document.getElementById('days');
    const hoursEl      = document.getElementById('hours');
    const minutesEl    = document.getElementById('minutes');
    const secondsEl    = document.getElementById('seconds');
 
    function tick() {
      const result = getScreeningTarget();
 
      if (result.state === 'screening') {
        countdownEl.style.display = 'none';
        screeningEl.style.display = 'flex';
        return;
      }
 
      countdownEl.style.display = 'block';
      screeningEl.style.display = 'none';
 
      const now  = Date.now();
      const diff = result.targetUTC - now;
 
      if (diff <= 0) return;
 
      const totalSec = Math.floor(diff / 1000);
      const s = totalSec % 60;
      const totalMin = Math.floor(totalSec / 60);
      const min = totalMin % 60;
      const totalHr = Math.floor(totalMin / 60);
      const hr = totalHr % 24;
      const days = Math.floor(totalHr / 24);
 
      daysEl.textContent    = pad(days);
      hoursEl.textContent   = pad(hr);
      minutesEl.textContent = pad(min);
      secondsEl.textContent = pad(s);
      dateEl.textContent    = formatDate(result.targetUTC);
    }
 
    tick();
    setInterval(tick, 1000);


           const INITIAL_COUNT = 9;
 
    const masonry     = document.getElementById('masonry');
    const galleryState = document.getElementById('gallery-state');
    const galleryCount = document.getElementById('gallery-count');
    const btn          = document.getElementById('btn-show-more');
    const modal        = document.getElementById('modal');
    const modalImg     = document.getElementById('modal-img');
    const modalVideo   = document.getElementById('modal-video');
    const modalCounter = document.getElementById('modal-counter');
 
    let allItems   = [];
    let currentIndex = 0;
    let expanded   = false;
 
    // ── FETCH FROM NETLIFY FUNCTION ──
    async function loadGallery() {
      try {
        const res = await fetch('/get-gallery');
        if (!res.ok) throw new Error('Failed to load gallery');
        const files = await res.json();
 
        galleryState.remove();
 
        if (!files.length) {
          masonry.innerHTML = '<div class="gallery-state">No media yet.</div>';
          return;
        }
 
        galleryCount.textContent = `${files.length} moments`;
 
        files.forEach((file, i) => {
          const item = buildItem(file, i);
          masonry.appendChild(item);
          allItems.push(item);
        });
 
        if (files.length > INITIAL_COUNT) {
          hideExtras();
          btn.classList.remove('hidden');
        }
 
        bindModalClicks();
 
      } catch (err) {
        galleryState.textContent = 'Could not load gallery. Try again later.';
      }
    }
 
    // ── BUILD EACH ITEM ──
    function buildItem(file, index) {
      const div = document.createElement('div');
      div.className = 'masonry-item';
      div.dataset.type = file.type;
      div.dataset.index = index;
 
      if (file.type === 'video') {
        const video = document.createElement('video');
        video.src = file.url;
        video.muted = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('preload', 'metadata');
 
        const icon = document.createElement('div');
        icon.className = 'play-icon';
        icon.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>`;
 
        div.appendChild(video);
        div.appendChild(icon);
      } else {
        const img = document.createElement('img');
        img.src = file.url;
        img.alt = file.name || `Gallery image ${index + 1}`;
        div.appendChild(img);
      }
 
      return div;
    }
 
    // ── SHOW / HIDE ──
    function hideExtras() {
      allItems.forEach((item, i) => {
        if (i >= INITIAL_COUNT) item.classList.add('hidden');
      });
    }
 
    function getVisibleItems() {
      return allItems.filter(i => !i.classList.contains('hidden'));
    }
 
    btn.addEventListener('click', () => {
      expanded = !expanded;
 
      if (expanded) {
        allItems.forEach(item => item.classList.remove('hidden'));
        btn.textContent = 'Show Less';
      } else {
        hideExtras();
        btn.textContent = 'Show All';
        document.querySelector('.gallery').scrollIntoView({ behavior: 'smooth' });
      }
    });
 
    // ── MODAL ──
    function bindModalClicks() {
      allItems.forEach(item => {
        item.addEventListener('click', () => {
          const visible = getVisibleItems();
          currentIndex = visible.indexOf(item);
          openModal(currentIndex);
        });
      });
    }
 
    function openModal(index) {
      const visible = getVisibleItems();
      const item = visible[index];
      const type = item.dataset.type;
 
      modalImg.style.display = 'none';
      modalVideo.style.display = 'none';
      modalVideo.pause();
 
      if (type === 'video') {
        modalVideo.src = item.querySelector('video').src;
        modalVideo.style.display = 'block';
      } else {
        modalImg.src = item.querySelector('img').src;
        modalImg.style.display = 'block';
      }
 
      modalCounter.textContent = `${index + 1} / ${visible.length}`;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
 
    function closeModal() {
      modal.classList.remove('active');
      modalVideo.pause();
      document.body.style.overflow = '';
    }
 
    document.getElementById('modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
 
    document.getElementById('modal-prev').addEventListener('click', () => {
      const visible = getVisibleItems();
      currentIndex = (currentIndex - 1 + visible.length) % visible.length;
      openModal(currentIndex);
    });
 
    document.getElementById('modal-next').addEventListener('click', () => {
      const visible = getVisibleItems();
      currentIndex = (currentIndex + 1) % visible.length;
      openModal(currentIndex);
    });
 
    document.addEventListener('keydown', e => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'ArrowLeft')  document.getElementById('modal-prev').click();
      if (e.key === 'ArrowRight') document.getElementById('modal-next').click();
      if (e.key === 'Escape')     closeModal();
    });
 
    loadGallery();

  document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
 
        // Close all
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
 
        // Open clicked if it wasn't already open
        if (!isOpen) item.classList.add('open');
      });
    });


    // ── GSAP ANIMATIONS ──
gsap.registerPlugin(ScrollTrigger);

// NAV
gsap.from('#nav', {
  y: -80, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.1
});

// HERO
gsap.from('.hero-title', {
  y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.4
});
gsap.from('.hero-tagline', {
  y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.85
});
gsap.from('.hero .btn', {
  y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 1.05
});

// COUNTDOWN
gsap.from('.countdown-label, .countdown-date', {
  y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
  scrollTrigger: { trigger: '.countdown-section', start: 'top 85%' }
});
gsap.from('.countdown-unit', {
  y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
  scrollTrigger: { trigger: '.countdown-units', start: 'top 85%' }
});

// ABOUT
gsap.from('.about-title', {
  x: -50, opacity: 0, duration: 0.9, ease: 'power3.out',
  scrollTrigger: { trigger: '.about-header', start: 'top 85%' }
});
gsap.from('.about-text p', {
  y: 30, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out',
  scrollTrigger: { trigger: '.about-text', start: 'top 85%' }
});
gsap.from('.about-checklist', {
  x: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
  scrollTrigger: { trigger: '.about-checklist', start: 'top 85%' }
});

// VENUE
gsap.from('.venue-header', {
  y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
  scrollTrigger: { trigger: '.venue-section', start: 'top 85%' }
});
gsap.from('.bento-cell', {
  y: 50, opacity: 0, scale: 0.96, duration: 0.7, stagger: 0.1, ease: 'power2.out',
  scrollTrigger: { trigger: '.bento', start: 'top 85%' }
});

// GALLERY
gsap.from('#coming-soon .section-header', {
  y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
  scrollTrigger: { trigger: '#coming-soon', start: 'top 85%' }
});

// FAQ
gsap.from('.faq-label, .faq-title', {
  y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
  scrollTrigger: { trigger: '.faq', start: 'top 85%' }
});
gsap.from('.faq-item', {
  y: 25, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
  scrollTrigger: { trigger: '.faq-list', start: 'top 85%' }
});

// CONTACT
gsap.from('.contact-left', {
  x: -50, opacity: 0, duration: 0.9, ease: 'power3.out',
  scrollTrigger: { trigger: '.contact', start: 'top 80%' }
});
gsap.from('.contact-right', {
  x: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
  scrollTrigger: { trigger: '.contact', start: 'top 80%' }
});

// FOOTER
gsap.from('.footer-brand, .footer-tagline, .footer-socials', {
  y: 30, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out',
  scrollTrigger: { trigger: 'footer', start: 'top 90%' }
});

const form = document.getElementById('reservation-form');
const success = document.getElementById('form-success');

form.addEventListener('submit', async (e) => {
  e.preventDefault();


  const data = new FormData(form);

  const res = await fetch('/submit', {
    method: 'POST',
    body: data
  });

  const result = await res.json();

  if (result.success) {
    form.style.display = 'none';
    success.style.display = 'block';
  } else {
    alert('Something went wrong. Please try again.');
  }
});