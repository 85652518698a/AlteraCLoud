import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../config/supabase';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { Collection } from '../../types';
import { Bookmark, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddToCollectionButtonProps {
  fileId: string;
}

export const AddToCollectionButton: React.FC<AddToCollectionButtonProps> = ({ fileId }) => {
  const user = useAuthStore(s => s.user);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [fileCollectionIds, setFileCollectionIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !open) return;
    supabase.from('collections').select('*').eq('created_by', user.uid).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setCollections(data);
    });
    supabase.from('collection_files').select('collection_id').eq('file_id', fileId).then(({ data }) => {
      if (data) setFileCollectionIds(new Set(data.map(cf => cf.collection_id)));
    });
  }, [user, open, fileId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleToggle = async (col: Collection) => {
    const isIn = fileCollectionIds.has(col.id);
    try {
      if (isIn) {
        await callEdgeFunction('remove-from-collection', { collectionId: col.id, fileId }, true);
        setFileCollectionIds(prev => { const next = new Set(prev); next.delete(col.id); return next; });
        toast.success(`Removed from "${col.name}"`);
      } else {
        await callEdgeFunction('add-to-collection', { collectionId: col.id, fileId }, true);
        setFileCollectionIds(prev => { const next = new Set(prev); next.add(col.id); return next; });
        toast.success(`Added to "${col.name}"`);
      }
    } catch {
      toast.error('Failed to update collection');
    }
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer"
        title="Add to collection"
      >
        <Bookmark className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">COLLECT</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-[#0d0d0d] border border-neutral-800 rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="px-3 py-1.5 text-[9px] font-mono text-neutral-600 uppercase tracking-wider border-b border-neutral-900 bg-neutral-950/50">
            Save to collection
          </div>
          {collections.length === 0 ? (
            <div className="px-3 py-4 text-center text-[10px] font-mono text-neutral-600">
              No collections yet
            </div>
          ) : (
            collections.map(col => {
              const isIn = fileCollectionIds.has(col.id);
              return (
                <button
                  key={col.id}
                  onClick={() => handleToggle(col)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] font-mono transition-colors cursor-pointer hover:bg-neutral-900/80 ${
                    isIn ? 'text-white bg-neutral-900/50' : 'text-neutral-400'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                    isIn ? 'bg-white border-white' : 'border-neutral-700'
                  }`}>
                    {isIn && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-black"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span className="truncate">{col.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
