import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Exam, Question } from '../types';

interface ExamTakerProps {
  exam: Exam;
  onClose: () => void;
  onSubmit: (
    answers: { [questionId: string]: string },
    status: 'Completed' | 'Blocked' | 'Cancelled',
    proctorData?: { tabSwitchCount: number; copyCount: number }
  ) => void;
}

const ExamTaker: React.FC<ExamTakerProps> = ({ exam, onClose, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [warnings, setWarnings] = useState(0);
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Proctoring telemetry: tab switch count and copy attempt count
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyCount, setCopyCount] = useState(0);

  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  
  const warningsRef = useRef(warnings);
  useEffect(() => { warningsRef.current = warnings; }, [warnings]);

  const tabSwitchRef = useRef(tabSwitchCount);
  useEffect(() => { tabSwitchRef.current = tabSwitchCount; }, [tabSwitchCount]);

  const copyRef = useRef(copyCount);
  useEffect(() => { copyRef.current = copyCount; }, [copyCount]);

  // Memoize the submit callback
  const handleFinalSubmit = useCallback((status: 'Completed' | 'Blocked' | 'Cancelled' = 'Completed') => {
    onSubmit(answersRef.current, status, {
      tabSwitchCount: tabSwitchRef.current,
      copyCount: copyRef.current,
    });
  }, [onSubmit]);

  // Anti-cheating & telemetry event listeners (Visibility change + Copy detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);

        // Ignore warning popup logic if modals are open or exam is already blocked
        if (isWarningVisible || isBlocked) return;

        const newWarningCount = warningsRef.current + 1;
        warningsRef.current = newWarningCount;
        setWarnings(newWarningCount);

        if (newWarningCount === 1) {
          setIsWarningVisible(true);
        } else if (newWarningCount >= 2) {
          setIsBlocked(true);
          // Force submit the exam with a 'Blocked' status
          handleFinalSubmit('Blocked');
        }
      }
    };

    const handleCopyEvent = () => {
      setCopyCount(prev => prev + 1);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopyEvent);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopyEvent);
    };
  }, [isWarningVisible, isBlocked, handleFinalSubmit]);

  // Stable timer count-down
  useEffect(() => {
    if (timeLeft <= 0 || isBlocked) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [isBlocked, timeLeft]);

  // Auto-submit when time expires
  useEffect(() => {
    if (timeLeft === 0 && !isBlocked) {
      handleFinalSubmit('Completed');
    }
  }, [timeLeft, handleFinalSubmit, isBlocked]);

  const handleManualSubmit = () => {
    if (window.confirm('Are you sure you want to submit your exam answers? This action cannot be undone.')) {
      handleFinalSubmit('Completed');
    }
  };

  const handleCancelExam = () => {
    if (window.confirm('Are you sure you want to cancel this exam? Your progress will be cancelled and submitted as Cancelled.')) {
      handleFinalSubmit('Cancelled');
      onClose();
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Warning Modal
  const WarningModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-yellow-500/60 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
        <div className="w-16 h-16 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-yellow-300 mb-2">Warning!</h2>
        <p className="text-gray-200 text-base mb-2">You navigated away from the exam tab.</p>
        <p className="text-red-400 font-semibold text-sm">A second tab switch will immediately block and auto-submit your exam.</p>
        <button
          onClick={() => setIsWarningVisible(false)}
          className="mt-6 w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-bold rounded-xl transition-all shadow-lg"
        >
          I Understand, Return to Exam
        </button>
      </div>
    </div>
  );

  // Blocked Overlay
  const BlockedOverlay = () => (
    <div className="absolute inset-0 bg-gray-950/95 z-20 flex items-center justify-center p-6 text-center rounded-2xl backdrop-blur-sm">
      <div className="max-w-md">
        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-red-400">Exam Blocked</h1>
        <p className="text-gray-300 mt-3 text-base">Your exam was automatically submitted and blocked due to rule violations (repeated tab switching / losing window focus).</p>
        <p className="text-gray-400 mt-4 text-sm">Please contact your teacher if you require assistance or a retake permission.</p>
        <button onClick={onClose} className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium">
          Close Window
        </button>
      </div>
    </div>
  );

  if (!Array.isArray(exam.questions) || exam.questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-gray-950 z-50 flex items-center justify-center p-4 text-white">
        <div className="text-center bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl max-w-md">
          <h1 className="text-2xl font-bold text-red-400">Exam Error</h1>
          <p className="text-gray-300 mt-2">This exam has no questions attached and cannot be taken.</p>
          <button onClick={onClose} className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion: Question = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col p-4 sm:p-6 text-white font-sans overflow-hidden">
      {isWarningVisible && <WarningModal />}

      {/* Header bar */}
      <header className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4 shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{exam.title}</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                {exam.subject}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {exam.questions.length} Questions &bull; {exam.durationMinutes} Mins Duration
            </p>
          </div>
        </div>

        {/* Telemetry & Timer */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Proctoring Indicators */}
          <div className="flex items-center gap-2 text-xs bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700">
            <span className="text-gray-400">Proctoring:</span>
            <span className={`font-semibold ${tabSwitchCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              Tab Switches: {tabSwitchCount}
            </span>
            <span className="text-gray-600">|</span>
            <span className={`font-semibold ${copyCount > 0 ? 'text-purple-400' : 'text-green-400'}`}>
              Copies: {copyCount}
            </span>
          </div>

          {/* Time Remaining */}
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono font-bold text-lg ${
            timeLeft < 180 
              ? 'bg-red-900/40 border-red-500/50 text-red-400 animate-pulse' 
              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
          }`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Cancel Exam Header Button */}
          <button
            onClick={handleCancelExam}
            className="px-3.5 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-red-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            title="Cancel and Exit Exam"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel Exam
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-900 border border-gray-800 rounded-full h-3 mb-4 p-0.5 shadow-inner">
        <div
          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
        {isBlocked && <BlockedOverlay />}

        <div>
          {/* Question Header & Navigator */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-6 pb-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-600/30 text-indigo-300 font-bold text-sm rounded-lg border border-indigo-500/30">
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </span>
              <span className="text-xs text-gray-400">
                ({answeredCount} of {exam.questions.length} answered)
              </span>
            </div>

            {/* Quick Question Selector Pills */}
            <div className="flex gap-1.5 flex-wrap">
              {exam.questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                        : isAnswered
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Display Card */}
          <div className="bg-gray-800/90 border border-gray-700/80 rounded-2xl p-6 shadow-lg mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-relaxed">
              {currentQuestion.text}
            </h2>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <label
                    key={idx}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-gray-900/60 border-gray-700/80 hover:border-gray-500 hover:bg-gray-800/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(currentQuestion.id, option)}
                      className="w-5 h-5 text-indigo-500 bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                      disabled={isBlocked}
                    />
                    <span className={`ml-4 text-base font-medium ${isSelected ? 'text-white font-semibold' : 'text-gray-200'}`}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer controls */}
      <footer className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0 || isBlocked}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed border border-gray-700 transition-all text-sm"
          >
            &larr; Previous
          </button>
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
            disabled={currentQuestionIndex === exam.questions.length - 1 || isBlocked}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed border border-gray-700 transition-all text-sm"
          >
            Next &rarr;
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Cancel Exam Footer Button */}
          <button
            onClick={handleCancelExam}
            disabled={isBlocked}
            className="px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-500/40 font-semibold rounded-xl transition-all disabled:opacity-50 text-sm"
          >
            Cancel Exam
          </button>

          {/* Submit Exam Button */}
          <button
            onClick={handleManualSubmit}
            disabled={isBlocked}
            className="px-7 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            Submit Exam
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ExamTaker;