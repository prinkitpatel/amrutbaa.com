export function initAnalytics() {
    // 1. Initial UTM & Page Context (Before GTM)
    window.dataLayer = window.dataLayer || [];
    function getStoredUTMParams() {
        try {
            return JSON.parse(sessionStorage.getItem('utmParams') || '{}');
        } catch (e) {
            return {};
        }
    }
    const utmData = getStoredUTMParams();
    window.dataLayer.push({
        // ONLY pushing page context variables, NO 'event' key, to prevent duplicate events
        // GTM will automatically pick these up for its default Page View trigger
        'page_title': document.title,
        'page_location': window.location.href,
        'page_path': window.location.pathname,
        'traffic_source': utmData.utm_source || '(direct)',
        'campaign': utmData.utm_campaign || '(none)',
        'medium': utmData.utm_medium || '(none)',
        'content': utmData.utm_content || '',
        'term': utmData.utm_term || ''
    });

    // 2. Google Tag Manager Initialization
    (function (w, d, s, l, i) {
        w[l] = w[l] || []; w[l].push({
            'gtm.start':
                new Date().getTime(), event: 'gtm.js'
        }); var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-53CBVFF7');

    // 3. Meta Pixel
    !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
        n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
        window.fbq('init', '2736116190056650');
        window.fbq('track', 'PageView');
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // 4. Scroll Tracking
    let scrollTracked = { '25': false, '50': false, '75': false, '100': false };
    let engagementStartTime = Date.now();

    window.addEventListener('scroll', function () {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;
        const scrollPercentage = Math.round((window.scrollY / scrollHeight) * 100);

        ['25', '50', '75', '100'].forEach(threshold => {
            if (scrollPercentage >= parseInt(threshold) && !scrollTracked[threshold]) {
                scrollTracked[threshold] = true;
                const engagementTime = Math.round((Date.now() - engagementStartTime) / 1000);
                window.dataLayer.push({
                    'event': 'scroll_depth',
                    'scroll_percentage': parseInt(threshold),
                    'engagement_time_seconds': engagementTime
                });
            }
        });
    });

    // 5. CTA and Click Tracking
    document.addEventListener('click', function (e) {
        const ctaEl = e.target.closest('[data-register-btn], .cta-btn, .hero-btn, .sticky-cta-button, .cta-button, .cta-button-secondary, .cta-button-promise, .cta-button-sticky, .journey-cta');
        if (ctaEl) {
            const buttonText = ctaEl.textContent.trim();
            const buttonLocation = ctaEl.closest('.hero') ? 'hero' :
                ctaEl.closest('.sticky-cta-bar') ? 'sticky_footer' :
                    ctaEl.closest('footer') ? 'footer' : 'other';

            const timerDisplay = document.querySelector('.timer-display');
            const timeRemaining = timerDisplay ? timerDisplay.textContent : '';

            window.dataLayer.push({
                'event': 'cta_click',
                'button_text': buttonText,
                'button_location': buttonLocation,
                'countdown_time_remaining': timeRemaining
            });
        }

        if (e.target.closest('.story-card')) {
            window.dataLayer.push({
                'event': 'story_card_click',
                'card_title': e.target.closest('.story-card').querySelector('h3')?.textContent || 'Unknown'
            });
        }

        if (e.target.closest('.faq-question')) {
            const faqTitle = e.target.closest('.faq-item')?.querySelector('.faq-question')?.textContent || 'Unknown';
            window.dataLayer.push({
                'event': 'faq_click',
                'faq_question': faqTitle
            });
        }

        if (e.target.matches('.policy-links a')) {
            window.dataLayer.push({
                'event': 'policy_link_click',
                'policy_type': e.target.textContent.trim()
            });
        }
    });

    // 6. Time on page
    let timeOnPageInterval;
    let totalTimeOnPage = 0;
    function startTimeTracking() {
        timeOnPageInterval = setInterval(function () {
            totalTimeOnPage += 10;
            if (totalTimeOnPage % 30 === 0) {
                window.dataLayer.push({
                    'event': 'user_engagement',
                    'engagement_time_seconds': totalTimeOnPage
                });
            }
        }, 10000);
    }
    startTimeTracking();

    window.addEventListener('beforeunload', function () {
        if (totalTimeOnPage > 0) {
            window.dataLayer.push({
                'event': 'page_exit',
                'total_time_on_page': totalTimeOnPage,
                'max_scroll_depth': Math.max(0, ...Object.keys(scrollTracked).filter(k => scrollTracked[k]).map(Number))
            });
        }
    });
}
