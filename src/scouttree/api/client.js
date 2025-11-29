/**
 * ScoutTree API Client
 * Handles all API communication with the backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

class ScoutTreeAPI {
  constructor() {
    this.token = localStorage.getItem('scoutTreeToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('scoutTreeToken', token);
    } else {
      localStorage.removeItem('scoutTreeToken');
    }
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async register(email, password, fullName) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    if (data.data.accessToken) {
      this.setToken(data.data.accessToken);
    }

    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.data.accessToken) {
      this.setToken(data.data.accessToken);
    }

    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  // Scout Reports
  async createScoutReport(params) {
    return await this.request('/scout', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getScoutReport(jobId) {
    return await this.request(`/scout/${jobId}`);
  }

  async downloadReport(reportId) {
    return await this.request(`/scout/report/${reportId}`);
  }

  async uploadPGN(pgn, color, includeEngineAnalysis = true) {
    return await this.request('/scout/upload-pgn', {
      method: 'POST',
      body: JSON.stringify({ pgn, color, includeEngineAnalysis }),
    });
  }

  async searchUsername(name, platform = 'lichess') {
    return await this.request(`/scout/search-match?name=${encodeURIComponent(name)}&platform=${platform}`);
  }

  async getDemoReport() {
    return await this.request('/scout/demo');
  }

  // User
  async getReportHistory(page = 1, limit = 20) {
    return await this.request(`/user/reports?page=${page}&limit=${limit}`);
  }

  async getUsageStats() {
    return await this.request('/user/usage');
  }

  async deleteReport(reportId) {
    return await this.request(`/user/reports/${reportId}`, { method: 'DELETE' });
  }

  // Payment (placeholder for Stripe integration)
  async createCheckoutSession(priceId) {
    // This would integrate with Stripe
    return await this.request('/payment/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ price_id: priceId }),
    });
  }
}

export default new ScoutTreeAPI();
