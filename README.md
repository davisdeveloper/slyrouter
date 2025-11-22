# SlyRouter 🚀

An expressJS-inspired lightweight, powerful client-side router for modern web applications. Works everywhere - ESM, CommonJS, and browsers (including wapka, wapkiz, xtgem)!

## Installation

```bash
npm install slyrouter
```

## Quick Start

### ESM (Modern Bundlers)

```javascript
// Main Router (Express-style)
import SlyRouter from 'slyrouter';
const router = new SlyRouter();

// Core components
import { EnhancedComponent, StateManager } from 'slyrouter/core';

// Plugins
import { SEOPlugin } from 'slyrouter/plugins';

// Utilities
import { DOM, parseQueryString } from 'slyrouter/utils';
```

### CommonJS (Node.js)

```javascript
// Main Router (Express-style)
const SlyRouter = require('slyrouter');
const router = new SlyRouter();

// Core components
const { EnhancedComponent, StateManager } = require('slyrouter/core');

// Plugins  
const { SEOPlugin } = require('slyrouter/plugins');

// Utilities
const { DOM, parseQueryString } = require('slyrouter/utils');
```

### UMD (Browser - Script Tag)

```html
<script src="https://unpkg.com/slyrouter"></script>
<script>
  // Main Router (Express-style)
  const router = new SlyRouter();
  
  // Core components are available on the main object
  const { EnhancedComponent, StateManager } = SlyRouter;
</script>
```

## Architecture

SlyRouter follows an Express.js-inspired architecture:

- **Main Export**: `import SlyRouter from 'slyrouter'` - The main Router class
- **Core Components**: `import { EnhancedComponent } from 'slyrouter/core'` - Building blocks
- **Plugins**: `import { SEOPlugin } from 'slyrouter/plugins'` - Extended functionality  
- **Utilities**: `import { DOM } from 'slyrouter/utils'` - Helper functions

This modular approach allows for optimal tree-shaking and lets you import only what you need.

## Core Concepts

### 🛣️ Router

The main router class that handles navigation and route management.

#### Constructor

```javascript
const router = new SlyRouter(options);
```

**Options:**

- `root` (string): Base path for all routes (default: `'/'`)
- `mode` (string): `'history'` or `'hash'` (default: `'history'`)
- `linkSelector` (string): Selector for links to handle (default: `'[data-sly-link]'`)
- `formSelector` (string): Selector for forms to handle (default: `'[data-sly-form]'`)
- `container` (string): DOM element to render components (default: `'#app'`)
- `loadingTemplate` (string): HTML to show during loading
- `errorTemplate` (string): HTML to show on errors
- `state` (object): StateManager options
- `auth` (object): AuthService options

**Examples:**

```javascript
// ESM
import SlyRouter from 'slyrouter';
const router = new SlyRouter({ container: '#app' });

// CommonJS  
const SlyRouter = require('slyrouter');
const router = new SlyRouter({ container: '#app' });

// UMD (browser)
const router = new SlyRouter({ container: '#app' });
```

#### Methods

##### `addRoute(path, component, options)`

Add a route to the router.

```javascript
router.addRoute('/user/:id', UserComponent, {
  name: 'user-profile',
  title: 'User Profile',
  meta: { requiresAuth: true },
  guards: [authGuard]
});
```

**Parameters:**

- `path` (string): Route path with optional parameters (`/user/:id`)
- `component` (Class): Component class to render
- `options` (object): Route configuration

**Route Options:**

- `name` (string): Route name for programmatic navigation
- `title` (string|function): Page title or function that returns title
- `meta` (object): Route metadata for guards and SEO
- `guards` (array): Array of guard functions

##### `navigate(path, options)`

Navigate to a route.

```javascript
// Basic navigation
router.navigate('/about');

// With query parameters
router.navigate('/search', { query: { q: 'javascript' } });

// Replace current history entry
router.navigate('/login', { replace: true });
```

**Options:**

- `query` (object): Query parameters to include
- `replace` (boolean): Replace history entry instead of pushing

##### `back()`, `forward()`, `go(delta)`

Browser history navigation.

```javascript
router.back();    // Go back
router.forward(); // Go forward  
router.go(-2);    // Go back 2 pages
```

##### `addMiddleware(middleware)`

Add global middleware.

```javascript
router.addMiddleware(async (context, router) => {
  console.log('Navigating to:', context.route.path);
});
```

##### `use(plugin, options)`

Use a plugin.

```javascript
router.use(AnalyticsPlugin, { trackingId: 'UA-XXXXX' });
```

##### `getCurrentRoute()`, `getParams()`, `getQuery()`

Get current route information.

```javascript
const currentRoute = router.getCurrentRoute();
const params = router.getParams(); // Route parameters
const query = router.getQuery();   // URL query parameters
```

### 🧩 EnhancedComponent

Base class for creating components with lifecycle methods and state management.

#### Basic Component

```javascript
// ESM
import { EnhancedComponent } from 'slyrouter/core';

class HomePage extends EnhancedComponent {
  constructor() {
    super();
    this.state = { count: 0 };
  }
  
  render() {
    return `
      <div>
        <h1>Count: ${this.state.count}</h1>
        <button data-sly-on="click:incrementCount">Increment</button>
      </div>
    `;
  }
  
  incrementCount() {
    this.setState({ count: this.state.count + 1 });
  }
}

// CommonJS
const { EnhancedComponent } = require('slyrouter/core');
class HomePage extends EnhancedComponent { /* ... */ }

// UMD - Note: In UMD, core components are on main object
class HomePage extends SlyRouter.EnhancedComponent { /* ... */ }
```

#### Lifecycle Methods

##### `beforeEnter(context)`

Called before component enters.

```javascript
async beforeEnter(context) {
  console.log('Entering route with params:', context.params);
  await this.loadData(context.params.id);
}
```

##### `afterEnter(context)`  

Called after component enters.

```javascript
afterEnter(context) {
  this.setupAnalytics();
}
```

##### `beforeLeave()`

Called before component leaves.

```javascript
beforeLeave() {
  this.cleanupEvents();
}
```

##### `afterLeave()`

Called after component leaves.

```javascript
afterLeave() {
  console.log('Component left');
}
```

##### `mount(container, context)`

Called when component mounts to DOM.

```javascript
async mount(container, context) {
  await this.beforeMount();
  this.element = container;
  this.update();
  await this.afterMount();
}
```

##### `unmount()`

Called when component unmounts from DOM.

```javascript
async unmount() {
  await this.beforeUnmount();
  this.eventManager.unbindAll();
  await this.afterUnmount();
}
```

#### State Management

##### `setState(newState)`

Update component state and re-render.

```javascript
this.setState({ count: 42, message: 'Hello' });
```

##### `subscribeToState(key, callback)`

Subscribe to global state changes.

```javascript
this.subscribeToState('user', (user) => {
  this.setState({ currentUser: user });
});
```

#### Event Handling

Use `data-sly-on` attributes for automatic event binding:

```javascript
render() {
  return `
    <button data-sly-on="click:handleClick; mouseenter:handleHover">
      Interactive Button
    </button>
  `;
}

handleClick(event, element) {
  console.log('Button clicked!');
}

handleHover(event, element) {
  element.style.backgroundColor = 'yellow';
}
```

#### Navigation

##### `navigate(path, options)`

Navigate from within component.

```javascript
this.navigate('/dashboard');
this.navigate('/search', { query: { q: 'test' } });
```

#### Utility Methods

##### `$(selector)` and `$$(selector)`

DOM query helpers.

```javascript
const button = this.$('button.submit');
const allInputs = this.$$('input[type="text"]');
```

##### `createElement(tag, attributes, children)`

Create DOM elements.

```javascript
const div = this.createElement('div', { class: 'card' }, 'Hello World');
```

### 🗂️ StateManager

Global state management with persistence.

#### Usage

```javascript
// ESM
import { StateManager } from 'slyrouter/core';

// CommonJS
const { StateManager } = require('slyrouter/core');

// UMD
const stateManager = new SlyRouter.StateManager();
```

#### Methods

##### `set(key, value, persist)`

Set state value.

```javascript
stateManager.set('user', userData, true); // persist to localStorage
stateManager.set('theme', 'dark');        // volatile
```

##### `get(key)`

Get state value.

```javascript
const user = stateManager.get('user');
```

##### `subscribe(key, callback)`

Subscribe to state changes.

```javascript
const unsubscribe = stateManager.subscribe('user', (user) => {
  console.log('User changed:', user);
});

// Later...
unsubscribe(); // Stop listening
```

##### `clear()`

Clear all state.

```javascript
stateManager.clear();
```

### 🔐 AuthService

Authentication service with token management.

#### Usage

```javascript
// ESM
import { AuthService } from 'slyrouter/core';

// CommonJS  
const { AuthService } = require('slyrouter/core');

// UMD
const authService = new SlyRouter.AuthService();
```

#### Methods

##### `login(credentials)`

Authenticate user.

```javascript
try {
  const user = await authService.login({
    email: 'user@example.com',
    password: 'password'
  });
  console.log('Logged in:', user);
} catch (error) {
  console.error('Login failed:', error);
}
```

##### `logout()`

Logout user.

```javascript
await authService.logout();
```

##### `isAuthenticated()`

Check if user is authenticated.

```javascript
const authenticated = await authService.isAuthenticated();
if (authenticated) {
  // User is logged in
}
```

##### `hasRole(role)`

Check if user has specific role.

```javascript
const isAdmin = await authService.hasRole('admin');
```

##### `getUser()`, `getToken()`

Get current user and token.

```javascript
const user = authService.getUser();
const token = authService.getToken();
```

### 🛠️ Utilities

#### `parseQueryString(queryString)`

Parse URL query string.

```javascript
import { parseQueryString } from 'slyrouter/utils';

const query = parseQueryString('?search=test&page=1');
// { search: 'test', page: '1' }
```

#### `buildURL(path, queryParams)`

Build URL with query parameters.

```javascript
import { buildURL } from 'slyrouter/utils';

const url = buildURL('/search', { q: 'test', page: 2 });
// '/search?q=test&page=2'
```

#### `debounce(fn, delay)` and `throttle(fn, delay)`

Rate limiting functions.

```javascript
import { debounce } from 'slyrouter/utils';

const search = debounce((query) => {
  // API call
}, 300);
```

#### `DOM` Utilities

DOM manipulation helpers.

```javascript
import { DOM } from 'slyrouter/utils';

DOM.updateMetaTag('description', 'Page description');
const element = DOM.createElement('div', { class: 'card' }, 'Content');
```

#### `EventManager`

Event management with automatic cleanup.

```javascript
import { EventManager } from 'slyrouter/utils';

const events = new EventManager();
events.bind(button, 'click', () => console.log('clicked'));
events.unbindAll(); // Cleanup
```

## Complete Examples

### ESM Example

```javascript
import SlyRouter from 'slyrouter';
import { EnhancedComponent } from 'slyrouter/core';

class App extends EnhancedComponent {
  constructor() {
    super();
    this.state = { user: null };
  }
  
  async beforeEnter(context) {
    this.subscribeToState('user', (user) => {
      this.setState({ user });
    });
  }
  
  render() {
    return `
      <nav>
        <a href="/" data-sly-link>Home</a>
        <a href="/about" data-sly-link>About</a>
        ${this.state.user ? `
          <a href="/dashboard" data-sly-link>Dashboard</a>
        ` : ''}
      </nav>
      <div id="app-content"></div>
    `;
  }
}

const router = new SlyRouter({ container: '#app-content' });

router.addRoute('/', HomeComponent, { title: 'Home' });
router.addRoute('/about', AboutComponent, { title: 'About' });
router.addRoute('/dashboard', DashboardComponent, { 
  meta: { requiresAuth: true },
  guards: [authGuard]
});

// Start the app
router.navigate('/');
```

### CommonJS Example

```javascript
const SlyRouter = require('slyrouter');
const { EnhancedComponent } = require('slyrouter/core');

class HomeComponent extends EnhancedComponent {
  render() {
    return '<h1>Welcome Home!</h1>';
  }
}

const router = new SlyRouter();
router.addRoute('/', HomeComponent);
router.navigate('/');
```

### UMD Browser Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>SlyRouter Example</title>
</head>
<body>
  <div id="app"></div>
  
  <script src="https://unpkg.com/slyrouter"></script>
  <script>
    // Main Router (Express-style)
    const router = new SlyRouter({ container: '#app' });
    
    // Core components are available on SlyRouter object
    class HomePage extends SlyRouter.EnhancedComponent {
      render() {
        return '<h1>Hello from SlyRouter!</h1>';
      }
    }
    
    router.addRoute('/', HomePage);
    router.navigate('/');
  </script>
</body>
</html>
```

## Route Guards

Create route guards for authentication and authorization:

```javascript
// Authentication guard
const authGuard = async ({ to, from, router }) => {
  const isAuthenticated = await router.authService.isAuthenticated();
  if (!isAuthenticated) {
    return '/login'; // Redirect to login
  }
  return true; // Allow navigation
};

// Role-based guard  
const adminGuard = async ({ to, from, router }) => {
  const isAdmin = await router.authService.hasRole('admin');
  if (!isAdmin) {
    return '/unauthorized';
  }
  return true;
};

// Usage
router.addRoute('/admin', AdminComponent, {
  guards: [authGuard, adminGuard]
});
```

## Form Handling

Handle forms without page reloads:

```html
<form data-sly-form action="/api/contact" method="POST">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <button type="submit">Send</button>
</form>
```

In your component:

```javascript
async handleFormResponse(result, form) {
  if (result.success) {
    this.showSuccess('Message sent!');
    form.reset();
  } else {
    this.showError('Failed to send message');
  }
}

async handleFormError(error, form) {
  this.showError('Network error: ' + error.message);
}
```

## Advanced Features

### Middleware System

Add global middleware for cross-cutting concerns:

```javascript
// Logging middleware
router.addMiddleware(async (context, router) => {
  console.log(`Route change: ${context.from?.path} -> ${context.to.path}`);
});

// Authentication middleware
router.addMiddleware(async (context, router) => {
  if (context.to.meta?.requiresAuth) {
    const authenticated = await router.authService.isAuthenticated();
    if (!authenticated) {
      router.navigate('/login');
      return false; // Stop navigation
    }
  }
});
```

### Plugin System

Extend SlyRouter with plugins:

```javascript
// Using built-in plugins
import { SEOPlugin, AnalyticsPlugin } from 'slyrouter/plugins';

router.use(SEOPlugin, {
  defaultTitle: 'My App',
  defaultDescription: 'A modern web application'
});

router.use(AnalyticsPlugin, {
  trackingId: 'UA-XXXXX-Y'
});

// Creating custom plugins
function MyPlugin(router, options) {
  router.addMiddleware(async (context) => {
    // Plugin logic here
  });
}

router.use(MyPlugin, { customOption: true });
```

### State Persistence

Persist state across page reloads:

```javascript
import { StateManager } from 'slyrouter/core';

const stateManager = new StateManager({
  persistenceKey: 'myapp_state',
  persistKeys: ['user', 'settings', 'theme'] // Only these keys persist
});

// This will be saved to localStorage
stateManager.set('user', userData, true);

// This will not persist
stateManager.set('temporaryData', data);
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills)
- Node.js 14+
- Mobile browsers
- Legacy platforms (wapka, wapkiz, xtgem)

## Migration Guide

### From v0.0.0 to v0.0.1

**Before:**

```javascript
import { Router } from 'slyrouter';
```

**After:**

```javascript
import SlyRouter from 'slyrouter';
// or
import { Router } from 'slyrouter/core';
```

## API Reference

### Router Class

- `new SlyRouter(options)`
- `addRoute(path, component, options)`
- `navigate(path, options)`
- `back()`, `forward()`, `go(delta)`
- `addMiddleware(middleware)`
- `use(plugin, options)`
- `getCurrentRoute()`, `getParams()`, `getQuery()`

### EnhancedComponent Class

- Lifecycle: `beforeEnter`, `afterEnter`, `beforeLeave`, `afterLeave`
- State: `setState`, `subscribeToState`
- Navigation: `navigate`
- Utilities: `$`, `$$`, `createElement`

### StateManager Class

- `set(key, value, persist)`
- `get(key)`
- `subscribe(key, callback)`
- `clear()`

### AuthService Class

- `login(credentials)`
- `logout()`
- `isAuthenticated()`
- `hasRole(role)`
- `getUser()`, `getToken()`

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/davisdeveloper/slyrouter/CONTRIBUTING.md) for details.

## License

MIT © Quabynah Davis
