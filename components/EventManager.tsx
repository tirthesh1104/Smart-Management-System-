import React, { useState } from 'react';
import { Event } from '../types-extended';
import Modal from './Modal';
import AnimatedElement from './AnimatedElement';

interface EventManagerProps {
  events: Event[];
  onCreateEvent: (event: Event) => void;
  onUpdateEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  userId: string;
  userName: string;
  students: { id: string; name: string }[];
}

const CATEGORIES: Event['category'][] = ['academic', 'cultural', 'sports', 'club', 'other'];

const getCategoryColor = (category: Event['category']) => {
  switch (category) {
    case 'academic': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
    case 'cultural': return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
    case 'sports': return 'bg-green-600/20 text-green-300 border-green-500/30';
    case 'club': return 'bg-orange-600/20 text-orange-300 border-orange-500/30';
    default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
  }
};

const EventManager: React.FC<EventManagerProps> = ({
  events,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  userId,
  userName,
  students
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [filterCategory, setFilterCategory] = useState<Event['category'] | 'all'>('all');

  const now = new Date().toISOString().split('T')[0];
  const myEvents = events.filter(e => e.createdBy === userId);
  
  const filteredEvents = myEvents.filter(event => {
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    const isUpcoming = event.date >= now;
    const matchesTab = activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
    return matchesCategory && matchesTab;
  }).sort((a, b) => {
    const dateCompare = activeTab === 'upcoming' 
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date);
    return dateCompare;
  });

  const handleSave = (eventData: Partial<Event>) => {
    if (editingEvent) {
      onUpdateEvent({ ...editingEvent, ...eventData });
    } else {
      onCreateEvent({
        id: `event-${Date.now()}`,
        title: eventData.title || '',
        description: eventData.description || '',
        date: eventData.date || now,
        time: eventData.time || '09:00',
        endTime: eventData.endTime || '10:00',
        location: eventData.location || '',
        category: eventData.category || 'other',
        createdBy: userId,
        createdByName: userName,
        registeredStudents: [],
      });
    }
    setIsCreateModalOpen(false);
    setEditingEvent(null);
  };

  const handleDelete = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDeleteEvent(eventId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Event Management</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center border-b border-gray-700 pb-4">
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
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as Event['category'] | 'all')}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No {activeTab} events found</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <AnimatedElement key={event.id}>
              <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-colors">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getCategoryColor(event.category)}`}>
                        {event.category.toUpperCase()}
                      </span>
                      {event.date >= now && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-600/20 text-green-300 border border-green-500/30">
                          UPCOMING
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {event.time} - {event.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingEvent(event); setIsCreateModalOpen(true); }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {event.registeredStudents.length} {event.maxParticipants ? `/ ${event.maxParticipants}` : ''} registered
                  </span>
                  {event.maxParticipants && (
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((event.registeredStudents.length / event.maxParticipants) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </AnimatedElement>
          ))
        )}
      </div>

      {isCreateModalOpen && (
        <EventFormModal
          event={editingEvent}
          onSave={handleSave}
          onClose={() => { setIsCreateModalOpen(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
};

interface EventFormModalProps {
  event: Event | null;
  onSave: (event: Partial<Event>) => void;
  onClose: () => void;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ event, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Event>>({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || new Date().toISOString().split('T')[0],
    time: event?.time || '09:00',
    endTime: event?.endTime || '10:00',
    location: event?.location || '',
    category: event?.category || 'academic',
    maxParticipants: event?.maxParticipants,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal title={event ? 'Edit Event' : 'Create New Event'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Event Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Event['category'] })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Start Time *</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">End Time *</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Location *</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Main Auditorium, Room 101"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Max Participants (optional)</label>
          <input
            type="number"
            value={formData.maxParticipants || ''}
            onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value ? parseInt(e.target.value) : undefined })}
            min="1"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {event ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EventManager;
