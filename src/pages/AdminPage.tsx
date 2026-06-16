import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { uiStore } from '../store/uiStore';
import { callEdgeFunction } from '../lib/edgeFunction';
import { FileRecord } from '../types';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { AdminStats } from '../components/admin/AdminStats';
import { UploadZone } from '../components/admin/UploadZone';
import { AdminFileTable } from '../components/admin/AdminFileTable';
import { AuditLogTable } from '../components/admin/AuditLogTable';
import { RenameModal } from '../components/admin/RenameModal';
import { EditMetaModal } from '../components/admin/EditMetaModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Footer } from '../components/layout/Footer';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!user) { uiStore.setCurrentPage('landing'); return; }
    if (user.role !== 'admin') {
      uiStore.setCurrentPage('dashboard');
      toast.error('ACCESS REJECTED: Full administrator certificate required.');
    }
  }, [user]);

  const loadFiles = async () => {
    if (!user) return;
    try {
      const data = await callEdgeFunction<FileRecord[]>('get-files', {});
      setFiles(data);
    } catch (err) {
      console.error(err);
      toast.error('Unable to fetch updated file registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFiles(); }, [refreshCount, user?.email]);

  const triggerUpdate = () => setRefreshCount(prev => prev + 1);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-center p-6 text-white select-none">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-3 animate-bounce" />
        <h3 className="font-display font-medium text-xs tracking-widest uppercase text-red-500 mb-1">REJECTED: HANDSHAKE REJECTED</h3>
        <p className="text-[10px] font-mono text-zinc-500 max-w-sm">Please authenticate with an elevated administrator whitelisted identity to unlock these keys.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between selection:bg-white selection:text-black">
      <div>
        <Navbar />
        <PageWrapper>
          <div className="mb-8 select-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-2 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-white" /><span>ELEVATED CABINET HUB</span>
              </div>
              <h2 className="font-display font-black text-2xl tracking-wide uppercase text-zinc-100">Locker Inventory Manager</h2>
              <p className="text-xs text-neutral-500 font-sans mt-2 max-w-md font-light">Secure ingestion platform. Upload new learning folders, toggle public student access, rename objects, and view operations.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/60 border border-neutral-900 rounded font-mono text-[10px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-neutral-300 font-bold">MUTATIONS ENGAGED</span>
            </div>
          </div>
          <AdminStats files={files} />
          <UploadZone onUploadSuccess={triggerUpdate} />
          <div className="mb-8">
            <h3 className="text-zinc-200 font-display font-semibold tracking-wider text-xs uppercase mb-4 flex items-center gap-2 select-none">
              <span>EXPLORE FILE DIRECTORY</span>
              <span className="text-neutral-600 font-mono text-[9px] font-normal">/ FULL CATALOG INDEX</span>
            </h3>
            <AdminFileTable files={files} onActionComplete={triggerUpdate} />
          </div>
          <AuditLogTable />
        </PageWrapper>
      </div>
      <Footer />
      <RenameModal onSuccess={triggerUpdate} />
      <EditMetaModal onSuccess={triggerUpdate} />
      <ConfirmDialog />
    </div>
  );
};
