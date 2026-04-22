/**
 * Team Homepage — Animation Bundle
 * Hosted on GitHub Pages (siteamrollouts org).
 * Injected into Webflow via custom code before </body>.
 *
 * Dependencies (load via CDN before this script):
 *   - gsap + ScrollTrigger + Flip + Observer + Draggable + CustomEase
 *   - lenis (smooth scroll)
 *   - swiper (carousel)
 *
 * Convention: each animated section gets a data-module="xxx" attribute
 * in Webflow. This script auto-initialises matching modules on DOMReady.
 *
 * @version 1.0.0
 */

(function() {
  'use strict';

  // ── Register GSAP plugins ──
  gsap.registerPlugin(ScrollTrigger, Flip, Observer, Draggable, CustomEase);
  CustomEase.create('assistantEase', '0.34, 1.56, 0.64, 1');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  // ── Lenis smooth scroll ──
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    touchMultiplier: 2,
    syncTouch: true,
  });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);


  // ════════════════════════════════════════════════════
  //  MODULE: Video Modal
  //  Opens from any element with [data-video-trigger]
  // ════════════════════════════════════════════════════
  function initVideoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    if (!modal || !video) return;

    const triggers = document.querySelectorAll('[data-video-trigger]');
    const closers = modal.querySelectorAll('[data-modal-close]');

    function open(e) {
      if (e) e.preventDefault();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      video.currentTime = 0;
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    }
    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      video.pause();
      video.currentTime = 0;
    }

    triggers.forEach(t => t.addEventListener('click', open));
    closers.forEach(c => c.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }


  // ════════════════════════════════════════════════════
  //  MODULE: Floating CTA
  //  Show after hero, hide near footer
  // ════════════════════════════════════════════════════
  function initFloatingCta() {
    const el = document.getElementById('floatingCta');
    const bar = document.getElementById('floatingBar');
    const hero = document.getElementById('heroSection');
    const footer = document.querySelector('footer');
    if (!el || !hero) return;

    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom 80%',
      onEnter: () => { el.classList.add('is-visible'); if (bar) bar.classList.add('is-visible'); },
      onLeaveBack: () => { el.classList.remove('is-visible'); if (bar) bar.classList.remove('is-visible'); },
    });

    if (footer) {
      ScrollTrigger.create({
        trigger: footer,
        start: 'top bottom',
        onEnter: () => { el.classList.remove('is-visible'); if (bar) bar.classList.remove('is-visible'); },
        onLeaveBack: () => { el.classList.add('is-visible'); if (bar) bar.classList.add('is-visible'); },
      });
    }
  }


  // ════════════════════════════════════════════════════
  //  MODULE: Nav
  //  Hide on scroll down, show on scroll up.
  //  Transparent → solid when past hero.
  //  Dropdown hover open/close with blur overlay.
  // ════════════════════════════════════════════════════
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    let lastScroll = 0;

    ScrollTrigger.create({
      onUpdate: (self) => {
        const s = self.scroll();
        if (s > lastScroll && s > 100) nav.classList.add('nav--hidden');
        else nav.classList.remove('nav--hidden');
        lastScroll = s;
      }
    });

    const hero = document.getElementById('heroSection');
    if (hero) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'bottom 60px',
        onEnter: () => nav.classList.add('nav--solid'),
        onLeaveBack: () => nav.classList.remove('nav--solid'),
      });
    }

    // Dropdown hover
    const overlay = document.getElementById('navBlurOverlay');
    const dropdowns = document.querySelectorAll('[data-dropdown]');
    let closeTimer = null;

    function openDropdown(dd) {
      dropdowns.forEach(d => { if (d !== dd) d.classList.remove('is-open'); });
      dd.classList.add('is-open');
      if (overlay) overlay.classList.add('is-active');
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    }
    function closeAllDropdowns() {
      closeTimer = setTimeout(() => {
        dropdowns.forEach(d => d.classList.remove('is-open'));
        if (overlay) overlay.classList.remove('is-active');
      }, 120);
    }

    dropdowns.forEach(dd => {
      dd.addEventListener('mouseenter', () => openDropdown(dd));
      dd.addEventListener('mouseleave', () => closeAllDropdowns());
      const panel = dd.querySelector('.nav__dropdown-panel');
      if (panel) {
        panel.addEventListener('mouseenter', () => {
          if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
        });
        panel.addEventListener('mouseleave', () => closeAllDropdowns());
      }
    });
  }


  // ════════════════════════════════════════════════════
  //  MODULE: Hero Typer
  //  Cycles headline text: Command Center → Operating System → Single Platform
  // ════════════════════════════════════════════════════
  function initHeroTyper() {
    const el = document.getElementById('heroTyper');
    if (!el) return;
    if (prefersReduced) { el.textContent = 'Command Center'; return; }

    const phrases = ['Command Center', 'Operating System', 'Single Platform'];
    const TYPE_MS = 70, ERASE_MS = 40, HOLD_MS = 1500, GAP_MS = 350;
    let phraseIdx = 0, charIdx = phrases[0].length, mode = 'hold';

    function tick() {
      const phrase = phrases[phraseIdx];
      if (mode === 'type') {
        charIdx++;
        el.textContent = phrase.substring(0, charIdx);
        setTimeout(tick, charIdx >= phrase.length ? (mode = 'hold', HOLD_MS) : TYPE_MS);
      } else if (mode === 'hold') {
        mode = 'erase';
        setTimeout(tick, ERASE_MS);
      } else if (mode === 'erase') {
        charIdx--;
        el.textContent = phrase.substring(0, charIdx);
        if (charIdx <= 0) { mode = 'gap'; phraseIdx = (phraseIdx + 1) % phrases.length; }
        setTimeout(tick, charIdx <= 0 ? GAP_MS : ERASE_MS);
      } else if (mode === 'gap') {
        mode = 'type';
        setTimeout(tick, TYPE_MS);
      }
    }
    setTimeout(tick, HOLD_MS);
  }


  // ════════════════════════════════════════════════════
  //  MODULE: Hero scroll progress
  //  Drives --progress CSS var for clip-path frame + overlay
  //  Also pushes cover content up + fades it out
  // ════════════════════════════════════════════════════
  function initHero() {
    if (prefersReduced) return;
    const section = document.getElementById('heroSection');
    const imgW = document.getElementById('heroImgW');
    const coverW = document.getElementById('coverW');
    const coverIntro = document.getElementById('coverIntro');
    if (!section || !imgW || !coverW) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const p = parseFloat(self.progress.toFixed(4));
        imgW.style.setProperty('--progress', p);
        coverW.style.setProperty('--progress', p);

        if (coverIntro) {
          const fadeP = Math.max(0, (p - 0.3) / 0.4);
          coverIntro.style.transform = 'translateY(' + (p * -100) + 'px)';
          coverIntro.style.opacity = Math.max(0, 1 - fadeP);
        }
      }
    });
  }


  // ════════════════════════════════════════════════════
  //  MODULE: Hero Excerpt tiles
  //  Cutout from hero BG → pin → rectangle-to-square morph → fan out flanks
  // ════════════════════════════════════════════════════
  function initExcerptFlight() {
    if (prefersReduced) return;

    const heroSection = document.getElementById('heroSection');
    const heroImg = heroSection ? heroSection.querySelector('.hero-img') : null;
    const wrapper = document.getElementById('heroExcerpts');
    const center = document.getElementById('heroExcerpt');
    const left = document.getElementById('heroExcerptLeft');
    const right = document.getElementById('heroExcerptRight');
    if (!wrapper || !center || !left || !right || !heroImg) return;

    // Image sources
    const imgSrc = heroImg.getAttribute('data-excerpt-src') || heroImg.getAttribute('src');
    const leftSrc = left.getAttribute('data-src') || 'https://siteamrollouts.github.io/team-homepage/assets/hero-bg-alt-1.jpeg';
    const rightSrc = right.getAttribute('data-src') || 'https://siteamrollouts.github.io/team-homepage/assets/hero-bg-alt-2.jpeg';

    // Flanks: hidden, set BG to cover
    gsap.set(left, { x: 0, rotation: 0, opacity: 0 });
    gsap.set(right, { x: 0, rotation: 0, opacity: 0 });
    left.style.backgroundImage = 'url(' + leftSrc + ')';
    left.style.backgroundSize = 'cover';
    left.style.backgroundPosition = 'center';
    right.style.backgroundImage = 'url(' + rightSrc + ')';
    right.style.backgroundSize = 'cover';
    right.style.backgroundPosition = 'center';

    // Compute BG states for centre tile
    function computeBgStates(iw, ih) {
      const hr = heroSection.getBoundingClientRect();
      const wr = wrapper.getBoundingClientRect();
      const bgW = hr.width, bgH = hr.height;
      const offX = wr.left - hr.left, offY = wr.top - hr.top;
      const aligned = { sizeW: bgW, sizeH: bgH, posX: -offX, posY: -offY };
      const targetW = wrapper.offsetWidth;
      const targetH = targetW;
      const imageAspect = iw / ih;
      const targetAspect = targetW / targetH;
      var coverW2, coverH2, coverX2, coverY2;
      if (imageAspect > targetAspect) {
        coverH2 = targetH; coverW2 = iw * targetH / ih;
        coverX2 = -(coverW2 - targetW) / 2; coverY2 = 0;
      } else {
        coverW2 = targetW; coverH2 = ih * targetW / iw;
        coverX2 = 0; coverY2 = -(coverH2 - targetH) / 2;
      }
      return { aligned: aligned, cover: { sizeW: coverW2, sizeH: coverH2, posX: coverX2, posY: coverY2 } };
    }

    // Centre tile image on inner layer
    const centerImg = document.getElementById('heroExcerptImg');
    if (centerImg) centerImg.style.backgroundImage = 'url(' + imgSrc + ')';
    gsap.set(center, { opacity: 0 });

    var img = new Image();
    img.src = imgSrc;

    function setupTimeline() {
      var states = computeBgStates(img.naturalWidth || 1920, img.naturalHeight || 1080);
      var aligned = states.aligned, cover = states.cover;

      if (centerImg) {
        centerImg.style.backgroundSize = aligned.sizeW + 'px ' + aligned.sizeH + 'px';
        centerImg.style.backgroundPosition = aligned.posX + 'px ' + aligned.posY + 'px';
      }
      gsap.set(center, { opacity: 0 });

      var bgState = {
        sizeW: aligned.sizeW, sizeH: aligned.sizeH,
        posX: aligned.posX, posY: aligned.posY,
      };

      var elW = wrapper.offsetWidth;
      var rectH = Math.round(elW * 3 / 4);
      var sqH = elW;
      wrapper.style.aspectRatio = 'auto';
      wrapper.style.height = rectH + 'px';

      var fanDist = elW * 0.55;

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'center center',
          end: '+=80%',
          pin: true,
          pinSpacing: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: function(self) {
            var o = Math.min(1, self.progress / 0.15);
            center.style.opacity = o;
            center.style.visibility = o > 0 ? 'visible' : 'hidden';
          },
          onLeaveBack: function() { center.style.opacity = 0; center.style.visibility = 'hidden'; },
        }
      });

      // Rectangle → Square
      tl.fromTo(wrapper,
        { height: rectH },
        { height: sqH, duration: 0.6, ease: 'power2.inOut' },
      0);

      // BG lerp
      tl.to(bgState, {
        sizeW: cover.sizeW, sizeH: cover.sizeH,
        posX: cover.posX, posY: cover.posY,
        duration: 0.6, ease: 'power2.inOut',
        onUpdate: function() {
          if (centerImg) {
            centerImg.style.backgroundSize = bgState.sizeW + 'px ' + bgState.sizeH + 'px';
            centerImg.style.backgroundPosition = bgState.posX + 'px ' + bgState.posY + 'px';
          }
        }
      }, 0);

      // Centre border/shadow
      tl.to(center, {
        borderColor: 'rgba(0,0,0,0.08)',
        borderStyle: 'solid',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        duration: 0.6, ease: 'power2.inOut',
      }, 0);

      // Flanks border/shadow
      tl.to([left, right], {
        borderColor: 'rgba(0,0,0,0.08)',
        borderStyle: 'solid',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        duration: 0.6, ease: 'power2.inOut',
      }, 0);

      // Fan out flanks
      tl.to(left, {
        x: -fanDist, rotation: -5, autoAlpha: 1,
        duration: 0.4, ease: 'power2.out'
      }, 0.3);
      tl.to(right, {
        x: fanDist, rotation: 5, autoAlpha: 1,
        duration: 0.4, ease: 'power2.out'
      }, 0.3);

      // Labels
      var labelLeft = document.getElementById('tileLabelLeft');
      var labelCenter = document.getElementById('tileLabelCenter');
      var labelRight = document.getElementById('tileLabelRight');
      if (labelLeft && labelCenter && labelRight) {
        gsap.set(labelCenter, { xPercent: -50 });
        gsap.set(labelLeft, { xPercent: -50, x: -fanDist });
        gsap.set(labelRight, { xPercent: -50, x: fanDist });
        tl.fromTo([labelLeft, labelCenter, labelRight],
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out' },
          0.75);
      }

      tl.to({}, { duration: 0.5 });
    }

    if (img.complete && img.naturalWidth) {
      requestAnimationFrame(setupTimeline);
    } else {
      img.onload = function() { requestAnimationFrame(setupTimeline); };
      img.onerror = function() { requestAnimationFrame(setupTimeline); };
    }
  }


  // ════════════════════════════════════════════════════
  //  MODULE: Engine / TeamMate search bar
  //  Pin, typewriter, button morph to spinner, pondering dots
  // ════════════════════════════════════════════════════
  function initEngine() {
    if (prefersReduced) return;
    var searchBar = document.getElementById('searchBar');
    var searchInput = document.getElementById('searchInput');
    var pondering = document.getElementById('pondering');
    if (!searchBar || !searchInput) return;

    var submitBtn = searchBar.querySelector('.search-submit');
    var submitLabel = submitBtn ? submitBtn.querySelector('.search-submit__label') : null;
    var submitSpinner = submitBtn ? submitBtn.querySelector('.search-submit__spinner') : null;
    var typeText = 'Plan a comprehensive pre-release strategy focused on fan engagement';

    // Capture original button dims
    var origBtnW = submitBtn ? submitBtn.offsetWidth : 0;
    var origBtnH = submitBtn ? submitBtn.offsetHeight : 0;
    var origBtnPadX = submitBtn ? parseFloat(getComputedStyle(submitBtn).paddingLeft) : 0;

    // Click animation timeline
    var clickTl = gsap.timeline({
      paused: true,
      onStart: function() { if (submitBtn) submitBtn.classList.add('is-loading'); },
      onReverseComplete: function() {
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          gsap.set(submitBtn, { clearProps: 'scale,width,height,paddingLeft,paddingRight,borderRadius' });
        }
        if (submitLabel) gsap.set(submitLabel, { clearProps: 'opacity,visibility,scale' });
        if (submitSpinner) gsap.set(submitSpinner, { clearProps: 'opacity,visibility' });
      },
    });

    if (submitBtn && submitLabel && submitSpinner) {
      clickTl
        .fromTo(submitBtn, { scale: 1 }, { scale: 0.9, duration: 0.08, ease: 'power2.in' })
        .fromTo(submitLabel, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 0.85, duration: 0.18, ease: 'power2.in' }, '<')
        .fromTo(submitBtn,
          { scale: 0.9, width: origBtnW, height: origBtnH, paddingLeft: origBtnPadX, paddingRight: origBtnPadX, borderRadius: '2rem' },
          { scale: 1, width: 36, height: 36, paddingLeft: 0, paddingRight: 0, borderRadius: '50%', duration: 0.35, ease: 'back.out(1.8)' })
        .fromTo(submitSpinner, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'power2.out' }, '-=0.15');
    }

    // Pondering timeline
    var ponderTl = gsap.timeline({ paused: true });
    if (pondering) {
      gsap.set(pondering, { autoAlpha: 0, y: 10 });
      ponderTl.to(pondering, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }

    // Fade-out timeline
    var pinWrap = document.getElementById('searchPinWrap');
    var fadeOutTl = gsap.timeline({ paused: true });
    fadeOutTl.to([searchBar, pondering].filter(Boolean), {
      autoAlpha: 0, y: -30, filter: 'blur(8px)',
      duration: 0.5, ease: 'power2.in', stagger: 0.05
    });

    var clickPlayed = false, ponderingShown = false, fadedOut = false;

    if (pinWrap) {
      gsap.timeline({
        scrollTrigger: {
          trigger: pinWrap,
          start: 'center center',
          end: '+=300%',
          scrub: true,
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onUpdate: function(self) {
            var p = self.progress;
            // Typewriter
            var typeProgress = Math.min(p / 0.4, 1);
            var chars = Math.floor(typeProgress * typeText.length);
            searchInput.value = typeText.substring(0, chars);
            var barWidth = 28 + (typeProgress * 16);
            gsap.set(searchBar, { width: Math.min(barWidth, 44) + 'rem' });

            // Button click
            if (p >= 0.45 && !clickPlayed) {
              clickPlayed = true;
              clickTl.restart();
            } else if (p < 0.4 && clickPlayed) {
              clickPlayed = false;
              clickTl.reverse();
            }

            // Pondering
            if (p >= 0.52 && !ponderingShown) {
              ponderingShown = true;
              ponderTl.play();
            } else if (p < 0.5 && ponderingShown) {
              ponderingShown = false;
              ponderTl.reverse();
            }

            // Fade out
            if (p >= 0.90 && !fadedOut) {
              fadedOut = true;
              fadeOutTl.play();
            } else if (p < 0.87 && fadedOut) {
              fadedOut = false;
              fadeOutTl.reverse();
            }
          },
          onLeaveBack: function() {
            searchInput.value = '';
            gsap.set(searchBar, { width: '28rem' });
            clickPlayed = false;
            ponderingShown = false;
            fadedOut = false;
            clickTl.pause(0);
            ponderTl.pause(0);
            fadeOutTl.pause(0);
            if (submitBtn) {
              submitBtn.classList.remove('is-loading');
              gsap.set(submitBtn, { clearProps: 'scale,width,height,paddingLeft,paddingRight,borderRadius' });
            }
            if (submitLabel) gsap.set(submitLabel, { clearProps: 'opacity,visibility,scale' });
            if (submitSpinner) gsap.set(submitSpinner, { clearProps: 'opacity,visibility' });
            gsap.set([searchBar, pondering].filter(Boolean), { clearProps: 'opacity,visibility,y,filter' });
            if (pondering) gsap.set(pondering, { autoAlpha: 0, y: 10 });
          }
        }
      });
    }
  }


  // ════════════════════════════════════════════════════
  //  MODULE: Dashboard Showcase
  //  Release grid → loading bar → timeline view
  // ════════════════════════════════════════════════════
  function initShowcase() {
    if (prefersReduced) return;
    var section = document.getElementById('guidelinesSection');
    var guidelinesWrap = document.getElementById('guidelinesWrap');
    var grid = document.getElementById('releasesGridWrap');
    var loading = document.getElementById('showcaseLoading');
    var fill = document.getElementById('showcaseLoadingFill');
    var loadingLabel = document.getElementById('showcaseLoadingLabel');
    var timeline = document.getElementById('showcaseTimeline');
    var chat = document.getElementById('teammateChat');
    if (!section || !guidelinesWrap) return;

    gsap.set(guidelinesWrap, { y: 40, autoAlpha: 0, filter: 'blur(4px)' });

    var revealTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=300%',
        scrub: true,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
      }
    });

    // UI slides up
    revealTl.to(guidelinesWrap, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' });
    revealTl.to({}, { duration: 0.8 });

    // Grid fades
    if (grid) {
      revealTl.to(grid, { opacity: 0, scale: 0.96, filter: 'blur(6px)', duration: 0.5, ease: 'power2.inOut' });
    }

    // Loading
    if (loading) {
      revealTl.to(loading, { opacity: 1, duration: 0.3, ease: 'power2.inOut' }, '<0.2');
    }
    if (fill) {
      revealTl.fromTo(fill, { width: '0%' }, {
        width: '100%', duration: 0.8, ease: 'none',
        onUpdate: function() {
          if (loadingLabel) {
            var p = Math.round(this.progress() * 100);
            loadingLabel.textContent = p < 100 ? 'Release loading... ' + p + '%' : 'Release loaded.';
          }
        }
      });
    }
    if (loading) {
      revealTl.to(loading, { opacity: 0, duration: 0.3, ease: 'power2.in' });
    }

    // Timeline
    if (timeline) {
      revealTl.fromTo(timeline, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      revealTl.fromTo('#showcaseTimeline > div:nth-child(3) > div',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out' }, '<');
    }

    // Chat panel
    if (chat) {
      revealTl.fromTo(chat, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '<0.2');
      revealTl.fromTo('#chatUserMsg', { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }, '>');
      revealTl.fromTo('#chatAiMsg', { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }, '>0.25');
    }

    revealTl.to({}, { duration: 0.8 });
  }


  // ════════════════════════════════════════════════════
  //  MODULE: Features spotlight
  //  Left list + right preview, auto-advance, panel animations
  // ════════════════════════════════════════════════════
  function initFeatures() {
    var section = document.getElementById('featuresSection');
    if (!section) return;
    var cards = section.querySelectorAll('.feature-card');
    var desktopPreview = section.querySelector('.features-spotlight > .features-preview');
    var panels = desktopPreview ? desktopPreview.querySelectorAll(':scope > .features-preview__panel') : [];

    var currentIdx = 0, autoTimer = null, userInteracted = false, isHovering = false;
    var isTouchDevice = !window.matchMedia('(hover: hover)').matches;

    function animatePanel(panel) {
      var feature = panel.getAttribute('data-feature');
      var ease = 'power2.out';

      if (feature === 'timeline') {
        gsap.fromTo(panel.querySelectorAll('.ph-timeline__row'), { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.08, ease: ease });
        gsap.fromTo(panel.querySelectorAll('.ph-timeline__bar'), { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.15 });
      }
      else if (feature === 'ai') {
        gsap.fromTo(panel.querySelector('.ph-chat__user-row'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: ease });
        gsap.fromTo(panel.querySelector('.ph-chat__ai-row'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: ease, delay: 0.45 });
        var chatInput = panel.querySelector('.ph-chat__input');
        if (chatInput) gsap.fromTo(chatInput, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: ease, delay: 0.9 });
      }
      else if (feature === 'intel') {
        gsap.fromTo(panel.querySelectorAll('.ph-intel__stat'), { autoAlpha: 0, y: 16, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.1, ease: ease });
        panel.querySelectorAll('.ph-intel__stat-value').forEach(function(el, i) {
          var text = el.textContent;
          var match = text.match(/^(\d+(?:\.\d+)?)(.*)$/);
          if (!match) return;
          var endValue = parseFloat(match[1]), suffix = match[2], isDecimal = text.includes('.');
          var obj = { v: 0 };
          gsap.to(obj, { v: endValue, duration: 1, ease: 'power2.out', delay: 0.2 + i * 0.1,
            onUpdate: function() { el.textContent = (isDecimal ? obj.v.toFixed(1) : Math.round(obj.v)) + suffix; }
          });
        });
        var chart = panel.querySelector('.ph-intel__chart');
        if (chart) gsap.fromTo(chart, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: ease, delay: 0.4 });
        var chartPath = panel.querySelector('.ph-intel__chart svg path:first-of-type');
        if (chartPath && chartPath.getTotalLength) {
          var len = chartPath.getTotalLength();
          gsap.fromTo(chartPath, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out', delay: 0.55 });
        }
      }
      else if (feature === 'rollout') {
        gsap.fromTo(panel.querySelectorAll('.ph-rollout__row'), { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.08, ease: ease });
        gsap.fromTo(panel.querySelectorAll('.ph-rollout__check.is-done'), { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.08, delay: 0.2 });
      }
      else if (feature === 'budget') {
        var donut = panel.querySelector('.ph-budget__donut');
        if (donut) gsap.fromTo(donut, { rotation: -90, scale: 0.7, autoAlpha: 0, transformOrigin: 'center center' }, { rotation: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.4)' });
        gsap.fromTo(panel.querySelectorAll('.ph-budget__legend-row'), { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.08, ease: ease, delay: 0.3 });
      }
      else if (feature === 'collab') {
        gsap.fromTo(panel.querySelectorAll('.ph-collab__row'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.1, ease: ease });
      }
    }

    function activate(idx) {
      cards.forEach(function(c, i) {
        c.classList.toggle('is-active', i === idx);
        c.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });
      panels.forEach(function(p, i) { p.classList.toggle('is-active', i === idx); });
      currentIdx = idx;
      if (panels[idx]) animatePanel(panels[idx]);
      var mobilePanel = cards[idx] && cards[idx].querySelector('.feature-card__preview-mobile .features-preview__panel');
      if (mobilePanel) animatePanel(mobilePanel);
    }

    function startAuto() { stopAuto(); autoTimer = setInterval(function() { if (!userInteracted && !isHovering) activate((currentIdx + 1) % cards.length); }, 5000); }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

    cards.forEach(function(card, i) {
      card.addEventListener('click', function() { userInteracted = true; stopAuto(); activate(i); });
      if (!isTouchDevice) {
        card.addEventListener('mouseenter', function() { isHovering = true; activate(i); });
        card.addEventListener('mouseleave', function() { isHovering = false; });
      }
    });

    if ('IntersectionObserver' in window) {
      var hasPlayedFirst = false;
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            if (!hasPlayedFirst) { hasPlayedFirst = true; if (panels[currentIdx]) animatePanel(panels[currentIdx]); }
            if (!userInteracted) startAuto();
          } else { stopAuto(); }
        });
      }, { threshold: 0.3 });
      observer.observe(section);
    }
  }


  // ════════════════════════════════════════════════════
  //  MODULE: FAQ Accordion
  // ════════════════════════════════════════════════════
  function initFaq() {
    var list = document.getElementById('faqList');
    if (!list) return;
    var items = list.querySelectorAll('.faq-item');
    items.forEach(function(item) {
      var trigger = item.querySelector('.faq-item__trigger');
      if (!trigger) return;
      trigger.addEventListener('click', function() {
        var isOpen = item.classList.contains('is-open');
        items.forEach(function(i) {
          i.classList.remove('is-open');
          var t = i.querySelector('.faq-item__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }


  // ════════════════════════════════════════════════════
  //  MODULE: Stories Carousel (Swiper)
  // ════════════════════════════════════════════════════
  function initStories() {
    if (typeof Swiper === 'undefined') return;
    new Swiper('#storiesSwiper', {
      slidesPerView: 1.3,
      spaceBetween: 16,
      centeredSlides: false,
      loop: true,
      loopAdditionalSlides: 4,
      freeMode: { enabled: true, momentum: true, momentumRatio: 0.5, momentumVelocityRatio: 0.5 },
      grabCursor: true,
      speed: 600,
      autoplay: { delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: true },
      breakpoints: {
        640: { slidesPerView: 2.3 },
        1024: { slidesPerView: 3.4 },
        1400: { slidesPerView: 4.2 },
      }
    });
  }


  // ════════════════════════════════════════════════════
  //  MODULE: Side Nav
  //  Vertical dots, scroll-tracked active state, click-to-scroll
  // ════════════════════════════════════════════════════
  function initSideNav() {
    var nav = document.getElementById('sideNav');
    if (!nav || isMobile) return;
    var dots = nav.querySelectorAll('.side-nav__dot');
    var hero = document.getElementById('heroSection');

    var sections = [];
    dots.forEach(function(dot) {
      var el = document.getElementById(dot.dataset.target);
      if (el) sections.push({ dot: dot, el: el });
    });

    if (hero) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'bottom 80%',
        onEnter: function() { nav.classList.add('is-visible'); },
        onLeaveBack: function() { nav.classList.remove('is-visible'); },
      });
    }

    sections.forEach(function(s) {
      ScrollTrigger.create({
        trigger: s.el,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: function() {
          dots.forEach(function(d) { d.classList.remove('is-active'); });
          s.dot.classList.add('is-active');
        },
        onEnterBack: function() {
          dots.forEach(function(d) { d.classList.remove('is-active'); });
          s.dot.classList.add('is-active');
        },
      });
    });

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var target = document.getElementById(dot.dataset.target);
        if (!target) return;
        lenis.stop();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(function() { lenis.start(); }, 1200);
      });
    });
  }


  // ════════════════════════════════════════════════════
  //  MODULE: Newsletter Form
  // ════════════════════════════════════════════════════
  function initNewsletter() {
    var form = document.getElementById('newsletterForm');
    var btn = document.getElementById('newsletterBtn');
    var msg = document.getElementById('newsletterMsg');
    var input = document.getElementById('newsletterEmail');
    if (!form || !btn || !msg || !input) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!input.value.trim() || !input.checkValidity()) return;
      btn.textContent = 'Sent!';
      btn.disabled = true;
      msg.style.opacity = '1';
    });
  }


  // ════════════════════════════════════════════════════
  //  BOOT — Initialise all modules
  // ════════════════════════════════════════════════════
  function boot() {
    initVideoModal();
    initFloatingCta();
    initNav();
    initHeroTyper();
    initHero();
    initExcerptFlight();
    initEngine();
    initShowcase();
    initFeatures();
    initFaq();
    initStories();
    initSideNav();
    initNewsletter();
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
