import React, { useState, useCallback, useEffect } from 'react';
import { api } from '../../utils/api';

interface SearchResult {
  fileId: string;
  filename: string;
  originalname: string;
  url: string;
  relevanceScore: number;
  isPublic: boolean;
  tags: string[];
}

interface SemanticSearchProps {
  initialQuery?: string;
  onResultsFound?: (results: SearchResult[]) => void;
}

const SemanticSearch: React.FC<SemanticSearchProps> = ({ initialQuery = '', onResultsFound }) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [includePublic, setIncludePublic] = useState<boolean>(true);

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.files.semanticSearch({
        q: query,
        includePublic,
        limit: 10
      });

      if (response.data.success) {
        setResults(response.data.data);
        if (onResultsFound) {
          onResultsFound(response.data.data);
        }
      } else {
        setError(response.data.message || 'Search failed');
        setResults([]);
      }
    } catch (err: unknown) {
      console.error('Semantic search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, includePublic, onResultsFound]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
          {/* Search input */}
          <div className="relative flex-grow">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you're looking for in natural language..."
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && performSearch()}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={performSearch}
            disabled={loading}
            className={`px-6 py-3 text-white font-medium rounded-lg shadow-sm ${loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors duration-200`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Searching...
              </div>
            ) : (
              'Semantic Search'
            )}
          </button>
        </div>

        {/* Include public files toggle */}
        <div className="flex items-center">
          <input
            id="include-public"
            type="checkbox"
            checked={includePublic}
            onChange={(e) => setIncludePublic(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="include-public" className="ml-2 text-sm font-medium text-gray-700">
            Include public files from other users
          </label>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Search hint */}
        {!results.length && !loading && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800">
            <h4 className="font-medium mb-1">Try these search examples:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>&quot;Financial reports from last quarter&quot;</li>
              <li>&quot;Presentation about marketing strategy&quot;</li>
              <li>&quot;Product design specifications for the mobile app&quot;</li>
              <li>&quot;Meeting notes from the team planning session&quot;</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SemanticSearch;
