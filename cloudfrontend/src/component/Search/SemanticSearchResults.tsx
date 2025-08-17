import React from 'react';

interface SearchResult {
  fileId: string;
  filename: string;
  originalname: string;
  url: string;
  relevanceScore: number;
  isPublic: boolean;
  tags: string[];
}

interface SemanticSearchResultsProps {
  results: SearchResult[];
  query: string;
  loading: boolean;
}

const SemanticSearchResults: React.FC<SemanticSearchResultsProps> = ({
  results,
  query,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">Analyzing documents for relevance...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <svg
              className="h-5 w-5 text-blue-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Semantic Search Results
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded ml-2">
              {results.length}
            </span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Documents that match your query: <span className="font-medium">&quot;{query}&quot;</span>
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {results.map((result) => (
            <div
              key={result.fileId}
              className="p-4 hover:bg-gray-50 transition-colors duration-150 flex flex-col md:flex-row md:items-center"
            >
              {/* File icon and name */}
              <div className="flex-grow">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 bg-gray-100 rounded-md p-2">
                    <svg
                      className="h-6 w-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {result.originalname}
                    </h4>
                    <p className="text-sm text-gray-500">{result.filename}</p>
                    {result.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {result.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Score and actions */}
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center md:space-x-4">
                <div className="flex items-center">
                  <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(result.relevanceScore * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600 font-medium">
                    {(result.relevanceScore * 100).toFixed(0)}% match
                  </span>
                </div>

                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg
                    className="mr-1.5 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SemanticSearchResults;
