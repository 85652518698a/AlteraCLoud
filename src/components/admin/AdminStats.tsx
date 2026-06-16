import React from 'react';
import { FileRecord } from '../../types';
import { formatBytes } from '../../lib/formatBytes';
import { Files, CircleDot, ShieldCheck, HardDrive } from 'lucide-react';

interface AdminStatsProps {
  files: FileRecord[];
}

export const AdminStats: React.FC<AdminStatsProps> = ({ files }) => {
  const totalFiles = files.length;
  const deployedCount = files.filter(f => f.is_deployed).length;
  const draftCount = totalFiles - deployedCount;
  const totalStorage = files.reduce((acc, current) => acc + current.size_bytes, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 select-none my-6">
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
  );
};
