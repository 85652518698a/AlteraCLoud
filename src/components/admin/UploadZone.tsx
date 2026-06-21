import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore, authStore } from '../../store/authStore';
import { validateFile } from '../../lib/validateFile';
import { SECTIONS } from '../../constants/sections';
import { SectionId } from '../../types';
import { COURSES } from '../../constants/courses';
import { LottieUpload } from '../ui/LottieUpload';
import { Upload, FileCode, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadZoneProps {
  onUploadSuccess: () => void;
}

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess }) => {
  const user = useAuthStore(s => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [section, setSection] = useState<SectionId>('notes');
  const [course, setCourse] = useState('');
  const [isDeployed, setIsDeployed] = useState(false);
  const [customName, setCustomName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(-1);

  useEffect(() => {
    if (selectedFiles.length === 1) {
      const baseName = selectedFiles[0].name.slice(0, selectedFiles[0].name.lastIndexOf('.'));
      setCustomName(baseName);
    }
  }, [selectedFiles.length]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (incoming: File[]) => {
    const valid: File[] = [];
    for (const file of incoming) {
      const result = validateFile(file);
      if (!result.valid) {
        toast.error(`${file.name}: ${result.error || 'Invalid file'}`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;
    setSelectedFiles(prev => [...prev, ...valid]);
  };

  const triggerPicker = () => fileInputRef.current?.click();

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setCustomName('');
    setUploadProgress(0);
    setIsUploading(false);
    setCurrentFileIndex(-1);
  };

  const uploadSingleFile = (file: File): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await authStore.getFirebaseIdToken();
        if (!token) { reject(new Error('Not authenticated')); return; }

        const formData = new FormData();
        const ext = file.name.split('.').pop() || '';
        const baseName = selectedFiles.length === 1 && customName.trim()
          ? customName.trim()
          : file.name.slice(0, file.name.lastIndexOf('.'));
        const namedFile = new File([file], `${baseName}.${ext}`, { type: file.type });

        formData.append('file', namedFile);
        formData.append('section', section);
        formData.append('course', course);
        formData.append('isDeployed', String(isDeployed));

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 95));
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || 'Upload failed'));
            } catch { reject(new Error('Upload failed')); }
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));
        xhr.open('POST', `${FUNCTIONS_BASE}/upload-file`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) { toast.error('Select academic files to push.'); return; }
    if (!user) return;

    setIsUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      setCurrentFileIndex(i);
      setUploadProgress(0);

      try {
        await uploadSingleFile(selectedFiles[i]);
        setUploadProgress(100);
        successCount++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        errors.push(`${selectedFiles[i].name}: ${msg}`);
      }
    }

    setCurrentFileIndex(-1);

    if (successCount === selectedFiles.length) {
      toast.success(`All ${selectedFiles.length} file(s) deployed successfully`);
    } else if (successCount > 0) {
      toast.success(`${successCount}/${selectedFiles.length} file(s) deployed`);
      errors.forEach(e => toast.error(e));
    } else {
      toast.error('All uploads failed.');
      errors.forEach(e => toast.error(e));
      setIsUploading(false);
      setUploadProgress(0);
      return;
    }

    setTimeout(() => { clearSelection(); onUploadSuccess(); }, 1500);
  };

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

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
            className={`relative border border-dashed rounded flex flex-col items-center justify-center text-center p-6 cursor-pointer select-none transition-all duration-200 min-h-[200px] ${
              dragActive
                ? 'border-white bg-white/5 shadow-[rgba(255,255,255,0.08)_0_0_24px]'
                : selectedFiles.length > 0
                  ? 'border-neutral-700 bg-neutral-900/30'
                  : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/10'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} multiple />
            {selectedFiles.length > 0 ? (
              <div className="w-full space-y-3 pointer-events-none">
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <FileCode className="w-5 h-5 stroke-[1.5]" />
                  <span className="text-xs font-mono font-bold">{selectedFiles.length} FILE(S) SELECTED</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 px-2">
                  {selectedFiles.map((f, i) => (
                    <div key={`${f.name}-${f.size}-${i}`} className="flex items-center justify-between gap-2 text-left pointer-events-auto">
                      <span className="text-[10px] font-mono text-neutral-300 truncate flex-1">{f.name}</span>
                      <span className="text-[9px] font-mono text-neutral-500 shrink-0">{(f.size / (1024 * 1024)).toFixed(1)}MB</span>
                      {!isUploading && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="text-neutral-600 hover:text-red-400 transition-colors p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[9px] font-mono text-neutral-600">
                  TOTAL: {(totalSize / (1024 * 1024)).toFixed(2)} MB • CLICK TO ADD MORE
                </p>
              </div>
            ) : (
              <div className="space-y-3 pointer-events-none">
                <div className="p-3 bg-neutral-950 text-neutral-500 border border-neutral-850 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-xs text-neutral-300 font-sans tracking-wide">Drag and drop files here, or <span className="text-white font-bold underline">browse local directory</span></p>
                  <p className="text-[9px] font-mono text-neutral-500 mt-2 uppercase tracking-widest">PDF, DOCUMENT, EXCEL, PRESENTATION, ZIP (MAX 50MB EACH)</p>
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
              <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5 tracking-wider">Course (Optional)</label>
              <select value={course} onChange={(e) => setCourse(e.target.value)} disabled={isUploading}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-900 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-mono">
                <option value="" className="bg-neutral-950 text-xs">GENERAL</option>
                {COURSES.map(c => <option key={c.id} value={c.id} className="bg-neutral-950 text-xs">{c.label.toUpperCase()}</option>)}
              </select>
            </div>
            {selectedFiles.length === 1 && (
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5 tracking-wider">Display Name inside Locker</label>
                <input type="text" disabled={isUploading}
                  placeholder="Name display inside system..." value={customName} onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-900 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-mono disabled:opacity-40" />
              </div>
            )}
            <div className="flex items-center justify-between p-3.5 bg-neutral-950 border border-neutral-900/40 rounded">
              <div>
                <div className="text-xs font-semibold text-zinc-300">DEPLOY DOCUMENTS NOW</div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-tight mt-0.5">Make instantly visible to CSMU Students</div>
              </div>
              <button type="button" role="switch" disabled={isUploading || selectedFiles.length === 0}
                onClick={() => setIsDeployed(!isDeployed)}
                className={`w-10 h-6 flex items-center rounded-full p-0.5 cursor-pointer select-none transition-colors duration-150 relative ${isDeployed ? 'bg-white' : 'bg-neutral-800'} ${selectedFiles.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}>
                <div className={`w-5 h-5 rounded-full bg-black shadow-[0_1px_3px_rgba(0,0,0,0.4)] transform duration-150 transition-transform ${isDeployed ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
          <div className="pt-6 border-t border-neutral-950 mt-4">
            {isUploading ? (
              <div className="space-y-2">
                {currentFileIndex >= 0 && (
                  <p className="text-[10px] font-mono text-neutral-400 text-center">
                    UPLOADING {currentFileIndex + 1} OF {selectedFiles.length}: {selectedFiles[currentFileIndex]?.name}
                  </p>
                )}
                <LottieUpload progress={uploadProgress} />
              </div>
            ) : (
              <button type="submit" disabled={selectedFiles.length === 0}
                className={`w-full py-3 text-xs font-semibold font-mono tracking-wider rounded uppercase text-center transition-all ${selectedFiles.length > 0 ? 'bg-white hover:bg-neutral-200 text-black shadow-[0_0_12px_rgba(255,255,255,0.1)] cursor-pointer' : 'bg-neutral-900 border border-neutral-900 text-neutral-600 cursor-not-allowed'}`}>
                DEPLOY {selectedFiles.length > 1 ? `ALL ${selectedFiles.length} FILES` : 'FILE'} TO CLOUD
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
