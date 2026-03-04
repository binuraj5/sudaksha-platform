'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
}

export function PriceRangeSlider({ 
  min, 
  max, 
  value, 
  onChange, 
  step = 1000,
  className = '' 
}: PriceRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const getValueFromPercentage = useCallback((percentage: number) => {
    const rawValue = (percentage / 100) * (max - min) + min;
    return Math.round(rawValue / step) * step;
  }, [min, max, step]);

  const handleMouseDown = (handle: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(handle);
  };

  const handleMouseMove = useCallback((e: any) => {
    if (!isDragging) return;

    const slider = e.currentTarget as HTMLElement;
    const rect = slider.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newValue = getValueFromPercentage(percentage);

    setLocalValue(prev => {
      if (isDragging === 'min') {
        return [Math.min(newValue, prev[1] - step), prev[1]];
      } else {
        return [prev[0], Math.max(newValue, prev[0] + step)];
      }
    });
  }, [isDragging, getValueFromPercentage, step]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onChange(localValue);
      setIsDragging(null);
    }
  }, [isDragging, localValue, onChange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const minPercentage = getPercentage(localValue[0]);
  const maxPercentage = getPercentage(localValue[1]);

  return (
    <div className={`relative ${className}`}>
      {/* Slider Track */}
      <div 
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Active Range */}
        <motion.div
          className="absolute h-full bg-blue-600 rounded-full"
          initial={{ left: `${minPercentage}%`, right: `${100 - maxPercentage}%` }}
          animate={{ left: `${minPercentage}%`, right: `${100 - maxPercentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        
        {/* Min Handle */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-grab active:cursor-grabbing shadow-md hover:scale-110 transition-transform"
          style={{ left: `${minPercentage}%`, transform: 'translate(-50%, -50%)' }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onMouseDown={handleMouseDown('min')}
        />
        
        {/* Max Handle */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-grab active:cursor-grabbing shadow-md hover:scale-110 transition-transform"
          style={{ left: `${maxPercentage}%`, transform: 'translate(-50%, -50%)' }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onMouseDown={handleMouseDown('max')}
        />
      </div>

      {/* Price Labels */}
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>₹{(localValue[0] / 1000).toFixed(0)}k</span>
        <span>₹{(localValue[1] / 1000).toFixed(0)}k</span>
      </div>

      {/* Current Range Display */}
      <div className="mt-3 text-center">
        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          ₹{localValue[0].toLocaleString()} - ₹{localValue[1].toLocaleString()}
        </span>
      </div>
    </div>
  );
}
