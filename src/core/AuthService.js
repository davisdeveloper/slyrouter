// src/core/AuthService.js
export default class AuthService {
    constructor(options = {}) {
        this.options = {
            tokenKey: 'slyrouter_token',
            userKey: 'slyrouter_user',
            ...options
        };
    }

    async login(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            this.setToken(data.token);
            this.setUser(data.user);

            return data;
        } catch (error) {
            throw new Error('Login failed: ' + error.message);
        }
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            this.clearAuth();
        }
    }

    setToken(token) {
        localStorage.setItem(this.options.tokenKey, token);
    }

    getToken() {
        return localStorage.getItem(this.options.tokenKey);
    }

    setUser(user) {
        localStorage.setItem(this.options.userKey, JSON.stringify(user));
    }

    getUser() {
        try {
            const user = localStorage.getItem(this.options.userKey);
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    }

    clearAuth() {
        localStorage.removeItem(this.options.tokenKey);
        localStorage.removeItem(this.options.userKey);
    }

    async isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        // Optional: Validate token with server
        try {
            const response = await fetch('/api/auth/validate', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch {
            // If server validation fails, check token expiration locally
            return this.isTokenValid(token);
        }
    }

    isTokenValid(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    async hasRole(requiredRole) {
        const user = this.getUser();
        return user && user.roles && user.roles.includes(requiredRole);
    }

    async refreshToken() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.setToken(data.token);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        return false;
    }
}