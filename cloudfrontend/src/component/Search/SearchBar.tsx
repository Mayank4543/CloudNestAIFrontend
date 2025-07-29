import React, { useState, KeyboardEvent, ChangeEvent } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSearch = () => {
    onSearch(searchTerm.trim());
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg 
            className="w-4 h-4 text-gray-500" 
            aria-hidden="true" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 20 20"
          >
            <path 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
          <span className="sr-only">Search icon</span>
        </div>
        
        {/* Search Input */}
        <input
          type="search"
          id="search"
          className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg 
                     bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     hover:border-gray-400 transition-colors"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          aria-label="Search"
          required
        />
        
        {/* Search Button */}
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-3 rounded-r-lg
                     text-white bg-blue-600 hover:bg-blue-700 
                     focus:ring-2 focus:ring-blue-300 focus:outline-none
                     transition-colors"
          onClick={handleSearch}
          aria-label="Submit search"
        >
          <span className="sr-only">Search</span>
          <svg 
            className="w-4 h-4" 
            aria-hidden="true" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 16 16"
          >
            <path 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M4 8h11M10.25 3.75 14.5 8l-4.25 4.25"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
