import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Footer } from '../components/layout/Footer';
import { Download, FileText, Library } from 'lucide-react';

const REPO = '85652518698a/AlteraCLoud';

export const DownloadPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-between text-white selection:bg-white selection:text-black">
      <div className="flex-1">
        <Navbar />
        <PageWrapper>
          <div className="max-w-3xl mx-auto">
            <div className="mb-12 text-left select-none">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-2 font-bold select-none">
                <Download className="w-3 h-3 text-white fill-white/10" />
                <span>DESKTOP APPLICATION</span>
              </div>
              <h2 className="font-display font-black text-2xl md:text-3xl tracking-wide uppercase text-zinc-100">
                Download Altera Cloud
              </h2>
              <p className="text-xs text-neutral-400 font-sans mt-2.5 leading-relaxed max-w-lg font-light">
                Get the desktop app for a faster, native experience. Available for Windows, macOS, and Linux.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <a
                href={`https://github.com/${REPO}/releases/latest/download/Altera.Cloud.Setup.exe`}
                className="group border border-neutral-900 rounded-lg p-6 bg-neutral-950/30 hover:border-neutral-700 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neutral-900/80 border border-neutral-850 rounded shrink-0">
                    <Download className="w-6 h-6 text-neutral-300" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider group-hover:text-accent transition-colors">
                      Windows
                    </h3>
                    <p className="text-[10px] font-mono text-neutral-500">Installer (.exe) — 64-bit</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Download className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider">Download</span>
                    </div>
                  </div>
                </div>
              </a>

              <a
                href={`https://github.com/${REPO}/releases/latest/download/Altera.Cloud.AppImage`}
                className="group border border-neutral-900 rounded-lg p-6 bg-neutral-950/30 hover:border-neutral-700 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neutral-900/80 border border-neutral-850 rounded shrink-0">
                    <FileText className="w-6 h-6 text-neutral-300" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider group-hover:text-accent transition-colors">
                      Linux
                    </h3>
                    <p className="text-[10px] font-mono text-neutral-500">AppImage + .deb packages</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Download className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider">Download</span>
                    </div>
                  </div>
                </div>
              </a>

              <a
                href={`https://github.com/${REPO}/releases/latest/download/Altera.Cloud.dmg`}
                className="group border border-neutral-900 rounded-lg p-6 bg-neutral-950/30 hover:border-neutral-700 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neutral-900/80 border border-neutral-850 rounded shrink-0">
                    <FileText className="w-6 h-6 text-neutral-300" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider group-hover:text-accent transition-colors">
                      macOS
                    </h3>
                    <p className="text-[10px] font-mono text-neutral-500">Disk Image (.dmg) — Apple Silicon + Intel</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Download className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider">Download</span>
                    </div>
                  </div>
                </div>
              </a>

              <a
                href={`https://github.com/${REPO}/releases`}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-neutral-900 rounded-lg p-6 bg-neutral-950/30 hover:border-neutral-700 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neutral-900/80 border border-neutral-850 rounded shrink-0">
                    <Library className="w-6 h-6 text-neutral-300" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider group-hover:text-accent transition-colors">
                      All Releases
                    </h3>
                    <p className="text-[10px] font-mono text-neutral-500">View all versions and release notes on GitHub</p>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider">GitHub →</span>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            <div className="p-6 border border-neutral-900 rounded-lg bg-neutral-950/20 text-center">
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider leading-relaxed">
                Desktop app built with Electron • Source code available on GitHub<br />
                ALTERA CLOUD • CHANNABASWESHWAR SYSTEM MANAGEMENT
              </p>
            </div>
          </div>
        </PageWrapper>
      </div>
      <Footer />
    </div>
  );
};
