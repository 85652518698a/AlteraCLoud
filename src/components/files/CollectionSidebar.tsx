import React, { useState, useEffect, useRef, useCallback } from 'react';
import { uiStore, useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../config/supabase';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { Collection, FileRecord } from '../../types';
import { Bookmark, Plus, Trash2, FolderOpen, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface CollectionSidebarProps {
  files: FileRecord[];
  onSelectCollection: (collectionId: string | null) => void;
  activeCollectionId: string | null;
}

export const CollectionSidebar: React.FC<CollectionSidebarProps> = ({ files, onSelectCollection, activeCollectionId }) => {
  const user = useAuthStore(s => s.user);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionFileMap, setCollectionFileMap] = useState<Record<string, string[]>>({});
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('collections').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setCollections(data);
    });
  }, []);

  useEffect(() => {
    if (collections.length === 0) return;
    const ids = collections.map(c => c.id);
    supabase.from('collection_files').select('*').in('collection_id', ids).then(({ data }) => {
      if (!data) return;
      const map: Record<string, string[]> = {};
      data.forEach(cf => {
        if (!map[cf.collection_id]) map[cf.collection_id] = [];
        map[cf.collection_id].push(cf.file_id);
      });
      setCollectionFileMap(map);
    });
  }, [collections]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setNewName('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await callEdgeFunction('create-collection', { name }, true);
      const { data } = await supabase.from('collections').select('*').order('created_at', { ascending: false });
      if (data) setCollections(data);
      setNewName('');
      setCreating(false);
      toast.success(`Collection "${name}" created`);
    } catch {
      toast.error('Failed to create collection');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await callEdgeFunction('delete-collection', { collectionId: id }, true);
      setCollections(prev => prev.filter(c => c.id !== id));
      if (activeCollectionId === id) onSelectCollection(null);
      toast.success(`Collection "${name}" deleted`);
    } catch {
      toast.error('Failed to delete collection');
    }
  };

  const activeName = activeCollectionId
    ? collections.find(c => c.id === activeCollectionId)?.name || 'Collection'
    : 'ALL FILES';

  return (
    <div ref={dropdownRef} className="relative inline-block select-none">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black text-xs font-mono font-bold text-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors duration-150 cursor-pointer uppercase tracking-wider"
      >
        <Bookmark className="w-3.5 h-3.5" />
        <span>{activeName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000000] z-50">
          <div className="p-2">
            <button
              onClick={() => { onSelectCollection(null); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-mono border-2 transition-colors duration-150 cursor-pointer font-bold flex items-center gap-2 ${
                !activeCollectionId
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-black border-black hover:bg-blue-600 hover:text-white hover:border-blue-600'
              }`}
            >
              <FolderOpen className="w-3 h-3" />
              <span className="uppercase tracking-wider">ALL FILES</span>
            </button>
          </div>

          {collections.length > 0 && (
            <div className="border-t-2 border-black">
              <div className="px-3 py-1.5 text-2xs font-mono text-neutral-600 uppercase tracking-wider font-bold">
                COLLECTIONS
              </div>
              {collections.map(col => {
                const fileCount = collectionFileMap[col.id]?.length || 0;
                return (
                  <div key={col.id} className="flex items-center gap-1 px-2 pb-1">
                    <button
                      onClick={() => { onSelectCollection(col.id); setOpen(false); }}
                      className={`flex-1 text-left px-3 py-2 text-xs font-mono border-2 transition-colors duration-150 cursor-pointer font-bold ${
                        activeCollectionId === col.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-black border-black hover:bg-blue-600 hover:text-white hover:border-blue-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-3 h-3 shrink-0" />
                        <span className="truncate uppercase tracking-wider">{col.name}</span>
                        <span className="ml-auto text-2xs opacity-60">({fileCount})</span>
                      </div>
                    </button>
                    {user && (
                      <button
                        onClick={() => handleDelete(col.id, col.name)}
                        className="p-2 bg-white border-2 border-black text-neutral-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors duration-150 cursor-pointer shrink-0"
                        title={`Delete "${col.name}"`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {user && (
            <div className="border-t-2 border-black p-2">
              {creating ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
                    placeholder="Collection name..."
                    className="flex-1 text-xs font-mono px-2 py-1.5 bg-white border-2 border-black text-black placeholder-neutral-500 font-bold"
                    autoFocus
                  />
                  <button onClick={handleCreate} className="px-2 py-1.5 bg-black text-white text-xs font-mono font-bold border-2 border-black hover:bg-blue-600 hover:border-blue-600 transition-colors duration-150 cursor-pointer">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-white border-2 border-black text-xs font-mono font-bold text-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors duration-150 cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-3 h-3" />
                  NEW COLLECTION
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
