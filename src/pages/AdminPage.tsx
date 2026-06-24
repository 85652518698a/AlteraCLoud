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
import { AdminUserManager } from '../components/admin/AdminUserManager';
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-6 text-black select-none">
        <ShieldAlert className="w-12 h-12 text-[#FF3B30] mb-3" />
        <h3 className="font-display font-bold text-xs tracking-widest uppercase text-[#FF3B30] mb-1 border-2 border-[#FF3B30] p-2">REJECTED: HANDSHAKE REJECTED</h3>
        <p className="text-[10px] font-mono text-neutral-700 max-w-sm font-bold">Please authenticate with an elevated administrator whitelisted identity to unlock these keys.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-[#FF3B30] selection:text-white">
      <div>
        <Navbar />
        <PageWrapper>
          <div className="mb-8 select-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-black pb-6">
            <div>
              <div className="section-heading">
                <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1" /><span>ELEVATED CABINET HUB</span>
              </div>
              <h2 className="font-display font-black text-2xl tracking-wide uppercase text-black">Locker Inventory Manager</h2>
              <p className="text-xs text-neutral-700 font-sans mt-2 max-w-md font-medium">Secure ingestion platform. Upload new learning folders, toggle public student access, rename objects, and view operations.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black font-mono text-[10px] font-bold">
              <span className="h-2 w-2 bg-[#FF3B30]"></span>
              <span className="text-black">MUTATIONS ENGAGED</span>
            </div>
          </div>
          <AdminStats files={files} />
          <UploadZone onUploadSuccess={triggerUpdate} />
          <div className="mb-8">
            <div className="section-heading">
              <span>EXPLORE FILE DIRECTORY</span>
              <span className="text-neutral-600 font-mono text-[9px] font-normal ml-2">/ FULL CATALOG INDEX</span>
            </div>
            <AdminFileTable files={files} onActionComplete={triggerUpdate} />
          </div>
          <AdminUserManager />
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
