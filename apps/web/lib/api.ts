// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API client with auth headers
export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        
        // Handle validation errors with more detail
        if (error.errors && Array.isArray(error.errors)) {
          const errorMessages = error.errors.map((err: any) => err.msg).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        
        throw new Error(error.message || 'API request failed');
      }

      return response.json();
    } catch (fetchError) {
      console.error(`Network Error for ${endpoint}:`, fetchError);
      
      if (fetchError instanceof TypeError) {
        throw new Error('Network connection failed. Please check if the server is running.');
      }
      
      throw fetchError;
    }
  },

  get(endpoint: string) {
    return this.request(endpoint);
  },

  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};

// Event API functions
export const eventAPI = {
  // Get all events with filters
  getEvents: (params: {
    search?: string;
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    return apiClient.get(`/api/events${queryString ? `?${queryString}` : ''}`);
  },

  // Get single event
  getEvent: (id: string) => apiClient.get(`/api/events/${id}`),

  // Create event (organizer only)
  createEvent: (eventData: any) => apiClient.post('/api/events', eventData),

  // Update event (organizer only)
  updateEvent: (id: string, eventData: any) => apiClient.put(`/api/events/${id}`, eventData),

  // Delete event (organizer only)
  deleteEvent: (id: string) => apiClient.delete(`/api/events/${id}`),

  // Get organizer's events
  getMyEvents: () => apiClient.get('/api/events/organizer/my-events'),
};

// Auth API functions
export const authAPI = {
  register: (userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
    referredBy?: string;
  }) => apiClient.post('/api/auth/register', userData),

  login: (credentials: {
    email: string;
    password: string;
  }) => apiClient.post('/api/auth/login', credentials),

  getProfile: () => apiClient.get('/api/auth/profile'),
};