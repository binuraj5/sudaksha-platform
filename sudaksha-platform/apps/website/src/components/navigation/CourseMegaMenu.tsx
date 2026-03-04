'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users } from 'lucide-react';

const CourseMegaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 }
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Link href="/courses" className="flex items-center space-x-1">
          <span>Courses</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Link>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 w-[600px] bg-white shadow-xl rounded-lg border border-gray-200 z-50 mt-1"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15 }}
          >
            <div className="p-4">
              <div className="grid grid-cols-3 gap-6">
                {/* By Category */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">By Category</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/courses/category/it" className="text-gray-600 hover:text-blue-600 flex items-center text-sm">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        IT Courses
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses/category/non-it" className="text-gray-600 hover:text-blue-600 flex items-center text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Non-IT Courses
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses/category/functional" className="text-gray-600 hover:text-blue-600 flex items-center text-sm">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Functional Skills
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses/category/personal" className="text-gray-600 hover:text-blue-600 flex items-center text-sm">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Personal Development
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* By Technology */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">By Technology</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/courses/domain/software-development" className="text-gray-600 hover:text-blue-600 text-sm">
                        Software Development
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses/domain/data-analytics" className="text-gray-600 hover:text-blue-600 text-sm">
                        Data & Analytics
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses/domain/cloud-devops" className="text-gray-600 hover:text-blue-600 text-sm">
                        Cloud & DevOps
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses/domain/ai-ml" className="text-gray-600 hover:text-blue-600 text-sm">
                        AI/ML & Gen AI
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses/domain/cybersecurity" className="text-gray-600 hover:text-blue-600 text-sm">
                        Cybersecurity
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* By Career Level */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">By Career Level</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/courses/level/freshers" className="text-gray-600 hover:text-blue-600 flex items-center text-sm">
                        <Users className="w-4 h-4 mr-2 text-blue-500" />
                        Freshers
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses/level/junior" className="text-gray-600 hover:text-blue-600 text-sm">
                        Junior (1-3 years)
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses/level/mid" className="text-gray-600 hover:text-blue-600 text-sm">
                        Mid-Level (3-7 years)
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses/level/senior" className="text-gray-600 hover:text-blue-600 text-sm">
                        Senior (7+ years)
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses/level/career-switch" className="text-gray-600 hover:text-blue-600 text-sm">
                        Career Switchers
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Quick Actions */}
              <div className="border-t border-gray-200 mt-4 pt-3">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/courses"
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700"
                  >
                    Browse All Courses
                  </Link>
                  <Link
                    href="/demo"
                    className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-full hover:bg-orange-600"
                  >
                    Free Demo
                  </Link>
                  <Link
                    href="/calendar"
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200"
                  >
                    Course Calendar
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseMegaMenu;
