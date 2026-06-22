import React, { useState } from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { FileIcon } from '../ui/FileIcon';
import { formatBytes } from '../../lib/formatBytes';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { addRecentlyViewed } from '../../lib/recentlyViewed';
import { Download, X, Eye, ShieldAlert, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const FilePreviewModal: React.FC = () => {
  const file = useUIStore(s => s.selectedFileForPreview);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  if (!file) return null;

  const handleClose = () => {
    uiStore.setSelectedFileForPreview(null);
    setPreviewUrl(null);
  };

  const getSignedUrl = async () => {
    if (previewUrl) return previewUrl;
    setLoadingPreview(true);
    try {
      addRecentlyViewed(file);
      const { url } = await callEdgeFunction<{ url: string }>('get-signed-url', { fileId: file.id }, false);
      setPreviewUrl(url);
      setLoadingPreview(false);
      return url;
    } catch (err) {
      setLoadingPreview(false);
      toast.error('Failed to generate access link');
      return null;
    }
  };

  const handleDownload = async () => {
    const url = await getSignedUrl();
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${file.name} download initiated`);
  };

  const handlePreview = async () => {
    const url = await getSignedUrl();
    if (url) setPreviewUrl(url);
  };

  const mime = file.mime_type?.toLowerCase() || '';
  const isPDF = mime === 'application/pdf' || file.file_type?.toLowerCase() === 'pdf';
  const isImage = mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(file.file_type?.toLowerCase());

  const displayDate = new Date(file.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
      <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-900 flex flex-col h-[85vh] rounded-lg shadow-[0_24px_64px_rgba(0,0,0,0.9)] overflow-hidden relative text-left">
        
        {/* Modal Header */}
        <div className="bg-black border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-neutral-900 rounded text-white border border-neutral-850">
              <FileIcon extension={file.file_type} className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-zinc-100 font-mono text-xs font-bold leading-none select-all truncate max-w-lg" title={file.name}>
                {file.name}
              </h3>
              <p className="text-[10px] font-mono text-neutral-500 uppercase mt-1">
                {file.section} • {formatBytes(file.size_bytes)} • ↓{file.downloads ?? 0} • CHECKED IN {displayDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 select-none">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors duration-150 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>DOWNLOAD</span>
            </button>
            
            <button
              onClick={handleClose}
              className="text-neutral-500 hover:text-white rounded-full p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-850 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body Viewport */}
        <div className="flex-1 overflow-auto p-6 bg-black flex items-center justify-center">
          {isPDF ? (
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 bg-neutral-950 rounded border border-neutral-950 overflow-hidden relative">
                {loadingPreview ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center text-neutral-500 bg-neutral-950 select-none">
                    <FileText className="w-12 h-12 stroke-[1] text-neutral-600 mb-2 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">Decrypting and streaming document...</span>
                  </div>
                ) : previewUrl ? (
                  <iframe
                    id="pdf-player"
                    src={`${previewUrl}#toolbar=1`}
                    className="w-full h-full relative z-10 border-0 rounded bg-neutral-900"
                    title={file.name}
                  />
                ) : (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center text-neutral-500 bg-neutral-950 select-none">
                    <button onClick={handlePreview} className="px-6 py-3 bg-white text-black text-xs font-mono font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.1)]">
                      LOAD PREVIEW
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-neutral-950 rounded border border-neutral-950 overflow-hidden relative">
                {loadingPreview ? (
                  <div className="flex flex-col items-center justify-center text-neutral-500 select-none">
                    <ImageIcon className="w-12 h-12 stroke-[1] text-neutral-600 mb-2 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">Loading image...</span>
                  </div>
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <button onClick={handlePreview} className="px-6 py-3 bg-white text-black text-xs font-mono font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.1)]">
                    LOAD IMAGE
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-md w-full bg-neutral-950 border border-neutral-900 p-8 rounded text-center my-auto flex flex-col items-center">
              <div className="p-4 bg-neutral-900 text-neutral-500 border border-neutral-850 rounded-full mb-4">
                <FileIcon extension={file.file_type} className="w-10 h-10" />
              </div>
              <h4 className="text-zinc-200 font-mono text-xs font-bold leading-relaxed break-all mb-1 uppercase select-all">
                {file.name}
              </h4>
              <p className="text-[10px] font-mono text-neutral-500 mb-6">
                FORMAT: {(file.file_type || 'bin').toUpperCase()} • SIZE: {formatBytes(file.size_bytes)}
              </p>

              <div className="p-4.5 bg-neutral-900/30 border border-neutral-900 rounded text-left flex gap-3 text-xs mb-6 max-w-sm">
                <ShieldAlert className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                <p className="text-neutral-400 leading-relaxed font-sans text-[11px]">
                  Direct in-browser visualization is reserved exclusively for PDF format documents due to browser safety requirements.
                </p>
              </div>

              <button
                onClick={handleDownload}
                className="w-full bg-white text-black font-semibold text-xs font-mono py-3 rounded-full hover:bg-neutral-200 uppercase tracking-wider transition-colors shadow-[0_0_12px_rgba(255,255,255,0.1)] cursor-pointer"
              >
                Download & View Locally
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
