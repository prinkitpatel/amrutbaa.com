// Form validation and submission handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registration-form');
    const phoneInput = document.getElementById('phone');
    const nameInput = document.getElementById('name');
    
    // Phone number validation (10 digits)
    phoneInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
    });
    
    // Name validation (letters and spaces only)
    nameInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim(),
            quantity: document.getElementById('quantity').value,
            packaging: document.getElementById('packaging').value,
            termsAccepted: document.getElementById('terms').checked
        };
        
        // Validate required fields
        if (!validateForm(formData)) {
            return;
        }
        
        // Show success message
        showSuccessMessage(formData);
        
        // Reset form
        form.reset();
    });
    
    function validateForm(data) {
        // Name validation
        if (data.name.length < 2) {
            alert('Please enter a valid name (at least 2 characters)');
            return false;
        }
        
        // Phone validation
        if (data.phone.length !== 10) {
            alert('Please enter a valid 10-digit phone number');
            return false;
        }
        
        // Address validation
        if (data.address.length < 10) {
            alert('Please enter a complete delivery address');
            return false;
        }
        
        // Quantity validation
        if (!data.quantity) {
            alert('Please select a quantity');
            return false;
        }
        
        // Terms validation
        if (!data.termsAccepted) {
            alert('Please accept the terms to proceed');
            return false;
        }
        
        return true;
    }
    
    function showSuccessMessage(data) {
        const message = `
            🎉 Registration Successful!
            
            Thank you, ${data.name}!
            
            Your registration for the next batch has been received.
            
            Details:
            • Quantity: ${data.quantity} jar(s)
            • Packaging: ${data.packaging}
            • Delivery to: ${data.address.substring(0, 50)}${data.address.length > 50 ? '...' : ''}
            
            You will receive a confirmation call/message at ${data.phone} within 24 hours.
            
            Preparation Date: January 5, 2026
            Registration Deadline: January 4, 2026
            
            Thank you for choosing Amrut Baa! 🌶️
        `;
        
        alert(message);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Add scroll-based navbar shadow
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in to sections
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// Dynamic batch slots counter (simulated)
function updateBatchSlots() {
    const slotsElement = document.querySelector('.batch-slots strong');
    if (slotsElement) {
        // This would connect to your backend in production
        // For now, it's a static display
        const currentSlots = 50;
        slotsElement.textContent = currentSlots;
        
        // Change color if slots are running low
        if (currentSlots <= 10) {
            slotsElement.style.color = '#C41E3A';
        }
    }
}

// Initialize on page load
updateBatchSlots();

// Add loading state to submit button
const submitButton = document.querySelector('.submit-button');
if (submitButton) {
    submitButton.addEventListener('click', function() {
        const originalText = this.textContent;
        this.textContent = 'Processing...';
        this.disabled = true;
        
        setTimeout(() => {
            this.textContent = originalText;
            this.disabled = false;
        }, 2000);
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add real-time email validation
document.getElementById('email')?.addEventListener('blur', function() {
    if (this.value && !isValidEmail(this.value)) {
        this.style.borderColor = '#C41E3A';
        alert('Please enter a valid email address');
    } else {
        this.style.borderColor = '#ddd';
    }
});

// Prevent form submission on Enter key (except textarea)
document.querySelectorAll('.registration-form input, .registration-form select').forEach(element => {
    element.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const form = this.closest('form');
            const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
            const currentIndex = inputs.indexOf(this);
            if (currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
            }
        }
    });
});

// Add character counter for address field
const addressField = document.getElementById('address');
if (addressField) {
    const counter = document.createElement('div');
    counter.style.cssText = 'text-align: right; font-size: 0.85rem; color: #5A4A42; margin-top: 4px;';
    addressField.parentElement.appendChild(counter);
    
    addressField.addEventListener('input', function() {
        const length = this.value.length;
        counter.textContent = `${length} characters`;
        
        if (length < 10) {
            counter.style.color = '#C41E3A';
        } else {
            counter.style.color = '#5A4A42';
        }
    });
}

console.log('🌶️ Amrut Baa website loaded successfully!');
console.log('Made with ❤️ preserving 90+ years of tradition');
