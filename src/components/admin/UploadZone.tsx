import React, { useState, useRef } from 'react';
import { useAuthStore, authStore } from '../../store/authStore';
import { validateFile } from '../../lib/validateFile';
import { SECTIONS } from '../../constants/sections';
import { SectionId } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { Upload, FileCode } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadZoneProps {
  onUploadSuccess: () => void;
}

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess }) => {
  const user = useAuthStore(s => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [section, setSection] = useState<SectionId>('notes');
  const [isDeployed, setIsDeployed] = useState(false);
  const [customName, setCustomName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processSelectedFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processSelectedFile(e.target.files[0]);
  };

  const processSelectedFile = (file: File) => {
    const result = validateFile(file);
    if (!result.valid) { toast.error(result.error || 'Invalid file detected.'); return; }
    setSelectedFile(file);
    const baseName = file.name.slice(0, file.name.lastIndexOf('.'));
    setCustomName(baseName);
  };

  const triggerPicker = () => fileInputRef.current?.click();

  const clearSelection = () => {
    setSelectedFile(null); setCustomName(''); setUploadProgress(0); setIsUploading(false);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { toast.error('Select an academic file to push.'); return; }
    if (!user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = await authStore.getFirebaseIdToken();
      if (!token) throw new Error('Not authenticated');

      const formData = new FormData();
      const finalName = customName.trim() || selectedFile.name;
      const ext = selectedFile.name.split('.').pop() || '';
      const namedFile = new File([selectedFile], `${finalName}.${ext}`, { type: selectedFile.type });

      formData.append('file', namedFile);
      formData.append('section', section);
      formData.append('isDeployed', String(isDeployed));

      const xhr = new XMLHttpRequest();

      const response = await new Promise<any>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 95));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); }
            catch { resolve(null); }
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        xhr.open('POST', `${FUNCTIONS_BASE}/upload-file`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      setUploadProgress(100);
      toast.success(`${selectedFile.name} successfully deployed to standard vault`);
      setTimeout(() => { clearSelection(); onUploadSuccess(); }, 600);
    } catch (err) {
      console.error(err);
      toast.error(`Upload error: ${err instanceof Error ? err.message : 'Storage Full'}`);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-neutral-950/40 border border-neutral-900 rounded-lg p-6 mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <h3 className="text-zinc-200 font-display font-semibold tracking-wider text-xs uppercase mb-4 flex items-center gap-2">
        <span>DEPOT VAULT GATEWAY</span>
        <span className="text-neutral-600 font-mono text-[9px] font-normal">/ INGESTION POINT</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={!isUploading ? triggerPicker : undefined}
            className={`h-56 relative border border-dashed rounded flex flex-col items-center justify-center text-center p-6 cursor-pointer select-none transition-all duration-200 ${
              dragActive ? 'border-white bg-white/5 shadow-[rgba(255,255,255,0.08)_0_0_24px]'
                : selectedFile ? 'border-neutral-700 bg-neutral-900/30'
                : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/10'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
            {selectedFile ? (
              <div className="space-y-3 pointer-events-none">
                <div className="p-3 bg-neutral-950 rounded-full w-12 h-12 flex items-center justify-center border border-neutral-800 mx-auto text-emerald-400">
                  <FileCode className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-neutral-200 truncate max-w-sm px-4">{selectedFile.name}</h4>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • READY FOR INGEST</p>
                </div>
                {!isUploading && (
                  <span className="text-[9px] font-mono text-neutral-600 uppercase underline hover:text-white pointer-events-auto" onClick={(e) => { e.stopPropagation(); clearSelection(); }}>
                    [REMOVE FILE]
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-3 pointer-events-none">
                <div className="p-3 bg-neutral-950 text-neutral-500 border border-neutral-850 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-xs text-neutral-300 font-sans tracking-wide">Drag and drop file here, or <span className="text-white font-bold underline">browse local directory</span></p>
                  <p className="text-[9px] font-mono text-neutral-500 mt-2 uppercase tracking-widest">PDF, DOCUMENT, EXCEL, PRESENTATION, ZIP (MAX 50MB)</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleUploadSubmit} className="md:col-span-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5 tracking-wider">Section Folder</label>
              <select value={section} onChange={(e) => setSection(e.target.value as SectionId)} disabled={isUploading}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-900 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-mono">
                {SECTIONS.map(s => <option key={s.id} value={s.id} className="bg-neutral-950 text-xs">{s.label.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5 tracking-wider">Display Name inside Locker</label>
              <input type="text" disabled={isUploading || !selectedFile} required={!!selectedFile}
                placeholder="Name display inside system..." value={customName} onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-900 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-mono disabled:opacity-40" />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-neutral-950 border border-neutral-900/40 rounded">
              <div>
                <div className="text-xs font-semibold text-zinc-300">DEPLOY DOCUMENT NOW</div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-tight mt-0.5">Make instantly visible to CSMU Students</div>
              </div>
              <button type="button" role="switch" disabled={isUploading || !selectedFile}
                onClick={() => setIsDeployed(!isDeployed)}
                className={`w-10 h-6 flex items-center rounded-full p-0.5 cursor-pointer select-none transition-colors duration-150 relative ${isDeployed ? 'bg-white' : 'bg-neutral-800'} ${!selectedFile ? 'opacity-30 cursor-not-allowed' : ''}`}>
                <div className={`w-5 h-5 rounded-full bg-black shadow-[0_1px_3px_rgba(0,0,0,0.4)] transform duration-150 transition-transform ${isDeployed ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
          <div className="pt-6 border-t border-neutral-950 mt-4">
            {isUploading ? <ProgressBar progress={uploadProgress} className="mb-2" /> : (
              <button type="submit" disabled={!selectedFile}
                className={`w-full py-3 text-xs font-semibold font-mono tracking-wider rounded uppercase text-center transition-all ${selectedFile ? 'bg-white hover:bg-neutral-200 text-black shadow-[0_0_12px_rgba(255,255,255,0.1)] cursor-pointer' : 'bg-neutral-900 border border-neutral-900 text-neutral-600 cursor-not-allowed'}`}>
                DEPLOY FILE TO CLOUD
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
