import React, { useState, useEffect } from 'react';
import { useUIStore, uiStore } from '../store/uiStore';
import { supabase } from '../config/supabase';
import { callEdgeFunction } from '../lib/edgeFunction';
import { FileRecord } from '../types';
import { Spinner } from '../components/ui/Spinner';


export const PrintPage: React.FC = () => {
  const [file, setFile] = useState<FileRecord | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const match = window.location.pathname.match(/^\/print\/([^/]+)/);
    const fileId = match?.[1];
    if (!fileId) { setLoading(false); return; }

    supabase.from('files').select('*').eq('id', fileId).eq('is_deployed', true).maybeSingle()
      .then(async ({ data, error }) => {
        if (error || !data) { setLoading(false); return; }
        setFile(data);
        try {
          const { url } = await callEdgeFunction<{ url: string }>('get-signed-url', { fileId: data.id, recordView: false }, false);
          setSignedUrl(url);
        } catch {}
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (file) setTimeout(() => window.print(), 500);
  }, [file]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <span className="text-xs font-mono text-neutral-400 mt-4">Preparing print view...</span>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <p className="text-sm font-mono text-neutral-400">File not found</p>
        <button onClick={() => { uiStore.setCurrentPage('dashboard'); window.history.replaceState(null, '', '/'); }}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-mono font-bold uppercase rounded-sm hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(file.file_type?.toLowerCase() || '');
  const isPDF = file.file_type?.toLowerCase() === 'pdf';

  return (
    <div className="min-h-screen bg-white text-black print:p-0">
      <style>{`
        @media print {
          @page { margin: 2cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between z-50">
        <button onClick={() => { uiStore.setCurrentPage('dashboard'); window.history.replaceState(null, '', '/'); }}
          className="flex items-center gap-1.5 text-neutral-500 hover:text-black transition-colors text-xs font-mono uppercase tracking-wider cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </button>
        <h1 className="text-xs font-mono text-neutral-700 truncate max-w-md">{file.name}</h1>
        <button onClick={() => window.print()}
          className="px-4 py-2 bg-black text-white text-xs font-mono font-bold uppercase rounded-sm hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Print
        </button>
      </div>

      <div className="max-w-[210mm] mx-auto pt-20 pb-10 px-8 print:pt-0 print:px-0">
        {isPDF && signedUrl && (
          <iframe src={`${signedUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
            className="w-full h-[297mm] border border-neutral-200 rounded print:border-0" title={file.name} />
        )}
        {isImage && signedUrl && (
          <div className="flex justify-center">
            <img src={signedUrl} alt={file.name}
              className="max-w-full max-h-[297mm] object-contain" />
          </div>
        )}
        {!isPDF && !isImage && (
          <div className="text-center py-20">
            <p className="text-lg font-mono font-bold mb-2">{file.name}</p>
            <p className="text-sm font-mono text-neutral-500 mb-6">
              {(file.file_type || 'bin').toUpperCase()} — {file.section?.replace('_', ' ')}
            </p>
            <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto leading-relaxed">
              This file type cannot be previewed in the browser. Please download the file to view its contents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
