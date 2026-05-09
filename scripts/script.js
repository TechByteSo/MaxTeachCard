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
    if (!navLinks || !window.matchMedia('(max-width: 992px)').matches) return;
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
    const isMobile = window.matchMedia('(max-width: 992px)').matches;
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
    const dots = slider.parentElement.querySelectorAll('.slider__dot');

    slider.style.transform = `translateX(-${index * 100}%)`;
    slider.dataset.currentIndex = index;

    dots.forEach((dot, i) => {
        dot.classList.toggle('slider__dot--active', i === index);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.slider__track');
    const sliderDots = document.querySelectorAll('.slider__dot');

    sliders.forEach(slider => {
        slider.dataset.currentIndex = 0;
    });
    sliderDots.forEach((dot, index) => {
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
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
            const touchEndX = e.changedTouches ? e.changedTouches[0].clientX : e.touches[0].clientX;
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

    if (lightbox && lightboxSlides && lightboxCaption) {
        let lightboxCurrentIndex = 0;
        let lightboxSlideData = [];

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
            lightboxDots.innerHTML = lightboxSlideData.map((_, i) =>
                `<button type="button" class="lightbox__dot${i === currentIndex ? ' lightbox__dot--active' : ''}" data-index="${i}" aria-label="Слайд ${i + 1}"></button>`
            ).join('');
            lightboxCurrentIndex = currentIndex;
            lightboxSlides.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateLightboxCaption();
            const singleSlide = lightboxSlideData.length <= 1;
            if (lightboxPrev) lightboxPrev.hidden = singleSlide;
            if (lightboxNext) lightboxNext.hidden = singleSlide;
            if (lightboxDots) lightboxDots.hidden = singleSlide;
            lightbox.classList.toggle('lightbox--single', singleSlide);
            lightbox.removeAttribute('hidden');
            lightbox.setAttribute('data-open', 'true');
            document.body.style.overflow = 'hidden';
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
            document.body.style.overflow = '';
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

        let lightboxTouchStartX = 0;
        lightbox.addEventListener('touchstart', function(e) {
            lightboxTouchStartX = e.touches[0].clientX;
        }, { passive: true });
        lightbox.addEventListener('touchend', function(e) {
            if (lightboxSlideData.length <= 1) return;
            const x = e.changedTouches[0].clientX;
            const diff = lightboxTouchStartX - x;
            if (Math.abs(diff) > swipeThreshold) lightboxGoTo(lightboxCurrentIndex + (diff > 0 ? 1 : -1));
        }, { passive: true });
    }

    const subjectItems = document.querySelectorAll('.services__subject');
    const subjectDetail = document.getElementById('subjectDetail');
    const subjectDetailTitle = subjectDetail && subjectDetail.querySelector('.services__detail-title');
    const subjectDetailText = subjectDetail && subjectDetail.querySelector('.services__detail-text');
    const subjectDetailClose = subjectDetail && subjectDetail.querySelector('.services__detail-close');

    if (subjectItems.length && subjectDetail && subjectDetailTitle && subjectDetailText) {
        function showSubjectDetail() {
            subjectDetail.style.display = 'block';
            subjectDetail.offsetHeight;
            subjectDetail.setAttribute('aria-hidden', 'false');
            subjectDetail.classList.add('services__detail--visible');
            const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            subjectDetail.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'nearest' });
        }
        function hideSubjectDetail() {
            subjectDetail.classList.remove('services__detail--visible');
            setTimeout(function() {
                subjectDetail.style.display = 'none';
                subjectDetail.setAttribute('aria-hidden', 'true');
            }, 350);
        }
        function activateSubjectItem(el) {
            const title = el.getAttribute('data-subject');
            const text = el.getAttribute('data-text');
            const isAlreadyOpen = subjectDetail.style.display === 'block' && subjectDetailTitle.textContent === title;
            if (isAlreadyOpen) {
                hideSubjectDetail();
                return;
            }
            if (title) subjectDetailTitle.textContent = title;
            if (text) subjectDetailText.textContent = text;
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
            if (window.matchMedia('(max-width: 992px)').matches) return;
            trigger.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('site-header__dropdown--open');
        });
        trigger.addEventListener('focus', () => trigger.setAttribute('aria-expanded', 'true'));
        dropdown.addEventListener('focusout', (e) => {
            if (window.matchMedia('(max-width: 992px)').matches) return;
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
