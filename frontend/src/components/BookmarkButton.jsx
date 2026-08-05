import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { experienceService } from '../services/experienceService';

export default function BookmarkButton({
  experienceId,
  bookmarked: initialBookmarked = false,
  onBookmarkToggle,
  variant = 'compact', // 'compact' for list items, 'large' for details view sidebar
  className = ''
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const [triggerPop, setTriggerPop] = useState(false);

  // Sync state if props change externally
  useEffect(() => {
    setBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleBookmark = async (e) => {
    // Prevent navigating to details page when clicked inside a card
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const prevBookmarked = bookmarked;
    const nextBookmarked = !prevBookmarked;

    // Optimistic UI update
    setBookmarked(nextBookmarked);
    if (nextBookmarked) {
      setTriggerPop(true);
    }
    setLoading(true);

    try {
      if (nextBookmarked) {
        await experienceService.bookmarkExperience(experienceId);
      } else {
        await experienceService.unbookmarkExperience(experienceId);
      }

      if (onBookmarkToggle) {
        onBookmarkToggle(nextBookmarked);
      }
    } catch (err) {
      // Rollback to original state on error
      setBookmarked(prevBookmarked);

      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Action failed. Please try again.';
      toast.error(typeof errorMsg === 'string' ? errorMsg : 'Action failed. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setTriggerPop(false), 300);
    }
  };

  const renderBookmark = (sizeClass) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill={bookmarked ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`
        ${sizeClass} transition-all duration-300 select-none
        ${bookmarked ? 'text-theme-text' : 'text-theme-muted group-hover:text-theme-text'}
        ${triggerPop ? 'animate-bookmark-pop' : ''}
      `}
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
    </svg>
  );

  if (variant === 'large') {
    return (
      <button 
        onClick={handleBookmark}
        disabled={loading}
        className={`w-10 h-10 bg-theme-main hover:bg-theme-hover border border-theme-border rounded-sm flex items-center justify-center transition-all cursor-pointer ${
          loading ? 'cursor-not-allowed opacity-50' : ''
        } ${className}`}
        title={bookmarked ? "Remove Bookmark" : "Bookmark"}
      >
        {renderBookmark('w-4 h-4')}
      </button>
    );
  }

  // Compact layout (used inside cards/feeds next to Like/Comment)
  return (
    <button 
      onClick={handleBookmark}
      disabled={loading}
      className={`hover:text-theme-text transition-colors flex items-center justify-center cursor-pointer p-1 rounded-sm ${
        loading ? 'cursor-not-allowed opacity-50' : ''
      } ${className}`}
      title={bookmarked ? "Remove Bookmark" : "Bookmark"}
    >
      {renderBookmark('w-5 h-5')}
    </button>
  );
}
