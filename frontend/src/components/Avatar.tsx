import React from 'react';

interface AvatarProps {
  seed?: string | null;
  name?: string;
  size?: string;
  className?: string;
  onClick?: (e?: React.MouseEvent) => void;
  alt?: string;
}

export default function Avatar({ seed, name, size, className, onClick, alt }: AvatarProps) {
  const avatarSeed = seed || 'default-avatar';
  const isFullUrl = typeof avatarSeed === 'string' && (avatarSeed.startsWith('http://') || avatarSeed.startsWith('https://') || avatarSeed.startsWith('data:'));
  
  const url = isFullUrl 
    ? avatarSeed 
    : `https://api.dicebear.com/10.x/notionists/svg?seed=${encodeURIComponent(avatarSeed)}`;
    
  const sizeClass = size || className || 'w-8 h-8';

  return (
    <div 
      className={`${sizeClass} rounded-full overflow-hidden border border-theme-border flex-shrink-0 bg-theme-hover flex items-center justify-center`}
      onClick={onClick}
    >
      <img 
        src={url} 
        alt={alt || name || 'avatar'} 
        className="w-full h-full object-cover" 
      />
    </div>
  );
}
