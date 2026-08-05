import experienceService from './experienceService.js';

export const getExperiencesByCompany = (companyId: string | number, page = 0, size = 18, signal?: AbortSignal) => 
  experienceService.getExperiencesByCompany(companyId, page, size, signal);

export const getUserExperiences = (userId?: string | number) =>
  experienceService.getUserExperiences(userId);

export const getExperienceById = (id: string | number) => 
  experienceService.getExperienceById(id);

export const getAllExperiences = (filterOrPage: any = 0, sizeOrSignal: any = 10, companyId?: string | number, signal?: AbortSignal) => 
  experienceService.getAllExperiences(filterOrPage, sizeOrSignal, companyId, signal);

export const createExperience = (data: any) => 
  experienceService.createExperience(data);

export const updateExperience = (id: string | number, data: any) => 
  experienceService.updateExperience(id, data);

export const deleteExperience = (id: string | number) => 
  experienceService.deleteExperience(id);

export const likeExperience = (id: string | number) => 
  experienceService.likeExperience(id);

export const unlikeExperience = (id: string | number) => 
  experienceService.unlikeExperience(id);

export const bookmarkExperience = (id: string | number) => 
  experienceService.bookmarkExperience(id);

export const unbookmarkExperience = (id: string | number) => 
  experienceService.unbookmarkExperience(id);

export const getMyBookmarks = () => 
  experienceService.getMyBookmarks();

export default experienceService;
