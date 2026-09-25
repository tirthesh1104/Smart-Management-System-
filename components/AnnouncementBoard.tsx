import React, { useState } from 'react';
import { Announcement } from '../types-extended';
import Modal from './Modal';
import AnimatedElement from './AnimatedElement';

interface AnnouncementBoardProps {
  announcements: Announcement[];
  onCreateAnnouncement: (announcement: Announcement) => void;
  userId: string;
  userName: string;
  userRole: 'student' | 'teacher' | 'parent';
}

const getPriorityColor = (priority: Announcement['priority']) => {
  switch (priority) {
    case 'high': return 'border-l-red-500 bg-red-600/10';
    case 'medium': return 'border-l-yellow-500 bg-yellow-600/10';
    default: return 'border-l-blue-500 bg-blue-600/10';
  }
};

const getPriorityBadge = (priority: Announcement['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-600/20 text-red-300 border border-red-500/30';
    case 'medium': return 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30';
    default: return 'bg-blue-600/20 text-blue-300 border border-blue-500/30';
  }
};

const AnnouncementBoard: React.FC<AnnouncementBoardProps> = ({
  announcements,
  onCreateAnnouncement,
  userId,
  userName,
  userRole
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<Announcement['priority'] | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visibleAnnouncements = announcements
    .filter(a => {
      if (filterPriority !== 'all' && a.priority !== filterPriority) return false;
      if (a.forRole !== 'all' && a.forRole !== userRole) return false;
      return true;
    })
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.postedAt - a.postedAt;
    });

  const handleCreate = (data: Partial<Announcement>) => {
    onCreateAnnouncement({
      id: `announcement-${Date.now()}`,
      title: data.title || '',
      content: data.content || '',
      postedBy: userId,
      postedByName: userName,
      postedAt: Date.now(),
      priority: data.priority || 'low',
      forRole: data.forRole || 'all',
    });
    setIsCreateModalOpen(false);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 rounded-lg">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Announcements</h2>
            <p className="text-sm text-gray-400">{visibleAnnouncements.length} visible announcements</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Announcement['priority'] | 'all')}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          {userRole === 'teacher' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Announcement
            </button>
          )}
        </div>
      </div>

      {visibleAnnouncements.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <p>No announcements to display</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleAnnouncements.map((announcement) => {
            const isExpanded = expandedId === announcement.id;
            return (
              <AnimatedElement key={announcement.id}>
                <div 
                  className={`border-l-4 ${getPriorityColor(announcement.priority)} rounded-lg border border-gray-700 overflow-hidden`}
                >
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityBadge(announcement.priority)}`}>
                            {announcement.priority.toUpperCase()}
                          </span>
                          {announcement.forRole !== 'all' && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-gray-600/20 text-gray-300 border border-gray-500/30">
                              {announcement.forRole.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{announcement.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>By {announcement.postedByName}</span>
                          <span>•</span>
                          <span>{formatTime(announcement.postedAt)}</span>
                        </div>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-700/50 pt-4">
                      <p className="text-gray-300 whitespace-pre-wrap">{announcement.content}</p>
                    </div>
                  )}
                </div>
              </AnimatedElement>
            );
          })}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateAnnouncementModal
          onSave={handleCreate}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};

interface CreateAnnouncementModalProps {
  onSave: (data: Partial<Announcement>) => void;
  onClose: () => void;
}

const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({ onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Announcement['priority']>('low');
  const [forRole, setForRole] = useState<Announcement['forRole']>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, content, priority, forRole });
  };

  return (
    <Modal title="Create Announcement" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Content *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Announcement['priority'])}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
            <select
              value={forRole}
              onChange={(e) => setForRole(e.target.value as Announcement['forRole'])}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Users</option>
              <option value="student">Students Only</option>
              <option value="teacher">Teachers Only</option>
              <option value="parent">Parents Only</option>
            </select>
          </div>
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
            Post Announcement
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AnnouncementBoard;
