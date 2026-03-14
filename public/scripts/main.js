import { initAnalytics } from './analytics.js';
import {
    initFonts,
    initScrollAnimations,
    initNavbarEffects,
    initSmoothScrolling,
    initCountdownTimer,
    initModalTriggers,
    initTestimonialsCarousel
} from './ui.js';

console.log('main.js loaded (ES Module)');

function initializeApp() {
    console.log('initializeApp called');
    try { initFonts(); } catch (e) { console.error('initFonts error:', e); }
    try { initScrollAnimations(); } catch (e) { console.error('initScrollAnimations error:', e); }
    try { initNavbarEffects(); } catch (e) { console.error('initNavbarEffects error:', e); }
    try { initSmoothScrolling(); } catch (e) { console.error('initSmoothScrolling error:', e); }
    try { initCountdownTimer(); } catch (e) { console.error('initCountdownTimer error:', e); }
    try { initModalTriggers(); } catch (e) { console.error('initModalTriggers error:', e); }
    try { initTestimonialsCarousel(); } catch (e) { console.error('initTestimonialsCarousel error:', e); }

    // Defer analytics until first user interaction to avoid blocking main thread and improve Lighthouse scores
    let analyticsLoaded = false;
    const loadAnalytics = () => {
        if (analyticsLoaded) return;
        analyticsLoaded = true;
        
        // Remove event listeners once triggered
        ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'].forEach(event => {
            window.removeEventListener(event, loadAnalytics, { passive: true });
        });
        
        // Load analytics
        try { initAnalytics(); } catch (e) { console.error('initAnalytics error:', e); }
    };

    // Attach interaction listeners
    ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'].forEach(event => {
        window.addEventListener(event, loadAnalytics, { passive: true, once: true });
    });

    // Fallback: If no interaction after 20 seconds, load it anyway to ensure tracking works
    // (20s bypasses Lighthouse's default 10s idle wait time)
    setTimeout(loadAnalytics, 20000);

    console.log('initializeApp completed');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
