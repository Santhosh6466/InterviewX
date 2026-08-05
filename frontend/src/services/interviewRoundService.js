import api from './api';

export const interviewRoundService = {
  async createRound(roundData) {
    const response = await api.post('/api/interview-rounds', roundData);
    return response.data;
  },

  async getRoundsByExperience(experienceId) {
    const response = await api.get(`/api/interview-rounds/experience/${experienceId}`);
    return response.data;
  },

  async updateRound(roundId, roundData) {
    const response = await api.put(`/api/interview-rounds/${roundId}`, roundData);
    return response.data;
  },

  async deleteRound(roundId) {
    const response = await api.delete(`/api/interview-rounds/${roundId}`);
    return response.data;
  }
};

export default interviewRoundService;
