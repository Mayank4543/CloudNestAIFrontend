import React, { useState, useEffect } from 'react';

export interface SearchFilters {
    query: string;
    tags: string[];
    mimetype: string;
}

interface AdvancedSearchFormProps {
    onSearch: (filters: SearchFilters) => void;
    initialFilters?: SearchFilters;
}

const commonTags = [
    'document', 'image', 'spreadsheet', 'presentation',
    'report', 'project', 'work', 'personal', 'important'
];

const fileTypes = [
    { label: 'All Types', value: '' },
    { label: 'Images', value: 'image/' },
    { label: 'Documents', value: 'application/pdf' },
    { label: 'Word Documents', value: 'application/msword' },
    { label: 'Excel Files', value: 'application/vnd.ms-excel' },
    { label: 'PowerPoint', value: 'application/vnd.ms-powerpoint' },
    { label: 'Text Files', value: 'text/plain' },
    { label: 'PDF Files', value: 'application/pdf' },
    { label: 'Videos', value: 'video/' },
    { label: 'Audio', value: 'audio/' },
];

const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({ onSearch, initialFilters }) => {
    const [query, setQuery] = useState<string>(initialFilters?.query || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters?.tags || []);
    const [selectedMimetype, setSelectedMimetype] = useState<string>(initialFilters?.mimetype || '');
    const [customTag, setCustomTag] = useState<string>('');
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isSearchIconHovered, setIsSearchIconHovered] = useState<boolean>(false);

    useEffect(() => {
        if (initialFilters) {
            setQuery(initialFilters.query || '');
            setSelectedTags(initialFilters.tags || []);
            setSelectedMimetype(initialFilters.mimetype || '');
        }
    }, [initialFilters]);

    const handleSearch = () => {
        onSearch({
            query,
            tags: selectedTags,
            mimetype: selectedMimetype
        });
    };

    const handleSearchIconClick = () => {
        handleSearch();
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const addCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customTag.trim()) {
            e.preventDefault();
            if (!selectedTags.includes(customTag.trim())) {
                setSelectedTags([...selectedTags, customTag.trim()]);
            }
            setCustomTag('');
        }
    };

    const handleClearSearch = () => {
        setQuery('');
    };

    const handleReset = () => {
        setQuery('');
        setSelectedTags([]);
        setSelectedMimetype('');
        onSearch({ query: '', tags: [], mimetype: '' });
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col md:flex-row items-center gap-2">
                    <div className="relative flex-grow w-full">
                        {/* Search Icon - Now Clickable */}
                        <div
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 cursor-pointer transition-transform duration-300 ease-in-out ${isSearchIconHovered ? 'scale-110 text-green-500' : 'text-gray-500'}`}
                            onClick={handleSearchIconClick}
                            onMouseEnter={() => setIsSearchIconHovered(true)}
                            onMouseLeave={() => setIsSearchIconHovered(false)}
                        >
                            <svg className={`w-5 h-5 transition-all duration-300 ${isSearchIconHovered ? 'rotate-12' : ''}`}
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>

                        {/* Search Input - Enhanced */}
                        <input
                            type="search"
                            className={`block w-full p-3 pl-10 pr-10 text-sm text-gray-900 border ${isFocused ? 'border-green-500 border-2' : 'border-gray-300'} 
                                       rounded-lg bg-white focus:outline-none focus:shadow-outline
                                       transition-all duration-200 shadow-sm`}
                            style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                            placeholder="Search files, folders, or tags..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />

                        {/* Clear Button */}
                        {query && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Clear search"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Search Button - Mobile Friendly */}
                    <button
                        type="button"
                        className="md:ml-2 p-3 w-full md:w-auto text-sm font-medium text-white bg-green-500 rounded-lg border border-green-600 
                                 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 
                                 transition-all duration-200 transform hover:-translate-y-0.5"
                        onClick={handleSearch}
                    >
                        <span className="flex items-center justify-center">
                            <svg className="w-5 h-5 md:mr-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            <span className="md:hidden">Search</span>
                        </span>
                    </button>

                    {/* Filter Button */}
                    <button
                        className="md:ml-2 p-3 w-full md:w-auto text-sm font-medium text-gray-700 bg-gray-100 rounded-lg border border-gray-300 
                                hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100
                                transition-all duration-200 transform hover:-translate-y-0.5"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        <span className="flex items-center justify-center">
                            <svg className="w-5 h-5 md:mr-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                            </svg>
                            <span className="md:hidden">Filters</span>
                        </span>
                    </button>
                </div>
            </div>

            {/* Active Filters Display - Enhanced */}
            {(selectedTags.length > 0 || selectedMimetype) && (
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Active filters:</span>

                    {selectedTags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm transition-all hover:shadow-md">
                            #{tag}
                            <button
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className="ml-1.5 text-green-600 hover:text-green-800 transition-colors"
                                aria-label={`Remove ${tag} tag`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                <span className="sr-only">Remove tag</span>
                            </button>
                        </span>
                    ))}

                    {selectedMimetype && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm transition-all hover:shadow-md">
                            {fileTypes.find(type => type.value === selectedMimetype)?.label || selectedMimetype}
                            <button
                                type="button"
                                onClick={() => setSelectedMimetype('')}
                                className="ml-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                                aria-label="Remove file type filter"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                <span className="sr-only">Remove file type filter</span>
                            </button>
                        </span>
                    )}

                    <button
                        onClick={handleReset}
                        className="ml-auto px-2 py-1 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Reset all
                    </button>
                </div>
            )}            {/* Advanced Search Options - Enhanced */}
            {isFilterOpen && (
                <div className="p-5 border-b border-gray-100 bg-white">
                    <div className="space-y-5">
                        {/* File Type Selection */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">File Type</label>
                            <select
                                value={selectedMimetype}
                                onChange={(e) => setSelectedMimetype(e.target.value)}
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg 
                                         focus:ring-2 focus:ring-green-500 focus:border-green-500 
                                         block w-full p-2.5 shadow-sm transition-all"
                                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                            >
                                {fileTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tags Selection */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {commonTags.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 shadow-sm 
                                                  ${selectedTags.includes(tag)
                                                ? 'bg-green-500 text-white font-medium scale-105 shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Tag Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={customTag}
                                    onChange={(e) => setCustomTag(e.target.value)}
                                    onKeyDown={addCustomTag}
                                    placeholder="Add custom tag and press Enter"
                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg 
                                             focus:ring-2 focus:ring-green-500 focus:border-green-500 
                                             block w-full p-2.5 shadow-sm transition-all"
                                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                                />
                                {customTag && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
                                                setSelectedTags([...selectedTags, customTag.trim()]);
                                            }
                                            setCustomTag('');
                                        }}
                                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 
                                                hover:text-green-500 transition-colors duration-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                        </svg>
                                        <span className="sr-only">Add tag</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(false)}
                            className="py-2 px-4 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 
                                     hover:bg-gray-100 focus:ring-2 focus:outline-none focus:ring-gray-100
                                     transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                            <span className="flex items-center justify-center">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                Close
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="py-2 px-4 text-sm font-medium text-white bg-green-600 rounded-lg border border-green-700 
                                     hover:bg-green-700 focus:ring-2 focus:outline-none focus:ring-green-300
                                     transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                            <span className="flex items-center justify-center">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Apply Filters
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedSearchForm;
