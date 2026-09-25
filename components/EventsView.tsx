import React, { useState } from 'react';
import { Event } from '../types-extended';
import AnimatedElement from './AnimatedElement';

interface EventsViewProps {
  events: Event[];
  userId: string;
  onRegister: (eventId: string) => void;
  onUnregister: (eventId: string) => void;
}

const getCategoryColor = (category: Event['category']) => {
  switch (category) {
    case 'academic': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
    case 'cultural': return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
    case 'sports': return 'bg-green-600/20 text-green-300 border-green-500/30';
    case 'club': return 'bg-orange-600/20 text-orange-300 border-orange-500/30';
    default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
  }
};

const getCategoryIcon = (category: Event['category']) => {
  switch (category) {
    case 'academic':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'cultural':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    case 'sports':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'club':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
  }
};

const EventsView: React.FC<EventsViewProps> = ({ events, userId, onRegister, onUnregister }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'myEvents'>('upcoming');
  const [filterCategory, setFilterCategory] = useState<Event['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const now = new Date().toISOString().split('T')[0];
  
  const filteredEvents = events.filter(event => {
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const isUpcoming = event.date >= now;
    const isRegistered = event.registeredStudents.includes(userId);

    if (activeTab === 'upcoming') {
      return matchesCategory && matchesSearch && isUpcoming;
    } else if (activeTab === 'past') {
      return matchesCategory && matchesSearch && !isUpcoming;
    } else {
      return matchesCategory && matchesSearch && isRegistered;
    }
  }).sort((a, b) => {
    return activeTab === 'past' 
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Campus Events</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{events.length} total events</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'upcoming' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'past' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Past Events
          </button>
          <button
            onClick={() => setActiveTab('myEvents')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'myEvents' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            My Events
          </button>
        </div>
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as Event['category'] | 'all')}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          <option value="academic">Academic</option>
          <option value="cultural">Cultural</option>
          <option value="sports">Sports</option>
          <option value="club">Club</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No events found</p>
            {activeTab === 'myEvents' && (
              <p className="text-sm mt-2">You haven't registered for any events yet</p>
            )}
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isRegistered = event.registeredStudents.includes(userId);
            const isFull = event.maxParticipants ? event.registeredStudents.length >= event.maxParticipants : false;
            const isPast = event.date < now;

            return (
              <AnimatedElement key={event.id}>
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all overflow-hidden flex flex-col h-full">
                  <div className={`p-4 ${getCategoryColor(event.category)} border-b border-gray-700`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(event.category)}
                        <span className="font-medium capitalize">{event.category}</span>
                      </div>
                      {isPast && (
                        <span className="text-xs font-medium px-2 py-1 bg-gray-600/50 rounded">Completed</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-2">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-300 mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{event.time} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    {event.maxParticipants && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{event.registeredStudents.length} registered</span>
                          <span>{event.maxParticipants} spots</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min((event.registeredStudents.length / event.maxParticipants) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {!isPast && (
                      <button
                        onClick={() => isRegistered ? onUnregister(event.id) : onRegister(event.id)}
                        disabled={!isRegistered && isFull}
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                          isRegistered
                            ? 'bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30'
                            : isFull
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {isRegistered ? 'Unregister' : isFull ? 'Event Full' : 'Register'}
                      </button>
                    )}
                  </div>
                </div>
              </AnimatedElement>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventsView;
