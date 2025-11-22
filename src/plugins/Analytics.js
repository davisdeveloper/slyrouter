// src/plugins/Analytics.js
export default function AnalyticsPlugin(router, options = {}) {
    const defaultOptions = {
        trackPageViews: true,
        trackEvents: true,
        anonymizeIp: true,
        ...options
    };

    if (!defaultOptions.trackingId) {
        console.warn('SlyRouter Analytics: trackingId is required');
        return;
    }

    // Initialize analytics (this is a simplified example)
    function initAnalytics() {
        if (window.gtag) return; // Already initialized

        // Load gtag script
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${defaultOptions.trackingId}`;
        script.async = true;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
            window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', defaultOptions.trackingId, {
            anonymize_ip: defaultOptions.anonymizeIp
        });
    }

    // Track page views
    if (defaultOptions.trackPageViews) {
        router.addMiddleware(async (context) => {
            if (!window.gtag) initAnalytics();

            window.gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: context.route.path
            });
        });
    }

    // Track custom events from components
    if (defaultOptions.trackEvents) {
        router.addMiddleware(async (context) => {
            // Make analytics available to components
            context.router.analytics = {
                trackEvent: (eventName, eventParams = {}) => {
                    if (window.gtag) {
                        window.gtag('event', eventName, eventParams);
                    }
                },
                trackException: (description = '', fatal = false) => {
                    if (window.gtag) {
                        window.gtag('event', 'exception', {
                            description,
                            fatal
                        });
                    }
                }
            };
        });
    }
}