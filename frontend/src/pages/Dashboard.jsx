import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import companyService from '../services/companyService';
import experienceService from '../services/experienceService';
import { SkeletonCard, SkeletonCompanyCard } from '../components/Skeleton';
import { getInterviewResultLabel, getStatusBadgeClass } from '../constants/enums';
import CompanyLogo from '../components/CompanyLogo';
import LikeButton from '../components/LikeButton';
import BookmarkButton from '../components/BookmarkButton';
import commentService from '../services/commentService';
import StatusChip from '../components/StatusChip';
import AttributePill from '../components/AttributePill';
import DifficultyIndicator from '../components/DifficultyIndicator';

const DEFAULT_TRENDING = [
  { name: 'Google', icon: 'google', exp: 324, rating: 4.4, color: '#4285F4' },
  { name: 'Amazon', icon: 'amazon', exp: 289, rating: 4.2, color: '#FF9900' },
  { name: 'Microsoft', icon: 'microsoft', exp: 215, rating: 4.3, color: '#00A4EF' }
];

const DEFAULT_EXPERIENCES = [
  {
    id: 1,
    company: 'Google',
    icon: 'google',
    color: '#4285F4',
    role: 'Software Engineer Intern',
    date: '10 Jun 2024',
    rounds: 4,
    tags: ['OA', 'Technical 1', 'Technical 2', 'HR'],
    status: 'Selected',
    likes: 143,
    comments: 32,
    timeAgo: '2 days ago'
  },
  {
    id: 2,
    company: 'Amazon',
    icon: 'amazon',
    color: '#FF9900',
    role: 'SDE Intern',
    date: '8 Jun 2024',
    rounds: 3,
    tags: ['OA', 'Technical', 'HR'],
    status: 'Rejected',
    likes: 98,
    comments: 21,
    timeAgo: '3 days ago'
  },
  {
    id: 3,
    company: 'Microsoft',
    icon: 'microsoft',
    color: '#00A4EF',
    role: 'Backend Engineer',
    date: '5 Jun 2024',
    rounds: 4,
    tags: ['OA', 'Technical 1', 'Technical 2', 'HR'],
    status: 'Selected',
    likes: 87,
    comments: 18,
    timeAgo: '5 days ago'
  }
];

const getRoundIcon = (tag) => {
  const t = tag.toLowerCase();
  if (t.includes('oa') || t.includes('online') || t.includes('assessment') || t.includes('written') || t.includes('test')) {
    return 'lucide:clipboard-check';
  }
  if (t.includes('tech') || t.includes('coding') || t.includes('system') || t.includes('design')) {
    return 'lucide:code';
  }
  if (t.includes('hr') || t.includes('behavior') || t.includes('manager') || t.includes('fit') || t.includes('personal')) {
    return 'lucide:user-check';
  }
  return 'lucide:file-text';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    // Fetch companies
    try {
      setLoadingCompanies(true);
      const companyData = await companyService.getAllCompanies();
      if (Array.isArray(companyData)) {
        // Filter out companies with 0 experiences
        const withExperiences = companyData.filter(c => (c.interviews ?? c.exp ?? c.experienceCount ?? 0) > 0);
        if (withExperiences.length > 0) {
          setCompanies(withExperiences.slice(0, 6));
        } else {
          setCompanies(companyData.slice(0, 6));
        }
      } else {
        setCompanies(DEFAULT_TRENDING);
      }
    } catch (err) {
      console.warn('[Dashboard] Error fetching companies:', err);
      setCompanies(DEFAULT_TRENDING);
    } finally {
      setLoadingCompanies(false);
    }

    // Fetch experiences
    try {
      setLoadingExperiences(true);
      
      let bookmarkIds = new Set();
      try {
        const bookmarks = await experienceService.getMyBookmarks();
        const bList = Array.isArray(bookmarks) ? bookmarks : [];
        bookmarkIds = new Set(bList.map(b => String(b.experienceId || b.id)));
      } catch (bookmarkErr) {
        console.warn('[Dashboard] Error fetching bookmarks:', bookmarkErr);
      }

      const expData = await experienceService.getAllExperiences(page, 10);
      const list = Array.isArray(expData) ? expData : (expData?.content || expData?.experiences || []);
      
      const processedList = await Promise.all(list.map(async (exp) => {
        let commentsCount = 0;
        try {
          const comments = await commentService.getComments(exp.id || exp._id);
          commentsCount = Array.isArray(comments) ? comments.length : 0;
        } catch (commentErr) {
          console.warn(`Failed to fetch comments for experience ${exp.id}:`, commentErr);
        }
        return {
          ...exp,
          bookmarked: bookmarkIds.has(String(exp.id || exp._id)),
          comments: commentsCount
        };
      }));

      setExperiences(processedList);
    } catch (err) {
      console.warn('[Dashboard] Error fetching experiences:', err);
      setExperiences(DEFAULT_EXPERIENCES);
    } finally {
      setLoadingExperiences(false);
    }
  };

  return (
    <DashboardLayout activeTab="Home">
      {/* Content Wrapper */}
      <div className="flex flex-col xl:flex-row gap-8 max-w-[1600px] mx-auto w-full">

        {/* Center Column */}
        <div className="flex-1 flex flex-col gap-16">
          {/* Greeting */}
          <div className="flex flex-col gap-2">
            <h1 className="display-font text-4xl">
              Welcome back, {user?.name || 'Guest'} <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-theme-muted text-sm">Find and explore real interview experiences from top companies.</p>
          </div>

          {/* Trending Companies */}
          <div className="flex flex-col gap-4">
            {(() => {
              const hasRealTrending = companies.some(c => (c.interviews ?? c.exp ?? c.experienceCount ?? 0) > 0);
              return (
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">{hasRealTrending ? "Trending Companies" : "Explore Companies"}</h2>
                  <a href="#/companies" className="text-sm font-bold gold-text-link">View all</a>
                </div>
              );
            })()}
            {loadingCompanies ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-theme-border">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-4 border-r border-b border-theme-border"><SkeletonCompanyCard /></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-theme-border">
                {companies.map((company, index) => {
                  const companyName = company.name || 'Company';
                  const companyId = company.id || company._id || companyName.toLowerCase();
                  const icon = company.icon || companyName.toLowerCase();
                  const expCount = company.interviews ?? company.exp ?? company.experienceCount ?? 0;
                  const rating = company.rating != null ? parseFloat(company.rating) : 0.0;

                  const getRatingBadgeClass = (r) => {
                    if (r >= 4.0) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                    if (r >= 3.0) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                  };

                  return (
                    <a 
                      key={company.id || company._id || companyName} 
                      href={`#/company/${companyId}`}
                      className="p-4 border-r border-b border-theme-border hover:bg-theme-hover flex items-center gap-4 cursor-pointer group transition-colors"
                    >
                      <CompanyLogo 
                        company={company}
                        logoUrl={company.logoUrl} 
                        name={companyName} 
                        icon={icon} 
                        color={company.color} 
                        className="w-12 h-12 rounded-sm bg-theme-main border border-theme-border flex items-center justify-center flex-shrink-0"
                        iconClassName="text-xl"
                      />
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <span className="font-bold text-sm group-hover:text-theme-text transition-colors truncate">{companyName}</span>
                        <div className="flex items-center gap-2">
                          {expCount > 0 && (
                            <span className="text-[10px] text-theme-muted">
                              {expCount} {expCount === 1 ? 'Exp' : 'Exps'}
                            </span>
                          )}
                          {expCount > 0 && (
                            <>
                              <span className="text-[10px] text-theme-muted">•</span>
                              <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                                <iconify-icon icon="bi:star-fill" className="text-[9px]"></iconify-icon>
                                <span>{rating.toFixed(1)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* View Company icon */}
                      <iconify-icon icon="lucide:chevron-right" className="text-theme-muted group-hover:text-theme-text transition-colors text-lg flex-shrink-0"></iconify-icon>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Latest Experiences */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">Latest Interview Experiences</h2>
              <a href="#/companies" className="text-sm font-bold gold-text-link">View all</a>
            </div>

            {loadingExperiences ? (
              <div className="row-list-container">
                <div className="row-list-item"><SkeletonCard /></div>
                <div className="row-list-item"><SkeletonCard /></div>
                <div className="row-list-item"><SkeletonCard /></div>
              </div>
            ) : experiences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-y border-theme-border gap-3">
                <iconify-icon icon="lucide:file-text" className="text-4xl text-theme-muted mb-2"></iconify-icon>
                <h3 className="display-font text-2xl text-theme-text">No experiences available</h3>
                <p className="text-sm text-theme-muted">Be the first to share your interview experience!</p>
                <a href="#/share" className="btn-primary px-6 py-3 rounded-sm mt-4">
                  Share Experience
                </a>
              </div>
            ) : (
              <div className="row-list-container">
                {experiences.map((exp, i) => {
                  const expId = exp.id || exp._id || i + 1;
                  const companyName = exp.company?.name || exp.companyName || exp.company || 'Company';
                  const companyIcon = exp.company?.logoUrl ? null : (exp.icon || 'google');
                  const roleName = exp.role || exp.title || 'Software Engineer';
                  const dateStr = exp.interviewDate || exp.date || 'Recent';
                  const roundsCount = exp.interviewRounds?.length || exp.rounds || 1;
                  const tags = exp.tags || (exp.interviewRounds ? exp.interviewRounds.map(r => r.title || r.roundType) : ['Technical', 'HR']);
                  const rawResult = String(exp.result || exp.status || 'SELECTED').toUpperCase();
                  const isSelected = rawResult === 'SELECTED';
                  const resultDisplay = getInterviewResultLabel(rawResult);

                  return (
                    <div 
                      key={expId} 
                      onClick={() => window.location.hash = `#/experience/${expId}`}
                      className="row-list-item flex flex-col sm:flex-row gap-5 cursor-pointer group"
                    >
                      <CompanyLogo 
                        company={exp.company}
                        logoUrl={exp.company?.logoUrl} 
                        name={companyName} 
                        icon={companyIcon} 
                        color={exp.color} 
                        className="w-14 h-14 rounded-sm bg-theme-main border border-theme-border flex items-center justify-center flex-shrink-0"
                        iconClassName="text-2xl"
                      />
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <h3 className="display-font font-bold text-lg leading-tight group-hover:text-theme-text transition-colors">{companyName}</h3>
                            <span className="text-theme-muted text-sm font-medium">{roleName}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <StatusChip result={rawResult} label={resultDisplay} />
                            <span className="text-[10px] text-theme-muted">{exp.timeAgo || 'Recent'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-theme-muted font-medium">
                          <span>Interview Date: {dateStr}</span>
                          <span>•</span>
                          <span>{roundsCount} {roundsCount === 1 ? 'Round' : 'Rounds'}</span>
                          {exp.difficulty && (
                            <>
                              <span>•</span>
                              <DifficultyIndicator difficulty={exp.difficulty} />
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {tags.slice(0, 4).map((tag, idx) => (
                            <React.Fragment key={idx}>
                              <AttributePill icon={getRoundIcon(tag)} variant="subtle" className="text-[11px]">
                                {tag}
                              </AttributePill>
                              {idx < Math.min(tags.length, 4) - 1 && <iconify-icon icon="lucide:arrow-right" className="text-theme-muted text-xs"></iconify-icon>}
                            </React.Fragment>
                          ))}
                        </div>

                        <div className="flex items-center justify-end gap-5 mt-2 text-theme-muted" onClick={(e) => e.stopPropagation()}>
                          <LikeButton 
                            experienceId={expId}
                            liked={exp.liked}
                            likesCount={exp.likesCount !== undefined ? exp.likesCount : (exp.likes || 0)}
                            onLikeToggle={(newLiked, newLikesCount) => {
                              setExperiences(prev => prev.map(item => {
                                if (String(item.id || item._id) === String(expId)) {
                                  return { ...item, liked: newLiked, likesCount: newLikesCount };
                                }
                                return item;
                              }));
                            }}
                          />
                          <button className="flex items-center gap-1.5 hover:text-theme-text transition-colors text-xs font-medium">
                            <iconify-icon icon="lucide:message-square" className="text-base"></iconify-icon> {exp.comments || 0}
                          </button>
                          <BookmarkButton 
                            experienceId={expId}
                            bookmarked={exp.bookmarked}
                            onBookmarkToggle={(newBookmarked) => {
                              setExperiences(prev => prev.map(item => {
                                if (String(item.id || item._id) === String(expId)) {
                                  return { ...item, bookmarked: newBookmarked };
                                }
                                return item;
                              }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
