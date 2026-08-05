import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import companyService from '../services/companyService';
import experienceService from '../services/experienceService';
import requestCache from '../services/cache';
import { SkeletonCard } from '../components/Skeleton';
import CompanyLogo from '../components/CompanyLogo';
import ExperienceRow from '../components/ExperienceRow';
import NotFound from './NotFound';

// In-memory cache for company details and experiences
const companyDetailsCache = new Map();

const isMongoId = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);

const getCompanyIdFromHash = () => {
  const hash = window.location.hash;
  const parts = hash.split('#/company/');
  return parts[1] || '';
};

const findCompanyInCache = (compId) => {
  if (!compId) return null;
  if (companyDetailsCache.has(compId)) {
    return companyDetailsCache.get(compId)?.company || null;
  }
  
  // Check all companies cache
  const allCompanies = requestCache.get('GET', '/api/companies') || 
                       requestCache.get('GET:/api/companies');
  if (Array.isArray(allCompanies)) {
    const found = allCompanies.find(c => 
      String(c.id || c._id) === String(compId) || 
      String(c.name).toLowerCase() === String(compId).toLowerCase()
    );
    if (found) return found;
  }

  // Check search cache
  const searchCache = requestCache.get('GET', '/api/companies/search', { page: 0, size: 24 }) ||
                      requestCache.get('GET:/api/companies/search?page=0&size=24');
  if (searchCache) {
    const list = Array.isArray(searchCache.content) ? searchCache.content : (Array.isArray(searchCache) ? searchCache : []);
    const found = list.find(c => 
      String(c.id || c._id) === String(compId) || 
      String(c.name).toLowerCase() === String(compId).toLowerCase()
    );
    if (found) return found;
  }

  return null;
};

export default function CompanyDetails() {
  const compIdFromUrl = getCompanyIdFromHash();
  const initialCompany = findCompanyInCache(compIdFromUrl);
  const initialExps = companyDetailsCache.get(compIdFromUrl)?.experiences || [];

  const [company, setCompany] = useState(initialCompany);
  const [experiences, setExperiences] = useState(initialExps);
  const [loading, setLoading] = useState(() => !initialCompany);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Experiences');

  useEffect(() => {
    const handleNavigation = () => {
      const currentId = getCompanyIdFromHash();
      if (!currentId) return;

      const cached = findCompanyInCache(currentId);
      if (cached) {
        setCompany(cached);
      }
      fetchData(currentId);
    };

    handleNavigation();
    window.addEventListener('hashchange', handleNavigation);
    return () => window.removeEventListener('hashchange', handleNavigation);
  }, []);

  const fetchData = async (compId) => {
    if (!compId) return;

    // Check in-memory cache first to avoid duplicate API calls
    if (companyDetailsCache.has(compId)) {
      const cached = companyDetailsCache.get(compId);
      
      let bookmarkIds = new Set();
      try {
        const bookmarks = await experienceService.getMyBookmarks();
        const bList = Array.isArray(bookmarks) ? bookmarks : [];
        bookmarkIds = new Set(bList.map(b => String(b.experienceId || b.id)));
      } catch (e) {
        console.warn('[CompanyDetails] Error fetching bookmarks for cache:', e);
      }

      setCompany(cached.company);
      setExperiences(cached.experiences.map(exp => ({
        ...exp,
        bookmarked: bookmarkIds.has(String(exp.id || exp._id))
      })));
      setLoading(false);
      return;
    }

    try {
      if (!company) {
        setLoading(true);
      }
      setError('');

      // Fetch company details, experiences & bookmarks in parallel
      const [compRes, expRes, bookmarksRes] = await Promise.allSettled([
        companyService.getCompanyById(compId),
        experienceService.getExperiencesByCompany(compId, 0, 50),
        experienceService.getMyBookmarks()
      ]);

      let fetchedCompany = null;
      let fetchedExperiences = [];
      let bookmarkIds = new Set();

      if (bookmarksRes.status === 'fulfilled' && Array.isArray(bookmarksRes.value)) {
        bookmarkIds = new Set(bookmarksRes.value.map(b => String(b.experienceId || b.id)));
      }

      // Process company response
      if (compRes.status === 'fulfilled' && compRes.value) {
        fetchedCompany = compRes.value;
      } else {
        // Fallback search if getCompanyById by string name/id failed
        try {
          const companiesData = await companyService.getAllCompanies();
          if (Array.isArray(companiesData)) {
            fetchedCompany = companiesData.find(c => 
              String(c.id) === String(compId) || 
              String(c.name).toLowerCase() === String(compId).toLowerCase()
            ) || null;
          }
        } catch (e) {
          console.warn('[CompanyDetails] Fallback search failed:', e);
        }
      }

      const cName = fetchedCompany?.name || (company?.name || '');

      // Filter helper to ensure experiences strictly belong to this company
      const isForCompany = (exp) => {
        if (!exp) return false;
        const expCompId = exp.companyId || exp.company?.id || exp.company;
        const expCompName = exp.company?.name || exp.companyName || '';

        return (
          (compId && String(expCompId) === String(compId)) ||
          (cName && expCompName.toLowerCase() === cName.toLowerCase()) ||
          (compId && expCompName.toLowerCase() === String(compId).toLowerCase())
        );
      };

      // Process experiences response
      if (expRes.status === 'fulfilled' && expRes.value) {
        const list = Array.isArray(expRes.value) 
          ? expRes.value 
          : (expRes.value?.content || expRes.value?.experiences || []);
        fetchedExperiences = list.filter(isForCompany);
      }
      
      // Fallback if primary endpoint returned no experiences or failed
      if (fetchedExperiences.length === 0) {
        try {
          const fallbackExp = await experienceService.getAllExperiences(0, 50, compId);
          const list = Array.isArray(fallbackExp) ? fallbackExp : (fallbackExp?.content || fallbackExp?.experiences || []);
          fetchedExperiences = list.filter(isForCompany);
        } catch (e) {
          console.warn('[CompanyDetails] Fallback experience fetch failed:', e);
        }
      }

      const processedExperiences = fetchedExperiences.map(exp => ({
        ...exp,
        bookmarked: bookmarkIds.has(String(exp.id || exp._id))
      }));

      setCompany(fetchedCompany || company);
      setExperiences(processedExperiences);

      // Save into cache
      if (fetchedCompany) {
        companyDetailsCache.set(compId, {
          company: fetchedCompany,
          experiences: processedExperiences
        });
      }
    } catch (err) {
      console.error('[CompanyDetails] Error loading company data:', err);
      setError(err.response?.data?.message || 'Failed to load company details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const rawHashId = getCompanyIdFromHash();
  const companyName = company?.name || (!isMongoId(rawHashId) && rawHashId ? (rawHashId.charAt(0).toUpperCase() + rawHashId.slice(1)) : '');
  const ratingVal = company?.rating != null ? Number(company.rating).toFixed(1) : '0.0';
  const totalRatingStr = company?.totalRating ? ` (${company.totalRating})` : '';

  // Positives formatting
  const positivesText = typeof company?.positives === 'string' ? 
    company.positives.split(',').map(p => p.trim()).join(' • ') : 
    company?.positives || '';

  const subTabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Experiences', label: `Experiences (${experiences.length})` },
    { id: 'Reviews', label: `Reviews (${company?.reviews ?? 0})` },
    { id: 'Interviews', label: `Interviews (${company?.interviews ?? company?.exp ?? experiences.length})` },
    { id: 'Salaries', label: `Salaries (${company?.salaries ?? 0})` }
  ];

  if (!loading && (!company && !companyName) && error) {
    return (
      <NotFound
        code={error ? '500' : '404'}
        title={error ? 'Server Error' : 'Company Not Found'}
        description={error || "The company you're looking for doesn't exist or could not be found."}
        activeTab="Companies"
        onRetry={() => fetchData(getCompanyIdFromHash())}
      />
    );
  }

  return (
    <DashboardLayout activeTab="Companies">
      <div className="flex flex-col gap-16 max-w-[1200px] mx-auto w-full fade-in-up">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-theme-muted">
          <a href="#/companies" className="hover:text-theme-text transition-colors">Companies</a>
          <iconify-icon icon="lucide:chevron-right"></iconify-icon>
          {companyName ? (
            <span className="text-theme-muted">{companyName}</span>
          ) : (
            <span className="inline-block w-24 h-3.5 rounded bg-theme-hover skeleton-shimmer"></span>
          )}
        </div>

        {/* Error State */}
        {error && !company ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-red-500/20 rounded-sm gap-3">
            <iconify-icon icon="lucide:alert-circle" className="text-4xl text-red-500 mb-2"></iconify-icon>
            <h3 className="display-font text-2xl text-red-500">Something went wrong</h3>
            <p className="text-sm text-theme-muted max-w-md">{error}</p>
            <button 
              onClick={() => fetchData(getCompanyIdFromHash())}
              className="btn-primary px-6 py-3 rounded-sm mt-4"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Company Header Card */}
            {loading && !company ? (
              <div className="premium-card flex flex-col gap-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between relative z-10">
                  <div className="flex items-start gap-5">
                    <div className="w-20 h-20 rounded-sm bg-theme-hover skeleton-shimmer flex-shrink-0"></div>
                    <div className="flex flex-col gap-3">
                      <div className="w-52 h-8 rounded bg-theme-hover skeleton-shimmer"></div>
                      <div className="w-80 max-w-full h-4 rounded bg-theme-hover skeleton-shimmer"></div>
                      <div className="w-48 max-w-full h-3 rounded bg-theme-hover skeleton-shimmer"></div>
                    </div>
                  </div>
                  <div className="w-28 h-10 rounded-sm bg-theme-hover skeleton-shimmer flex-shrink-0"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 relative z-10 border-t border-theme-border pt-8">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="w-16 h-3 rounded bg-theme-hover skeleton-shimmer"></div>
                      <div className="w-10 h-4 rounded bg-theme-hover skeleton-shimmer"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="premium-card flex flex-col gap-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between relative z-10">
                  <div className="flex items-start gap-5">
                    <CompanyLogo 
                      company={company}
                      logoUrl={company?.logoUrl} 
                      name={companyName || 'Company'} 
                      className="premium-logo-box w-20 h-20"
                      iconClassName="text-5xl"
                    />
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <h1 className="display-font text-4xl">{companyName || 'Company'}</h1>
                        {company?.rating != null && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-hover text-xs font-bold text-yellow-500">
                            <iconify-icon icon="lucide:star" className="fill-current"></iconify-icon> {ratingVal}{totalRatingStr}
                          </span>
                        )}
                      </div>
                      {company?.description && (
                        <p className="text-theme-muted text-sm max-w-xl leading-relaxed">
                          {company.description}
                        </p>
                      )}
                      {positivesText && (
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-500/90 mt-1">
                          <iconify-icon icon="lucide:thumbs-up" className="text-xs"></iconify-icon>
                          <span>{positivesText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="btn-primary px-6 py-2.5 rounded-sm flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer">
                    <iconify-icon icon="lucide:plus"></iconify-icon> Follow
                  </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 relative z-10 border-t border-theme-border pt-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Interviews</span>
                    <span className="font-bold text-sm">{company?.interviews ?? company?.exp ?? experiences.length}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Jobs</span>
                    <span className="font-bold text-sm">{company?.jobs ?? 0}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Reviews</span>
                    <span className="font-bold text-sm">{company?.reviews ?? 0}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Salaries</span>
                    <span className="font-bold text-sm">{company?.salaries ?? 0}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Benefits</span>
                    <span className="font-bold text-sm">{company?.benefits ?? 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Navigation Subtabs */}
            <div className="flex items-center gap-8 border-b border-theme-border overflow-x-auto">
              {subTabs.map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id ? 'border-theme-inverted text-theme-text' : 'border-transparent text-theme-muted hover:text-theme-text'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">
                  {activeTab === 'Overview' && 'Company Overview & Interview Experiences'}
                  {activeTab === 'Experiences' && `Interview Experiences (${experiences.length})`}
                  {activeTab === 'Interviews' && `Interview Processes (${experiences.length})`}
                  {activeTab === 'Reviews' && `Company Reviews & Experiences`}
                  {activeTab === 'Salaries' && `Salaries & Compensation Insights`}
                </h2>
                <button className="flex items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-text transition-colors">
                  <iconify-icon icon="lucide:filter"></iconify-icon> Filter
                </button>
              </div>

              {loading ? (
                <div className="row-list-container">
                  <div className="row-list-item"><SkeletonCard /></div>
                  <div className="row-list-item"><SkeletonCard /></div>
                  <div className="row-list-item"><SkeletonCard /></div>
                </div>
              ) : experiences.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-theme-border rounded-sm gap-3">
                  <iconify-icon icon="lucide:file-text" className="text-4xl text-theme-muted mb-2"></iconify-icon>
                  <h3 className="display-font text-2xl text-theme-text">No experiences available</h3>
                  <p className="text-sm text-theme-muted">No interview experiences available for {companyName || 'this company'}.</p>
                </div>
              ) : (
                <div className="row-list-container">
                  {experiences.map((exp, i) => (
                    <ExperienceRow 
                      key={exp.id || exp._id || i}
                      experience={exp}
                      onLikeToggle={(newLiked, newLikesCount) => {
                        const expId = exp.id || exp._id;
                        setExperiences(prev => prev.map(item => {
                          if (String(item.id || item._id) === String(expId)) {
                            return { ...item, liked: newLiked, likesCount: newLikesCount };
                          }
                          return item;
                        }));
                      }}
                      onBookmarkToggle={(newBookmarked) => {
                        const expId = exp.id || exp._id;
                        setExperiences(prev => prev.map(item => {
                          if (String(item.id || item._id) === String(expId)) {
                            return { ...item, bookmarked: newBookmarked };
                          }
                          return item;
                        }));
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
