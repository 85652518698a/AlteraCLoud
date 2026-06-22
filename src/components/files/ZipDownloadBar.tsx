import React, { useState } from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { FileRecord } from '../../types';
import { FileIcon } from '../ui/FileIcon';
import { Download, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ZipDownloadBarProps {
  files: FileRecord[];
}

export const ZipDownloadBar: React.FC<ZipDownloadBarProps> = ({ files }) => {
  const selectedIds = useUIStore(s => s.selectedFileIds);
  const [loading, setLoading] = useState(false);

  const selectedFiles = files.filter(f => selectedIds.has(f.id));
  const count = selectedFiles.length;

  if (count === 0) return null;

  const handleClearSelection = () => {
    uiStore.clearFileSelection();
  };

  const handleDownloadZip = async () => {
    setLoading(true);
    const toastId = toast.loading(`Preparing ${count} file(s) for ZIP download...`);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        toast.loading(`Fetching ${file.name} (${i + 1}/${count})...`, { id: toastId });
        try {
          const { url } = await callEdgeFunction<{ url: string }>('get-signed-url', { fileId: file.id }, false);
          const resp = await fetch(url);
          if (!resp.ok) throw new Error('Fetch failed');
          const blob = await resp.blob();
          zip.file(file.name, blob);
        } catch {
          toast.error(`Failed to add ${file.name}`, { id: toastId });
        }
      }

      toast.loading('Compressing archive...', { id: toastId });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `alteracloud-batch-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success(`Downloaded ${count} file(s) as ZIP`, { id: toastId });
      uiStore.clearFileSelection();
    } catch (err) {
      toast.error(`ZIP download failed: ${err instanceof Error ? err.message : 'Unknown'}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 mb-4 bg-neutral-900/80 border border-neutral-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-neutral-400"><polyline points="21 16 17 16 14 21 10 21 7 16 3 16"/><line x1="12" y1="2" x2="12" y2="10"/><polyline points="9 5 12 2 15 5"/></svg>
        <span className="font-bold">{count}</span>
        <span className="text-neutral-500">file{count !== 1 ? 's' : ''} selected</span>
      </div>

      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-none">
        {selectedFiles.slice(0, 5).map(f => (
          <div key={f.id} className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-950 border border-neutral-800 rounded text-[9px] font-mono text-neutral-400 shrink-0">
            <FileIcon extension={f.file_type} className="w-2.5 h-2.5" />
            <span className="max-w-[60px] truncate">{f.name}</span>
          </div>
        ))}
        {count > 5 && (
          <span className="text-[9px] font-mono text-neutral-600 shrink-0">+{count - 5} more</span>
        )}
      </div>

      <button
        onClick={handleDownloadZip}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer disabled:opacity-50 shrink-0"
      >
        <Download className="w-3 h-3" />
        <span>{loading ? 'ZIPPING...' : 'ZIP'}</span>
      </button>

      <button
        onClick={handleClearSelection}
        disabled={loading}
        className="flex items-center justify-center p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        title="Clear selection"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
