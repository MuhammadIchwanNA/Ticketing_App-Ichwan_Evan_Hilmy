import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Enhanced search hook with better filtering
export function useEventSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Reduced to 300ms for better UX

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  const hasActiveFilters = () => {
    return debouncedSearchTerm.length > 0 || 
           filters.category !== '' || 
           filters.location !== '' ||
           filters.minPrice !== '' ||
           filters.maxPrice !== '' ||
           filters.dateRange.start !== '' ||
           filters.dateRange.end !== '';
  };

  // Build search params for API
  const getSearchParams = (page: number = 1, limit: number = 12) => {
    const params: any = { page, limit };
    
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (filters.category) params.category = filters.category;
    if (filters.location) params.location = filters.location;
    if (filters.minPrice) params.minPrice = parseInt(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = parseInt(filters.maxPrice);
    if (filters.dateRange.start) params.startDate = filters.dateRange.start;
    if (filters.dateRange.end) params.endDate = filters.dateRange.end;
    
    return params;
  };

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    getSearchParams,
    isSearching,
    setIsSearching
  };
}