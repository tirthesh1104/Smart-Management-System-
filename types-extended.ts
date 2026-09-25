export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  link?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  category: 'academic' | 'cultural' | 'sports' | 'club' | 'other';
  createdBy: string;
  createdByName: string;
  registeredStudents: string[];
  maxParticipants?: number;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
  transactionId?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  postedByName: string;
  postedAt: number;
  priority: 'low' | 'medium' | 'high';
  forRole: 'all' | 'student' | 'teacher' | 'parent';
  attachments?: string[];
}
