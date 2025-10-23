import React, { useState, useEffect } from 'react';
import { AlertCircle, Users, Heart, CheckCircle2, X } from 'lucide-react';
import api from '../services/api';

interface Demographics {
  male: number;
  female: number;
  other: number;
  total: number;
}

interface JoinDisclaimerModalProps {
  isOpen: boolean;
  tripId: string;
  tripTitle: string;
  rules: string;
  onAgree: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const JoinDisclaimerModal: React.FC<JoinDisclaimerModalProps> = ({
  isOpen,
  tripId,
  tripTitle,
  rules,
  onAgree,
  onCancel,
  isLoading = false
}) => {
  const [agreed, setAgreed] = useState(false);
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tripId) {
      fetchDemographics();
    }
  }, [isOpen, tripId]);

  const fetchDemographics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/trips/${tripId}/demographics`);
      setDemographics(response.data.demographics);
    } catch (error) {
      console.error('Error fetching demographics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Join Trip Agreement</h2>
            <p className="text-blue-100 text-sm mt-1">{tripTitle}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-white hover:bg-blue-700 rounded-full p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Gender Demographics Section */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Users className="text-pink-600 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Trip Participants</h3>
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
              </div>
            ) : demographics ? (
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{demographics.male}</div>
                  <div className="text-sm text-gray-600 font-medium">Males</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-pink-600">{demographics.female}</div>
                  <div className="text-sm text-gray-600 font-medium">Females</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">{demographics.other}</div>
                  <div className="text-sm text-gray-600 font-medium">Other</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border-2 border-blue-300">
                  <div className="text-2xl font-bold text-blue-600">{demographics.total}</div>
                  <div className="text-sm text-gray-600 font-medium">Total</div>
                </div>
              </div>
            ) : null}
            
            <p className="text-sm text-gray-700 mt-3 italic">
              ℹ️ This information is displayed for your safety and security awareness.
            </p>
          </div>

          {/* Trip Rules Section */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <div className="flex items-start mb-3">
              <Heart className="text-blue-600 mr-3 flex-shrink-0 mt-1" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Trip Rules & Guidelines</h3>
            </div>
            <div className="bg-white rounded p-3 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed max-h-48 overflow-y-auto">
              {rules}
            </div>
          </div>

          {/* Disclaimer Section */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="text-red-600 mr-3 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-2">Important Community Guidelines</h3>
                <div className="text-sm text-red-900 space-y-2">
                  <p>
                    <strong>🚨 Code of Conduct:</strong> This is a safe and respectful travel community. All members are expected to conduct themselves professionally and respectfully.
                  </p>
                  <p>
                    <strong>⚠️ Zero Tolerance Policy:</strong> Any form of harassment, misbehavior, or misconduct will result in serious consequences, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Immediate removal from the trip</li>
                    <li>Permanent ban from the platform</li>
                    <li>Legal action may be pursued if applicable</li>
                    <li>Reports to relevant authorities</li>
                  </ul>
                  <p className="mt-2">
                    <strong>✅ Stay Safe:</strong> Respect other participants' boundaries, follow all rules, and report any concerning behavior to trip organizers immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer mt-1 mr-3 accent-blue-600"
            />
            <label htmlFor="agree" className="flex-1 cursor-pointer">
              <span className="text-gray-800 font-medium">
                I understand and agree to all trip rules, community guidelines, and the zero-tolerance policy for misbehavior.
              </span>
              <p className="text-sm text-gray-600 mt-1">
                By checking this box, you acknowledge that serious misconduct may result in permanent ban from the platform and legal action.
              </p>
            </label>
          </div>

          {/* Safety Reminder */}
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3 flex items-start">
            <CheckCircle2 className="text-green-600 mr-2 flex-shrink-0 mt-1" size={20} />
            <p className="text-sm text-green-800">
              <strong>Safe Travel Tip:</strong> Always share your trip details with family/friends, stay in contact with other participants, and trust your instincts about safety concerns.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-gray-100 p-6 flex gap-3 justify-end border-t-2 border-gray-300">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={onAgree}
            disabled={!agreed || isLoading}
            className={`px-6 py-2 text-white rounded-lg font-semibold transition flex items-center gap-2 ${
              agreed && !isLoading
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            {isLoading && (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            )}
            {isLoading ? 'Processing...' : 'I Agree & Join Trip'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinDisclaimerModal;