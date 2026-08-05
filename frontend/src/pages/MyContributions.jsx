import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import experienceService from '../services/experienceService';
import ExperienceRow from '../components/ExperienceRow';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { toast } from 'react-hot-toast';

export default function MyContributions() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Deletion modal state
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUserExperiences();
  }, [user]);

  const fetchUserExperiences = async () => {
    try {
      setLoading(true);
      
      let bookmarkIds = new Set();
      try {
        const bookmarksRes = await experienceService.getMyBookmarks();
        const bList = Array.isArray(bookmarksRes) ? bookmarksRes : [];
        bookmarkIds = new Set(bList.map(b => String(b.experienceId || b.id)));
      } catch (bookmarkErr) {
        console.warn('[MyContributions] Error fetching bookmarks:', bookmarkErr);
      }

      let data;
      try {
        data = await experienceService.getUserExperiences(user?.id);
      } catch {
        data = await experienceService.getAllExperiences(0, 100);
      }
      
      const list = Array.isArray(data) ? data : (data?.content || data?.experiences || []);
      
      if (user) {
        const userIdStr = String(user.id || user._id || '').toLowerCase();
        const userEmailStr = String(user.email || '').toLowerCase();
        const userNameStr = String(user.name || user.username || '').toLowerCase();

        const myExperiences = list.filter(exp => {
          const expUserId = String(exp.userId || exp.user?.id || exp.user?._id || exp.authorId || '').toLowerCase();
          const expEmail = String(exp.userEmail || exp.user?.email || exp.email || '').toLowerCase();
          const expAuthor = String(exp.authorName || exp.userName || exp.user?.name || exp.createdByName || '').toLowerCase();

          return (
            (userIdStr && expUserId && expUserId === userIdStr) ||
            (userEmailStr && expEmail && expEmail === userEmailStr) ||
            (userNameStr && expAuthor && expAuthor === userNameStr)
          );
        });

        const processedMyExps = myExperiences.map(exp => ({
          ...exp,
          bookmarked: bookmarkIds.has(String(exp.id || exp._id))
        }));

        setExperiences(processedMyExps);
      } else {
        setExperiences([]);
      }
    } catch (err) {
      console.warn('[MyContributions] Error fetching user experiences:', err);
      setExperiences([]);
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
