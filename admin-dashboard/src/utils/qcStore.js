// Shared store for Quality Control (QC) Video Submissions across candidate app, vendor portal, and admin dashboard

const DEFAULT_SUBMISSIONS = [
  {
    id: 'VID-901',
    title: 'Kitchen Cooking Sample',
    candidateId: 'CAN-2024-001',
    candidateName: 'Vasavi Kandula',
    candidatePhone: '+91 98765 43210',
    vendor: 'Acme Video Solutions',
    duration: '15:30 Mins',
    score: 92,
    status: 'Pending',
    env: 'Kitchen',
    time: 'Today, 10:30 AM',
    size: '1.24 GB',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    rejectionReason: '',
  },
  {
    id: 'VID-902',
    title: 'Bedroom Lighting Sample',
    candidateId: 'CND-7777',
    candidateName: 'Rahul Kumar',
    candidatePhone: '+91 98765 43211',
    vendor: 'Apex Data Services',
    duration: '30:00 Mins',
    score: 88,
    status: 'Pending',
    env: 'Bedroom',
    time: 'Today, 09:15 AM',
    size: '2.80 GB',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    rejectionReason: '',
  },
  {
    id: 'VID-903',
    title: 'Garden Daylight Sample',
    candidateId: 'CND-7777',
    candidateName: 'Anji',
    candidatePhone: '+91 98765 43212',
    vendor: 'Acme Video Solutions',
    duration: '22:15 Mins',
    score: 95,
    status: 'Approved',
    env: 'Garden',
    time: 'Yesterday, 06:20 PM',
    size: '1.50 GB',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    rejectionReason: '',
  },
];

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
