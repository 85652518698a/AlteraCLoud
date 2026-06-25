import React, { useState, useEffect, useRef } from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { FileIcon } from '../ui/FileIcon';
import { formatBytes } from '../../lib/formatBytes';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { addRecentlyViewed } from '../../lib/recentlyViewed';
import { isTextFile, getHighlightLanguage } from '../../lib/textPreview';
import hljs from '../../lib/highlightSetup';
import { Download, X, ShieldAlert, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const FilePreviewModal: React.FC = () => {
  const file = useUIStore(s => s.selectedFileForPreview);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (textContent && codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [textContent]);

  if (!file) return null;

  const handleClose = () => {
    uiStore.setSelectedFileForPreview(null);
    setPreviewUrl(null);
    setTextContent(null);
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
    if (url) {
      if (isTextFile(file.file_type)) {
        try {
          const res = await fetch(url);
          const text = await res.text();
          setTextContent(text);
        } catch {
          toast.error('Failed to load file content');
        }
      }
      setPreviewUrl(url);
    }
  };

  const mime = file.mime_type?.toLowerCase() || '';
  const isPDF = mime === 'application/pdf' || file.file_type?.toLowerCase() === 'pdf';
  const isImage = mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(file.file_type?.toLowerCase());
  const isText = isTextFile(file.file_type);

  const displayDate = new Date(file.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95">
      <div className="w-full max-w-4xl bg-white border-4 border-black flex flex-col h-[85vh] shadow-[8px_8px_0px_0px_#000000] overflow-hidden relative text-left">
        
        {/* Modal Header */}
        <div className="bg-white border-b-4 border-black px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white border-2 border-black text-black">
              <FileIcon extension={file.file_type} className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-black font-mono text-xs font-bold leading-none select-all truncate max-w-lg" title={file.name}>
                {file.name}
              </h3>
              <p className="text-xs font-mono text-neutral-700 uppercase mt-1 font-bold">
                {file.section} • {formatBytes(file.size_bytes)} • ↓{file.downloads ?? 0} • CHECKED IN {displayDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 select-none">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-white border-2 border-black text-black font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 text-xs font-mono uppercase tracking-wider transition-colors duration-150 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>DOWNLOAD</span>
            </button>
            
            <button
              onClick={handleClose}
              className="text-black hover:text-white hover:bg-blue-600 p-1.5 border-2 border-black hover:border-blue-600 transition-colors duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body Viewport */}
        <div className="flex-1 overflow-auto p-6 bg-white flex items-center justify-center">
          {isPDF ? (
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 bg-white border-2 border-black overflow-hidden relative">
                {loadingPreview ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center text-neutral-700 bg-white select-none">
                    <FileText className="w-12 h-12 stroke-[1] text-black mb-2" />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold">Decrypting and streaming document...</span>
                  </div>
                ) : previewUrl ? (
                  <iframe
                    id="pdf-player"
                    src={`${previewUrl}#toolbar=1`}
                    className="w-full h-full relative z-10 border-0 bg-white"
                    title={file.name}
                  />
                ) : (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center text-neutral-700 bg-white select-none">
                    <button onClick={handlePreview} className="px-6 py-3 bg-black text-white text-xs font-mono font-bold uppercase tracking-wider border-2 border-black hover:bg-blue-600 hover:border-blue-600 transition-all duration-150 cursor-pointer">
                      LOAD PREVIEW
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-white border-2 border-black overflow-hidden relative">
                {loadingPreview ? (
                  <div className="flex flex-col items-center justify-center text-neutral-700 select-none">
                    <ImageIcon className="w-12 h-12 stroke-[1] text-black mb-2" />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold">Loading image...</span>
                  </div>
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <button onClick={handlePreview} className="px-6 py-3 bg-black text-white text-xs font-mono font-bold uppercase tracking-wider border-2 border-black hover:bg-blue-600 hover:border-blue-600 transition-all duration-150 cursor-pointer">
                    LOAD IMAGE
                  </button>
                )}
              </div>
            </div>
          ) : isText ? (
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 bg-white border-2 border-black overflow-auto relative">
                {loadingPreview ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center text-neutral-700 bg-white select-none">
                    <svg className="w-12 h-12 stroke-[1] text-black mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                    <span className="text-xs font-mono uppercase tracking-wider font-bold">Loading file content...</span>
                  </div>
                ) : textContent ? (
                  <pre className="p-4 text-xs leading-relaxed overflow-x-auto m-0 bg-white">
                    <code ref={codeRef} className={`language-${getHighlightLanguage(file.file_type)} hljs bg-white`}>
                      {textContent}
                    </code>
                  </pre>
                ) : (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center text-neutral-700 bg-white select-none">
                    <svg className="w-12 h-12 stroke-[1] text-black mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                    <p className="text-xs font-mono text-neutral-700 mb-4 font-bold">Text file ready to preview</p>
                    <button onClick={handlePreview} className="px-6 py-3 bg-black text-white text-xs font-mono font-bold uppercase tracking-wider border-2 border-black hover:bg-blue-600 hover:border-blue-600 transition-all duration-150 cursor-pointer">
                      LOAD CONTENT
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-md w-full bg-white border-4 border-black p-8 text-center my-auto flex flex-col items-center">
              <div className="p-4 bg-white text-black border-2 border-black mb-4">
                <FileIcon extension={file.file_type} className="w-10 h-10" />
              </div>
              <h4 className="text-black font-mono text-xs font-bold leading-relaxed break-all mb-1 uppercase select-all">
                {file.name}
              </h4>
              <p className="text-xs font-mono text-neutral-700 mb-6 font-bold">
                FORMAT: {(file.file_type || 'bin').toUpperCase()} • SIZE: {formatBytes(file.size_bytes)}
              </p>

              <div className="p-4.5 bg-white border-2 border-black text-left flex gap-3 text-xs mb-6 max-w-sm">
                <ShieldAlert className="w-5 h-5 text-black shrink-0 mt-0.5" />
                <p className="text-neutral-700 leading-relaxed font-sans text-xs font-medium">
                  Direct in-browser visualization is reserved exclusively for PDF format documents due to browser safety requirements.
                </p>
              </div>

              <button
                onClick={handleDownload}
                className="w-full bg-black text-white font-bold text-xs font-mono py-3 border-2 border-black hover:bg-blue-600 hover:border-blue-600 uppercase tracking-wider transition-colors duration-150 cursor-pointer"
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
