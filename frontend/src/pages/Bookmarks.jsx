import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { experienceService } from '../services/experienceService';
import CompanyLogo from '../components/CompanyLogo';
import BookmarkButton from '../components/BookmarkButton';
import { SkeletonCard } from '../components/Skeleton';
import { toast } from 'react-hot-toast';
import requestCache from '../services/cache';

const getInitialBookmarks = (userKey) => {
  const directCached = requestCache.get(`user_bookmarks_list_${userKey}`);
  if (Array.isArray(directCached) && directCached.length > 0) {
    return directCached;
  }
  return [];
};

export default function Bookmarks() {
  const { user } = useAuth();
  const userKey = user?.id || user?.email || 'anon';
  const initialList = getInitialBookmarks(userKey);
  const [bookmarks, setBookmarks] = useState(initialList);
  const [loading, setLoading] = useState(() => initialList.length === 0);

  useEffect(() => {
    const currentKey = user?.id || user?.email || 'anon';
    const cached = requestCache.get(`user_bookmarks_list_${currentKey}`);
    if (Array.isArray(cached) && cached.length > 0) {
      setBookmarks(cached);
      setLoading(false);
    } else {
      setBookmarks([]);
      setLoading(true);
    }
    fetchBookmarks();
  }, [user?.id, user?.email]);

  const fetchBookmarks = async () => {
    try {
      if (bookmarks.length === 0 && !requestCache.get('user_bookmarks_list')) {
        setLoading(true);
      }
      const res = await experienceService.getMyBookmarks();
      const rawBookmarks = Array.isArray(res) ? res : [];
      
      const resolvedExperiences = [];
      
      if (rawBookmarks.length > 0) {
        const sample = rawBookmarks[0];
        
        // Case 1: The response items are the experiences themselves
        if (sample.company || sample.companyName || sample.role || sample.title) {
          resolvedExperiences.push(...rawBookmarks.map(item => ({ ...item, bookmarked: true })));
        }
        // Case 2: The response items contain a nested experience object
        else if (sample.experience) {
          resolvedExperiences.push(...rawBookmarks.map(item => ({
            ...item.experience,
            bookmarkId: item.id,
            bookmarked: true
          })));
        }
        // Case 3: The response items are bookmark relations containing experienceId
        else if (sample.experienceId) {
          const fetchPromises = rawBookmarks.map(async (b) => {
            try {
              const exp = await experienceService.getExperienceById(b.experienceId);
              return { ...exp, bookmarkId: b.id, bookmarked: true };
            } catch (err) {
              console.warn(`Failed to fetch experience details for bookmark ${b.id}:`, err);
              return null;
            }
          });
          const results = await Promise.all(fetchPromises);
          resolvedExperiences.push(...results.filter(Boolean));
        }
      }
      
      setBookmarks(resolvedExperiences);
      const currentKey = user?.id || user?.email || 'anon';
      requestCache.set(`user_bookmarks_list_${currentKey}`, resolvedExperiences, 180000);
    } catch (err) {
      console.error('[Bookmarks] Error fetching bookmarks:', err);
      if (bookmarks.length === 0) {
        toast.error('Failed to load bookmarks.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeTab="Bookmarks">
      <div className="flex flex-col gap-8 max-w-[1000px] mx-auto w-full fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">My Bookmarks</h1>
          <p className="text-theme-muted text-sm">All your saved interview experiences.</p>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="row-list-container">
              <div className="row-list-item"><SkeletonCard /></div>
              <div className="row-list-item"><SkeletonCard /></div>
              <div className="row-list-item"><SkeletonCard /></div>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-theme-border rounded-sm gap-3">
              <iconify-icon icon="lucide:bookmark" className="text-4xl text-theme-muted mb-2"></iconify-icon>
              <h3 className="display-font text-2xl text-theme-text">No bookmarks saved</h3>
              <p className="text-sm text-theme-muted font-medium">Bookmark interview experiences to save them here.</p>
            </div>
          ) : (
            bookmarks.map((exp, i) => {
              const expId = exp.id || exp._id;
              const isMongoId = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);
              const companyName = exp.company?.name || exp.companyName || (typeof exp.company === 'string' && !isMongoId(exp.company) ? exp.company : null) || 'Company';
              const companyIcon = exp.company?.logoUrl ? null : (exp.icon || 'google');
              const roleName = exp.role || exp.title || 'Software Engineer';
              const dateStr = exp.interviewDate || exp.date || 'Recent';
              const roundsCount = exp.interviewRounds?.length || exp.rounds || 1;
              const ratingVal = exp.company?.rating != null 
                ? Number(exp.company.rating).toFixed(1) 
                : (exp.companyRating != null 
                    ? Number(exp.companyRating).toFixed(1) 
                    : (exp.rating != null ? Number(exp.rating).toFixed(1) : '4.0'));

              return (
                <div 
                  key={expId || i}
                  onClick={() => window.location.hash = `#/experience/${expId}`}
                  className="premium-card flex flex-col sm:flex-row sm:items-center justify-between hover:border-theme-border-inverted transition-all cursor-pointer group gap-4"
                >
                  <div className="flex items-center gap-5">
                    <CompanyLogo 
                      company={exp.company}
                      logoUrl={exp.company?.logoUrl} 
                      name={companyName} 
                      icon={companyIcon} 
                      color={exp.color} 
                      className="w-14 h-14 rounded-sm bg-theme-main flex items-center justify-center border border-theme-border flex-shrink-0"
                      iconClassName="text-3xl"
                    />
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-base group-hover:text-theme-text transition-colors">{companyName}</h3>
                      <span className="text-theme-muted text-sm font-medium">{roleName}</span>
                      <div className="flex items-center gap-2 text-[11px] text-theme-muted mt-1">
                        <span>Interview Date: {dateStr}</span>
                        <span>•</span>
                        <span>{roundsCount} Rounds</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                      <iconify-icon icon="lucide:star" className="fill-current"></iconify-icon>
                      {ratingVal}
                    </div>
                    <BookmarkButton 
                      experienceId={expId}
                      bookmarked={exp.bookmarked}
                      onBookmarkToggle={(newBookmarked) => {
                        if (!newBookmarked) {
                          // Immediately remove from list without refreshing
                          setBookmarks(prev => prev.filter(item => String(item.id || item._id) !== String(expId)));
                        }
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
