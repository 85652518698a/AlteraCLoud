import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { supabase } from '../../config/supabase';
import { FileRecord } from '../../types';
import { FileCard } from './FileCard';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const FileGrid: React.FC = () => {
  const activeSection = useUIStore(s => s.activeSection);
  const searchQuery = useUIStore(s => s.searchQuery);

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .eq('is_deployed', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (active) {
          setFiles(data || []);
        }
      } catch (err) {
        console.error('Failed to retrieve locker directory', err);
        toast.error('Failed to synchronize locker files');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchFiles();
    return () => { active = false; };
  }, [refreshTrigger]);

  const handleReload = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Locker directories synchronized');
  };

  const filteredFiles = files.filter(f => {
    const matchesSection = f.section === activeSection;
    const matchesSearch = searchQuery.trim() === '' ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

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
      <div className="flex items-center justify-between mb-4 mt-8 px-1 select-none">
        <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2">
          <span>DIRECTORY:</span>
          <span className="text-white font-bold uppercase">{activeSection}</span>
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

      {filteredFiles.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No Matches Found" : "Vault Section Empty"}
          description={searchQuery ? "We tried looking up files matching your input, but came up empty-handed." : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
};
