import { apiService } from '../services/api';

const DEFAULT_CANDIDATES = [
  {
    id: 'CND-7777',
    candidate_code: 'CND-7777',
    name: 'Anji',
    full_name: 'Anji',
    email: 'anji@gmail.com',
    phone: '+91 98765 00001',
    vendor_id: 'v0000000-0000-0000-0000-000000000001',
    vendor_name: 'Acme Video Solutions',
    videosCount: 0,
    status: 'Active',
    payout: '$0.00',
  },
];

export const candidateStore = {
  getCandidatesList: () => {
    try {
      const stored = localStorage.getItem('platform_candidates_list');
      if (stored) {
        const custom = JSON.parse(stored);
        if (Array.isArray(custom)) {
          const existingIds = new Set(custom.map((c) => c.id || c.candidate_code));
          const filteredDefaults = DEFAULT_CANDIDATES.filter(
            (c) => !existingIds.has(c.id) && !existingIds.has(c.candidate_code)
          );
          return [...custom, ...filteredDefaults];
        }
      }
    } catch (e) {
      console.warn('Error reading stored candidates:', e);
    }
    return DEFAULT_CANDIDATES;
  },

  addCandidate: async (newCandData) => {
    const all = candidateStore.getCandidatesList();
    const newId = `CND-${8900 + all.length + 1}`;
    
    const candidateObj = {
      id: newId,
      candidate_code: newId,
      name: newCandData.full_name || newCandData.name,
      full_name: newCandData.full_name || newCandData.name,
      email: newCandData.email,
      phone: newCandData.phone || '+1 555-0999',
      vendor_id: newCandData.vendor_id || 'v0000000-0000-0000-0000-000000000001',
      vendor_name: newCandData.vendor_name || 'Acme Video Solutions',
      videosCount: 0,
      status: 'Active',
      payout: '$0.00',
      created_at: new Date().toISOString(),
    };

    const updatedList = [candidateObj, ...all];
    try {
      localStorage.setItem('platform_candidates_list', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Failed to save candidate to localStorage', e);
    }

    try {
      await apiService.createCandidate({
        full_name: candidateObj.full_name,
        vendor_id: candidateObj.vendor_id,
        email: candidateObj.email,
        phone: candidateObj.phone,
      });
    } catch (err) {
      console.warn('Backend API create candidate offline/mock fallback active:', err.message);
    }

    return candidateObj;
  },

  findCandidateByIdentifier: (identifier) => {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const all = candidateStore.getCandidatesList();

    return all.find(
      (c) =>
        (c.email && c.email.toLowerCase() === clean) ||
        (c.id && c.id.toLowerCase() === clean) ||
        (c.candidate_code && c.candidate_code.toLowerCase() === clean) ||
        (c.phone && c.phone.replace(/\D/g, '') === clean.replace(/\D/g, '')) ||
        (c.name && c.name.toLowerCase().includes(clean)) ||
        (c.full_name && c.full_name.toLowerCase().includes(clean))
    );
  },
};
