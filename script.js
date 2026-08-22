// ==========================================================
//  CINEMATIC PORTFOLIO — FIXED INTRO + HERO IMAGE SYSTEM
// ==========================================================

(function () {
    'use strict';

    // -------------------------------------------------------
    //  GLOBAL REFERENCES (set once after DOM ready)
    // -------------------------------------------------------
    let introScreen, navbar;
    let heroSection, heroImage1, heroImage2;
    let heroNameEn, heroNameTa;
    let sliceEffect, sliceSVG;
    let introComplete = false;

    // -------------------------------------------------------
    //  BOOT
    // -------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        // Cache DOM nodes
        introScreen = document.getElementById('intro-screen');
        navbar      = document.getElementById('navbar');
        heroSection = document.querySelector('.hero-scroll-section');
        heroImage1  = document.getElementById('hero-vijay-one');
        heroImage2  = document.getElementById('hero-vijay-two');
        heroNameEn  = document.getElementById('hero-name-en');
        heroNameTa  = document.getElementById('hero-name-ta');
        sliceEffect = document.getElementById('slice-effect');
        sliceSVG    = sliceEffect ? sliceEffect.querySelector('svg') : null;

        // Add SVG blur filter for the glow
        injectSVGFilter();

        // Lock scroll during intro
        document.body.style.overflow = 'hidden';

        // Run intro sequence
        runIntroSequence();

        // Setup scroll-based hero transition
        setupHeroScrollTransition();

        // Other portfolio features
        setupScrollToTop();
        setupSmoothScrolling();
        setupScrollAnimations();
        setupHoverEffects();
    });

    // -------------------------------------------------------
    //  INJECT SVG FILTER (for glow on slice)
    // -------------------------------------------------------
    function injectSVGFilter() {
        const ns = 'http://www.w3.org/2000/svg';
        const defs = document.createElementNS(ns, 'defs');

        const filter = document.createElementNS(ns, 'filter');
        filter.setAttribute('id', 'sliceBlur');

        const blur = document.createElementNS(ns, 'feGaussianBlur');
        blur.setAttribute('stdDeviation', '1.5');
        filter.appendChild(blur);
        defs.appendChild(filter);

        if (sliceSVG) sliceSVG.insertBefore(defs, sliceSVG.firstChild);
    }

    // -------------------------------------------------------
    //  INTRO SEQUENCE  (strictly timeout-based)
    //
    //  0.0s — black screen
    //  0.5s — "HI, I AM" fades in
    //  1.2s — "HARISH" appears
    //  2.5s — hold
    //  3.0s — intro starts fading
    //  4.0s — hero completely visible, navbar appears
    // -------------------------------------------------------
    function runIntroSequence() {
        const line1 = document.querySelector('.intro-line-1');
        const line2 = document.querySelector('.intro-line-2');

        // 0.5s — show "HI, I AM"
        setTimeout(() => {
            line1.classList.add('show');
        }, 500);

        // 1.2s — show "HARISH"
        setTimeout(() => {
            line2.classList.add('show');
        }, 1200);

        // 3.0s — begin fade-out
        setTimeout(() => {
            introScreen.classList.add('fade-out');
        }, 3000);

        // 4.0s — intro fully gone, unlock scroll, show navbar
        setTimeout(() => {
            introScreen.classList.add('gone');
            document.body.style.overflow = '';
            navbar.classList.add('visible');
            introComplete = true;
        }, 4000);
    }

    // -------------------------------------------------------
    //  HERO SCROLL TRANSITION
    //
    //  The hero-scroll-section is 200vh tall.
    //  The hero-sticky inside it sticks at top: 0, height: 100vh.
    //  Scroll progress 0..1 drives the transition.
    // -------------------------------------------------------
    function setupHeroScrollTransition() {
        // Attach scroll handler
        window.addEventListener('scroll', onHeroScroll, { passive: true });
        // Initial state
        onHeroScroll();
    }

    function onHeroScroll() {
        if (!introComplete) return;
        if (!heroSection) return;

        requestAnimationFrame(() => {
            const rect     = heroSection.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1,
                -rect.top / (heroSection.offsetHeight - window.innerHeight)
            ));

            applyHeroTransition(progress);
        });
    }

    // -------------------------------------------------------
    //  APPLY HERO TRANSITION — all phases driven by progress
    // -------------------------------------------------------
      function applyHeroTransition(progress) {
          // --- PHASE 1: 0.00 → 0.35  — STATIC, image 1 fully visible ---
          if (progress <= 0.35) {
              // Image 1 fully visible, clean
              heroImage1.style.transform = 'translate3d(0,0,0) scale(1.25)';
              heroImage1.style.filter    = 'none';
              heroImage1.style.opacity   = '1';

             // Image 2 fully masked
             heroImage2.style.clipPath  = 'polygon(0 0, 0 0, 0 100%, 0 100%)';

             // English name visible, Tamil hidden
             heroNameEn.style.clipPath  = 'none';
             heroNameEn.style.opacity   = '1';
             heroNameTa.style.clipPath  = 'polygon(0 0, 0 0, 0 100%, 0 100%)';

             // Slice invisible
             if (sliceEffect) sliceEffect.style.opacity = '0';
             return;
         }

         // --- PHASE 2: 0.35 → 0.45  — CINEMATIC TENSION ---
         if (progress <= 0.45) {
             const t = (progress - 0.35) / 0.10; // 0..1

             // Slight scale + brightness build-up on image 1
              const sc = 1.25 + t * 0.02;     // 1.25 → 1.27
             const br = 1 + t * 0.08;        // 1 → 1.08
             heroImage1.style.transform = `translate3d(0,0,0) scale(${sc})`;
             heroImage1.style.filter    = `brightness(${br})`;
             heroImage1.style.opacity   = '1';

             // Image 2 still fully masked
             heroImage2.style.clipPath  = 'polygon(0 0, 0 0, 0 100%, 0 100%)';

             // Names unchanged
             heroNameEn.style.clipPath  = 'none';
             heroNameEn.style.opacity   = '1';
             heroNameTa.style.clipPath  = 'polygon(0 0, 0 0, 0 100%, 0 100%)';

             // Slice still invisible
             if (sliceEffect) sliceEffect.style.opacity = '0';
             return;
         }

         // --- PHASE 3: 0.45 → 0.60  — HAND-SLICE TRANSITION ---
         if (progress <= 0.60) {
             const t = (progress - 0.45) / 0.15; // 0..1

             // Diagonal clip-path reveal for Image 2.
            // The leading edge is diagonal — it sweeps left-to-right
            // with the top slightly ahead of the bottom (or vice-versa).
            //
            // We define the "reveal boundary" as a diagonal band.
            // revealX is the main horizontal position of the sweep (0..1).
            // The diagonal offset shifts the top vs bottom by ~15% of width.
            const revealX  = t;               // 0 → 1
            const diagOff  = 0.15;            // diagonal tilt amount

            // Image 2 clip-path: reveal from the left
            const i2_topRight    = Math.min(revealX + diagOff, 1) * 100;
            const i2_bottomRight = Math.min(revealX, 1) * 100;
            heroImage2.style.clipPath = `polygon(
                0 0,
                ${i2_topRight}% 0,
                ${i2_bottomRight}% 100%,
                0 100%
            )`;

            // Image 1: fades out as image 2 sweeps in
            const fadeOut = 1 - t;
             heroImage1.style.transform = 'translate3d(0,0,0) scale(1.27)';
            heroImage1.style.filter    = `brightness(${1.08 - t * 0.15})`;
            heroImage1.style.opacity   = String(Math.max(0, fadeOut));

            // ---- SVG HAND-SLICE VISUAL ----
            // The slice line follows the leading diagonal edge of the reveal.
            // It appears at t≈0 (progress=0.45), crosses the image, exits at t≈1 (progress=0.60).
            if (sliceEffect && sliceSVG) {
                // Slice is visible only during this phase
                // Fade in at start, fade out at end
                let sliceOpacity = 1;
                if (t < 0.1)      sliceOpacity = t / 0.1;          // fade in
                else if (t > 0.85) sliceOpacity = (1 - t) / 0.15;  // fade out
                sliceEffect.style.opacity = String(Math.max(0, sliceOpacity));

                // The slice line: top-right of the diagonal to bottom-right
                const lineTopX = Math.min((revealX + diagOff) * 100, 100);
                const lineBotX = Math.min(revealX * 100, 100);

                // Update the SVG elements
                const sliceLine  = sliceSVG.querySelector('.slice-core');
                const sliceShadow = sliceSVG.querySelector('.slice-shadow');
                const sliceGlow   = sliceSVG.querySelector('.slice-glow');

                if (sliceLine) {
                    sliceLine.setAttribute('x1', lineTopX);
                    sliceLine.setAttribute('y1', '0');
                    sliceLine.setAttribute('x2', lineBotX);
                    sliceLine.setAttribute('y2', '100');
                }

                // Shadow: a thin diagonal polygon just behind the slice
                if (sliceShadow) {
                    const sw = 3; // shadow width in SVG units
                    sliceShadow.setAttribute('points',
                        `${lineTopX - sw},0 ${lineTopX},0 ${lineBotX},100 ${lineBotX - sw},100`
                    );
                }

                // Glow: a slightly wider polygon with golden fill
                if (sliceGlow) {
                    const gw = 5; // glow width
                    sliceGlow.setAttribute('points',
                        `${lineTopX - gw},0 ${lineTopX + 1},0 ${lineBotX + 1},100 ${lineBotX - gw},100`
                    );
                }
            }

            // ---- NAME TRANSITION (synchronized with image reveal) ----
            // English name: clip away from the left, same diagonal
            heroNameEn.style.clipPath = `polygon(
                ${i2_topRight}% 0,
                100% 0,
                100% 100%,
                ${i2_bottomRight}% 100%
            )`;
            heroNameEn.style.opacity = '1';

            // Tamil name: reveal from left, same boundary
            heroNameTa.style.clipPath = `polygon(
                0 0,
                ${i2_topRight}% 0,
                ${i2_bottomRight}% 100%,
                0 100%
            )`;

            return;
        }

        // --- PHASE 4: 0.60 → 0.80  — IMAGE 2 FULLY REVEALED ---
        if (progress <= 0.80) {
            const t = (progress - 0.60) / 0.20; // 0..1

            // Image 2 fully visible
            heroImage2.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

            // Image 1 fully hidden when image 2 is revealed
            heroImage1.style.transform = 'translate3d(0,0,0) scale(1.25)';
            heroImage1.style.filter    = 'none';
            heroImage1.style.opacity   = '0';

            // English name fully hidden
            heroNameEn.style.clipPath  = 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)';
            heroNameEn.style.opacity   = '1';

            // Tamil name fully visible
            heroNameTa.style.clipPath  = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

            // Slice gone
            if (sliceEffect) sliceEffect.style.opacity = '0';
            return;
        }

        // --- PHASE 5: 0.80 → 1.00  — SETTLE, GOLD GLOW ---
        {
            // Image 2 stays fully revealed, image 1 hidden
            heroImage2.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
            heroImage1.style.transform = 'translate3d(0,0,0) scale(1.25)';
            heroImage1.style.filter    = 'none';
            heroImage1.style.opacity   = '0';

            // English fully hidden
            heroNameEn.style.clipPath  = 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)';
            heroNameEn.style.opacity   = '1';

            // Tamil fully visible with subtle gold glow
            heroNameTa.style.clipPath  = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

            // Slice gone
            if (sliceEffect) sliceEffect.style.opacity = '0';
        }
    }

    // -------------------------------------------------------
    //  SCROLL TO TOP BUTTON
    // -------------------------------------------------------
    function setupScrollToTop() {
        const scrollTopBtn = document.createElement('button');
        scrollTopBtn.className = 'scroll-top';
        scrollTopBtn.innerHTML = '↑';
        scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollTopBtn);

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 500 && introComplete) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // -------------------------------------------------------
    //  SMOOTH SCROLLING for nav links
    // -------------------------------------------------------
    function setupSmoothScrolling() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    const navH = document.getElementById('navbar').offsetHeight;
                    window.scrollTo({
                        top: targetEl.offsetTop - navH,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // -------------------------------------------------------
    //  SCROLL ANIMATIONS for sections
    // -------------------------------------------------------
    function setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        // Observe sections (skip hero-scroll-section itself)
        document.querySelectorAll('section:not(.hero-scroll-section)').forEach(s => {
            s.classList.add('animate-on-scroll');
            observer.observe(s);
        });

        document.querySelectorAll('.skill-category, .project-card, .about-card, .achievement-item').forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    // -------------------------------------------------------
    //  HOVER EFFECTS
    // -------------------------------------------------------
    function setupHoverEffects() {
        document.querySelectorAll('.skill-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(1.15) rotate(5deg)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1) rotate(0deg)';
            });
        });

        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x-percent', `${x}%`);
                card.style.setProperty('--mouse-y-percent', `${y}%`);
            });
        });
    }

    // -------------------------------------------------------
    //  GLOBAL: scrollToSection (called from onclick)
    // -------------------------------------------------------
    window.scrollToSection = function (sectionId) {
        const el = document.getElementById(sectionId);
        if (el) {
            const navH = document.getElementById('navbar').offsetHeight;
            window.scrollTo({
                top: el.offsetTop - navH,
                behavior: 'smooth'
            });
        }
    };

})();