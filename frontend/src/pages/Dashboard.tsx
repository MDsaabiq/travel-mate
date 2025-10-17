import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import TripCard from '../components/TripCard';
import toast from 'react-hot-toast';

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

interface DashboardStats {
  tripsOrganized: number;
  tripsJoined: number;
  totalTrips: number;
  pendingRequests: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [recommendedTrips, setRecommendedTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    tripsOrganized: 0,
    tripsJoined: 0,
    totalTrips: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [myTripsRes, recommendedRes] = await Promise.all([
        axios.get('/trips/user/my-trips'),
        axios.get('/trips?limit=6')
      ]);

      const trips = myTripsRes.data.trips;
      setRecommendedTrips(recommendedRes.data.trips);

      // Calculate stats
      const organized = trips.filter((t: Trip) => t.organizer._id === user?._id).length;
      const joined = trips.filter((t: Trip) => t.organizer._id !== user?._id).length;
      // Note: In a real app, you'd get pending requests from a separate endpoint
      
      setStats({
        tripsOrganized: organized,
        tripsJoined: joined,
        totalTrips: trips.length,
        pendingRequests: 0 // Placeholder
      });
      
      // Show all trips (organized and joined) in the "My Trips" section
      setMyTrips(trips);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-teal-100 text-sm sm:text-base lg:text-lg">
                  Ready for your next adventure? Discover amazing trips or create your own.
                </p>
              </div>
              <div className="hidden md:block flex-shrink-0">
                <Link
                  to="/create-trip"
                  className="bg-white text-teal-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center space-x-2 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Trip</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Trips Organized</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stats.tripsOrganized}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Trips Joined</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stats.tripsJoined}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Trips</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stats.totalTrips}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Active Chats</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{myTrips.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile */}
        <div className="md:hidden mb-8">
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/create-trip"
              className="bg-teal-600 text-white p-4 rounded-lg text-center font-medium hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-6 h-6 mx-auto mb-2" />
              Create Trip
            </Link>
            <Link
              to="/trips"
              className="bg-white text-gray-700 p-4 rounded-lg text-center font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <MapPin className="w-6 h-6 mx-auto mb-2" />
              Discover
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* My Trips */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <h2 className="text-2xl sm:text-2xl font-bold text-gray-900">My Trips</h2>
              <Link
                to="/trips?filter=my-trips"
                className="text-teal-600 hover:text-teal-700 font-medium text-sm whitespace-nowrap"
              >
                View all
              </Link>
            </div>

            {myTrips.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {myTrips.slice(0, 4).map((trip) => (
                  <TripCard key={trip._id} trip={trip} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-4">
                  Start your journey by creating a trip or joining an existing one.
                </p>
                <div className="space-y-2">
                  <Link
                    to="/create-trip"
                    className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Create Your First Trip
                  </Link>
                  <br />
                  <Link
                    to="/trips"
                    className="inline-block text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Browse Available Trips
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/create-trip"
                  className="flex items-center space-x-3 p-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Create New Trip</span>
                </Link>
                <Link
                  to="/trips"
                  className="flex items-center space-x-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Discover Trips</span>
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center space-x-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Messages</span>
                </Link>
              </div>
            </div>

            {/* Recommended Trips */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
              <div className="space-y-4">
                {recommendedTrips.slice(0, 3).map((trip) => (
                  <Link
                    key={trip._id}
                    to={`/trips/${trip._id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {trip.title}
                    </h4>
                    <div className="flex items-center space-x-1 text-xs text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{trip.participants.length}/{trip.maxParticipants}</span>
                      </div>
                      <span className="text-teal-600 font-medium">View Details</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;