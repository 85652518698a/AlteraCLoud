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
      const dotIndex = file.name.lastIndexOf('.');
      const ext = dotIndex !== -1 ? file.name.substring(dotIndex + 1) : '';
      const fullNewName = ext ? `${newName.trim()}.${ext}` : newName.trim();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="w-full max-w-md bg-white border-3 border-black p-6 shadow-[8px_8px_0px_0px_#000000] relative text-left">
        <button onClick={handleClose} className="absolute top-4 right-4 text-black hover:text-[#FF3B30] p-1 transition-colors"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-white text-black border-2 border-black"><Edit2 className="w-4 h-4" /></div>
          <div><h3 className="text-black font-display font-bold tracking-wider text-sm uppercase">RENAME ARCHIVE ENTRY</h3><p className="text-xs font-mono text-neutral-700 font-bold">CORRECT LOG ENTRY METADATA</p></div>
        </div>
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-black font-bold uppercase mb-1.5 tracking-wider">Asset Display Title</label>
            <div className="relative">
              <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Type new name..."
                className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-xs text-black placeholder-neutral-500 font-mono" />
              {(() => { const di = file.name.lastIndexOf('.'); const ext = di !== -1 ? file.name.substring(di + 1) : ''; return ext ? <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-mono select-none">.{ext}</span> : null; })()}
            </div>
          </div>
          <div className="pt-3 border-t-2 border-black flex justify-end gap-3 select-none">
            <Button variant="outline" size="sm" type="button" onClick={handleClose}>Dismiss</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={loading}>Save Rename</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
