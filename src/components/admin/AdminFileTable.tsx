import React, { useState, useCallback } from 'react';
import { FileRecord } from '../../types';
import { SECTIONS } from '../../constants/sections';
import { COURSES } from '../../constants/courses';
import { AdminFileRow } from './AdminFileRow';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { Eye, Search, Filter, Trash2, Upload, Download, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminFileTableProps {
  files: FileRecord[];
  onActionComplete: () => void;
}

export const AdminFileTable: React.FC<AdminFileTableProps> = ({ files, onActionComplete }) => {
  const [localSearch, setLocalSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkCourse, setBulkCourse] = useState('');

  const filtered = files.filter(f => {
    const matchesSearch = localSearch.trim() === '' || 
      f.name.toLowerCase().includes(localSearch.toLowerCase()) || 
      f.uploaded_by.toLowerCase().includes(localSearch.toLowerCase());
    
    const matchesSection = sectionFilter === 'all' || f.section === sectionFilter;
    const matchesCourse = !courseFilter || f.course === courseFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'deployed' && f.is_deployed) || 
      (statusFilter === 'draft' && !f.is_deployed);

    return matchesSearch && matchesSection && matchesCourse && matchesStatus;
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

  const bulkAssignCourse = useCallback(async () => {
    if (selectedIds.size === 0 || !bulkCourse) return;
    setBulkLoading(true);
    const toastId = toast.loading(`Assigning course to ${selectedIds.size} files...`);
    let success = 0;
    let fail = 0;
    for (const fileId of selectedIds) {
      try {
        await callEdgeFunction('update-file', { fileId, course: bulkCourse });
        success++;
      } catch {
        fail++;
      }
    }
    const courseLabel = COURSES.find(c => c.id === bulkCourse)?.label || bulkCourse;
    if (fail === 0) {
      toast.success(`All ${success} files assigned to ${courseLabel}.`, { id: toastId });
    } else {
      toast.error(`${success} files assigned, ${fail} failed.`, { id: toastId });
    }
    setBulkLoading(false);
    setBulkCourse('');
    clearSelection();
    onActionComplete();
  }, [selectedIds, bulkCourse, onActionComplete]);

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
    <div className="bg-white border-3 border-black p-4 sm:p-6 overflow-hidden">
      
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
            className="w-full pl-9 pr-4 py-2 bg-white border-2 border-black text-xs text-black placeholder-neutral-600 font-mono font-bold"
          />
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3.5 w-full sm:w-auto font-mono text-xs select-none">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-black text-black">
            <Filter className="w-3 h-3 shrink-0" />
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="bg-transparent text-[11px] font-mono text-black uppercase font-bold focus:outline-none"
            >
              <option value="all" className="bg-white text-xs font-bold">ALL DIRECTORIES</option>
              {SECTIONS.map(s => (
                <option key={s.id} value={s.id} className="bg-white text-xs font-bold">{s.label.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-black text-black">
            <Filter className="w-3 h-3 shrink-0" />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="bg-transparent text-[11px] font-mono text-black uppercase font-bold focus:outline-none"
            >
              <option value="" className="bg-white text-xs font-bold">ALL COURSES</option>
              {COURSES.map(c => (
                <option key={c.id} value={c.id} className="bg-white text-xs font-bold">{c.label.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-black text-black">
            <Eye className="w-3 h-3 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[11px] font-mono text-black uppercase font-bold focus:outline-none"
            >
              <option value="all" className="bg-white text-xs font-bold">ALL VISIONS</option>
              <option value="deployed" className="bg-white text-xs font-bold">DEPLOYED</option>
              <option value="draft" className="bg-white text-xs font-bold">DRAFT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 p-3 bg-white border-2 border-black text-[10px] sm:text-[11px] font-mono font-bold">
          <span className="text-black font-bold whitespace-nowrap">{selectedIds.size} SELECTED</span>
          <div className="w-px h-4 bg-black" />
          <button onClick={() => bulkAction('deploy')} disabled={bulkLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white border-2 border-black hover:bg-green-600 hover:border-green-600 transition-colors duration-150 cursor-pointer disabled:opacity-40 text-[10px] font-mono font-bold uppercase">
            <Upload className="w-3 h-3" /> DEPLOY
          </button>
          <button onClick={() => bulkAction('draft')} disabled={bulkLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer disabled:opacity-40 text-[10px] font-mono font-bold uppercase">
            <Download className="w-3 h-3" /> DRAFT
          </button>
          <button onClick={() => bulkAction('delete')} disabled={bulkLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#FF3B30] border-2 border-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-colors duration-150 cursor-pointer disabled:opacity-40 text-[10px] font-mono font-bold uppercase">
            <Trash2 className="w-3 h-3" /> DELETE
          </button>
          <div className="w-px h-4 bg-black" />
          <select value={bulkCourse} onChange={(e) => setBulkCourse(e.target.value)} disabled={bulkLoading}
            className="bg-white border-2 border-black px-2 py-1 text-[10px] text-black font-mono font-bold">
            <option value="" className="bg-white font-bold">COURSE...</option>
            {COURSES.map(c => (
              <option key={c.id} value={c.id} className="bg-white font-bold">{c.label.toUpperCase()}</option>
            ))}
          </select>
          <button onClick={bulkAssignCourse} disabled={bulkLoading || !bulkCourse}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white border-2 border-black hover:bg-blue-600 hover:border-blue-600 transition-colors duration-150 cursor-pointer disabled:opacity-40 text-[10px] font-mono font-bold uppercase">
            <Bookmark className="w-3 h-3" /> ASSIGN
          </button>
          <button onClick={clearSelection}
            className="text-neutral-700 hover:text-blue-600 cursor-pointer px-2 ml-auto font-bold uppercase tracking-wider text-[10px]">
            CLEAR
          </button>
        </div>
      )}

      {/* Desktop table */}
      <div className="w-full overflow-x-auto relative max-sm:hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center select-none border-2 border-black bg-white">
            <div className="p-3 bg-white border-2 border-black w-12 h-12 flex items-center justify-center text-black mx-auto mb-3">
              <Search className="w-5 h-5 stroke-[1.2]" />
            </div>
            <h4 className="text-black font-display font-bold text-xs uppercase tracking-wider mb-0.5">
              No matching records
            </h4>
            <p className="text-[10px] font-mono text-neutral-700 max-w-xs mx-auto font-bold">
              No lockers found corresponding to current search inputs or filters.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse border-spacing-0 text-left">
            <thead>
              <tr className="border-b-2 border-black font-display font-bold tracking-wider text-[10px] uppercase text-neutral-700 select-none">
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
          <div className="py-16 text-center select-none border-2 border-black bg-white">
            <div className="p-3 bg-white border-2 border-black w-12 h-12 flex items-center justify-center text-black mx-auto mb-3">
              <Search className="w-5 h-5 stroke-[1.2]" />
            </div>
            <h4 className="text-black font-display font-bold text-xs uppercase tracking-wider mb-0.5">
              No matching records
            </h4>
            <p className="text-[10px] font-mono text-neutral-700 max-w-xs mx-auto font-bold">
              No lockers found corresponding to current search inputs or filters.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1 select-none">
              <label className="flex items-center gap-1.5 text-[10px] font-mono text-black font-bold hover:text-[#FF3B30] transition-colors cursor-pointer">
                <input type="checkbox" checked={allFilteredSelected} onChange={handleToggleAll} className="accent-black w-3.5 h-3.5 cursor-pointer" />
                SELECT ALL
              </label>
              <span className="text-[10px] font-mono text-neutral-700 font-bold">({filtered.length} FILES)</span>
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
