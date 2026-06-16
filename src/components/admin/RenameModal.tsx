import React, { useState, useEffect } from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { Button } from '../ui/Button';
import { Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface RenameModalProps {
  onSuccess: () => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({ onSuccess }) => {
  const file = useUIStore(s => s.renameModalFile);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file) {
      const dotIndex = file.name.lastIndexOf('.');
      const nameWithoutExt = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
      setNewName(nameWithoutExt);
    }
  }, [file]);

  if (!file) return null;

  const handleClose = () => uiStore.setRenameModalFile(null);

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) { toast.error('File name cannot be empty.'); return; }
    setLoading(true);
    const toastId = toast.loading('Syncing changes on cloud...');
    try {
      const ext = file.name.split('.').pop() || '';
      const fullNewName = `${newName.trim()}.${ext}`;
      await callEdgeFunction('rename-file', { fileId: file.id, newName: fullNewName });
      toast.success('Resource renamed successfully', { id: toastId });
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error('Could not rename resource file', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-[fadeIn_0.12s_ease-out]">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 rounded p-6 shadow-[0_24px_50px_rgba(0,0,0,0.85)] relative text-left">
        <button onClick={handleClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white rounded-full p-1 hover:bg-neutral-900 transition-colors"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-neutral-900 text-neutral-300 border border-neutral-850 rounded"><Edit2 className="w-4 h-4" /></div>
          <div><h3 className="text-zinc-100 font-display font-semibold tracking-wider text-sm uppercase">RENAME ARCHIVE ENTRY</h3><p className="text-[10px] font-mono text-neutral-500">CORRECT LOG ENTRY METADATA</p></div>
        </div>
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5 tracking-wider">Asset Display Title</label>
            <div className="relative">
              <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Type new name..."
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-900 text-xs text-white rounded focus:border-zinc-500 focus:outline-none transition-colors font-mono" />
              <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-mono select-none">.{file.name.split('.').pop() || 'raw'}</span>
            </div>
          </div>
          <div className="pt-3 border-t border-neutral-950 flex justify-end gap-3 select-none">
            <Button variant="outline" size="sm" type="button" onClick={handleClose}>Dismiss</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={loading}>Save Rename</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
