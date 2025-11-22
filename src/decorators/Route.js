// src/decorators/Route.js
export default function Route(path, options = {}) {
    return function (target) {
        target.path = path;
        target.options = options;
        return target;
    };
}
