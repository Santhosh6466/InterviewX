import api from './api';

const commentService = {
  createComment: async (experienceId, content) => {
    const response = await api.post(`/experiences/${experienceId}/comments`, { content });
    return response.data;
  },

  getComments: async (experienceId) => {
    const response = await api.get(`/experiences/${experienceId}/comments`);
    return response.data;
  },

  replyToComment: async (parentCommentId, content) => {
    const response = await api.post(`/reply`, { parentCommentId, content });
    return response.data;
  },

  updateComment: async (commentId, content) => {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  }
};

export default commentService;
