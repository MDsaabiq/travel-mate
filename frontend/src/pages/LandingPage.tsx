import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const stats = [
  { label: 'Happy Travelers', value: '10,000+' },
  { label: 'Trips Organized', value: '500+' },
  { label: 'Cities Covered', value: '100+' },
];

const destinations = [
  { title: 'Goa', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
  { title: 'Jaipur', image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80' },
  { title: 'Ladakh', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80' },
  { title: 'Kerala', image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80' },
  { title: 'Hampi', image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80' },
  { title: 'Manali', image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80' },
];

const testimonials = [
  {
    name: 'Aditi Sharma',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'TourMate made my solo trip to Ladakh unforgettable! The itinerary and companions were perfect.',
  },
  {
    name: 'Rahul Verma',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'I found the best group to explore Goa. Everything was super easy and fun!',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-teal-50 to-white min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80)' }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center text-center text-white px-4">
          <Logo size="lg" showText className="mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-2 drop-shadow-lg">Make your Trip Memorable with <span className="text-teal-300">TourMate</span></h1>
          <p className="text-lg md:text-2xl mb-6 max-w-2xl drop-shadow">Plan, join, and experience the best trips across India with like-minded travelers.</p>
          <div className="flex space-x-4 mt-4">
            <Link to="/register" className="px-6 py-2 bg-teal-600 hover:bg-teal-700 rounded-full text-lg font-semibold shadow">Get Started</Link>
            <Link to="/trips" className="px-6 py-2 bg-white text-teal-700 hover:bg-teal-50 rounded-full text-lg font-semibold shadow">Explore Trips</Link>
          </div>
        </div>
      </section>

      {/* Stats & About Section */}
      <section className="max-w-6xl mx-auto py-16 px-4 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" alt="About TourMate" className="rounded-2xl shadow-lg w-full mb-6 md:mb-0" />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-4 text-teal-700">About TourMate</h2>
          <p className="text-gray-600 mb-6">TourMate is your trusted platform for discovering, planning, and joining group trips across India. Whether you’re a solo traveler or love exploring with friends, our community and tools make every journey memorable and safe.</p>
          <div className="flex space-x-8 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-teal-600">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
          <Link to="/register" className="inline-block px-6 py-2 bg-teal-600 hover:bg-teal-700 rounded-full text-white font-semibold shadow">Join Now</Link>
        </div>
      </section>

      {/* AI Intelligence Features Section */}
      <section className="max-w-5xl mx-auto py-16 px-4">
        <h3 className="text-2xl font-bold mb-6 text-center text-teal-700">AI Intelligence at Your Service</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center">
            <span className="text-4xl mb-4">🤖</span>
            <h4 className="font-semibold text-lg mb-2 text-teal-700">AI Itinerary Generation</h4>
            <p className="text-gray-600">Get a personalized day-by-day trip plan instantly, tailored to your destination, interests, and travel dates—powered by advanced AI.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center opacity-80">
            <span className="text-4xl mb-4">🧑‍💼</span>
            <h4 className="font-semibold text-lg mb-2 text-teal-700">Auto Agent Bookings <span className="text-xs bg-yellow-200 text-yellow-800 rounded px-2 ml-1">Coming Soon</span></h4>
            <p className="text-gray-600">Soon, let our AI agents book hotels, flights, and activities for you—hands free and hassle free!</p>
          </div>
          <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center opacity-80">
            <span className="text-4xl mb-4">✨</span>
            <h4 className="font-semibold text-lg mb-2 text-teal-700">Dynamic Tour Recommendations <span className="text-xs bg-yellow-200 text-yellow-800 rounded px-2 ml-1">Coming Soon</span></h4>
            <p className="text-gray-600">Our upcoming AI engine will suggest the best tours and experiences for you, based on your preferences and travel history.</p>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold mb-8 text-center text-teal-700">Explore Popular Destinations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <div key={dest.title} className="rounded-xl overflow-hidden shadow-lg group hover:shadow-2xl transition relative">
                <img src={dest.image} alt={dest.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="text-white font-bold text-lg drop-shadow">{dest.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-teal-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl font-bold mb-8 text-center text-teal-700">Why Everyone Loves TourMate</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center">
                <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full mb-4" />
                <p className="text-gray-600 italic mb-2">“{t.text}”</p>
                <span className="font-semibold text-teal-700">- {t.name}</span>
                <div className="flex mt-2 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/Message Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-2xl font-bold mb-6 text-teal-700 text-center">Send Us a Message</h3>
          <form className="bg-white rounded-xl shadow p-8 flex flex-col gap-4">
            <input type="text" placeholder="Your Name" className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200" />
            <input type="email" placeholder="Your Email" className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200" />
            <textarea placeholder="Your Message" rows={4} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200" />
            <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full font-semibold">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-900 text-white py-8 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Logo size="sm" showText={false} />
            <span className="font-bold text-lg">TourMate</span>
          </div>
          <div className="text-sm">&copy; {new Date().getFullYear()} TourMate. All rights reserved.</div>
          <div className="text-sm">Contact: support@tourmate.com</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
