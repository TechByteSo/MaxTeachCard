// Мобильное меню
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Закрытие бургер-меню по клику на пустое место (только на мобильных)
document.addEventListener('click', function(e) {
    if (!window.matchMedia('(max-width: 992px)').matches) return;
    if (!navLinks.classList.contains('active')) return;
    if (e.target.closest('.nav-links') || e.target.closest('.menu-toggle')) return;
    navLinks.classList.remove('active');
});

// Плавная прокрутка и подменю — один обработчик в capture-фазе (работает при file:// и Live Server)
document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const isMobile = window.matchMedia('(max-width: 992px)').matches;
    if (anchor.getAttribute('aria-haspopup') === 'true' && isMobile) {
        e.preventDefault();
        e.stopPropagation();
        const dropdown = anchor.closest('.nav-dropdown');
        if (dropdown) {
            const wasOpen = dropdown.classList.toggle('active-dropdown');
            anchor.setAttribute('aria-expanded', wasOpen ? 'true' : 'false');
            document.querySelectorAll('.nav-dropdown').forEach(other => {
                if (other !== dropdown) {
                    other.classList.remove('active-dropdown');
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
    if (navLinks.classList.contains('active')) navLinks.classList.remove('active');
    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('active-dropdown'));
    document.querySelectorAll('.nav-dropdown > a').forEach(a => a.setAttribute('aria-expanded', 'false'));
    target.scrollIntoView({ behavior: 'smooth' });
}, true);

// Анимация при скролле
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.section-title, .teacher-profile, .service-card, .event-card, .contact-info, .contact-form, .stat-item, .review-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight * 1.05; /* анимация при появлении в зоне видимости (раньше по скроллу) */
        
        if (elementPosition < screenPosition) {
            element.style.animation = `fadeIn 1s forwards`;
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// FAQ аккордеон
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Закрываем все остальные элементы
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Переключаем текущий элемент
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
});

// Обработка формы с состоянием загрузки и сообщением в DOM
const form = document.getElementById('messageForm');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');

function showFormMessage(text, type) {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.className = 'form-message visible ' + (type || '');
    formMessage.setAttribute('aria-live', 'polite');
}

function clearFormMessage() {
    if (formMessage) {
        formMessage.textContent = '';
        formMessage.className = 'form-message';
    }
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearFormMessage();
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
    }
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('msg', document.getElementById('message').value);
    
    // URL для отправки формы (замените на реальный endpoint при настройке backend)
    const formEndpoint = '/feedback'; // или 'https://your-domain.com/api/feedback'
    
    try {
        const response = await fetch(formEndpoint, {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            showFormMessage('Сообщение отправлено! Я свяжусь с вами в ближайшее время.', 'success');
            form.reset();
        } else {
            showFormMessage('Ошибка при отправке сообщения. Попробуйте позже.', 'error');
        }
    } catch (error) {
        // Ошибка логируется только в development режиме
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Form submission error:', error);
        }
        showFormMessage('Ошибка соединения с сервером. Попробуйте позже или свяжитесь напрямую.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить сообщение';
        }
    }
});

// Функции для слайдера
function changeSlide(sliderId, direction) {
    const slider = document.getElementById(sliderId);
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.parentElement.querySelectorAll('.slider-dot');
    const currentIndex = parseInt(slider.dataset.currentIndex || 0);
    
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) {
        newIndex = slides.length - 1;
    } else if (newIndex >= slides.length) {
        newIndex = 0;
    }
    
    slider.style.transform = `translateX(-${newIndex * 100}%)`;
    slider.dataset.currentIndex = newIndex;
    
    // Обновление активной точки
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === newIndex);
    });
}

function goToSlide(sliderId, index) {
    const slider = document.getElementById(sliderId);
    const dots = slider.parentElement.querySelectorAll('.slider-dot');
    
    slider.style.transform = `translateX(-${index * 100}%)`;
    slider.dataset.currentIndex = index;
    
    // Обновление активной точки
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// Инициализация слайдеров
document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.slider');
    
    sliders.forEach(slider => {
        slider.dataset.currentIndex = 0;
    });
    
    // Обработчики для кнопок слайдера через делегирование событий
    document.addEventListener('click', function(e) {
        // Стрелки слайдера
        if (e.target.classList.contains('slider-arrow')) {
            const sliderId = e.target.dataset.slider;
            const direction = parseInt(e.target.dataset.direction);
            changeSlide(sliderId, direction);
        }
        
        // Точки слайдера
        if (e.target.classList.contains('slider-dot')) {
            const sliderId = e.target.dataset.slider;
            const index = parseInt(e.target.dataset.index);
            goToSlide(sliderId, index);
        }
    });

    // Свайпы для слайдеров на мобильных
    const swipeThreshold = 50;
    document.querySelectorAll('.slider-container').forEach(container => {
        const sliderEl = container.querySelector('.slider');
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

    // Полноэкранный просмотр портфолио по клику на фото
    const lightbox = document.getElementById('portfolioLightbox');
    const lightboxSlides = lightbox && lightbox.querySelector('.lightbox-slides');
    const lightboxCaption = lightbox && lightbox.querySelector('.lightbox-caption');
    const lightboxDots = lightbox && lightbox.querySelector('.lightbox-dots');
    const lightboxClose = lightbox && lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox && lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox && lightbox.querySelector('.lightbox-next');

    if (lightbox && lightboxSlides && lightboxCaption) {
        let lightboxCurrentIndex = 0;
        let lightboxSlideData = [];

        function openLightbox(sliderEl) {
            const slides = sliderEl.querySelectorAll('.slide');
            const currentIndex = parseInt(sliderEl.dataset.currentIndex || 0, 10);
            lightboxSlideData = Array.from(slides).map(slide => {
                const img = slide.querySelector('img');
                const overlay = slide.querySelector('.event-overlay');
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
                `<div class="lightbox-slide"><img src="${d.src}" alt="${d.alt || ''}"></div>`
            ).join('');
            lightboxDots.innerHTML = lightboxSlideData.map((_, i) =>
                `<button type="button" class="lightbox-dot ${i === currentIndex ? 'active' : ''}" data-index="${i}" aria-label="Слайд ${i + 1}"></button>`
            ).join('');
            lightboxCurrentIndex = currentIndex;
            lightboxSlides.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateLightboxCaption();
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
            document.body.style.overflow = '';
        }

        function lightboxGoTo(index) {
            const n = lightboxSlideData.length;
            if (n === 0) return;
            lightboxCurrentIndex = ((index % n) + n) % n;
            lightboxSlides.style.transform = `translateX(-${lightboxCurrentIndex * 100}%)`;
            lightboxDots.querySelectorAll('.lightbox-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === lightboxCurrentIndex);
            });
            updateLightboxCaption();
        }

        document.querySelectorAll('.events .slider-container').forEach(container => {
            const sliderEl = container.querySelector('.slider');
            if (!sliderEl) return;
            container.addEventListener('click', function(e) {
                if (e.target.closest('.slider-arrow') || e.target.closest('.slider-dot')) return;
                if (e.target.closest('.slide')) {
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
            if (!e.target.closest('.lightbox-slide img') && !e.target.closest('button') && !e.target.closest('.lightbox-caption')) closeLightbox();
        });
        document.addEventListener('keydown', function(e) {
            if (lightbox.getAttribute('data-open') !== 'true') return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') lightboxGoTo(lightboxCurrentIndex - 1);
            if (e.key === 'ArrowRight') lightboxGoTo(lightboxCurrentIndex + 1);
        });
        lightboxDots.addEventListener('click', function(e) {
            const dot = e.target.closest('.lightbox-dot');
            if (dot) lightboxGoTo(parseInt(dot.dataset.index, 10));
        });

        let lightboxTouchStartX = 0;
        lightbox.addEventListener('touchstart', function(e) {
            lightboxTouchStartX = e.touches[0].clientX;
        }, { passive: true });
        lightbox.addEventListener('touchend', function(e) {
            const x = e.changedTouches[0].clientX;
            const diff = lightboxTouchStartX - x;
            if (Math.abs(diff) > swipeThreshold) lightboxGoTo(lightboxCurrentIndex + (diff > 0 ? 1 : -1));
        }, { passive: true });
    }

    // Текст предмета при клике
    const subjectItems = document.querySelectorAll('.subject-preview-item');
    const subjectDetail = document.getElementById('subjectDetail');
    const subjectDetailTitle = subjectDetail && subjectDetail.querySelector('.subject-detail-title');
    const subjectDetailText = subjectDetail && subjectDetail.querySelector('.subject-detail-text');
    const subjectDetailClose = subjectDetail && subjectDetail.querySelector('.subject-detail-close');
    
    if (subjectItems.length && subjectDetail && subjectDetailTitle && subjectDetailText) {
        function showSubjectDetail() {
            subjectDetail.style.display = 'block';
            subjectDetail.offsetHeight;
            subjectDetail.classList.add('subject-detail-visible');
            subjectDetail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        function hideSubjectDetail() {
            subjectDetail.classList.remove('subject-detail-visible');
            setTimeout(function() {
                subjectDetail.style.display = 'none';
            }, 350);
        }
        subjectItems.forEach(item => {
            item.addEventListener('click', function() {
                const title = this.getAttribute('data-subject');
                const text = this.getAttribute('data-text');
                const isAlreadyOpen = subjectDetail.style.display === 'block' && subjectDetailTitle.textContent === title;
                if (isAlreadyOpen) {
                    hideSubjectDetail();
                    return;
                }
                if (title) subjectDetailTitle.textContent = title;
                if (text) subjectDetailText.textContent = text;
                showSubjectDetail();
            });
        });
        if (subjectDetailClose) {
            subjectDetailClose.addEventListener('click', hideSubjectDetail);
        }
    }
    
    // Кнопка показать/скрыть проекты: анимация через контейнер (max-height + opacity)
    const toggleEventsBtn = document.getElementById('toggleEvents');
    const eventsMoreWrapper = document.getElementById('eventsMoreWrapper');
    let eventsVisible = false;
    
    if (toggleEventsBtn && eventsMoreWrapper) {
        toggleEventsBtn.addEventListener('click', function() {
            if (eventsVisible) {
                eventsMoreWrapper.classList.remove('events-more-wrapper--visible');
                eventsMoreWrapper.classList.add('events-more-wrapper--hidden');
                eventsVisible = false;
                this.textContent = 'Показать все проекты';
                this.setAttribute('aria-expanded', 'false');
            } else {
                eventsMoreWrapper.classList.remove('events-more-wrapper--hidden');
                eventsMoreWrapper.classList.add('events-more-wrapper--visible');
                eventsVisible = true;
                this.textContent = 'Скрыть проекты';
                this.setAttribute('aria-expanded', 'true');
                eventsMoreWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
    
    // Подсветка активного пункта меню при скролле
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    function highlightNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNav);
    highlightNav();

    // Aria и выпадающие меню: hover/focus обновляют aria-expanded, клик на мобильных открывает подменю
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector(':scope > a');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (!trigger || !menu) return;
        dropdown.addEventListener('mouseenter', () => trigger.setAttribute('aria-expanded', 'true'));
        dropdown.addEventListener('mouseleave', () => {
            if (window.matchMedia('(max-width: 992px)').matches) return;
            trigger.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('active-dropdown');
        });
        trigger.addEventListener('focus', () => trigger.setAttribute('aria-expanded', 'true'));
        dropdown.addEventListener('focusout', (e) => {
            if (window.matchMedia('(max-width: 992px)').matches) return;
            if (!dropdown.contains(e.relatedTarget)) {
                trigger.setAttribute('aria-expanded', 'false');
                dropdown.classList.remove('active-dropdown');
            }
        });
    });
});

// Кнопка «Наверх» — показ при скролле и плавная прокрутка по клику
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
        document.getElementById('main-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
})();