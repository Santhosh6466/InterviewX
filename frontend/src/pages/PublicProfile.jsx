import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import profileService from '../services/profileService';
import experienceService from '../services/experienceService';
import Avatar from '../components/Avatar';
import CompanyLogo from '../components/CompanyLogo';
import { getCareerStatusLabel } from '../constants/enums';
import { SkeletonDetailCard } from '../components/Skeleton';
import NotFound from './NotFound';

export default function PublicProfile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getUserIdFromHash = () => {
    const hash = window.location.hash;
    const parts = hash.split('#/users/');
    return parts[1] || '';
  };

  const fetchProfile = async () => {
    const userId = getUserIdFromHash();
    if (!userId) {
      setError('User ID not specified');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      
      const [profileRes, expRes] = await Promise.allSettled([
        profileService.getPublicProfile(userId),
        experienceService.getUserExperiences(userId).catch(() => [])
      ]);

      if (profileRes.status === 'fulfilled') {
        setProfileData(profileRes.value);
      } else {
        throw new Error(profileRes.reason);
      }

      if (expRes.status === 'fulfilled') {
        const list = Array.isArray(expRes.value) ? expRes.value : (expRes.value?.content || expRes.value?.experiences || []);
        
        // Ensure we only count experiences that belong to this user
        const userIdStr = String(userId).toLowerCase();
        const userEmailStr = String(profileRes.value?.email || '').toLowerCase();
        const userNameStr = String(profileRes.value?.name || profileRes.value?.fullName || '').toLowerCase();
        
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
        
        setExperiences(myExperiences);
      }
    } catch (err) {
      console.error('[PublicProfile] Error fetching public profile:', err);
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to load user profile';
      setError(typeof msg === 'string' ? msg : 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    
    // Refresh if hash changes (e.g. clicking another user profile from within public profile page)
    const handleHashChange = () => {
      fetchProfile();
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const userId = getUserIdFromHash();
  const isOwnProfile = String(userId) === String(user?.id || user?._id);

  if (loading) {
    return (
      <DashboardLayout activeTab="Home">
        <div className="flex flex-col gap-8 max-w-[1000px] mx-auto w-full fade-in-up">
          <SkeletonDetailCard />
          <SkeletonDetailCard />
        </div>
      </DashboardLayout>
    );
  }

  if (!loading && (error || !profileData)) {
    return (
      <NotFound
        code={error && !error.includes('not found') ? '500' : '404'}
        title={error && !error.includes('not found') ? 'Server Error' : 'User Profile Not Found'}
        description={error || "The user profile you're looking for doesn't exist or could not be loaded."}
        activeTab="Home"
        onRetry={fetchProfile}
      />
    );
  }

  // Placeholder utility
  const getDisplayValue = (val) => {
    return val && val.trim() !== '' ? val : 'Not provided';
  };

  return (
    <DashboardLayout activeTab="Home">
      <div className="flex flex-col gap-8 max-w-[1000px] mx-auto w-full fade-in-up">
        
        {/* Main Profile Card - Reusing the design layout of loggged-in Profile */}
        <div className="premium-card flex flex-col gap-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <Avatar seed={profileData?.avatarSeed} name={profileData?.name || 'User'} size="w-20 h-20" />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{profileData?.name || 'Guest'}</h1>
                  {profileData?.careerStatus && (
                    <span className="px-2.5 py-0.5 bg-theme-hover text-theme-muted text-[10px] font-bold rounded-sm border border-theme-border">
                      {getCareerStatusLabel(profileData.careerStatus)}
                    </span>
                  )}
                </div>
                {profileData?.headline && (
                  <p className="text-sm font-medium text-theme-text">{profileData.headline}</p>
                )}
                {profileData?.currentRole && (
                  <span className="text-xs text-theme-muted">{profileData.currentRole}</span>
                )}
              </div>
            </div>
            
            {isOwnProfile && (
              <a href="#/update-profile" className="flex items-center justify-center gap-2 px-6 py-2.5 bg-transparent border border-theme-border text-theme-text font-bold text-sm rounded-sm hover:bg-theme-hover transition-colors flex-shrink-0">
                <iconify-icon icon="lucide:edit-2"></iconify-icon> Edit Profile
              </a>
            )}
          </div>

          {/* Current Company Section */}
          {profileData?.currentCompany && (
            <div className="flex items-center gap-3 bg-theme-main border border-theme-border rounded-sm p-4 w-fit relative z-10 -mt-2">
              <CompanyLogo
                company={profileData.currentCompany}
                className="w-10 h-10 rounded-sm bg-theme-card flex items-center justify-center border border-theme-border flex-shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-xs text-theme-muted font-medium">Currently at</span>
                <span className="text-sm font-bold text-theme-text">{profileData.currentCompany.name}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10 border-t border-theme-border pt-8">
            <div className="flex flex-col items-center text-center gap-1">
              <span className="font-bold text-xl">{(profileData?.experienceCount && profileData.experienceCount > 0) ? profileData.experienceCount : experiences.length}</span>
              <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Interview Experiences</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <span className="font-bold text-xl">{(profileData?.totalLikes && profileData.totalLikes > 0) ? profileData.totalLikes : experiences.reduce((acc, exp) => acc + (exp.likesCount !== undefined ? exp.likesCount : (exp.likes || 0)), 0)}</span>
              <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Likes Received</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <span className="font-bold text-base">
                {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
              </span>
              <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Joined Date</span>
            </div>
          </div>
        </div>

        {/* Details Card (Bio & Education) */}
        <div className="flex flex-col gap-6">
          
          {/* Bio Card */}
          <div className="premium-card flex flex-col gap-4">
            <h3 className="font-bold text-base text-theme-text border-b border-theme-border pb-3">Bio</h3>
            <p className="text-sm text-theme-muted leading-relaxed whitespace-pre-wrap">
              {getDisplayValue(profileData?.bio)}
            </p>
          </div>

          {/* Education Details Card */}
          <div className="premium-card flex flex-col gap-4">
            <h3 className="font-bold text-base text-theme-text border-b border-theme-border pb-3">Education</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-theme-muted font-medium w-32 flex-shrink-0">College:</span>
                <span className="text-xs font-bold text-theme-text">{getDisplayValue(profileData?.college)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-theme-muted font-medium w-32 flex-shrink-0">Branch / Major:</span>
                <span className="text-xs font-bold text-theme-text">{getDisplayValue(profileData?.branch)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-theme-muted font-medium w-32 flex-shrink-0">Graduation Year:</span>
                <span className="text-xs font-bold text-theme-text">
                  {profileData?.graduationYear ? String(profileData.graduationYear) : 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Social Profiles (Only displayed if they exist) */}
          {(profileData?.linkedinUrl || profileData?.githubUrl || profileData?.leetcodeUrl || profileData?.portfolioUrl) && (
            <div className="premium-card flex flex-col gap-6">
              <h3 className="font-bold text-base text-theme-text border-b border-theme-border pb-3">Social & Coding Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                {profileData?.linkedinUrl && (
                  <a 
                    href={profileData.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 p-3 bg-theme-main border border-theme-border hover:border-theme-border-inverted rounded-sm transition-colors group"
                  >
                    <iconify-icon icon="simple-icons:linkedin" className="text-xl text-[#0A66C2] group-hover:scale-110 transition-transform"></iconify-icon>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-theme-text">LinkedIn</span>
                      <span className="text-[10px] text-theme-muted truncate">View Profile</span>
                    </div>
                  </a>
                )}

                {profileData?.githubUrl && (
                  <a 
                    href={profileData.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 p-3 bg-theme-main border border-theme-border hover:border-theme-border-inverted rounded-sm transition-colors group"
                  >
                    <iconify-icon icon="simple-icons:github" className="text-xl text-theme-text group-hover:scale-110 transition-transform"></iconify-icon>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-theme-text">GitHub</span>
                      <span className="text-[10px] text-theme-muted truncate">View Profile</span>
                    </div>
                  </a>
                )}

                {profileData?.leetcodeUrl && (
                  <a 
                    href={profileData.leetcodeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 p-3 bg-theme-main border border-theme-border hover:border-theme-border-inverted rounded-sm transition-colors group"
                  >
                    <iconify-icon icon="simple-icons:leetcode" className="text-xl text-[#FFA116] group-hover:scale-110 transition-transform"></iconify-icon>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-theme-text">LeetCode</span>
                      <span className="text-[10px] text-theme-muted truncate">View Profile</span>
                    </div>
                  </a>
                )}

                {profileData?.portfolioUrl && (
                  <a 
                    href={profileData.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 p-3 bg-theme-main border border-theme-border hover:border-theme-border-inverted rounded-sm transition-colors group"
                  >
                    <iconify-icon icon="lucide:globe" className="text-xl text-teal-500 group-hover:scale-110 transition-transform"></iconify-icon>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-theme-text">Portfolio</span>
                      <span className="text-[10px] text-theme-muted truncate">Visit Site</span>
                    </div>
                  </a>
                )}

              </div>
            </div>
          )}

          {/* Extensible Future Ready Layout Blocks (Commented out/reserved for later expansion) */}
          {/*
          <div className="followers-following-section">
            Placeholder for Followers / Following lists
          </div>
          <div className="user-badges-section">
            Placeholder for User Badges achievements
          </div>
          <div className="recent-interview-experiences-section">
            Placeholder for Recent Interview Experiences list
          </div>
          <div className="saved-experiences-section">
            Placeholder for Saved / Bookmarked experiences list
          </div>
          <div className="contribution-streak-section">
            Placeholder for Contribution Streak / Heatmap
          </div>
          <div className="activity-timeline-section">
            Placeholder for Activity Timeline feed
          </div>
          <div className="profile-analytics-section">
            Placeholder for Profile views / analytics stats
          </div>
          */}

        </div>
      </div>
    </DashboardLayout>
  );
}
