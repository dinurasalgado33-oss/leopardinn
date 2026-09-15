(function(){
  // Leopard Inn WhatsApp numbers (Sri Lanka)
  // Wilpattu   +94 74 055 9024  — also the fallback when the guest hasn't picked a branch
  // Arugam Bay +94 74 055 9044
  var WHATSAPP_NUMBERS = {
    'Wilpattu': '94740559024',
    'Arugam Bay': '94740559044'
  };
  var WHATSAPP_NUMBER = WHATSAPP_NUMBERS['Wilpattu'];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav state + progress ---------- */
  var nav = document.getElementById('siteNav');
  var progressBar = document.getElementById('progressBar');
  function onScroll(){
    var scrollY = window.scrollY || window.pageYOffset;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docH > 0 ? (scrollY / docH) * 100 : 0) + '%';
    nav.classList.toggle('nav-solid', scrollY > 60);
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMenu(){
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded','false');
  }
  burger.addEventListener('click', function(){
    var open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileMenu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closeMenu);
  });
  document.getElementById('mmClose').addEventListener('click', closeMenu);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- hero parallax ---------- */
  var heroMedia = document.getElementById('heroMedia');
  var hero = document.querySelector('.hero');
  if (!reduceMotion && heroMedia && hero) {
    var heroSettled = false;
    setTimeout(function(){ heroSettled = true; }, 2300);
    document.addEventListener('scroll', function(){
      if (!heroSettled) return;
      var rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        heroMedia.style.transform = 'translateY(' + (window.scrollY * 0.28) + 'px)';
      }
    }, { passive:true });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.15, rootMargin:'0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });

    // Safety net. A fast scroll (wheel burst, dragged scrollbar, End key) or a
    // scroll position restored on reload can carry an element past the observer
    // between samples, leaving it stuck at opacity 0 for good. Sweep on the same
    // trigger line the observer uses, so timing is unchanged when both agree.
    var sweepQueued = false;
    function sweep(){
      sweepQueued = false;
      var pending = 0;
      revealEls.forEach(function(el){
        if (el.classList.contains('in-view')) return;
        if (el.getBoundingClientRect().top < window.innerHeight - 60) {
          el.classList.add('in-view');
          io.unobserve(el);
        } else { pending++; }
      });
      if (!pending) document.removeEventListener('scroll', queueSweep);
    }
    function queueSweep(){
      if (sweepQueued) return;
      sweepQueued = true;
      requestAnimationFrame(sweep);
    }
    document.addEventListener('scroll', queueSweep, { passive:true });
    window.addEventListener('load', queueSweep);
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ---------- scrollspy ---------- */
  var navLinks = document.querySelectorAll('[data-nav]');
  var sections = Array.prototype.map.call(navLinks, function(a){
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);
  document.addEventListener('scroll', function(){
    var pos = window.scrollY + window.innerHeight * 0.35;
    var current = null;
    sections.forEach(function(sec){ if (sec.offsetTop <= pos) current = sec; });
    navLinks.forEach(function(a){
      a.classList.toggle('active', document.querySelector(a.getAttribute('href')) === current);
    });
  }, { passive:true });

  /* ---------- pinned horizontal gallery (desktop) ---------- */
  if (document.getElementById('hscroll') && document.getElementById('stripTrack')) {
  var hs = document.getElementById('hscroll');
  var hsTrack = document.getElementById('stripTrack');
  var hsBar = document.getElementById('hscrollBar');
  var pinned = false;
  var hsDist = 0;

  function hsDistance(){
    return Math.max(0, hsTrack.scrollWidth - window.innerWidth + 60);
  }
  function setupPin(){
    var shouldPin = window.innerWidth > 900 && !reduceMotion;
    if (shouldPin !== pinned) {
      if (!shouldPin) { hsTrack.style.transform = ''; hs.style.height = ''; }
    }
    pinned = shouldPin;
    if (!pinned) { hs.style.height = ''; hsTrack.style.transform = ''; return; }
    hsDist = hsDistance();
    hs.style.height = (window.innerHeight + hsDist) + 'px';
    updatePin();
  }
  function updatePin(){
    if (!pinned) return;
    var total = hs.offsetHeight - window.innerHeight;
    var p = total > 0 ? Math.min(1, Math.max(0, -hs.getBoundingClientRect().top / total)) : 0;
    hsTrack.style.transform = 'translateX(' + (-p * hsDist) + 'px)';
    if (hsBar) hsBar.style.width = (p * 100) + '%';
  }
  document.addEventListener('scroll', updatePin, { passive:true });
  window.addEventListener('resize', setupPin);
  window.addEventListener('load', setupPin);
  setupPin();
  }

  /* ---------- gallery: arrows + drag to scroll ---------- */
  if (document.getElementById('stripTrack') && document.getElementById('stripNext')) {
  var track = document.getElementById('stripTrack');
  document.getElementById('stripNext').addEventListener('click', function(){
    track.scrollBy({ left: track.clientWidth * 0.7, behavior:'smooth' });
  });
  document.getElementById('stripPrev').addEventListener('click', function(){
    track.scrollBy({ left: -track.clientWidth * 0.7, behavior:'smooth' });
  });
  var isDown = false, startX = 0, startScroll = 0, moved = 0;
  track.addEventListener('pointerdown', function(e){
    if (pinned) return;
    isDown = true; moved = 0;
    startX = e.clientX; startScroll = track.scrollLeft;
    track.classList.add('dragging');
  });
  window.addEventListener('pointermove', function(e){
    if (!isDown) return;
    var dx = e.clientX - startX;
    moved = Math.abs(dx);
    track.scrollLeft = startScroll - dx;
  });
  window.addEventListener('pointerup', function(){
    if (!isDown) return;
    isDown = false;
    track.classList.remove('dragging');
  });
  }

  /* ---------- lightbox ---------- */
  var lbImages = Array.prototype.slice.call(document.querySelectorAll('[data-lb]'));
  var lightbox = document.getElementById('lightbox');
  var lbImage = document.getElementById('lbImage');
  var lbCounter = document.getElementById('lbCounter');
  var lbIndex = 0;

  function openLb(i){
    lbIndex = (i + lbImages.length) % lbImages.length;
    lbImage.classList.remove('zoomed');
    lbImage.src = lbImages[lbIndex].src;
    lbImage.alt = lbImages[lbIndex].alt;
    lbCounter.textContent = (lbIndex + 1) + ' / ' + lbImages.length;
    lightbox.classList.add('open');
    document.body.classList.add('lightbox-open');
  }
  function closeLb(){
    lightbox.classList.remove('open');
    document.body.classList.remove('lightbox-open');
  }
  lbImages.forEach(function(img, i){
    img.addEventListener('click', function(){
      if (moved > 6) return;
      openLb(i);
    });
  });
  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbNext').addEventListener('click', function(e){ e.stopPropagation(); openLb(lbIndex + 1); });
  document.getElementById('lbPrev').addEventListener('click', function(e){ e.stopPropagation(); openLb(lbIndex - 1); });
  lightbox.addEventListener('click', function(e){ if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', function(e){
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') openLb(lbIndex + 1);
    if (e.key === 'ArrowLeft') openLb(lbIndex - 1);
  });

  /* ---------- hero cursor spotlight ---------- */
  var heroGlow = document.getElementById('heroGlow');
  if (!reduceMotion && hero && heroGlow && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('pointermove', function(e){
      var r = hero.getBoundingClientRect();
      heroGlow.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      heroGlow.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  /* ---------- 3D tilt cards ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function(card){
      card.addEventListener('pointermove', function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = 'transform .12s linear';
        card.style.transform =
          'rotateY(' + (px * 7).toFixed(2) + 'deg) rotateX(' + (-py * 7).toFixed(2) + 'deg) translateZ(6px)';
      });
      card.addEventListener('pointerleave', function(){
        card.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1)';
        card.style.transform = '';
      });
    });
  }

  /* ---------- lightbox zoom on click ---------- */
  lbImage.addEventListener('click', function(e){
    e.stopPropagation();
    this.classList.toggle('zoomed');
  });

  /* ---------- enquiry builder ---------- */
  if (document.getElementById('enquirePreview')) {
  var state = { branch:'Arugam Bay', checkin:'', checkout:'', guests:2, extras:[] };
  var preview = document.getElementById('enquirePreview');

  function prettyDate(v){
    if (!v) return null;
    var d = new Date(v + 'T00:00:00');
    if (isNaN(d)) return null;
    return d.toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' });
  }
  function buildMessage(){
    var msg = 'Hi Leopard Inn! I\'d like to check availability at ' + state.branch + '.';
    var ci = prettyDate(state.checkin), co = prettyDate(state.checkout);
    if (ci && co) msg += '\nDates: ' + ci + ' → ' + co;
    else if (ci) msg += '\nFrom: ' + ci;
    msg += '\nGuests: ' + state.guests;
    if (state.extras.length) msg += '\nAlso interested in: ' + state.extras.join(', ');
    return msg;
  }
  function renderPreview(){
    preview.innerHTML = buildMessage()
      .split('\n')
      .map(function(line, i){ return i === 0 ? '<strong>' + line + '</strong>' : line; })
      .join('<br>');
  }

  document.getElementById('branchChips').addEventListener('click', function(e){
    var chip = e.target.closest('.chip');
    if (!chip) return;
    this.querySelectorAll('.chip').forEach(function(c){ c.classList.remove('selected'); });
    chip.classList.add('selected');
    state.branch = chip.dataset.branch;
    renderPreview();
  });
  document.getElementById('extraChips').addEventListener('click', function(e){
    var chip = e.target.closest('.chip');
    if (!chip) return;
    chip.classList.toggle('selected');
    var val = chip.dataset.extra;
    var idx = state.extras.indexOf(val);
    if (idx > -1) state.extras.splice(idx, 1); else state.extras.push(val);
    renderPreview();
  });
  document.getElementById('checkin').addEventListener('change', function(){
    state.checkin = this.value;
    var co = document.getElementById('checkout');
    co.min = this.value;
    if (co.value && co.value < this.value) { co.value = ''; state.checkout = ''; }
    renderPreview();
  });
  document.getElementById('checkout').addEventListener('change', function(){
    state.checkout = this.value; renderPreview();
  });
  document.getElementById('guestPlus').addEventListener('click', function(){
    if (state.guests < 12) state.guests++;
    document.getElementById('guestCount').textContent = state.guests;
    renderPreview();
  });
  document.getElementById('guestMinus').addEventListener('click', function(){
    if (state.guests > 1) state.guests--;
    document.getElementById('guestCount').textContent = state.guests;
    renderPreview();
  });
  document.getElementById('enquireSend').addEventListener('click', function(){
    // Route to the branch the guest picked; "not sure yet" falls back to the default line.
    var number = WHATSAPP_NUMBERS[state.branch] || WHATSAPP_NUMBER;
    window.open('https://wa.me/' + number + '?text=' + encodeURIComponent(buildMessage()), '_blank');
  });

  // today as min date
  var todayStr = new Date().toISOString().split('T')[0];
  document.getElementById('checkin').min = todayStr;
  document.getElementById('checkout').min = todayStr;
  renderPreview();

  // jump-to-enquiry buttons
  function jumpToEnquiry(branch){
    if (branch) {
      var chips = document.getElementById('branchChips');
      var target = chips.querySelector('[data-branch="' + branch + '"]');
      if (target) {
        chips.querySelectorAll('.chip').forEach(function(c){ c.classList.remove('selected'); });
        target.classList.add('selected');
        state.branch = branch;
        renderPreview();
      }
    }
    document.getElementById('enquire').scrollIntoView({ behavior:'smooth' });
  }
  document.querySelectorAll('[data-enquire-branch]').forEach(function(btn){
    btn.addEventListener('click', function(){ jumpToEnquiry(this.dataset.enquireBranch); });
  });
  document.getElementById('navCta').addEventListener('click', function(){ jumpToEnquiry(null); });
  }
})();
