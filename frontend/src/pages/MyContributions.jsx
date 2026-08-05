import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import experienceService from '../services/experienceService';
import ExperienceRow from '../components/ExperienceRow';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { toast } from 'react-hot-toast';
import requestCache from '../services/cache';

const getInitialContributions = (user) => {
  const userKey = user?.id || user?.email || 'anon';
  const directCached = requestCache.get(`user_my_experiences_${userKey}`);
  if (Array.isArray(directCached) && directCached.length > 0) {
    return directCached;
  }
  return [];
};

export default function MyContributions() {
  const { user } = useAuth();
  const initialList = getInitialContributions(user);
  const [experiences, setExperiences] = useState(initialList);
  const [loading, setLoading] = useState(() => initialList.length === 0);
  
  // Deletion modal state
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const userKey = user?.id || user?.email || 'anon';
    const cached = requestCache.get(`user_my_experiences_${userKey}`);
    if (Array.isArray(cached) && cached.length > 0) {
      setExperiences(cached);
      setLoading(false);
    } else {
      setExperiences([]);
      setLoading(true);
    }
    fetchUserExperiences();
  }, [user?.id, user?.email]);

  const fetchUserExperiences = async () => {
    const userKey = user?.id || user?.email || 'anon';
    try {
      if (experiences.length === 0 && !requestCache.get(`user_my_experiences_${userKey}`)) {
        setLoading(true);
      }
      
      const [expResult, bookmarksResult] = await Promise.allSettled([
        experienceService.getUserExperiences(),
        experienceService.getMyBookmarks()
      ]);

      let bookmarkIds = new Set();
      if (bookmarksResult.status === 'fulfilled' && Array.isArray(bookmarksResult.value)) {
        bookmarkIds = new Set(bookmarksResult.value.map(b => String(b.experienceId || b.id)));
      }

      if (expResult.status === 'fulfilled' && expResult.value) {
        const raw = expResult.value;
        const list = Array.isArray(raw) ? raw : (raw.content || raw.experiences || []);
        
        let processedMyExps = list;
        // If coming from global fallback endpoint, filter by user
        if (user && list.length > 0 && !Array.isArray(raw)) {
          const userIdStr = String(user.id || user._id || '').toLowerCase();
          const userEmailStr = String(user.email || '').toLowerCase();
          const userNameStr = String(user.name || user.username || '').toLowerCase();

          processedMyExps = list.filter(exp => {
            const expUserId = String(exp.userId || exp.user?.id || exp.user?._id || exp.authorId || '').toLowerCase();
            const expEmail = String(exp.userEmail || exp.user?.email || exp.email || '').toLowerCase();
            const expAuthor = String(exp.authorName || exp.userName || exp.user?.name || exp.createdByName || '').toLowerCase();

            return (
              (userIdStr && expUserId && expUserId === userIdStr) ||
              (userEmailStr && expEmail && expEmail === userEmailStr) ||
              (userNameStr && expAuthor && expAuthor === userNameStr)
            );
          });
        }

        const formatted = processedMyExps.map(exp => ({
          ...exp,
          bookmarked: bookmarkIds.has(String(exp.id || exp._id))
        }));

        setExperiences(formatted);
        requestCache.set(`user_my_experiences_${userKey}`, formatted, 180000);
      }
    } catch (err) {
      console.warn('[MyContributions] Error fetching user experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperience = async () => {
    if (!selectedDeleteId) return;
    try {
      setDeleting(true);
      await experienceService.deleteExperience(selectedDeleteId);
      toast.success('Experience deleted successfully');
      setExperiences(prev => prev.filter(e => String(e.id || e._id) !== String(selectedDeleteId)));
      setSelectedDeleteId(null);
    } catch (err) {
      console.error('[MyContributions] Error deleting experience:', err);
      toast.error(err.response?.data?.message || 'Failed to delete experience');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout activeTab="My Contributions">
      <div className="flex flex-col gap-8 max-w-[1000px] mx-auto w-full fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">My Contributions</h1>
          <p className="text-theme-muted text-sm">Review and manage the interview experiences you've shared.</p>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="row-list-container">
              <div className="row-list-item"><SkeletonCard /></div>
              <div className="row-list-item"><SkeletonCard /></div>
              <div className="row-list-item"><SkeletonCard /></div>
            </div>
          ) : experiences.length === 0 ? (
            <EmptyState 
              icon="lucide:file-text" 
              title="No contributions yet"
              description="You haven't shared any interview experiences yet. Help others by sharing yours!"
            />
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
                  onDelete={(id) => setSelectedDeleteId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal 
        isOpen={!!selectedDeleteId}
        onClose={() => setSelectedDeleteId(null)}
        onConfirm={handleDeleteExperience}
        isLoading={deleting}
        title="Delete Experience"
        message="Are you sure you want to delete this experience? This action cannot be undone."
      />
    </DashboardLayout>
  );
}
