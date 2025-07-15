import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

// Interfaz para el valor del contexto de búsqueda
interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

// Crea el contexto con un valor inicial que será sobrescrito por el proveedor
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Props para el proveedor de búsqueda
interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
};

// Hook personalizado para consumir el contexto de búsqueda
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch debe ser usado dentro de un SearchProvider');
  }
  return context;
};
