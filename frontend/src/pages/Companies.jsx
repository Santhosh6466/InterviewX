import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import companyService from '../services/companyService';
import { SkeletonCompanyCard } from '../components/Skeleton';
import CompanyLogo from '../components/CompanyLogo';
import requestCache from '../services/cache';

const PAGE_SIZE = 16;

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
  const [allCompaniesPool, setAllCompaniesPool] = useState([]);
  const [displayedCompanies, setDisplayedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Sync ref for event handlers & observer
  const stateRef = useRef({ page, totalPages, loading, loadingMore, searchQuery, allCompaniesPool });
  useEffect(() => {
    stateRef.current = { page, totalPages, loading, loadingMore, searchQuery, allCompaniesPool };
  }, [page, totalPages, loading, loadingMore, searchQuery, allCompaniesPool]);

  // Master fetch function supporting both server pagination and full pool chunking
  const loadPageData = useCallback(async (query, targetPage, isFresh = false) => {
    if (isFetchingRef.current && !isFresh) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      isFetchingRef.current = true;
      if (isFresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');

      // 1. Try paginated search
      let searchRes = null;
      try {
        searchRes = await companyService.searchCompanies(
          query,
          targetPage,
          PAGE_SIZE,
          abortControllerRef.current.signal
        );
      } catch (e) {
        if (e.name === 'CanceledError' || e.name === 'AbortError' || e.code === 'ERR_CANCELED') return;
      }

      // If search returned multiple pages or matching content
      if (searchRes && Array.isArray(searchRes.content) && searchRes.content.length > 0) {
        const newItems = searchRes.content;
        const totalP = searchRes.totalPages || Math.ceil((searchRes.totalElements || newItems.length) / PAGE_SIZE);
        const totalE = searchRes.totalElements || newItems.length;

        // If backend total is 24 or 1 page, also fetch full pool in background to enable infinite scrolling of more companies
        if (totalP <= 1 && (!query || query.trim() === '')) {
          try {
            const allRes = await companyService.getAllCompanies();
            if (Array.isArray(allRes) && allRes.length > newItems.length) {
              setAllCompaniesPool(allRes);
              const computedPages = Math.ceil(allRes.length / PAGE_SIZE);
              setTotalPages(computedPages);
              setTotalElements(allRes.length);
              setPage(0);
              setDisplayedCompanies(allRes.slice(0, PAGE_SIZE));
              return;
            }
          } catch (_) {}
        }

        setTotalPages(totalP);
        setTotalElements(totalE);
        setPage(targetPage);

        if (isFresh || targetPage === 0) {
          setDisplayedCompanies(newItems);
        } else {
          setDisplayedCompanies(prev => {
            const seen = new Set(prev.map(c => String(c.id || c._id || c.name)));
            const unique = newItems.filter(c => !seen.has(String(c.id || c._id || c.name)));
            return [...prev, ...unique];
          });
        }
        return;
      }

      // 2. Fallback: If search returned plain array or pool mode
      if (Array.isArray(searchRes) && searchRes.length > 0) {
        const totalP = Math.ceil(searchRes.length / PAGE_SIZE);
        setAllCompaniesPool(searchRes);
        setTotalPages(totalP);
        setTotalElements(searchRes.length);
        setPage(targetPage);

        const sliced = searchRes.slice(0, (targetPage + 1) * PAGE_SIZE);
        setDisplayedCompanies(sliced);
        return;
      }

      // 3. Fallback: Query all companies if search was empty or failed
      const allRes = await companyService.getAllCompanies();
      if (Array.isArray(allRes) && allRes.length > 0) {
        let filtered = allRes;
        if (query && query.trim() !== '') {
          const q = query.trim().toLowerCase();
          filtered = allRes.filter(c => c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
        }

        setAllCompaniesPool(filtered);
        const totalP = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        setTotalPages(totalP);
        setTotalElements(filtered.length);
        setPage(targetPage);

        const sliced = filtered.slice(0, (targetPage + 1) * PAGE_SIZE);
        setDisplayedCompanies(sliced);
        return;
      }

      // Empty result
      setDisplayedCompanies([]);
      setTotalPages(1);
      setTotalElements(0);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }
      console.warn('[Companies] Error fetching companies:', err);
      if (isFresh) {
        setError(err.response?.data?.message || 'Failed to load companies');
        setDisplayedCompanies([]);
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load & search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadPageData(searchQuery, 0, true);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, loadPageData]);

  // Load next page trigger
  const triggerNextPage = useCallback(() => {
    const { page: currPage, totalPages: maxPages, loading: isLoading, loadingMore: isLoadingMore, searchQuery: currentQuery, allCompaniesPool: pool } = stateRef.current;
    
    if (isLoading || isLoadingMore || isFetchingRef.current) return;
    if (currPage + 1 >= maxPages) return;

    // If we have a cached pool of all companies, slice next batch instantly
    if (pool && pool.length > 0) {
      const nextPage = currPage + 1;
      const nextBatch = pool.slice(0, (nextPage + 1) * PAGE_SIZE);
      setPage(nextPage);
      setDisplayedCompanies(nextBatch);
      return;
    }

    // Otherwise fetch next page from server
    loadPageData(currentQuery, currPage + 1, false);
  }, [loadPageData]);

  // Auto-fill tall viewports
  useEffect(() => {
    if (!loading && !loadingMore && page + 1 < totalPages) {
      const mainEl = document.querySelector('main');
      if (mainEl && mainEl.scrollHeight <= mainEl.clientHeight + 200) {
        triggerNextPage();
      }
    }
  }, [displayedCompanies.length, loading, loadingMore, page, totalPages, triggerNextPage]);

  // Infinite scroll observer & scroll event listeners
  useEffect(() => {
    const mainEl = document.querySelector('main');

    // 1. Intersection Observer
    let observer = null;
    if (sentinelRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0] && entries[0].isIntersecting) {
            triggerNextPage();
          }
        },
        { 
          root: null, // Viewport intersection guarantees trigger on all scroll containers
          rootMargin: '600px 0px 600px 0px',
          threshold: 0.01
        }
      );
      observer.observe(sentinelRef.current);
    }

    // 2. Scroll listener on <main> container
    const handleMainScroll = () => {
      if (mainEl && mainEl.scrollHeight) {
        const bottomDistance = mainEl.scrollHeight - mainEl.scrollTop - mainEl.clientHeight;
        if (bottomDistance < 700) {
          triggerNextPage();
        }
      }
    };

    // 3. Scroll listener on window
    const handleWindowScroll = () => {
      const doc = document.documentElement;
      if (doc && doc.scrollHeight) {
        const bottomDistance = doc.scrollHeight - (window.scrollY || window.pageYOffset || 0) - window.innerHeight;
        if (bottomDistance < 700) {
          triggerNextPage();
        }
      }
    };

    if (mainEl) {
      mainEl.addEventListener('scroll', handleMainScroll, { passive: true });
    }
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    return () => {
      if (observer) observer.disconnect();
      if (mainEl) mainEl.removeEventListener('scroll', handleMainScroll);
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, [triggerNextPage, displayedCompanies.length]);

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
          <p className="text-theme-muted text-sm">Explore interview experiences and insights from top companies worldwide.</p>
        </div>

        {/* Search Bar */}
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

        {/* Initial Loading Skeleton */}
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
              onClick={() => loadPageData(searchQuery, 0, true)}
              className="btn-primary px-6 py-3 rounded-sm mt-4 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : displayedCompanies.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-theme-border rounded-sm gap-3">
            <iconify-icon icon="lucide:search-x" className="text-4xl text-theme-muted mb-2"></iconify-icon>
            <h3 className="display-font text-2xl text-theme-text">No companies found</h3>
            <p className="text-sm text-theme-muted">Try searching with another company name.</p>
          </div>
        ) : (
          /* Companies Grid */
          <div className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-l border-t border-theme-border">
              {displayedCompanies.map(company => (
                <CompanyCard key={company.id || company._id || company.name} company={company} />
              ))}
            </div>

            {/* Smooth Loading More Skeletons */}
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
            <div ref={sentinelRef} className="h-14 w-full pointer-events-none" />

            {/* Load More Button fallback if more available */}
            {hasMore && !loadingMore && (
              <div className="flex justify-center py-6">
                <button
                  onClick={triggerNextPage}
                  className="px-6 py-2.5 rounded-sm border border-theme-border text-xs font-bold text-theme-text hover:bg-theme-hover transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <iconify-icon icon="lucide:arrow-down" className="text-sm"></iconify-icon>
                  Load More Companies ({displayedCompanies.length} of {totalElements})
                </button>
              </div>
            )}

            {/* End of results indicator */}
            {!loadingMore && !hasMore && displayedCompanies.length > 0 && (
              <div className="flex items-center justify-center py-10 text-xs font-semibold text-theme-muted border-t border-theme-border/40 mt-4 gap-2">
                <iconify-icon icon="lucide:check-circle" className="text-terracotta-500 text-sm"></iconify-icon>
                <span>Showing all {totalElements || displayedCompanies.length} companies</span>
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
