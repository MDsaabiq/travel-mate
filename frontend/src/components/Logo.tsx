import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Circle */}
          <circle cx="16" cy="16" r="14" fill="url(#gradient1)" stroke="url(#gradient2)" strokeWidth="2"/>
          
          {/* Mountain/Travel Icon */}
          <path d="M6 20L9 14L12 17L16 10L20 15L24 18L26 20H6Z" fill="white" opacity="0.9"/>
          
          {/* Airplane Trail */}
          <path d="M21 11L24 8" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="24" cy="8" r="0.8" fill="white"/>
          
          {/* Location Pin */}
          <path d="M11 21C11 20.4477 11.4477 20 12 20C12.5523 20 13 20.4477 13 21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21Z" fill="#0D9488"/>
          <path d="M12 18.5C11.7239 18.5 11.5 18.7239 11.5 19V20.5C11.5 20.7761 11.7239 21 12 21C12.2761 21 12.5 20.7761 12.5 20.5V19C12.5 18.7239 12.2761 18.5 12 18.5Z" fill="#0D9488"/>
          
          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'#0D9488', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'#14B8A6', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#5EEAD4', stopOpacity:1}} />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'#0F766E', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#0D9488', stopOpacity:1}} />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
          <span>Tour</span>
          <span className="text-teal-600">Mates</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
