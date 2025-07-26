import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  MapPin, 
  Calendar, 
  Users, 
  User,
  Plane,
  Train,
  Bus,
  Car
} from 'lucide-react';

interface Trip {
  _id: string;
  title: string;
  destination: string;
  coverPhoto?: string;
  dates: {
    start: string;
    end: string;
  };
  travelMode: string;
  organizer: {
    _id: string;
    name: string;
    photo?: string;
    city: string;
    travelPersona: string;
  };
  participants: Array<{
    _id: string;
    name: string;
    photo?: string;
  }>;
  maxParticipants: number;
}

interface TripCardProps {
  trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const getTravelModeIcon = (mode: string) => {
    switch (mode) {
      case 'flight': return <Plane className="w-4 h-4" />;
      case 'train': return <Train className="w-4 h-4" />;
      case 'bus': return <Bus className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getPersonaColor = (persona: string) => {
    switch (persona) {
      case 'solo': return 'bg-purple-100 text-purple-700';
      case 'planner': return 'bg-blue-100 text-blue-700';
      case 'adventurer': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Link 
      to={`/trips/${trip._id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden group"
    >
      {/* Cover Photo */}
      <div className="aspect-video bg-gradient-to-br from-teal-400 to-teal-600 relative overflow-hidden">
        {trip.coverPhoto ? (
          <img 
            src={trip.coverPhoto} 
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-12 h-12 text-white opacity-60" />
          </div>
        )}
        
        {/* Travel Mode Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
          {getTravelModeIcon(trip.travelMode)}
        </div>
      </div>

      <div className="p-4">
        {/* Trip Title */}
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors">
          {trip.title}
        </h3>

        {/* Destination */}
        <div className="flex items-center space-x-1 text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{trip.destination}</span>
        </div>

        {/* Dates */}
        <div className="flex items-center space-x-1 text-gray-600 mb-3">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {format(new Date(trip.dates.start), 'MMM dd')} - {format(new Date(trip.dates.end), 'MMM dd, yyyy')}
          </span>
        </div>

        {/* Participants */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              {trip.participants.length}/{trip.maxParticipants} travelers
            </span>
          </div>
          
          <div className="flex -space-x-2">
            {trip.participants.slice(0, 3).map((participant) => (
              <div
                key={participant._id}
                className="w-8 h-8 bg-teal-100 rounded-full border-2 border-white flex items-center justify-center"
              >
                {participant.photo ? (
                  <img 
                    src={participant.photo} 
                    alt={participant.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-teal-600" />
                )}
              </div>
            ))}
            {trip.participants.length > 3 && (
              <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  +{trip.participants.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              {trip.organizer.photo ? (
                <img 
                  src={trip.organizer.photo} 
                  alt={trip.organizer.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-teal-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{trip.organizer.name}</p>
              <p className="text-xs text-gray-500">{trip.organizer.city}</p>
            </div>
          </div>

          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPersonaColor(trip.organizer.travelPersona)}`}>
            {trip.organizer.travelPersona}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;