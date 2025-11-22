// src/utils/dom.js
const DOM = {
    updateMetaTag(name, content) {
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
    },

    createElement(tag, attributes = {}, children = '') {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([key, value]) => {
            if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });

        if (typeof children === 'string') {
            element.innerHTML = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => element.appendChild(child));
        } else if (children) {
            element.appendChild(children);
        }

        return element;
    },

    removeElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.remove();
        }
    }
};

export default DOM;