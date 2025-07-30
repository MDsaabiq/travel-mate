import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Mail,
  Users,
  Heart,
  Settings
} from 'lucide-react';
import TripCard from '../components/TripCard';
import ProfileImageUpload from '../components/ProfileImageUpload';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  bio: string;
  city: string;
  age?: number;
  gender: string;
  travelPersona: string;
  interests: string[];
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

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizedTrips, setOrganizedTrips] = useState<Trip[]>([]);
  const [joinedTrips, setJoinedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'organized' | 'joined'>('organized');

  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    city: '',
    age: '',
    gender: '',
    travelPersona: '',
    interests: [] as string[]
  });

  useEffect(() => {
    fetchProfile();
    fetchUserTrips();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/users/${user?._id}/profile`);
      setProfile(response.data.user);
      setEditForm({
        name: response.data.user.name || '',
        bio: response.data.user.bio || '',
        city: response.data.user.city || '',
        age: response.data.user.age?.toString() || '',
        gender: response.data.user.gender || '',
        travelPersona: response.data.user.travelPersona || '',
        interests: response.data.user.interests || []
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchUserTrips = async () => {
    try {
      setLoading(true);
      const [organizedResponse, joinedResponse] = await Promise.all([
        axios.get(`/users/${user?._id}/trips/organized`),
        axios.get(`/users/${user?._id}/trips/joined`)
      ]);
      
      setOrganizedTrips(organizedResponse.data.trips || []);
      setJoinedTrips(joinedResponse.data.trips || []);
    } catch (error) {
      console.error('Error fetching user trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updateData = {
        ...editForm,
        age: editForm.age ? parseInt(editForm.age) : undefined
      };
      
      const response = await axios.put(`/users/${user?._id}/profile`, updateData);
      setProfile(response.data.user);
      updateUser(response.data.user);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        bio: profile.bio || '',
        city: profile.city || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        travelPersona: profile.travelPersona || '',
        interests: profile.interests || []
      });
    }
    setEditing(false);
  };

  const handleInterestToggle = (interest: string) => {
    setEditForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleImageUpload = async (imageUrl: string) => {
    try {
      const response = await axios.put(`/users/${user?._id}/profile`, {
        photo: imageUrl
      });
      setProfile(response.data.user);
      updateUser(response.data.user);
      
      // Update edit form as well
      setEditForm(prev => ({
        ...prev,
        photo: imageUrl
      }));
    } catch (error: any) {
      console.error('Error updating profile image:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile image');
    }
  };

  const commonInterests = [
    'Adventure', 'Photography', 'Food', 'Culture', 'Nature', 'History',
    'Art', 'Music', 'Sports', 'Beach', 'Mountains', 'Cities'
  ];

  const travelPersonas = [
    { value: 'solo', label: 'Solo Explorer' },
    { value: 'planner', label: 'Trip Planner' },
    { value: 'adventurer', label: 'Adventurer' }
  ];

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <ProfileImageUpload
                  currentImage={profile.photo}
                  userName={profile.name}
                  onImageUpload={handleImageUpload}
                  className="mx-auto sm:mx-0"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-teal-500 outline-none bg-transparent"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                    )}
                    <div className="flex items-center justify-center sm:justify-start text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {editing ? (
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                          className="border-b border-gray-300 focus:border-teal-500 outline-none bg-transparent"
                        />
                      ) : (
                        <span>{profile.city}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-0">
                    {editing ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
                    {editing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell others about yourself..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.bio || 'No bio added yet.'}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Travel Persona</h3>
                      {editing ? (
                        <select
                          value={editForm.travelPersona}
                          onChange={(e) => setEditForm(prev => ({ ...prev, travelPersona: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          {travelPersonas.map(persona => (
                            <option key={persona.value} value={persona.value}>{persona.label}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-900 capitalize">{profile.travelPersona}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Age</h3>
                        {editing ? (
                          <input
                            type="number"
                            value={editForm.age}
                            onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                            min="18"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.age || 'Not specified'}</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Gender</h3>
                        {editing ? (
                          <select
                            value={editForm.gender}
                            onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 capitalize">{profile.gender || 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Interests</h3>
                  {editing ? (
                    <div className="flex flex-wrap gap-2">
                      {commonInterests.map(interest => (
                        <button
                          key={interest}
                          onClick={() => handleInterestToggle(interest)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            editForm.interests.includes(interest)
                              ? 'bg-teal-100 text-teal-700 border border-teal-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.length > 0 ? (
                        profile.interests.map(interest => (
                          <span
                            key={interest}
                            className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No interests added yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trip Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('organized')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'organized'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Organized Trips ({organizedTrips.length})
                </button>
                <button
                  onClick={() => setActiveTab('joined')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'joined'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Joined Trips ({joinedTrips.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(activeTab === 'organized' ? organizedTrips : joinedTrips).length > 0 ? (
                    (activeTab === 'organized' ? organizedTrips : joinedTrips).map(trip => (
                      <TripCard 
                        key={trip._id} 
                        trip={trip} 
                        showReviewButton={activeTab === 'joined'}
                        onReviewSubmitted={fetchUserTrips}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No {activeTab} trips yet
                      </h3>
                      <p className="text-gray-600">
                        {activeTab === 'organized' 
                          ? 'Start planning your first trip!' 
                          : 'Join some exciting trips to see them here.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
