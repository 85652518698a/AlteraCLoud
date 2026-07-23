import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { supabase } from '../../config/supabase';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { FileRecord } from '../../types';
import { FileIcon } from '../ui/FileIcon';
import { SECTIONS } from '../../constants/sections';
import { COURSES } from '../../constants/courses';
import { Search, X, ChevronRight, Sparkles } from 'lucide-react';

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
  const [aiMode, setAiMode] = useState(false);
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

  const doAiSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) { setResults([]); setShowDropdown(false); return; }
    setLoading(true);
    try {
      const data = await callEdgeFunction<{ files: FileRecord[] }>('ai-search', { query: trimmed }, false);
      setResults(data.files || []);
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
    debounceRef.current = setTimeout(() => aiMode ? doAiSearch(val) : doSearch(val), 250);
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
      <div className="absolute inset-y-0 left-4 flex items-center justify-center text-neutral-600 pointer-events-none">
        <Search className="w-4 h-4 stroke-[1.5]" />
      </div>

      <input
        ref={inputRef}
        type="text"
        placeholder={aiMode ? 'AI search: "3rd sem AIML maths notes" or "civil engineering question bank"...' : 'Search files by name, type, or course...'}
        value={localQuery}
        onChange={handleChange}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') setShowDropdown(false); }}
        onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
         className="w-full pl-11 pr-11 py-3 px-4 bg-white text-xs text-black tracking-wide placeholder-neutral-500 border-2 border-black focus:border-blue-600 font-mono font-bold"
      />

      {(localQuery || searchQuery) && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-12 flex items-center justify-center text-neutral-600 hover:text-blue-600 transition-colors"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>
      )}
      <button
        onClick={() => { setAiMode(!aiMode); setLocalQuery(''); setResults([]); setShowDropdown(false); }}
        title={aiMode ? 'Switch to basic search' : 'Switch to AI search'}
        className={`absolute inset-y-0 right-0 flex items-center justify-center px-3 transition-colors duration-150 cursor-pointer border-l-2 ${
          aiMode ? 'text-amber-500 border-amber-400' : 'text-neutral-600 border-black hover:text-amber-500'
        }`}
      >
        <Sparkles className={`w-4 h-4 ${aiMode ? 'fill-amber-400' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000000] z-50 overflow-hidden">
          {loading ? (
            <div className="px-4 py-6 text-center">
              <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin mx-auto" />
              <span className="text-xs font-mono text-neutral-700 mt-2 block font-bold">Searching vault...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <span className="text-xs font-mono text-neutral-700 font-bold">No files matched your query</span>
            </div>
          ) : (
            <div>
              <div className="px-3 py-1.5 text-2xs font-mono text-neutral-700 uppercase tracking-wider border-b-2 border-black bg-white font-bold">
                {results.length} results — click to search
              </div>
              {results.map(file => {
                const sectionLabel = SECTION_BADGE[file.section] || file.section;
                const courseLabel = file.course ? COURSE_LABEL[file.course] || file.course : null;
                return (
                  <button
                    key={file.id}
                    onClick={() => handleSelect(file)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600 hover:text-white transition-colors text-left border-b-2 border-black last:border-b-0 cursor-pointer group"
                  >
                    <div className="p-1.5 bg-white border-2 border-black shrink-0">
                      <FileIcon extension={file.file_type} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-black font-bold truncate group-hover:text-white transition-colors">
                        {file.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-2xs font-mono px-1.5 py-0.5 bg-blue-600 text-white border-2 border-blue-600 uppercase font-bold">
                          {sectionLabel}
                        </span>
                        {courseLabel && (
                          <span className="text-2xs font-mono px-1.5 py-0.5 bg-amber-400 text-black border-2 border-amber-400 uppercase font-bold">
                            {courseLabel}
                          </span>
                        )}
                        <span className="text-2xs font-mono text-neutral-700 uppercase font-bold">
                          {file.file_type?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-black group-hover:text-white transition-colors shrink-0" />
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
