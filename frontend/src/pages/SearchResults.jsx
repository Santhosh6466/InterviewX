import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import experienceService from '../services/experienceService';
import companyService from '../services/companyService';
import { SkeletonCard } from '../components/Skeleton';
import { InterviewTypes, ExperienceLevels, InterviewResults, Difficulties } from '../constants/enums';
import ExperienceRow from '../components/ExperienceRow';
import EmptyState from '../components/EmptyState';

export default function SearchResults() {
  const [experiences, setExperiences] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedResult, setSelectedResult] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Ref for user's bookmarked experience IDs
  const bookmarkIdsRef = useRef(new Set());

  // Controller ref for Axios request cancellation
  const abortControllerRef = useRef(null);

  const hasActiveQuery = Boolean(
    search.trim() ||
    selectedCompany ||
    selectedLevel ||
    selectedType ||
    selectedResult ||
    selectedDifficulty
  );

  // Load companies and user bookmarks on initial mount
  useEffect(() => {
    companyService.getAllCompanies()
      .then(res => {
        if (Array.isArray(res)) {
          setCompanies(res);
        } else if (res && Array.isArray(res.content)) {
          setCompanies(res.content);
        }
      })
      .catch(err => console.warn('[SearchResults] Error fetching companies:', err));

    experienceService.getMyBookmarks()
      .then(res => {
        if (Array.isArray(res)) {
          bookmarkIdsRef.current = new Set(res.map(b => String(b.experienceId || b.id)));
        }
      })
      .catch(err => console.warn('[SearchResults] Error fetching bookmarks:', err));
  }, []);

  // Debounced search & filter fetch (400ms debounce) - only when there is an active search or filter
  useEffect(() => {
    if (!hasActiveQuery) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setExperiences([]);
      setTotalPages(1);
      setTotalElements(0);
      setLoading(false);
      setError('');
      return;
    }

    const timer = setTimeout(() => {
      fetchExperiences(search, selectedCompany, selectedLevel, selectedType, selectedResult, selectedDifficulty, page);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search, selectedCompany, selectedLevel, selectedType, selectedResult, selectedDifficulty, page, hasActiveQuery]);

  const fetchExperiences = async (
    currentSearch,
    currentCompany,
    currentLevel,
    currentType,
    currentResult,
    currentDifficulty,
    currentPage
  ) => {
    // Cancel any previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError('');

      const res = await experienceService.getAllExperiences(
        {
          search: currentSearch,
          companyId: currentCompany,
          experienceLevel: currentLevel,
          interviewType: currentType,
          result: currentResult,
          difficulty: currentDifficulty,
          page: currentPage,
          size: 10
        },
        abortControllerRef.current.signal
      );

      let list = [];
      let totalP = 1;
      let totalE = 0;

      if (res && Array.isArray(res.content)) {
        list = res.content;
        totalP = res.totalPages ?? 1;
        totalE = res.totalElements ?? res.content.length;
      } else if (Array.isArray(res)) {
        list = res;
        totalP = 1;
        totalE = res.length;
      } else if (res && Array.isArray(res.experiences)) {
        list = res.experiences;
        totalP = res.totalPages ?? 1;
        totalE = res.totalElements ?? res.experiences.length;
      }

      const processedList = list.map(exp => ({
        ...exp,
        bookmarked: bookmarkIdsRef.current.has(String(exp.id || exp._id))
      }));

      setExperiences(processedList);
      setTotalPages(totalP);
      setTotalElements(totalE);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }
      console.warn('[SearchResults] No results or error fetching experiences:', err);
      // Treat invalid queries, 404s, or empty backend responses as 0 matches without red error box
      setExperiences([]);
      setTotalPages(1);
      setTotalElements(0);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
    setPage(0);
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
    setPage(0);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setPage(0);
  };

  const handleResultChange = (e) => {
    setSelectedResult(e.target.value);
    setPage(0);
  };

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCompany('');
    setSelectedLevel('');
    setSelectedType('');
    setSelectedResult('');
    setSelectedDifficulty('');
    setPage(0);
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <DashboardLayout activeTab="Experiences" searchValue={search} onSearchChange={handleSearchChange}>
      <div className="flex flex-col gap-16 max-w-[1200px] mx-auto w-full fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="display-font text-4xl">Search Results</h1>
          <p className="text-theme-muted text-sm">
            {hasActiveQuery 
              ? `${totalElements} ${totalElements === 1 ? 'experience' : 'experiences'} found.`
              : 'Search by keywords, companies, or refine using filters.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-theme-border">
          {['All', 'Companies', 'Roles', 'Topics', 'Users'].map((tab, i) => (
            <button key={tab} className={`pb-4 text-sm font-bold border-b-2 transition-all ${
              i === 0 ? 'border-theme-inverted text-theme-text' : 'border-transparent text-theme-muted hover:text-theme-muted'
            }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content (Results) */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Experiences</h2>
            </div>

            {!hasActiveQuery ? (
              <EmptyState 
                icon="lucide:search" 
                title="Search Experiences"
                description="Type keywords in the search bar or select filters to discover interview experiences."
              />
            ) : loading ? (
              <div className="row-list-container">
                <div className="row-list-item"><SkeletonCard /></div>
                <div className="row-list-item"><SkeletonCard /></div>
                <div className="row-list-item"><SkeletonCard /></div>
              </div>
            ) : experiences.length === 0 ? (
              <EmptyState 
                icon="lucide:search-x" 
                title="No matches found"
                description="No interview experiences match your search. Try different keywords or adjust your filters."
              >
                <button onClick={handleClearFilters} className="btn-primary">
                  Clear all filters
                </button>
              </EmptyState>
            ) : (
              <>
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
                        if (newBookmarked) {
                          bookmarkIdsRef.current.add(String(expId));
                        } else {
                          bookmarkIdsRef.current.delete(String(expId));
                        }
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

                {/* Pagination Bar */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-theme-border pt-6 mt-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 0}
                      className="flex items-center gap-2 px-4 py-2 premium-card text-xs font-bold text-theme-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-theme-hover transition-colors"
                    >
                      <iconify-icon icon="lucide:chevron-left"></iconify-icon> Previous
                    </button>

                    <span className="text-xs font-bold text-theme-muted">
                      Showing {experiences.length} of {totalElements || 0} Experiences
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={page >= totalPages - 1}
                      className="flex items-center gap-2 px-4 py-2 premium-card text-xs font-bold text-theme-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-theme-hover transition-colors"
                    >
                      Next <iconify-icon icon="lucide:chevron-right"></iconify-icon>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar (Filters) */}
          <div className="hidden lg:flex flex-col w-[300px] flex-shrink-0 gap-6">
            <div className="premium-card flex flex-col gap-6 sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-theme-border">
                <h3 className="font-bold text-sm">Refine Search</h3>
                <button onClick={handleClearFilters} className="text-xs text-theme-muted hover:text-theme-text transition-colors cursor-pointer">Clear</button>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">Company</label>
                  <select 
                    value={selectedCompany}
                    onChange={handleCompanyChange}
                    className="input-field"
                  >
                    <option value="">Select company</option>
                    {companies.map(c => (
                      <option key={c.id || c._id || c.name} value={c.id || c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">Experience Level</label>
                  <select 
                    value={selectedLevel}
                    onChange={handleLevelChange}
                    className="input-field"
                  >
                    <option value="">Select level</option>
                    {ExperienceLevels.map((lvl) => (
                      <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">Interview Type</label>
                  <select 
                    value={selectedType}
                    onChange={handleTypeChange}
                    className="input-field"
                  >
                    <option value="">Select type</option>
                    {InterviewTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">Result</label>
                  <select 
                    value={selectedResult}
                    onChange={handleResultChange}
                    className="input-field"
                  >
                    <option value="">Select result</option>
                    {InterviewResults.map((res) => (
                      <option key={res.value} value={res.value}>{res.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">Difficulty</label>
                  <select 
                    value={selectedDifficulty}
                    onChange={handleDifficultyChange}
                    className="input-field"
                  >
                    <option value="">Select difficulty</option>
                    {Difficulties.map((diff) => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
