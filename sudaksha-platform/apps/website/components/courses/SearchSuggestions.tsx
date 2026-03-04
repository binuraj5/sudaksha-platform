'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, TrendingUp, Star, X, ChevronRight } from 'lucide-react';

interface SearchSuggestionsProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

interface Suggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'course' | 'skill';
  category?: string;
  url?: string;
  popularity?: number;
}

export default function SearchSuggestions({ onSearch, placeholder = "Search courses, skills, or topics...", className = "" }: SearchSuggestionsProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Mock data for suggestions
  const trendingSearches = [
    'Full Stack Development',
    'Data Science',
    'Machine Learning',
    'Cloud Computing',
    'DevOps',
    'UI/UX Design',
    'Digital Marketing',
    'Python Programming'
  ];

  const popularSkills = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
    'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
    'Figma', 'Adobe XD', 'Sketch', 'HTML', 'CSS'
  ];

  const courseCategories = [
    'Software Development',
    'Data Science',
    'Cloud Computing',
    'Cybersecurity',
    'UI/UX Design',
    'Digital Marketing',
    'Project Management',
    'Business Analysis'
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Generate suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      // Show default suggestions when query is empty
      const defaultSuggestions: Suggestion[] = [
        ...recentSearches.slice(0, 3).map((search, index) => ({
          id: `recent-${index}`,
          text: search,
          type: 'recent' as const
        })),
        ...trendingSearches.slice(0, 3).map((search, index) => ({
          id: `trending-${index}`,
          text: search,
          type: 'trending' as const,
          popularity: 100 - index
        }))
      ];
      setSuggestions(defaultSuggestions);
    } else {
      // Generate dynamic suggestions based on query
      const lowerQuery = query.toLowerCase();
      const dynamicSuggestions: Suggestion[] = [];

      // Add matching recent searches
      recentSearches.forEach((search, index) => {
        if (search.toLowerCase().includes(lowerQuery)) {
          dynamicSuggestions.push({
            id: `recent-${index}`,
            text: search,
            type: 'recent'
          });
        }
      });

      // Add matching trending searches
      trendingSearches.forEach((search, index) => {
        if (search.toLowerCase().includes(lowerQuery)) {
          dynamicSuggestions.push({
            id: `trending-${index}`,
            text: search,
            type: 'trending',
            popularity: 100 - index
          });
        }
      });

      // Add matching skills
      popularSkills.forEach((skill, index) => {
        if (skill.toLowerCase().includes(lowerQuery)) {
          dynamicSuggestions.push({
            id: `skill-${index}`,
            text: skill,
            type: 'skill'
          });
        }
      });

      // Add matching categories
      courseCategories.forEach((category, index) => {
        if (category.toLowerCase().includes(lowerQuery)) {
          dynamicSuggestions.push({
            id: `category-${index}`,
            text: category,
            type: 'course',
            category
          });
        }
      });

      // Remove duplicates and limit to 8 suggestions
      const uniqueSuggestions = dynamicSuggestions
        .filter((suggestion, index, arr) => 
          arr.findIndex(item => item.text === suggestion.text) === index
        )
        .slice(0, 8);

      setSuggestions(uniqueSuggestions);
    }
    setSelectedIndex(-1);
  }, [query, recentSearches]);

  // Save search to recent searches
  const saveSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const updatedRecent = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          performSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    setQuery(suggestion.text);
    setIsOpen(false);
    setSelectedIndex(-1);
    saveSearch(suggestion.text);
    onSearch(suggestion.text);
  };

  const performSearch = () => {
    if (query.trim()) {
      saveSearch(query);
      setIsOpen(false);
      setSelectedIndex(-1);
      onSearch(query);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow clicking on suggestions
    setTimeout(() => {
      if (!inputRef.current?.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
      }
    }, 150);
  };

  const getSuggestionIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'recent':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'skill':
        return <Star className="w-4 h-4 text-blue-500" />;
      case 'course':
        return <Search className="w-4 h-4 text-green-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSuggestionLabel = (type: Suggestion['type']) => {
    switch (type) {
      case 'recent':
        return 'Recent';
      case 'trending':
        return 'Trending';
      case 'skill':
        return 'Skill';
      case 'course':
        return 'Category';
      default:
        return 'Suggestion';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => selectSuggestion(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                    selectedIndex === index ? 'bg-blue-50' : ''
                  }`}
                >
                  {getSuggestionIcon(suggestion.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium truncate">
                        {suggestion.text}
                      </span>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {getSuggestionLabel(suggestion.type)}
                      </span>
                    </div>
                    
                    {suggestion.popularity && (
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              i < (suggestion.popularity || 0) / 20
                                ? 'bg-orange-400'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Use ↑↓ to navigate, Enter to select</span>
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('recentSearches');
                  }}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Clear Recent
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
