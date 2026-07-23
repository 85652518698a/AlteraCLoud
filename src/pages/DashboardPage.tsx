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
import { CollectionSidebar, SidebarToggle } from '../components/files/CollectionSidebar';
import { Footer } from '../components/layout/Footer';
import { Clock, HardDrive } from 'lucide-react';

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
    <div className="min-h-screen bg-white flex flex-col justify-between text-black selection:bg-[#FF3B30] selection:text-white">
      <div className="flex-1">
        <Navbar />

        <CollectionSidebar
          files={[]}
          onSelectCollection={(id) => uiStore.setActiveCollectionId(id)}
          activeCollectionId={activeCollectionId}
        />
        <SidebarToggle />

        <div className={`transition-all duration-200 ${sidebarOpen ? 'ml-56' : 'ml-0'}`}>
        <PageWrapper>
          <div className="mb-8 text-left select-none">
            <div className="flex items-center gap-3 mb-3">
              <div className="section-heading mb-0 pb-0 border-b-0">
                <span>CSMU RESOURCE LOCKER</span>
              </div>
              <span className="text-2xs font-mono text-green-600 border-2 border-green-600 bg-white px-2 py-0.5 uppercase tracking-wider font-bold">
                LIVE
              </span>
            </div>

            <div className="border-l-4 border-black pl-4">
              <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl tracking-wide uppercase text-black">
                Academic Resource Portal
              </h2>
              <p className="text-xs text-neutral-700 font-sans mt-1.5 leading-relaxed max-w-lg font-medium">
                Securely access notes, assignments, previous year question papers, and lab manuals approved directly by CSMU faculty examiners.
              </p>
            </div>
          </div>

          {recentFiles.length > 0 && (
            <div className="mb-8">
              <div className="section-heading">
                <Clock className="w-3 h-3 inline-block mr-1" />
                <span>RECENTLY VIEWED</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentFiles.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
              <div className="brutal-divider" />
            </div>
          )}

          <div>
            <div className="section-heading">
              <HardDrive className="w-3 h-3 inline-block mr-1" />
              <span>FILE BROWSER</span>
            </div>
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
