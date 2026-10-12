const EMAIL = 'k.chandra9845@gmail.com';

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Count-up numbers (runs once when they scroll into view)
const counters = document.querySelectorAll('[data-count]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    let n = 0;
    const step = Math.max(1, Math.round(target / 60));
    const timer = setInterval(() => {
      n = Math.min(n + step, target);
      el.textContent = n;
      if (n === target) clearInterval(timer);
    }, 25);
    observer.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(c => observer.observe(c));

/* ---------- Drag-to-explore video viewers ---------- */
function initVR(box) {
  const v = box.querySelector('video');
  const btn = box.querySelector('.vr-play');
  let dragging = false, startX = 0, startT = 0, pending = 0, raf = 0, userPaused = false;

  const setIcon = () => {
    btn.innerHTML = v.paused ? '&#9654;' : '&#10074;&#10074;';
    btn.setAttribute('aria-label', v.paused ? 'Play' : 'Pause');
  };
  const seekTo = t => {
    const d = v.duration || 1;
    pending = ((t % d) + d) % d;
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; v.currentTime = pending; });
  };
  const span = () => Math.min(v.duration || 10, 12);

  box.addEventListener('pointerdown', e => {
    if (e.target.closest('.vr-play')) return;
    dragging = true; startX = e.clientX; startT = v.currentTime; v.pause(); setIcon();
    box.classList.add('dragging'); box.setPointerCapture(e.pointerId);
  });
  box.addEventListener('pointermove', e => {
    if (!dragging) return;
    seekTo(startT + ((startX - e.clientX) / box.clientWidth) * span());
  });
  const end = () => { if (!dragging) return; dragging = false; box.classList.remove('dragging'); box.classList.add('touched'); };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
  box.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault(); v.pause(); setIcon();
      seekTo(v.currentTime + (e.key === 'ArrowRight' ? 0.5 : -0.5));
    }
  });
  btn.addEventListener('click', () => {
    if (v.paused) { userPaused = false; v.play().catch(() => {}); } else { userPaused = true; v.pause(); }
    setIcon();
  });
  v.addEventListener('play', setIcon);
  v.addEventListener('pause', setIcon);

  new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !userPaused && !dragging && !matchMedia('(prefers-reduced-motion: reduce)').matches) v.play().catch(() => {});
    else if (!en.isIntersecting) v.pause();
  }, { threshold: 0.4 }).observe(box);
}
document.querySelectorAll('.vr').forEach(initVR);

/* ---------- Room buttons: show pictures and videos for that room ---------- */
const VID = {
  walkthrough: { src: 'video/walkthrough.mp4', poster: 'img/vid-walkthrough.jpg', title: 'Full home walkthrough' },
  bedroom:     { src: 'video/bedroom.mp4',     poster: 'img/vid-bedroom.jpg',     title: 'Master bedroom', land: true },
  dining:      { src: 'video/dining.mp4',      poster: 'img/vid-dining.jpg',      title: 'Dining and crockery unit' },
  kitchen:     { src: 'video/kitchen.mp4',     poster: 'img/vid-kitchen.jpg',     title: 'Modular kitchen' }
};
const CATS = {
  bedroom:   { title: 'Bedroom',          videos: ['bedroom'], pics: ['bedroom.jpg', 'bed-6.jpg', 'bed-2.jpg', 'bed-10.jpg', 'walk-76.jpg'] },
  kitchen:   { title: 'Kitchen',          videos: ['kitchen'], pics: ['kitchen.jpg', 'kit-1.jpg', 'kit-4.jpg', 'kit-7.5.jpg', 'walk-112.jpg', 'walk-116.jpg'] },
  washroom:  { title: 'Washroom and vanity', videos: [], pics: ['vanity.jpg'], note: 'More washroom photos are being added. Call us to see recent washroom work.' },
  wardrobes: { title: 'Wardrobes',        videos: [], pics: ['wardrobe.jpg', 'walk-108.jpg', 'walk-88.jpg', 'bed-6.jpg'] },
  tv:        { title: 'TV cabinet',       videos: [], pics: ['living.jpg', 'hall.jpg', 'walk-80.jpg', 'bed-10.jpg'] },
  living:    { title: 'Living room',      videos: ['dining'], pics: ['living.jpg', 'hall.jpg', 'walk-48.jpg', 'walk-36.jpg', 'dining-1.jpg', 'dining-3.5.jpg', 'walk-64.jpg'] },
  office:    { title: 'Office interiors', videos: [], pics: [], note: 'We design and build offices across India. Photos of office projects are being added. Call us or send an enquiry to see recent office work.' },
  all:       { title: 'Everything in between', videos: ['walkthrough'], pics: ['walk-104.jpg', 'walk-96.jpg', 'walk-84.jpg', 'walk-44.jpg', 'walk-64.jpg', 'walk-108.jpg', 'dining-1.jpg', 'bed-2.jpg', 'kit-4.jpg'], note: 'Balconies, ceilings, partitions and the details in between.' }
};

const showcase = document.getElementById('showcase');
const showTitle = document.getElementById('showTitle');
const showNote = document.getElementById('showNote');
const showVideos = document.getElementById('showVideos');
const showGrid = document.getElementById('showGrid');

function openCat(key) {
  const c = CATS[key]; if (!c) return;
  showTitle.textContent = c.title;
  showNote.textContent = c.note || '';
  showNote.hidden = !c.note;
  showVideos.innerHTML = '';
  c.videos.forEach(k => {
    const d = VID[k];
    const f = document.createElement('figure');
    f.className = 'vr' + (d.land ? ' land' : '');
    f.tabIndex = 0;
    f.setAttribute('aria-label', d.title + ' - drag left or right to look around');
    f.innerHTML = '<video muted loop playsinline preload="metadata"></video><figcaption><strong></strong></figcaption>' +
      '<div class="vr-hint"><b>&#8596;</b> Drag to look around</div><button type="button" class="vr-play" aria-label="Pause">&#10074;&#10074;</button>';
    const vid = f.querySelector('video'); vid.poster = d.poster; vid.src = d.src;
    f.querySelector('strong').textContent = d.title;
    showVideos.appendChild(f); initVR(f);
  });
  showVideos.hidden = !c.videos.length;
  showGrid.innerHTML = '';
  c.pics.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pic';
    b.innerHTML = '<img loading="lazy" alt="' + c.title + '" src="img/' + p + '">';
    b.addEventListener('click', () => openLightbox('img/' + p, c.title));
    showGrid.appendChild(b);
  });
  if (!c.pics.length) {
    const call = document.createElement('a');
    call.className = 'btn'; call.href = 'tel:+919845731900'; call.textContent = 'Call +91 9845731900';
    showGrid.appendChild(call);
  }
  document.querySelectorAll('.chip').forEach(ch => ch.classList.toggle('active', ch.dataset.cat === key));
  showcase.hidden = false;
  showcase.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => openCat(ch.dataset.cat)));
document.querySelectorAll('.card[data-cat]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openCat(a.dataset.cat); }));
document.getElementById('showClose').addEventListener('click', () => {
  showcase.hidden = true;
  showVideos.innerHTML = '';
  document.querySelectorAll('.chip').forEach(ch => ch.classList.remove('active'));
  document.getElementById('top').scrollIntoView({ behavior: 'smooth' });
});

/* Tap a picture to see it full screen */
const lb = document.createElement('div');
lb.className = 'lightbox'; lb.hidden = true;
lb.innerHTML = '<button type="button" aria-label="Close">&times;</button><img alt="">';
document.body.appendChild(lb);
function openLightbox(src, alt) { lb.querySelector('img').src = src; lb.querySelector('img').alt = alt; lb.hidden = false; }
lb.addEventListener('click', () => { lb.hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.hidden = true; });

/* ---------- Enquiry form ---------- */
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
const help = document.getElementById('mailHelp');
let lastText = '';
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const city = document.getElementById('city').value.trim();
  const message = document.getElementById('message').value.trim();
  const subject = 'Interior enquiry from ' + name;
  const body = 'Name: ' + name + '\nPhone: ' + phone + '\nCity: ' + city + '\n\n' + message;
  lastText = 'To: ' + EMAIL + '\nSubject: ' + subject + '\n\n' + body;
  const q = 'to=' + encodeURIComponent(EMAIL) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  document.getElementById('gmailLink').href = 'https://mail.google.com/mail/?view=cm&fs=1&' + q;
  help.hidden = false;
  note.textContent = 'Your email is ready. Press Send in your email app. If it did not open, use the buttons below.';
  window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
});
document.getElementById('copyMsg').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(lastText); note.textContent = 'Copied. Paste it into an email to ' + EMAIL + '.'; }
  catch (err) {
    const t = document.createElement('textarea'); t.value = lastText; document.body.appendChild(t); t.select();
    document.execCommand('copy'); t.remove(); note.textContent = 'Copied. Paste it into an email to ' + EMAIL + '.';
  }
});
