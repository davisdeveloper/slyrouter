/**
 * @typedef {Object} Options
 * @property {String[]} persistKeys
 */

export default class StateManager {
    /** @param {Options} options */
    constructor(options = {}) {
        this.options = {
            persistenceKey: "slyrouter_state",
            ...options
        };
        this.state = {};
        /** @type {Map<String, Set>} */
        this.listeners = new Map();
        this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.options.persistenceKey);
            if (stored) Object.entries(JSON.parse(stored)).forEach(
                /**@param {[key: unknown, value: unknown]} */
                ([key, value]) => {
                    this.state[key] = value;
                });
        } catch (error) {
            console.warn("Failed to load from storage", error);
        }
    }
    saveToStorage() {
        try {
            const persistableState = {};
            Object.entries(this.state).forEach(
                /** @param {[key: any, value:any]} param0*/
                function ([key, value]) {
                    if (this.shouldPersist(key)) persistableState[key] = value
                });
        } catch (error) {
            console.warn("Failed to save state to storage", error)
        }
    }

    notify(key, value) {
        if (this.listeners.has(key)) this.listeners.get(key).forEach(
            /** @param {Function} callback*/
            function (callback) {
                callback(value, key)
            });
    }

    set(key, value, persist = false) {
        this.state[key] = value;
        this.notify(key, value);
        if (persist) {
            this.saveToStorage();
        }
    }
    get(key) {
        return this.state[key];
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) this.listeners.set(key, new Set());
        this.listeners.get(key).add(callback);
        return () => this.listeners.get(key).delete(callback);
    }

    /**
     *  Checks if the key given should persist
     * @param {string} key 
     * @returns boolean
     */
    shouldPersist(key) {
        const persistKeys = this.options.persistKeys || ["user", "settings", "theme"];
        return persistKeys.includes(key);
    }

    clear() {
        this.state = {};
        this.listeners.clear();
        localStorage.removeItem(this.options.persistKeys);
    }

}