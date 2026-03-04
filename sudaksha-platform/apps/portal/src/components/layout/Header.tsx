'use client';

import Link from 'next/link';
import { useState } from 'react';
import CourseMegaMenu from '../navigation/CourseMegaMenu';
import CorporatesDropdown from '../navigation/CorporatesDropdown';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCorporatesOpen, setIsCorporatesOpen] = useState(false);

  return (
    <>
      {/* Sticky Top Bar Removed as per request */}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b">
        <div className="px-4 max-w-screen-xl mx-auto">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Sudaksha Logo"
                className="h-10 w-auto"
              />
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              <CourseMegaMenu />
              <CorporatesDropdown />
              <Link href="/institutions" className="text-gray-700 hover:text-blue-600 font-medium">
                Institutions
              </Link>
              <Link href="/individuals" className="text-gray-700 hover:text-blue-600 font-medium">
                Individuals
              </Link>
              <Link href="/why-sudaksha" className="text-gray-700 hover:text-blue-600 font-medium">
                Why Sudaksha
              </Link>
              <Link href="/resources" className="text-gray-700 hover:text-blue-600 font-medium">
                Resources
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium">
                Contact
              </Link>
            </nav>

            <button
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="space-y-1">
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
              </div>
            </button>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t">
              <nav className="flex flex-col space-y-2 px-4">
                <Link href="/courses" className="text-gray-700 hover:text-blue-600 py-2">
                  Courses
                </Link>
                <div className="border-t pt-2">
                  <button
                    className="flex items-center justify-between w-full text-gray-700 hover:text-blue-600 py-2"
                    onClick={() => setIsCorporatesOpen(!isCorporatesOpen)}
                  >
                    <span>Corporates</span>
                    {isCorporatesOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {isCorporatesOpen && (
                    <div className="pl-4 space-y-2">
                      <Link href="/corporates/domestic" className="block text-gray-600 hover:text-blue-600 py-1">
                        Domestic
                      </Link>
                      <Link href="/corporates/international" className="block text-gray-600 hover:text-blue-600 py-1">
                        International
                      </Link>
                    </div>
                  )}
                </div>
                <Link href="/institutions" className="text-gray-700 hover:text-blue-600 py-2">
                  Institutions
                </Link>
                <Link href="/individuals" className="text-gray-700 hover:text-blue-600 py-2">
                  Individuals
                </Link>
                <Link href="/why-sudaksha" className="text-gray-700 hover:text-blue-600 py-2">
                  Why Sudaksha
                </Link>
                <Link href="/resources" className="text-gray-700 hover:text-blue-600 py-2">
                  Resources
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 py-2">
                  About
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 py-2">
                  Contact
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
