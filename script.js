document.addEventListener('DOMContentLoaded', () => {
  // =======================================================
  // 1. INISIALISASI LENIS SMOOTH SCROLL & GSAP SYNC
  // =======================================================
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  gsap.registerPlugin(ScrollTrigger);

  // =======================================================
  // 2. GSAP UNIVERSAL REVEAL ANIMATION (MENGHIDUPKAN SEMUA ELEMEN)
  // =======================================================
  // Elemen yang SUDAH terlihat begitu halaman dimuat (misal bagian
  // paling atas tiap page baru) dipisah dari elemen yang masih di
  // bawah layar. Kalau semuanya dipasrahkan ke ScrollTrigger, elemen
  // yang sudah kelihatan di layar dianggap "sudah terlewati" saat
  // ScrollTrigger.refresh() pertama kali jalan, jadi animasinya main
  // instan (kelewat cepat buat kelihatan) begitu ganti halaman.
  const reveals = document.querySelectorAll('.reveal');
  const viewportH = window.innerHeight;
  const aboveFold = [];
  const belowFold = [];

  reveals.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < viewportH) {
      aboveFold.push(el);
    } else {
      belowFold.push(el);
    }
  });

  // Elemen yang sudah kelihatan di layar saat load: mainkan begitu
  // halaman siap, dengan sedikit delay + stagger biar efek "timbul"
  // tetap terasa walau tanpa perlu scroll (mis. saat pindah halaman).
  if (aboveFold.length) {
    gsap.from(aboveFold, {
      y: 28,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.04,
      delay: 0.05,
      onComplete: function () { gsap.set(this.targets(), { clearProps: 'opacity,transform' }); }
    });
  }

  // Elemen di bawah layar: tetap pakai scroll-trigger seperti semula.
  belowFold.forEach(el => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      y: 28,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      onComplete: function () { gsap.set(el, { clearProps: 'opacity,transform' }); }
    });
  });

  // Posisi trigger di atas dihitung dari layout SAAT INI, tapi font Fraunces
  // (dipakai di heading .sec-head) masih di-load async dan bisa mengubah
  // tinggi/posisi heading setelah dia masuk. Kalau itu terjadi SETELAH
  // ScrollTrigger menghitung titik pemicu, titik itu jadi basi/salah dan
  // reveal-nya bisa macet (opacity nggak pernah balik ke 1). Refresh ulang
  // begitu font & semua asset (termasuk background PNG) selesai dimuat.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());

  // Parallax halus khusus untuk artwork Hero
  gsap.to('.hero-art', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
    y: 50,
    ease: 'none'
  });

  // =======================================================
  // 2b. HERO STAT COUNT-UP
  // =======================================================
  document.querySelectorAll('.stat-num[data-count]').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const numEl = el.querySelector('.num-val');
    if (!numEl) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.3,
          ease: 'power2.out',
          onUpdate: () => { numEl.textContent = Math.floor(obj.val); }
        });
      }
    });
  });

  // =======================================================
  // 2c. CUSTOM CURSOR
  // =======================================================
  const cursorDot = document.getElementById('cursorDot');
  const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (cursorDot && supportsFinePointer) {
    let cx = 0, cy = 0, dx = 0, dy = 0;

    window.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
      cursorDot.classList.add('active');
    });

    gsap.ticker.add(() => {
      dx += (cx - dx) * 0.18;
      dy += (cy - dy) * 0.18;
      cursorDot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    });

    const hoverables = document.querySelectorAll('a, button, .game-card, .client-card');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('hovered'));
    });
  } else if (cursorDot) {
    cursorDot.style.display = 'none';
  }

  // =======================================================
  // 2d. TILT EFFECT (GAME CARDS & CLIENT CARDS)
  // =======================================================
  if (supportsFinePointer) {
    document.querySelectorAll('.game-card, .client-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y / rect.height) - 0.5) * -6;
        const rotateY = ((x / rect.width) - 0.5) * 6;
        gsap.to(card, {
          rotateX,
          rotateY,
          transformPerspective: 600,
          duration: 0.4,
          ease: 'power2.out'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
      });
    });
  }

  // =======================================================
  // 3. SHOWCASE TIM LOGIKA
  // =======================================================
  const teamMembers = [
    {
      name: "Budi Santoso",
      role: "Lead Illustrator & Art Director",
      bio: "Mengatur arah visual, konsep karakter, dan menciptakan gaya seni khas studio.",
      img: "assets/member_0000s_0006_Layer3.png"
    },
    {
      name: "Risa Kartika",
      role: "Technical & Engine Director",
      bio: "Bertanggung jawab atas arsitektur performa, kestabilan engine, dan pipeline integrasi.",
      img: "assets/member_0000s_0005_Layer6.png"
    },
    {
      name: "Gatot Prasetyo",
      role: "Senior Game Designer",
      bio: "Menyusun skenario interaktif, core mechanics level, dan keseimbangan sistem gameplay.",
      img: "assets/member_0000s_0004_Layer7.png"
    },
    {
      name: "Dimas Arya",
      role: "Lead Gameplay Programmer",
      bio: "Menerjemahkan ide mekanisme kompleks ke dalam logika kode yang presisi dan responsif.",
      img: "assets/member_0000s_0003_Layer9.png"
    },
    {
      name: "Kevin Wijaya",
      role: "UI/UX & Product Designer",
      bio: "Memastikan antarmuka intuitif, konsisten, serta ramah bagi berbagai jenis pemain.",
      img: "assets/member_0000s_0002_Layer10.png"
    },
    {
      name: "Arif Hidayat",
      role: "3D & Motion Artist",
      bio: "Menghidupkan model karakter lewat rigging presisi dan simulasi animasi yang halus.",
      img: "assets/member_0000s_0001_Layer11.png"
    },
    {
      name: "Nadia Putri",
      role: "Sound & Music Composer",
      bio: "Menciptakan lanskap audio dan efek suara atmosferik untuk memperkuat pengalaman bermain.",
      img: "assets/member_0000s_0000_Layer12.png"
    }
  ];

  const rosterButtons = document.querySelectorAll('.roster-avatar');
  const featuredImg = document.getElementById('featuredImg');
  const featuredName = document.getElementById('featuredName');
  const featuredRole = document.getElementById('featuredRole');
  const featuredBio = document.getElementById('featuredBio');

  rosterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      rosterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const index = parseInt(btn.getAttribute('data-index'), 10);
      const data = teamMembers[index];

      gsap.to(featuredImg, {
        scale: 0.94,
        opacity: 0,
        duration: 0.15,
        onComplete: () => {
          featuredImg.src = data.img;
          featuredName.textContent = data.name;
          featuredRole.textContent = data.role;
          featuredBio.textContent = data.bio;

          gsap.to(featuredImg, { scale: 1, opacity: 1, duration: 0.25, ease: 'power2.out' });
        }
      });
    });
  });

  // =======================================================
  // 4. GAME CAROUSEL: AUTO-SCROLL & DRAG
  // =======================================================
  const track = document.getElementById('gameTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (track) {
    const getCardStep = () => {
      const firstCard = track.querySelector('.game-card');
      return firstCard ? firstCard.offsetWidth + 20 : 300;
    };

    const moveNext = () => {
      const step = getCardStep();
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 20) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: step, behavior: 'smooth' });
      }
    };

    const movePrev = () => {
      const step = getCardStep();
      if (track.scrollLeft <= 20) {
        track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: -step, behavior: 'smooth' });
      }
    };

    if (nextBtn) nextBtn.addEventListener('click', moveNext);
    if (prevBtn) prevBtn.addEventListener('click', movePrev);

    let timer = setInterval(moveNext, 3000);

    track.addEventListener('mouseenter', () => clearInterval(timer));
    track.addEventListener('mouseleave', () => {
      clearInterval(timer);
      timer = setInterval(moveNext, 3000);
    });

    let isDown = false;
    let startX = 0;
    let scrollLeftPos = 0;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeftPos = track.scrollLeft;
    });

    window.addEventListener('mouseup', () => { isDown = false; });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeftPos - walk;
    });
  }

  // =======================================================
  // 5. HAMBURGER OVERLAY MENU
  // =======================================================
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  const toggleOverlay = () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuToggle.classList.toggle('is-active', isOpen);
    if (isOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', toggleOverlay);

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuToggle.classList.remove('is-active');
        lenis.start();
      });
    });
  }

  // =======================================================
  // 5b. SMOOTH ANCHOR NAVIGATION (SINKRON DENGAN LENIS)
  // Tanpa ini, klik link "#section" memakai native browser
  // scroll yang bentrok dengan Lenis (Lenis "menariknya" balik
  // di frame berikutnya) sehingga scroll ke atas terasa cuma
  // bergerak sedikit. scroll-behavior:smooth di CSS tetap
  // dipertahankan sebagai fallback, hanya klik link internal
  // di sini yang dialihkan lewat lenis.scrollTo agar konsisten.
  // =======================================================
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  const rootEl = document.documentElement;

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetEl = document.querySelector(link.getAttribute('href'));
      if (!targetEl) return;

      e.preventDefault();

      if (mobileMenu && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        menuToggle.classList.remove('is-active');
      }

      const navH = parseFloat(
        getComputedStyle(rootEl).getPropertyValue('--nav-h')
      ) || 68;

      if (typeof lenis.scrollTo !== 'function') {
        // Fallback kalau versi Lenis tidak punya scrollTo
        window.scrollTo({
          top: targetEl.getBoundingClientRect().top + window.scrollY - navH,
          behavior: 'smooth'
        });
        return;
      }

      // Matikan sementara native smooth-scroll biar tidak ikut
      // "menyentak" berbarengan dengan animasi Lenis, lalu
      // kembalikan lagi setelah animasinya selesai.
      const prevBehavior = rootEl.style.scrollBehavior;
      rootEl.style.scrollBehavior = 'auto';

      lenis.scrollTo(targetEl, {
        offset: -navH,
        duration: 1.4,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        onComplete: () => {
          rootEl.style.scrollBehavior = prevBehavior;
        }
      });
    });
  });

  // =======================================================
  // 6. CONTACT DRAWER (SLIDE-IN DARI KANAN)
  // =======================================================
  const contactDrawer = document.getElementById('contactDrawer');
  const contactOverlay = document.getElementById('contactOverlay');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const contactTriggers = document.querySelectorAll('.open-contact-trigger');

  const openDrawer = () => {
    contactDrawer.classList.add('open');
    contactOverlay.classList.add('active');
    contactDrawer.setAttribute('aria-hidden', 'false');
    lenis.stop(); // Hentikan scroll background
  };

  const closeDrawer = () => {
    contactDrawer.classList.remove('open');
    contactOverlay.classList.remove('active');
    contactDrawer.setAttribute('aria-hidden', 'true');
    lenis.start(); // Aktifkan kembali scroll
  };

  contactTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Tutup menu mobile jika sedang terbuka
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        toggleOverlay();
      }
      openDrawer();
    });
  });

  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (contactOverlay) contactOverlay.addEventListener('click', closeDrawer);

  // Tutup drawer dengan tombol ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // =======================================================
  // 7. BACK TO TOP BUTTON
  // =======================================================
  const backToTopBtn = document.getElementById('backToTop');

  if (backToTopBtn) {
    const showThreshold = () => window.innerHeight * 0.6;

    const toggleBackToTop = () => {
      if (window.scrollY > showThreshold()) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    };

    // Native scroll listener: Lenis (default, tanpa custom wrapper)
    // tetap menyinkronkan window.scrollY, jadi ini aman dipakai.
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTopBtn.addEventListener('click', () => {
      if (typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(0, {
          duration: 1.4,
          easing: (t) => 1 - Math.pow(1 - t, 3)
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
});