// ===============================================
// AMRUT BAA - Enhanced JavaScript
// ===============================================

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initNavbarEffects();
    initSmoothScrolling();
    initParallaxEffects();
    initCountdownTimer();
    updateBatchNumbers(); // Add batch number display
    initModalTriggers();
});

// ===============================================
// MODAL TRIGGERS - All CTA buttons open modal
// ===============================================

function initModalTriggers() {
    // Main CTA buttons
    const openModalBtn = document.getElementById('openModalBtn');
    const openModalBtnSticky = document.getElementById('openModalBtnSticky');
    const promiseCtaBtn = document.getElementById('promiseCtaBtn');
    
    // Journey CTA buttons
    const journeyCtaHeritage = document.getElementById('journeyCtaHeritage');
    const journeyCtaIngredients = document.getElementById('journeyCtaIngredients');
    const journeyCtaBatch = document.getElementById('journeyCtaBatch');
    const journeyCtaRegister = document.getElementById('journeyCtaRegister');
    
    // Add click handlers to all buttons
    const allButtons = [
        openModalBtn,
        openModalBtnSticky,
        promiseCtaBtn,
        journeyCtaHeritage,
        journeyCtaIngredients,
        journeyCtaBatch,
        journeyCtaRegister
    ];
    
    allButtons.forEach(btn => {
        if (btn && window.OrderModal && window.OrderModal.open) {
            btn.addEventListener('click', window.OrderModal.open);
        }
    });
}

// ===============================================
// COUNTDOWN TIMER - Weekly Batch Deadline
// ===============================================

function initCountdownTimer() {
    updateCountdown();
    // Update every second
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    const deadline = getNextSundayDeadline(now);
    const timeRemaining = deadline - now;
    
    if (timeRemaining <= 0) {
        // Deadline passed, show next week
        const nextDeadline = getNextSundayDeadline(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
        displayCountdown(nextDeadline - now, true);
        updateBatchNumbers();
        return;
    }
    
    displayCountdown(timeRemaining, false);
    updateBatchNumbers();
}

function getNextSundayDeadline(fromDate) {
    const date = new Date(fromDate);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHour = date.getHours();
    const currentMinute = date.getMinutes();
    
    // Calculate seconds since midnight
    const secondsSinceMidnight = currentHour * 3600 + currentMinute * 60 + date.getSeconds();
    const deadline9PM = 21 * 3600; // 9 PM in seconds
    
    // If it's Sunday
    if (dayOfWeek === 0) {
        // If before 9 PM on Sunday, deadline is TODAY at 9 PM
        if (secondsSinceMidnight < deadline9PM) {
            const deadline = new Date(date);
            deadline.setHours(21, 0, 0, 0);
            return deadline;
        }
        // If 9 PM or later on Sunday, deadline is NEXT Sunday (7 days)
        // Fall through to calculate next Sunday
    }
    
    // Calculate days until next Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 7 : (7 - dayOfWeek);
    const nextSunday = new Date(date);
    nextSunday.setDate(date.getDate() + daysUntilSunday);
    nextSunday.setHours(21, 0, 0, 0);
    nextSunday.setMinutes(0, 0);
    
    return nextSunday;
}

function displayCountdown(milliseconds, isNextWeek) {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    
    // Add urgency styling when less than 24 hours
    const countdownTimer = document.getElementById('countdown-timer');
    if (countdownTimer) {
        if (days === 0 && hours < 24) {
            countdownTimer.classList.add('urgent');
        } else {
            countdownTimer.classList.remove('urgent');
        }
        
        // Add critical urgency when less than 1 hour
        if (days === 0 && hours === 0) {
            countdownTimer.classList.add('critical');
        } else {
            countdownTimer.classList.remove('critical');
        }
    }
    
    // Update deadline message based on context
    const deadlineMessage = document.querySelector('.deadline-message');
    if (deadlineMessage) {
        if (isNextWeek) {
            deadlineMessage.innerHTML = '<strong>This week\'s orders are closed.</strong> Next batch opens Monday.';
            deadlineMessage.classList.add('closed');
        } else if (days === 0 && hours < 3) {
            deadlineMessage.innerHTML = '<strong>⚠️ Final hours!</strong> Order now before Sunday 9:00 PM.';
            deadlineMessage.classList.add('urgent');
        } else if (days === 0) {
            deadlineMessage.innerHTML = '<strong>Last day!</strong> Order by Sunday 9:00 PM.';
            deadlineMessage.classList.add('urgent');
        } else {
            deadlineMessage.innerHTML = 'Orders close <strong>Sunday at 9:00 PM</strong>';
            deadlineMessage.classList.remove('urgent', 'closed');
        }
    }
}

// ===============================================
// BATCH NUMBER MANAGEMENT
// ===============================================

function getCurrentBatchNumber() {
    // Batch 4 is current starting from the reference deadline
    // Batch increments by 1 when the Sunday 9 PM deadline restarts
    const baseBatchNumber = 4;
    const baseDeadline = new Date(2026, 1, 15, 21, 0, 0); // Feb 15, 2026, 9 PM IST
    const now = new Date();

    const nextDeadline = getNextSundayDeadline(now);
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    let weeksDiff = Math.floor((nextDeadline - baseDeadline) / weekMs);

    if (weeksDiff < 0) {
        weeksDiff = 0;
    }

    return baseBatchNumber + weeksDiff;
}

function updateBatchNumbers() {
    const batchNumber = getCurrentBatchNumber();
    
    // Update all batch number displays
    const batchElements = document.querySelectorAll('[id*="batch-number"]');
    batchElements.forEach(el => {
        el.textContent = batchNumber;
    });
    
    // Store batch number in window for modal access
    window.currentBatchNumber = batchNumber;
}

// ===============================================
// SCROLL ANIMATIONS
// ===============================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Observe cards
    document.querySelectorAll('.story-card, .step, .product-info-box').forEach(card => {
        observer.observe(card);
    });
}

// ===============================================
// NAVBAR EFFECTS
// ===============================================

function initNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Enhanced shadow on scroll
        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)';
            navbar.style.background = 'linear-gradient(135deg, rgba(77, 14, 19, 0.98) 0%, rgba(107, 28, 35, 0.98) 100%)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
            navbar.style.background = 'linear-gradient(135deg, #4D0E13 0%, #6B1C23 100%)';
            navbar.style.backdropFilter = 'none';
        }
        
        // Hide navbar on scroll down (mobile)
        if (window.innerWidth <= 768) {
            if (currentScroll > lastScroll && currentScroll > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        }
        
        lastScroll = currentScroll;
    });
    
    navbar.style.transition = 'all 0.3s ease';
}

// ===============================================
// SMOOTH SCROLLING
// ===============================================

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===============================================
// PARALLAX EFFECTS
// ===============================================

function initParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        // Hero parallax
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
        
        // Product image float
        const productImage = document.querySelector('.product-main');
        if (productImage && isInViewport(productImage)) {
            productImage.style.transform = `translateY(${Math.sin(Date.now() / 1000) * 10}px)`;
        }
    });
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===============================================
// BATCH SLOTS COUNTER (Real-time simulation)
// ===============================================

// Remove old slot-based system - no limits on weekly batches!
// Orders are time-based (Sunday deadline), not quantity-based