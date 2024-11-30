'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  onReportLostCat: () => void;
  onReportFoundCat: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReportLostCat, onReportFoundCat }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg z-[500]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-2xl">🐱</span>
            <h1 className="text-xl font-bold">FoundKittens</h1>
          </Link>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search for cats nearby..."
                className={`w-full px-4 py-2 rounded-full border transition-all duration-200 
                  ${isSearchFocused 
                    ? 'border-blue-500 ring-2 ring-blue-100' 
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <button 
                className={`absolute right-3 top-2.5 transition-colors
                  ${isSearchFocused ? 'text-blue-500' : 'text-gray-400'}`}
              >
                🔍
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onReportLostCat}
              className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 
                transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Report Lost Cat
            </button>
            <button
              onClick={onReportFoundCat}
              className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 
                transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Report Found Cat
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="User Profile"
            >
              👤
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-4 mt-4">
          <button 
            className="px-3 py-1.5 bg-white rounded-full border shadow-sm 
              hover:bg-gray-50 transition-colors"
          >
            📍 Near Me
          </button>
          
          <div className="flex items-center space-x-2 bg-white rounded-full shadow-sm p-1">
            <FilterButton active={true}>All</FilterButton>
            <FilterButton>Lost</FilterButton>
            <FilterButton>Found</FilterButton>
            <FilterButton>Home</FilterButton>
          </div>

          <button 
            className="px-3 py-1.5 bg-white rounded-full border shadow-sm 
              hover:bg-gray-50 transition-colors ml-auto"
          >
            📅 Last 7 Days
          </button>
        </div>
      </div>
    </header>
  );
};

const FilterButton = ({ active = false, children }) => (
  <button
    className={`px-3 py-1.5 rounded-full transition-colors ${
      active 
        ? 'bg-blue-500 text-white' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    {children}
  </button>
);

export default Header;