import React from 'react';
import { useUIStore } from '../store/uiStore';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SectionTabs } from '../components/files/SectionTabs';
import { FileSearchBar } from '../components/files/FileSearchBar';
import { FileGrid } from '../components/files/FileGrid';
import { FilePreviewModal } from '../components/files/FilePreviewModal';
import { Footer } from '../components/layout/Footer';
import { Bookmark } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const activeFileForPreview = useUIStore((state) => state.selectedFileForPreview);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-between text-white selection:bg-white selection:text-black">
      <div className="flex-1">
        <Navbar />

        <PageWrapper>
          <div className="mb-10 text-left select-none max-w-2xl">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-2 font-bold select-none">
              <Bookmark className="w-3 h-3 text-white fill-white/10" />
              <span>CSMU RESOURCE LOCKER GATES</span>
            </div>

            <h2 className="font-display font-black text-2xl md:text-3xl tracking-wide uppercase text-zinc-100">
              Academic Resource Portal
            </h2>

            <p className="text-xs text-neutral-400 font-sans mt-2.5 leading-relaxed max-w-lg font-light">
              Securely access notes, assignments, previous year question papers, and lab manuals approved directly by CSMU faculty examiners.
            </p>
          </div>

          <SectionTabs />
          <FileSearchBar />
          <FileGrid />
        </PageWrapper>
      </div>

      <Footer />

      {activeFileForPreview && <FilePreviewModal />}
    </div>
  );
};
