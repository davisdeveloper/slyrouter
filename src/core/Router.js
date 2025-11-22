// src/core/Router.js
import StateManager from "#core/StateManager";
import AuthService from "#core/AuthService";
import { parseQueryString, buildURL } from "#util/helpers";
import DOM  from '#util/dom';

export default class Router {
    constructor(options = {}) {
        this.options = {
            root: '/',
            mode: 'history',
            linkSelector: '[data-sly-link]',
            formSelector: '[data-sly-form]',
            container: '#app',
            ...options
        };

        this.routes = new Map();
        this.currentRoute = null;
        this.currentComponent = null;
        this.params = {};
        this.query = {};
        this.stateManager = new StateManager(options.state);
        this.authService = new AuthService(options.auth);
        this.middlewares = [];
        this.plugins = new Map();

        this.init();
    }

    // Public API
    addRoute(path, component, options = {}) {
        const route = {
            path,
            component,
            name: options.name,
            meta: options.meta || {},
            title: options.title,
            guards: options.guards || []
        };

        this.routes.set(path, route);
        return this;
    }

    addMiddleware(middleware) {
        this.middlewares.push(middleware);
        return this;
    }

    use(plugin, options = {}) {
        if (typeof plugin.install === 'function') {
            plugin.install(this, options);
        } else if (typeof plugin === 'function') {
            plugin(this, options);
        }
        return this;
    }

    async navigate(path, options = {}) {
        const url = buildURL(path, options.query || {});

        if (options.replace) {
            window.history.replaceState(null, null, url);
        } else {
            window.history.pushState(null, null, url);
        }

        return this.handleRouteChange();
    }

    back() {
        window.history.back();
    }

    forward() {
        window.history.forward();
    }

    go(delta) {
        window.history.go(delta);
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    getParams() {
        return {
            ...this.params
        };
    }

    getQuery() {
        return {
            ...this.query
        };
    }

    // Protected methods
    init() {
        this.bindEvents();
        this.setupGlobalErrorHandling();
    }

    bindEvents() {
        window.addEventListener('popstate', () => this.handleRouteChange());
        document.addEventListener('DOMContentLoaded', () => this.handleRouteChange());

        // Delegated event handling
        document.addEventListener('click', this.handleLinkClick.bind(this));
        document.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    async handleRouteChange() {
        try {
            const {
                pathname,
                search
            } = window.location;
            const {
                route,
                params
            } = this.matchRoute(pathname);
            this.query = parseQueryString(search);

            if (!route) {
                throw new Error(`No route found for ${pathname}`);
            }

            // Run middlewares
            for (const middleware of this.middlewares) {
                await middleware({
                    route,
                    params,
                    query: this.query
                }, this);
            }

            // Check guards
            const canActivate = await this.checkGuards(route);
            if (!canActivate) return;

            await this.transitionTo(route, params);

        } catch (error) {
            this.handleError(error);
        }
    }

    async transitionTo(route, params) {
        // Cleanup previous component
        if (this.currentComponent) {
            await this.teardownComponent(this.currentComponent);
        }

        this.currentRoute = route;
        this.params = params;

        // Show loading
        this.showLoading();

        try {
            const Component = await this.resolveComponent(route.component);
            const context = this.createContext(route, params);

            this.currentComponent = new Component();
            await this.setupComponent(this.currentComponent, context);

            this.updateDocumentMeta(route, params);
            this.hideLoading();

        } catch (error) {
            this.hideLoading();
            throw error;
        }
    }

    createContext(route, params) {
        return {
            params,
            query: this.query,
            route,
            router: this,
            state: this.stateManager,
            auth: this.authService
        };
    }

    async resolveComponent(component) {
        if (typeof component === 'function') {
            return await component();
        }
        return component;
    }

    async setupComponent(component, context) {
        if (component.beforeEnter) {
            await component.beforeEnter(context);
        }

        const container = this.getContainer();
        if (component.mount) {
            await component.mount(container, context);
        } else if (component.render) {
            container.innerHTML = component.render(context);
        }

        if (component.afterEnter) {
            await component.afterEnter(context);
        }
    }

    async teardownComponent(component) {
        if (component.beforeLeave) {
            await component.beforeLeave();
        }

        if (component.unmount) {
            await component.unmount();
        }

        if (component.afterLeave) {
            await component.afterLeave();
        }
    }

    matchRoute(pathname) {
        for (const [routePath, route] of this.routes) {
            const {
                matches,
                params
            } = this.testRoute(routePath, pathname);
            if (matches) {
                return {
                    route,
                    params
                };
            }
        }
        return {
            route: null,
            params: {}
        };
    }

    testRoute(routePath, pathname) {
        const paramNames = [];
        const regexPath = routePath.replace(/:(\w+)/g, (_, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });

        const regex = new RegExp(`^${regexPath}$`);
        const match = pathname.match(regex);

        if (!match) return {
            matches: false,
            params: {}
        };

        const params = {};
        paramNames.forEach((name, index) => {
            params[name] = match[index + 1];
        });

        return {
            matches: true,
            params
        };
    }

    async checkGuards(route) {
        for (const guard of route.guards) {
            const result = await guard({
                to: route,
                from: this.currentRoute,
                router: this
            });

            if (result === false || typeof result === 'string') {
                this.navigate(typeof result === 'string' ? result : '/');
                return false;
            }
        }
        return true;
    }

    // Event handlers
    handleLinkClick(event) {
        const link = event.target.closest(this.options.linkSelector);
        if (!link) return;

        event.preventDefault();
        const href = link.getAttribute('href');
        this.navigate(href);
    }

    handleFormSubmit(event) {
        const form = event.target.closest(this.options.formSelector);
        if (!form) return;

        event.preventDefault();
        this.handleSlyForm(form);
    }

    async handleSlyForm(form) {
        const formData = new FormData(form);
        const action = form.getAttribute('action');
        const method = form.getAttribute('method') || 'POST';

        try {
            const response = await fetch(action, {
                method,
                body: formData
            });
            const result = await response.json();

            if (this.currentComponent && this.currentComponent.handleFormResponse) {
                this.currentComponent.handleFormResponse(result, form);
            }

            if (result.redirect) {
                this.navigate(result.redirect);
            }

        } catch (error) {
            if (this.currentComponent && this.currentComponent.handleFormError) {
                this.currentComponent.handleFormError(error, form);
            }
        }
    }

    // Utility methods
    getContainer() {
        return document.querySelector(this.options.container) || document.body;
    }

    showLoading() {
        const container = this.getContainer();
        if (this.options.loadingTemplate) {
            container.innerHTML = this.options.loadingTemplate;
        }
    }

    hideLoading() {
        // Could be implemented for loading state cleanup
    }

    updateDocumentMeta(route, params) {
        if (route.title) {
            document.title = typeof route.title === 'function' ?
                route.title(params, this.query) :
                route.title;
        }

        // Update meta tags
        if (route.meta) {
            Object.entries(route.meta).forEach(([name, content]) => {
                DOM.updateMetaTag(name, content);
            });
        }
    }

    handleError(error) {
        console.error('SlyRouter Error:', error);

        const container = this.getContainer();
        if (this.options.errorTemplate) {
            container.innerHTML = this.options.errorTemplate;
        } else {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <h2>Application Error</h2>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()">Reload</button>
                </div>
            `;
        }
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }
}