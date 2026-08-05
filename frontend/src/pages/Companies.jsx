import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import companyService from '../services/companyService';
import { SkeletonCompanyCard } from '../components/Skeleton';
import CompanyLogo from '../components/CompanyLogo';
import { CURATED_COMPANIES, mergeWithCurated } from '../data/companiesData';

const PAGE_SIZE = 16;

function CompanyCard({ company }) {
  const companyId = company.id || company._id || company.name.toLowerCase().replace(/\s+/g, '-');
  const interviewsCount = company.interviews ?? company.exp ?? company.experienceCount ?? 0;
  const rating = company.rating != null ? Number(company.rating).toFixed(1) : '4.2';

  const getCategory = () => {
    if (company.category) return company.category;
    if (company.description) {
      if (company.description.includes('|')) {
        return company.description.split('|')[0].trim();
      }
      return company.description.length > 35 ? company.description.substring(0, 35) + '...' : company.description;
    }
    return 'Technology';
  };

  const category = getCategory();
  
  return (
    <a 
      href={`#/company/${companyId}`} 
      className="p-4 border-r border-b border-theme-border hover:bg-theme-hover flex items-center gap-4 cursor-pointer group transition-colors"
    >
      <CompanyLogo 
        company={company} 
        className="w-14 h-14 rounded-sm bg-theme-main border border-theme-border flex items-center justify-center flex-shrink-0"
        iconClassName="text-2xl"
      />

      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="font-bold text-base group-hover:text-theme-text transition-colors truncate">{company.name}</span>
        <span className="text-xs text-theme-muted font-medium truncate">{category}</span>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
            <iconify-icon icon="bi:star-fill" className="text-[9px]"></iconify-icon>
            <span>{rating}</span>
          </div>
          <span className="text-[10px] text-theme-muted">•</span>
          <span className="text-[10px] text-theme-muted">
            {interviewsCount} {interviewsCount === 1 ? 'Exp' : 'Exps'}
          </span>
        </div>
      </div>
      
      <iconify-icon icon="lucide:chevron-right" className="text-theme-muted group-hover:text-theme-text transition-colors text-lg flex-shrink-0"></iconify-icon>
    </a>
  );
}

export default function Companies() {
  // Master pool of all available companies (server + curated)
  const [allCompanies, setAllCompanies] = useState(() => CURATED_COMPANIES);
  const [displayedCompanies, setDisplayedCompanies] = useState(() => CURATED_COMPANIES.slice(0, PAGE_SIZE));
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const isFetchingMoreRef = useRef(false);
  const sentinelRef = useRef(null);

  // Filtered pool based on search query
  const filteredPool = React.useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return allCompanies;
    }
    const q = searchQuery.trim().toLowerCase();
    return allCompanies.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) || 
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.domain && c.domain.toLowerCase().includes(q))
    );
  }, [allCompanies, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPool.length / PAGE_SIZE));
  const hasMore = currentPage + 1 < totalPages;

  // Initial fetch from backend to enrich the pool
  useEffect(() => {
    let isMounted = true;

    async function fetchBackendCompanies() {
      try {
        const [searchRes, allRes] = await Promise.allSettled([
          companyService.searchCompanies('', 0, 50),
          companyService.getAllCompanies()
        ]);

        let backendList = [];
        if (allRes.status === 'fulfilled' && Array.isArray(allRes.value) && allRes.value.length > 0) {
          backendList = allRes.value;
        } else if (searchRes.status === 'fulfilled') {
          const val = searchRes.value;
          if (Array.isArray(val?.content)) {
            backendList = val.content;
          } else if (Array.isArray(val)) {
            backendList = val;
          }
        }

        if (isMounted) {
          const merged = mergeWithCurated(backendList);
          setAllCompanies(merged);
        }
      } catch (e) {
        console.warn('[Companies] Using curated pool fallback:', e);
      }
    }

    fetchBackendCompanies();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update displayed companies when search query or filtered pool changes
  useEffect(() => {
    setCurrentPage(0);
    setDisplayedCompanies(filteredPool.slice(0, PAGE_SIZE));
    isFetchingMoreRef.current = false;
  }, [filteredPool]);

  // Load next chunk of companies
  const loadNextPage = useCallback(() => {
    if (isFetchingMoreRef.current) return;
    if (currentPage + 1 >= totalPages) return;

    isFetchingMoreRef.current = true;
    setLoadingMore(true);

    // Smooth chunking transition
    setTimeout(() => {
      setCurrentPage(prevPage => {
        const nextPage = prevPage + 1;
        const nextBatch = filteredPool.slice(0, (nextPage + 1) * PAGE_SIZE);
        setDisplayedCompanies(nextBatch);
        isFetchingMoreRef.current = false;
        setLoadingMore(false);
        return nextPage;
      });
    }, 150);
  }, [currentPage, totalPages, filteredPool]);

  // Infinite scroll trigger via IntersectionObserver & Scroll Listener
  useEffect(() => {
    const mainEl = document.querySelector('main');

    // 1. Intersection Observer on sentinel
    let observer = null;
    if (sentinelRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0] && entries[0].isIntersecting) {
            loadNextPage();
          }
        },
        { 
          root: null, // Viewport
          rootMargin: '600px 0px 600px 0px',
          threshold: 0.01
        }
      );
      observer.observe(sentinelRef.current);
    }

    // 2. Scroll listener on <main>
    const handleScroll = () => {
      const targetEl = mainEl || document.documentElement;
      if (targetEl) {
        const bottomDistance = targetEl.scrollHeight - targetEl.scrollTop - targetEl.clientHeight;
        if (bottomDistance < 700) {
          loadNextPage();
        }
      }
    };

    // 3. Scroll listener on window
    const handleWindowScroll = () => {
      const doc = document.documentElement;
      if (doc) {
        const bottomDistance = doc.scrollHeight - (window.scrollY || window.pageYOffset || 0) - window.innerHeight;
        if (bottomDistance < 700) {
          loadNextPage();
        }
      }
    };

    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    return () => {
      if (observer) observer.disconnect();
      if (mainEl) mainEl.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, [loadNextPage, displayedCompanies.length]);

  return (
    <DashboardLayout activeTab="Companies">
      <div className="flex flex-col gap-12 max-w-[1200px] mx-auto w-full fade-in-up pb-16">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="display-font text-4xl">All Companies</h1>
          <p className="text-theme-muted text-sm">Explore interview experiences, ratings, and insights from top global and tech companies.</p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <iconify-icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted"></iconify-icon>
            <input 
              type="text" 
              placeholder="Search companies by name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11 py-2.5 text-sm"
            />
          </div>
          <div className="text-xs font-semibold text-theme-muted hidden sm:block">
            {filteredPool.length} {filteredPool.length === 1 ? 'Company' : 'Companies'}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-l border-t border-theme-border">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="p-4 border-r border-b border-theme-border"><SkeletonCompanyCard /></div>
            ))}
          </div>
        ) : displayedCompanies.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-theme-border rounded-sm gap-3">
            <iconify-icon icon="lucide:search-x" className="text-4xl text-theme-muted mb-2"></iconify-icon>
            <h3 className="display-font text-2xl text-theme-text">No companies found</h3>
            <p className="text-sm text-theme-muted">Try searching with another keyword or company name.</p>
          </div>
        ) : (
          /* Companies Grid */
          <div className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-l border-t border-theme-border">
              {displayedCompanies.map(company => (
                <CompanyCard key={company.id || company._id || company.name} company={company} />
              ))}
            </div>

            {/* Loading More Indicator Skeletons */}
            {loadingMore && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-l border-theme-border">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`more-${i}`} className="p-4 border-r border-b border-theme-border animate-pulse opacity-60">
                    <SkeletonCompanyCard />
                  </div>
                ))}
              </div>
            )}

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="h-20 w-full pointer-events-none" />

            {/* Manual Load More fallback button */}
            {hasMore && !loadingMore && (
              <div className="flex justify-center py-6">
                <button
                  onClick={loadNextPage}
                  className="px-6 py-2.5 rounded-sm border border-theme-border text-xs font-bold text-theme-text hover:bg-theme-hover transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <iconify-icon icon="lucide:arrow-down" className="text-sm"></iconify-icon>
                  Load More Companies ({displayedCompanies.length} of {filteredPool.length})
                </button>
              </div>
            )}

            {/* End of List Confirmation */}
            {!hasMore && displayedCompanies.length > 0 && (
              <div className="flex items-center justify-center py-10 text-xs font-semibold text-theme-muted border-t border-theme-border/40 mt-6 gap-2">
                <iconify-icon icon="lucide:check-circle" className="text-terracotta-500 text-sm"></iconify-icon>
                <span>Showing all {filteredPool.length} companies</span>
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
