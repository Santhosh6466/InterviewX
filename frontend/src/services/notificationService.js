import api from './api';

export const notificationService = {
  async getNotifications(page = 0, size = 20) {
    const response = await api.get('/api/notifications', {
      params: { page, size }
    });
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get('/api/notifications/unread-count');
    return response.data;
  },

  async markAsRead(notificationId) {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  },

  async deleteNotification(notificationId) {
    const response = await api.delete(`/api/notifications/${notificationId}`);
    return response.data;
  }
};

export default notificationService;
