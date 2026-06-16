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
}

export const AdminFileRow: React.FC<AdminFileRowProps> = ({ file, onActionComplete }) => {
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
    <tr className="border-b border-neutral-900/50 hover:bg-neutral-950/40 transition-colors duration-100 font-mono text-xs text-zinc-300">
      <td className="py-4.5 px-4 font-sans font-medium text-sm flex items-center gap-3 max-w-sm">
        <div className="p-2 bg-neutral-950 border border-neutral-900 rounded shrink-0">
          <FileIcon extension={file.file_type} className="w-4 h-4" />
        </div>
        <div className="truncate flex flex-col justify-center">
          <span className="text-zinc-100 font-mono text-xs font-bold truncate block select-all hover:text-white" title={file.name}>{file.name}</span>
          <span className="text-[10px] font-mono text-neutral-500 uppercase flex items-center gap-1 mt-0.5">
            <span>{file.file_type.toUpperCase()}</span>
            <span>•</span>
            <span>By {file.uploaded_by.split('@')[0]}</span>
          </span>
        </div>
      </td>
      <td className="py-4.5 px-4 uppercase text-neutral-400 font-semibold tracking-wide">{file.section}</td>
      <td className="py-4.5 px-4 text-neutral-500">{formatBytes(file.size_bytes)}</td>
      <td className="py-4.5 px-4 text-neutral-500">{displayDate}</td>
      <td className="py-4.5 px-4 text-center select-none">
        <div className="flex items-center justify-center gap-4">
          <Badge status={file.is_deployed ? 'deployed' : 'draft'}>{file.is_deployed ? 'Deployed' : 'Draft'}</Badge>
          <button onClick={handleToggleDeploy} disabled={updating}
            title={file.is_deployed ? "Draft this file" : "Deploy this file"}
            className={`w-8 h-4.5 flex items-center rounded-full p-0.5 cursor-pointer relative transition-colors duration-150 ${file.is_deployed ? 'bg-white' : 'bg-neutral-800'}`}>
            <div className={`w-3.5 h-3.5 rounded-full bg-black shadow transform transition-transform duration-150 ${file.is_deployed ? 'translate-x-3.5' : 'translate-x-0'}`} />
          </button>
        </div>
      </td>
      <td className="py-4.5 px-4 text-right select-none">
        <div className="flex items-center justify-end gap-2 text-neutral-500">
          <button onClick={handleTriggerRename} title="Rename file"
            className="p-1.5 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleTriggerMeta} title="Edit metadata"
            className="p-1.5 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDeleteTrigger} title="Purge file"
            className="p-1.5 hover:text-red-500 hover:bg-red-950/20 border border-transparent hover:border-red-900 rounded transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
