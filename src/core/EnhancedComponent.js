// src/core/EnhancedComponent.js
import DOM from "#util/dom";
import EventManager from "#util/events";

export default class EnhancedComponent {
    constructor() {
        this.state = {};
        this.element = null;
        this.context = null;
        this.eventManager = new EventManager();
        this.stateSubscriptions = new Map();
    }

    // Lifecycle hooks
    async beforeEnter(context) { }
    async afterEnter(context) { }
    async beforeLeave() { }
    async afterLeave() { }

    async mount(container, context) {
        this.element = container;
        this.context = context;
        await this.beforeMount();
        this.update();
        await this.afterMount();
    }

    async unmount() {
        await this.beforeUnmount();
        this.eventManager.unbindAll();
        this.unsubscribeAll();
        await this.afterUnmount();
    }

    async beforeMount() { }
    async afterMount() { }
    async beforeUnmount() { }
    async afterUnmount() { }

    // State management
    setState(newState) {
        this.state = {
            ...this.state,
            ...newState
        };
        this.update();
    }

    // Event handling
    bindEvents() {
        if (!this.element) return;

        // Auto-bind events from data-sly-on attributes
        const elements = this.element.querySelectorAll('[data-sly-on]');
        elements.forEach(element => {
            const eventsConfig = element.getAttribute('data-sly-on');
            const handlers = eventsConfig.split(';').map(h => h.trim());

            handlers.forEach(handler => {
                const [event, method] = handler.split(':');
                if (this[method]) {
                    this.eventManager.bind(element, event, (e) => this[method](e, element));
                }
            });
        });
    }

    // State subscriptions
    subscribeToState(key, callback) {
        if (this.context?.state) {
            const unsubscribe = this.context.state.subscribe(key, callback);
            this.stateSubscriptions.set(key, unsubscribe);
        }
    }

    unsubscribeFromState(key) {
        const unsubscribe = this.stateSubscriptions.get(key);
        if (unsubscribe) {
            unsubscribe();
            this.stateSubscriptions.delete(key);
        }
    }

    unsubscribeAll() {
        this.stateSubscriptions.forEach(unsubscribe => unsubscribe());
        this.stateSubscriptions.clear();
    }

    // Navigation helpers
    navigate(path, options = {}) {
        this.context?.router?.navigate(path, options);
    }

    // Utility methods
    $(selector) {
        return this.element?.querySelector(selector);
    }

    $$(selector) {
        return this.element?.querySelectorAll(selector) || [];
    }

    update() {
        if (this.element && this.render) {
            this.eventManager.unbindAll();
            this.element.innerHTML = this.render(this.context);
            this.bindEvents();
        }
    }

    // Form handling
    async handleFormResponse(result, form) {
        // Override in components
    }

    async handleFormError(error, form) {
        // Override in components
        console.error('Form error:', error);
    }

    // Template helpers
    createElement(tag, attributes = {}, children = '') {
        return DOM.createElement(tag, attributes, children);
    }

    // Cleanup
    destroy() {
        this.unmount();
    }
}