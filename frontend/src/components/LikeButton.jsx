import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { experienceService } from '../services/experienceService';

export default function LikeButton({ 
  experienceId, 
  liked: initialLiked = false, 
  likesCount: initialLikesCount = 0, 
  onLikeToggle, 
  variant = 'compact', // 'compact' for card lists, 'large' for detailed sidebar views
  className = '' 
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);
  const [triggerPop, setTriggerPop] = useState(false);

  // Sync state if props change externally
  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    setLikesCount(initialLikesCount);
  }, [initialLikesCount]);

  const handleLike = async (e) => {
    // Prevent navigating to experience detail page when clicking heart on card list
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const prevLiked = liked;
    const prevLikesCount = likesCount;

    // Optimistic UI updates
    const nextLiked = !prevLiked;
    const nextLikesCount = nextLiked ? prevLikesCount + 1 : Math.max(0, prevLikesCount - 1);

    setLiked(nextLiked);
    setLikesCount(nextLikesCount);
    
    if (nextLiked) {
      setTriggerPop(true);
    }
    setLoading(true);

    try {
      let data;
      if (nextLiked) {
        data = await experienceService.likeExperience(experienceId);
      } else {
        data = await experienceService.unlikeExperience(experienceId);
      }

      // Sync with server values
      const serverLiked = data?.liked !== undefined ? data.liked : nextLiked;
      const serverLikesCount = data?.likesCount !== undefined ? data.likesCount : nextLikesCount;

      setLiked(serverLiked);
      setLikesCount(serverLikesCount);

      if (onLikeToggle) {
        onLikeToggle(serverLiked, serverLikesCount);
      }
    } catch (err) {
      // Rollback to original state
      setLiked(prevLiked);
      setLikesCount(prevLikesCount);

      // Handle server error message display
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Action failed. Please try again.';
      toast.error(typeof errorMsg === 'string' ? errorMsg : 'Action failed. Please try again.');
    } finally {
      setLoading(false);
      // Let animation run then clear state
      setTimeout(() => setTriggerPop(false), 300);
    }
  };

  const renderHeart = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill={liked ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`
        w-4 h-4 transition-all duration-300 select-none
        ${liked ? 'text-rose-500 fill-rose-500' : 'text-theme-muted group-hover:text-rose-500'}
        ${triggerPop ? 'animate-heart-pop' : ''}
        ${loading ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );

  if (variant === 'large') {
    return (
      <button 
        onClick={handleLike}
        disabled={loading}
        className={`flex-1 py-2.5 bg-theme-main hover:bg-theme-hover border border-theme-border rounded-sm flex items-center justify-center gap-2 text-xs font-bold transition-all text-theme-text group cursor-pointer ${loading ? 'cursor-not-allowed opacity-80' : ''} ${className}`}
      >
        {renderHeart()}
        <span className={`${liked ? 'text-rose-500' : 'text-theme-text'} font-bold transition-colors`}>
          {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
        </span>
      </button>
    );
  }

  // Compact layout (used inside cards/feeds)
  return (
    <button 
      onClick={handleLike}
      disabled={loading}
      className={`
        flex items-center gap-1.5 hover:text-rose-500 transition-colors text-xs font-medium group cursor-pointer p-1 rounded-sm
        ${loading ? 'cursor-not-allowed opacity-80' : ''}
        ${className}
      `}
      title={liked ? "Unlike" : "Like"}
    >
      <div className="relative flex items-center justify-center">
        {renderHeart()}
      </div>
      <span className={`transition-colors font-bold ${liked ? 'text-rose-500' : 'text-theme-muted group-hover:text-rose-500'}`}>
        {likesCount}
      </span>
    </button>
  );
}
