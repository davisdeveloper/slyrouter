// src/decorators/Component.js
export default function Component(options = {}) {
    return function (target) {
        target.componentOptions = options;
        return target;
    };
}
