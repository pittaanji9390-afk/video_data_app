// Shared store for Quality Control (QC) Video Submissions across candidate app, vendor portal, and admin dashboard

const DEFAULT_SUBMISSIONS = [];

const DEFAULT_SUPPORT_TICKETS = [
  {
    id: 'TCK-501',
    candidateName: 'Vasavi Kandula',
    candidateId: 'CAN-2024-001',
    phone: '+91 98765 43210',
    message: 'Having trouble uploading my 30-minute kitchen video over mobile data. Is there an auto-resume feature?',
    timestamp: 'Today, 02:15 PM',
    status: 'Open',
  },
  {
    id: 'TCK-502',
    candidateName: 'Rahul Kumar',
    candidateId: 'CND-7777',
    phone: '+91 98765 43211',
    message: 'My payment for candidate verification is pending. Please verify my document submission.',
    timestamp: 'Today, 11:40 AM',
    status: 'Resolved',
  },
];

export const qcStore = {
  getSubmissions() {
    const raw = localStorage.getItem('platform_qc_submissions');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse platform_qc_submissions:', e);
      }
    }
    localStorage.setItem('platform_qc_submissions', JSON.stringify(DEFAULT_SUBMISSIONS));
    return DEFAULT_SUBMISSIONS;
  },

  addSubmission(submission) {
    const current = this.getSubmissions();
    const updated = [submission, ...current];
    localStorage.setItem('platform_qc_submissions', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('qc_store_updated', { detail: updated }));
    try {
      const bc = new BroadcastChannel('platform_realtime_channel');
      bc.postMessage({ type: 'QC_STORE_UPDATED', payload: updated });
      bc.close();
    } catch (_) {}
    return updated;
  },

  updateStatus(id, newStatus, reason = '') {
    const current = this.getSubmissions();
    const updated = current.map((item) => {
      if (item.id === id) {
        return { ...item, status: newStatus, rejectionReason: reason };
      }
      return item;
    });
    localStorage.setItem('platform_qc_submissions', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('qc_store_updated', { detail: updated }));
    try {
      const bc = new BroadcastChannel('platform_realtime_channel');
      bc.postMessage({ type: 'QC_STORE_UPDATED', payload: updated });
      bc.close();
    } catch (_) {}
    return updated;
  },

  subscribe(callback) {
    const handler = (e) => callback(e.detail || this.getSubmissions());
    window.addEventListener('qc_store_updated', handler);
    const storageHandler = (e) => {
      if (e.key === 'platform_qc_submissions') {
        callback(this.getSubmissions());
      }
    };
    window.addEventListener('storage', storageHandler);

    let bc;
    try {
      bc = new BroadcastChannel('platform_realtime_channel');
      bc.onmessage = (e) => {
        if (e.data && e.data.type === 'QC_STORE_UPDATED') {
          callback(e.data.payload || this.getSubmissions());
        }
      };
    } catch (_) {}

    return () => {
      window.removeEventListener('qc_store_updated', handler);
      window.removeEventListener('storage', storageHandler);
      if (bc) bc.close();
    };
  },

  // SUPPORT TICKETS REAL-TIME SYNC
  getSupportTickets() {
    const raw = localStorage.getItem('platform_support_tickets');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse platform_support_tickets:', e);
      }
    }
    localStorage.setItem('platform_support_tickets', JSON.stringify(DEFAULT_SUPPORT_TICKETS));
    return DEFAULT_SUPPORT_TICKETS;
  },

  addSupportTicket(ticket) {
    const current = this.getSupportTickets();
    const updated = [ticket, ...current];
    localStorage.setItem('platform_support_tickets', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('support_tickets_updated', { detail: updated }));
    return updated;
  },

  updateSupportTicketStatus(id, newStatus) {
    const current = this.getSupportTickets();
    const updated = current.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
    localStorage.setItem('platform_support_tickets', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('support_tickets_updated', { detail: updated }));
    return updated;
  },

  subscribeSupport(callback) {
    const handler = (e) => callback(e.detail || this.getSupportTickets());
    window.addEventListener('support_tickets_updated', handler);
    const storageHandler = (e) => {
      if (e.key === 'platform_support_tickets') {
        callback(this.getSupportTickets());
      }
    };
    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener('support_tickets_updated', handler);
      window.removeEventListener('storage', storageHandler);
    };
  },
};
