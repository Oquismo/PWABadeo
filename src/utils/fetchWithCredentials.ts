/**
 * Utility function for making authenticated API calls
 * Always includes credentials (cookies) in requests
 */

interface FetchOptions extends RequestInit {
  // Override the RequestInit to ensure credentials is always included
}

export const fetchWithCredentials = async (
  url: string, 
  options: FetchOptions = {}
): Promise<Response> => {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    ...options,
  };

  // If headers are provided, merge them
  if (options.headers) {
    defaultOptions.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  } else {
    defaultOptions.headers = {
      'Content-Type': 'application/json',
    };
  }

  return fetch(url, defaultOptions);
};

/**
 * Wrapper for making authenticated API calls with JSON response
 */
export const apiCall = async (
  url: string,
  options: FetchOptions = {}
): Promise<any> => {
  const response = await fetchWithCredentials(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Shortcuts for common HTTP methods
 */
export const api = {
  get: (url: string, options: FetchOptions = {}) => 
    apiCall(url, { ...options, method: 'GET' }),
    
  post: (url: string, body?: any, options: FetchOptions = {}) =>
    apiCall(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  put: (url: string, body?: any, options: FetchOptions = {}) =>
    apiCall(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  delete: (url: string, options: FetchOptions = {}) =>
    apiCall(url, { ...options, method: 'DELETE' }),
};
