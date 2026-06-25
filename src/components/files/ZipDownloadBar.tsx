import React from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { supabase } from '../../config/supabase';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { Download } from 'lucide-react';
import JSZip from 'jszip';
import toast from 'react-hot-toast';

export const ZipDownloadBar: React.FC = () => {
  const selectedIds = useUIStore(s => s.selectedFileIds);
  const count = selectedIds.size;

  const handleZipDownload = async () => {
    if (count === 0) return;
    const toastId = toast.loading(`Preparing ${count} file${count !== 1 ? 's' : ''} for download...`);
    try {
      const ids = Array.from(selectedIds);
      const { data: dbFiles, error } = await supabase
        .from('files')
        .select('id, name')
        .in('id', ids);
      if (error || !dbFiles || dbFiles.length === 0) {
        toast.error('Could not find selected files in database', { id: toastId });
        return;
      }

      const zip = new JSZip();
      let successCount = 0;

      for (const dbFile of dbFiles) {
        try {
          const { url } = await callEdgeFunction<{ url: string }>('get-signed-url', { fileId: dbFile.id, recordView: false }, false);
          const res = await fetch(url);
          if (!res.ok) continue;
          const blob = await res.blob();
          zip.file(dbFile.name, blob);
          successCount++;
        } catch {
          // skip failed files
        }
      }

      if (successCount === 0) {
        toast.error('Could not fetch any of the selected files', { id: toastId });
        return;
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `altera-cloud-batch-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      uiStore.clearFileSelection();
      toast.success(`Downloaded ${successCount} file(s) as ZIP`, { id: toastId });
    } catch (err) {
      toast.error('ZIP download failed', { id: toastId });
    }
  };

  if (count === 0) return null;

  return (
    <div className="flex items-center gap-3 mb-4 p-3 bg-white border-2 border-black">
      <span className="text-[10px] font-mono text-black font-bold">
        {count} file{count !== 1 ? 's' : ''} selected
      </span>
      <button
        onClick={handleZipDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[10px] font-mono font-bold uppercase tracking-wider border-2 border-black hover:bg-blue-600 hover:border-blue-600 transition-all duration-150 cursor-pointer active:translate-y-0.5"
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21H8" />
          <path d="M12 17v4" />
        </svg>
        <span>DOWNLOAD AS ZIP</span>
      </button>
      <button
        onClick={() => uiStore.clearFileSelection()}
        className="text-[10px] font-mono text-neutral-700 hover:text-[#FF3B30] font-bold uppercase tracking-wider transition-colors duration-150 cursor-pointer ml-2"
      >
        CLEAR
      </button>
    </div>
  );
};
