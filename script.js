/**
 * ============================================================
 *  PRESENTATION ENGINE — Блок · Стихи о Прекрасной Даме
 *  Features: keyboard/touch/wheel nav, particle system,
 *  star field, progress bar, dot nav, smooth transitions
 * ============================================================
 */

(function () {
    'use strict';

    // ==================== CONFIGURATION ====================
    const CONFIG = {
        totalSlides: 10,
        particleCount: 60,
        starCount: 80,
        transitionDuration: 700,
        autoHideHintDelay: 8000,
        swipeThreshold: 50,
    };

    // ==================== STATE ====================
    let currentSlide = 1;
    let isAnimating = false;
    let touchStartX = 0;
    let touchStartY = 0;

    // ==================== DOM ELEMENTS ====================
    const slides = document.querySelectorAll('.slide');
    const progressFill = document.getElementById('progressFill');
    const currentSlideEl = document.getElementById('currentSlide');
    const totalSlidesEl = document.getElementById('totalSlides');
    const dotsNav = document.getElementById('dotsNav');
    const navPrev = document.getElementById('navPrev');
    const navNext = document.getElementById('navNext');
    const hint = document.getElementById('hint');
    const bgStars = document.getElementById('bgStars');
    const particleCanvas = document.getElementById('particleCanvas');

    // ==================== INITIALIZATION ====================
    function init() {
        totalSlidesEl.textContent = String(CONFIG.totalSlides).padStart(2, '0');
        createDots();
        createStars();
        initParticles();
        updateUI();
        bindEvents();
        autoHideHint();
    }

    // ==================== NAVIGATION ====================
    function goToSlide(n) {
        if (isAnimating) return;
        if (n < 1 || n > CONFIG.totalSlides) return;
        if (n === currentSlide) return;

        isAnimating = true;

        // Remove active from current
        slides[currentSlide - 1].classList.remove('active');

        // Set new
        currentSlide = n;
        slides[currentSlide - 1].classList.add('active');

        updateUI();

        setTimeout(() => {
            isAnimating = false;
        }, CONFIG.transitionDuration);
    }

    function nextSlide() {
        if (currentSlide < CONFIG.totalSlides) {
            goToSlide(currentSlide + 1);
        }
    }

    function prevSlide() {
        if (currentSlide > 1) {
            goToSlide(currentSlide - 1);
        }
    }

    // ==================== UI UPDATE ====================
    function updateUI() {
        // Counter
        currentSlideEl.textContent = String(currentSlide).padStart(2, '0');

        // Progress
        const progress = (currentSlide / CONFIG.totalSlides) * 100;
        progressFill.style.width = progress + '%';

        // Dots
        const dots = dotsNav.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide - 1);
        });

        // Arrow visibility
        navPrev.style.opacity = currentSlide === 1 ? '0.3' : '1';
        navPrev.style.pointerEvents = currentSlide === 1 ? 'none' : 'auto';
        navNext.style.opacity = currentSlide === CONFIG.totalSlides ? '0.3' : '1';
        navNext.style.pointerEvents = currentSlide === CONFIG.totalSlides ? 'none' : 'auto';
    }

    // ==================== DOTS ====================
    function createDots() {
        for (let i = 0; i < CONFIG.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
            dot.addEventListener('click', () => goToSlide(i + 1));
            dotsNav.appendChild(dot);
        }
    }

    // ==================== STARS ====================
    function createStars() {
        for (let i = 0; i < CONFIG.starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.setProperty('--dur', (2 + Math.random() * 4) + 's');
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.width = (1 + Math.random() * 2) + 'px';
            star.style.height = star.style.width;
            bgStars.appendChild(star);
        }
    }

    // ==================== PARTICLES ====================
    let particles = [];
    let ctx;
    let canvasW, canvasH;

    function initParticles() {
        ctx = particleCanvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push(createParticle());
        }

        animateParticles();
    }

    function resizeCanvas() {
        canvasW = window.innerWidth;
        canvasH = window.innerHeight;
        particleCanvas.width = canvasW;
        particleCanvas.height = canvasH;
    }

    function createParticle() {
        return {
            x: Math.random() * canvasW,
            y: Math.random() * canvasH,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: -Math.random() * 0.5 - 0.1,
            opacity: Math.random() * 0.5 + 0.1,
            fadeDir: Math.random() > 0.5 ? 1 : -1,
            hue: Math.random() > 0.5 ? 45 : 270, // gold or lavender
        };
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvasW, canvasH);

        particles.forEach((p) => {
            // Move
            p.x += p.speedX;
            p.y += p.speedY;

            // Fade
            p.opacity += p.fadeDir * 0.003;
            if (p.opacity >= 0.6) p.fadeDir = -1;
            if (p.opacity <= 0.05) p.fadeDir = 1;

            // Reset if off-screen
            if (p.y < -10) {
                p.y = canvasH + 10;
                p.x = Math.random() * canvasW;
            }
            if (p.x < -10) p.x = canvasW + 10;
            if (p.x > canvasW + 10) p.x = -10;

            // Draw
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            const color = p.hue === 45
                ? `rgba(201, 168, 76, ${p.opacity})`
                : `rgba(184, 169, 232, ${p.opacity})`;
            ctx.fillStyle = color;
            ctx.fill();
        });

        requestAnimationFrame(animateParticles);
    }

    // ==================== EVENT BINDINGS ====================
    function bindEvents() {
        // Keyboard
        document.addEventListener('keydown', handleKeydown);

        // Arrows
        navPrev.addEventListener('click', prevSlide);
        navNext.addEventListener('click', nextSlide);

        // Wheel
        let wheelTimeout = null;
        document.addEventListener('wheel', (e) => {
            if (wheelTimeout) return;
            wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 800);

            if (e.deltaY > 30) nextSlide();
            else if (e.deltaY < -30) prevSlide();
        }, { passive: true });

        // Touch
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].screenX - touchStartX;
            const dy = e.changedTouches[0].screenY - touchStartY;

            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > CONFIG.swipeThreshold) {
                if (dx < 0) nextSlide();
                else prevSlide();
            }
        }, { passive: true });
    }

    function handleKeydown(e) {
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                prevSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(CONFIG.totalSlides);
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
        }
    }

    // ==================== FULLSCREEN ====================
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen();
        }
    }

    // ==================== AUTO-HIDE HINT ====================
    function autoHideHint() {
        setTimeout(() => {
            if (hint) hint.classList.add('hidden');
        }, CONFIG.autoHideHintDelay);
    }

    // ==================== LAUNCH ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
