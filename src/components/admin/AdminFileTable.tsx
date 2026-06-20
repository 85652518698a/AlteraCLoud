import React, { useState, useCallback } from 'react';
import { FileRecord } from '../../types';
import { SECTIONS } from '../../constants/sections';
import { AdminFileRow } from './AdminFileRow';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { Eye, Search, Filter, Trash2, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminFileTableProps {
  files: FileRecord[];
  onActionComplete: () => void;
}

export const AdminFileTable: React.FC<AdminFileTableProps> = ({ files, onActionComplete }) => {
  const [localSearch, setLocalSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const filtered = files.filter(f => {
    const matchesSearch = localSearch.trim() === '' || 
      f.name.toLowerCase().includes(localSearch.toLowerCase()) || 
      f.uploaded_by.toLowerCase().includes(localSearch.toLowerCase());
    
    const matchesSection = sectionFilter === 'all' || f.section === sectionFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'deployed' && f.is_deployed) || 
      (statusFilter === 'draft' && !f.is_deployed);

    return matchesSearch && matchesSection && matchesStatus;
  });

  const allFilteredSelected = filtered.length > 0 && filtered.every(f => selectedIds.has(f.id));

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(f => f.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkAction = useCallback(async (action: 'deploy' | 'draft' | 'delete') => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    const toastId = toast.loading(`Processing ${selectedIds.size} files...`);
    let success = 0;
    let fail = 0;
    for (const fileId of selectedIds) {
      try {
        if (action === 'delete') {
          await callEdgeFunction('delete-file', { fileId });
        } else {
          await callEdgeFunction('update-file', { fileId, is_deployed: action === 'deploy' });
        }
        success++;
      } catch {
        fail++;
      }
    }
    const label = action === 'delete' ? 'purged' : action === 'deploy' ? 'deployed' : 'drafted';
    if (fail === 0) {
      toast.success(`All ${success} files ${label} successfully.`, { id: toastId });
    } else {
      toast.error(`${success} files ${label}, ${fail} failed.`, { id: toastId });
    }
    setBulkLoading(false);
    clearSelection();
    onActionComplete();
  }, [selectedIds, onActionComplete]);

  return (
    <div className="bg-neutral-950/20 border border-neutral-900 rounded-lg p-4 sm:p-6 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between mb-4 sm:mb-6">
        <div className="w-full sm:max-w-sm relative font-mono text-xs">
          <span className="absolute inset-y-0 left-3 flex items-center justify-center text-neutral-500 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search catalog..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-900 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-zinc-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3.5 w-full sm:w-auto font-mono text-xs select-none">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-950 border border-neutral-900 rounded text-neutral-400">
            <Filter className="w-3 h-3 shrink-0" />
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="bg-transparent text-[11px] font-mono border-none focus:outline-none focus:ring-0 text-white uppercase font-bold"
            >
              <option value="all" className="bg-neutral-950 text-xs">ALL DIRECTORIES</option>
              {SECTIONS.map(s => (
                <option key={s.id} value={s.id} className="bg-neutral-950 text-xs">{s.label.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-950 border border-neutral-900 rounded text-neutral-400">
            <Eye className="w-3 h-3 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[11px] font-mono border-none focus:outline-none focus:ring-0 text-white uppercase font-bold"
            >
              <option value="all" className="bg-neutral-950 text-xs">ALL VISIONS</option>
              <option value="deployed" className="bg-neutral-950 text-xs text-emerald-400 font-bold">DEPLOYED</option>
              <option value="draft" className="bg-neutral-950 text-xs text-neutral-500 font-bold">DRAFT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 sm:gap-3 mb-4 p-3 bg-neutral-950/60 border border-neutral-800 rounded-lg text-[10px] sm:text-[11px] font-mono">
          <span className="text-neutral-400 font-bold whitespace-nowrap">{selectedIds.size} SELECTED</span>
          <div className="w-px h-4 bg-neutral-800" />
          <button onClick={() => bulkAction('deploy')} disabled={bulkLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors cursor-pointer disabled:opacity-40">
            <Upload className="w-3 h-3" /> DEPLOY
          </button>
          <button onClick={() => bulkAction('draft')} disabled={bulkLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors cursor-pointer disabled:opacity-40">
            <Download className="w-3 h-3" /> DRAFT
          </button>
          <button onClick={() => bulkAction('delete')} disabled={bulkLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/30 hover:bg-red-950/50 text-red-400 rounded transition-colors cursor-pointer disabled:opacity-40 ml-auto">
            <Trash2 className="w-3 h-3" /> DELETE
          </button>
          <button onClick={clearSelection}
            className="text-neutral-600 hover:text-white cursor-pointer px-2 ml-auto sm:ml-0">
            CLEAR
          </button>
        </div>
      )}

      {/* Desktop table */}
      <div className="w-full overflow-x-auto relative max-sm:hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center select-none border border-neutral-905 rounded border-dashed">
            <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-full w-12 h-12 flex items-center justify-center text-neutral-600 mx-auto mb-3">
              <Search className="w-5 h-5 stroke-[1.2]" />
            </div>
            <h4 className="text-zinc-300 font-display font-medium text-xs uppercase tracking-wider mb-0.5">
              No matching records
            </h4>
            <p className="text-[10px] font-mono text-neutral-500 max-w-xs mx-auto">
              No lockers found corresponding to current search inputs or filters.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse border-spacing-0 text-left">
            <thead>
              <tr className="border-b border-neutral-900 font-display font-semibold tracking-wider text-[10px] uppercase text-neutral-500 select-none">
                <th className="py-3 px-3 w-10">
                  <input type="checkbox" checked={allFilteredSelected} onChange={handleToggleAll}
                    className="accent-white w-4 h-4 cursor-pointer" />
                </th>
                <th className="py-3 px-3 font-bold">Locker File Title</th>
                <th className="py-3 px-3 font-bold">Section</th>
                <th className="py-3 px-3 font-bold">Size</th>
                <th className="py-3 px-3 font-bold">Added Date</th>
                <th className="py-3 px-3 font-bold text-center">Visibility</th>
                <th className="py-3 px-3 font-bold text-right">Adjustments</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((file) => (
                <AdminFileRow 
                  key={file.id} 
                  file={file} 
                  onActionComplete={onActionComplete} 
                  selected={selectedIds.has(file.id)}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center select-none border border-neutral-905 rounded border-dashed">
            <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-full w-12 h-12 flex items-center justify-center text-neutral-600 mx-auto mb-3">
              <Search className="w-5 h-5 stroke-[1.2]" />
            </div>
            <h4 className="text-zinc-300 font-display font-medium text-xs uppercase tracking-wider mb-0.5">
              No matching records
            </h4>
            <p className="text-[10px] font-mono text-neutral-500 max-w-xs mx-auto">
              No lockers found corresponding to current search inputs or filters.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1 select-none">
              <label className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 hover:text-white transition-colors cursor-pointer">
                <input type="checkbox" checked={allFilteredSelected} onChange={handleToggleAll} className="accent-white w-3.5 h-3.5 cursor-pointer" />
                SELECT ALL
              </label>
              <span className="text-[10px] font-mono text-neutral-600">({filtered.length} FILES)</span>
            </div>
            {filtered.map((file) => (
              <AdminFileRow 
                key={file.id} 
                file={file} 
                onActionComplete={onActionComplete} 
                selected={selectedIds.has(file.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
