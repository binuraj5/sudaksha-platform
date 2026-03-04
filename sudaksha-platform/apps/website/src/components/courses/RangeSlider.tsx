'use client';

import { useState } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  label: string;
  step?: number;
  prefix?: string;
  suffix?: string;
}

const RangeSlider = ({ 
  min, 
  max, 
  value, 
  onChange, 
  label, 
  step = 1,
  prefix = '',
  suffix = ''
}: RangeSliderProps) => {
  const [localMin, setLocalMin] = useState(value.min);
  const [localMax, setLocalMax] = useState(value.max);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value);
    if (newMin <= localMax) {
      setLocalMin(newMin);
      onChange({ min: newMin, max: localMax });
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value);
    if (newMax >= localMin) {
      setLocalMax(newMax);
      onChange({ min: localMin, max: newMax });
    }
  };

  const formatValue = (val: number) => {
    return `${prefix}${val.toLocaleString()}${suffix}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        <div className="text-xs text-gray-500">
          {formatValue(localMin)} - {formatValue(localMax)}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-2 bg-gray-200 rounded-lg"></div>
            <div 
              className="absolute h-2 bg-blue-600 rounded-lg"
              style={{
                left: `${((localMin - min) / (max - min)) * 100}%`,
                right: `${100 - ((localMax - min) / (max - min)) * 100}%`
              }}
            ></div>
          </div>
          
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localMin}
            onChange={handleMinChange}
            className="relative w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          />
          
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localMax}
            onChange={handleMaxChange}
            className="relative w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
