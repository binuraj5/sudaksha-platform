'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, IndianRupee } from 'lucide-react';

interface EMICalculatorProps {
  onClose: () => void;
}

export function EMICalculator({ onClose }: EMICalculatorProps) {
  const [loanAmount, setLoanAmount] = useState<number>(45000);
  const [tenureMonths, setTenureMonths] = useState<number>(8);
  const [interestRate, setInterestRate] = useState<number>(12); // Annual interest rate
  const [results, setResults] = useState<{
    monthlyEMI: number;
    totalAmount: number;
    totalInterest: number;
  } | null>(null);

  const calculateEMI = () => {
    const principal = loanAmount;
    const rate = interestRate / 100 / 12; // Monthly interest rate
    const time = tenureMonths;

    // EMI formula: [P x R x (1+R)^N] / [(1+R)^N - 1]
    const emi = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
    const totalAmount = emi * time;
    const totalInterest = totalAmount - principal;

    setResults({
      monthlyEMI: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
    });
  };

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, tenureMonths, interestRate]);

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
                <IndianRupee className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">EMI Calculator</h2>
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
                  Loan Amount (₹)
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="45000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenure (Months)
                </label>
                <input
                  type="number"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8"
                  min="1"
                  max="24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12"
                  step="0.1"
                />
              </div>
            </div>

            {/* Results */}
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 space-y-4"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Calculator className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Your EMI Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Monthly EMI</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{results.monthlyEMI.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{results.totalAmount.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{results.totalInterest.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Schedule</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Principal Amount: ₹{loanAmount.toLocaleString()}</p>
                    <p>• Interest Rate: {interestRate}% per annum</p>
                    <p>• Tenure: {tenureMonths} months</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Pro Tip:</strong> You can prepay your loan anytime without penalties.
                    Consider paying after placement for better cash flow.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={calculateEMI}
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