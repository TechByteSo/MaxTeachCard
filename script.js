// Мобильное меню
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
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

// Обработка формы - ОБНОВЛЕННЫЙ КОД
const form = document.getElementById('messageForm');

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
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
            const result = await response.json();
            alert('Сообщение отправлено! Я свяжусь с вами в ближайшее время.');
            form.reset();
        } else {
            alert('Ошибка при отправке сообщения.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка соединения с сервером. Проверьте, запущен ли сервер.');
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
});