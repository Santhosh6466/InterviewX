import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import companyService from '../services/companyService';
import { SkeletonCompanyCard } from '../components/Skeleton';
import CompanyLogo from '../components/CompanyLogo';

function CompanyCard({ company }) {
  const companyId = company.id || company._id || company.name.toLowerCase();
  const interviewsCount = company.interviews ?? company.exp ?? company.experienceCount ?? 0;
  const rating = company.rating != null ? Number(company.rating).toFixed(1) : '0.0';

  const getCategory = () => {
    if (company.category) return company.category;
    if (company.description) {
      if (company.description.includes('|')) {
        return company.description.split('|')[0].trim();
      }
      return company.description.length > 40 ? company.description.substring(0, 40) + '...' : company.description;
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
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Controller ref for Axios request cancellation
  const abortControllerRef = useRef(null);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  // Track latest state for observer
  const stateRef = useRef({ page, totalPages, loading, loadingMore, searchQuery });
  useEffect(() => {
    stateRef.current = { page, totalPages, loading, loadingMore, searchQuery };
  }, [page, totalPages, loading, loadingMore, searchQuery]);

  // Initial load / search change
  useEffect(() => {
    setPage(0);
    setCompanies([]);
    fetchCompanies(searchQuery, 0, true);
  }, [searchQuery]);

  const fetchCompanies = async (query, targetPage, isFresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      if (isFresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');

      const res = await companyService.searchCompanies(
        query, 
        targetPage, 
        24, 
        abortControllerRef.current.signal
      );

      let newItems = [];
      let totalP = 1;
      let totalE = 0;

      if (res && Array.isArray(res.content)) {
        newItems = res.content;
        totalP = res.totalPages || 1;
        totalE = res.totalElements || res.content.length;
      } else if (Array.isArray(res)) {
        newItems = res;
        totalP = 1;
        totalE = res.length;
      }

      setTotalPages(totalP);
      setTotalElements(totalE);
      setPage(targetPage);

      if (isFresh) {
        setCompanies(newItems);
      } else {
        setCompanies(prev => {
          const existingIds = new Set(prev.map(c => String(c.id || c._id || c.name)));
          const uniqueNew = newItems.filter(c => !existingIds.has(String(c.id || c._id || c.name)));
          return [...prev, ...uniqueNew];
        });
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }
      console.warn('[Companies] Error searching companies:', err);
      if (isFresh) {
        setError(err.response?.data?.message || 'Failed to load companies');
        setCompanies([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Auto-fill viewport if content doesn't overflow yet
  useEffect(() => {
    if (!loading && !loadingMore && page + 1 < totalPages) {
      const mainEl = document.querySelector('main');
      if (mainEl && mainEl.scrollHeight <= mainEl.clientHeight + 100) {
        fetchCompanies(searchQuery, page + 1, false);
      }
    }
  }, [companies, loading, loadingMore, page, totalPages, searchQuery]);

  // Smooth infinite scroll with both IntersectionObserver and container scroll listener
  useEffect(() => {
    const mainEl = document.querySelector('main');

    const triggerNext = () => {
      const { page: currPage, totalPages: maxPages, loading: isLoading, loadingMore: isLoadingMore, searchQuery: currentQuery } = stateRef.current;
      if (!isLoading && !isLoadingMore && currPage + 1 < maxPages) {
        fetchCompanies(currentQuery, currPage + 1, false);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          triggerNext();
        }
      },
      { 
        root: mainEl || null,
        rootMargin: '400px'
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    const handleScroll = () => {
      const scrollEl = mainEl || document.documentElement;
      if (scrollEl && scrollEl.scrollHeight) {
        if (scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 400) {
          triggerNext();
        }
      }
    };

    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      if (mainEl) mainEl.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [companies.length]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const hasMore = page + 1 < totalPages;

  return (
    <DashboardLayout activeTab="Companies">
      <div className="flex flex-col gap-16 max-w-[1200px] mx-auto w-full fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="display-font text-4xl">All Companies</h1>
          <p className="text-theme-muted text-sm">Explore interview experiences and insights from top companies.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <iconify-icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted"></iconify-icon>
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="input-field pl-11"
            />
          </div>
        </div>

        {/* Initial Loading State: 16 Skeleton Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-l border-t border-theme-border">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="p-4 border-r border-b border-theme-border"><SkeletonCompanyCard /></div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-red-500/20 rounded-sm gap-3">
            <iconify-icon icon="lucide:alert-circle" className="text-4xl text-red-500 mb-2"></iconify-icon>
            <h3 className="display-font text-2xl text-red-500">Failed to load companies</h3>
            <p className="text-sm text-theme-muted max-w-md">{error}</p>
            <button 
              onClick={() => fetchCompanies(searchQuery, 0, true)}
              className="btn-primary px-6 py-3 rounded-sm mt-4"
            >
              Retry
            </button>
          </div>
        ) : companies.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-theme-border rounded-sm gap-3">
            <iconify-icon icon="lucide:search-x" className="text-4xl text-theme-muted mb-2"></iconify-icon>
            <h3 className="display-font text-2xl text-theme-text">No companies found</h3>
            <p className="text-sm text-theme-muted">Try another company name.</p>
          </div>
        ) : (
          /* Companies Grid */
          <div className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-l border-t border-theme-border">
              {companies.map(company => (
                <CompanyCard key={company.id || company._id || company.name} company={company} />
              ))}
            </div>

            {/* Smooth Loading More Skeleton / Spinner */}
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
            <div ref={sentinelRef} className="h-10 w-full pointer-events-none" />

            {/* Load More Button fallback if more available */}
            {hasMore && !loadingMore && (
              <div className="flex justify-center py-6">
                <button
                  onClick={() => fetchCompanies(searchQuery, page + 1, false)}
                  className="px-6 py-2.5 rounded-sm border border-theme-border text-xs font-bold text-theme-text hover:bg-theme-hover transition-colors flex items-center gap-2"
                >
                  <iconify-icon icon="lucide:arrow-down" className="text-sm"></iconify-icon>
                  Load More Companies
                </button>
              </div>
            )}

            {/* End of results indicator */}
            {!loadingMore && !hasMore && companies.length > 0 && (
              <div className="flex items-center justify-center py-10 text-xs font-semibold text-theme-muted border-t border-theme-border/40 mt-4 gap-2">
                <iconify-icon icon="lucide:check-circle" className="text-terracotta-500 text-sm"></iconify-icon>
                <span>Showing all {totalElements || companies.length} companies</span>
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
