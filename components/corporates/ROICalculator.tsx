'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Target, Calculator } from 'lucide-react';

export default function ROICalculator() {
  const [employees, setEmployees] = useState(50);
  const [averageSalary, setAverageSalary] = useState(800000);
  const [productivityImprovement, setProductivityImprovement] = useState(25);
  const [duration, setDuration] = useState(8);

  const trainingCostPerEmployee = 40000;
  const totalInvestment = employees * trainingCostPerEmployee;
  const annualProductivityGain = (employees * averageSalary * productivityImprovement) / 100;
  const roiPercentage = ((annualProductivityGain - totalInvestment) / totalInvestment) * 100;
  const breakEvenMonths = Math.round((totalInvestment / (annualProductivityGain / 12)) * 10) / 10;
  const threeYearValue = annualProductivityGain * 3 - totalInvestment;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Calculate Your Training ROI
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See the tangible business impact of investing in your team's capabilities
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Calculator Inputs */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <Calculator className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">ROI Calculator</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of employees to train: <span className="text-blue-600 font-bold">{employees}</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span>500</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average salary per employee: <span className="text-blue-600 font-bold">₹{averageSalary.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="300000"
                  max="2000000"
                  step="50000"
                  value={averageSalary}
                  onChange={(e) => setAverageSalary(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹3L</span>
                  <span>₹20L</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected productivity improvement: <span className="text-blue-600 font-bold">{productivityImprovement}%</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={productivityImprovement}
                  onChange={(e) => setProductivityImprovement(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10%</span>
                  <span>50%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training duration (weeks): <span className="text-blue-600 font-bold">{duration}</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="16"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>4 weeks</span>
                  <span>16 weeks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-8 h-8 mr-3" />
              <h3 className="text-2xl font-bold">Your ROI Analysis</h3>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3">Investment</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Training cost per employee:</span>
                    <span className="font-bold">₹{trainingCostPerEmployee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total training investment:</span>
                    <span>₹{totalInvestment.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3">Return</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Productivity gain (annual):</span>
                    <span className="font-bold">₹{annualProductivityGain.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>ROI percentage:</span>
                    <span>{roiPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Break-even timeline:</span>
                    <span className="font-bold">{breakEvenMonths} months</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>3-year value:</span>
                    <span>₹{threeYearValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                Get Detailed ROI Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
