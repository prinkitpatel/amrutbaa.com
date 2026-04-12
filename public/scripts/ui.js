export function initFonts() {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap';
    l.media = 'print';
    l.onload = function () { this.media = 'all'; };
    document.head.appendChild(l);
}

// Additional UI functions can be added here
// For example, toast notifications, modals, scroll spy, etc.


// ===============================================
// AMRUT BAA - Enhanced JavaScript
// ===============================================

console.log('main.js loaded');



// ===============================================
// MODAL TRIGGERS - All CTA buttons open modal
// ===============================================

export function initModalTriggers() {
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

export function initCountdownTimer() {
    updateCountdown();
    // Update every second
    setInterval(updateCountdown, 1000);
}

export function updateCountdown() {
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

export function getNextSundayDeadline(fromDate) {
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

export function displayCountdown(milliseconds, isNextWeek) {
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

    // Also update modalTimer if it exists
    const modalTimer = document.getElementById('modalTimer');
    if (modalTimer) {
        modalTimer.textContent = `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

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
// SCROLL ANIMATIONS
// ===============================================

export function initScrollAnimations() {
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

export function initNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;

    const handleScroll = () => {
        if (!inThrottle) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.scrollY;

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
                inThrottle = false;
            });
            inThrottle = true;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    navbar.style.transition = 'all 0.3s ease';
}

// ===============================================
// SMOOTH SCROLLING
// ===============================================

export function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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
// UTILITY FUNCTIONS
// ===============================================

export function isInViewport(element) {
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

// ===============================================
// TESTIMONIALS CAROUSEL
// ===============================================

export function initTestimonialsCarousel() {
    try {
        console.log('initTestimonialsCarousel called');

        // Testimonials data
        const testimonials = [
            {
                stars: 5,
                quote: "I was ordering Zomato 4 times a week even though I had a functioning kitchen. It felt wasteful. I tried Amrutbaa's chutney once, and suddenly my home cooking tastes restaurant-quality. Now I cook because I want to, not because I have to. That's priceless.",
                avatar: "AS",
                author: "Anjali Singh",
                role: "Tech Manager, Mumbai",
                category: "Swiggy Guilt"
            },
            {
                stars: 5,
                quote: "I dreaded the 6 PM cooking rush. Chopping garlic, grinding spices, the endless prep. One spoon of Amrutbaa changes everything—my dal goes from basic to 'what did you add?' in 30 seconds. My family thinks I'm a better cook now. I'm just smarter about my time.",
                avatar: "RK",
                author: "Rashmi Krishnan",
                role: "Mother of Two, Bangalore",
                category: "Time Saver"
            },
            {
                stars: 5,
                quote: "I've been checking labels obsessively for 2 years. Most chutneys are packed with sugar and preservatives I can't pronounce. Amrutbaa tastes MORE vibrant than anything I've tried, yet it's 100% clean. My conscience is clear, and my taste buds are dancing.",
                avatar: "NM",
                author: "Neha Mehta",
                role: "Wellness Coach, Delhi",
                category: "Health First"
            },
            {
                stars: 5,
                quote: "I was nervous about hosting my in-laws for dinner. Ordered Amrutbaa on a whim. Set it on the table next to my dal, and they literally asked for the name and how much I paid for it. Three days later, they called asking where to order. Best ₹800 I've spent on 'being a host.'",
                avatar: "VJ",
                author: "Vikram Joshi",
                role: "Entrepreneur, Ahmedabad",
                category: "Party Winner"
            },
            {
                stars: 5,
                quote: "My mom has been making chutney for 30 years, and even she asked me where I got this. The punch of garlic and the balance of spices is exactly what home-cooked should taste like. I order weekly now.",
                avatar: "SP",
                author: "Sunita Patel",
                role: "Retired Chef, Ahmedabad",
                category: "Expert Approved"
            },
            {
                stars: 5,
                quote: "As a busy dad managing a startup, this chutney is my secret weapon. My kids actually finish their lunch now. Their school lunch box was getting back untouched. Now they ask for more.",
                avatar: "RD",
                author: "Rohan Desai",
                role: "Startup Founder, Pune",
                category: "Parent Approved"
            },
            {
                stars: 5,
                quote: "I gifted this to my foodie friend who has everything. She loved it so much she ordered 5 jars for her book club dinner. The freshness and authenticity are unmatched.",
                avatar: "PS",
                author: "Priya Saxena",
                role: "Lifestyle Influencer, Delhi",
                category: "Gift Worthy"
            },
            {
                stars: 5,
                quote: "I run a small restaurant, and my customers keep asking what chutney I'm using with my dal dishes. Amrutbaa's is the only one I trust now. It has that authentic, grandmother-made quality.",
                avatar: "MK",
                author: "Meera Kothari",
                role: "Restaurant Owner, Mumbai",
                category: "Pro Kitchen"
            }
        ];

        const carousel = document.getElementById('testimonialsCarousel');
        const featured = document.getElementById('featuredTestimonial');
        const carouselPrev = document.getElementById('carouselPrev');
        const carouselNext = document.getElementById('carouselNext');
        const indicatorsDots = document.getElementById('indicatorsDots');
        const indicatorsText = document.getElementById('indicatorsText');
        const featuredNavPrev = document.querySelector('.featured-nav-prev');
        const featuredNavNext = document.querySelector('.featured-nav-next');

        console.log('Elements found:', { featured: !!featured, featuredNavPrev: !!featuredNavPrev, featuredNavNext: !!featuredNavNext });

        if (!featured) {
            console.error('Missing featured testimonial element');
            return;
        }

        let currentIndex = 0;

        // Render featured testimonial
        function renderFeatured() {
            console.log('renderFeatured called, currentIndex:', currentIndex);
            const t = testimonials[currentIndex];
            console.log('Testimonial data:', t);

            // Test with simple HTML first
            const html = `<div style="color: black; font-size: 16px;">
            <div class="featured-stars">${'★'.repeat(t.stars)}</div>
            <div class="featured-category" style="background: rgba(212, 175, 55, 0.15); color: #6B1C23; padding: 0.4rem 0.9rem; border-radius: 12px; display: inline-block; font-size: 0.75rem; font-weight: 700; margin-bottom: 1.2rem;">${t.category}</div>
            <p class="featured-quote" style="color: #1a1a1a; font-size: 1.2rem; margin-bottom: 1.5rem;">"${t.quote}"</p>
            <div class="featured-footer" style="display: flex; gap: 1.2rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid rgba(212, 175, 55, 0.15);">
                <div class="featured-avatar" style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #6B1C23, #C9A961); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.8rem;">${t.avatar}</div>
                <div>
                    <div class="featured-author" style="font-weight: 700; color: #6B1C23; font-size: 1rem; margin-bottom: 0.2rem;">${t.author}</div>
                    <div class="featured-role" style="font-size: 0.85rem; color: #666; font-weight: 500; margin-bottom: 0.3rem;">${t.role}</div>
                    <div class="featured-verified" style="font-size: 0.75rem; color: #2E7D32; font-weight: 700;">✓ Verified Customer</div>
                </div>
            </div>
        </div>`;

            featured.innerHTML = html;
            console.log('featured.innerHTML set to:', html);
        }

        function update() {
            renderFeatured();
        }

        if (featuredNavPrev) {
            featuredNavPrev.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
                update();
            });
        }

        if (featuredNavNext) {
            featuredNavNext.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % testimonials.length;
                update();
            });
        }

        // Initial render
        renderFeatured();

    } catch (error) {
        console.error('Error in initTestimonialsCarousel:', error);
    }
}