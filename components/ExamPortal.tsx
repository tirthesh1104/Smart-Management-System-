import React, { useState } from 'react';
import { Exam, ExamSubmission } from '../types';
import ExamTaker from './ExamTaker';
import AnimatedElement from './AnimatedElement';

interface ExamPortalProps {
  studentId: string;
  exams: Exam[];
  submissions: ExamSubmission[];
  onSubmitExam: (submission: Omit<ExamSubmission, 'id' | 'score' | 'studentName'>) => void;
}

const ExamPortal: React.FC<ExamPortalProps> = ({ studentId, exams, submissions, onSubmitExam }) => {
  const [takingExam, setTakingExam] = useState<Exam | null>(null);

  // Explicitly type the Map to ensure correct type inference for `submission`.
  const studentSubmissionsMap = new Map<string, ExamSubmission>(submissions.map(s => [s.examId, s]));

  const handleSubmit = (
    answers: { [questionId: string]: string },
    status: 'Completed' | 'Blocked' | 'Cancelled',
    proctorData?: { tabSwitchCount: number; copyCount: number }
  ) => {
    if (!takingExam) return;
    onSubmitExam({
      examId: takingExam.id,
      studentId,
      answers,
      submittedAt: Date.now(),
      status,
      tabSwitchCount: proctorData?.tabSwitchCount ?? 0,
      copyCount: proctorData?.copyCount ?? 0,
    });
    setTakingExam(null);
  };

  if (takingExam) {
    // A student cannot retake a blocked exam unless the teacher allows it (by deleting the submission).
    const existingSubmission = studentSubmissionsMap.get(takingExam.id);
    if (existingSubmission?.status === 'Blocked') {
      return (
        <div className="bg-gray-900 p-8 rounded-2xl border border-red-500/50 text-center shadow-2xl">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Exam Blocked</h2>
          <p className="text-gray-300">Your access to this exam has been blocked due to a violation of exam rules.</p>
          <p className="text-gray-400 mt-2">Please contact your teacher for assistance.</p>
          <button onClick={() => setTakingExam(null)} className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all">
            Go Back
          </button>
        </div>
      );
    }
    return <ExamTaker exam={takingExam} onClose={() => setTakingExam(null)} onSubmit={handleSubmit} />;
  }

  return (
    <div className="bg-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-2xl text-white">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-indigo-400">Exam Portal</h2>
          <p className="text-sm text-gray-400">View upcoming exams, take tests, and review completed results.</p>
        </div>
        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold rounded-full">
          {exams.length} Exam(s) Available
        </span>
      </div>

      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam, index) => {
            const submission = studentSubmissionsMap.get(exam.id);
            const isBlocked = submission?.status === 'Blocked';
            const isCancelled = submission?.status === 'Cancelled';
            return (
              <AnimatedElement key={exam.id} delay={index * 100}>
                <div className={`bg-gray-800/90 p-6 rounded-xl border flex flex-col justify-between h-full shadow-lg transition-all hover:border-indigo-500/50 ${
                  isBlocked ? 'border-red-500/50' : isCancelled ? 'border-yellow-500/50' : 'border-gray-700/80'
                }`}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white leading-snug">{exam.title}</h3>
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md">
                        {exam.subject}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs mt-3 text-gray-300 font-medium">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {exam.questions?.length || 0} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {exam.durationMinutes} Mins
                      </span>
                    </div>
                  </div>
                  <div className="mt-6">
                    {submission ? (
                      <div className={`text-center p-4 rounded-xl border ${
                        isBlocked 
                          ? 'bg-red-950/60 border-red-500/50' 
                          : isCancelled 
                          ? 'bg-yellow-950/60 border-yellow-500/50'
                          : 'bg-emerald-950/60 border-emerald-500/50'
                      }`}>
                        <p className={`text-xs font-bold uppercase tracking-wider ${
                          isBlocked ? 'text-red-300' : isCancelled ? 'text-yellow-300' : 'text-emerald-300'
                        }`}>
                          {submission.status}
                        </p>
                        <p className="text-3xl font-extrabold text-white mt-1">{submission.score}%</p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setTakingExam(exam)}
                        className="w-full py-3 px-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Take Exam
                      </button>
                    )}
                  </div>
                </div>
              </AnimatedElement>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 bg-gray-800/40 rounded-xl border border-gray-800">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium text-gray-300">No exams are available at this moment.</p>
          <p className="text-xs text-gray-500 mt-1">Check back later for new exam announcements from your teacher.</p>
        </div>
      )}
    </div>
  );
};

export default ExamPortal;
