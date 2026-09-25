import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentStatus } from '../types';

interface ManualProgressFormProps {
  onSave: (data: { subjectName: string, assignment: Omit<Assignment, 'id'> }) => void;
  onClose: () => void;
  existingSubjects: string[];
  assignmentToEdit?: { subjectName: string, assignment: Assignment } | null;
}

const ManualProgressForm: React.FC<ManualProgressFormProps> = ({ onSave, onClose, existingSubjects, assignmentToEdit }) => {
  const [subjectName, setSubjectName] = useState('');
  const [isNewSubject, setIsNewSubject] = useState(true);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<AssignmentStatus>(AssignmentStatus.NotStarted);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (assignmentToEdit) {
        const { subjectName: subName, assignment } = assignmentToEdit;
        if (existingSubjects.includes(subName)) {
            setSubjectName(subName);
            setIsNewSubject(false);
            setNewSubjectName('');
        } else {
            setSubjectName('');
            setIsNewSubject(true);
            setNewSubjectName(subName);
        }
        setTitle(assignment.title);
        setStatus(assignment.status);
        setDueDate(assignment.dueDate || '');
        setNotes(assignment.notes || '');
    } else {
        // Reset form for "Add New" mode
        setSubjectName(existingSubjects.length > 0 ? existingSubjects[0] : '');
        setIsNewSubject(existingSubjects.length === 0);
        setNewSubjectName('');
        setTitle('');
        setStatus(AssignmentStatus.NotStarted);
        setDueDate('');
        setNotes('');
    }
  }, [assignmentToEdit, existingSubjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const finalSubjectName = isNewSubject ? newSubjectName.trim() : subjectName;
    if (!finalSubjectName || !title.trim()) {
      setError('Subject and Title are required fields.');
      return;
    }
    
    // For teacher-assigned items, we keep their score. For new items, it's 0.
    const maxScore = assignmentToEdit?.assignment.maxScore || 0;
    const score = assignmentToEdit?.assignment.score;

    const newAssignment: Omit<Assignment, 'id'> = {
      title: title.trim(),
      dueDate,
      status,
      notes: notes.trim(),
      maxScore,
      score,
    };

    onSave({ subjectName: finalSubjectName, assignment: newAssignment });
  };
  
  const handleSubjectSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value === '__new__') {
          setIsNewSubject(true);
          setSubjectName('');
          setNewSubjectName('');
      } else {
          setIsNewSubject(false);
          setSubjectName(value);
      }
  }

  return (
    <form onSubmit={handleSubmit} className="p-2 space-y-4">
      {error && <div className="p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
        <select onChange={handleSubjectSelection} value={isNewSubject ? '__new__' : subjectName} className="w-full bg-gray-700/50 rounded-lg p-2 text-white" disabled={!!assignmentToEdit}>
            {existingSubjects.length === 0 && <option value="" disabled>No subjects exist yet</option>}
            {existingSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            <option value="__new__">Add new subject...</option>
        </select>
        {(isNewSubject || !existingSubjects.includes(subjectName)) && (
            <input type="text" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="New subject name" className="w-full bg-gray-700/50 rounded-lg p-2 mt-2 text-white" required={isNewSubject} disabled={!!assignmentToEdit} />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Assignment/Project Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Lab 4: Binary Trees" className="w-full bg-gray-700/50 rounded-lg p-2 text-white" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as AssignmentStatus)} className="w-full bg-gray-700/50 rounded-lg p-2 text-white">
            <option value={AssignmentStatus.NotStarted}>Not Started</option>
            <option value={AssignmentStatus.InProgress}>In Progress</option>
            <option value={AssignmentStatus.Submitted}>Submitted</option>
            <option value={AssignmentStatus.Pending}>Pending (from teacher)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Due Date (Optional)</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-gray-700/50 rounded-lg p-2 text-white" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">My Notes (Optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Need to review chapter 5 for this." rows={3} className="w-full bg-gray-700/50 rounded-lg p-2 text-white" />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
        <button type="submit" className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700">Save Progress</button>
      </div>
    </form>
  )
};

export default ManualProgressForm;