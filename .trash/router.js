// src/router/Router.js
export  class Router1 {
    constructor(routes) {
        this.routes = routes;
        this.currentRoute = null;
        this.currentComponent = null;
        this.params = {};
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.handleRouteChange());
        document.addEventListener('DOMContentLoaded', () => this.handleRouteChange());
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigate(e.target.href);
            }
        });
    }

    async navigate(path) {
        window.history.pushState(null, null, path);
        await this.handleRouteChange();
    }

    matchRoute(path) {
        const exactMatch = this.routes.find(route => route.path === path);
        if (exactMatch) {
            return { route: exactMatch, params: {} };
        }

        const routes = this.routes.filter(route => route.path.includes(':'));

        for (const route of routes) {
            const pattern = this.convertToRegex(route.path);
            const match = path.match(pattern);

            if (match) {
                const params = this.extractParams(route.path, match);
                return { route, params };
            }
        }

        const notFoundRoute = this.routes.find(route => route.path === '404');
        const wildcardRoute = this.routes.find(route => route.path === '*');

        return {
            route: notFoundRoute || wildcardRoute,
            params: { requestedPath: path }
        };
    }

    convertToRegex(path) {
        const pattern = path
            .replace(/:(\w+)/g, '(?<$1>[^/]+)')
            .replace(/\//g, '\\/');

        return new RegExp(`^${pattern}$`);
    }

    extractParams(routePath, match) {
        const params = {};
        const paramNames = [...routePath.matchAll(/:(\w+)/g)].map(m => m[1]);

        paramNames.forEach((name, index) => {
            params[name] = match.groups?.[name] || match[index + 1];
        });

        return params;
    }

    async handleRouteChange() {
        const path = window.location.pathname;
        const { route, params } = this.matchRoute(path);

        if (route && route.component) {
            // Clean up previous component
            if (this.currentComponent) {
                if (this.currentComponent.onLeave) {
                    this.currentComponent.onLeave();
                }
                if (this.currentComponent.destroy) {
                    this.currentComponent.destroy();
                }
            }

            this.currentRoute = route;
            this.params = params;

            const appContainer = document.getElementById('wrapper');
            const Component = await route.component();

            this.currentComponent = Component;
            this.currentComponent.onEnter?.(params);
            if (this.currentComponent.mount) {
                this.currentComponent.mount(appContainer);
            } else {
                appContainer.innerHTML = this.currentComponent.render(params);
            }


            if (route.title) {
                document.title = typeof route.title === 'function'
                    ? route.title(params)
                    : route.title;
            }
        }
    }

    getParams() {
        return this.params;
    }
}

// src/router/Router.js
export default class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentRoute = null;
        this.currentComponent = null;
        this.params = {};
        this.query = {};
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.handleRouteChange());
        document.addEventListener('DOMContentLoaded', () => this.handleRouteChange());
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigate(e.target.href);
            }
        });
    }

    async navigate(path) {
        window.history.pushState(null, null, path);
        await this.handleRouteChange();
    }

    matchRoute(path) {
        const exactMatch = this.routes.find(route => route.path === path);
        if (exactMatch) {
            return { route: exactMatch, params: {} };
        }

        const routes = this.routes.filter(route => route.path.includes(':'));

        for (const route of routes) {
            const pattern = this.convertToRegex(route.path);
            const match = path.match(pattern);

            if (match) {
                const params = this.extractParams(route.path, match);
                return { route, params };
            }
        }

        const notFoundRoute = this.routes.find(route => route.path === '404');
        const wildcardRoute = this.routes.find(route => route.path === '*');

        return {
            route: notFoundRoute || wildcardRoute,
            params: { requestedPath: path }
        };
    }

    convertToRegex(path) {
        const pattern = path
            .replace(/:(\w+)/g, '(?<$1>[^/]+)')
            .replace(/\//g, '\\/');

        return new RegExp(`^${pattern}$`);
    }

    extractParams(routePath, match) {
        const params = {};
        const paramNames = [...routePath.matchAll(/:(\w+)/g)].map(m => m[1]);

        paramNames.forEach((name, index) => {
            params[name] = match.groups?.[name] || match[index + 1];
        });

        return params;
    }

    // New method to parse query parameters
    parseQueryString(queryString) {
        const params = {};
        if (!queryString) return params;

        // Remove the leading '?' and split by '&'
        const queries = queryString.substring(1).split('&');

        for (const query of queries) {
            const [key, value] = query.split('=');
            if (key) {
                // Decode URI components and handle multiple values with the same key
                const decodedKey = decodeURIComponent(key);
                const decodedValue = value ? decodeURIComponent(value) : '';

                if (params[decodedKey]) {
                    // If key already exists, convert to array
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

    // Get full URL information
    getCurrentURL() {
        return {
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            fullPath: window.location.pathname + window.location.search + window.location.hash
        };
    }

    async handleRouteChange() {
        const url = this.getCurrentURL();
        const { route, params } = this.matchRoute(url.pathname);

        // Parse query parameters
        this.query = this.parseQueryString(url.search);

        if (route && route.component) {
            // Clean up previous component
            if (this.currentComponent) {
                if (this.currentComponent.onLeave) {
                    this.currentComponent.onLeave();
                }
                if (this.currentComponent.destroy) {
                    this.currentComponent.destroy();
                }
            }

            this.currentRoute = route;
            this.params = params;

            const appContainer = document.getElementById('wrapper');
            const Component = await route.component();

            this.currentComponent = Component;

            // Pass both params and query to onEnter
            this.currentComponent.onEnter?.(params, this.query);

            if (this.currentComponent.mount) {
                this.currentComponent.mount(appContainer);
            } else {
                appContainer.innerHTML = this.currentComponent.render(params, this.query);
            }

            if (route.title) {
                document.title = typeof route.title === 'function'
                    ? route.title(params, this.query)
                    : route.title;
            }
        }
    }

    getParams() {
        return this.params;
    }

    // New method to get query parameters
    getQuery() {
        return this.query;
    }

    // Helper method to build URLs with query parameters
    buildURL(path, queryParams = {}) {
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

    // Navigate with query parameters
    async navigateWithQuery(path, queryParams = {}) {
        const url = this.buildURL(path, queryParams);
        this.navigate(url);
    }

    // Update current URL with new query parameters
    async updateQuery(newQueryParams, merge = true) {
        const currentQuery = merge ? { ...this.query, ...newQueryParams } : newQueryParams;
        const url = this.buildURL(window.location.pathname, currentQuery);
        this.navigate(url);
    }
}