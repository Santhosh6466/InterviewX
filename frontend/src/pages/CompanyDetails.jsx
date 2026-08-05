import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import companyService from '../services/companyService';
import experienceService from '../services/experienceService';
import { SkeletonCard } from '../components/Skeleton';
import { getInterviewResultLabel, getDifficultyLabel, getInterviewTypeLabel, getStatusBadgeClass } from '../constants/enums';
import CompanyLogo from '../components/CompanyLogo';
import LikeButton from '../components/LikeButton';
import BookmarkButton from '../components/BookmarkButton';
import StatusChip from '../components/StatusChip';
import AttributePill from '../components/AttributePill';
import DifficultyIndicator from '../components/DifficultyIndicator';
import ExperienceRow from '../components/ExperienceRow';

// In-memory cache for company details and experiences
const companyDetailsCache = new Map();

export default function CompanyDetails() {
  const [company, setCompany] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Experiences');

  const getCompanyIdFromHash = () => {
    const hash = window.location.hash;
    const parts = hash.split('#/company/');
    return parts[1] || 'google';
  };

  useEffect(() => {
    const compId = getCompanyIdFromHash();
    fetchData(compId);
  }, []);

  const fetchData = async (compId) => {
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
      setLoading(true);
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

      // Filter helper to ensure experiences strictly belong to this company
      const isForCompany = (exp) => {
        if (!exp) return false;
        const expCompId = exp.companyId || exp.company?.id || exp.company;
        const expCompName = exp.company?.name || exp.companyName || '';
        const cName = fetchedCompany?.name || companyName || '';

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

      setCompany(fetchedCompany);
      setExperiences(processedExperiences);

      // Save into cache
      companyDetailsCache.set(compId, {
        company: fetchedCompany,
        experiences: processedExperiences
      });
    } catch (err) {
      console.error('[CompanyDetails] Error loading company data:', err);
      setError(err.response?.data?.message || 'Failed to load company details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const companyName = company?.name || (getCompanyIdFromHash().charAt(0).toUpperCase() + getCompanyIdFromHash().slice(1));
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

  return (
    <DashboardLayout activeTab="Companies">
      <div className="flex flex-col gap-16 max-w-[1200px] mx-auto w-full fade-in-up">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-theme-muted">
          <a href="#/companies" className="hover:text-theme-text transition-colors">Companies</a>
          <iconify-icon icon="lucide:chevron-right"></iconify-icon>
          <span className="text-theme-muted">{companyName}</span>
        </div>

        {/* Error State */}
        {error ? (
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
            <div className="premium-card flex flex-col gap-8 relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between relative z-10">
                <div className="flex items-start gap-5">
                  <CompanyLogo 
                    company={company}
                    logoUrl={company?.logoUrl} 
                    name={companyName} 
                    className="premium-logo-box w-20 h-20"
                    iconClassName="text-5xl"
                  />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h1 className="display-font text-4xl">{companyName}</h1>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-hover text-xs font-bold text-yellow-500">
                        <iconify-icon icon="lucide:star" className="fill-current"></iconify-icon> {ratingVal}{totalRatingStr}
                      </span>
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
                  <p className="text-sm text-theme-muted">No interview experiences available for {companyName}.</p>
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
