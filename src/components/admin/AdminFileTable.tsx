import React, { useState } from 'react';
import { FileRecord } from '../../types';
import { SECTIONS } from '../../constants/sections';
import { AdminFileRow } from './AdminFileRow';
import { Eye, Search, Filter, HelpCircle, LayoutGrid, LayoutList } from 'lucide-react';

interface AdminFileTableProps {
  files: FileRecord[];
  onActionComplete: () => void;
}

export const AdminFileTable: React.FC<AdminFileTableProps> = ({ files, onActionComplete }) => {
  const [localSearch, setLocalSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filtering files
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

  return (
    <div className="bg-neutral-950/20 border border-neutral-900 rounded-lg p-6 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      
      {/* Search and Filters Layout */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="w-full md:max-w-sm relative font-mono text-xs">
          <span className="absolute inset-y-0 left-3 flex items-center justify-center text-neutral-500 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search catalog catalog..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-900 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-zinc-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-3.5 w-full md:w-auto font-mono text-xs select-none justify-end">
          
          {/* Section Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-950 border border-neutral-900 rounded text-neutral-400">
            <Filter className="w-3 h-3" />
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

          {/* Status selector */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-950 border border-neutral-900 rounded text-neutral-400">
            <Eye className="w-3 h-3" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[11px] font-mono border-none focus:outline-none focus:ring-0 text-white uppercase font-bold"
            >
              <option value="all" className="bg-neutral-950 text-xs">ALL VISIONS</option>
              <option value="deployed" className="bg-neutral-950 text-xs text-emerald-400 font-bold">DEPLOYED PORTAL</option>
              <option value="draft" className="bg-neutral-950 text-xs text-neutral-500 font-bold">DRAFT LOCKER</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Table responsive viewport container */}
      <div className="w-full overflow-x-auto relative">
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
                <th className="py-3 px-4 font-bold">Locker File Title</th>
                <th className="py-3 px-4 font-bold">Section</th>
                <th className="py-3 px-4 font-bold">Size</th>
                <th className="py-3 px-4 font-bold">Added Date</th>
                <th className="py-3 px-4 font-bold text-center">Visibility</th>
                <th className="py-3 px-4 font-bold text-right">Adjustments</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((file) => (
                <AdminFileRow 
                  key={file.id} 
                  file={file} 
                  onActionComplete={onActionComplete} 
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
