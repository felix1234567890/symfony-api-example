// Authentication provider for React Admin
import { fetchUtils } from 'react-admin';

// Get the base URL from the current window location
const getBaseUrl = () => {
    try {
        const url = window.location.href;
        const baseUrl = url.substring(0, url.indexOf('/', 8));
        return baseUrl;
    } catch (error) {
        console.error('Error getting base URL:', error);
        // Fallback to relative URL if we can't get the base URL
        return '';
    }
};

// Construct API URL with base URL
const getApiUrl = () => {
    const baseUrl = getBaseUrl();
    return baseUrl ? `${baseUrl}/api` : '/api';
};

export const authProvider = {
    // Called when the user attempts to log in
    login: ({ username, password }) => {
        const apiUrl = getApiUrl();
        const loginUrl = `${apiUrl}/login`;
        
        console.log('Login attempt to:', loginUrl);
        
        const request = new Request(loginUrl, {
            method: 'POST',
            body: JSON.stringify({ email: username, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
            credentials: 'include',
        });
        
        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(({ token }) => {
                // Store the token in localStorage
                localStorage.setItem('token', token);
                // Return resolved promise to indicate success
                return Promise.resolve();
            })
            .catch(error => {
                console.error('Login error:', error);
                return Promise.reject(error);
            });
    },
    
    // Called when the user clicks on the logout button
    logout: () => {
        localStorage.removeItem('token');
        return Promise.resolve();
    },
    
    // Called when the API returns an error
    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            return Promise.reject();
        }
        return Promise.resolve();
    },
    
    // Called when the user navigates to a new location, to check for authentication
    checkAuth: () => {
        return localStorage.getItem('token')
            ? Promise.resolve()
            : Promise.reject();
    },
    
    // Called when the user navigates to a new location, to check for permissions / roles
    getPermissions: () => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            return Promise.reject();
        }
        
        // Parse the JWT token to get user roles
        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const roles = tokenData.roles || [];
            return Promise.resolve(roles);
        } catch (error) {
            console.error('Error parsing JWT token:', error);
            return Promise.resolve([]);
        }
    },
};

// Export a function to get the auth header for use in other parts of the app
export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};
