'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calculator } from 'lucide-react';

interface ROICalculatorProps {
  onClose: () => void;
}

export function ROICalculator({ onClose }: ROICalculatorProps) {
  const [currentSalary, setCurrentSalary] = useState<number>(400000);
  const [programFee, setProgramFee] = useState<number>(45000);
  const [results, setResults] = useState<{
    monthlyIncrease: number;
    yearlyIncrease: number;
    paybackMonths: number;
    fiveYearGain: number;
    roi: number;
  } | null>(null);

  const calculateROI = () => {
    // Average placement salary after Sudaksha program
    const avgPlacementSalary = 650000; // ₹6.5 LPA
    const monthlyPlacementSalary = avgPlacementSalary / 12;

    // Current monthly salary
    const monthlyCurrentSalary = currentSalary / 12;

    // Monthly salary increase
    const monthlyIncrease = monthlyPlacementSalary - monthlyCurrentSalary;
    const yearlyIncrease = monthlyIncrease * 12;

    // Payback period in months
    const paybackMonths = Math.ceil(programFee / monthlyIncrease);

    // 5-year total gain (assuming 5-year career in new role)
    const fiveYearGain = yearlyIncrease * 5;

    // ROI calculation
    const totalEarnings = (monthlyPlacementSalary * 12 * 5); // 5 years at new salary
    const totalOldEarnings = (monthlyCurrentSalary * 12 * 5); // 5 years at old salary
    const netGain = totalEarnings - totalOldEarnings - programFee;
    const roi = ((netGain / programFee) * 100);

    setResults({
      monthlyIncrease,
      yearlyIncrease,
      paybackMonths,
      fiveYearGain,
      roi,
    });
  };

  useEffect(() => {
    calculateROI();
  }, [currentSalary, programFee]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">ROI Calculator</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Annual Salary (₹)
                </label>
                <input
                  type="number"
                  value={currentSalary}
                  onChange={(e) => setCurrentSalary(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="400000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Fee (₹)
                </label>
                <input
                  type="number"
                  value={programFee}
                  onChange={(e) => setProgramFee(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="45000"
                />
              </div>
            </div>

            {/* Results */}
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 space-y-4"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Your ROI Analysis</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Monthly Salary Increase</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{results.monthlyIncrease.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Yearly Salary Increase</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{results.yearlyIncrease.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Payback Period</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {results.paybackMonths} months
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">5-Year Total Gain</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{results.fiveYearGain.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Return on Investment</p>
                  <p className="text-3xl font-bold text-green-600">
                    {results.roi.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on average placement salary of ₹6.5 LPA
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Calculations are based on Sudaksha's average placement data.
                    Actual results may vary based on your dedication, market conditions, and placement efforts.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={calculateROI}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Calculator className="w-5 h-5" />
                <span>Recalculate</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
