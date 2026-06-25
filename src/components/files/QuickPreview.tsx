import React, { useState, useEffect, useRef } from 'react';
import { FileRecord } from '../../types';
import { FileIcon } from '../ui/FileIcon';
import { formatBytes } from '../../lib/formatBytes';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { addRecentlyViewed } from '../../lib/recentlyViewed';
import { SECTIONS } from '../../constants/sections';
import { COURSES } from '../../constants/courses';
import { Download, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuickPreviewProps {
  file: FileRecord;
}

const SECTION_BADGE: Record<string, string> = {};
SECTIONS.forEach(s => { SECTION_BADGE[s.id] = s.label });

const COURSE_LABEL: Record<string, string> = {};
COURSES.forEach(c => { COURSE_LABEL[c.id] = c.label });

export const QuickPreview: React.FC<QuickPreviewProps> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(file.file_type?.toLowerCase() || '');
  const sectionLabel = SECTION_BADGE[file.section] || file.section;
  const courseLabel = file.course ? COURSE_LABEL[file.course] || file.course : null;

  const displayDate = new Date(file.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  useEffect(() => {
    if (!isImage) return;
    let cancelled = false;
    setLoadingPreview(true);
    callEdgeFunction<{ url: string }>('get-signed-url', { fileId: file.id, recordView: false }, false)
      .then(({ url }) => { if (!cancelled) setPreviewUrl(url); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingPreview(false); });
    return () => { cancelled = true; };
  }, [file.id, isImage]);

  const handleDownload = async () => {
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
      toast.success(`${file.name} downloaded`, { id: toastId });
    } catch (err) {
      toast.error(`Download failed`, { id: toastId });
    }
  };

  return (
    <div className="w-[320px] bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000000] overflow-hidden">
      {isImage && (
        <div className="h-40 bg-white overflow-hidden border-b-2 border-black flex items-center justify-center">
          {loadingPreview ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin" />
          ) : previewUrl ? (
            <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
          ) : (
            <FileIcon extension={file.file_type} className="w-8 h-8 opacity-40" />
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-white border-2 border-black shrink-0">
            <FileIcon extension={file.file_type} className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-mono font-bold text-black truncate" title={file.name}>
              {file.name}
            </h4>
            <p className="text-xs font-mono text-neutral-700 mt-0.5 font-bold">
              {formatBytes(file.size_bytes)} • {file.file_type?.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          <span className="text-2xs font-mono px-1.5 py-0.5 bg-blue-600 text-white border-2 border-blue-600 uppercase font-bold">
            {sectionLabel}
          </span>
          {courseLabel && (
            <span className="text-2xs font-mono px-1.5 py-0.5 bg-amber-400 text-black border-2 border-amber-400 uppercase font-bold">
              {courseLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-2xs font-mono text-neutral-700 mb-3 font-bold">
          <span className="flex items-center gap-1">
            <Download className="w-2.5 h-2.5" />
            {file.downloads ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-blue-600"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {file.views ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {displayDate}
          </span>
        </div>

        <div className="flex gap-2 pt-3 border-t-2 border-black">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#FF3B30] border-2 border-[#FF3B30] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-blue-600 hover:border-blue-600 transition-all duration-150 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>DOWNLOAD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
