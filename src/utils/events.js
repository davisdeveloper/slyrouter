// src/utils/events.js
export default class EventManager {
    constructor() {
        this.handlers = new Map();
    }

    bind(element, event, handler) {
        if (!this.handlers.has(element)) {
            this.handlers.set(element, new Map());
        }

        const elementHandlers = this.handlers.get(element);
        if (!elementHandlers.has(event)) {
            elementHandlers.set(event, new Set());
        }

        elementHandlers.get(event).add(handler);
        element.addEventListener(event, handler);
    }

    unbind(element, event, handler) {
        const elementHandlers = this.handlers.get(element);
        if (!elementHandlers) return;

        const eventHandlers = elementHandlers.get(event);
        if (!eventHandlers) return;

        eventHandlers.delete(handler);
        element.removeEventListener(event, handler);

        if (eventHandlers.size === 0) {
            elementHandlers.delete(event);
        }
        if (elementHandlers.size === 0) {
            this.handlers.delete(element);
        }
    }

    unbindAll() {
        this.handlers.forEach((elementHandlers, element) => {
            elementHandlers.forEach((eventHandlers, event) => {
                eventHandlers.forEach(handler => {
                    element.removeEventListener(event, handler);
                });
            });
        });
        this.handlers.clear();
    }
}