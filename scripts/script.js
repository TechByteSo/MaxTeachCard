// Плавная прокрутка к якорю с учётом scroll-padding-top (надёжнее scrollIntoView в части браузеров)
function scrollToHashTarget(el) {
    if (!el) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
    }
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 64;
    const y = el.getBoundingClientRect().top + window.pageYOffset - pad;
    window.scrollTo({ top: Math.max(0, y), left: 0, behavior: 'smooth' });
}

(function initSiteGate() {
    const AUTH_KEY = 'maxteachcard-auth';
    const PASSWORD_HASH = 'cd56f4c29f3f7069ada98eadbe092a5360a10e810fc5d3fdfd8237fb7cc2be78';
    const gate = document.getElementById('site-gate');
    const form = document.getElementById('site-gate-form');
    const input = document.getElementById('site-gate-password');
    const error = document.getElementById('site-gate-error');

    function unlockSite() {
        document.documentElement.classList.add('site-authenticated');
        document.documentElement.classList.remove('site-locked');
        document.body.style.overflow = '';
        if (gate) gate.setAttribute('hidden', '');
        try {
            sessionStorage.setItem(AUTH_KEY, '1');
        } catch (_) {}
    }

    function isAuthenticated() {
        try {
            return sessionStorage.getItem(AUTH_KEY) === '1';
        } catch (_) {
            return false;
        }
    }

    async function hashPassword(value) {
        const data = new TextEncoder().encode(value);
        const buffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    if (isAuthenticated()) {
        unlockSite();
        return;
    }

    document.body.style.overflow = 'hidden';
    if (input) {
        window.setTimeout(() => input.focus(), 0);
    }

    if (!form || !input) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const hash = await hashPassword(input.value);
        if (hash === PASSWORD_HASH) {
            if (error) error.hidden = true;
            unlockSite();
            return;
        }
        if (error) error.hidden = false;
        input.value = '';
        input.focus();
    });
})();

(function initThemeSwitcher() {
    const THEME_KEY = 'maxteachcard-theme';
    const themes = {
        'ink-violet-light': { color: '#ffffff' },
        'ink-violet-dark': { color: '#111018' }
    };
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const themeButtons = document.querySelectorAll('[data-theme-button]');

    function setTheme(themeName) {
        const theme = themes[themeName] ? themeName : 'ink-violet-light';
        document.body.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', themes[theme].color);
        }
        themeButtons.forEach((button) => {
            const isActive = button.getAttribute('data-theme-button') === theme;
            button.classList.toggle('theme-switcher__btn--active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
        try {
            window.localStorage.setItem(THEME_KEY, theme);
        } catch (_) {}
    }

    themeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setTheme(button.getAttribute('data-theme-button'));
        });
    });

    try {
        const savedTheme = window.localStorage.getItem(THEME_KEY);
        setTheme(savedTheme === 'ink-violet-dark' ? 'ink-violet-dark' : 'ink-violet-light');
    } catch (_) {
        setTheme('ink-violet-light');
    }
})();

// Мобильное меню
const menuToggle = document.querySelector('.site-header__toggle');
const navLinks = document.querySelector('.site-header__list');

function setMenuOpen(isOpen) {
    if (!navLinks) return;
    navLinks.classList.toggle('site-header__list--open', isOpen);
    if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    }
}

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !navLinks.classList.contains('site-header__list--open');
        setMenuOpen(willOpen);
    });
}

// Закрытие бургер-меню по клику на пустое место (только на мобильных)
document.addEventListener('click', function(e) {
    if (!navLinks || !window.matchMedia('(max-width: 767px)').matches) return;
    if (!navLinks.classList.contains('site-header__list--open')) return;
    if (e.target.closest('.site-header__list') || e.target.closest('.site-header__toggle')) return;
    setMenuOpen(false);
});

// Плавная прокрутка и подменю — один обработчик в capture-фазе
document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (anchor.getAttribute('aria-haspopup') === 'true' && isMobile) {
        e.preventDefault();
        e.stopPropagation();
        const dropdown = anchor.closest('.site-header__dropdown');
        if (dropdown) {
            const wasOpen = dropdown.classList.toggle('site-header__dropdown--open');
            anchor.setAttribute('aria-expanded', wasOpen ? 'true' : 'false');
            document.querySelectorAll('.site-header__dropdown').forEach(other => {
                if (other !== dropdown) {
                    other.classList.remove('site-header__dropdown--open');
                    const t = other.querySelector(':scope > a');
                    if (t) t.setAttribute('aria-expanded', 'false');
                }
            });
        }
        return;
    }
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    if (navLinks && navLinks.classList.contains('site-header__list--open')) setMenuOpen(false);
    document.querySelectorAll('.site-header__dropdown').forEach(d => d.classList.remove('site-header__dropdown--open'));
    document.querySelectorAll('.site-header__dropdown > a').forEach(a => a.setAttribute('aria-expanded', 'false'));
    scrollToHashTarget(target);
    if (anchor.classList.contains('skip-link')) {
        target.focus({ preventScroll: true });
    }
}, true);

// Анимация при скролле
const animateOnScroll = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = document.querySelectorAll('.section__title, .about__profile, .services__card, .events__card, .schedule__layout, .documents__card, .stats__item, .reviews__card, .faq__item');

    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight * 1.05;

        if (elementPosition < screenPosition) {
            element.style.animation = `fadeIn 1s forwards`;
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// FAQ аккордеон
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq__item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq__question');
        if (!question) return;

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('faq__item--open');

            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('faq__item--open');
                    const q = otherItem.querySelector('.faq__question');
                    if (q) q.setAttribute('aria-expanded', 'false');
                }
            });

            if (isActive) {
                item.classList.remove('faq__item--open');
                question.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('faq__item--open');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
});

// Функции для слайдера
function changeSlide(sliderId, direction) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    const slides = slider.querySelectorAll('.slider__slide');
    const dots = slider.parentElement.querySelectorAll('.slider__dot');
    const currentIndex = parseInt(slider.dataset.currentIndex || 0, 10);

    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
        newIndex = slides.length - 1;
    } else if (newIndex >= slides.length) {
        newIndex = 0;
    }

    slider.style.transform = `translateX(-${newIndex * 100}%)`;
    slider.dataset.currentIndex = newIndex;

    dots.forEach((dot, index) => {
        dot.classList.toggle('slider__dot--active', index === newIndex);
    });
}

function goToSlide(sliderId, index) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    const slides = slider.querySelectorAll('.slider__slide');
    const n = slides.length;
    if (n === 0) return;
    const i = Math.max(0, Math.min(index, n - 1));
    const dots = slider.parentElement.querySelectorAll('.slider__dot');

    slider.style.transform = `translateX(-${i * 100}%)`;
    slider.dataset.currentIndex = String(i);

    dots.forEach((dot, j) => {
        dot.classList.toggle('slider__dot--active', j === i);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.slider__track');
    const sliderDots = document.querySelectorAll('.slider__dot');

    sliders.forEach(slider => {
        slider.dataset.currentIndex = 0;
    });
    sliderDots.forEach((dot) => {
        dot.removeAttribute('role');
        dot.removeAttribute('tabindex');
        dot.removeAttribute('aria-label');
        dot.setAttribute('aria-hidden', 'true');
    });
    sliders.forEach((track) => {
        const id = track.id;
        if (!id) return;
        const dots = Array.from(track.parentElement.querySelectorAll('.slider__dot')).filter(
            (d) => d.dataset.slider === id
        );
        dots.forEach((dot) => {
            dot.setAttribute('aria-hidden', 'true');
        });
    });

    document.addEventListener('click', function(e) {
        const arrowBtn = e.target.closest('.slider__arrow');
        if (arrowBtn) {
            const sliderId = arrowBtn.dataset.slider;
            const direction = parseInt(arrowBtn.dataset.direction, 10);
            changeSlide(sliderId, direction);
        }

        const dotEl = e.target.closest('.slider__dot');
        if (dotEl) {
            const sliderId = dotEl.dataset.slider;
            const index = parseInt(dotEl.dataset.index, 10);
            goToSlide(sliderId, index);
        }
    });
    document.addEventListener('keydown', function(e) {
        const dotEl = e.target.closest('.slider__dot');
        if (!dotEl) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const sliderId = dotEl.dataset.slider;
            const index = parseInt(dotEl.dataset.index, 10);
            goToSlide(sliderId, index);
        }
    });

    const swipeThreshold = 50;
    document.querySelectorAll('.slider__container').forEach(container => {
        const sliderEl = container.querySelector('.slider__track');
        if (!sliderEl || !sliderEl.id) return;
        let touchStartX = 0;
        container.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches ? e.changedTouches[0].clientX : e.touches[0].clientX;
        }, { passive: true });
        container.addEventListener('touchend', function(e) {
            const endTouch = e.changedTouches && e.changedTouches[0];
            if (!endTouch) return;
            const touchEndX = endTouch.clientX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) < swipeThreshold) return;
            changeSlide(sliderEl.id, diff > 0 ? 1 : -1);
        }, { passive: true });
    });

    const lightbox = document.getElementById('portfolioLightbox');
    const lightboxSlides = lightbox && lightbox.querySelector('.lightbox__slides');
    const lightboxCaption = lightbox && lightbox.querySelector('.lightbox__caption');
    const lightboxDots = lightbox && lightbox.querySelector('.lightbox__dots');
    const lightboxClose = lightbox && lightbox.querySelector('.lightbox__close');
    const lightboxPrev = lightbox && lightbox.querySelector('.lightbox__prev');
    const lightboxNext = lightbox && lightbox.querySelector('.lightbox__next');

    if (lightbox && lightboxSlides && lightboxCaption && lightboxDots) {
        let lightboxCurrentIndex = 0;
        let lightboxSlideData = [];

        const lightboxContent = lightbox.querySelector('.lightbox__content');
        const dismissThreshold = 100;
        const axisLockThreshold = 10;
        const touchLightboxMq = window.matchMedia('(max-width: 1024px)');
        let lightboxTouchStartX = 0;
        let lightboxTouchStartY = 0;
        let lightboxTouchStartTime = 0;
        let lightboxTouchAxis = null;
        let lightboxSuppressClick = false;
        let lightboxScrollY = 0;

        function lockPageScroll() {
            lightboxScrollY = window.scrollY;
            document.documentElement.classList.add('is-lightbox-open');
            document.body.classList.add('is-lightbox-open');
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${lightboxScrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
        }

        function unlockPageScroll() {
            document.documentElement.classList.remove('is-lightbox-open');
            document.body.classList.remove('is-lightbox-open');
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            window.scrollTo(0, lightboxScrollY);
        }

        function isTouchLightboxViewport() {
            return touchLightboxMq.matches;
        }

        function lightboxDismissTargets() {
            return [lightboxContent, lightboxCaption, lightboxDots].filter(Boolean);
        }

        function resetLightboxDismissStyles() {
            lightbox.classList.remove('lightbox--dragging', 'lightbox--dismissing');
            lightbox.style.removeProperty('background-color');
            lightbox.style.removeProperty('--lightbox-dismiss-y');
            lightbox.style.removeProperty('--lightbox-ui-opacity');
            lightboxDismissTargets().forEach(el => {
                el.style.removeProperty('transform');
                el.style.removeProperty('transition');
                el.style.removeProperty('opacity');
            });
        }

        function setLightboxDismissDrag(dy) {
            const progress = Math.min(Math.abs(dy) / 320, 1);
            lightbox.style.setProperty('--lightbox-dismiss-y', `${dy}px`);
            lightbox.style.setProperty('--lightbox-ui-opacity', String(Math.max(0.35, 1 - progress * 0.65)));
            lightbox.style.backgroundColor = `rgba(0, 0, 0, ${0.8 * (1 - progress * 0.85)})`;
        }

        function animateLightboxDismissSnapBack() {
            lightbox.classList.remove('lightbox--dragging');
            lightbox.style.removeProperty('background-color');
            lightbox.style.setProperty('--lightbox-dismiss-y', '0px');
            lightbox.style.setProperty('--lightbox-ui-opacity', '1');
            lightboxDismissTargets().forEach(el => {
                el.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
            });
            window.setTimeout(resetLightboxDismissStyles, 260);
        }

        function animateLightboxDismissClose(dy) {
            lightboxSuppressClick = true;
            const offScreen = dy >= 0 ? window.innerHeight : -window.innerHeight;
            lightbox.classList.remove('lightbox--dragging');
            lightbox.classList.add('lightbox--dismissing');
            lightbox.style.setProperty('--lightbox-dismiss-y', `${offScreen}px`);
            lightbox.style.setProperty('--lightbox-ui-opacity', '0');
            lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            lightboxDismissTargets().forEach(el => {
                el.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
            });
            window.setTimeout(() => {
                closeLightbox();
                resetLightboxDismissStyles();
            }, 230);
        }

        function openLightbox(sliderEl) {
            const slides = sliderEl.querySelectorAll('.slider__slide');
            const currentIndex = parseInt(sliderEl.dataset.currentIndex || 0, 10);
            lightboxSlideData = Array.from(slides).map(slide => {
                const img = slide.querySelector('img');
                const overlay = slide.querySelector('.events__overlay');
                const h3 = overlay ? overlay.querySelector('h3') : null;
                const p = overlay ? overlay.querySelector('p') : null;
                return {
                    src: img ? img.src : '',
                    alt: img ? img.alt : '',
                    title: h3 ? h3.textContent : '',
                    desc: p ? p.textContent : ''
                };
            });
            lightboxSlides.innerHTML = lightboxSlideData.map(d =>
                `<div class="lightbox__slide"><img src="${d.src}" alt="${d.alt || ''}"></div>`
            ).join('');
            const lbN = lightboxSlideData.length;
            lightboxDots.innerHTML = lightboxSlideData.map((_, i) =>
                `<button type="button" class="lightbox__dot${i === currentIndex ? ' lightbox__dot--active' : ''}" data-index="${i}" aria-label="Слайд ${i + 1} из ${lbN}"></button>`
            ).join('');
            lightboxCurrentIndex = currentIndex;
            lightboxSlides.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateLightboxCaption();
            const singleSlide = lightboxSlideData.length <= 1;
            if (lightboxPrev) lightboxPrev.hidden = singleSlide;
            if (lightboxNext) lightboxNext.hidden = singleSlide;
            lightboxDots.hidden = singleSlide;
            lightbox.classList.toggle('lightbox--single', singleSlide);
            lightbox.removeAttribute('hidden');
            lightbox.setAttribute('data-open', 'true');
            lockPageScroll();
            resetLightboxDismissStyles();
        }

        function updateLightboxCaption() {
            const d = lightboxSlideData[lightboxCurrentIndex];
            if (!d) return;
            lightboxCaption.innerHTML = (d.title ? `<h3>${d.title}</h3>` : '') + (d.desc ? `<p>${d.desc}</p>` : '');
        }

        function closeLightbox() {
            lightbox.setAttribute('data-open', 'false');
            lightbox.setAttribute('hidden', '');
            lightbox.classList.remove('lightbox--single');
            unlockPageScroll();
            resetLightboxDismissStyles();
            window.setTimeout(() => {
                lightboxSuppressClick = false;
            }, 320);
        }

        function lightboxGoTo(index) {
            const n = lightboxSlideData.length;
            if (n === 0) return;
            lightboxCurrentIndex = ((index % n) + n) % n;
            lightboxSlides.style.transform = `translateX(-${lightboxCurrentIndex * 100}%)`;
            lightboxDots.querySelectorAll('.lightbox__dot').forEach((dot, i) => {
                dot.classList.toggle('lightbox__dot--active', i === lightboxCurrentIndex);
            });
            updateLightboxCaption();
        }

        document.querySelectorAll('.events .slider__container').forEach(container => {
            const sliderEl = container.querySelector('.slider__track');
            if (!sliderEl) return;
            container.addEventListener('click', function(e) {
                if (e.target.closest('.slider__arrow') || e.target.closest('.slider__dot')) return;
                if (e.target.closest('.slider__slide')) {
                    e.preventDefault();
                    openLightbox(sliderEl);
                }
            });
        });

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); lightboxGoTo(lightboxCurrentIndex - 1); });
        if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); lightboxGoTo(lightboxCurrentIndex + 1); });
        lightbox.addEventListener('click', function(e) {
            if (lightboxSuppressClick) return;
            if (e.target === lightbox) return closeLightbox();
            if (!e.target.closest('.lightbox__slide img') && !e.target.closest('button') && !e.target.closest('.lightbox__caption')) closeLightbox();
        });
        document.addEventListener('keydown', function(e) {
            if (lightbox.getAttribute('data-open') !== 'true') return;
            if (e.key === 'Escape') closeLightbox();
            if (lightboxSlideData.length <= 1) return;
            if (e.key === 'ArrowLeft') lightboxGoTo(lightboxCurrentIndex - 1);
            if (e.key === 'ArrowRight') lightboxGoTo(lightboxCurrentIndex + 1);
        });
        lightboxDots.addEventListener('click', function(e) {
            const dot = e.target.closest('.lightbox__dot');
            if (dot) lightboxGoTo(parseInt(dot.dataset.index, 10));
        });

        lightbox.addEventListener('touchstart', function(e) {
            if (lightbox.getAttribute('data-open') !== 'true' || !e.touches[0]) return;
            lightboxTouchStartX = e.touches[0].clientX;
            lightboxTouchStartY = e.touches[0].clientY;
            lightboxTouchStartTime = Date.now();
            lightboxTouchAxis = null;
            if (isTouchLightboxViewport()) {
                lightbox.classList.add('lightbox--dragging');
            }
        }, { passive: true });

        lightbox.addEventListener('touchmove', function(e) {
            if (lightbox.getAttribute('data-open') !== 'true' || !e.touches[0]) return;

            const caption = e.target.closest('.lightbox__caption');
            if (caption && caption.scrollHeight > caption.clientHeight + 1) {
                return;
            }

            e.preventDefault();

            if (!isTouchLightboxViewport()) return;

            const dx = e.touches[0].clientX - lightboxTouchStartX;
            const dy = e.touches[0].clientY - lightboxTouchStartY;

            if (!lightboxTouchAxis) {
                if (Math.abs(dx) < axisLockThreshold && Math.abs(dy) < axisLockThreshold) return;
                lightboxTouchAxis = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x';
            }

            if (lightboxTouchAxis === 'y') {
                setLightboxDismissDrag(dy);
            }
        }, { passive: false });

        lightbox.addEventListener('touchend', function(e) {
            if (lightbox.getAttribute('data-open') !== 'true' || !e.changedTouches[0]) return;
            const touch = e.changedTouches[0];
            const dx = touch.clientX - lightboxTouchStartX;
            const dy = touch.clientY - lightboxTouchStartY;
            const elapsed = Math.max(Date.now() - lightboxTouchStartTime, 1);

            if (isTouchLightboxViewport() && lightboxTouchAxis === 'y') {
                const velocity = Math.abs(dy) / elapsed;
                if (Math.abs(dy) > dismissThreshold || velocity > 0.6) {
                    animateLightboxDismissClose(dy);
                } else {
                    animateLightboxDismissSnapBack();
                }
                lightboxTouchAxis = null;
                return;
            }

            lightbox.classList.remove('lightbox--dragging');

            if (lightboxSlideData.length <= 1) {
                lightboxTouchAxis = null;
                return;
            }

            if (!lightboxTouchAxis) {
                if (Math.abs(dx) < axisLockThreshold && Math.abs(dy) < axisLockThreshold) {
                    lightboxTouchAxis = null;
                    return;
                }
                lightboxTouchAxis = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x';
            }

            if (lightboxTouchAxis === 'x' && Math.abs(dx) > swipeThreshold) {
                lightboxGoTo(lightboxCurrentIndex + (dx < 0 ? 1 : -1));
            }

            lightboxTouchAxis = null;
        }, { passive: true });

        lightbox.addEventListener('touchcancel', function() {
            if (lightbox.getAttribute('data-open') !== 'true') return;
            if (isTouchLightboxViewport() && lightboxTouchAxis === 'y') {
                animateLightboxDismissSnapBack();
            } else {
                lightbox.classList.remove('lightbox--dragging');
            }
            lightboxTouchAxis = null;
        }, { passive: true });
    }

    const subjectItems = document.querySelectorAll('.services__subject');
    const subjectDetail = document.getElementById('subjectDetail');
    const subjectDetailTitle = subjectDetail && subjectDetail.querySelector('.services__detail-title');
    const subjectDetailText = subjectDetail && subjectDetail.querySelector('.services__detail-text');
    const subjectDetailClose = subjectDetail && subjectDetail.querySelector('.services__detail-close');

    if (subjectItems.length && subjectDetail && subjectDetailTitle && subjectDetailText) {
        let subjectDetailHideTimer = null;
        let subjectDetailSwitchTimer = null;
        const subjectSwitchDelay = 180;

        function setSubjectContent(title, text) {
            if (title) subjectDetailTitle.textContent = title;
            if (text) subjectDetailText.textContent = text;
        }

        function showSubjectDetail() {
            clearTimeout(subjectDetailHideTimer);
            subjectDetail.style.display = 'block';
            subjectDetail.offsetHeight;
            subjectDetail.setAttribute('aria-hidden', 'false');
            subjectDetail.classList.add('services__detail--visible');
            const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            subjectDetail.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'nearest' });
        }
        function hideSubjectDetail() {
            clearTimeout(subjectDetailSwitchTimer);
            subjectDetail.classList.remove('services__detail--switching');
            subjectDetail.classList.remove('services__detail--visible');
            subjectDetailHideTimer = setTimeout(function() {
                subjectDetail.style.display = 'none';
                subjectDetail.setAttribute('aria-hidden', 'true');
            }, 350);
        }
        function activateSubjectItem(el) {
            const title = el.getAttribute('data-subject');
            const text = el.getAttribute('data-text');
            const isAlreadyOpen = subjectDetail.style.display === 'block' && subjectDetailTitle.textContent === title;
            const isOpen = subjectDetail.style.display === 'block' && subjectDetail.classList.contains('services__detail--visible');
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (isAlreadyOpen) {
                hideSubjectDetail();
                return;
            }
            clearTimeout(subjectDetailSwitchTimer);
            if (isOpen && !reduceMotion) {
                subjectDetail.classList.add('services__detail--switching');
                subjectDetailSwitchTimer = setTimeout(function() {
                    setSubjectContent(title, text);
                    subjectDetail.classList.remove('services__detail--switching');
                }, subjectSwitchDelay);
                return;
            }
            subjectDetail.classList.remove('services__detail--switching');
            setSubjectContent(title, text);
            showSubjectDetail();
        }

        subjectItems.forEach(item => {
            item.addEventListener('click', function() {
                activateSubjectItem(this);
            });
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateSubjectItem(this);
                }
            });
        });
        if (subjectDetailClose) {
            subjectDetailClose.addEventListener('click', hideSubjectDetail);
        }
    }

    const toggleEventsBtn = document.getElementById('toggleEvents');
    const eventsMoreWrapper = document.getElementById('eventsMoreWrapper');
    let eventsVisible = false;

    if (toggleEventsBtn && eventsMoreWrapper) {
        toggleEventsBtn.addEventListener('click', function() {
            if (eventsVisible) {
                eventsMoreWrapper.classList.remove('events__more--visible');
                eventsMoreWrapper.classList.add('events__more--hidden');
                eventsVisible = false;
                this.textContent = 'Показать все проекты';
                this.setAttribute('aria-expanded', 'false');
            } else {
                eventsMoreWrapper.classList.remove('events__more--hidden');
                eventsMoreWrapper.classList.add('events__more--visible');
                eventsVisible = true;
                this.textContent = 'Скрыть проекты';
                this.setAttribute('aria-expanded', 'true');
                const rmEv = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                eventsMoreWrapper.scrollIntoView({ behavior: rmEv ? 'auto' : 'smooth', block: 'nearest' });
            }
        });
    }

    const docTabButtons = document.querySelectorAll('.documents-tabs__btn');
    const docTabPanels = document.querySelectorAll('.documents-tabs__panel');

    if (docTabButtons.length && docTabPanels.length) {
        function activateDocTab(tabName) {
            docTabButtons.forEach(btn => {
                const active = btn.dataset.docTab === tabName;
                btn.classList.toggle('is-active', active);
                btn.setAttribute('aria-selected', active ? 'true' : 'false');
            });
            docTabPanels.forEach(panel => {
                const active = panel.dataset.docPanel === tabName;
                panel.classList.toggle('is-active', active);
                panel.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
        }

        docTabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                activateDocTab(this.dataset.docTab);
            });
            btn.addEventListener('keydown', function(e) {
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                e.preventDefault();
                const tabs = Array.from(docTabButtons);
                const currentIndex = tabs.indexOf(this);
                const dir = e.key === 'ArrowRight' ? 1 : -1;
                const nextIndex = (currentIndex + dir + tabs.length) % tabs.length;
                const nextTab = tabs[nextIndex];
                nextTab.focus();
                activateDocTab(nextTab.dataset.docTab);
            });
        });
    }

    const sections = document.querySelectorAll('section[id]');
    const navLinkEls = document.querySelectorAll('.site-header__list a[href^="#"]');

    function highlightNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinkEls.forEach(link => {
            link.classList.remove('site-header__link--active', 'site-header__cta--active');
            if (link.getAttribute('href') === '#' + current) {
                if (link.classList.contains('site-header__cta')) {
                    link.classList.add('site-header__cta--active');
                } else {
                    link.classList.add('site-header__link--active');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNav);
    highlightNav();

    const dropdowns = document.querySelectorAll('.site-header__dropdown');
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector(':scope > a');
        const menu = dropdown.querySelector('.site-header__submenu');
        if (!trigger || !menu) return;
        dropdown.addEventListener('mouseenter', () => trigger.setAttribute('aria-expanded', 'true'));
        dropdown.addEventListener('mouseleave', () => {
            if (window.matchMedia('(max-width: 767px)').matches) return;
            trigger.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('site-header__dropdown--open');
        });
        trigger.addEventListener('focus', () => trigger.setAttribute('aria-expanded', 'true'));
        dropdown.addEventListener('focusout', (e) => {
            if (window.matchMedia('(max-width: 767px)').matches) return;
            if (!dropdown.contains(e.relatedTarget)) {
                trigger.setAttribute('aria-expanded', 'false');
                dropdown.classList.remove('site-header__dropdown--open');
            }
        });
    });
});

// Кнопка «Наверх»
(function() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    const scrollThreshold = 400;
    function toggleVisibility() {
        if (window.pageYOffset > scrollThreshold) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();
    backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        const mainEl = document.getElementById('main-content');
        scrollToHashTarget(mainEl);
    });
})();
