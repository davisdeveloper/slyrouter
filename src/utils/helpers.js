// src/utils/helpers.js
export function parseQueryString(queryString) {
    const params = {};
    if (!queryString) return params;

    const queries = queryString.substring(1).split('&');

    for (const query of queries) {
        const [key, value] = query.split('=');
        if (key) {
            const decodedKey = decodeURIComponent(key);
            const decodedValue = value ? decodeURIComponent(value) : '';

            if (params[decodedKey]) {
                if (Array.isArray(params[decodedKey])) {
                    params[decodedKey].push(decodedValue);
                } else {
                    params[decodedKey] = [params[decodedKey], decodedValue];
                }
            } else {
                params[decodedKey] = decodedValue;
            }
        }
    }
    return params;
}

export function buildURL(path, queryParams = {}) {
    const url = new URL(path, window.location.origin);

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
                value.forEach(v => url.searchParams.append(key, v));
            } else {
                url.searchParams.set(key, value);
            }
        }
    });

    return url.pathname + url.search + url.hash;
}

export function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

export function throttle(fn, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn.apply(this, args);
        }
    };
}