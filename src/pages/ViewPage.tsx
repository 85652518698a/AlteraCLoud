import React, { useState, useEffect, useCallback } from 'react';
import { useUIStore, uiStore } from '../store/uiStore';
import { supabase } from '../config/supabase';
import { callEdgeFunction } from '../lib/edgeFunction';
import { addRecentlyViewed } from '../lib/recentlyViewed';
import { FileIcon } from '../components/ui/FileIcon';
import { formatBytes } from '../lib/formatBytes';
import { Spinner } from '../components/ui/Spinner';
import { FileRecord } from '../types';
import { AddToCollectionButton } from '../components/files/AddToCollectionButton';
import { ChevronLeft, Download, Eye, FileText, Image as ImageIcon, ShieldAlert, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const ViewPage: React.FC = () => {
  const file = useUIStore(s => s.viewFile);
  const currentPage = useUIStore(s => s.currentPage);
  const [localFile, setLocalFile] = useState<FileRecord | null>(null);
  const [fetching, setFetching] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const activeFile = file || localFile;

  const isImage = activeFile ? ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(activeFile.file_type?.toLowerCase() || '') : false;
  const isPDF = activeFile?.file_type?.toLowerCase() === 'pdf';

  // Fetch file directly if navigating to /view/:id without store state
  useEffect(() => {
    if (file) return;
    if (currentPage !== 'view') return;
    const match = window.location.pathname.match(/^\/view\/([^/]+)/);
    const fileId = match?.[1];
    if (!fileId) return;
    setFetching(true);
    supabase.from('files').select('*').eq('id', fileId).maybeSingle().then(({ data, error }) => {
      if (data) {
        setLocalFile(data);
        uiStore.setViewFile(data);
      }
      setFetching(false);
    });
  }, [file, currentPage]);

  const getSignedUrl = useCallback(async (recordView = false) => {
    if (!activeFile) return null;
    if (signedUrl) return signedUrl;
    setLoading(true);
    try {
      const { url } = await callEdgeFunction<{ url: string }>(
        'get-signed-url',
        { fileId: activeFile.id, recordView },
        false
      );
      setSignedUrl(url);
      return url;
    } catch (err) {
      toast.error('Failed to generate access link');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeFile, signedUrl]);

  useEffect(() => {
    if (!activeFile) return;
    addRecentlyViewed(activeFile);
    if (isPDF || isImage) {
      getSignedUrl(true);
    }
  }, [activeFile, isPDF, isImage, getSignedUrl]);

  const handleDownload = async () => {
    if (!activeFile) return;
    const toastId = toast.loading(`Downloading ${activeFile.name}...`);
    try {
      const url = await getSignedUrl();
      if (!url) { toast.error('Failed to get download link', { id: toastId }); return; }
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', activeFile.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${activeFile.name} downloaded`, { id: toastId });
    } catch (err) {
      toast.error('Download failed', { id: toastId });
    }
  };

  const handleShareLink = async () => {
    if (!activeFile) return;
    const url = `${window.location.origin}/view/${activeFile.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleBack = () => {
    uiStore.setViewFile(null);
    uiStore.setCurrentPage('dashboard');
    window.history.replaceState(null, '', '/');
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
        <Spinner size="lg" />
        <span className="text-[10px] font-mono tracking-widest text-neutral-500 mt-4 uppercase">
          Loading file...
        </span>
      </div>
    );
  }

  if (!activeFile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
        <p className="text-neutral-500 text-xs font-mono">File not found</p>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-white text-black text-xs font-mono font-bold uppercase rounded-sm hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const displayDate = new Date(activeFile.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col text-white">
      {/* Top navigation bar */}
      <div className="border-b border-neutral-900 bg-black/80 backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="w-px h-5 bg-neutral-800" />
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-neutral-900 rounded border border-neutral-850">
              <FileIcon extension={activeFile.file_type} className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-mono font-bold leading-tight truncate max-w-[200px] sm:max-w-md" title={activeFile.name}>
                {activeFile.name}
              </h1>
              <p className="text-[10px] font-mono text-neutral-500 uppercase">
                {activeFile.section?.replace('_', ' ')} • {formatBytes(activeFile.size_bytes)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-neutral-500 bg-neutral-900/60 border border-neutral-900 rounded-sm px-3 py-1.5">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {activeFile.views ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {activeFile.downloads ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {displayDate}
            </span>
          </div>
          <AddToCollectionButton fileId={activeFile.id} />
          <button
            onClick={() => { window.open(`/print/${activeFile.id}`, '_blank'); }}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer"
            title="Print view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span className="hidden sm:inline">PRINT</span>
          </button>
          <button
            onClick={handleShareLink}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer"
            title="Copy share link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            <span className="hidden sm:inline">SHARE</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-sm text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{loading ? 'LOADING...' : 'DOWNLOAD'}</span>
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        {isPDF && (
          <div className="w-full h-full min-h-[70vh] bg-neutral-950 rounded-lg border border-neutral-900 overflow-hidden relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500">
                <FileText className="w-16 h-16 stroke-[1] text-neutral-700 mb-3 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Loading document preview...</span>
              </div>
            ) : signedUrl ? (
              <iframe
                src={`${signedUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-[80vh] border-0 rounded"
                title={activeFile.name}
                onLoad={() => setPreviewLoaded(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500">
                <p className="text-xs font-mono text-neutral-600 mb-3">Preview could not be loaded</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-white text-black text-xs font-mono font-bold uppercase rounded-sm hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Download Instead
                </button>
              </div>
            )}
          </div>
        )}

        {isImage && (
          <div className="w-full flex items-center justify-center bg-neutral-950 rounded-lg border border-neutral-900 p-4 min-h-[60vh]">
            {loading ? (
              <div className="flex flex-col items-center text-neutral-500">
                <ImageIcon className="w-16 h-16 stroke-[1] text-neutral-700 mb-3 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Loading image...</span>
              </div>
            ) : signedUrl ? (
              <img
                src={signedUrl}
                alt={activeFile.name}
                className="max-w-full max-h-[75vh] object-contain rounded shadow-2xl"
                onLoad={() => setPreviewLoaded(true)}
              />
            ) : (
              <div className="flex flex-col items-center text-neutral-500">
                <p className="text-xs font-mono text-neutral-600 mb-3">Image could not be loaded</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-white text-black text-xs font-mono font-bold uppercase rounded-sm hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Download Instead
                </button>
              </div>
            )}
          </div>
        )}

        {!isPDF && !isImage && (
          <div className="max-w-lg mx-auto mt-12 bg-neutral-950 border border-neutral-900 rounded-lg p-10 text-center">
            <div className="p-5 bg-neutral-900 text-neutral-500 border border-neutral-850 rounded-full inline-flex mb-5">
              <FileIcon extension={activeFile.file_type} className="w-12 h-12" />
            </div>
            <h3 className="text-sm font-mono font-bold text-zinc-200 mb-1 uppercase">
              {activeFile.name}
            </h3>
            <p className="text-[10px] font-mono text-neutral-500 mb-6">
              FORMAT: {(activeFile.file_type || 'bin').toUpperCase()} • SIZE: {formatBytes(activeFile.size_bytes)}
            </p>

            <div className="p-4 bg-neutral-900/30 border border-neutral-900 rounded text-left flex gap-3 text-xs mb-6">
              <ShieldAlert className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
              <p className="text-neutral-400 leading-relaxed font-sans text-[11px]">
                In-browser preview is only available for PDF documents and images. Other file types can be downloaded for local viewing.
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold text-xs font-mono uppercase tracking-wider rounded-sm hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD TO VIEW</span>
            </button>

            {/* Mobile stats */}
            <div className="sm:hidden flex items-center justify-center gap-4 mt-6 text-[10px] font-mono text-neutral-500 border-t border-neutral-900 pt-4">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {activeFile.views ?? 0} views
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {activeFile.downloads ?? 0} downloads
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {displayDate}
              </span>
            </div>
          </div>
        )}

        {/* Bottom metadata bar for PDF/Image */}
        {(isPDF || isImage) && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] font-mono text-neutral-500 bg-neutral-950/60 border border-neutral-900 rounded-sm px-4 py-2.5">
            <span className="font-semibold text-neutral-400 uppercase">{activeFile.name}</span>
            <span className="text-neutral-800">|</span>
            <span>{(activeFile.file_type || 'bin').toUpperCase()}</span>
            <span className="text-neutral-800">|</span>
            <span>{formatBytes(activeFile.size_bytes)}</span>
            <span className="text-neutral-800">|</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {activeFile.views ?? 0}
            </span>
            <span className="text-neutral-800">|</span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" /> {activeFile.downloads ?? 0}
            </span>
            <span className="text-neutral-800">|</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {displayDate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
