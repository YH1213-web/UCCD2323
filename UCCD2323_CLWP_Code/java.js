// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Scroll to Top Button with Animation
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// Show/hide button based on scroll position
window.addEventListener('scroll', () => {
    const scrollPosition = window.pageYOffset;
    const viewportHeight = window.innerHeight;

    if (scrollPosition > viewportHeight / 2) {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.visibility = 'visible';
        scrollToTopBtn.style.transform = 'translateY(0)';
    } else {
        scrollToTopBtn.style.opacity = '0';
        scrollToTopBtn.style.visibility = 'hidden';
        scrollToTopBtn.style.transform = 'translateY(20px)';
    }
});

// Smooth scroll with easing function
scrollToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const scrollToTop = () => {
        const currentPosition = window.pageYOffset;
        if (currentPosition > 0) {
            window.requestAnimationFrame(scrollToTop);
            window.scrollTo(0, currentPosition - currentPosition / 8);
        }
    };
    scrollToTop();
});

// Cookie Consent Banner - Unified Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Use existing cookie banner from HTML
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptBtn = document.getElementById('acceptCookies');

    // Only show if consent hasn't been given
    if (!getCookie('cookiesAccepted') && !localStorage.getItem('cookiesAccepted')) {
        cookieConsent.classList.remove('hidden');
    }

    // Handle acceptance
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            setCookie('cookiesAccepted', 'true', 30); // Expires in 30 days
            localStorage.setItem('cookiesAccepted', 'true');
            cookieConsent.classList.add('hidden');
        });
    }

    // Cookie functions
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }
    
    function getCookie(name) {
        const cookieName = name + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');
        for(let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return "";
    }
});

// Contact Form Handling
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    // Load saved form data
    loadFormData();

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString()
        };

        // Validate form
        if (!formData.name || !formData.email || !formData.message) {
            showStatus('Please fill in all required fields', 'error');
            return;
        }

        if (!validateEmail(formData.email)) {
            showStatus('Please enter a valid email address', 'error');
            return;
        }

        // Save form data
        sessionStorage.setItem('contactFormData', JSON.stringify(formData));
        
        // Save to localStorage if cookies accepted
        if (localStorage.getItem('cookiesAccepted') === 'true') {
            saveToLocalStorage(formData);
        }

        // Submit form
        simulateFormSubmission(formData);
    });

    // Auto-save form data
    const debouncedSave = debounce(function() {
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        try {
            sessionStorage.setItem('contactFormAutoSave', JSON.stringify(formData));
        } catch (e) {
            console.error('Session storage error:', e);
        }
    }, 1000);
    
    contactForm.addEventListener('input', debouncedSave);

    // Helper functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function showStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = 'form-status ' + type;
        formStatus.style.display = 'block';
        
        setTimeout(function() {
            formStatus.style.display = 'none';
        }, 5000);
    }
    
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }
    
    function saveToLocalStorage(formData) {
        let submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
        submissions.push(formData);
        localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
    }
    
    function loadFormData() {
        const autoSavedData = JSON.parse(sessionStorage.getItem('contactFormAutoSave') || '{}');
        if (autoSavedData.name) document.getElementById('name').value = autoSavedData.name;
        if (autoSavedData.email) document.getElementById('email').value = autoSavedData.email;
        if (autoSavedData.subject) document.getElementById('subject').value = autoSavedData.subject;
        if (autoSavedData.message) document.getElementById('message').value = autoSavedData.message;
    }
    
    function simulateFormSubmission(formData) {
        const submitBtn = contactForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
    
        fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('✅ API Response:', data);
            contactForm.reset();
            sessionStorage.removeItem('contactFormAutoSave');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
            document.getElementById('successPopup').classList.remove('hidden');
        })
        .catch(error => {
            console.error('❌ Error sending form data:', error);
            showStatus('Oops! Something went wrong.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        });
    }
});

// Success Popup Handling
document.addEventListener('DOMContentLoaded', function () {
    const closePopup = document.getElementById('closePopup');
    closePopup.addEventListener('click', function () {
        document.getElementById('successPopup').classList.add('hidden');
    });
});

// Testimonials Slider
document.addEventListener('DOMContentLoaded', function() {
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.testimonial-arrow.prev');
    const nextBtn = document.querySelector('.testimonial-arrow.next');
    let currentIndex = 0;

    // Show initial testimonial
    showTestimonial(currentIndex);

    // Navigation handlers
    nextBtn.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
    });

    prevBtn.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentIndex);
    });

    // Auto-rotate every 8 seconds
    let slideInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
    }, 8000);

    // Pause on hover
    document.querySelector('.testimonials-slider').addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    document.querySelector('.testimonials-slider').addEventListener('mouseleave', () => {
        slideInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
        }, 8000);
    });

    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.classList.toggle('active', i === index);
        });
    }
});

// Smooth scrolling for Explore Tours button
document.addEventListener('DOMContentLoaded', function() {
    const exploreBtn = document.querySelector('.explore-btn');
    
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const destinationsSection = document.getElementById('popular-destinations');
            
            if (destinationsSection) {
                destinationsSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Optional: Add temporary highlight effect
                destinationsSection.style.animation = 'highlight 2s';
                setTimeout(() => {
                    destinationsSection.style.animation = '';
                }, 2000);
            }
        });
    }
});