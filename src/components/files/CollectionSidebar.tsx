import React, { useState, useEffect } from 'react';
import { uiStore, useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../config/supabase';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { Collection, CollectionFile, FileRecord } from '../../types';
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
    if (!newName.trim() || !user) return;
    setCreating(true);
    try {
      const col = await callEdgeFunction<Collection>('create-collection', { name: newName.trim(), description: '' }, true);
      setCollections(prev => [col, ...prev]);
      setNewName('');
      toast.success(`Collection "${col.name}" created`);
    } catch (err) {
      toast.error('Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (col: Collection) => {
    if (col.created_by !== user?.uid) { toast.error('Only the owner can delete'); return; }
    try {
      await callEdgeFunction('delete-collection', { collectionId: col.id }, true);
      setCollections(prev => prev.filter(c => c.id !== col.id));
      if (activeCollectionId === col.id) onSelectCollection(null);
      toast.success(`Collection deleted`);
    } catch {
      toast.error('Failed to delete collection');
    }
  };

  return (
    <div className={`fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${open ? 'w-56' : 'w-10'}`}>
      <button
        onClick={() => uiStore.setSidebarOpen(!open)}
        className="absolute -right-3 top-4 z-50 w-6 h-6 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors cursor-pointer"
      >
        {open ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      <div className="h-full bg-[#0a0a0a] border-r border-neutral-900 overflow-hidden">
        {open && (
          <div className="p-3 h-full flex flex-col">
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-3 select-none">
              <Bookmark className="w-3 h-3" />
              <span className="font-bold">COLLECTIONS</span>
            </div>

            {user && (
              <div className="flex gap-1 mb-3">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                  placeholder="New collection..."
                  className="flex-1 px-2 py-1 text-[10px] font-mono bg-neutral-950 border border-neutral-900 rounded text-white placeholder-neutral-600 focus:border-neutral-700 focus:outline-none"
                />
                <button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  className="px-2 py-1 bg-white text-black rounded text-[10px] font-mono font-bold hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-none">
              <button
                onClick={() => onSelectCollection(null)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-mono text-left transition-colors cursor-pointer ${
                  activeCollectionId === null ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                }`}
              >
                <FolderOpen className="w-3 h-3 shrink-0" />
                <span>All Files</span>
              </button>

              {collections.map(col => (
                <div key={col.id} className="group flex items-center">
                  <button
                    onClick={() => onSelectCollection(col.id)}
                    className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-mono text-left transition-colors cursor-pointer ${
                      activeCollectionId === col.id ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                    }`}
                  >
                    <Bookmark className="w-3 h-3 shrink-0" />
                    <span className="truncate">{col.name}</span>
                    <span className="text-[9px] text-neutral-600 ml-auto shrink-0">
                      {collectionFileMap[col.id]?.length || 0}
                    </span>
                  </button>
                  {col.created_by === user?.uid && (
                    <button
                      onClick={() => handleDelete(col)}
                      className="p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete collection"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              {collections.length === 0 && (
                <p className="text-[10px] font-mono text-neutral-600 px-2 py-4 text-center">
                  No collections yet.<br />Create one to organize files.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
