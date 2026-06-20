import React, { useState } from 'react';
import { FileRecord } from '../../types';
import { FileIcon } from '../ui/FileIcon';
import { formatBytes } from '../../lib/formatBytes';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { uiStore } from '../../store/uiStore';
import { addRecentlyViewed } from '../../lib/recentlyViewed';
import { Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileCardProps {
  file: FileRecord;
}

export const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    const toastId = toast.loading(`Downloading ${file.name}...`);
    try {
      addRecentlyViewed(file);
      const { url } = await callEdgeFunction<{ url: string }>('get-signed-url', { fileId: file.id });
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${file.name} downloaded successfully`, { id: toastId });
    } catch (err) {
      toast.error(`Download failed: ${err instanceof Error ? err.message : 'Unknown reason'}`, { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = () => {
    addRecentlyViewed(file);
    uiStore.setSelectedFileForPreview(file);
  };

  const isPDF = file.file_type?.toLowerCase() === 'pdf';
  const displayDate = new Date(file.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="group bg-[#0d0d0d] border border-neutral-900 rounded-lg p-5 hover:border-neutral-700 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.6)] flex flex-col justify-between h-[215px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.8),0_0_15px_rgba(255,255,255,0.01)] relative overflow-hidden select-none">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent group-hover:via-neutral-400 transition-all duration-300" />
      <div>
        <div className="flex justify-between items-start gap-3">
          <div className="p-2 bg-neutral-900/80 border border-neutral-850 rounded text-white group-hover:scale-105 group-hover:border-neutral-700 transition-all duration-300">
            <FileIcon extension={file.file_type} className="w-5 h-5" />
          </div>
          <div className="text-[9px] font-mono text-neutral-400 bg-neutral-900/60 border border-neutral-850 px-2.5 py-0.5 rounded uppercase font-bold tracking-wider">
            {file.file_type || 'RAW'}
          </div>
        </div>
        <div className="mt-4.5">
          <h4 className="text-zinc-100 font-mono text-xs font-bold leading-relaxed break-all line-clamp-2 select-all hover:text-white transition-colors" title={file.name}>
            {file.name}
          </h4>
          <p className="text-[9px] text-neutral-500 font-mono mt-2 flex items-center gap-2">
            <span className="font-semibold text-neutral-400">{formatBytes(file.size_bytes)}</span>
            <span className="text-neutral-800">•</span>
            <span>{displayDate}</span>
          </p>
        </div>
      </div>
      <div className="flex gap-2.5 select-none pt-4 border-t border-neutral-900">
        {isPDF && (
          <button
            onClick={handlePreview}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-neutral-800 hover:border-neutral-600 bg-neutral-900/40 text-neutral-300 hover:text-white rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
            <span>PREVIEW</span>
          </button>
        )}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            isPDF
              ? 'bg-neutral-950 border-neutral-850 text-neutral-300 hover:bg-white hover:text-black hover:border-white'
              : 'bg-white border-white text-black hover:bg-neutral-200'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? 'FETCHING' : 'DOWNLOAD'}</span>
        </button>
      </div>
    </div>
  );
};
