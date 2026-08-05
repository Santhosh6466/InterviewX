import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import experienceService from '../services/experienceService';
import profileService from '../services/profileService';
import { calculateCompletionPercentage } from '../utils/profileUtils';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { SkeletonCard } from '../components/Skeleton';
import CompanyLogo from '../components/CompanyLogo';
import { getCareerStatusLabel, getInterviewResultLabel, getStatusBadgeClass } from '../constants/enums';
import { toast } from 'react-hot-toast';
import LikeButton from '../components/LikeButton';
import BookmarkButton from '../components/BookmarkButton';
import ExperienceRow from '../components/ExperienceRow';
import EmptyState from '../components/EmptyState';
import requestCache from '../services/cache';

const DEFAULT_EXPERIENCES = [
  {
    id: 1,
    company: 'Google',
    role: 'Software Engineer Intern',
    status: 'Selected',
    likes: 143,
    comments: 32,
    date: '10 Jun 2024',
    rating: 4.2
  },
  {
    id: 2,
    company: 'Amazon',
    role: 'SDE Intern',
    status: 'Rejected',
    likes: 45,
    comments: 12,
    date: '8 Jun 2024',
    rating: 4.0
  }
];

export default function Profile({ sidebarTab = 'Profile' }) {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState(() => {
    const cached = requestCache.get('user_my_experiences');
    return Array.isArray(cached) ? cached : [];
  });
  const [loading, setLoading] = useState(() => {
    return !requestCache.get('user_my_experiences');
  });
  const [profileData, setProfileData] = useState(() => {
    return requestCache.get('user_profile_data') || null;
  });
  const [loadingProfile, setLoadingProfile] = useState(() => {
    return !requestCache.get('user_profile_data');
  });
  const [activeTab, setActiveTab] = useState('My Experiences');
  const [bookmarks, setBookmarks] = useState(() => {
    const cached = requestCache.get('user_profile_bookmarks');
    return Array.isArray(cached) ? cached : [];
  });
  const [loadingBookmarks, setLoadingBookmarks] = useState(() => {
    return !requestCache.get('user_profile_bookmarks');
  });
  
  // Deletion modal state
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAllProfileData();
  }, [user]);

  const fetchAllProfileData = async () => {
    try {
      const [profileResult, experiencesResult, bookmarksResult] = await Promise.allSettled([
        profileService.getProfile(),
        experienceService.getUserExperiences(),
        experienceService.getMyBookmarks()
      ]);

      // 1. Process Profile
      if (profileResult.status === 'fulfilled' && profileResult.value) {
        setProfileData(profileResult.value);
        requestCache.set('user_profile_data', profileResult.value, 180000);
      }
      setLoadingProfile(false);

      // 2. Process Bookmarks
      let bookmarkIds = new Set();
      let rawBookmarks = [];
      if (bookmarksResult.status === 'fulfilled' && Array.isArray(bookmarksResult.value)) {
        rawBookmarks = bookmarksResult.value;
        bookmarkIds = new Set(rawBookmarks.map(b => String(b.experienceId || b.id)));
        setBookmarks(rawBookmarks);
        requestCache.set('user_profile_bookmarks', rawBookmarks, 180000);
      }
      setLoadingBookmarks(false);

      // 3. Process Experiences
      if (experiencesResult.status === 'fulfilled') {
        const data = experiencesResult.value;
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
          requestCache.set('user_my_experiences', processedMyExps, 180000);
        }
      }
      setLoading(false);
    } catch (err) {
      console.warn('[Profile] Error in parallel fetchAllProfileData:', err);
      setLoading(false);
      setLoadingProfile(false);
      setLoadingBookmarks(false);
    }
  };

  const handleDeleteExperience = async () => {
    if (!selectedDeleteId) return;
    try {
      setDeleting(true);
      await experienceService.deleteExperience(selectedDeleteId);
      toast.success('Experience deleted successfully');
      
      setExperiences(prev => {
        const itemToDelete = prev.find(e => String(e.id || e._id) === String(selectedDeleteId));
        if (itemToDelete) {
           const likesToRemove = itemToDelete.likesCount !== undefined ? itemToDelete.likesCount : (itemToDelete.likes || 0);
           setProfileData(pd => {
              if (!pd) return pd;
              let baseLikes = pd.totalLikes;
              if (baseLikes == null) {
                  baseLikes = prev.reduce((acc, e) => acc + (e.likesCount !== undefined ? e.likesCount : (e.likes || 0)), 0);
              }
              const newTotalLikes = Math.max(0, baseLikes - likesToRemove);
              
              let baseCount = pd.experienceCount;
              if (baseCount == null) baseCount = prev.length;
              const newCount = Math.max(0, baseCount - 1);
              
              return { ...pd, totalLikes: newTotalLikes, experienceCount: newCount };
           });
        }
        return prev.filter(e => String(e.id || e._id) !== String(selectedDeleteId));
      });
      
      setSelectedDeleteId(null);
    } catch (err) {
      console.error('[Profile] Error deleting experience:', err);
      toast.error(err.response?.data?.message || 'Failed to delete experience');
    } finally {
      setDeleting(false);
    }
  };

  const completionPercentage = profileData ? calculateCompletionPercentage(profileData) : 100;

  return (
    <DashboardLayout activeTab={sidebarTab}>
      <div className="flex flex-col gap-6 max-w-[1000px] mx-auto w-full fade-in-up">
        
        {/* Profile Completion Progress Bar */}
        {completionPercentage < 100 && (
          <div className="premium-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-theme-border bg-theme-hover">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-theme-text flex items-center gap-2">
                  <iconify-icon icon="lucide:sparkles" className="text-amber-500"></iconify-icon>
                  Complete your profile
                </span>
                <span className="text-xs font-bold text-theme-muted">{completionPercentage}% Completed</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-theme-border rounded-sm h-2 overflow-hidden">
                <div 
                  className="bg-[#a78b71] h-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-theme-muted mt-1">
                Add details like bio, company, or social links to stand out and help others connect with you.
              </p>
            </div>
            <a 
              href="#/update-profile" 
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-theme-inverted text-theme-inverted-text font-bold text-xs rounded-sm hover:opacity-90 transition-opacity self-start md:self-auto cursor-pointer"
            >
              Complete Profile
              <iconify-icon icon="lucide:arrow-right"></iconify-icon>
            </a>
          </div>
        )}

        {/* Profile Card */}
        <div className="premium-card flex flex-col gap-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <Avatar seed={user?.avatarSeed} name={user?.name} size="w-20 h-20" />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="display-font text-3xl">{profileData?.name || profileData?.fullName || user?.name || 'Guest'}</h1>
                  {profileData?.careerStatus && (
                    <span className="px-2.5 py-0.5 bg-theme-hover text-theme-muted text-[10px] font-bold rounded-sm border border-theme-border">
                      {getCareerStatusLabel(profileData.careerStatus)}
                    </span>
                  )}
                </div>
                {profileData?.headline && (
                  <p className="text-sm font-medium text-theme-text">{profileData.headline}</p>
                )}
                <span className="text-xs text-theme-muted">{user?.email || 'No email'}</span>
              </div>
            </div>
            <a href="#/update-profile" className="flex items-center justify-center gap-2 px-6 py-2.5 bg-transparent border border-theme-border text-theme-text font-bold text-sm rounded-sm hover:bg-theme-hover transition-colors flex-shrink-0">
              <iconify-icon icon="lucide:edit-2"></iconify-icon> Edit Profile
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 border-t border-theme-border pt-8">
            <div className="flex flex-col items-center text-center gap-1">
              <span className="font-bold text-xl">{(profileData?.experienceCount && profileData.experienceCount > 0) ? profileData.experienceCount : experiences.length}</span>
              <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Contributions</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <span className="font-bold text-xl">{(profileData?.totalLikes && profileData.totalLikes > 0) ? profileData.totalLikes : experiences.reduce((acc, exp) => acc + (exp.likesCount !== undefined ? exp.likesCount : (exp.likes || 0)), 0)}</span>
              <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Likes Received</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <span className="font-bold text-xl">{bookmarks.length}</span>
              <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Bookmarks</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <span className="flex items-center gap-1 font-bold text-xl text-yellow-500"><iconify-icon icon="lucide:award"></iconify-icon> Top 5%</span>
              <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Reputation</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-theme-border">
          {['My Experiences', 'Bookmarks', 'Activity', 'About'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab ? 'border-theme-inverted text-theme-text' : 'border-transparent text-theme-muted hover:text-theme-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content rendering */}
        {activeTab === 'My Experiences' && (
          <div className="flex flex-col gap-4 fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-theme-muted">Shared ({experiences.length})</h2>
            </div>
            {loading ? (
              <div className="row-list-container">
                <div className="row-list-item"><SkeletonCard /></div>
                <div className="row-list-item"><SkeletonCard /></div>
                <div className="row-list-item"><SkeletonCard /></div>
              </div>
            ) : experiences.length === 0 ? (
              <EmptyState 
                icon="lucide:file-text" 
                title="No experiences shared"
                description="You haven't shared any interview experiences yet."
                className="mt-4"
              />
            ) : (
              <div className="row-list-container">
                {experiences.map((exp, i) => (
                  <ExperienceRow 
                    key={exp.id || exp._id || i}
                    experience={exp}
                    onLikeToggle={(newLiked, newLikesCount) => {
                      const expId = exp.id || exp._id;
                      setExperiences(prev => {
                        let diff = 0;
                        const nextExperiences = prev.map(item => {
                          if (String(item.id || item._id) === String(expId)) {
                            const oldLikes = item.likesCount !== undefined ? item.likesCount : (item.likes || 0);
                            diff = newLikesCount - oldLikes;
                            return { ...item, liked: newLiked, likesCount: newLikesCount };
                          }
                          return item;
                        });
                        
                        if (diff !== 0) {
                          setProfileData(pd => {
                            if (!pd) return pd;
                            let baseLikes = pd.totalLikes;
                            if (baseLikes == null) {
                              baseLikes = prev.reduce((acc, e) => acc + (e.likesCount !== undefined ? e.likesCount : (e.likes || 0)), 0);
                            }
                            return { ...pd, totalLikes: baseLikes + diff };
                          });
                        }
                        
                        return nextExperiences;
                      });
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
        )}

        {activeTab === 'Bookmarks' && (
          <div className="fade-in">
            {loadingBookmarks ? (
              <div className="row-list-container">
                <div className="row-list-item"><SkeletonCard /></div>
                <div className="row-list-item"><SkeletonCard /></div>
                <div className="row-list-item"><SkeletonCard /></div>
              </div>
            ) : bookmarks.length === 0 ? (
              <EmptyState 
                icon="lucide:bookmark" 
                title="No bookmarks saved"
                description="Your bookmarked experiences will appear here."
                className="mt-4"
              />
            ) : (
              <div className="row-list-container">
                {bookmarks.map((exp, i) => (
                  <ExperienceRow 
                    key={exp.id || exp._id || i}
                    experience={exp}
                    onLikeToggle={(newLiked, newLikesCount) => {
                      const expId = exp.id || exp._id;
                      setBookmarks(prev => prev.map(item => {
                        if (String(item.id || item._id) === String(expId)) {
                          return { ...item, liked: newLiked, likesCount: newLikesCount };
                        }
                        return item;
                      }));
                    }}
                    onBookmarkToggle={(newBookmarked) => {
                      const expId = exp.id || exp._id;
                      if (!newBookmarked) {
                        setBookmarks(prev => prev.filter(item => String(item.id || item._id) !== String(expId)));
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Activity' && (
          <EmptyState 
            icon="lucide:activity" 
            title="No activity yet"
            description="Your recent activity logs will appear here."
            className="mt-4 fade-in"
          />
        )}

        {activeTab === 'About' && (
          <div className="flex flex-col gap-6 fade-in">
            {/* Bio Card */}
            {profileData?.bio && (
              <div className="premium-card flex flex-col gap-4">
                <h3 className="font-bold text-base text-theme-text">About Me</h3>
                <p className="text-sm text-theme-muted leading-relaxed whitespace-pre-wrap">{profileData.bio}</p>
              </div>
            )}

            {/* Education & Career Card */}
            <div className="premium-card flex flex-col gap-6">
              <h3 className="font-bold text-base text-theme-text">Education & Career</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Career Section */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-theme-muted uppercase tracking-wider">Career Details</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-theme-muted font-medium w-28">Status:</span>
                      <span className="text-xs font-bold text-theme-text">
                        {profileData?.careerStatus ? getCareerStatusLabel(profileData.careerStatus) : 'Not specified'}
                      </span>
                    </div>

                    {profileData?.currentRole && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-theme-muted font-medium w-28">Current Role:</span>
                        <span className="text-xs font-bold text-theme-text">{profileData.currentRole}</span>
                      </div>
                    )}

                    {profileData?.currentCompany && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-theme-muted font-medium w-28 mt-1">Company:</span>
                        <div className="flex items-center gap-2.5 bg-theme-main border border-theme-border rounded-sm p-2 flex-1 max-w-xs">
                          <CompanyLogo
                            company={profileData.currentCompany}
                            className="w-7 h-7 rounded bg-theme-card flex items-center justify-center border border-theme-border flex-shrink-0"
                          />
                          <span className="text-xs font-bold text-theme-text truncate">{profileData.currentCompany.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Education Section */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-theme-muted uppercase tracking-wider">Education</h4>
                  <div className="flex flex-col gap-3">
                    {profileData?.college && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-theme-muted font-medium w-28">College:</span>
                        <span className="text-xs font-bold text-theme-text">{profileData.college}</span>
                      </div>
                    )}
                    
                    {profileData?.branch && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-theme-muted font-medium w-28">Branch:</span>
                        <span className="text-xs font-bold text-theme-text">{profileData.branch}</span>
                      </div>
                    )}

                    {profileData?.graduationYear && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-theme-muted font-medium w-28">Graduation Year:</span>
                        <span className="text-xs font-bold text-theme-text">{profileData.graduationYear}</span>
                      </div>
                    )}

                    {!profileData?.college && !profileData?.branch && !profileData?.graduationYear && (
                      <span className="text-xs text-theme-muted">No education details specified.</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Social & Profiles Card */}
            <div className="premium-card flex flex-col gap-6">
              <h3 className="font-bold text-base text-theme-text">Professional Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                {profileData?.linkedinUrl ? (
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
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-theme-main border border-theme-border rounded-sm opacity-50">
                    <iconify-icon icon="simple-icons:linkedin" className="text-xl text-theme-muted"></iconify-icon>
                    <span className="text-xs font-medium text-theme-muted">LinkedIn</span>
                  </div>
                )}

                {profileData?.githubUrl ? (
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
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-theme-main border border-theme-border rounded-sm opacity-50">
                    <iconify-icon icon="simple-icons:github" className="text-xl text-theme-muted"></iconify-icon>
                    <span className="text-xs font-medium text-theme-muted">GitHub</span>
                  </div>
                )}

                {profileData?.leetcodeUrl ? (
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
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-theme-main border border-theme-border rounded-sm opacity-50">
                    <iconify-icon icon="simple-icons:leetcode" className="text-xl text-theme-muted"></iconify-icon>
                    <span className="text-xs font-medium text-theme-muted">LeetCode</span>
                  </div>
                )}

                {profileData?.portfolioUrl ? (
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
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-theme-main border border-theme-border rounded-sm opacity-50">
                    <iconify-icon icon="lucide:globe" className="text-xl text-theme-muted"></iconify-icon>
                    <span className="text-xs font-medium text-theme-muted">Portfolio</span>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}
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
