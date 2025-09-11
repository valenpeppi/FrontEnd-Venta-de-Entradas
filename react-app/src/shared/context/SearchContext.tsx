import React, { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';


type SearchAction =
  | { type: 'SET_SEARCH_QUERY'; payload: { query: string } }
  | { type: 'CLEAR_SEARCH' };

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'SET_SEARCH_QUERY': {
      return { ...state, searchQuery: action.payload.query };
    }
    
    case 'CLEAR_SEARCH': {
      return { ...state, searchQuery: '' };
    }
    
    default:
      return state;
  }
};

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, { searchQuery: '' });

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: { query } });
  };

  const clearSearch = () => {
    dispatch({ type: 'CLEAR_SEARCH' });
  };

  return (
    <SearchContext.Provider value={{ 
      searchQuery: state.searchQuery, 
      setSearchQuery, 
      clearSearch 
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch debe ser usado dentro de un SearchProvider');
  }
  return context;
};
