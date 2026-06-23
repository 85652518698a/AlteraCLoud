import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { supabase } from '../../config/supabase';
import { FileRecord } from '../../types';
import { FileIcon } from '../ui/FileIcon';
import { SECTIONS } from '../../constants/sections';
import { COURSES } from '../../constants/courses';
import { Search, X, ChevronRight } from 'lucide-react';

const SECTION_BADGE: Record<string, string> = {};
SECTIONS.forEach(s => { SECTION_BADGE[s.id] = s.label });

const COURSE_LABEL: Record<string, string> = {};
COURSES.forEach(c => { COURSE_LABEL[c.id] = c.label });

export const SmartSearch: React.FC = () => {
  const searchQuery = useUIStore(s => s.searchQuery);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [results, setResults] = useState<FileRecord[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!showDropdown && !searchQuery) {
      setLocalQuery('');
    }
  }, [showDropdown, searchQuery]);

  const doSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) { setResults([]); setShowDropdown(false); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from('files')
        .select('*')
        .eq('is_deployed', true)
        .ilike('name', `%${trimmed}%`)
        .order('created_at', { ascending: false })
        .limit(10);
      setResults(data || []);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 250);
  };

  const handleClear = () => {
    setLocalQuery('');
    setResults([]);
    setShowDropdown(false);
    uiStore.setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    uiStore.setSearchQuery(localQuery.trim());
    setShowDropdown(false);
  };

  const handleSelect = (file: FileRecord) => {
    uiStore.setSearchQuery(file.name);
    setLocalQuery(file.name);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <div ref={containerRef} className="w-full relative mb-6">
      <div className="absolute inset-y-0 left-4 flex items-center justify-center text-neutral-500 pointer-events-none">
        <Search className="w-4 h-4 stroke-[1.5]" />
      </div>

      <input
        ref={inputRef}
        type="text"
        placeholder="Search files by name, type, or course — type to see instant results..."
        value={localQuery}
        onChange={handleChange}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') setShowDropdown(false); }}
        onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        className="w-full pl-11 pr-11 py-3 px-4 bg-neutral-950/70 text-xs text-white tracking-wide placeholder-neutral-600 border border-neutral-900 focus:border-neutral-700 hover:border-neutral-850 rounded focus:outline-none transition-colors duration-150 font-mono"
      />

      {(localQuery || searchQuery) && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-4 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>
      )}

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0d0d0d] border border-neutral-800 rounded-lg shadow-2xl z-50 overflow-hidden">
          {loading ? (
            <div className="px-4 py-6 text-center">
              <div className="w-4 h-4 border border-neutral-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <span className="text-[10px] font-mono text-neutral-500 mt-2 block">Searching vault...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <span className="text-[10px] font-mono text-neutral-600">No files matched your query</span>
            </div>
          ) : (
            <div>
              <div className="px-3 py-1.5 text-[9px] font-mono text-neutral-600 uppercase tracking-wider border-b border-neutral-900 bg-neutral-950/50">
                {results.length} results — click to open
              </div>
              {results.map(file => {
                const sectionLabel = SECTION_BADGE[file.section] || file.section;
                const courseLabel = file.course ? COURSE_LABEL[file.course] || file.course : null;
                return (
                  <button
                    key={file.id}
                    onClick={() => handleSelect(file)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-900/80 transition-colors text-left border-b border-neutral-900/50 last:border-b-0 cursor-pointer group"
                  >
                    <div className="p-1.5 bg-neutral-900 rounded border border-neutral-850 shrink-0">
                      <FileIcon extension={file.file_type} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-zinc-200 truncate group-hover:text-white transition-colors">
                        {file.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 uppercase border border-neutral-850">
                          {sectionLabel}
                        </span>
                        {courseLabel && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 uppercase border border-neutral-850">
                            {courseLabel}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-neutral-600 uppercase">
                          {file.file_type?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
