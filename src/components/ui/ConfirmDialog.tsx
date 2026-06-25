import React, { useState, useEffect } from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog: React.FC = () => {
  const data = useUIStore(s => s.confirmDialogData);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (data?.isOpen) {
      setInputValue('');
    }
  }, [data?.isOpen]);

  if (!data?.isOpen) return null;

  const isMatched = inputValue.trim() === data.targetName.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatched) {
      await data.onConfirm();
      uiStore.closeConfirmDialog();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={uiStore.closeConfirmDialog} />
      <div className="relative w-full max-w-md bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000000]">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2.5 bg-white border-2 border-[#FF3B30] text-[#FF3B30] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider font-display text-black">{data.title}</h3>
            <p className="text-xs text-neutral-700 mt-1 leading-relaxed font-medium">{data.description}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white border-2 border-black p-3 text-center select-none font-mono text-xs text-black font-bold">
            {data.targetName}
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-widest text-neutral-700 font-mono font-bold">
              Type the file name below to authorize:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Confirm item signature..."
              className="w-full bg-white border-2 border-black px-3 py-2 text-xs font-mono text-black focus:border-[#FF3B30] placeholder-neutral-500 transition-colors font-bold"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={uiStore.closeConfirmDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={!isMatched}
            >
              EXECUTE DESTRUCTION
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
