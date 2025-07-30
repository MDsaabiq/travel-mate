import React from 'react';
import { Clock, MapPin, CheckCircle } from 'lucide-react';

interface TripStatusBadgeProps {
  status: 'not_started' | 'in_journey' | 'ended';
  className?: string;
}

const TripStatusBadge: React.FC<TripStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'not_started':
        return {
          label: 'Not Started',
          icon: Clock,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          iconColor: 'text-gray-500'
        };
      case 'in_journey':
        return {
          label: 'In Journey',
          icon: MapPin,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          iconColor: 'text-blue-500'
        };
      case 'ended':
        return {
          label: 'Ended',
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          iconColor: 'text-green-500'
        };
      default:
        return {
          label: 'Unknown',
          icon: Clock,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          iconColor: 'text-gray-500'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      <Icon className={`w-3 h-3 mr-1 ${config.iconColor}`} />
      {config.label}
    </span>
  );
};

export default TripStatusBadge;
