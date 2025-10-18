import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  Send, 
  MessageCircle, 
  Users, 
  Search,
  MoreVertical,
  Menu,
  X
} from 'lucide-react';

interface Message {
  _id: string;
  tripId: string;
  sender: {
    _id: string;
    name: string;
    photo?: string;
  };
  content: string;
  timestamp: string;
  createdAt: string;
}

interface Trip {
  _id: string;
  title: string;
  destination: string;
  participants: Array<{
    _id: string;
    name: string;
    photo?: string;
  }>;
}

const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768); // Show sidebar on desktop, hide on mobile
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tripId = searchParams.get('trip');

  useEffect(() => {
    fetchUserTrips();
  }, []);

  useEffect(() => {
    if (tripId && userTrips.length > 0) {
      const trip = userTrips.find(t => t._id === tripId);
      if (trip) {
        setSelectedTrip(trip);
        fetchMessages(tripId);
      }
    }
  }, [tripId, userTrips]);

  useEffect(() => {
    if (selectedTrip && socket) {
      // Join trip room
      socket.emit('join-trip', selectedTrip._id);

      // Listen for new messages from other users
      socket.on('new-message', (message: Message) => {
        if (message.tripId === selectedTrip._id) {
          setMessages(prev => {
            // Prevent duplicate messages
            const exists = prev.some(msg => msg._id === message._id);
            if (exists) return prev;
            return [...prev, message];
          });
        }
      });

      return () => {
        socket.off('new-message');
        socket.emit('leave-trip', selectedTrip._id);
      };
    }
  }, [selectedTrip, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUserTrips = async () => {
    try {
      setLoading(true);
      // Fetch both organized and joined trips
      const [organizedResponse, joinedResponse] = await Promise.all([
        axios.get(`/users/${user?._id}/trips/organized`),
        axios.get(`/users/${user?._id}/trips/joined`)
      ]);

      // Combine both organized and joined trips
      const allTrips = [
        ...(organizedResponse.data.trips || []),
        ...(joinedResponse.data.trips || [])
      ];

      // Remove duplicates (in case user is both organizer and participant)
      const uniqueTrips = allTrips.filter((trip, index, self) =>
        index === self.findIndex(t => t._id === trip._id)
      );

      setUserTrips(uniqueTrips);

      // If no specific trip selected, select the first one
      if (!tripId && uniqueTrips.length > 0) {
        setSelectedTrip(uniqueTrips[0]);
        fetchMessages(uniqueTrips[0]._id);
      }
    } catch (error) {
      console.error('Error fetching user trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (tripId: string) => {
    try {
      const response = await axios.get(`/chat/${tripId}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTrip || sending) return;

    try {
      setSending(true);
      const response = await axios.post(`/chat/${selectedTrip._id}/messages`, {
        content: newMessage.trim()
      });

      // Add message to local state immediately
      const newMsg = response.data.data;
      setMessages(prev => [...prev, newMsg]);

      // Emit message via socket for real-time delivery to other users
      if (socket) {
        socket.emit('send-message', {
          tripId: selectedTrip._id,
          message: newMsg
        });
      }

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 48) {
      return 'Yesterday ' + format(date, 'HH:mm');
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const filteredTrips = userTrips.filter(trip =>
    trip.title.toLowerCase().includes(searchText.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full h-screen flex flex-col md:flex-row">
        {/* Mobile: Trip List Sidebar (Hidden by default) */}
        <div className={`absolute md:relative w-full md:w-80 h-full md:h-screen bg-white border-r border-gray-200 flex flex-col z-40 transform transition-transform duration-300 md:transform-none ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Your Trips</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredTrips.length === 0 ? (
              <div className="p-4 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No trips to chat about yet.</p>
                <p className="text-sm text-gray-500 mt-1">Join a trip to start messaging!</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredTrips.map((trip) => (
                  <button
                    key={trip._id}
                    onClick={() => {
                      setSelectedTrip(trip);
                      fetchMessages(trip._id);
                      setShowSidebar(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTrip?._id === trip._id
                        ? 'bg-teal-50 border border-teal-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {trip.title.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{trip.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{trip.destination}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{trip.participants.length} members</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile overlay */}
        {showSidebar && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col w-full h-full">
              {selectedTrip ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 sm:p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                    <div className="flex items-center space-x-3 md:space-x-0 flex-1">
                      <button
                        onClick={() => setShowSidebar(true)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Menu className="w-5 h-5" />
                      </button>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{selectedTrip.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{selectedTrip.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No messages yet.</p>
                        <p className="text-sm text-gray-500">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwnMessage = message.sender._id === user?._id;
                        return (
                          <div
                            key={message._id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex items-end space-x-2 max-w-xs sm:max-w-sm lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              {!isOwnMessage && (
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                  {message.sender.photo ? (
                                    <img src={message.sender.photo} alt={message.sender.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <span className="text-xs font-medium text-gray-600">{message.sender.name.charAt(0)}</span>
                                  )}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div
                                  className={`px-3 sm:px-4 py-2 rounded-2xl ${
                                    isOwnMessage
                                      ? 'bg-teal-600 text-white'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  <p className="text-sm break-words">{message.content}</p>
                                </div>
                                <div className={`mt-1 text-xs text-gray-500 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                                  {!isOwnMessage && <span className="font-medium">{message.sender.name} • </span>}
                                  {formatMessageTime(message.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-end space-x-2 sm:space-x-3">
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          rows={1}
                          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm sm:text-base"
                          style={{ minHeight: '40px', maxHeight: '120px' }}
                        />
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a trip to start chatting</h3>
                    <p className="text-gray-600">Choose a trip from the sidebar to view messages and chat with other participants.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
  );
};

export default Chat;
