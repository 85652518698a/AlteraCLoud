import React, { useState, useEffect } from 'react';
import { callEdgeFunction } from '../lib/edgeFunction';
import { FileIcon } from '../components/ui/FileIcon';
import { formatBytes } from '../lib/formatBytes';
import { Download, ShieldAlert } from 'lucide-react';

interface SharedFile {
  id: string;
  name: string;
  section: string;
  file_type: string;
  size_bytes: number;
  course: string | null;
}

interface SharePageProps {
  token: string;
}

export const SharePage: React.FC<SharePageProps> = ({ token }) => {
  const [file, setFile] = useState<SharedFile | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    callEdgeFunction<{ file: SharedFile; url: string }>('resolve-share-token', { token }, false)
      .then((data) => {
        setFile(data.file);
        setUrl(data.url);
      })
      .catch((err) => setError(err.message || 'Invalid or expired share link'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = () => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file?.name || 'download');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-black border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-mono text-neutral-700 mt-4 font-bold uppercase tracking-wider">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000000]">
          <ShieldAlert className="w-10 h-10 mx-auto text-[#FF3B30] mb-4" />
          <h2 className="font-display font-black text-lg uppercase tracking-wider text-black mb-2">Share Link Invalid</h2>
          <p className="text-xs font-mono text-neutral-700 font-bold">
            This share link is invalid or has expired. Please ask the sender to generate a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 selection:bg-[#FF3B30] selection:text-white">
      <div className="max-w-md w-full border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-8">
        <div className="text-center mb-6">
          <div className="text-sm font-display font-black tracking-[0.08em] text-black">
            A<span className="text-[#FF3B30]">L</span>TERA <span className="font-light text-neutral-500">CLOUD</span>
          </div>
          <div className="text-2xs font-mono text-neutral-600 uppercase tracking-wider mt-1 font-bold">Shared File</div>
        </div>

        {file && (
          <div className="border-2 border-black p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white border-2 border-black">
                <FileIcon extension={file.file_type} className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-mono font-bold text-black truncate">{file.name}</h3>
                <p className="text-2xs font-mono text-neutral-600 mt-0.5 font-bold uppercase">{file.section} • {formatBytes(file.size_bytes)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-2xs font-mono text-neutral-700 font-bold">
              <span className="px-2 py-0.5 bg-blue-600 text-white border-2 border-blue-600 uppercase">{file.file_type || 'FILE'}</span>
              {file.course && (
                <span className="px-2 py-0.5 bg-amber-400 text-black border-2 border-amber-400 uppercase">{file.course}</span>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#FF3B30] border-2 border-[#FF3B30] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-blue-600 hover:border-blue-600 transition-all duration-150 cursor-pointer active:translate-y-0.5"
        >
          <Download className="w-4 h-4" />
          DOWNLOAD FILE
        </button>

        <p className="text-2xs font-mono text-neutral-500 text-center mt-4 font-bold uppercase tracking-wider">
          alteracloud.space
        </p>
      </div>
    </div>
  );
};
