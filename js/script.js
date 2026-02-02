// Мобильное меню
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        if (this.getAttribute('aria-haspopup') === 'true' && window.matchMedia('(max-width: 992px)').matches) {
            e.preventDefault();
            return;
        }
        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;
        if (navLinks.classList.contains('active')) navLinks.classList.remove('active');
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('active-dropdown'));
        document.querySelectorAll('.nav-dropdown > a').forEach(a => a.setAttribute('aria-expanded', 'false'));
        target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Анимация при скролле
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.section-title, .teacher-profile, .service-card, .event-card, .contact-info, .contact-form, .stat-item, .review-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
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
    try {
        const response = await fetch('http://localhost:8000/feedback', {
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
        console.error('Error:', error);
        showFormMessage('Ошибка соединения с сервером. Проверьте, запущен ли сервер.', 'error');
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
        
        // Автоматическое переключение слайдов каждые 5 секунд
        setInterval(() => {
            changeSlide(slider.id, 1);
        }, 5000);
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
            } else {
                eventsMoreWrapper.classList.remove('events-more-wrapper--hidden');
                eventsMoreWrapper.classList.add('events-more-wrapper--visible');
                eventsVisible = true;
                this.textContent = 'Скрыть проекты';
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
            trigger.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('active-dropdown');
        });
        trigger.addEventListener('focus', () => trigger.setAttribute('aria-expanded', 'true'));
        dropdown.addEventListener('focusout', (e) => {
            if (!dropdown.contains(e.relatedTarget)) {
                trigger.setAttribute('aria-expanded', 'false');
                dropdown.classList.remove('active-dropdown');
            }
        });
        trigger.addEventListener('click', (e) => {
            if (window.matchMedia('(max-width: 992px)').matches) {
                e.preventDefault();
                const wasOpen = dropdown.classList.toggle('active-dropdown');
                trigger.setAttribute('aria-expanded', wasOpen ? 'true' : 'false');
                dropdowns.forEach(other => {
                    if (other !== dropdown) {
                        other.classList.remove('active-dropdown');
                        const otherTrigger = other.querySelector(':scope > a');
                        if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        });
    });
});