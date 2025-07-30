import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  Plane,
  Train,
  Bus,
  Car,
  Sparkles,
  Wand2
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload.tsx';

interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  location: string;
}

interface TripFormData {
  title: string;
  destination: string;
  coverPhoto: string;
  dates: {
    start: string;
    end: string;
  };
  travelMode: string;
  itinerary: ItineraryItem[];
  rules: string;
  maxParticipants: number;
  interests: string;
  generateItineraryAuto: boolean;
}

const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingItinerary, setGeneratingItinerary] = useState(false);
  const [formData, setFormData] = useState<TripFormData>({
    title: '',
    destination: '',
    coverPhoto: '',
    dates: {
      start: '',
      end: ''
    },
    travelMode: '',
    itinerary: [],
    rules: '',
    maxParticipants: 10,
    interests: '',
    generateItineraryAuto: false
  });

  const travelModes = [
    { value: 'flight', label: 'Flight', icon: Plane },
    { value: 'train', label: 'Train', icon: Train },
    { value: 'bus', label: 'Bus', icon: Bus },
    { value: 'car', label: 'Car', icon: Car },
    { value: 'other', label: 'Other', icon: MapPin }
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof TripFormData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addItineraryItem = () => {
    const newItem: ItineraryItem = {
      day: formData.itinerary.length + 1,
      title: '',
      description: '',
      location: ''
    };
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, newItem]
    }));
  };

  const updateItineraryItem = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItineraryItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index).map((item, i) => ({
        ...item,
        day: i + 1
      }))
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.destination && formData.dates.start && formData.dates.end && formData.travelMode);
      case 2:
        return true; // Itinerary is optional
      case 3:
        return !!(formData.rules && formData.rules.length >= 10 && formData.maxParticipants >= 2);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const generateItinerary = async () => {
    if (!formData.destination || !formData.dates.start || !formData.dates.end || !formData.interests) {
      toast.error('Please fill in destination, dates, and interests first');
      return;
    }

    try {
      setGeneratingItinerary(true);
      const duration = Math.ceil((new Date(formData.dates.end).getTime() - new Date(formData.dates.start).getTime()) / (1000 * 60 * 60 * 24));
      
      const response = await axios.post('/trips/generate-itinerary', {
        destination: formData.destination,
        interests: formData.interests,
        duration: duration
      });

      if (response.data.itinerary && response.data.itinerary.length > 0) {
        setFormData(prev => ({
          ...prev,
          itinerary: response.data.itinerary,
          generateItineraryAuto: true
        }));
        toast.success('Itinerary generated successfully!');
      } else {
        toast.error('Failed to generate itinerary. Please try again.');
      }
    } catch (error: any) {
      console.error('Generate itinerary error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to generate itinerary. Please try again.');
      }
    } finally {
      setGeneratingItinerary(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Additional validation
    if (formData.rules.length < 10) {
      toast.error('Rules must be at least 10 characters long');
      return;
    }

    if (formData.title.length < 3) {
      toast.error('Title must be at least 3 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/trips', formData);
      toast.success('Trip created successfully!');
      navigate(`/trips/${response.data.trip._id}`);
    } catch (error: any) {
      console.error('Create trip error:', error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const firstError = error.response.data.errors[0];
        toast.error(firstError.msg || 'Validation error');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create trip. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a catchy trip title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  placeholder="Where are you going?"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Photo
              </label>
              <ImageUpload
                onImageUpload={(imageUrl) => handleInputChange('coverPhoto', imageUrl)}
                currentImage={formData.coverPhoto}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.dates.start}
                  onChange={(e) => handleInputChange('dates.start', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.dates.end}
                  onChange={(e) => handleInputChange('dates.end', e.target.value)}
                  min={formData.dates.start || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Mode *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {travelModes.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleInputChange('travelMode', value)}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      formData.travelMode === value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Interests
              </label>
              <input
                type="text"
                value={formData.interests}
                onChange={(e) => handleInputChange('interests', e.target.value)}
                placeholder="e.g., museums, food, shopping, historical sites, adventure sports"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-2">
                This will help us generate a personalized itinerary for you
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Trip Itinerary</h3>
              <div className="flex space-x-3">
                {formData.destination && formData.dates.start && formData.dates.end && formData.interests && (
                  <button
                    type="button"
                    onClick={generateItinerary}
                    disabled={generatingItinerary}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {generatingItinerary ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    <span>{generatingItinerary ? 'Generating...' : 'Auto Generate'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={addItineraryItem}
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Day</span>
                </button>
              </div>
            </div>

            {!formData.destination || !formData.dates.start || !formData.dates.end || !formData.interests ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Auto-Generate Itinerary</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Complete the destination, dates, and interests in Step 1 to unlock AI-powered itinerary generation!
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {formData.itinerary.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No itinerary items yet. Add your first day or use auto-generate!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.generateItineraryAuto && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-900">AI-Generated Itinerary</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      This itinerary was automatically generated based on your interests. You can edit or add more days as needed.
                    </p>
                  </div>
                )}
                {formData.itinerary.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Day {item.day}</h4>
                      <button
                        type="button"
                        onClick={() => removeItineraryItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItineraryItem(index, 'title', e.target.value)}
                          placeholder="Activity title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={item.location}
                          onChange={(e) => updateItineraryItem(index, 'location', e.target.value)}
                          placeholder="Location"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <textarea
                        value={item.description}
                        onChange={(e) => updateItineraryItem(index, 'description', e.target.value)}
                        placeholder="Describe the activities for this day"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Rules & Guidelines *
              </label>
              <textarea
                value={formData.rules}
                onChange={(e) => handleInputChange('rules', e.target.value)}
                placeholder="Set clear expectations for your trip participants..."
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  formData.rules.length > 0 && formData.rules.length < 10
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-600">
                  Include information about costs, behavior expectations, meeting points, etc.
                </p>
                <p className={`text-sm ${
                  formData.rules.length < 10 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {formData.rules.length}/10 min
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Participants *
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                min={2}
                max={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-2">
                Choose between 2-20 participants (including yourself)
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Trip</h1>
          <p className="text-gray-600 mt-2">Plan your adventure and find travel companions</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Basic Details</span>
            <span>Itinerary</span>
            <span>Rules & Settings</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <span>Create Trip</span>
                  <Plus className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
