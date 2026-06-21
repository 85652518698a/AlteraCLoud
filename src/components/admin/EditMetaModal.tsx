import React, { useState, useEffect } from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { SECTIONS } from '../../constants/sections';
import { COURSES } from '../../constants/courses';
import { SectionId } from '../../types';
import { Button } from '../ui/Button';
import { Settings, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditMetaModalProps {
  onSuccess: () => void;
}

export const EditMetaModal: React.FC<EditMetaModalProps> = ({ onSuccess }) => {
  const file = useUIStore(s => s.editMetaModalFile);
  const [section, setSection] = useState<SectionId>('notes');
  const [course, setCourse] = useState('');
  const [isDeployed, setIsDeployed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file) { setSection(file.section); setCourse(file.course || ''); setIsDeployed(file.is_deployed); }
  }, [file]);

  if (!file) return null;

  const handleClose = () => uiStore.setEditMetaModalFile(null);

  const handleMetaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Updating cloud parameters...');
    try {
      await callEdgeFunction('update-file', {
        fileId: file.id,
        section,
        course,
        is_deployed: isDeployed,
      });
      toast.success('Asset flags revised successfully', { id: toastId });
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error('Unable to synchronize metadata parameters', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-[fadeIn_0.12s_ease-out]">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 rounded p-6 shadow-[0_24px_50px_rgba(0,0,0,0.85)] relative text-left">
        <button onClick={handleClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white rounded-full p-1 hover:bg-neutral-900 transition-colors"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-neutral-900 text-neutral-300 border border-neutral-850 rounded"><Settings className="w-4 h-4" /></div>
          <div><h3 className="text-zinc-100 font-display font-semibold tracking-wider text-sm uppercase">REDEFINE ASSET PREFERENCES</h3><p className="text-[10px] font-mono text-neutral-500">MANAGE SECTION OR DEPLOY FLAG</p></div>
        </div>
        <form onSubmit={handleMetaSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5 tracking-wider">Asset Location Section</label>
              <select value={section} onChange={(e) => setSection(e.target.value as SectionId)}
                className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-900 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-mono">
                {SECTIONS.map(sec => <option key={sec.id} value={sec.id} className="bg-neutral-950 text-xs">{sec.label.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5 tracking-wider">Course</label>
              <select value={course} onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-900 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-mono">
                <option value="" className="bg-neutral-950 text-xs">GENERAL</option>
                {COURSES.map(c => <option key={c.id} value={c.id} className="bg-neutral-950 text-xs">{c.label.toUpperCase()}</option>)}
              </select>
            </div>
          <div className="flex items-center justify-between p-3.5 bg-neutral-900/30 border border-neutral-900 rounded select-none">
            <div><div className="text-xs font-semibold text-zinc-300">PUBLISH TO SYSTEM</div><div className="text-[10px] font-mono text-zinc-500 uppercase tracking-tight mt-0.5">Students can preview or download</div></div>
            <button type="button" role="switch" onClick={() => setIsDeployed(!isDeployed)}
              className={`w-10 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-150 relative ${isDeployed ? 'bg-white' : 'bg-neutral-800'}`}>
              <div className={`w-5 h-5 rounded-full bg-black shadow-[0_1px_3px_rgba(0,0,0,0.4)] transform duration-150 transition-transform ${isDeployed ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="pt-3 border-t border-neutral-950 flex justify-end gap-3 select-none">
            <Button variant="outline" size="sm" type="button" onClick={handleClose}>Dismiss</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={loading}>Apply Specifications</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
