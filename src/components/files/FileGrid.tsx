import React, { useEffect, useState, useCallback } from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { supabase } from '../../config/supabase';
import { FileRecord } from '../../types';
import { FileCard } from './FileCard';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';
import { ZipDownloadBar } from './ZipDownloadBar';
import { COURSES } from '../../constants/courses';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const PAGE_SIZE = 30;

export const FileGrid: React.FC = () => {
  const activeSection = useUIStore(s => s.activeSection);
  const searchQuery = useUIStore(s => s.searchQuery);
  const activeCourse = useUIStore(s => s.activeCourse);
  const activeCollectionId = useUIStore(s => s.activeCollectionId);

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [page, setPage] = useState(0);
  const [collectionFileIds, setCollectionFileIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    setPage(0);
  }, [activeSection, searchQuery, activeCourse, activeCollectionId]);

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

  useEffect(() => {
    if (!activeCollectionId) { setCollectionFileIds(null); return; }
    supabase.from('collection_files').select('file_id').eq('collection_id', activeCollectionId)
      .then(({ data }) => {
        if (data) setCollectionFileIds(new Set(data.map(cf => cf.file_id)));
        else setCollectionFileIds(new Set());
      });
  }, [activeCollectionId]);

  const handleReload = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Locker directories synchronized');
  };

  const filteredFiles = files.filter(f => {
    const matchesSection = activeSection === 'all' || f.section === activeSection;
    const matchesCourse = !activeCourse || f.course === activeCourse;
    const matchesSearch = searchQuery.trim() === '' ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCollection = !activeCollectionId || (collectionFileIds && collectionFileIds.has(f.id));
    return matchesSection && matchesCourse && matchesSearch && matchesCollection;
  });

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / PAGE_SIZE));
  const pagedFiles = filteredFiles.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Spinner size="lg" />
        <span className="text-[10px] font-mono tracking-widest text-neutral-600 mt-4 uppercase font-bold">
          Synthesizing Encrypted Vault Indices...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 mt-8 px-1 select-none">
        <div className="text-[11px] font-mono text-neutral-700 flex items-center gap-2 flex-wrap font-bold">
          <span>DIRECTORY:</span>
          <span className="text-black font-bold uppercase">{activeSection === 'all' ? 'ALL DIRECTORIES' : activeSection}</span>
          <span>•</span>
          <span>{filteredFiles.length} {filteredFiles.length === 1 ? 'FILE' : 'FILES'} INDEXED</span>
        </div>
        <button
          onClick={handleReload}
          title="Force-synchronize vault files"
          className="text-neutral-600 hover:text-blue-600 transition-colors cursor-pointer p-1 border-2 border-black hover:border-blue-600"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 px-1 select-none overflow-x-auto scrollbar-none">
        {COURSES.map(c => (
          <button
            key={c.id}
            onClick={() => uiStore.setActiveCourse(activeCourse === c.id ? '' : c.id)}
            className={`text-[10px] font-mono px-2.5 py-1 border-2 transition-colors duration-150 cursor-pointer whitespace-nowrap font-bold ${
              activeCourse === c.id
                ? 'text-white bg-blue-600 border-blue-600'
                : 'text-black bg-white border-black hover:bg-blue-600 hover:text-white hover:border-blue-600'
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
          <ZipDownloadBar files={files} />
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
                className="flex items-center gap-1 px-3 py-1.5 bg-white border-2 border-black text-xs font-mono text-black font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer active:translate-y-0.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>PREV</span>
              </button>
              <span className="text-[10px] font-mono text-neutral-700 font-bold">
                PAGE {page + 1} OF {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border-2 border-black text-xs font-mono text-black font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer active:translate-y-0.5"
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
