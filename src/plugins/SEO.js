
// src/plugins/SEO.js
export default function SEOPlugin(router, options = {}) {
    const defaultOptions = {
        defaultTitle: 'My App',
        defaultDescription: 'A modern web application',
        defaultImage: '',
        siteName: '',
        twitterHandle: '',
        ...options
    };

    // Add middleware to handle SEO meta tags
    router.addMiddleware(async (context) => {
        const { route, params, query } = context;

        // Update document title
        if (route.title) {
            document.title = typeof route.title === 'function'
                ? route.title(params, query)
                : route.title;
        } else if (defaultOptions.defaultTitle) {
            document.title = defaultOptions.defaultTitle;
        }

        // Update meta description
        const description = route.meta?.description || defaultOptions.defaultDescription;
        updateMetaTag('description', description);

        // Update Open Graph tags
        if (defaultOptions.siteName) {
            updateMetaTag('og:site_name', defaultOptions.siteName);
        }
        if (defaultOptions.defaultImage) {
            updateMetaTag('og:image', defaultOptions.defaultImage);
        }

        // Update Twitter Card tags
        if (defaultOptions.twitterHandle) {
            updateMetaTag('twitter:creator', `@${defaultOptions.twitterHandle}`);
            updateMetaTag('twitter:site', `@${defaultOptions.twitterHandle}`);
        }
    });

    function updateMetaTag(name, content) {
        let tag = document.querySelector(`meta[name="${name}"]`) ||
            document.querySelector(`meta[property="${name}"]`);

        if (!tag) {
            tag = document.createElement('meta');
            if (name.startsWith('og:') || name.startsWith('twitter:')) {
                tag.setAttribute('property', name);
            } else {
                tag.setAttribute('name', name);
            }
            document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
    }
}