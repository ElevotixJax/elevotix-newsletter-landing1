// newsletterlanding.js

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (email) {
                console.log('Newsletter subscription:', email);
                // Add your form submission logic here
                this.reset();
            }
        });
    });

    // Carousel functionality
    const carouselButtons = document.querySelectorAll('button[aria-label*="slide"]');
    const slides = document.querySelectorAll('.w-full.flex-shrink-0');
    let currentSlide = 0;

    carouselButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            currentSlide = index;
            updateCarousel();
        });
    });

    function updateCarousel() {
        const carousel = document.querySelector('.flex.transition-transform');
        if (carousel) {
            carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            carouselButtons.forEach((btn, index) => {
                if (index === currentSlide) {
                    btn.classList.add('bg-gradient-to-r', 'from-[#fd5a37]', 'to-[#fcb900]');
                    btn.classList.remove('bg-[#70707e]');
                } else {
                    btn.classList.remove('bg-gradient-to-r', 'from-[#fd5a37]', 'to-[#fcb900]');
                    btn.classList.add('bg-[#70707e]');
                }
            });
        }
    }

    // Navigation buttons
    const prevButton = document.querySelector('button[aria-label="Previous slide"]');
    const nextButton = document.querySelector('button[aria-label="Next slide"]');

    if (prevButton) {
        prevButton.addEventListener('click', function() {
            currentSlide = Math.max(0, currentSlide - 1);
            updateCarousel();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function() {
            currentSlide = Math.min(2, currentSlide + 1);
            updateCarousel();
        });
    }

    // Smooth scroll for links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Add fade-in animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[class*="animate-fade-in"]').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
});