'use client';

import { useState, useRef } from 'react';
import { Calendar, Clock, Users, MapPin, GripVertical } from 'lucide-react';

interface Batch {
  id: string;
  name: string;
  courseName: string;
  trainerName: string;
  room: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface DragDropCalendarProps {
  batches: Batch[];
  onBatchReschedule: (batchId: string, newDate: string, newTime: string) => void;
  onBatchEdit: (batchId: string) => void;
}

export default function DragDropCalendar({
  batches,
  onBatchReschedule,
  onBatchEdit
}: DragDropCalendarProps) {
  const [draggedBatch, setDraggedBatch] = useState<Batch | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Generate week days
  const getWeekDays = () => {
    const startOfWeek = new Date(selectedWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  // Generate time slots
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const handleDragStart = (batch: Batch) => {
    setDraggedBatch(batch);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: string, time: string) => {
    e.preventDefault();
    if (draggedBatch) {
      onBatchReschedule(draggedBatch.id, date, time);
      setDraggedBatch(null);
    }
  };

  const getBatchesForSlot = (date: string, time: string) => {
    return batches.filter(batch => {
      // Simple filtering - in real app, this would be more sophisticated
      return batch.startTime === time;
    });
  };

  const weekDays = getWeekDays();
  const timeSlots = getTimeSlots();

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Batch Scheduling Calendar</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'week' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'month' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Month
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const prevWeek = new Date(selectedWeek);
                prevWeek.setDate(prevWeek.getDate() - 7);
                setSelectedWeek(prevWeek);
              }}
              className="p-2 text-gray-600 hover:text-gray-700"
            >
              ←
            </button>
            <span className="text-sm text-gray-600">
              {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
            </span>
            <button
              onClick={() => {
                const nextWeek = new Date(selectedWeek);
                nextWeek.setDate(nextWeek.getDate() + 7);
                setSelectedWeek(nextWeek);
              }}
              className="p-2 text-gray-600 hover:text-gray-700"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-3 text-sm font-medium text-gray-700">Time</div>
            {weekDays.map((day, index) => (
              <div key={index} className="p-3 text-center border-l border-gray-200">
                <div className="text-sm font-medium text-gray-900">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-xs text-gray-500">
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b border-gray-100">
              {/* Time Label */}
              <div className="p-3 text-sm text-gray-600 border-r border-gray-200">
                {time}
              </div>

              {/* Day Columns */}
              {weekDays.map((day, dayIndex) => {
                const dateStr = day.toISOString().split('T')[0];
                const slotBatches = getBatchesForSlot(dateStr, time);
                
                return (
                  <div
                    key={dayIndex}
                    className="p-2 border-l border-gray-200 min-h-[60px] hover:bg-gray-50 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dateStr, time)}
                  >
                    {slotBatches.map((batch) => (
                      <div
                        key={batch.id}
                        draggable
                        onDragStart={() => handleDragStart(batch)}
                        onClick={() => onBatchEdit(batch.id)}
                        className={`mb-1 p-2 rounded-lg cursor-move hover:shadow-md transition-shadow ${batch.color}`}
                        style={{ backgroundColor: batch.color + '20', borderColor: batch.color }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              <GripVertical className="w-3 h-3 text-gray-400" />
                              <h4 className="text-xs font-medium text-gray-900 truncate">
                                {batch.name}
                              </h4>
                            </div>
                            <div className="mt-1 space-y-1">
                              <div className="flex items-center space-x-1 text-xs text-gray-600">
                                <Users className="w-3 h-3" />
                                <span className="truncate">{batch.trainerName}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-600">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{batch.room}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <strong>Drag & Drop:</strong> Drag batches to reschedule them to different time slots
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-200 rounded"></div>
              <span>MERN Stack</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span>Java Spring</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-200 rounded"></div>
              <span>Data Science</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
