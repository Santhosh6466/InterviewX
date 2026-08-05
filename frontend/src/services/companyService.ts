import companyService from './companyService.js';

export const searchCompanies = (query?: string, page?: number, size?: number, signal?: AbortSignal) => 
  companyService.searchCompanies(query, page, size, signal);

export const getCompanyById = (id: string | number) => 
  companyService.getCompanyById(id);

export const getAllCompanies = () => 
  companyService.getAllCompanies();

export default companyService;
