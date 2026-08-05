import api from './api';

export const companyService = {
  async getAllCompanies() {
    const response = await api.get('/api/companies');
    return response.data;
  },

  async searchCompanies(query = '', page = 0, size = 20, signal = null) {
    const params = { page, size };
    if (query && query.trim() !== '') {
      params.query = query.trim();
    }
    const response = await api.get('/api/companies/search', {
      params,
      signal
    });
    return response.data;
  },

  async getCompanyById(id) {
    const response = await api.get(`/api/companies/${id}`);
    return response.data;
  }
};

export default companyService;
