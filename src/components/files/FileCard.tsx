import React, { useState, useRef, useEffect } from 'react';
import { FileRecord } from '../../types';
import { FileIcon } from '../ui/FileIcon';
import { formatBytes } from '../../lib/formatBytes';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { uiStore, useUIStore } from '../../store/uiStore';
import { addRecentlyViewed } from '../../lib/recentlyViewed';
import { QuickPreview } from './QuickPreview';
import { Download, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileCardProps {
  file: FileRecord;
}

export const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const isSelected = useUIStore(s => s.selectedFileIds.has(file.id));
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setShowPreview(true), 350);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setShowPreview(false);
  };

  useEffect(() => {
    return () => { if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current); };
  }, []);

  const handleShare = async () => {
    try {
      const slug = encodeURIComponent(file.name);
      const course = file.course || 'general';
      const link = `https://alteracloud.space/${course}/${file.section}/${file.id}/${slug}`;
      await navigator.clipboard.writeText(link);
      toast.success(`Share link copied to clipboard!`);
    } catch (err) {
      toast.error(`Failed to copy: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    const toastId = toast.loading(`Downloading ${file.name}...`);
    try {
      addRecentlyViewed(file);
      const { url } = await callEdgeFunction<{ url: string }>('get-signed-url', { fileId: file.id }, false);
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

  const displayDate = new Date(file.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group bg-white border-3 border-black p-4 sm:p-5 hover:translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between h-[200px] sm:h-[215px] relative overflow-visible select-none shadow-[4px_4px_0px_0px_#000000]"
    >
      {showPreview && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-3 pointer-events-auto" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <QuickPreview file={file} />
        </div>
      )}
      <div>
        <div className="flex justify-between items-start gap-3">
          <div className="p-2 bg-white border-2 border-black text-black">
            <FileIcon extension={file.file_type} className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); uiStore.toggleFileSelection(file.id); }}
              className={`p-0.5 transition-colors cursor-pointer ${isSelected ? 'text-amber-400' : 'text-neutral-600 hover:text-amber-400'}`}
              title={isSelected ? 'Deselect' : 'Select for batch download'}
            >
              {isSelected
  ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/><rect x="3" y="3" width="18" height="18" rx="0" ry="0"/></svg>
  : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="3" y="3" width="18" height="18" rx="0" ry="0"/></svg>
}
            </button>
            <div className="text-2xs font-mono text-white bg-blue-600 border-2 border-blue-600 px-2.5 py-0.5 uppercase font-bold tracking-wider">
              {file.file_type || 'RAW'}
            </div>
          </div>
        </div>
        <div className="mt-4.5">
          <h4 className="text-black font-mono text-xs font-bold leading-relaxed break-all line-clamp-2 select-all" title={file.name}>
            {file.name}
          </h4>
          <p className="text-2xs text-neutral-700 font-mono mt-2 flex items-center gap-2 px-0.5 font-bold">
            <span className="font-semibold text-neutral-800">{formatBytes(file.size_bytes)}</span>
            <span className="text-black">•</span>
            <span className="flex items-center gap-1">
              <Download className="w-2.5 h-2.5" />
              {file.downloads ?? 0}
            </span>
            <span className="text-black">•</span>
            <span>{displayDate}</span>
          </p>
        </div>
      </div>
      <div className="flex gap-2 select-none pt-4 border-t-2 border-black">
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-white border-2 border-black text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-150 cursor-pointer active:translate-y-0.5"
          title="Copy share link"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FF3B30] border-2 border-[#FF3B30] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-blue-600 hover:border-blue-600 transition-all duration-150 cursor-pointer disabled:opacity-50 active:translate-y-0.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? 'FETCHING' : 'DOWNLOAD'}</span>
        </button>
      </div>
    </div>
  );
};
