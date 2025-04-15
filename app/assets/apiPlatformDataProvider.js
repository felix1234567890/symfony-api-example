import { fetchUtils } from 'react-admin';
import { getAuthHeader } from './authProvider';

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

// Custom HTTP client with proper headers
const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/ld+json' });
    }

    // Add authorization header with JWT token
    const authHeader = getAuthHeader();
    Object.keys(authHeader).forEach(key => {
        options.headers.set(key, authHeader[key]);
    });

    options.credentials = 'include';

    // Log the request for debugging
    console.log('API Request:', url, options);

    return fetchUtils.fetchJson(url, options)
        .then(response => {
            console.log('API Response:', response);
            return response;
        })
        .catch(error => {
            console.error('API Error:', error);
            throw error;
        });
};

// Helper function to extract ID from IRI
const extractIdFromIri = (iri) => {
    if (!iri) return null;
    const parts = iri.split('/');
    return parts[parts.length - 1];
};

// Helper function to normalize data from API Platform
const normalizeData = (data) => {
    if (!data) return null;

    // If it's an array, normalize each item
    if (Array.isArray(data)) {
        return data.map(item => normalizeData(item));
    }

    // If it's an object, extract ID from @id if needed
    if (typeof data === 'object') {
        const normalized = { ...data };

        // Use ID from @id if no explicit id exists
        if (!normalized.id && normalized['@id']) {
            normalized.id = extractIdFromIri(normalized['@id']);
        }

        // Recursively normalize nested objects
        Object.keys(normalized).forEach(key => {
            if (typeof normalized[key] === 'object' && normalized[key] !== null) {
                normalized[key] = normalizeData(normalized[key]);
            }
        });

        return normalized;
    }

    return data;
};

// Helper function to safely create a URL
const createUrl = (resource, queryParams = {}) => {
    const apiUrl = getApiUrl();
    const apiResource = resource.toLowerCase();
    const fullUrl = `${apiUrl}/${apiResource}`;

    // Try to use URL constructor
    try {
        const url = new URL(fullUrl, window.location.origin);

        // Add query parameters
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });

        return url.toString();
    } catch (error) {
        console.error('Error creating URL:', error);

        // Fallback to manual string construction
        let queryString = '';
        if (Object.keys(queryParams).length > 0) {
            queryString = '?' + Object.entries(queryParams)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
        }

        return fullUrl + queryString;
    }
};

export const dataProvider = {
    getList: (resource, params) => {
        try {
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;

            // Build query parameters
            const queryParams = {
                page,
                itemsPerPage: perPage
            };

            // Add sorting
            if (field) {
                queryParams[`order[${field}]`] = order.toLowerCase();
            }

            // Add filters
            if (params.filter) {
                Object.entries(params.filter).forEach(([key, value]) => {
                    queryParams[key] = value;
                });
            }

            // Create URL
            const url = createUrl(resource, queryParams);
            console.log('getList URL:', url);

            return httpClient(url)
                .then(({ json }) => {
                    if (!json['hydra:member']) {
                        return {
                            data: normalizeData(json),
                            total: json.length || 0,
                        };
                    }

                    return {
                        data: normalizeData(json['hydra:member']),
                        total: json['hydra:totalItems'] || 0,
                    };
                })
                .catch(error => {
                    console.error('Error in getList:', error);
                    throw error;
                });
        } catch (error) {
            console.error('Error in getList:', error);
            throw error;
        }
    },

    getOne: (resource, params) => {
        try {
            const apiUrl = getApiUrl();
            const apiResource = resource.toLowerCase();
            const url = `${apiUrl}/${apiResource}/${params.id}`;

            console.log('getOne URL:', url);

            return httpClient(url)
                .then(({ json }) => ({
                    data: normalizeData(json),
                }))
                .catch(error => {
                    console.error('Error in getOne:', error);
                    throw error;
                });
        } catch (error) {
            console.error('Error in getOne:', error);
            throw error;
        }
    },

    getMany: (resource, params) => {
        try {
            const apiUrl = getApiUrl();
            const apiResource = resource.toLowerCase();

            console.log('getMany IDs:', params.ids);

            // API Platform doesn't support getting multiple resources in one call
            // So we make multiple calls and combine the results
            const promises = params.ids.map(id => {
                const url = `${apiUrl}/${apiResource}/${id}`;
                console.log('getMany URL:', url);

                return httpClient(url)
                    .then(({ json }) => normalizeData(json))
                    .catch(error => {
                        console.error(`Error fetching ${resource} with id ${id}:`, error);
                        return null; // If one fails, continue with others
                    });
            });

            return Promise.all(promises)
                .then(results => ({
                    data: results.filter(result => result !== null),
                }))
                .catch(error => {
                    console.error('Error in getMany:', error);
                    throw error;
                });
        } catch (error) {
            console.error('Error in getMany:', error);
            throw error;
        }
    },

    getManyReference: (resource, params) => {
        try {
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;

            // Build query parameters
            const queryParams = {
                page,
                itemsPerPage: perPage,
                [params.target]: params.id
            };

            // Add sorting
            if (field) {
                queryParams[`order[${field}]`] = order.toLowerCase();
            }

            // Add filters
            if (params.filter) {
                Object.entries(params.filter).forEach(([key, value]) => {
                    queryParams[key] = value;
                });
            }

            // Create URL
            const url = createUrl(resource, queryParams);
            console.log('getManyReference URL:', url);

            return httpClient(url)
                .then(({ json }) => {
                    if (!json['hydra:member']) {
                        return {
                            data: normalizeData(json),
                            total: json.length || 0,
                        };
                    }

                    return {
                        data: normalizeData(json['hydra:member']),
                        total: json['hydra:totalItems'] || 0,
                    };
                })
                .catch(error => {
                    console.error('Error in getManyReference:', error);
                    throw error;
                });
        } catch (error) {
            console.error('Error in getManyReference:', error);
            throw error;
        }
    },

    update: (resource, params) => {
        try {
            const apiUrl = getApiUrl();
            const apiResource = resource.toLowerCase();
            const url = `${apiUrl}/${apiResource}/${params.id}`;

            console.log('update URL:', url, 'data:', params.data);

            return httpClient(url, {
                method: 'PUT',
                body: JSON.stringify(params.data),
            })
                .then(({ json }) => ({
                    data: normalizeData(json),
                }))
                .catch(error => {
                    console.error('Error in update:', error);
                    throw error;
                });
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    },

    updateMany: (resource, params) => {
        try {
            const apiUrl = getApiUrl();
            const apiResource = resource.toLowerCase();

            console.log('updateMany IDs:', params.ids, 'data:', params.data);

            const promises = params.ids.map(id => {
                const url = `${apiUrl}/${apiResource}/${id}`;
                console.log('updateMany URL:', url);

                return httpClient(url, {
                    method: 'PUT',
                    body: JSON.stringify(params.data),
                })
                    .then(({ json }) => json.id || id)
                    .catch(error => {
                        console.error(`Error updating ${resource} with id ${id}:`, error);
                        return id; // Return the id even if the update fails
                    });
            });

            return Promise.all(promises)
                .then(ids => ({ data: ids }))
                .catch(error => {
                    console.error('Error in updateMany:', error);
                    throw error;
                });
        } catch (error) {
            console.error('Error in updateMany:', error);
            throw error;
        }
    },

    create: (resource, params) => {
        try {
            const apiUrl = getApiUrl();
            const apiResource = resource.toLowerCase();
            const url = `${apiUrl}/${apiResource}`;

            console.log('create URL:', url, 'data:', params.data);

            return httpClient(url, {
                method: 'POST',
                body: JSON.stringify(params.data),
            })
                .then(({ json }) => ({
                    data: normalizeData(json),
                }))
                .catch(error => {
                    console.error('Error in create:', error);
                    throw error;
                });
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    },

    // Using 'deleteOne' instead of 'delete' to avoid JavaScript reserved word
    deleteOne: (resource, params) => {
        try {
            const apiUrl = getApiUrl();
            const apiResource = resource.toLowerCase();
            const url = `${apiUrl}/${apiResource}/${params.id}`;

            console.log('delete URL:', url);

            return httpClient(url, {
                method: 'DELETE',
            })
                .then(() => ({ data: { id: params.id } }))
                .catch(error => {
                    console.error('Error in delete:', error);
                    throw error;
                });
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    },

    deleteMany: (resource, params) => {
        try {
            const apiUrl = getApiUrl();
            const apiResource = resource.toLowerCase();

            console.log('deleteMany IDs:', params.ids);

            const promises = params.ids.map(id => {
                const url = `${apiUrl}/${apiResource}/${id}`;
                console.log('deleteMany URL:', url);

                return httpClient(url, {
                    method: 'DELETE',
                })
                    .then(() => id)
                    .catch(error => {
                        console.error(`Error deleting ${resource} with id ${id}:`, error);
                        return id; // Return the id even if the delete fails
                    });
            });

            return Promise.all(promises)
                .then(ids => ({ data: ids }))
                .catch(error => {
                    console.error('Error in deleteMany:', error);
                    throw error;
                });
        } catch (error) {
            console.error('Error in deleteMany:', error);
            throw error;
        }
    },
};

// Alias delete to deleteOne to avoid JavaScript reserved word issues
dataProvider.delete = dataProvider.deleteOne;
