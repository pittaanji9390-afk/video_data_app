/**
 * API Service for Vendor Dashboard
 * Base URL: http://localhost:5000/api/v1
 * Includes robust fallback data to ensure UI NEVER renders blank even if API is offline
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Fallback dummy data for vendor overview
const FALLBACK_VENDOR_DATA = {
  vendorInfo: {
    id: 'v0000000-0000-0000-0000-000000000001',
    vendor_code: 'VENDOR-001',
    company_name: 'Acme Video Solutions',
    contact_person: 'John Vendor',
    email: 'john@acmevideos.com',
    phone: '+1-555-0192',
    hourly_rate: 50,
  },
  metrics: {
    totalCandidates: 14,
    uploadedVideos: 84,
    approvedVideos: 72,
    rejectedVideos: 6,
    pendingVideos: 6,
    approvedHours: 48.5,
    hourlyRate: 50,
    totalEarnings: 2425.0,
  },
  recentUploads: [
    {
      id: 'VID-8001',
      candidate_name: 'Alex Johnson',
      environment_tag: 'Kitchen',
      duration_seconds: 45,
      upload_date: '2026-07-28',
      status: 'approved',
      thumbnail: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'VID-8002',
      candidate_name: 'Maria Garcia',
      environment_tag: 'Bedroom',
      duration_seconds: 60,
      upload_date: '2026-07-28',
      status: 'approved',
      thumbnail: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'VID-8003',
      candidate_name: 'David Kim',
      environment_tag: 'Living Room',
      duration_seconds: 30,
      upload_date: '2026-07-27',
      status: 'pending',
      thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'VID-8004',
      candidate_name: 'Emma Watson',
      environment_tag: 'Office Desk',
      duration_seconds: 90,
      upload_date: '2026-07-27',
      status: 'rejected',
      thumbnail: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'VID-8005',
      candidate_name: 'Michael Brown',
      environment_tag: 'Outdoor Backyard',
      duration_seconds: 120,
      upload_date: '2026-07-26',
      status: 'approved',
      thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&auto=format&fit=crop&q=80',
    },
  ],
  recentActivity: [
    {
      id: 1,
      title: 'QC Approval Received',
      description: 'Video #VID-8001 (Alex Johnson) approved by Super Admin.',
      time: '10 minutes ago',
      type: 'success',
    },
    {
      id: 2,
      title: 'New Video Uploaded',
      description: 'David Kim uploaded 30s video in Living Room environment.',
      time: '1 hour ago',
      type: 'info',
    },
    {
      id: 3,
      title: 'Candidate Onboarded',
      description: 'Emma Watson added to Acme Video Solutions subject roster.',
      time: '3 hours ago',
      type: 'primary',
    },
    {
      id: 4,
      title: 'Payment Statement Updated',
      description: '48.5 approved hours verified ($2,425.00 total payout).',
      time: 'Yesterday',
      type: 'warning',
    },
  ],
};

async function fetchWithFallback(endpoint, fallbackValue) {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    console.warn(`API call [${endpoint}] failed. Utilizing fallback data:`, err.message);
    return fallbackValue;
  }
}

export const vendorApiService = {
  getOverview: async () => {
    return fetchWithFallback('/vendors/overview', FALLBACK_VENDOR_DATA);
  },
  getCandidates: async () => {
    return fetchWithFallback('/candidates', FALLBACK_VENDOR_DATA.recentUploads);
  },
  getUploads: async () => {
    return fetchWithFallback('/videos', FALLBACK_VENDOR_DATA.recentUploads);
  },
};
