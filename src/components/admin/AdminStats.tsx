import React from 'react';
import { FileRecord } from '../../types';
import { COURSES } from '../../constants/courses';
import { formatBytes } from '../../lib/formatBytes';
import { Files, CircleDot, ShieldCheck, HardDrive, Bookmark } from 'lucide-react';

interface AdminStatsProps {
  files: FileRecord[];
}

export const AdminStats: React.FC<AdminStatsProps> = ({ files }) => {
  const totalFiles = files.length;
  const deployedCount = files.filter(f => f.is_deployed).length;
  const draftCount = totalFiles - deployedCount;
  const totalStorage = files.reduce((acc, current) => acc + current.size_bytes, 0);

  return (
    <><div className="grid grid-cols-2 lg:grid-cols-4 gap-6 select-none my-6">
      {/* Total Files Card */}
      <div className="bg-neutral-950/40 border border-neutral-900 rounded p-5 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-neutral-500 uppercase">
            Total Files
          </div>
          <div className="text-xl font-display font-black text-white mt-1.5 tracking-wide">
            {totalFiles}
          </div>
        </div>
        <div className="p-2.5 bg-neutral-900 text-neutral-400 border border-neutral-850 rounded">
          <Files className="w-5 h-5 stroke-[1.5]" />
        </div>
      </div>

      {/* Deployed Count Card */}
      <div className="bg-neutral-950/40 border border-neutral-900 rounded p-5 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-neutral-500 uppercase">
            Deployed
          </div>
          <div className="text-xl font-display font-black text-white mt-1.5 tracking-wide">
            {deployedCount}
          </div>
        </div>
        <div className="p-2.5 bg-neutral-900 text-white border border-neutral-850 rounded shadow-[0_0_8px_rgba(255,255,255,0.1)]">
          <CircleDot className="w-5 h-5 stroke-[1.5]" />
        </div>
      </div>

      {/* Drafts Card */}
      <div className="bg-neutral-950/40 border border-neutral-900 rounded p-5 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-neutral-500 uppercase">
            Drafts / Queue
          </div>
          <div className="text-xl font-display font-black text-white mt-1.5 tracking-wide">
            {draftCount}
          </div>
        </div>
        <div className="p-2.5 bg-neutral-900 text-neutral-600 border border-neutral-850 rounded">
          <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
        </div>
      </div>

      {/* Storage Count Card */}
      <div className="bg-neutral-950/40 border border-neutral-900 rounded p-5 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-neutral-500 uppercase">
            Space Occupied
          </div>
          <div className="text-xl font-mono font-bold text-white mt-1.5 tracking-wide uppercase">
            {formatBytes(totalStorage, 1)}
          </div>
        </div>
        <div className="p-2.5 bg-neutral-900 text-neutral-400 border border-neutral-850 rounded">
          <HardDrive className="w-5 h-5 stroke-[1.5]" />
        </div>
      </div>
    </div>

    <div className="bg-neutral-950/40 border border-neutral-900 rounded-lg p-5 mb-6 shadow-[0_4px_12px_rgba(0,0,0,0.5)] select-none">
      <div className="flex items-center gap-2 mb-4">
        <Bookmark className="w-4 h-4 text-neutral-400" />
        <h3 className="text-zinc-200 font-display font-semibold tracking-wider text-xs uppercase">COURSE BREAKDOWN</h3>
        <span className="text-neutral-600 font-mono text-[9px] font-normal">/ FILES PER COURSE</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {COURSES.map(c => {
          const courseFiles = files.filter(f => f.course === c.id);
          const courseStorage = courseFiles.reduce((acc, f) => acc + f.size_bytes, 0);
          if (courseFiles.length === 0) return null;
          return (
            <div key={c.id} className="bg-neutral-950/60 border border-neutral-900 rounded p-3 text-center">
              <div className="text-[11px] font-display font-bold text-zinc-200 uppercase tracking-wide">{c.label}</div>
              <div className="text-xl font-display font-black text-white mt-1">{courseFiles.length}</div>
              <div className="text-[8px] font-mono text-neutral-500 uppercase mt-0.5">{formatBytes(courseStorage, 1)}</div>
            </div>
          );
        })}
        {files.filter(f => !f.course).length > 0 && (() => {
          const uncategorized = files.filter(f => !f.course);
          return (
            <div key="uncategorized" className="bg-neutral-950/60 border border-neutral-900 rounded p-3 text-center">
              <div className="text-[11px] font-display font-bold text-neutral-400 uppercase tracking-wide">General</div>
              <div className="text-xl font-display font-black text-white mt-1">{uncategorized.length}</div>
              <div className="text-[8px] font-mono text-neutral-500 uppercase mt-0.5">{formatBytes(uncategorized.reduce((a, f) => a + f.size_bytes, 0), 1)}</div>
            </div>
          );
        })()}
      </div>
    </div></>
  );
};
