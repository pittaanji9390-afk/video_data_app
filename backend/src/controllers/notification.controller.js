/**
 * Notification Controller
 * Manages user notifications, read/unread states, and real-time count synchronization.
 */

let notificationsStore = [
  {
    id: 'notif-1',
    title: 'Video Approved',
    desc: 'Kitchen Video has been approved.',
    time: '10:30 AM',
    color: '#10b981',
    type: 'video_approved',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Upload Complete',
    desc: 'Bedroom Video uploaded successfully.',
    time: '09:45 AM',
    color: '#0ea5e9',
    type: 'upload_complete',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-3',
    title: 'Payment Received',
    desc: '₹2,500 credited to account.',
    time: 'Yesterday',
    color: '#8b5cf6',
    type: 'payment_received',
    read: true,
    createdAt: new Date().toISOString(),
  },
];

class NotificationController {
  /**
   * GET /api/v1/notifications
   */
  async getNotifications(req, res, next) {
    try {
      const unreadCount = notificationsStore.filter((n) => !n.read).length;
      return res.status(200).json({
        status: 'success',
        data: {
          notifications: notificationsStore,
          unreadCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/notifications/mark-all-read
   */
  async markAllRead(req, res, next) {
    try {
      notificationsStore = notificationsStore.map((n) => ({ ...n, read: true }));
      return res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read',
        data: {
          notifications: notificationsStore,
          unreadCount: 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/notifications/:id/mark-read
   */
  async markSingleRead(req, res, next) {
    try {
      const { id } = req.params;
      notificationsStore = notificationsStore.map((n) => (n.id === id ? { ...n, read: true } : n));
      const unreadCount = notificationsStore.filter((n) => !n.read).length;

      return res.status(200).json({
        status: 'success',
        message: 'Notification marked as read',
        data: {
          notifications: notificationsStore,
          unreadCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/notifications
   * Create a new notification (e.g. video approved, video rejected, upload complete, payment received)
   */
  async createNotification(req, res, next) {
    try {
      const { title, desc, color, type } = req.body;
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: title || 'New Notification',
        desc: desc || '',
        time: 'Just now',
        color: color || '#10b981',
        type: type || 'system',
        read: false,
        createdAt: new Date().toISOString(),
      };

      notificationsStore.unshift(newNotif);
      const unreadCount = notificationsStore.filter((n) => !n.read).length;

      return res.status(201).json({
        status: 'success',
        message: 'Notification created',
        data: {
          notification: newNotif,
          notifications: notificationsStore,
          unreadCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
