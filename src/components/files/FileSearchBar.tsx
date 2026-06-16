import React from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { Search, X } from 'lucide-react';

export const FileSearchBar: React.FC = () => {
  const searchQuery = useUIStore(s => s.searchQuery);

  const handleClear = () => {
    uiStore.setSearchQuery('');
  };

  return (
    <div className="w-full relative mb-6">
      <div className="absolute inset-y-0 left-4 flex items-center justify-center text-neutral-500 pointer-events-none">
        <Search className="w-4 h-4 stroke-[1.5]" />
      </div>

      <input
        type="text"
        placeholder="Search active vault directory by file title or file extension..."
        value={searchQuery}
        onChange={(e) => uiStore.setSearchQuery(e.target.value)}
        className="w-full pl-11 pr-11 py-3 px-4 bg-neutral-950/70 text-xs text-white tracking-wide placeholder-neutral-600 border border-neutral-900 focus:border-neutral-700 hover:border-neutral-850 rounded focus:outline-none transition-colors duration-150 font-mono"
      />

      {searchQuery && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-4 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>
      )}
    </div>
  );
};
