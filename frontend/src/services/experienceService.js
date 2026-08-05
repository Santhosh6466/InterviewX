import api from './api';

export const experienceService = {
  async createExperience(experienceData) {
    const response = await api.post('/api/experiences', experienceData);
    return response.data;
  },

  async getAllExperiences(filterOrPage = 0, sizeOrSignal = 10, companyIdArg = null, signalArg = null) {
    const params = new URLSearchParams();
    let signal = null;

    if (typeof filterOrPage === 'object' && filterOrPage !== null) {
      const {
        page = 0,
        size = 10,
        search,
        companyId,
        experienceLevel,
        interviewType,
        result,
        difficulty
      } = filterOrPage;

      if (search && String(search).trim()) {
        params.append('search', String(search).trim());
      }
      if (companyId) {
        params.append('companyId', String(companyId));
      }
      if (experienceLevel) {
        params.append('experienceLevel', String(experienceLevel));
      }
      if (interviewType) {
        params.append('interviewType', String(interviewType));
      }
      if (result) {
        params.append('result', String(result));
      }
      if (difficulty) {
        params.append('difficulty', String(difficulty));
      }

      params.append('page', String(page ?? 0));
      params.append('size', String(size ?? 10));

      if (sizeOrSignal && typeof sizeOrSignal === 'object' && 'aborted' in sizeOrSignal) {
        signal = sizeOrSignal;
      }
    } else {
      const page = filterOrPage ?? 0;
      const size = typeof sizeOrSignal === 'number' ? sizeOrSignal : 10;
      const companyId = companyIdArg;

      if (companyId) {
        params.append('companyId', String(companyId));
      }
      params.append('page', String(page));
      params.append('size', String(size));

      if (signalArg) {
        signal = signalArg;
      }
    }

    const queryString = params.toString();
    const url = queryString ? `/api/experiences?${queryString}` : '/api/experiences';
    const response = await api.get(url, { signal });
    return response.data;
  },

  async getExperiencesByCompany(companyId, page = 0, size = 20, signal = null) {
    const response = await api.get(`/api/experiences/company/${companyId}`, {
      params: { page, size },
      signal
    });
    return response.data;
  },

  async getUserExperiences() {
    const response = await api.get('/api/experiences', { params: { size: 100 } });
    return response.data;
  },

  async getExperienceById(experienceId) {
    const response = await api.get(`/api/experiences/${experienceId}`);
    return response.data;
  },

  async updateExperience(experienceId, experienceData) {
    const response = await api.put(`/api/experiences/${experienceId}`, experienceData);
    return response.data;
  },

  async deleteExperience(experienceId) {
    const response = await api.delete(`/api/experiences/${experienceId}`);
    return response.data;
  },

  async likeExperience(experienceId) {
    const response = await api.post(`/api/experiences/${experienceId}/like`);
    return response.data;
  },

  async unlikeExperience(experienceId) {
    const response = await api.delete(`/api/experiences/${experienceId}/like`);
    return response.data;
  },

  async bookmarkExperience(experienceId) {
    const response = await api.post(`/experiences/${experienceId}/bookmark`);
    return response.data;
  },

  async unbookmarkExperience(experienceId) {
    const response = await api.delete(`/experiences/${experienceId}/bookmark`);
    return response.data;
  },

  async getMyBookmarks() {
    const response = await api.get('/users/me/bookmarks');
    return response.data;
  }
};

export default experienceService;
