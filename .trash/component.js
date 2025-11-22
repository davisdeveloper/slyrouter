// src/core/EnhancedComponent.js
export default class EnhancedComponent {
    constructor(props = {}) {
        this.props = props;
        this.state = {};
        this.element = null;
        this.eventHandlers = new Map();
    }

    // Lifecycle methods
    componentDidMount() { }
    componentWillUnmount() { }
    onEnter(params) { }
    onLeave() { }

    // State management
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.update();
    }

    // Rendering
    render() {
        return '';
    }

    // Mounting and event handling
    mount(container) {
        this.element = container;
        this.update();
        this.componentDidMount();
        this.bindEvents();
    }

    update() {
        if (this.element) {
            this.unbindEvents();
            this.element.setHTMLUnsafe(this.render()); //to render ionicons
            this.bindEvents();
        }
    }
    // In EnhancedComponent base class - updated bindEvents method
    bindEvents() {
        if (!this.element) return;

        const elements = this.element.querySelectorAll('[data-on]');
        elements.forEach(element => {
            const eventHandlers = element.getAttribute('data-on');

            // Split by semicolon for multiple events
            const handlers = eventHandlers.split(';').map(h => h.trim());

            handlers.forEach(handler => {
                const [event, method] = handler.split(':');

                if (this[method] && typeof this[method] === 'function') {
                    const eventHandler = (e) => this[method](e, element);
                    element.addEventListener(event, eventHandler);

                    // Store for cleanup
                    if (!this.eventHandlers.has(element)) {
                        this.eventHandlers.set(element, []);
                    }
                    this.eventHandlers.get(element).push({ event, handler: eventHandler });
                }
            });
        });
    }

    unbindEvents() {
        this.eventHandlers.forEach(({ event, handler }, element) => {
            element.removeEventListener(event, handler);
        });
        this.eventHandlers.clear();
    }

    // Utility methods
    querySelector(selector) {
        return this.element?.querySelector(selector);
    }

    querySelectorAll(selector) {
        return this.element?.querySelectorAll(selector) || [];
    }

    // Cleanup
    destroy() {
        this.unbindEvents();
        this.componentWillUnmount();
    }
}