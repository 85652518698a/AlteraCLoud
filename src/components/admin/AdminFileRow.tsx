import React, { useState } from 'react';
import { FileRecord } from '../../types';
import { formatBytes } from '../../lib/formatBytes';
import { FileIcon } from '../ui/FileIcon';
import { Badge } from '../ui/Badge';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { uiStore } from '../../store/uiStore';
import { Edit2, Settings, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminFileRowProps {
  file: FileRecord;
  onActionComplete: () => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}

export const AdminFileRow: React.FC<AdminFileRowProps> = ({ file, onActionComplete, selected, onToggleSelect }) => {
  const [updating, setUpdating] = useState(false);

  const handleToggleDeploy = async () => {
    setUpdating(true);
    const originalState = file.is_deployed;
    const toastId = toast.loading(`${originalState ? 'Drafting' : 'Deploying'} ${file.name}...`);
    try {
      await callEdgeFunction('update-file', {
        fileId: file.id,
        is_deployed: !originalState,
      });
      toast.success(originalState ? `Archived: "${file.name}" is now stored as draft` : `Deployed: "${file.name}" is now visible to students`, { id: toastId });
      onActionComplete();
    } catch (err) {
      toast.error('Could not modify deployment status', { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  const handleTriggerRename = () => uiStore.setRenameModalFile(file);
  const handleTriggerMeta = () => uiStore.setEditMetaModalFile(file);

  const handleDeleteTrigger = () => {
    uiStore.showConfirmDialog({
      title: "Purge Locker Resource",
      description: `You are requesting to permanently delete "${file.name}" from CSF locker storage. Active links will break and students will lose access immediately.`,
      confirmText: "Type file title below...",
      targetName: file.name,
      onConfirm: async () => {
        const toastId = toast.loading(`Purging ${file.name} from server...`);
        try {
          await callEdgeFunction('delete-file', { fileId: file.id });
          toast.success(`ERASED: "${file.name}" has been wiped clean.`, { id: toastId });
          onActionComplete();
        } catch (err) {
          toast.error('Purge transaction failed', { id: toastId });
        }
      }
    });
  };

  const displayDate = new Date(file.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <>
      {/* Desktop table row */}
      <tr className="border-b-2 border-black hover:bg-neutral-100 transition-colors duration-100 font-mono text-xs text-black max-sm:hidden">
        <td className="py-4 px-3 w-10 text-center">
          <input type="checkbox" checked={selected} onChange={() => onToggleSelect(file.id)} className="accent-black w-4 h-4 cursor-pointer" />
        </td>
        <td className="py-4 px-3 font-sans font-bold text-sm max-w-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border-2 border-black shrink-0">
              <FileIcon extension={file.file_type} className="w-4 h-4" />
            </div>
            <div className="truncate flex flex-col justify-center min-w-0">
              <span className="text-black font-mono text-xs font-bold truncate select-all hover:text-[#FF3B30]" title={file.name}>{file.name}</span>
              <span className="text-[10px] font-mono text-neutral-700 font-bold uppercase flex items-center gap-1 mt-0.5 flex-wrap">
                <span>{(file.file_type || 'bin').toUpperCase()}</span>
                <span>•</span>
                <span>By {file.uploaded_by.split('@')[0]}</span>
              </span>
            </div>
          </div>
        </td>
        <td className="py-4 px-3 uppercase text-neutral-700 font-bold tracking-wide whitespace-nowrap">
          <div>{file.section}</div>
          {file.course && <div className="text-[9px] text-neutral-500 font-bold">{file.course.toUpperCase()}</div>}
        </td>
        <td className="py-4 px-3 text-neutral-700 font-bold whitespace-nowrap">{formatBytes(file.size_bytes)}</td>
        <td className="py-4 px-3 text-neutral-700 font-bold whitespace-nowrap">{displayDate}</td>
        <td className="py-4 px-3 text-center select-none whitespace-nowrap">
          <div className="flex items-center justify-center gap-3">
            <Badge status={file.is_deployed ? 'deployed' : 'draft'}>{file.is_deployed ? 'Deployed' : 'Draft'}</Badge>
            <button onClick={handleToggleDeploy} disabled={updating}
              title={file.is_deployed ? "Draft this file" : "Deploy this file"}
              className={`w-8 h-4.5 flex items-center p-0.5 cursor-pointer relative transition-colors duration-150 shrink-0 ${file.is_deployed ? 'bg-black' : 'bg-neutral-300'}`}>
              <div className={`w-3.5 h-3.5 bg-white shadow transform transition-transform duration-150 ${file.is_deployed ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </button>
          </div>
        </td>
        <td className="py-4 px-3 text-right select-none">
          <div className="flex items-center justify-end gap-1 text-black">
            <button onClick={handleTriggerRename} title="Rename file"
              className="p-1.5 hover:text-[#FF3B30] hover:bg-neutral-100 border-2 border-black transition-colors cursor-pointer">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleTriggerMeta} title="Edit metadata"
              className="p-1.5 hover:text-[#FF3B30] hover:bg-neutral-100 border-2 border-black transition-colors cursor-pointer">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleDeleteTrigger} title="Purge file"
              className="p-1.5 hover:text-white hover:bg-[#FF3B30] border-2 border-black transition-colors cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Mobile card row */}
      <div className="sm:hidden bg-white border-3 border-black p-4 mb-3 shadow-[4px_4px_0px_0px_#000000]">
        <div className="flex items-start gap-3">
          <input type="checkbox" checked={selected} onChange={() => onToggleSelect(file.id)} className="accent-black w-4 h-4 cursor-pointer mt-1 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-white border-2 border-black shrink-0">
                <FileIcon extension={file.file_type} className="w-3.5 h-3.5" />
              </div>
              <span className="text-black font-mono text-xs font-bold truncate select-all">{file.name}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-700 font-bold flex-wrap">
              <span className="uppercase">{(file.file_type || 'bin').toUpperCase()}</span>
              <span>•</span>
              <span>{file.section}</span>
              {file.course && <><span>•</span><span className="text-black">{file.course.toUpperCase()}</span></>}
              <span>•</span>
              <span>{formatBytes(file.size_bytes)}</span>
              <span>•</span>
              <span>{displayDate}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Badge status={file.is_deployed ? 'deployed' : 'draft'}>{file.is_deployed ? 'Deployed' : 'Draft'}</Badge>
              <button onClick={handleToggleDeploy} disabled={updating}
                className={`w-7 h-4 flex items-center p-0.5 cursor-pointer relative transition-colors duration-150 ${file.is_deployed ? 'bg-black' : 'bg-neutral-300'}`}>
                <div className={`w-3 h-3 bg-white shadow transform transition-transform duration-150 ${file.is_deployed ? 'translate-x-3' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-black text-black">
              <button onClick={handleTriggerRename} title="Rename"
                className="flex items-center gap-1 text-[10px] font-mono hover:text-[#FF3B30] font-bold transition-colors cursor-pointer px-2 py-1">
                <Edit2 className="w-3 h-3" /> RENAME
              </button>
              <button onClick={handleTriggerMeta} title="Edit metadata"
                className="flex items-center gap-1 text-[10px] font-mono hover:text-[#FF3B30] font-bold transition-colors cursor-pointer px-2 py-1">
                <Settings className="w-3 h-3" /> META
              </button>
              <button onClick={handleDeleteTrigger} title="Purge"
                className="flex items-center gap-1 text-[10px] font-mono hover:text-white hover:bg-[#FF3B30] font-bold transition-colors cursor-pointer px-2 py-1 ml-auto border-2 border-black">
                <Trash2 className="w-3 h-3" /> PURGE
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
