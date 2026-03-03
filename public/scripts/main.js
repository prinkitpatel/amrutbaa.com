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

    // Defer analytics until page is idle (post-LCP) to avoid blocking main thread
    // Falls back to setTimeout(3s) on browsers without requestIdleCallback
    const deferAnalytics = () => {
        try { initAnalytics(); } catch (e) { console.error('initAnalytics error:', e); }
    };
    if ('requestIdleCallback' in window) {
        requestIdleCallback(deferAnalytics, { timeout: 3000 });
    } else {
        setTimeout(deferAnalytics, 3000);
    }

    console.log('initializeApp completed');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
