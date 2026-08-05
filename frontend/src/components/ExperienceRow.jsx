import React from 'react';
import CompanyLogo from './CompanyLogo';
import LikeButton from './LikeButton';
import BookmarkButton from './BookmarkButton';

export default function ExperienceRow({ experience, onLikeToggle, onBookmarkToggle, onDelete }) {
  const expId = experience?.id || experience?._id;
  const companyName = experience?.company?.name || experience?.companyName || (typeof experience?.company === 'string' ? experience.company : 'Company');
  const companyIcon = experience?.company?.logoUrl ? null : (experience?.icon || 'google');
  const roleName = experience?.role || experience?.title || 'Software Engineer';
  const dateStr = experience?.interviewDate || experience?.date || 'Recent';
  const roundsCount = experience?.interviewRounds?.length || experience?.rounds || 1;
  const ratingVal = experience?.company?.rating != null 
    ? experience.company.rating 
    : (experience?.companyRating != null 
        ? experience.companyRating 
        : (experience?.rating != null ? experience.rating : 4.0));

  // Round types as comma/middle-dot separated plain text
  const tags = experience.tags || (experience.interviewRounds ? experience.interviewRounds.map(r => r.title || r.roundType) : ['Java', 'Spring Boot']);
  const tagsDisplay = tags.slice(0, 4).join(' · ');

  return (
    <div 
      onClick={() => window.location.hash = `#/experience/${expId}`}
      className="row-list-item flex flex-col md:flex-row md:items-center justify-between cursor-pointer group gap-4 transition-colors"
    >
      <div className="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
        <CompanyLogo 
          company={experience.company}
          logoUrl={experience.company?.logoUrl} 
          name={companyName} 
          icon={companyIcon}
          color={experience.color}
          className="w-12 h-12 rounded bg-theme-main border border-theme-border flex items-center justify-center flex-shrink-0"
          iconClassName="text-2xl"
        />
        <div className="flex flex-col gap-1 min-w-0 w-full">
          <div className="flex items-baseline gap-2 truncate">
            <h3 className="font-bold text-sm md:text-base text-theme-text group-hover:text-theme-text transition-colors truncate">{roleName}</h3>
            <span className="text-sm font-medium text-theme-muted truncate">{companyName}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] md:text-xs text-theme-muted">
            {tagsDisplay && (
              <>
                <span className="truncate max-w-[200px] sm:max-w-none">{tagsDisplay}</span>
                <span>•</span>
              </>
            )}
            <span className="whitespace-nowrap">{roundsCount} {roundsCount === 1 ? 'Round' : 'Rounds'}</span>
            <span>•</span>
            <span className="whitespace-nowrap">{dateStr}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center self-start md:self-auto gap-4 md:gap-5 ml-16 md:ml-0" onClick={(e) => e.stopPropagation()}>
        <div className="text-xs font-bold text-yellow-500 flex items-center gap-1">
          <iconify-icon icon="lucide:star" className="fill-current text-[11px]"></iconify-icon>
          <span>{Number(ratingVal).toFixed(1)}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {onLikeToggle && (
            <LikeButton 
              experienceId={expId}
              liked={experience.liked}
              likesCount={experience.likesCount !== undefined ? experience.likesCount : (experience.likes || 0)}
              onLikeToggle={onLikeToggle}
            />
          )}
          {onBookmarkToggle && (
            <BookmarkButton
              experienceId={expId}
              bookmarked={experience.bookmarked}
              onBookmarkToggle={onBookmarkToggle}
            />
          )}
          {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(expId);
              }}
              className="text-theme-muted hover:text-red-500 transition-colors p-1.5 rounded-sm hover:bg-theme-hover flex items-center justify-center flex-shrink-0 cursor-pointer"
              title="Delete Experience"
            >
              <iconify-icon icon="lucide:trash-2" className="text-[15px]"></iconify-icon>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
