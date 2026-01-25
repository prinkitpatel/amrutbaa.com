// ===============================================
// AMRUT BAA - Enhanced JavaScript
// ===============================================

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initFormHandling();
    initScrollAnimations();
    initNavbarEffects();
    initSmoothScrolling();
    initParallaxEffects();
    initCountdownTimer();
    console.log('🌶️ Amrut Baa website loaded successfully!');
});

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
        return;
    }
    
    displayCountdown(timeRemaining, false);
}

function getNextSundayDeadline(fromDate) {
    const date = new Date(fromDate);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // If it's Sunday and before 9:00 PM, deadline is today
    if (dayOfWeek === 0) {
        const deadline = new Date(date);
        deadline.setHours(21, 0, 0, 0);
        
        if (date < deadline) {
            return deadline;
        }
    }
    
    // Otherwise, find next Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    const nextSunday = new Date(date);
    nextSunday.setDate(date.getDate() + daysUntilSunday);
    nextSunday.setHours(21, 0, 0, 0);
    
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
// FORM HANDLING
// ===============================================

function initFormHandling() {
    const quickForm = document.getElementById('quick-form');
    const fullForm = document.getElementById('registration-form');
    const step1 = document.getElementById('form-step-1');
    const quickPhoneInput = document.getElementById('quick-phone');
    
    // Handle quick form (Step 1 - Phone only)
    if (quickForm) {
        quickForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const phoneValue = quickPhoneInput.value.trim();
            
            // Basic phone validation
            if (phoneValue.length < 10) {
                showToast('Please enter a valid phone number', 'error');
                return;
            }
            
            // Transfer phone to full form
            document.getElementById('phone').value = phoneValue;
            
            // Switch to step 2
            step1.style.display = 'none';
            fullForm.style.display = 'block';
            
            // Scroll to form
            fullForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            showToast('Great! Now complete your order details', 'success');
        });
        
        // Phone input validation
        quickPhoneInput.addEventListener('input', function(e) {
            // Allow only numbers, spaces, +, and -
            this.value = this.value.replace(/[^0-9+\s\-]/g, '');
        });
    }
    
    // Handle full registration form (Step 2)
    if (fullForm) {
        const phoneInput = document.getElementById('phone');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const submitButton = fullForm.querySelector('.btn-submit');
        const packageSelect = document.getElementById('package');
        const summaryBox = document.getElementById('order-summary');
        const summarySubtotal = document.querySelector('.summary-subtotal');
        const summaryShipping = document.querySelector('.summary-shipping');
        const summaryTotal = document.querySelector('.summary-total');

        const catalog = {
            trial: { name: 'The Trial Jar', price: 199, weight: '200g' },
            family: { name: 'The Family Pack', price: 449, weight: '500g' },
            duo: { name: "The 'Share the Love' Duo", price: 398, weight: '2 x 200g' },
            quarterly: { name: 'The Quarterly Stock', price: 849, weight: '2 x 500g' }
        };

        function updateSummary() {
            if (!packageSelect || !summaryBox) return;
            const pkg = catalog[packageSelect.value];
            if (!pkg) {
                summaryBox.style.display = 'none';
                return;
            }
            const shipping = pkg.price >= 399 ? 0 : 59;
            const total = pkg.price + shipping;
            summarySubtotal.textContent = `₹${pkg.price}`;
            summaryShipping.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
            summaryTotal.textContent = `₹${total}`;
            summaryBox.style.display = 'block';
        }

        if (packageSelect) {
            packageSelect.addEventListener('change', updateSummary);
            updateSummary();
        }
        
        // Phone number validation (10 digits)
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                this.value = this.value.replace(/\D/g, '').slice(0, 10);
                validateField(this, this.value.length === 10);
            });
        }
        
        // Name validation (letters and spaces only)
        if (nameInput) {
            nameInput.addEventListener('input', function(e) {
                this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
                validateField(this, this.value.trim().length >= 2);
            });
        }
        
        // Email validation
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (this.value) {
                    const isValid = isValidEmail(this.value);
                    validateField(this, isValid);
                    if (!isValid) {
                        showToast('Please enter a valid email address', 'error');
                    }
                }
            });
        }
        
        // Form submission with loading state
        fullForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim(),
            package: document.getElementById('package').value,
            packaging: document.getElementById('packaging').value,
            termsAccepted: document.getElementById('terms').checked
        };
        
        // Validate required fields
        if (!validateForm(formData)) {
            return;
        }
        
        // Add loading state
        submitButton.classList.add('loading');
        submitButton.textContent = 'Processing...';
        submitButton.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            showSuccessMessage(formData);
            fullForm.reset();
            step1.style.display = 'block';
            fullForm.style.display = 'none';
            submitButton.classList.remove('loading');
            submitButton.textContent = 'Confirm My Order →';
            submitButton.disabled = false;
        }, 1500);
    });
    
    // Add character counter for address
    const addressField = document.getElementById('address');
    if (addressField) {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.cssText = 'text-align: right; font-size: 0.85rem; color: var(--gray); margin-top: 0.5rem;';
        addressField.parentElement.appendChild(counter);
        
        addressField.addEventListener('input', function() {
            const length = this.value.length;
            counter.textContent = `${length}/500 characters`;
            counter.style.color = length < 10 ? 'var(--maroon)' : 'var(--gray)';
        });
    }
    
    // Prevent Enter key submission (except textarea)
    if (fullForm) {
        fullForm.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const inputs = Array.from(fullForm.querySelectorAll('input, select, textarea'));
                    const currentIndex = inputs.indexOf(this);
                    if (currentIndex < inputs.length - 1) {
                        inputs[currentIndex + 1].focus();
                    }
                }
            });
        });
    }
}

function validateField(field, isValid) {
    if (isValid) {
        field.style.borderColor = '#4CAF50';
    } else {
        field.style.borderColor = 'var(--maroon)';
    }
}

function validateForm(data) {
    if (data.name.length < 2) {
        showToast('Please enter a valid name (at least 2 characters)', 'error');
        return false;
    }
    
    if (data.phone.length !== 10) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return false;
    }
    
    if (data.email && !isValidEmail(data.email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
    }
    
    if (data.address.length < 10) {
        showToast('Please enter a complete delivery address', 'error');
        return false;
    }
    
    if (!data.package) {
        showToast('Please select a package', 'error');
        return false;
    }
    
    if (!data.termsAccepted) {
        showToast('Please accept the terms to proceed', 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showSuccessMessage(data) {
    const now = new Date();
    const deadline = getNextSundayDeadline(now);
    const nextMonday = new Date(deadline);
    nextMonday.setDate(nextMonday.getDate() + 1);
    const nextTuesday = new Date(deadline);
    nextTuesday.setDate(nextTuesday.getDate() + 2);

    const catalog = {
        trial: { name: 'The Trial Jar', price: 199, weight: '200g' },
        family: { name: 'The Family Pack', price: 449, weight: '500g' },
        duo: { name: "The 'Share the Love' Duo", price: 398, weight: '2 x 200g' },
        quarterly: { name: 'The Quarterly Stock', price: 849, weight: '2 x 500g' }
    };
    const pkg = catalog[data.package];
    const shipping = pkg && pkg.price >= 399 ? 0 : 59;
    const total = pkg ? pkg.price + shipping : 0;
    
    const message = `
        <div class="success-popup">
            <div class="success-icon">🎉</div>
            <h3>Order Confirmed!</h3>
            <p>Thank you, <strong>${data.name}</strong>!</p>
            <div class="success-details">
                <p class="success-highlight">🌶️ Your order is in this week's fresh batch!</p>
                <ul>
                    <li><strong>Package:</strong> ${pkg ? pkg.name : ''} (${pkg ? pkg.weight : ''})</li>
                    <li><strong>Packaging:</strong> ${data.packaging}</li>
                    <li><strong>Subtotal:</strong> ₹${pkg ? pkg.price : 0}</li>
                    <li><strong>Shipping:</strong> ${shipping === 0 ? 'FREE' : `₹${shipping}`}</li>
                    <li><strong>Total:</strong> ₹${total}</li>
                    <li><strong>Delivery:</strong> ${data.address.substring(0, 50)}${data.address.length > 50 ? '...' : ''}</li>
                </ul>
                <div class="batch-timeline">
                    <div class="timeline-item">
                        <span class="timeline-day">Monday</span>
                        <span class="timeline-desc">Fresh ingredients sourced & prepared</span>
                    </div>
                    <div class="timeline-item">
                        <span class="timeline-day">Tuesday morning</span>
                        <span class="timeline-desc">Dispatched to your doorstep</span>
                    </div>
                    <div class="timeline-item">
                        <span class="timeline-day">Wed-Fri</span>
                        <span class="timeline-desc">Delivered fresh</span>
                    </div>
                </div>
                <p class="confirmation-note">You will receive a confirmation call/message at <strong>${data.phone}</strong> within 24 hours.</p>
            </div>
            <button onclick="closeSuccessPopup()" class="btn-primary">Got it!</button>
        </div>
        <div class="popup-overlay" onclick="closeSuccessPopup()"></div>
    `;
    
    const popup = document.createElement('div');
    popup.innerHTML = message;
    document.body.appendChild(popup);
    
    // Add styles for popup
    const style = document.createElement('style');
    style.textContent = `
        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 9998;
            animation: fadeIn 0.3s ease-out;
        }
        .success-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 3rem;
            border-radius: 16px;
            max-width: 550px;
            width: 90%;
            z-index: 9999;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideInDown 0.4s ease-out;
            text-align: center;
            max-height: 90vh;
            overflow-y: auto;
        }
        .success-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .success-popup h3 {
            color: var(--maroon);
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        .success-highlight {
            background: linear-gradient(135deg, var(--maroon) 0%, var(--dark-purple) 100%);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        .success-details {
            text-align: left;
            background: var(--cream);
            padding: 1.5rem;
            border-radius: 8px;
            margin: 1.5rem 0;
        }
        .success-details ul {
            margin: 1rem 0;
            padding-left: 0;
            list-style: none;
        }
        .success-details li {
            margin: 0.75rem 0;
            padding-left: 0;
        }
        .batch-timeline {
            background: white;
            padding: 1rem;
            border-radius: 6px;
            margin: 1rem 0;
            border: 2px solid var(--golden);
        }
        .timeline-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--light-gray);
        }
        .timeline-item:last-child {
            border-bottom: none;
        }
        .timeline-day {
            font-weight: 700;
            color: var(--maroon);
            min-width: 80px;
        }
        .timeline-desc {
            color: var(--gray);
            font-size: 0.9rem;
            text-align: right;
        }
        .confirmation-note {
            margin-top: 1rem;
            font-size: 0.95rem;
            color: var(--gray);
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translate(-50%, -60%);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }
    `;
    document.head.appendChild(style);
}

window.closeSuccessPopup = function() {
    document.querySelector('.success-popup')?.parentElement.remove();
    document.querySelector('.popup-overlay')?.remove();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${type === 'error' ? 'var(--maroon)' : 'var(--dark-purple)'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
    
    // Add animation styles
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
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

console.log('Made with ❤️ preserving 90+ years of tradition');