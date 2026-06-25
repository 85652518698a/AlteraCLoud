import toast from 'react-hot-toast';
import { callEdgeFunction } from './edgeFunction';

const UNDO_TIMEOUT = 15000;
const pendingDeletes = new Map<string, ReturnType<typeof setTimeout>>();

export function deleteWithUndo(
  fileId: string,
  fileName: string,
  onComplete?: () => void,
) {
  const toastId = toast(
    (t) => {
      const handleUndo = () => {
        const timeout = pendingDeletes.get(fileId);
        if (timeout) {
          clearTimeout(timeout);
          pendingDeletes.delete(fileId);
        }
        toast.dismiss(t.id);
        toast.success(`"${fileName}" deletion cancelled`, {
          style: { border: '2px solid #000000', borderRadius: 0, background: '#FFFFFF', color: '#000000', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 },
        });
      };
      return (
        <div className="flex items-center gap-3 text-xs font-mono font-bold text-black select-none">
          <span>"<span className="truncate max-w-[150px] inline-block">{fileName}</span>" <span className="text-red-600">scheduled for deletion</span></span>
          <button
            onClick={handleUndo}
            className="px-2.5 py-1 bg-black text-white border-2 border-black hover:bg-[#FF3B30] hover:border-[#FF3B30] transition-colors duration-150 cursor-pointer text-[10px] font-mono font-bold uppercase tracking-wider"
          >
            UNDO
          </button>
        </div>
      );
    },
    {
      duration: UNDO_TIMEOUT,
      style: { border: '2px solid #000000', borderRadius: 0, background: '#FFFFFF', color: '#000000', padding: '8px 12px', boxShadow: '4px 4px 0px 0px #000000' },
    },
  );

  const timeout = setTimeout(async () => {
    pendingDeletes.delete(fileId);
    const loadToast = toast.loading(`Purging ${fileName}...`, {
      style: { border: '2px solid #000000', borderRadius: 0, background: '#FFFFFF', color: '#000000', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 },
    });
    try {
      await callEdgeFunction('delete-file', { fileId });
      toast.success(`"${fileName}" permanently deleted`, {
        id: loadToast,
        style: { border: '2px solid #000000', borderRadius: 0, background: '#FFFFFF', color: '#000000', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 },
      });
      onComplete?.();
    } catch {
      toast.error(`Failed to delete "${fileName}"`, {
        id: loadToast,
        style: { border: '2px solid #000000', borderRadius: 0, background: '#FFFFFF', color: '#000000', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 },
      });
    }
  }, UNDO_TIMEOUT);

  pendingDeletes.set(fileId, timeout);
}
