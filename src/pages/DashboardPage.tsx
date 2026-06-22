import React, { useState, useEffect } from 'react';
import { useUIStore, uiStore } from '../store/uiStore';
import { FileRecord } from '../types';
import { getRecentlyViewed } from '../lib/recentlyViewed';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SectionTabs } from '../components/files/SectionTabs';
import { SmartSearch } from '../components/files/SmartSearch';
import { FileGrid } from '../components/files/FileGrid';
import { FileCard } from '../components/files/FileCard';
import { FilePreviewModal } from '../components/files/FilePreviewModal';
import { CollectionSidebar } from '../components/files/CollectionSidebar';
import { Footer } from '../components/layout/Footer';
import { Bookmark, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const activeFileForPreview = useUIStore((state) => state.selectedFileForPreview);
  const activeCollectionId = useUIStore(s => s.activeCollectionId);
  const sidebarOpen = useUIStore(s => s.sidebarOpen);
  const [recentFiles, setRecentFiles] = useState<FileRecord[]>([]);

  useEffect(() => {
    setRecentFiles(getRecentlyViewed());
    const handler = () => setRecentFiles(getRecentlyViewed());
    window.addEventListener('storage', handler);
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('focus', handler);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-between text-white selection:bg-white selection:text-black">
      <div className="flex-1">
        <Navbar />

        <CollectionSidebar
          files={[]}
          onSelectCollection={(id) => uiStore.setActiveCollectionId(id)}
          activeCollectionId={activeCollectionId}
        />

        <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-56' : 'ml-0'}`}>
        <PageWrapper>
          <div className="mb-10 text-left select-none max-w-2xl page-enter">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-2 font-bold select-none">
              <Bookmark className="w-3 h-3 text-white fill-white/10" />
              <span>CSMU RESOURCE LOCKER GATES</span>
            </div>

            <div className="flex items-center gap-4">
              <h2 className="font-display font-black text-2xl md:text-3xl tracking-wide uppercase text-zinc-100">
                Academic Resource Portal
              </h2>
              <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-neutral-800 to-transparent" />
              <span className="hidden sm:inline-block text-[9px] font-mono text-accent/60 border border-accent/10 bg-accent/5 px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                LIVE
              </span>
            </div>

            <p className="text-xs text-neutral-400 font-sans mt-2.5 leading-relaxed max-w-lg font-light">
              Securely access notes, assignments, previous year question papers, and lab manuals approved directly by CSMU faculty examiners.
            </p>
          </div>

          {recentFiles.length > 0 && (
            <div className="mb-8 page-enter" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-3 select-none">
                <Clock className="w-3 h-3" />
                <span>RECENTLY VIEWED</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentFiles.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
              <hr className="border-neutral-950 my-8" />
            </div>
          )}

          <div className="page-enter" style={{ animationDelay: '0.1s' }}>
            <SectionTabs />
            <SmartSearch />
            <FileGrid />
          </div>
        </PageWrapper>

        <Footer />
      </div>

      </div>

      {activeFileForPreview && <FilePreviewModal />}
    </div>
  );
};
