document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. PARTICLE CANVAS (HEARTS & PETALS)
    // ==========================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let ambientParticles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor(x, y, isBurst = false) {
            this.x = x;
            this.y = y;
            this.isBurst = isBurst;
            this.type = Math.random() > 0.4 ? 'heart' : 'petal';

            if (isBurst) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 7 + 2.5;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - 2.5;
                this.size = Math.random() * 15 + 8;
                this.alpha = 1;
                this.decay = Math.random() * 0.016 + 0.012;
                this.gravity = 0.08;
                this.color = `hsl(${Math.random() * 25 + 345}, 85%, ${Math.random() * 20 + 55}%)`;
            } else {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = -(Math.random() * 0.75 + 0.35);
                this.size = Math.random() * 10 + 6;
                this.alpha = Math.random() * 0.35 + 0.15;
                this.decay = 0;
                this.gravity = 0;
                this.color = `hsl(${Math.random() * 25 + 345}, 70%, ${Math.random() * 20 + 45}%)`;
            }

            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.035;
            this.flipSpeed = Math.random() * 0.03 + 0.01;
            this.flipAngle = Math.random() * Math.PI;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(Math.cos(this.flipAngle), 1);
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;

            if (this.type === 'heart') {
                const s = this.size / 10;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-5 * s, -5 * s, -10 * s, 2 * s, 0, 10 * s);
                ctx.bezierCurveTo(10 * s, 2 * s, 5 * s, -5 * s, 0, 0);
                ctx.fill();
            } else {
                const w = this.size * 0.8;
                const h = this.size * 1.3;
                ctx.beginPath();
                ctx.ellipse(0, 0, w / 2, h / 2, Math.PI / 4, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.rotation += this.rotSpeed;
            this.flipAngle += this.flipSpeed;

            if (this.isBurst) {
                this.alpha -= this.decay;
            } else {
                if (this.y < -20) {
                    this.y = canvas.height + 20;
                    this.x = Math.random() * canvas.width;
                }
                if (this.x < -20) this.x = canvas.width + 20;
                if (this.x > canvas.width + 20) this.x = -20;
            }
        }
    }

    function initAmbientParticles() {
        ambientParticles = [];
        const count = window.innerWidth < 768 ? 24 : 42;
        for (let i = 0; i < count; i++) {
            ambientParticles.push(new Particle(0, 0, false));
        }
    }

    function triggerParticleBurst(originX, originY) {
        for (let i = 0; i < 75; i++) {
            particles.push(new Particle(originX, originY, true));
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ambientParticles.forEach(p => {
            p.update();
            p.draw();
        });

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();
            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animateParticles);
    }

    initAmbientParticles();
    animateParticles();

    // ==========================================
    // 2. MOUSE SPARKLE TRAIL
    // ==========================================
    let lastSparkleTime = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastSparkleTime > 70) {
            lastSparkleTime = now;
            createCursorHeart(e.clientX, e.clientY);
        }
    });

    function createCursorHeart(x, y) {
        const heart = document.createElement('div');
        heart.className = 'cursor-heart';
        const icons = ['❤️', '✨', '💖', '🌸', '💫'];
        heart.textContent = icons[Math.floor(Math.random() * icons.length)];
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.fontSize = `${Math.random() * 8 + 11}px`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1000);
    }

    // ==========================================
    // 3. ROMANTIC AMBIENT BGM (WEB AUDIO API)
    // ==========================================
    let audioCtx = null;
    let isMusicPlaying = false;
    let musicInterval = null;

    const notes = {
        C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
        C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00
    };

    // Romantic dreamy melody sequence (Canon in D / River Flows in You style progression)
    const melody = [
        { note: notes.E5, dur: 0.8 }, { note: notes.D5, dur: 0.4 }, { note: notes.C5, dur: 0.6 },
        { note: notes.G4, dur: 0.8 }, { note: notes.A4, dur: 0.4 }, { note: notes.C5, dur: 0.6 },
        { note: notes.E5, dur: 0.8 }, { note: notes.G5, dur: 0.8 }, { note: notes.D5, dur: 1.2 },
        { note: notes.C5, dur: 0.6 }, { note: notes.B4, dur: 0.4 }, { note: notes.C5, dur: 0.8 },
        { note: notes.A4, dur: 0.8 }, { note: notes.F4, dur: 0.4 }, { note: notes.G4, dur: 1.4 }
    ];

    let melodyStep = 0;

    function playRomanticTone(freq, duration = 0.8, type = 'sine') {
        if (!audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            // Warm envelope
            gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.warn('Audio note error:', e);
        }
    }

    function startRomanticMusic() {
        if (isMusicPlaying) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            isMusicPlaying = true;
            const btnMusic = document.getElementById('btnMusic');
            if (btnMusic) btnMusic.classList.add('active');

            // Play background music box loop
            musicInterval = setInterval(() => {
                if (!isMusicPlaying) return;
                const item = melody[melodyStep % melody.length];
                playRomanticTone(item.note, item.dur * 1.5, 'sine');
                // Subtle harmonic fifth chord on some beats
                if (melodyStep % 3 === 0) {
                    playRomanticTone(item.note * 0.5, item.dur * 1.8, 'triangle');
                }
                melodyStep++;
            }, 600);
        } catch (e) {
            console.warn('Autoplay prevented or audio context failed:', e);
        }
    }

    function stopRomanticMusic() {
        isMusicPlaying = false;
        const btnMusic = document.getElementById('btnMusic');
        if (btnMusic) btnMusic.classList.remove('active');
        if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        }
    }

    const btnMusic = document.getElementById('btnMusic');
    if (btnMusic) {
        btnMusic.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isMusicPlaying) {
                stopRomanticMusic();
            } else {
                startRomanticMusic();
            }
        });
    }

    // ==========================================
    // 4. GSAP TIMELINE & ENVELOPE LOGIC
    // ==========================================
    let isOpen = false;
    let isAnimating = false;
    const mainTimeline = gsap.timeline({ paused: true });

    function getFilmStripNormalProps() {
        const isMobile = window.innerWidth <= 480;
        const isSmall = window.innerWidth <= 360;
        const isTiny = window.innerWidth <= 330;
        const isDesktop = window.innerWidth > 480;
        const isDesktopTiny = isDesktop && window.innerHeight < 620;
        const isDesktopShort = isDesktop && window.innerHeight < 740;
        const isDesktopLarge = isDesktop && window.innerWidth >= 1440 && window.innerHeight >= 850;
        const isDesktopUltra = isDesktop && window.innerWidth >= 1920 && window.innerHeight >= 1000;

        if (isTiny) {
            return { xPercent: 18, y: -52, rotate: 2.5, scale: 0.54 };
        } else if (isSmall) {
            return { xPercent: 25, y: -62, rotate: 3.5, scale: 0.62 };
        } else if (isMobile) {
            return { xPercent: 32, y: -68, rotate: 4.5, scale: 0.68 };
        } else if (isDesktopTiny) {
            return { xPercent: 50, y: -50, rotate: 4.5, scale: 0.70 };
        } else if (isDesktopShort) {
            return { xPercent: 52, y: -58, rotate: 5, scale: 0.75 };
        } else if (isDesktopUltra) {
            return { xPercent: 58, y: -84, rotate: 6, scale: 0.94 };
        } else if (isDesktopLarge) {
            return { xPercent: 56, y: -78, rotate: 5.5, scale: 0.88 };
        } else {
            return { xPercent: 55, y: -72, rotate: 5.5, scale: 0.82 };
        }
    }

    function buildGSAPTimeline() {
        mainTimeline.clear();

        const isMobile = window.innerWidth <= 480;
        const isSmall = window.innerWidth <= 360;
        const isTiny = window.innerWidth <= 330;
        const isDesktop = window.innerWidth > 480;
        const isDesktopTiny = isDesktop && window.innerHeight < 620;
        const isDesktopShort = isDesktop && window.innerHeight < 740;
        const isDesktopLarge = isDesktop && window.innerWidth >= 1440 && window.innerHeight >= 850;
        const isDesktopUltra = isDesktop && window.innerWidth >= 1920 && window.innerHeight >= 1000;

        let slideUpY = -230;
        let settleY = -30;
        let letterScale = 1.12;

        if (isTiny) {
            slideUpY = -140; settleY = -8; letterScale = 1.02;
        } else if (isSmall) {
            slideUpY = -160; settleY = -15; letterScale = 1.04;
        } else if (isMobile) {
            slideUpY = -185; settleY = -20; letterScale = 1.07;
        } else if (isDesktopTiny) {
            slideUpY = -150; settleY = -12; letterScale = 1.05;
        } else if (isDesktopShort) {
            slideUpY = -180; settleY = -20; letterScale = 1.08;
        } else if (isDesktopUltra) {
            slideUpY = -280; settleY = -38; letterScale = 1.18;
        } else if (isDesktopLarge) {
            slideUpY = -255; settleY = -34; letterScale = 1.15;
        }

        const filmProps = getFilmStripNormalProps();

        gsap.set("#photobooth-strip", {
            xPercent: -50,
            y: 10,
            rotate: 0,
            scale: 0.8,
            opacity: 0,
            zIndex: 8
        });

        mainTimeline.to("#open-hint", {
            opacity: 0,
            y: 10,
            duration: 0.3,
            ease: "power2.out"
        }, 0);

        mainTimeline.to("#wax-seal", {
            scale: 1.35,
            opacity: 0,
            duration: 0.4,
            ease: "back.in(1.7)"
        }, 0.05);

        mainTimeline.to("#top-flap", {
            rotateX: 180,
            duration: 0.85,
            ease: "power2.inOut"
        }, 0.25);

        mainTimeline.set("#top-flap", { zIndex: 5 }, 0.65);

        mainTimeline.to("#letter", {
            y: slideUpY,
            duration: 0.85,
            ease: "power2.out"
        }, 0.75);

        mainTimeline.set("#letter", { zIndex: 40 }, 1.5);
        mainTimeline.set("#photobooth-strip", { zIndex: 35 }, 1.5);

        mainTimeline.to("#letter", {
            y: settleY,
            scale: letterScale,
            duration: 0.85,
            ease: "back.out(1.2)"
        }, 1.55);

        mainTimeline.to("#photobooth-strip", {
            opacity: 1,
            xPercent: filmProps.xPercent,
            y: filmProps.y,
            rotate: filmProps.rotate,
            scale: filmProps.scale,
            duration: 0.9,
            ease: "back.out(1.35)"
        }, 1.55);

        mainTimeline.fromTo(".letter-page.active > *",
            { opacity: 0, y: 12 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.14,
                ease: "power2.out"
            },
            1.85
        );
    }

    buildGSAPTimeline();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isOpen) {
                buildGSAPTimeline();
            } else {
                const filmProps = getFilmStripNormalProps();
                const isMobile = window.innerWidth <= 480;
                const isSmall = window.innerWidth <= 360;
                const isTiny = window.innerWidth <= 330;
                const isDesktop = window.innerWidth > 480;
                const isDesktopTiny = isDesktop && window.innerHeight < 620;
                const isDesktopShort = isDesktop && window.innerHeight < 740;
                const isDesktopLarge = isDesktop && window.innerWidth >= 1440 && window.innerHeight >= 850;
                const isDesktopUltra = isDesktop && window.innerWidth >= 1920 && window.innerHeight >= 1000;

                let settleY = -30;
                let letterScale = 1.12;

                if (isTiny) {
                    settleY = -8; letterScale = 1.02;
                } else if (isSmall) {
                    settleY = -15; letterScale = 1.04;
                } else if (isMobile) {
                    settleY = -20; letterScale = 1.07;
                } else if (isDesktopTiny) {
                    settleY = -12; letterScale = 1.05;
                } else if (isDesktopShort) {
                    settleY = -20; letterScale = 1.08;
                } else if (isDesktopUltra) {
                    settleY = -38; letterScale = 1.18;
                } else if (isDesktopLarge) {
                    settleY = -34; letterScale = 1.15;
                }

                gsap.to("#letter", {
                    y: settleY,
                    scale: letterScale,
                    duration: 0.3
                });

                gsap.to("#photobooth-strip", {
                    xPercent: filmProps.xPercent,
                    y: filmProps.y,
                    rotate: filmProps.rotate,
                    scale: filmProps.scale,
                    duration: 0.3
                });
            }
        }, 200);
    });

    const waxSeal = document.getElementById('wax-seal');
    const envelope = document.getElementById('envelope');
    const photoboothStrip = document.getElementById('photobooth-strip');
    const openHint = document.getElementById('open-hint');
    const btnCloseEnvelope = document.getElementById('btnCloseEnvelope');
    const btnCloseEnvelopeTop = document.getElementById('btnCloseEnvelopeTop');

    const pages = document.querySelectorAll('.letter-page');
    const pageIndicator = document.getElementById('pageIndicator');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const nextBtnText = document.getElementById('nextBtnText');
    const nextBtnIcon = document.getElementById('nextBtnIcon');
    const letterContent = document.getElementById('letter-content');

    let currentPage = 1;
    const totalPages = pages.length;

    function openEnvelope() {
        if (isOpen || isAnimating) return;
        isOpen = true;

        const rect = waxSeal.getBoundingClientRect();
        const burstX = rect.left + rect.width / 2;
        const burstY = rect.top + rect.height / 2;

        triggerParticleBurst(burstX, burstY);
        startRomanticMusic();
        mainTimeline.play();

        setTimeout(() => {
            if (isOpen && photoboothStrip) {
                photoboothStrip.classList.add('ready-interact');
            }
        }, 2200);
    }

    waxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        openEnvelope();
    });

    envelope.addEventListener('click', (e) => {
        if (e.target.closest('.letter-footer') || e.target.closest('.letter-content') || e.target.closest('.letter-top-bar') || e.target.closest('.photobooth-strip')) {
            return;
        }
        if (!isOpen) {
            openEnvelope();
        }
    });

    // Photobooth Modal Interactions (Never cut off, 100% full view)
    const photoModal = document.getElementById('photoModal');
    const photoModalBackdrop = document.getElementById('photoModalBackdrop');
    const btnClosePhotoModal = document.getElementById('btnClosePhotoModal');
    const btnOpenPhotos = document.getElementById('btnOpenPhotos');

    function openPhotoModal() {
        if (!photoModal) return;
        photoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePhotoModal() {
        if (!photoModal) return;
        photoModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (photoboothStrip) {
        photoboothStrip.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isOpen || isAnimating) return;
            openPhotoModal();
        });
    }

    if (btnOpenPhotos) {
        btnOpenPhotos.addEventListener('click', (e) => {
            e.stopPropagation();
            openPhotoModal();
        });
    }

    if (photoModalBackdrop) {
        photoModalBackdrop.addEventListener('click', closePhotoModal);
    }

    if (btnClosePhotoModal) {
        btnClosePhotoModal.addEventListener('click', closePhotoModal);
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && photoModal && photoModal.classList.contains('active')) {
            closePhotoModal();
        }
    });

    function closeAndResealEnvelope() {
        if (!isOpen || isAnimating) return;
        isAnimating = true;

        closePhotoModal();

        if (photoboothStrip) {
            photoboothStrip.classList.remove('ready-interact');
        }

        const activePage = document.querySelector(`.letter-page[data-page="${currentPage}"]`);
        gsap.to(activePage, {
            opacity: 0,
            duration: 0.25,
            onComplete: () => {
                mainTimeline.eventCallback("onReverseComplete", () => {
                    const rect = waxSeal.getBoundingClientRect();
                    const sealX = rect.left + rect.width / 2;
                    const sealY = rect.top + rect.height / 2;

                    triggerParticleBurst(sealX, sealY);

                    pages.forEach(p => p.classList.remove('active'));
                    currentPage = 1;
                    document.querySelector(`.letter-page[data-page="1"]`).classList.add('active');
                    gsap.set(document.querySelectorAll('.letter-page'), { opacity: 1, x: 0 });
                    updateNavigationUI();

                    isOpen = false;
                    isAnimating = false;

                    gsap.to(openHint, { opacity: 1, y: 0, duration: 0.4 });
                    mainTimeline.eventCallback("onReverseComplete", null);
                });

                mainTimeline.reverse();
            }
        });
    }

    if (btnCloseEnvelope) {
        btnCloseEnvelope.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAndResealEnvelope();
        });
    }

    if (btnCloseEnvelopeTop) {
        btnCloseEnvelopeTop.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAndResealEnvelope();
        });
    }

    // Page Navigation
    function changePage(newPage) {
        if (isAnimating || newPage === currentPage || newPage < 1 || newPage > totalPages) return;
        isAnimating = true;

        const isGoingForward = newPage > currentPage;
        const activePage = document.querySelector(`.letter-page[data-page="${currentPage}"]`);
        const targetPage = document.querySelector(`.letter-page[data-page="${newPage}"]`);

        letterContent.scrollTo({ top: 0, behavior: 'smooth' });

        gsap.to(activePage, {
            opacity: 0,
            x: isGoingForward ? -20 : 20,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                activePage.classList.remove('active');
                gsap.set(activePage, { x: 0 });

                targetPage.classList.add('active');
                gsap.fromTo(targetPage,
                    { opacity: 0, x: isGoingForward ? 20 : -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.35,
                        ease: "power2.out",
                        onComplete: () => {
                            isAnimating = false;
                        }
                    }
                );
            }
        });

        currentPage = newPage;
        updateNavigationUI();
    }

    function updateNavigationUI() {
        pageIndicator.textContent = `Halaman ${currentPage} dari ${totalPages}`;
        prevBtn.disabled = currentPage === 1;

        if (currentPage === totalPages) {
            nextBtnText.textContent = "Baca Ulang ♥";
            nextBtnIcon.className = "fa-solid fa-heart";
            nextBtn.classList.add('re-read-pulse');
        } else {
            nextBtnText.textContent = "Selanjutnya";
            nextBtnIcon.className = "fa-solid fa-arrow-right";
            nextBtn.classList.remove('re-read-pulse');
        }
    }

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPage === totalPages) {
            changePage(1);
        } else {
            changePage(currentPage + 1);
        }
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPage > 1) {
            changePage(currentPage - 1);
        }
    });

    // 3D Tilt Effect on Desktop when closed
    document.addEventListener('mousemove', (e) => {
        if (isOpen) return;
        const xAxis = (window.innerWidth / 2 - e.pageX) / 35;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 35;
        envelope.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    // ==========================================
    // 5. THE CONFESSION INTERACTION (MENEMBAK)
    // ==========================================
    const btnConfessYes = document.getElementById('btnConfessYes');
    const btnConfessThink = document.getElementById('btnConfessThink');
    const celebrationModal = document.getElementById('celebrationModal');
    const btnCloseCelebration = document.getElementById('btnCloseCelebration');
    const btnVirtualHug = document.getElementById('btnVirtualHug');
    const btnShareWhatsApp = document.getElementById('btnShareWhatsApp');
    const thinkModal = document.getElementById('thinkModal');
    const btnCloseThink = document.getElementById('btnCloseThink');
    const btnShareWaThink = document.getElementById('btnShareWaThink');

    if (btnConfessThink) {
        btnConfessThink.addEventListener('click', (e) => {
            e.stopPropagation();
            updateWhatsAppLink();
            if (thinkModal) {
                thinkModal.classList.add('active');
            }
        });
    }

    if (btnCloseThink) {
        btnCloseThink.addEventListener('click', (e) => {
            e.stopPropagation();
            if (thinkModal) {
                thinkModal.classList.remove('active');
            }
        });
    }

    function fireCelebrationConfetti() {
        if (typeof confetti === 'function') {
            // Heart-shaped & colorful confetti storm
            const end = Date.now() + 2.5 * 1000;
            const colors = ['#ff4d6d', '#ffd700', '#c9184a', '#ff758c', '#ffffff'];

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 65,
                    origin: { x: 0, y: 0.7 },
                    colors: colors
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 65,
                    origin: { x: 1, y: 0.7 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }

    function acceptConfession() {
        fireCelebrationConfetti();
        startRomanticMusic();

        // Extra particle burst
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        triggerParticleBurst(centerX, centerY);

        // Update WhatsApp link based on current recipient and sender
        updateWhatsAppLink();

        // Show celebration modal
        setTimeout(() => {
            celebrationModal.classList.add('active');
        }, 500);
    }

    if (btnConfessYes) {
        btnConfessYes.addEventListener('click', (e) => {
            e.stopPropagation();
            acceptConfession();
        });
    }

    if (btnCloseCelebration) {
        btnCloseCelebration.addEventListener('click', (e) => {
            e.stopPropagation();
            celebrationModal.classList.remove('active');
        });
    }

    // Virtual Hug Button (Emits hundreds of heart emojis)
    if (btnVirtualHug) {
        btnVirtualHug.addEventListener('click', (e) => {
            e.stopPropagation();
            btnVirtualHug.innerHTML = '<i class="fa-solid fa-heart"></i> <span>Peluk Hangat Terkirim! 🥰</span>';
            for (let i = 0; i < 25; i++) {
                setTimeout(() => {
                    const x = Math.random() * window.innerWidth;
                    const y = Math.random() * window.innerHeight;
                    createCursorHeart(x, y);
                }, i * 40);
            }
            setTimeout(() => {
                btnVirtualHug.innerHTML = '<i class="fa-solid fa-hands-holding-child"></i> <span>Kirim Peluk Virtual 🤗</span>';
            }, 3000);
        });
    }

    // ==========================================
    // 6. CUSTOMIZATION (NAMES & WHATSAPP)
    // ==========================================
    const btnCustomize = document.getElementById('btnCustomize');
    const customizeModal = document.getElementById('customizeModal');
    const btnCloseCustomize = document.getElementById('btnCloseCustomize');
    const btnSaveCustomize = document.getElementById('btnSaveCustomize');

    const inputRecipient = document.getElementById('inputRecipient');
    const inputSender = document.getElementById('inputSender');
    const inputWhatsApp = document.getElementById('inputWhatsApp');

    const displayRecipientGreeting = document.getElementById('displayRecipientGreeting');
    const displaySenderSignature = document.getElementById('displaySenderSignature');
    const celebrationCoupleNames = document.getElementById('celebrationCoupleNames');
    const celebrationDateBadge = document.getElementById('celebrationDateBadge');
    const displayLetterDate = document.getElementById('displayLetterDate');

    // Load initial values from URL params or LocalStorage
    const urlParams = new URLSearchParams(window.location.search);
    let customRecipient = urlParams.get('to') || localStorage.getItem('love_letter_recipient') || 'Kamu yang Paling Istimewa';
    let customSender = urlParams.get('from') || localStorage.getItem('love_letter_sender') || 'Selalu Untukmu';
    let customWhatsApp = urlParams.get('wa') || localStorage.getItem('love_letter_wa') || '0895320372952';
    if (!customWhatsApp || customWhatsApp.trim() === '') {
        customWhatsApp = '0895320372952';
    }
    localStorage.setItem('love_letter_wa', customWhatsApp);

    // Format current Indonesian date
    const today = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const indonesianDate = today.toLocaleDateString('id-ID', options);

    function applyCustomization() {
        if (displayRecipientGreeting) {
            displayRecipientGreeting.textContent = customRecipient === 'Kamu yang Paling Istimewa' ? 'Hai kamu...' : `Hai ${customRecipient}...`;
        }
        if (displaySenderSignature) {
            displaySenderSignature.textContent = customSender === 'Selalu Untukmu' ? 'Aku ❤️' : `${customSender} ❤️`;
        }
        if (celebrationCoupleNames) {
            if (customRecipient !== 'Kamu yang Paling Istimewa' && customSender !== 'Selalu Untukmu') {
                celebrationCoupleNames.textContent = `${customRecipient} & ${customSender} ✨`;
            } else {
                celebrationCoupleNames.textContent = 'Mulai hari ini, kita jalanin pelan-pelan bareng yaa ✨';
            }
        }
        if (celebrationDateBadge) {
            celebrationDateBadge.textContent = `Momen Spesial: ${indonesianDate}`;
        }
        if (displayLetterDate) {
            displayLetterDate.textContent = `${indonesianDate.toUpperCase()} • DARI AKU`;
        }

        updateWhatsAppLink();
    }

    function getDirectWhatsAppUrl(messageText) {
        const targetPhone = '62895320372952';
        const encodedText = encodeURIComponent(messageText);
        const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
            || (window.innerWidth <= 768);

        if (isMobile) {
            return `whatsapp://send?phone=${targetPhone}&text=${encodedText}`;
        } else {
            return `https://web.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`;
        }
    }

    function openWhatsAppDirectly(messageText) {
        const targetPhone = '62895320372952';
        const encodedText = encodeURIComponent(messageText);
        const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
            || (window.innerWidth <= 768);

        if (isMobile) {
            // Direct launch into WhatsApp application on phone (bypasses browser landing page completely!)
            window.location.href = `whatsapp://send?phone=${targetPhone}&text=${encodedText}`;

            // Safety fallback if app is not installed
            setTimeout(() => {
                if (document.hasFocus()) {
                    window.location.href = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`;
                }
            }, 1600);
        } else {
            // On desktop, go straight to WhatsApp Web chat room (bypasses "Bagikan di WhatsApp" preview page!)
            const directWebUrl = `https://web.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`;
            window.open(directWebUrl, '_blank');
        }
    }

    function updateWhatsAppLink() {
        const senderGreeting = (customSender && customSender !== 'Selalu Untukmu') ? `Hai ${customSender}!` : 'Hai!';
        const messageYes = `${senderGreeting} 😊 Aku baru aja selesai baca surat dari kamu... dan jawabannya: mau kok, ayo kita jalanin bareng. ✨`;
        const messageThink = `${senderGreeting} 🌸 Makasih yaa udah jujur ngomongin perasaan kamu ke aku. Kasih aku waktu sebentar buat mikir yaa, santai aja pokoknya 🤍`;

        if (btnShareWhatsApp) {
            btnShareWhatsApp.href = getDirectWhatsAppUrl(messageYes);
        }

        if (btnShareWaThink) {
            btnShareWaThink.href = getDirectWhatsAppUrl(messageThink);
        }
    }

    if (btnShareWhatsApp) {
        btnShareWhatsApp.addEventListener('click', (e) => {
            e.preventDefault();
            const senderGreeting = (customSender && customSender !== 'Selalu Untukmu') ? `Hai ${customSender}!` : 'Hai!';
            const messageYes = `${senderGreeting} 😊 Aku baru aja selesai baca surat dari kamu... dan jawabannya: mau kok, ayo kita jalanin bareng. ✨`;
            openWhatsAppDirectly(messageYes);
        });
    }

    if (btnShareWaThink) {
        btnShareWaThink.addEventListener('click', (e) => {
            e.preventDefault();
            const senderGreeting = (customSender && customSender !== 'Selalu Untukmu') ? `Hai ${customSender}!` : 'Hai!';
            const messageThink = `${senderGreeting} 🌸 Makasih yaa udah jujur ngomongin perasaan kamu ke aku. Kasih aku waktu sebentar buat mikir yaa, santai aja pokoknya 🤍`;
            openWhatsAppDirectly(messageThink);
        });
    }

    applyCustomization();

    if (btnCustomize) {
        btnCustomize.addEventListener('click', (e) => {
            e.stopPropagation();
            inputRecipient.value = customRecipient === 'Kamu yang Paling Istimewa' ? '' : customRecipient;
            inputSender.value = customSender === 'Selalu Untukmu' ? '' : customSender;
            inputWhatsApp.value = customWhatsApp;
            customizeModal.classList.add('active');
        });
    }

    if (btnCloseCustomize) {
        btnCloseCustomize.addEventListener('click', (e) => {
            e.stopPropagation();
            customizeModal.classList.remove('active');
        });
    }

    if (btnSaveCustomize) {
        btnSaveCustomize.addEventListener('click', (e) => {
            e.stopPropagation();
            customRecipient = inputRecipient.value.trim() || 'Kamu yang Paling Istimewa';
            customSender = inputSender.value.trim() || 'Selalu Untukmu';
            customWhatsApp = inputWhatsApp.value.trim();

            localStorage.setItem('love_letter_recipient', customRecipient);
            localStorage.setItem('love_letter_sender', customSender);
            localStorage.setItem('love_letter_wa', customWhatsApp);

            applyCustomization();
            customizeModal.classList.remove('active');

            // Quick feedback burst
            triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 2);
        });
    }
});
