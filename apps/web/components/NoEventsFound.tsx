import React from 'react';
import { Search, AlertTriangle } from 'lucide-react';

interface NoEventsFoundProps {
  searchQuery?: string;
  category?: string;
  location?: string;
  onClearFilters: () => void;
}

export default function NoEventsFound({ 
  searchQuery, 
  category, 
  location, 
  onClearFilters 
}: NoEventsFoundProps) {
  const hasFilters = searchQuery || category || location;

  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        {hasFilters ? (
          <>
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No events found</h3>
            <p className="mt-2 text-gray-600">
              We couldn&apos;t find any events matching your search criteria.
            </p>
            {(searchQuery || category || location) && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">Current filters:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {searchQuery && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Search: {searchQuery}
                    </span>
                  )}
                  {category && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Category: {category}
                    </span>
                  )}
                  {location && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Location: {location}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6 space-y-3">
              <button
                onClick={onClearFilters}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Clear all filters
              </button>
              <p className="text-sm text-gray-500">
                Try adjusting your search terms or browse all events
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No events available</h3>
            <p className="mt-2 text-gray-600">
              There are currently no events available. Check back later for new events!
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Refresh page
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
