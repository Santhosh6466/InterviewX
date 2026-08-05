import api from './api';

export const profileService = {
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  async getPublicProfile(userId) {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  }
};

export default profileService;
