import React, { useState } from 'react';
import ownerPhoto from '../assets/images/owner_photo.jpg';

interface OwnerAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const OwnerAvatar: React.FC<OwnerAvatarProps> = ({ className = '', size = 'md' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-lg',
  };

  if (imageError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white font-black flex items-center justify-center shrink-0 shadow-sm ${className}`}
        title="Store Founder: Abdullah"
      >
        <span>A</span>
      </div>
    );
  }

  return (
    <img
      src={ownerPhoto}
      alt="Store Founder Abdullah"
      onError={() => setImageError(true)}
      className={`${sizeClasses[size]} rounded-full object-cover shrink-0 ${className}`}
    />
  );
};
