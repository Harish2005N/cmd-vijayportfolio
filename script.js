// ==========================================================
//  CINEMATIC PORTFOLIO — FIXED INTRO + HERO IMAGE SYSTEM
// ==========================================================

(function () {
    'use strict';

    // -------------------------------------------------------
    //  GLOBAL REFERENCES (set once after DOM ready)
    // -------------------------------------------------------
    let introScreen, navbar;
    let heroSection, heroProfileImg;
    let heroNameEn, heroNameTa;
    let introComplete = false;

    // -------------------------------------------------------
    //  BOOT
    // -------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        // Cache DOM nodes
        introScreen = document.getElementById('intro-screen');
        navbar      = document.getElementById('navbar');
        heroSection = document.querySelector('.hero-scroll-section');
        heroProfileImg = document.getElementById('hero-profile-img');
        heroNameEn  = document.getElementById('hero-name-en');
        heroNameTa  = document.getElementById('hero-name-ta');

        // Add SVG blur filter for the glow
        injectSVGFilter();

        // Lock scroll during intro
        document.body.style.overflow = 'hidden';

        // Run intro sequence
        runIntroSequence();

        // Setup scroll-based hero transition
        setupHeroScrollTransition();

        // Setup About section scroll-driven animation
        setupAboutSection();

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
        // SVG filter no longer needed - removed slice effect
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
    //  APPLY HERO TRANSITION — name fade transition
    // -------------------------------------------------------
    function applyHeroTransition(progress) {
        // --- PHASE 1: English name visible, Tamil hidden ---
        if (progress <= 0.4) {
            heroNameEn.style.opacity = '1';
            heroNameTa.style.opacity = '0';
            return;
        }

        // --- PHASE 2: Crossfade transition ---
        if (progress <= 0.7) {
            const t = (progress - 0.4) / 0.3; // 0..1
            heroNameEn.style.opacity = String(1 - t);
            heroNameTa.style.opacity = String(t);
            return;
        }

        // --- PHASE 3: Tamil name fully visible ---
        heroNameEn.style.opacity = '0';
        heroNameTa.style.opacity = '1';
    }

    // -------------------------------------------------------
    //  ABOUT SECTION - Scroll-locked animation
    //  Tamil first, then English flip at end
    // -------------------------------------------------------
    let aboutSectionEl, bgImage1El, bgImage2El;

    function setupAboutSection() {
        aboutSectionEl = document.getElementById('about');
        bgImage1El = document.getElementById('bg-image-1');
        bgImage2El = document.getElementById('bg-image-2');

        if (!aboutSectionEl || !bgImage1El || !bgImage2El) return;

        // Create scroll container for locked scroll effect
        const scrollContainer = document.createElement('div');
        scrollContainer.id = 'about-scroll-wrapper';
        scrollContainer.style.height = '400vh';
        aboutSectionEl.parentNode.insertBefore(scrollContainer, aboutSectionEl);
        scrollContainer.appendChild(aboutSectionEl);

        // Make section sticky
        aboutSectionEl.style.position = 'sticky';
        aboutSectionEl.style.top = '0';
        aboutSectionEl.style.height = '100vh';
        aboutSectionEl.style.overflow = 'hidden';

        window.addEventListener('scroll', onAboutScroll, { passive: true });
        onAboutScroll();
    }

    function onAboutScroll() {
        if (!aboutSectionEl) return;

        const wrapper = document.getElementById('about-scroll-wrapper');
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        const windowH = window.innerHeight;

        // Progress: 0 when enters, 1 when leaves
        let progress = Math.max(0, Math.min(1,
            -rect.top / (wrapper.offsetHeight - windowH)
        ));

        applyAboutAnimation(progress);
    }

    function applyAboutAnimation(progress) {
        if (!bgImage1El || !bgImage2El) return;

        const cards = document.querySelectorAll('.about-card');

        // Phase 1: Image transition (0% - 50% of scroll)
        const imageProgress = Math.min(1, progress / 0.5);

        bgImage1El.style.opacity = String(1 - imageProgress);
        bgImage1El.style.transform = 'none';

        bgImage2El.style.opacity = '1';
        bgImage2El.style.clipPath = `inset(0 ${100 - imageProgress * 100}% 0 0)`;

        // Phase 2: Cards flip from Tamil to English (50% - 100% of scroll)
        // Once flipped, cards stay flipped (don't flip back when scrolling up)
        const flipStart = 0.5;
        const flipEnd = 1.0;

        if (progress >= flipStart) {
            const flipProgress = Math.min(1, (progress - flipStart) / (flipEnd - flipStart));
            const totalCards = cards.length;
            const staggerStep = 0.08;
            const flipDuration = 0.18;

            cards.forEach((card, index) => {
                const reverseIndex = totalCards - 1 - index;
                const delay = reverseIndex * staggerStep;
                const cardProgress = Math.max(0, Math.min(1, (flipProgress - delay) / flipDuration));

                if (cardProgress > 0) {
                    card.classList.add('flipped');
                }
            });
        }

        // Final state
        if (progress >= 0.98) {
            bgImage1El.style.opacity = '0';
            bgImage2El.style.opacity = '1';
            bgImage2El.style.clipPath = 'inset(0 0% 0 0)';
            cards.forEach(card => card.classList.add('flipped'));
        }

        // Reset only when at very top (progress near 0)
        if (progress <= 0.01) {
            bgImage1El.style.opacity = '1';
            bgImage2El.style.opacity = '0';
            bgImage2El.style.clipPath = 'inset(0 100% 0 0)';
            cards.forEach(card => card.classList.remove('flipped'));
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

// ==========================================================
//  DYNAMIC DATA — fetch from backend API
// ==========================================================
(function () {
    'use strict';

    // Helper: escape HTML to prevent XSS
    function esc(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Helper: build image slider markup
    function buildImageMarkup(imageSources, title, wrapperClass, imgClass, frameClass) {
        if (!imageSources || !imageSources.length) return '';
        const isSlideshow = imageSources.length > 1;
        const slideshowClass = isSlideshow ? ' project-image-frame--slideshow' : '';
        const imagesJson = esc(JSON.stringify(imageSources));

        const dotsHtml = isSlideshow
            ? `<div class="slider-dots">${imageSources.map((_, i) => `<span class="slider-dot${i === 0 ? ' active' : ''}"></span>`).join('')}</div>`
            : '';
        const btnsHtml = isSlideshow
            ? `<button class="slider-btn slider-btn--prev" aria-label="Previous">&#8249;</button>
               <button class="slider-btn slider-btn--next" aria-label="Next">&#8250;</button>`
            : '';

        return `<div class="${wrapperClass}">
            <div class="${frameClass}${slideshowClass}" data-images='${imagesJson}' data-title="${esc(title)}">
                <img class="${imgClass}" src="${esc(imageSources[0])}" alt="${esc(title)}">
                ${btnsHtml}
                ${dotsHtml}
            </div>
        </div>`;
    }

    // Image slider: wire up prev/next buttons after render
    function initImageSliders() {
        document.querySelectorAll('.project-image-frame--slideshow, .media-frame.project-image-frame--slideshow').forEach(frame => {
            if (frame.dataset.sliderInit) return;
            frame.dataset.sliderInit = '1';

            let images;
            try { images = JSON.parse(frame.dataset.images); } catch { return; }
            if (!images || images.length < 2) return;

            let current = 0;
            const img = frame.querySelector('img');
            const dots = frame.querySelectorAll('.slider-dot');

            function goTo(idx) {
                current = (idx + images.length) % images.length;
                img.style.opacity = '0';
                setTimeout(() => {
                    img.src = images[current];
                    img.style.opacity = '1';
                }, 200);
                dots.forEach((d, i) => d.classList.toggle('active', i === current));
            }

            img.style.transition = 'opacity 0.2s ease';

            frame.querySelector('.slider-btn--prev')?.addEventListener('click', (e) => {
                e.stopPropagation();
                goTo(current - 1);
            });
            frame.querySelector('.slider-btn--next')?.addEventListener('click', (e) => {
                e.stopPropagation();
                goTo(current + 1);
            });
            dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
        });
    }

    // -------------------------------------------------------
    //  FETCH PROJECTS
    // -------------------------------------------------------
    async function fetchProjects() {
        try {
            const res = await fetch('/api/projects');
            if (!res.ok) throw new Error('API error');
            const projects = await res.json();
            const container = document.getElementById('projects-container');
            if (!container) return;
            if (!projects.length) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:3rem;">No projects found. Add some from <a href="/admin" style="color:var(--primary-gold)">Admin Panel</a>!</p>';
                return;
            }
            container.innerHTML = projects.map(p => {
                const techTags = (p.technologies || []).map(t => `<span class="tech-tag">${esc(t)}</span>`).join('');
                const imgs = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []);
                const slideshowId = `project-slideshow-${esc(p._id || '0')}`;
                const imageMarkup = buildSlideshowMarkup(imgs, p.title, slideshowId);
                return `<div class="project-card">
                    ${imageMarkup}
                    <div class="project-title">${esc(p.title)}</div>
                    <div class="project-date">${esc(p.date || '')}</div>
                    <p class="project-desc">${esc(p.description)}</p>
                    <div class="project-tech">${techTags}</div>
                    ${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noreferrer" class="cert-link" style="margin:0 2rem 1.5rem;">View Project ↗</a>` : ''}
                </div>`;
            }).join('');
            initProjectSlideshows();
        } catch (err) {
            console.error('Failed to load projects:', err);
        }
    }

    // -------------------------------------------------------
    //  BUILD SLIDESHOW MARKUP
    // -------------------------------------------------------
    function buildSlideshowMarkup(images, title, slideshowId) {
        if (!images || !images.length) {
            return `<div class="project-media"><div class="project-image-frame"><div class="project-image-placeholder"></div></div></div>`;
        }
        const imagesJson = esc(JSON.stringify(images));
        const dotsHtml = images.map((_, i) => `<span class="slideshow-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`).join('');

        return `<div class="project-media">
            <div class="project-image-frame project-slideshow" id="${slideshowId}" data-images='${imagesJson}'>
                <img class="project-image" src="${esc(images[0])}" alt="${esc(title)}">
                <div class="slideshow-dots">${dotsHtml}</div>
            </div>
        </div>`;
    }

    // -------------------------------------------------------
    //  INIT PROJECT SLIDESHOWS
    // -------------------------------------------------------
    function initProjectSlideshows() {
        document.querySelectorAll('.project-slideshow').forEach(slideshow => {
            if (slideshow.dataset.sliderInit) return;
            slideshow.dataset.sliderInit = '1';

            let images;
            try { images = JSON.parse(slideshow.dataset.images); } catch { return; }
            if (!images || images.length < 2) return;

            let currentIndex = 0;
            const img = slideshow.querySelector('img');
            const dots = slideshow.querySelectorAll('.slideshow-dot');
            let interval;

            function showImage(index) {
                currentIndex = (index + images.length) % images.length;
                img.style.opacity = '0';
                setTimeout(() => {
                    img.src = images[currentIndex];
                    img.style.opacity = '1';
                }, 300);
                dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
            }

            function nextImage() {
                showImage(currentIndex + 1);
            }

            function startAutoplay() {
                interval = setInterval(nextImage, 3000);
            }

            function stopAutoplay() {
                clearInterval(interval);
            }

            // Dot click handlers
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showImage(index);
                    stopAutoplay();
                    startAutoplay();
                });
            });

            // Pause on hover
            slideshow.addEventListener('mouseenter', stopAutoplay);
            slideshow.addEventListener('mouseleave', startAutoplay);

            img.style.transition = 'opacity 0.3s ease';

            // Start autoplay
            startAutoplay();
        });
    }

    // -------------------------------------------------------
    //  FETCH SKILLS
    // -------------------------------------------------------
    async function fetchSkills() {
        try {
            const res = await fetch('/api/skills');
            if (!res.ok) throw new Error('API error');
            const skills = await res.json();
            const container = document.getElementById('skills-container');
            if (!container) return;
            if (!skills.length) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:3rem;">No skills found. Add some from <a href="/admin" style="color:var(--primary-gold)">Admin Panel</a>!</p>';
                return;
            }
            container.innerHTML = skills.map(s => `
                <div class="skill-card">
                    <div class="skill-icon">${s.icon || '🛠️'}</div>
                    <div class="skill-category">${esc(s.category)}</div>
                    <div class="skill-tags">${(s.items || []).map(item => `<span class="tag">${esc(item)}</span>`).join('')}</div>
                </div>`).join('');
        } catch (err) {
            console.error('Failed to load skills:', err);
        }
    }

    // -------------------------------------------------------
    //  FETCH ACHIEVEMENTS
    // -------------------------------------------------------
    async function fetchAchievements() {
        try {
            const res = await fetch('/api/achievements');
            if (!res.ok) throw new Error('API error');
            const achievements = await res.json();
            const container = document.getElementById('achievements-container');
            if (!container) return;
            if (!achievements.length) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:3rem;">No achievements found. Add some from <a href="/admin" style="color:var(--primary-gold)">Admin Panel</a>!</p>';
                return;
            }
            container.innerHTML = achievements.map(a => `
                <div class="achieve-card">
                    <div class="achieve-icon">${a.icon || '🏆'}</div>
                    <div class="achieve-text">${esc(a.text)}</div>
                </div>`).join('');
        } catch (err) {
            console.error('Failed to load achievements:', err);
        }
    }

    // -------------------------------------------------------
    //  FETCH COURSES
    // -------------------------------------------------------
    async function fetchCourses() {
        try {
            const res = await fetch('/api/courses');
            if (!res.ok) throw new Error('API error');
            const courses = await res.json();
            const container = document.getElementById('courses-container');
            if (!container) return;
            if (!courses.length) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:3rem;">No courses found. Add some from <a href="/admin" style="color:var(--primary-gold)">Admin Panel</a>!</p>';
                return;
            }
            container.innerHTML = courses.map(c => {
                const imgs = Array.isArray(c.images) && c.images.length ? c.images : (c.image ? [c.image] : []);
                const imageMarkup = buildImageMarkup(imgs, c.title, 'course-media', 'media-image', 'media-frame');
                return `<div class="course-card">
                    ${imageMarkup}
                    <div class="course-title">${esc(c.title)}</div>
                    <div class="course-platform">${esc(c.platform || '')}</div>
                    <div class="course-date">${esc(c.date || '')}</div>
                    ${c.link ? `<a class="course-link" href="${esc(c.link)}" target="_blank" rel="noreferrer">View Course ↗</a>` : ''}
                    ${c.certificate_url ? `<a class="course-link" href="${esc(c.certificate_url)}" target="_blank" rel="noreferrer">Certificate ↗</a>` : ''}
                </div>`;
            }).join('');
            initImageSliders();
        } catch (err) {
            console.error('Failed to load courses:', err);
        }
    }

    // -------------------------------------------------------
    //  ABOUT SECTION SLIDESHOW
    // -------------------------------------------------------
    function setupAboutSlideshow() {
        const stage = document.getElementById('about-vijay-stage');
        if (!stage) return;

        const images = stage.querySelectorAll('.about-vijay-image');
        const dots = document.querySelectorAll('.slideshow-dots .dot');
        if (images.length < 2) return;

        let currentIndex = 0;
        let interval;

        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.toggle('active', i === index);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            currentIndex = index;
        }

        function nextImage() {
            showImage((currentIndex + 1) % images.length);
        }

        function startAutoplay() {
            interval = setInterval(nextImage, 3000);
        }

        function stopAutoplay() {
            clearInterval(interval);
        }

        // Dot click handlers
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showImage(index);
                stopAutoplay();
                startAutoplay();
            });
        });

        // Pause on hover
        stage.addEventListener('mouseenter', stopAutoplay);
        stage.addEventListener('mouseleave', startAutoplay);

        // Start autoplay
        startAutoplay();
    }

    // Boot all fetches on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        fetchProjects();
        fetchSkills();
        fetchAchievements();
        fetchCourses();
    });

    // -------------------------------------------------------
    //  FULLSCREEN IMAGE LIGHTBOX
    // -------------------------------------------------------
    function setupImageLightbox() {
        const lightbox = document.getElementById('image-lightbox');
        if (!lightbox) return;

        const lightboxImg = lightbox.querySelector('.lightbox-image');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const backdrop = lightbox.querySelector('.lightbox-backdrop');

        function openLightbox(src) {
            if (!src) return;
            lightboxImg.src = src;
            lightbox.classList.remove('is-closing');
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.add('is-closing');
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            setTimeout(() => {
                if (!lightbox.classList.contains('is-open')) {
                    lightboxImg.src = '';
                }
            }, 700);
        }

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });

        backdrop.addEventListener('click', closeLightbox);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
                closeLightbox();
            }
        });

        // Clickable course/certificate images
        document.addEventListener('click', (e) => {
            const mediaImage = e.target.closest('.media-image');
            if (!mediaImage) return;

            const src = mediaImage.getAttribute('src');
            if (src) {
                openLightbox(src);
            }
        });
    }

    // Initialize lightbox after courses load
    const originalFetchCourses = fetchCourses;
    fetchCourses = async function () {
        await originalFetchCourses();
        setupImageLightbox();
    };

})();