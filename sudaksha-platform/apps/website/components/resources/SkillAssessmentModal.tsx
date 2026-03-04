'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ArrowRight } from 'lucide-react';

interface SkillAssessmentModalProps {
  onClose: () => void;
}

export function SkillAssessmentModal({ onClose }: SkillAssessmentModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const questions = [
    {
      question: "What's your current experience level?",
      options: ["Complete Beginner", "Some Coding Knowledge", "Intermediate", "Advanced"],
    },
    {
      question: "What interests you most?",
      options: ["Web Development", "Data Science", "Mobile Apps", "DevOps/Cloud", "AI/ML"],
    },
    {
      question: "How much time can you dedicate daily?",
      options: ["2-4 hours", "4-6 hours", "6-8 hours", "8+ hours"],
    },
    {
      question: "What's your background?",
      options: ["Engineering Student", "Working Professional", "Career Switcher", "Other"],
    },
  ];

  const handleAnswer = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show results
      setCurrentStep(questions.length);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isAnswered = answers[currentStep] !== undefined;

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
            <h2 className="text-2xl font-bold text-gray-900">Skill Assessment</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4">
            <div className="flex items-center space-x-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Question {currentStep + 1} of {questions.length}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {currentStep < questions.length ? (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {questions[currentStep].question}
                </h3>

                <div className="space-y-3">
                  {questions[currentStep].options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(currentStep, option)}
                      className={`w-full p-4 text-left border rounded-lg transition-all duration-200 ${
                        answers[currentStep] === option
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {answers[currentStep] === option && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!isAnswered}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <span>{currentStep === questions.length - 1 ? 'Get Results' : 'Next'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // Results
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Assessment Complete!
                  </h3>
                  <p className="text-gray-600">
                    Based on your answers, here's your personalized recommendation:
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Recommended Program: Full Stack Java Developer
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Perfect match based on your interest in web development and available time commitment.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Duration:</strong> 4 months (160 hours)</p>
                    <p><strong>Skill Level:</strong> Beginner to Intermediate</p>
                    <p><strong>Career Potential:</strong> ₹6-12 LPA starting salary</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Next Steps:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Schedule a free counseling call to discuss your goals</li>
                    <li>• Attend a free demo class to experience our teaching</li>
                    <li>• Download detailed curriculum and fee structure</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Book Free Counseling
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    Download Brochure
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}