// ---------- TOGGLE MENU MOBILE ----------
(function(){
  var toggleBtn = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  if(!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', function(){
    navLinks.classList.toggle('open');
  });

  // tutup menu kalau klik salah satu link (berguna untuk anchor di halaman yang sama)
  navLinks.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      navLinks.classList.remove('open');
    });
  });
})();

// ---------- LIGHTBOX GALLERY ----------
(function(){
  var lightbox = document.getElementById('lightbox');
  if(!lightbox) return;

  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var closeBtn = document.getElementById('lightboxClose');
  var cards = document.querySelectorAll('.g-card');

  function openLightbox(src, alt, caption){
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  cards.forEach(function(card){
    card.addEventListener('click', function(){
      var img = card.querySelector('img');
      openLightbox(card.dataset.full, img ? img.alt : '', card.dataset.caption || '');
    });
  });

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function(e){
    if(e.target === lightbox){ closeLightbox(); }
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && lightbox.classList.contains('open')){ closeLightbox(); }
  });
})();

// ---------- FORM KONTAK ----------
(function(){
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  if(!form) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var nama = form.nama.value.trim();
    var pesan = form.pesan.value.trim();

    if(!nama || !pesan){
      status.textContent = 'Nama dan pesan wajib diisi.';
      status.className = 'form-status error';
      return;
    }

    status.textContent = 'Mengirim...';
    status.className = 'form-status';

    fetch('/api/pesan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama: nama, pesan: pesan })
    })
    .then(function(res){
      if(!res.ok) throw new Error('Gagal mengirim');
      return res.json();
    })
    .then(function(){
      status.textContent = 'Pesan terkirim, terima kasih!';
      status.className = 'form-status success';
      form.reset();
    })
    .catch(function(){
      status.textContent = 'Gagal mengirim pesan. Coba lagi sebentar.';
      status.className = 'form-status error';
    });
  });
})();   