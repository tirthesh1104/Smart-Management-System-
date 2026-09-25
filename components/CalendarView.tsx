import React, { useState } from 'react';
import { Event } from '../types-extended';
import { LiveClass } from '../types';

interface CalendarViewProps {
  events: Event[];
  liveClasses: LiveClass[];
  onDateClick?: (date: string) => void;
  selectedDate?: string;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: (Event | LiveClass)[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, liveClasses, onDateClick, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date().toISOString().split('T')[0];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: CalendarDay[] = [];

    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const dateStr = new Date(year, month - 1, dayNum).toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === today,
        isSelected: dateStr === selectedDate,
        events: [...events.filter(e => e.date === dateStr), ...liveClasses.filter(c => {
          const classDate = new Date(c.scheduledTime).toISOString().split('T')[0];
          return classDate === dateStr;
        })],
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(year, month, i).toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        isToday: dateStr === today,
        isSelected: dateStr === selectedDate,
        events: [...events.filter(e => e.date === dateStr), ...liveClasses.filter(c => {
          const classDate = new Date(c.scheduledTime).toISOString().split('T')[0];
          return classDate === dateStr;
        })],
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const dateStr = new Date(year, month + 1, i).toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: false,
        isToday: dateStr === today,
        isSelected: dateStr === selectedDate,
        events: [...events.filter(e => e.date === dateStr), ...liveClasses.filter(c => {
          const classDate = new Date(c.scheduledTime).toISOString().split('T')[0];
          return classDate === dateStr;
        })],
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventDot = (item: Event | LiveClass) => {
    if ('subject' in item) {
      return <span className="w-2 h-2 bg-blue-500 rounded-full" title={item.topic} />;
    }
    return <span className="w-2 h-2 bg-purple-500 rounded-full" title={item.title} />;
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{monthYear}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            onClick={() => onDateClick?.(day.date)}
            className={`
              min-h-[80px] p-2 rounded-lg cursor-pointer transition-colors relative
              ${day.isCurrentMonth ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-800/30 hover:bg-gray-800/50'}
              ${day.isToday ? 'ring-2 ring-indigo-500' : ''}
              ${day.isSelected ? 'bg-indigo-600/20' : ''}
            `}
          >
            <span className={`
              text-sm font-medium
              ${day.isCurrentMonth ? 'text-white' : 'text-gray-500'}
              ${day.isToday ? 'bg-indigo-500 text-white w-7 h-7 rounded-full flex items-center justify-center' : ''}
            `}>
              {day.day}
            </span>
            {day.events.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {day.events.slice(0, 3).map((event, i) => (
                  <div key={i} className="flex items-center gap-1">
                    {getEventDot(event)}
                  </div>
                ))}
                {day.events.length > 3 && (
                  <span className="text-xs text-gray-400">+{day.events.length - 3}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full" />
          <span>Live Classes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-purple-500 rounded-full" />
          <span>Events</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
