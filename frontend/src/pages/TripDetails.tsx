import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle,
  Share2,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Settings,
  Plane,
  Train,
  Bus,
  Car,
  Trash2,
  Star,
  RotateCw
} from 'lucide-react';

interface Review {
  _id?: string;
  user: {
    _id: string;
    name: string;
    photo?: string;
  };
  rating: number;
  description: string;
  createdAt: string;
}

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
  itinerary: Array<{
    _id?: string;
    day: number;
    title: string;
    description: string;
    location: string;
  }>;
  rules: string;
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
  joinRequests: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      photo?: string;
    };
    status: string;
    createdAt: string;
  }>;
  reviews: Review[];
  previousReviews: Review[];
  averageRating: number;
  maxParticipants: number;
  isActive: boolean;
  status: 'not_started' | 'in_journey' | 'ended';
}

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewDescription, setReviewDescription] = useState('');
  const [restartModalOpen, setRestartModalOpen] = useState(false);
  const [restartStartDate, setRestartStartDate] = useState('');
  const [restartEndDate, setRestartEndDate] = useState('');

  useEffect(() => {
    if (id) {
      fetchTripDetails();
    }
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data.trip);
    } catch (error: any) {
      console.error('Error fetching trip details:', error);
      toast.error('Failed to load trip details');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTrip = async () => {
    try {
      setActionLoading(true);
      await api.post(`/trips/${id}/join`);
      toast.success('Join request sent successfully!');
      fetchTripDetails(); // Refresh data
    } catch (error: any) {
      console.error('Error joining trip:', error);
      toast.error(error.response?.data?.message || 'Failed to join trip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTrip = async () => {
    try {
      setActionLoading(true);
      await api.post(`/trips/${id}/leave`);
      toast.success('Left trip successfully');
      fetchTripDetails(); // Refresh data
    } catch (error: any) {
      console.error('Error leaving trip:', error);
      toast.error(error.response?.data?.message || 'Failed to leave trip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(true);
      const response = await api.post(`/trips/${id}/join-requests/${requestId}/${action}`);
      toast.success(`Request ${action}d successfully`);

      // Update the trip state immediately to reflect changes
      if (response.data.trip) {
        setTrip(response.data.trip);
      } else {
        fetchTripDetails(); // Fallback to refresh data
      }
    } catch (error: any) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        await api.delete(`/trips/${id}`);
        toast.success('Trip deleted successfully');
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Error deleting trip:', error);
        toast.error(error.response?.data?.message || 'Failed to delete trip');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (reviewDescription.length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/trips/${id}/reviews`, {
        rating: reviewRating,
        description: reviewDescription
      });
      toast.success('Review added successfully!');
      fetchTripDetails();
      setReviewFormOpen(false);
      setReviewDescription('');
      setReviewRating(5);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to add review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestartTrip = async () => {
    if (!id) return;

    if (!restartStartDate || !restartEndDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      setActionLoading(true);
      const response = await api.post(`/trips/${id}/restart`, {
        dates: {
          start: restartStartDate,
          end: restartEndDate
        }
      });
      toast.success('Trip restarted successfully! Previous reviews will be visible on the completed trip.');
      navigate(`/trips/${response.data.trip._id}`);
    } catch (error: any) {
      console.error('Error restarting trip:', error);
      toast.error(error.response?.data?.message || 'Failed to restart trip');
    } finally {
      setActionLoading(false);
      setRestartModalOpen(false);
    }
  };

  const getTravelModeIcon = (mode: string) => {
    switch (mode) {
      case 'flight': return Plane;
      case 'train': return Train;
      case 'bus': return Bus;
      case 'car': return Car;
      default: return MapPin;
    }
  };

  const isOrganizer = trip?.organizer._id === user?._id;
  const isParticipant = trip?.participants.some(p => p._id === user?._id);
  const hasJoinRequest = trip?.joinRequests.some(r => r.user._id === user?._id && r.status === 'pending');
  const canJoin = trip && trip.status !== 'ended' && !isParticipant && !hasJoinRequest && trip.participants.length < trip.maxParticipants;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
          <p className="text-gray-600 mb-4">The trip you're looking for doesn't exist.</p>
          <Link to="/trips" className="text-teal-600 hover:text-teal-700">
            Browse all trips
          </Link>
        </div>
      </div>
    );
  }

  const TravelModeIcon = getTravelModeIcon(trip.travelMode);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/trips')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Trips</span>
          </button>
        </div>

        {/* Trip Cover */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {trip.coverPhoto && (
            <div className="aspect-video bg-gray-200">
              <img
                src={trip.coverPhoto}
                alt={trip.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.title}</h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TravelModeIcon className="w-4 h-4" />
                    <span className="capitalize">{trip.travelMode}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isParticipant && (
                  <Link
                    to={`/chat?trip=${trip._id}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </Link>
                )}
                
                {canJoin && (
                  <button
                    onClick={handleJoinTrip}
                    disabled={actionLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Join Trip</span>
                  </button>
                )}
                
                {isParticipant && !isOrganizer && trip.status !== 'in_journey' && (
                  <button
                    onClick={handleLeaveTrip}
                    disabled={actionLoading}
                    className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Leave Trip</span>
                  </button>
                )}
                {isOrganizer && trip.status === 'ended' && (
                  <button
                    onClick={() => setRestartModalOpen(true)}
                    disabled={actionLoading}
                    className="flex items-center space-x-2 px-4 py-2 border border-teal-300 text-teal-600 rounded-lg hover:bg-teal-50"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Restart Trip</span>
                  </button>
                )}
                {isOrganizer && trip.status !== 'in_journey' && (
                  <button
                    onClick={handleDeleteTrip}
                    disabled={actionLoading}
                    className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Trip</span>
                  </button>
                )}
              </div>
            </div>

            {/* Trip Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(trip.dates.start), 'MMM dd')} - {format(new Date(trip.dates.end), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>{trip.participants.length}/{trip.maxParticipants} participants</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{Math.floor((new Date(trip.dates.end).getTime() - new Date(trip.dates.start).getTime()) / (1000 * 60 * 60 * 24)) + 1} days</span>
              </div>
            </div>

            {/* Organizer */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                {trip.organizer?.photo ? (
                  <img src={trip.organizer.photo} alt={trip.organizer.name || 'Organizer'} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-gray-600 font-medium">{trip.organizer?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{trip.organizer?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-600">Trip Organizer{trip.organizer?.city ? ` • ${trip.organizer.city}` : ''}{trip.organizer?.travelPersona ? ` • ${trip.organizer.travelPersona}` : ''}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Itinerary */}
            {trip.itinerary.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Itinerary</h2>
                <div className="space-y-4">
                  {trip.itinerary.map((item, index) => (
                    <div key={item._id || `itinerary-${item.day}-${index}`} className="border-l-4 border-teal-500 pl-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-teal-600">Day {item.day}</span>
                        {item.location && (
                          <span className="text-sm text-gray-500">• {item.location}</span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      {item.description && (
                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Rules & Guidelines</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{trip.rules}</p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                  {trip.averageRating > 0 && (
                    <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{trip.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-600">({trip.reviews.length})</span>
                    </div>
                  )}
                </div>
                {trip.status === 'ended' && isParticipant && !trip.reviews.find(r => r.user._id === user?._id) && (
                  <button
                    onClick={() => setReviewFormOpen(!reviewFormOpen)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                  >
                    {reviewFormOpen ? 'Cancel' : 'Add Review'}
                  </button>
                )}
              </div>

              {/* Review Form */}
              {reviewFormOpen && trip.status === 'ended' && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none transition-colors"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewRating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{reviewRating}/5</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                    <textarea
                      value={reviewDescription}
                      onChange={(e) => setReviewDescription(e.target.value)}
                      placeholder="Share your experience on this trip..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">{reviewDescription.length}/500</p>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading || reviewDescription.length < 10}
                    className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {/* Current Reviews */}
                {trip.reviews.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Recent Reviews</h3>
                    {trip.reviews.map((review) => (
                      <div key={review._id} className="p-4 border border-gray-200 rounded-lg mb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              {review.user?.photo && user?._id === review.user._id ? (
                                <img src={review.user.photo} alt={review.user.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-xs font-medium text-gray-600">{user?._id === review.user?._id ? review.user?.name?.charAt(0) : 'U'}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{user?._id === review.user?._id ? review.user?.name : 'Anonymous'}</p>
                              <p className="text-xs text-gray-500">{format(new Date(review.createdAt), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{review.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Previous Reviews from Earlier Instance */}
                {trip.previousReviews && trip.previousReviews.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Reviews from Previous Trip</h3>
                    {trip.previousReviews.map((review, index) => (
                      <div key={index} className="p-4 border border-gray-100 rounded-lg mb-3 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              {review.user?.photo && user?._id === review.user._id ? (
                                <img src={review.user.photo} alt={review.user?.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-xs font-medium text-gray-600">{user?._id === review.user?._id ? review.user?.name?.charAt(0) : 'U'}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{user?._id === review.user?._id ? review.user?.name : 'Anonymous'}</p>
                              <p className="text-xs text-gray-500">{format(new Date(review.createdAt), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{review.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {trip.reviews.length === 0 && (!trip.previousReviews || trip.previousReviews.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No reviews yet. {trip.status === 'ended' && isParticipant ? 'Be the first to review!' : ''}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Participants ({trip.participants.length}/{trip.maxParticipants})
              </h3>
              <div className="space-y-3">
                {trip.participants.map((participant) => (
                  <div key={participant._id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      {participant.photo ? (
                        <img src={participant.photo} alt={participant.name || 'Participant'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-xs font-medium text-gray-600">{participant.name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{participant.name || 'Unknown'}</p>
                      {participant._id === trip.organizer?._id && (
                        <p className="text-xs text-teal-600">Organizer</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Join Requests (Only for organizer) */}
            {isOrganizer && trip.joinRequests.filter(r => r.status === 'pending').length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Join Requests ({trip.joinRequests.filter(r => r.status === 'pending').length})
                </h3>
                <div className="space-y-3">
                  {trip.joinRequests.filter(r => r.status === 'pending').map((request) => (
                    <div key={request._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          {request.user?.photo ? (
                            <img src={request.user.photo} alt={request.user.name || 'User'} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">{request.user?.name?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{format(new Date(request.createdAt), 'MMM dd')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleJoinRequestAction(request._id, 'approve')}
                          disabled={actionLoading}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleJoinRequestAction(request._id, 'reject')}
                          disabled={actionLoading}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Restart Trip Modal */}
        {restartModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Restart Trip with New Dates</h3>
              <p className="text-gray-600 text-sm mb-6">
                The trip details will remain the same, but you can set new travel dates. All previous reviews will remain visible.
              </p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Start Date
                  </label>
                  <input
                    type="date"
                    value={restartStartDate}
                    onChange={(e) => setRestartStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New End Date
                  </label>
                  <input
                    type="date"
                    value={restartEndDate}
                    onChange={(e) => setRestartEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRestartModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestartTrip}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Restarting...' : 'Restart Trip'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetails;
