/**
 * ==============================================================================
 * NIRAJ — MINIMAL 3-SECTION VERTICAL SCROLL-SNAP PORTFOLIO
 * Features:
 * - 3D Mouse Parallax on 'NIRAJ' Hero Title (smooth lerp interpolation)
 * - Scroll-Snap Synchronization (Navbar links & right vertical indicator dots)
 * - Mobile Touch/Tap Support for Overlapping Creator Cards
 * - Seamless Video Loop / Graceful Fallback Handling
 * ==============================================================================
 */

(function () {
  'use strict';

  // Cached DOM Elements
  const scrollContainer = document.getElementById('scrollContainer');
  const sections = document.querySelectorAll('.snap-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const dotButtons = document.querySelectorAll('.dot-btn');
  const hero3dWrapper = document.getElementById('hero3dWrapper');
  const heroTitle = document.getElementById('heroTitle');
  const creatorCards = document.querySelectorAll('.creator-card');

  /* ----------------------------------------------------------------------------
     1. 3D MOUSE PARALLAX ON HERO TITLE (Desktop Only via pointer: fine)
     ---------------------------------------------------------------------------- */
  let mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  };

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;
  const pointerFineQuery = window.matchMedia('(pointer: fine)');
  let parallaxRafId = null;

  function onMouseMove(e) {
    mouse.targetX = (e.clientX - windowHalfX) / windowHalfX;
    mouse.targetY = (e.clientY - windowHalfY) / windowHalfY;
  }

  // Smooth lerp loop with requestAnimationFrame (runs strictly on Desktop PC)
  function render3dParallax() {
    if (!pointerFineQuery.matches) return;

    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    if (hero3dWrapper) {
      const rotX = -mouse.y * 18; // Max 18 deg tilt on X
      const rotY = mouse.x * 22;  // Max 22 deg tilt on Y
      const transZ = 20;

      hero3dWrapper.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${transZ}px)`;

      // Dynamic deep blood-red rim light & distressed shadow shift on The Batman title
      if (heroTitle) {
        const shadowX = -mouse.x * 20;
        const shadowY = -mouse.y * 20 + 15;
        heroTitle.style.filter = `drop-shadow(${shadowX}px ${shadowY}px 35px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 50px rgba(229, 9, 20, 0.55))`;
      }
    }

    parallaxRafId = requestAnimationFrame(render3dParallax);
  }

  function setupParallax() {
    if (pointerFineQuery.matches) {
      // Desktop PC: Enable smooth 3D mouse parallax
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      if (!parallaxRafId) {
        render3dParallax();
      }
    } else {
      // Touchscreens / Mobile / Tablet: Cleanly disable mouse-move tilt to keep touch scroll buttery smooth
      window.removeEventListener('mousemove', onMouseMove);
      if (parallaxRafId) {
        cancelAnimationFrame(parallaxRafId);
        parallaxRafId = null;
      }
      if (hero3dWrapper) {
        hero3dWrapper.style.transform = 'none';
      }
      if (heroTitle) {
        heroTitle.style.filter = 'drop-shadow(0 12px 28px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 40px rgba(229, 9, 20, 0.5))';
      }
    }
  }

  // Initialize and listen for responsive device pointer mode changes
  setupParallax();
  if (typeof pointerFineQuery.addEventListener === 'function') {
    pointerFineQuery.addEventListener('change', setupParallax);
  } else if (typeof pointerFineQuery.addListener === 'function') {
    pointerFineQuery.addListener(setupParallax);
  }


  /* ----------------------------------------------------------------------------
     2. VERTICAL SCROLL-SNAP & NAVIGATION SYNCHRONIZATION
     ---------------------------------------------------------------------------- */
  let currentActiveIndex = 0;

  function updateActiveNavigation(index) {
    if (index === currentActiveIndex) return;
    currentActiveIndex = index;

    // Update Navbar Links
    navLinks.forEach((link, i) => {
      link.classList.toggle('active', i === index);
    });

    // Update Right Indicator Dots
    dotButtons.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  // Detect which section is currently snapped/visible
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      let activeIndex = 0;
      const scrollPos = scrollContainer.scrollTop + window.innerHeight * 0.4;

      sections.forEach((sec, idx) => {
        if (sec.offsetTop <= scrollPos) {
          activeIndex = idx;
        }
      });

      updateActiveNavigation(activeIndex);
    }, { passive: true });
  }

  // Click handler for Navbar links and Indicator dots
  function scrollToSection(index) {
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const index = parseInt(link.getAttribute('data-index') || '0', 10);
      scrollToSection(index);
    });
  });

  dotButtons.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index') || '0', 10);
      scrollToSection(index);
    });
  });


  /* ----------------------------------------------------------------------------
     3. INTERACTIVE TOUCH / TAP BEHAVIOR FOR OVERLAPPING CREATOR CARDS
     ---------------------------------------------------------------------------- */
  creatorCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // If clicking directly on an anchor link inside, let it navigate
      if (e.target.closest('a')) return;

      const isActive = card.classList.contains('is-active');
      // Remove active state from other cards
      creatorCards.forEach(c => c.classList.remove('is-active'));

      // Toggle current card
      if (!isActive) {
        card.classList.add('is-active');
      }
    });
  });

  // Clicking anywhere outside cards removes active focus
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.creator-card')) {
      creatorCards.forEach(c => c.classList.remove('is-active'));
    }
  });


  /* ----------------------------------------------------------------------------
     4. GRACEFUL VIDEO ERROR / FALLBACK HANDLING
     ---------------------------------------------------------------------------- */
  const bgVideos = document.querySelectorAll('.bg-video');
  bgVideos.forEach((video) => {
    // If video fails to load (e.g., bg2.mp4 or bg3.mp4 not present in folder),
    // hide the video tag cleanly so the dark-warm gradient fallback shows seamlessly.
    video.addEventListener('error', () => {
      video.style.display = 'none';
    });

    // Ensure loop playback continues smoothly
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });
  });


  /* ----------------------------------------------------------------------------
     5. SEAMLESS BACKGROUND MUSIC (Smart Autoplay & Navbar Toggle)
     ---------------------------------------------------------------------------- */
  const bgMusic = document.getElementById('bg-music');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicIcon = document.getElementById('musicIcon');

  let isMusicPlaying = false;
  let userInteracted = false;

  // Set default volume to smooth, pleasant level (0.4)
  if (bgMusic) {
    bgMusic.volume = 0.4;
  }

  function updateMusicUI(playing) {
    isMusicPlaying = playing;
    if (musicToggleBtn) {
      musicToggleBtn.classList.toggle('is-playing', playing);
      musicToggleBtn.setAttribute('title', playing ? 'Mute Music' : 'Play Music');
      musicToggleBtn.setAttribute('aria-label', playing ? 'Mute background music' : 'Play background music');
    }
    if (musicIcon) {
      musicIcon.className = playing ? 'fa-solid fa-volume-high music-icon' : 'fa-solid fa-volume-xmark music-icon';
    }
  }

  function playMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0.4;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          updateMusicUI(true);
        })
        .catch((err) => {
          // Playback blocked by browser policy or audio file not loaded yet
          console.log('Background audio playback pending user interaction or file placement:', err.message);
          updateMusicUI(false);
        });
    }
  }

  function pauseMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    updateMusicUI(false);
  }

  // Smart Autoplay: Trigger on first user interaction (click, touch, scroll, keydown, wheel)
  function handleFirstInteraction() {
    if (userInteracted) return;
    userInteracted = true;

    // Clean up one-time interaction listeners
    ['click', 'touchstart', 'scroll', 'wheel', 'keydown'].forEach((evt) => {
      window.removeEventListener(evt, handleFirstInteraction, { capture: true });
      if (scrollContainer) {
        scrollContainer.removeEventListener(evt, handleFirstInteraction, { capture: true });
      }
    });

    playMusic();
  }

  // Register interaction listeners on window and scroll container
  ['click', 'touchstart', 'scroll', 'wheel', 'keydown'].forEach((evt) => {
    window.addEventListener(evt, handleFirstInteraction, { capture: true, passive: true });
  });

  if (scrollContainer) {
    ['scroll', 'wheel', 'touchstart'].forEach((evt) => {
      scrollContainer.addEventListener(evt, handleFirstInteraction, { capture: true, passive: true });
    });
  }

  // Navbar Toggle Button Click: Manual Mute / Unmute
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userInteracted = true; // Mark as interacted so autoplay doesn't re-trigger
      if (isMusicPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    });
  }

  // Sync state if audio plays or pauses through other means
  if (bgMusic) {
    bgMusic.addEventListener('play', () => updateMusicUI(true));
    bgMusic.addEventListener('pause', () => updateMusicUI(false));
  }

})();
