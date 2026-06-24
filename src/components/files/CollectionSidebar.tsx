import React, { useState, useEffect, useCallback } from 'react';
import { uiStore, useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../config/supabase';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { Collection, FileRecord } from '../../types';
import { Bookmark, Plus, Trash2, ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface CollectionSidebarProps {
  files: FileRecord[];
  onSelectCollection: (collectionId: string | null) => void;
  activeCollectionId: string | null;
}

export const CollectionSidebar: React.FC<CollectionSidebarProps> = ({ files, onSelectCollection, activeCollectionId }) => {
  const user = useAuthStore(s => s.user);
  const open = useUIStore(s => s.sidebarOpen);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionFileMap, setCollectionFileMap] = useState<Record<string, string[]>>({});
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

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

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r-2 border-black z-30 transition-all duration-200 flex flex-col ${open ? 'w-56' : 'w-0 overflow-hidden'}`}>
      <div className="flex items-center justify-between p-3 border-b-2 border-black shrink-0">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black">COLLECTIONS</span>
        <button
          onClick={() => uiStore.setSidebarOpen(false)}
          className="text-black hover:text-[#FF3B30] transition-colors duration-150 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {user && (
        <div className="p-3 border-b-2 border-black">
          {creating ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
                placeholder="Collection name..."
                className="flex-1 text-[10px] font-mono px-2 py-1 bg-white border-2 border-black text-black placeholder-neutral-500 font-bold"
                autoFocus
              />
              <button onClick={handleCreate} className="px-2 py-1 bg-black text-white text-[10px] font-mono font-bold border-2 border-black hover:bg-[#FF3B30] hover:border-[#FF3B30] transition-colors duration-150 cursor-pointer">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-white border-2 border-black text-[10px] font-mono font-bold text-black hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-3 h-3" />
              NEW COLLECTION
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <button
          onClick={() => onSelectCollection(null)}
          className={`w-full text-left px-3 py-2 text-[10px] font-mono border-2 transition-colors duration-150 cursor-pointer font-bold ${
            !activeCollectionId
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-black hover:bg-[#FF3B30] hover:text-white hover:border-[#FF3B30]'
          }`}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-3 h-3 shrink-0" />
            <span className="truncate uppercase tracking-wider">ALL FILES</span>
          </div>
        </button>

        {collections.map(col => {
          const fileCount = collectionFileMap[col.id]?.length || 0;
          return (
            <div key={col.id} className="flex gap-1">
              <button
                onClick={() => onSelectCollection(col.id)}
                className={`flex-1 text-left px-3 py-2 text-[10px] font-mono border-2 transition-colors duration-150 cursor-pointer font-bold ${
                  activeCollectionId === col.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-[#FF3B30] hover:text-white hover:border-[#FF3B30]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3 h-3 shrink-0" />
                  <span className="truncate uppercase tracking-wider">{col.name}</span>
                  <span className="ml-auto text-[9px] opacity-60">({fileCount})</span>
                </div>
              </button>
              {user && (
                <button
                  onClick={() => handleDelete(col.id, col.name)}
                  className="px-2 py-2 bg-white border-2 border-black text-neutral-700 hover:bg-[#FF3B30] hover:text-white hover:border-[#FF3B30] transition-colors duration-150 cursor-pointer"
                  title={`Delete "${col.name}"`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t-2 border-black p-2">
        <button
          onClick={() => uiStore.setSidebarOpen(true)}
          className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-white border-2 border-black text-[10px] font-mono font-bold text-black hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const SidebarToggle: React.FC = () => {
  const sidebarOpen = useUIStore(s => s.sidebarOpen);

  if (sidebarOpen) return null;

  return (
    <button
      onClick={() => uiStore.setSidebarOpen(true)}
      className="fixed left-2 top-20 z-30 p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer"
      title="Open collections"
    >
      <Bookmark className="w-4 h-4" />
    </button>
  );
};
