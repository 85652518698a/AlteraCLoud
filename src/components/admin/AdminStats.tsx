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
      <div className="bg-white border-3 border-black p-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-neutral-700 uppercase font-bold">
            Total Files
          </div>
          <div className="text-xl font-display font-black text-black mt-1.5 tracking-wide">
            {totalFiles}
          </div>
        </div>
        <div className="p-2.5 bg-white border-2 border-black text-black">
          <Files className="w-5 h-5 stroke-[1.5]" />
        </div>
      </div>

      <div className="bg-white border-3 border-black p-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-neutral-700 uppercase font-bold">
            Deployed
          </div>
          <div className="text-xl font-display font-black text-black mt-1.5 tracking-wide">
            {deployedCount}
          </div>
        </div>
        <div className="p-2.5 bg-black text-white border-2 border-black">
          <CircleDot className="w-5 h-5 stroke-[1.5]" />
        </div>
      </div>

      <div className="bg-white border-3 border-black p-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-neutral-700 uppercase font-bold">
            Drafts / Queue
          </div>
          <div className="text-xl font-display font-black text-black mt-1.5 tracking-wide">
            {draftCount}
          </div>
        </div>
        <div className="p-2.5 bg-white text-black border-2 border-black">
          <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
        </div>
      </div>

      <div className="bg-white border-3 border-black p-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-neutral-700 uppercase font-bold">
            Space Occupied
          </div>
          <div className="text-xl font-mono font-bold text-black mt-1.5 tracking-wide uppercase">
            {formatBytes(totalStorage, 1)}
          </div>
        </div>
        <div className="p-2.5 bg-white text-black border-2 border-black">
          <HardDrive className="w-5 h-5 stroke-[1.5]" />
        </div>
      </div>
    </div>

    <div className="bg-white border-3 border-black p-5 mb-6 select-none">
      <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-3">
        <Bookmark className="w-4 h-4 text-black" />
        <h3 className="text-black font-display font-bold tracking-wider text-xs uppercase">COURSE BREAKDOWN</h3>
        <span className="text-neutral-600 font-mono text-[9px] font-normal">/ FILES PER COURSE</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {COURSES.map(c => {
          const courseFiles = files.filter(f => f.course === c.id);
          const courseStorage = courseFiles.reduce((acc, f) => acc + f.size_bytes, 0);
          if (courseFiles.length === 0) return null;
          return (
            <div key={c.id} className="bg-white border-2 border-black p-3 text-center">
              <div className="text-[11px] font-display font-bold text-black uppercase tracking-wide">{c.label}</div>
              <div className="text-xl font-display font-black text-black mt-1">{courseFiles.length}</div>
              <div className="text-[8px] font-mono text-neutral-700 uppercase mt-0.5 font-bold">{formatBytes(courseStorage, 1)}</div>
            </div>
          );
        })}
        {files.filter(f => !f.course).length > 0 && (() => {
          const uncategorized = files.filter(f => !f.course);
          return (
            <div key="uncategorized" className="bg-white border-2 border-black p-3 text-center">
              <div className="text-[11px] font-display font-bold text-neutral-700 uppercase tracking-wide">General</div>
              <div className="text-xl font-display font-black text-black mt-1">{uncategorized.length}</div>
              <div className="text-[8px] font-mono text-neutral-700 uppercase mt-0.5 font-bold">{formatBytes(uncategorized.reduce((a, f) => a + f.size_bytes, 0), 1)}</div>
            </div>
          );
        })()}
      </div>
    </div></>
  );
};
