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
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={uiStore.closeConfirmDialog} />
      <div className="relative w-full max-w-md bg-[#111111] border border-red-950/40 rounded-lg shadow-2xl p-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-600 animate-pulse" />
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2.5 bg-red-950/40 border border-red-500/20 rounded-lg text-red-500 shrink-0">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider font-display text-white">{data.title}</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{data.description}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg text-center select-none font-mono text-xs my-2 text-neutral-300">
            {data.targetName}
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
              Type the file name below to authorize:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Confirm item signature..."
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none placeholder-neutral-700 transition-colors"
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
              className={`font-mono text-xs shadow-none border-red-500 ${isMatched ? 'hover:bg-red-500 hover:text-white' : ''}`}
            >
              EXECUTE DESTRUCTION
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
