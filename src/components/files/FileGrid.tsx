import React, { useEffect, useState, useCallback } from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { supabase } from '../../config/supabase';
import { FileRecord } from '../../types';
import { FileCard } from './FileCard';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';
import { COURSES } from '../../constants/courses';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const PAGE_SIZE = 30;

export const FileGrid: React.FC = () => {
  const activeSection = useUIStore(s => s.activeSection);
  const searchQuery = useUIStore(s => s.searchQuery);
  const activeCourse = useUIStore(s => s.activeCourse);

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [activeSection, searchQuery, activeCourse]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('is_deployed', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error('Failed to retrieve locker directory', err);
      toast.error('Failed to synchronize locker files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshTrigger]);

  useEffect(() => {
    const channel = supabase
      .channel('files-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'files', filter: 'is_deployed=eq.true' },
        () => { fetchFiles(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchFiles]);

  const handleReload = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Locker directories synchronized');
  };

  const filteredFiles = files.filter(f => {
    const matchesSection = activeSection === 'all' || f.section === activeSection;
    const matchesCourse = !activeCourse || f.course === activeCourse;
    const matchesSearch = searchQuery.trim() === '' ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesCourse && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / PAGE_SIZE));
  const pagedFiles = filteredFiles.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Spinner size="lg" />
        <span className="text-[10px] font-mono tracking-widest text-neutral-500 mt-4 uppercase">
          Synthesizing Encrypted Vault Indices...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 mt-8 px-1 select-none">
        <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2 flex-wrap">
          <span>DIRECTORY:</span>
          <span className="text-white font-bold uppercase">{activeSection === 'all' ? 'ALL DIRECTORIES' : activeSection}</span>
          <span>•</span>
          <span>{filteredFiles.length} {filteredFiles.length === 1 ? 'FILE' : 'FILES'} INDEXED</span>
        </div>
        <button
          onClick={handleReload}
          title="Force-synchronize vault files"
          className="text-neutral-500 hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-neutral-900 border border-transparent hover:border-neutral-905"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-[spin_6s_linear_infinite]" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 px-1 select-none overflow-x-auto scrollbar-none">
        {COURSES.map(c => (
          <button
            key={c.id}
            onClick={() => uiStore.setActiveCourse(activeCourse === c.id ? '' : c.id)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-colors cursor-pointer whitespace-nowrap ${
              activeCourse === c.id
                ? 'text-white border-white bg-white/10'
                : 'text-neutral-500 border-neutral-900 hover:text-neutral-300 hover:border-neutral-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filteredFiles.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No Matches Found" : "Vault Section Empty"}
          description={searchQuery ? "We tried looking up files matching your input, but came up empty-handed." : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 select-none">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-neutral-950 border border-neutral-900 rounded text-xs font-mono text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>PREV</span>
              </button>
              <span className="text-[10px] font-mono text-neutral-500">
                PAGE {page + 1} OF {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-1.5 bg-neutral-950 border border-neutral-900 rounded text-xs font-mono text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
