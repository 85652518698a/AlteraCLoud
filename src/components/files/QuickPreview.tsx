import React, { useState, useEffect, useRef } from 'react';
import { FileRecord } from '../../types';
import { FileIcon } from '../ui/FileIcon';
import { formatBytes } from '../../lib/formatBytes';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { uiStore } from '../../store/uiStore';
import { addRecentlyViewed } from '../../lib/recentlyViewed';
import { SECTIONS } from '../../constants/sections';
import { COURSES } from '../../constants/courses';
import { Eye, Download, Clock } from 'lucide-react';
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

  const handleView = () => {
    addRecentlyViewed(file);
    uiStore.openFileViewer(file);
  };

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
    <div className="w-[320px] bg-[#0d0d0d] border border-neutral-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {isImage && (
        <div className="h-40 bg-neutral-950 overflow-hidden border-b border-neutral-900 flex items-center justify-center">
          {loadingPreview ? (
            <div className="w-5 h-5 border border-neutral-600 border-t-transparent rounded-full animate-spin" />
          ) : previewUrl ? (
            <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
          ) : (
            <FileIcon extension={file.file_type} className="w-8 h-8 opacity-30" />
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-neutral-900 rounded border border-neutral-850 shrink-0">
            <FileIcon extension={file.file_type} className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-mono font-bold text-zinc-200 truncate" title={file.name}>
              {file.name}
            </h4>
            <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
              {formatBytes(file.size_bytes)} • {file.file_type?.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 uppercase border border-neutral-850">
            {sectionLabel}
          </span>
          {courseLabel && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 uppercase border border-neutral-850">
              {courseLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[9px] font-mono text-neutral-500 mb-3">
          <span className="flex items-center gap-1">
            <Download className="w-2.5 h-2.5" />
            {file.downloads ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-2.5 h-2.5" />
            {file.views ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {displayDate}
          </span>
        </div>

        <div className="flex gap-2 pt-3 border-t border-neutral-900">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-neutral-800 hover:border-accent/40 bg-neutral-900/40 text-neutral-300 hover:text-white rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer hover:bg-neutral-800/40"
          >
            <Eye className="w-3 h-3" />
            <span>VIEW</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-white text-black rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all duration-200 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>DOWNLOAD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
