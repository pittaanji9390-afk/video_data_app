/**
 * API Service for Admin Dashboard
 * Base URL: http://localhost:5000/api/v1
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Request Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const apiService = {
  // Vendors API
  getVendors: async (page = 1, limit = 50, search = '') => {
    const query = new URLSearchParams({ page, limit, search }).toString();
    return request(`/vendors?${query}`);
  },
  createVendor: async (vendorData) => {
    return request('/vendors', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  },
  updateVendor: async (id, vendorData) => {
    return request(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vendorData),
    });
  },
  deleteVendor: async (id) => {
    return request(`/vendors/${id}`, {
      method: 'DELETE',
    });
  },

  // Candidates API
  getCandidates: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/candidates?${query}`);
  },
  createCandidate: async (candidateData) => {
    return request('/candidates', {
      method: 'POST',
      body: JSON.stringify(candidateData),
    });
  },

  // Videos API
  getVideos: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/videos?${query}`);
  },
  getVideoById: async (id) => {
    return request(`/videos/${id}`);
  },

  // QC Reviews API
  submitQCReview: async (qcData) => {
    return request('/qc-reviews', {
      method: 'POST',
      body: JSON.stringify(qcData),
    });
  },
  getQCReviewByVideoId: async (videoId) => {
    return request(`/qc-reviews/video/${videoId}`);
  },

  // Payments API
  getVendorPayment: async (vendorId, hourlyRate = 50) => {
    return request(`/payments/vendor/${vendorId}?hourlyRate=${hourlyRate}`);
  },
};
