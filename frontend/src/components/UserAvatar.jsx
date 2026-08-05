import React from 'react';
import Avatar from './Avatar';

export default function UserAvatar({ user, className = "w-8 h-8", textClassName = "text-sm" }) {
  const seed = user?.avatarSeed || user?.authorAvatarSeed || user?.senderAvatarSeed || user?.profileImage;
  return (
    <Avatar 
      seed={seed} 
      name={user?.name} 
      size={className} 
    />
  );
}
