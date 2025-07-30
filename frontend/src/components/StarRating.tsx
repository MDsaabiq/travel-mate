import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (starIndex: number) => {
    const isFilled = starIndex <= rating;
    const isHalfFilled = starIndex - 0.5 <= rating && starIndex > rating;

    return (
      <button
        key={starIndex}
        type="button"
        onClick={() => handleStarClick(starIndex)}
        disabled={readonly}
        className={`
          ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
          transition-all duration-150 ease-in-out
          ${!readonly ? 'hover:text-yellow-400' : ''}
        `}
      >
        <Star
          className={`
            ${getSizeClasses()}
            ${isFilled || isHalfFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            ${!readonly && 'hover:fill-yellow-400'}
          `}
        />
      </button>
    );
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-2">
          {rating > 0 ? rating.toFixed(1) : 'No rating'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
