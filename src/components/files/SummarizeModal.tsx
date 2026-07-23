import React, { useState } from 'react';
import { FileRecord } from '../../types';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { FileIcon } from '../ui/FileIcon';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface SummarizeModalProps {
  file: FileRecord;
  onClose: () => void;
}

export const SummarizeModal: React.FC<SummarizeModalProps> = ({ file, onClose }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await callEdgeFunction<{ summary: string }>('ai-summarize', { fileId: file.id });
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to summarize');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95">
      <div className="w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000]">
        <div className="flex items-center justify-between border-b-4 border-black px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider">AI Summary</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-blue-600 hover:text-white border-2 border-black transition-colors cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-black">
            <div className="p-1.5 bg-white border-2 border-black">
              <FileIcon extension={file.file_type} className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-black truncate">{file.name}</span>
          </div>

          {!summary && !loading && !error && (
            <button onClick={handleSummarize}
              className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white text-xs font-mono font-bold uppercase tracking-wider border-2 border-black hover:bg-blue-600 hover:border-blue-600 transition-all cursor-pointer">
              <Sparkles className="w-3.5 h-3.5" />
              GENERATE SUMMARY
            </button>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-6 h-6 animate-spin text-black" />
              <span className="text-xs font-mono text-neutral-700 font-bold">Analyzing document...</span>
            </div>
          )}

          {error && (
            <div className="p-4 border-2 border-[#FF3B30] text-xs font-mono text-[#FF3B30] font-bold">
              {error}
            </div>
          )}

          {summary && (
            <div className="border-2 border-black p-4">
              <div className="text-2xs font-mono text-neutral-600 uppercase tracking-wider font-bold mb-2">SUMMARY</div>
              <p className="text-xs font-sans text-black leading-relaxed whitespace-pre-line">{summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
