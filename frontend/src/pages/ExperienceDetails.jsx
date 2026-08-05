import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import experienceService from '../services/experienceService';
import interviewRoundService from '../services/interviewRoundService';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { SkeletonDetailCard } from '../components/Skeleton';
import { 
  getInterviewTypeLabel, 
  getExperienceLevelLabel, 
  getInterviewResultLabel, 
  getDifficultyLabel, 
  getRoundTypeLabel, 
  getStatusBadgeClass 
} from '../constants/enums';
import CompanyLogo from '../components/CompanyLogo';
import Avatar from '../components/Avatar';
import { toast } from 'react-hot-toast';
import LikeButton from '../components/LikeButton';
import CommentsSection from '../components/CommentsSection';
import BookmarkButton from '../components/BookmarkButton';
import StatusChip from '../components/StatusChip';
import AttributePill from '../components/AttributePill';
import DifficultyIndicator from '../components/DifficultyIndicator';
import NotFound from './NotFound';

const ROUND_TYPE_CONFIG = {
  ONLINE_ASSESSMENT: { icon: 'lucide:laptop', border: 'border-l-indigo-500', iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  CODING: { icon: 'lucide:code-2', border: 'border-l-sky-500', iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  TECHNICAL: { icon: 'lucide:cpu', border: 'border-l-emerald-500', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  SYSTEM_DESIGN: { icon: 'lucide:layers', border: 'border-l-purple-500', iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  MACHINE_CODING: { icon: 'lucide:terminal', border: 'border-l-amber-500', iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  PAIR_PROGRAMMING: { icon: 'lucide:users', border: 'border-l-blue-500', iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  MANAGERIAL: { icon: 'lucide:briefcase', border: 'border-l-violet-500', iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  BEHAVIORAL: { icon: 'lucide:message-square', border: 'border-l-teal-500', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  HR: { icon: 'lucide:user-check', border: 'border-l-terracotta-500', iconBg: 'bg-terracotta-500/10 text-terracotta-700 dark:text-terracotta-400' }
};

const getRoundTypeConfig = (type) => {
  const t = String(type || '').toUpperCase();
  if (t.includes('OA') || t.includes('ONLINE')) return ROUND_TYPE_CONFIG.ONLINE_ASSESSMENT;
  if (t.includes('SYSTEM')) return ROUND_TYPE_CONFIG.SYSTEM_DESIGN;
  if (t.includes('MACHINE')) return ROUND_TYPE_CONFIG.MACHINE_CODING;
  if (t.includes('PAIR')) return ROUND_TYPE_CONFIG.PAIR_PROGRAMMING;
  if (t.includes('MANAGERIAL')) return ROUND_TYPE_CONFIG.MANAGERIAL;
  if (t.includes('BEHAVIORAL')) return ROUND_TYPE_CONFIG.BEHAVIORAL;
  if (t.includes('HR')) return ROUND_TYPE_CONFIG.HR;
  if (t.includes('CODING')) return ROUND_TYPE_CONFIG.CODING;
  return ROUND_TYPE_CONFIG.TECHNICAL;
};

const DEFAULT_ROUNDS = [
  {
    roundNumber: 1,
    roundType: 'OA',
    title: 'Online Assessment (OA)',
    description: '2 coding questions + MCQs. Medium difficulty.',
    tags: ['DSA', 'Arrays', 'Graphs'],
    difficulty: 'MEDIUM'
  },
  {
    roundNumber: 2,
    roundType: 'Technical',
    title: 'Technical Round 1',
    description: 'DSA question + System Design basics.',
    tags: ['Hashmap', 'System Design'],
    difficulty: 'HARD'
  },
  {
    roundNumber: 3,
    roundType: 'Technical',
    title: 'Technical Round 2',
    description: 'Core Java, Spring Boot, REST API questions.',
    tags: ['Java', 'Spring Boot', 'REST'],
    difficulty: 'HARD'
  },
  {
    roundNumber: 4,
    roundType: 'HR',
    title: 'HR Round',
    description: 'Behavioral and situational questions.',
    tags: ['HR', 'Behavioral'],
    difficulty: 'EASY'
  }
];

const getDifficultyBadgeStyle = (diff) => {
  const str = String(diff || '').toUpperCase();
  if (str === 'EASY' || diff === 1 || diff === 2) {
    return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  }
  if (str === 'HARD' || diff === 4 || diff === 5) {
    return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
  }
  return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
};

export default function ExperienceDetails() {
  const { user } = useAuth();
  const [experience, setExperience] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const getExperienceIdFromHash = () => {
    const hash = window.location.hash;
    const parts = hash.split('#/experience/');
    const rawId = parts[1] || '1';
    return rawId.split(/[?#]/)[0];
  };

  useEffect(() => {
    const id = getExperienceIdFromHash();
    fetchExperienceDetails(id);
  }, []);

  useEffect(() => {
    if (!loading && experience) {
      const hash = window.location.hash;
      if (hash.includes('scroll=comments') || hash.includes('comments')) {
        setTimeout(() => {
          const el = document.getElementById('comments-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [loading, experience]);

  const fetchExperienceDetails = async (id) => {
    try {
      setLoading(true);
      setError('');
      
      const [expRes, roundsRes, bookmarksRes] = await Promise.allSettled([
        experienceService.getExperienceById(id),
        interviewRoundService.getRoundsByExperience(id),
        experienceService.getMyBookmarks()
      ]);

      if (expRes.status === 'fulfilled' && expRes.value) {
        const expData = expRes.value;
        
        let isBookmarked = false;
        if (bookmarksRes.status === 'fulfilled' && Array.isArray(bookmarksRes.value)) {
          isBookmarked = bookmarksRes.value.some(b => String(b.experienceId || b.id) === String(id));
        }

        setExperience({
          ...expData,
          bookmarked: isBookmarked
        });

        let realRounds = [];
        if (roundsRes.status === 'fulfilled' && Array.isArray(roundsRes.value) && roundsRes.value.length > 0) {
          realRounds = [...roundsRes.value];
        } else if (expData.interviewRounds && Array.isArray(expData.interviewRounds) && expData.interviewRounds.length > 0) {
          realRounds = [...expData.interviewRounds];
        }

        const sorted = realRounds.sort((a, b) => (a.roundNumber || 0) - (b.roundNumber || 0));
        setRounds(sorted);
      } else {
        setExperience(null);
        setError('The requested interview experience could not be found.');
      }
    } catch (err) {
      console.warn('[ExperienceDetails] Error fetching experience details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load experience details');
      setExperience(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperience = async () => {
    const id = getExperienceIdFromHash();
    try {
      setDeleting(true);
      await experienceService.deleteExperience(id);
      toast.success('Experience deleted successfully');
      setShowDeleteModal(false);
      window.location.hash = '#/dashboard';
    } catch (err) {
      console.error('[ExperienceDetails] Error deleting experience:', err);
      toast.error(err.response?.data?.message || 'Failed to delete experience');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="Experiences">
        <div className="flex flex-col gap-8 max-w-[1000px] mx-auto w-full fade-in-up">
          <SkeletonDetailCard />
          <SkeletonDetailCard />
        </div>
      </DashboardLayout>
    );
  }

  if (!loading && (!experience || error)) {
    return (
      <NotFound
        code={error && !error.includes('not be found') ? '500' : '404'}
        title={error && !error.includes('not be found') ? 'Server Error' : 'Experience Not Found'}
        description={error || "The interview experience you're looking for doesn't exist or has been removed."}
        activeTab="Experiences"
        onRetry={() => fetchExperienceDetails(getExperienceIdFromHash())}
      />
    );
  }

  const companyObj = experience?.company || {};
  const companyName = typeof companyObj === 'string' ? companyObj : (companyObj.name || experience?.companyName || 'Company');
  const roleName = experience?.role || experience?.title || 'Software Engineer';
  const dateStr = experience?.interviewDate || 'Recent';
  const ratingVal = companyObj?.rating != null 
    ? Number(companyObj.rating).toFixed(1) 
    : (experience?.companyRating != null 
        ? Number(experience.companyRating).toFixed(1) 
        : (experience?.rating != null ? Number(experience.rating).toFixed(1) : '4.2'));

  const rawResult = String(experience?.result || 'SELECTED').toUpperCase();
  const resultDisplay = getInterviewResultLabel(rawResult);

  const authorSeed = experience?.user?.avatarSeed || experience?.authorAvatarSeed || experience?.avatarSeed;
  const authorName = experience?.user?.name || experience?.authorName || 'Candidate';
  const authorId = experience?.authorId || experience?.userId || experience?.user?.id;

  return (
    <DashboardLayout activeTab="Experiences">
      <div className="flex flex-col gap-8 max-w-[1050px] mx-auto w-full fade-in-up">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-theme-muted">
          <a href="#/companies" className="hover:text-theme-text transition-colors">Companies</a>
          <iconify-icon icon="lucide:chevron-right" className="text-xs"></iconify-icon>
          <a href="#/companies" className="hover:text-theme-text transition-colors">{companyName}</a>
          <iconify-icon icon="lucide:chevron-right" className="text-xs"></iconify-icon>
          <span className="text-theme-text font-bold">{roleName}</span>
        </div>

        {/* Header Hero Card */}
        <div className="premium-card flex flex-col gap-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-5">
              <CompanyLogo 
                company={companyObj}
                logoUrl={companyObj.logoUrl} 
                name={companyName} 
                className="w-16 h-16 rounded-sm bg-theme-hover border border-theme-border flex items-center justify-center shrink-0 shadow-inner"
                iconClassName="text-3xl"
              />
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="display-font text-2xl md:text-3xl font-bold tracking-tight text-theme-text">{roleName}</h1>
                  <StatusChip result={rawResult} label={resultDisplay} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-theme-muted">
                  <span className="inline-flex items-center gap-1 font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <iconify-icon icon="lucide:star" className="fill-current text-xs"></iconify-icon> {ratingVal}
                  </span>
                  <span className="flex items-center gap-1">
                    <iconify-icon icon="lucide:calendar" className="text-xs text-terracotta-500"></iconify-icon> Interviewed {dateStr}
                  </span>
                  <span className="flex items-center gap-1">
                    <iconify-icon icon="lucide:layers" className="text-xs text-terracotta-500"></iconify-icon> {rounds.length} {rounds.length === 1 ? 'Round' : 'Rounds'}
                  </span>
                </div>
              </div>
            </div>

            {/* Author & Actions */}
            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-theme-border pt-4 md:pt-0 md:pl-6">
              <div 
                className={`flex items-center gap-3 ${authorId ? 'cursor-pointer hover:opacity-85 transition-opacity' : ''}`}
                onClick={() => {
                  if (authorId) {
                    window.location.hash = `#/users/${authorId}`;
                  }
                }}
              >
                <Avatar 
                  seed={authorSeed} 
                  name={authorName} 
                  size="w-11 h-11" 
                />
                <div className="flex flex-col">
                  <span className={`text-sm font-bold text-theme-text ${authorId ? 'hover:underline' : ''}`}>{authorName}</span>
                  <span className="text-[11px] text-theme-muted font-medium">{experience?.authorRole || `${companyName} Candidate`}</span>
                </div>
              </div>
              
              {(user?.role === 'ADMIN' || (user && experience && (
                user.id === experience.userId ||
                (experience.user?.id && user.id === experience.user.id) ||
                (experience.authorName && user.name === experience.authorName) ||
                (experience.user?.email && user.email === experience.user.email)
              ))) && (
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="w-9 h-9 rounded-sm bg-theme-hover border border-theme-border flex items-center justify-center text-theme-muted hover:text-rose-500 hover:border-rose-500/30 transition-all cursor-pointer shadow-sm ml-auto"
                  title="Delete Experience"
                >
                  <iconify-icon icon="lucide:trash-2" className="text-base"></iconify-icon>
                </button>
              )}
            </div>
          </div>

          {/* Quick Info Attributes */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-theme-border/60">
            <span className="text-sm font-medium text-theme-muted flex flex-wrap gap-2 items-center">
              <span>{getInterviewTypeLabel(experience?.interviewType || 'ONLINE')}</span>
              <span className="font-bold text-terracotta-500">·</span>
              <span>{getExperienceLevelLabel(experience?.experienceLevel || 'FRESHER')}</span>
              <span className="font-bold text-terracotta-500">·</span>
              <span>{experience?.location || 'Remote'}</span>
              <span className="font-bold text-terracotta-500">·</span>
              <span>{getDifficultyLabel(experience?.difficulty || 'MEDIUM')} Difficulty</span>
            </span>
          </div>
        </div>

        {/* Responsive Grid Layout (Main Content 2 Cols, Sidebar 1 Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Overall Experience Section */}
            {(experience?.overallExperience || experience?.description || experience?.overview) && (
              <div className="flex flex-col gap-4 border-b border-theme-border pb-8">
                <h2 className="display-font text-lg font-bold flex items-center gap-2 text-theme-text pb-2">
                  <iconify-icon icon="lucide:file-text" className="text-terracotta-500 text-xl"></iconify-icon>
                  Overall Experience Write-Up
                </h2>
                <p className="text-sm text-theme-text leading-relaxed whitespace-pre-line font-normal">
                  {experience.overallExperience || experience.description || experience.overview}
                </p>
              </div>
            )}

            {/* Interview Process Differentiated Timeline */}
            <div className="flex flex-col gap-6 pt-2">
              <div className="flex items-center justify-between border-b border-theme-border/40 pb-4">
                <h2 className="display-font text-lg font-bold flex items-center gap-2 text-theme-text">
                  <iconify-icon icon="lucide:git-commit" className="text-terracotta-500 text-xl"></iconify-icon>
                  Interview Rounds Breakdown
                </h2>
                <span className="text-xs font-bold text-theme-muted uppercase tracking-wider bg-theme-hover px-2.5 py-1 rounded-sm border border-theme-border">
                  {rounds.length} {rounds.length === 1 ? 'Round' : 'Rounds Total'}
                </span>
              </div>

              {/* Editorial Rounds Breakdown */}
              <div className="flex flex-col border-b border-theme-border my-2">
                {rounds.map((round, i) => {
                  const roundNum = String(round.roundNumber || i + 1).padStart(2, '0');
                  const roundTitle = round.title || `Round ${Number(roundNum)}`;
                  const roundDesc = round.description || round.desc || 'No specific description provided.';
                  const roundType = round.roundType || 'Technical';
                  const roundTags = round.tags || [];
                  const diffLevel = round.difficulty || 'MEDIUM';

                  return (
                    <div key={i} className="flex gap-4 md:gap-6 py-6 border-t border-theme-border">
                      <div className="flex-shrink-0 w-6 md:w-8 text-sm md:text-base font-bold text-theme-muted pt-0.5 opacity-50">
                        {roundNum}
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-theme-muted">
                            {getRoundTypeLabel(roundType)}
                          </span>
                          <span className="text-theme-muted font-bold text-[10px]">·</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${diffLevel === 'HARD' ? 'text-rose-500' : diffLevel === 'EASY' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {getDifficultyLabel(diffLevel)}
                          </span>
                        </div>
                        <h3 className="font-bold text-base md:text-lg text-theme-text">{roundTitle}</h3>
                        <p className="text-sm md:text-base text-theme-text leading-relaxed mt-1">
                          {roundDesc}
                        </p>
                        {roundTags.length > 0 && (
                          <div className="text-xs md:text-sm italic text-theme-muted mt-2">
                            Skills & Topics: {roundTags.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comments Section */}
            <div id="comments-section">
              <CommentsSection experienceId={getExperienceIdFromHash()} />
            </div>

          </div>

          {/* Right Sidebar Column - Glassdoor Style Data Panel */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            <div className="premium-card flex flex-col gap-6 shadow-sm hover:shadow-md transition-all duration-200 sticky top-24">
              
              {/* Primary Interactive Section (Likes & Bookmarks) */}
              <div className="flex flex-col gap-3 pb-6 border-b border-theme-border">
                <span className="text-[10px] font-extrabold text-theme-muted uppercase tracking-wider flex items-center gap-1.5">
                  <iconify-icon icon="lucide:thumbs-up" className="text-terracotta-500 text-xs"></iconify-icon>
                  Helpful Community Feedback
                </span>
                <div className="flex items-center gap-3">
                  <LikeButton 
                    experienceId={experience?.id || getExperienceIdFromHash()}
                    liked={experience?.liked}
                    likesCount={experience?.likesCount !== undefined ? experience.likesCount : (experience?.likes || 0)}
                    variant="large"
                    onLikeToggle={(newLiked, newLikesCount) => {
                      setExperience(prev => prev ? { ...prev, liked: newLiked, likesCount: newLikesCount } : null);
                    }}
                  />
                  <BookmarkButton 
                    experienceId={experience?.id || getExperienceIdFromHash()}
                    bookmarked={experience?.bookmarked}
                    variant="large"
                    onBookmarkToggle={(newBookmarked) => {
                      setExperience(prev => prev ? { ...prev, bookmarked: newBookmarked } : null);
                    }}
                  />
                </div>
              </div>

              {/* Data Panel: Review Summary */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-theme-border pb-3">
                  <span className="display-font text-xs font-bold text-theme-text uppercase tracking-wider flex items-center gap-1.5">
                    <iconify-icon icon="lucide:bar-chart-3" className="text-terracotta-500 text-sm"></iconify-icon>
                    Review Summary
                  </span>
                  <span className="text-[10px] text-theme-muted font-bold">Verified Data</span>
                </div>

                <div className="flex flex-col text-xs divide-y divide-theme-border/40">
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-theme-muted font-semibold uppercase tracking-wider text-[10px]">Company</span>
                    <span className="font-bold text-theme-text">{companyName}</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-theme-muted font-semibold uppercase tracking-wider text-[10px]">Target Role</span>
                    <span className="font-bold text-theme-text">{roleName}</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-theme-muted font-semibold uppercase tracking-wider text-[10px]">Result</span>
                    <StatusChip result={rawResult} label={resultDisplay} />
                  </div>

                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-theme-muted font-semibold uppercase tracking-wider text-[10px]">Experience Level</span>
                    <span className="font-bold text-theme-text">{getExperienceLevelLabel(experience?.experienceLevel || 'FRESHER')}</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-theme-muted font-semibold uppercase tracking-wider text-[10px]">Interview Type</span>
                    <span className="font-bold text-theme-text">{getInterviewTypeLabel(experience?.interviewType || 'ONLINE')}</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-theme-muted font-semibold uppercase tracking-wider text-[10px]">Location</span>
                    <span className="font-bold text-theme-text">{experience?.location || 'Remote'}</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-theme-muted font-semibold uppercase tracking-wider text-[10px]">Overall Difficulty</span>
                    <DifficultyIndicator difficulty={experience?.difficulty || 'MEDIUM'} />
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteExperience}
        isLoading={deleting}
        title="Delete Experience"
        message="Are you sure you want to delete this interview experience? This action cannot be undone."
      />
    </DashboardLayout>
  );
}
