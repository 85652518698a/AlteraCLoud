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
    <div className="bg-white border-3 border-black p-6 mb-8">
      <div className="section-heading">
        <span>DEPOT VAULT GATEWAY</span>
        <span className="text-neutral-600 font-mono text-[9px] font-normal ml-2">/ INGESTION POINT</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={!isUploading ? triggerPicker : undefined}
            className={`relative border-2 border-black flex flex-col items-center justify-center text-center p-6 cursor-pointer select-none transition-all duration-150 min-h-[200px] bg-white ${
              dragActive
                ? 'bg-[#FF3B30] text-white border-[#FF3B30]'
                : 'hover:bg-neutral-100'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} multiple />
            {selectedFiles.length > 0 ? (
              <div className="w-full space-y-3 pointer-events-none">
                <div className="flex items-center justify-center gap-2 text-black">
                  <FileCode className="w-5 h-5 stroke-[1.5]" />
                  <span className="text-xs font-mono font-bold">{selectedFiles.length} FILE(S) SELECTED</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 px-2">
                  {selectedFiles.map((f, i) => (
                    <div key={`${f.name}-${f.size}-${i}`} className="flex items-center justify-between gap-2 text-left pointer-events-auto">
                      <span className="text-[10px] font-mono text-black truncate flex-1 font-bold">{f.name}</span>
                      <span className="text-[9px] font-mono text-neutral-700 shrink-0 font-bold">{(f.size / (1024 * 1024)).toFixed(1)}MB</span>
                      {!isUploading && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="text-neutral-700 hover:text-[#FF3B30] transition-colors p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[9px] font-mono text-neutral-700 font-bold">
                  TOTAL: {(totalSize / (1024 * 1024)).toFixed(2)} MB • CLICK TO ADD MORE
                </p>
              </div>
            ) : (
              <div className="space-y-3 pointer-events-none">
                <div className="p-3 bg-white text-black border-2 border-black w-12 h-12 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-xs text-black font-sans tracking-wide font-bold">Drag and drop files here, or <span className="underline">browse local directory</span></p>
                  <p className="text-[9px] font-mono text-neutral-700 mt-2 uppercase tracking-widest font-bold">PDF, DOCUMENT, EXCEL, PRESENTATION, ZIP (MAX 50MB EACH)</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleUploadSubmit} className="md:col-span-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-neutral-700 uppercase mb-1.5 tracking-wider font-bold">Section Folder</label>
              <select value={section} onChange={(e) => setSection(e.target.value as SectionId)} disabled={isUploading}
                className="w-full px-3 py-2 bg-white border-2 border-black text-xs text-black font-mono font-bold">
                {SECTIONS.map(s => <option key={s.id} value={s.id} className="bg-white text-xs font-bold">{s.label.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-neutral-700 uppercase mb-1.5 tracking-wider font-bold">Course (Optional)</label>
              <select value={course} onChange={(e) => setCourse(e.target.value)} disabled={isUploading}
                className="w-full px-3 py-2 bg-white border-2 border-black text-xs text-black font-mono font-bold">
                <option value="" className="bg-white text-xs font-bold">GENERAL</option>
                {COURSES.map(c => <option key={c.id} value={c.id} className="bg-white text-xs font-bold">{c.label.toUpperCase()}</option>)}
              </select>
            </div>
            {selectedFiles.length === 1 && (
              <div>
                <label className="block text-[10px] font-mono text-neutral-700 uppercase mb-1.5 tracking-wider font-bold">Display Name inside Locker</label>
                <input type="text" disabled={isUploading}
                  placeholder="Name display inside system..." value={customName} onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-black text-xs text-black font-mono font-bold disabled:opacity-40" />
              </div>
            )}
            <div className="flex items-center justify-between p-3.5 bg-white border-2 border-black">
              <div>
                <div className="text-xs font-bold text-black">DEPLOY DOCUMENTS NOW</div>
                <div className="text-[10px] font-mono text-neutral-700 uppercase tracking-tight mt-0.5 font-bold">Make instantly visible to CSMU Students</div>
              </div>
              <button type="button" role="switch" disabled={isUploading || selectedFiles.length === 0}
                onClick={() => setIsDeployed(!isDeployed)}
                className={`w-10 h-6 flex items-center p-0.5 cursor-pointer select-none transition-colors duration-150 border-2 border-black ${isDeployed ? 'bg-black' : 'bg-white'} ${selectedFiles.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}>
                <div className={`w-5 h-5 bg-white border-2 border-black transition-transform duration-150 ${isDeployed ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
          <div className="pt-6 border-t-2 border-black mt-4">
            {isUploading ? (
              <div className="space-y-2">
                {currentFileIndex >= 0 && (
                  <p className="text-[10px] font-mono text-neutral-700 text-center font-bold">
                    UPLOADING {currentFileIndex + 1} OF {selectedFiles.length}: {selectedFiles[currentFileIndex]?.name}
                  </p>
                )}
                <LottieUpload progress={uploadProgress} />
              </div>
            ) : (
              <button type="submit" disabled={selectedFiles.length === 0}
                className={`w-full py-3 text-xs font-bold font-mono tracking-wider uppercase text-center border-2 transition-all duration-150 ${
                  selectedFiles.length > 0
                    ? 'bg-black text-white border-black hover:bg-[#FF3B30] hover:border-[#FF3B30] cursor-pointer active:translate-y-0.5'
                    : 'bg-white text-neutral-600 border-black cursor-not-allowed'
                }`}>
                DEPLOY {selectedFiles.length > 1 ? `ALL ${selectedFiles.length} FILES` : 'FILE'} TO CLOUD
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
