import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Footer } from '../components/layout/Footer';
import { Download, FileText, Library } from 'lucide-react';

const REPO = '85652518698a/AlteraCLoud';

export const DownloadPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-black selection:bg-[#FF3B30] selection:text-white">
      <div className="flex-1">
        <Navbar />
        <PageWrapper>
          <div className="max-w-3xl mx-auto">
            <div className="mb-12 text-left select-none border-b-4 border-black pb-8">
              <div className="section-heading">
                <Download className="w-3 h-3 inline-block mr-1" />
                <span>DESKTOP APPLICATION</span>
              </div>
              <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl tracking-wide uppercase text-black">
                Download Altera Cloud
              </h2>
              <p className="text-xs text-neutral-600 font-sans mt-2.5 leading-relaxed max-w-lg font-medium">
                Get the desktop app for a faster, native experience. Available for Windows, macOS, and Linux.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <a
                href={`https://github.com/${REPO}/releases/latest/download/Altera.Cloud.Setup.exe`}
                className="group border-3 border-black p-6 bg-white hover:translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 block"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white border-2 border-black shrink-0">
                    <Download className="w-6 h-6 text-black" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xs font-mono font-bold text-black uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                      Windows
                    </h3>
                    <p className="text-xs font-mono text-neutral-600 font-bold">Installer (.exe) — 64-bit</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">Download</span>
                    </div>
                  </div>
                </div>
              </a>

              <a
                href={`https://github.com/${REPO}/releases/latest/download/Altera.Cloud.AppImage`}
                className="group border-3 border-black p-6 bg-white hover:translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 block"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white border-2 border-black shrink-0">
                    <FileText className="w-6 h-6 text-black" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xs font-mono font-bold text-black uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                      Linux
                    </h3>
                    <p className="text-xs font-mono text-neutral-600 font-bold">AppImage + .deb packages</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">Download</span>
                    </div>
                  </div>
                </div>
              </a>

              <a
                href={`https://github.com/${REPO}/releases/latest/download/Altera.Cloud.dmg`}
                className="group border-3 border-black p-6 bg-white hover:translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 block"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white border-2 border-black shrink-0">
                    <FileText className="w-6 h-6 text-black" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xs font-mono font-bold text-black uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                      macOS
                    </h3>
                    <p className="text-xs font-mono text-neutral-600 font-bold">Disk Image (.dmg) — Apple Silicon + Intel</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">Download</span>
                    </div>
                  </div>
                </div>
              </a>

              <a
                href={`https://github.com/${REPO}/releases`}
                target="_blank"
                rel="noopener noreferrer"
                className="group border-3 border-black p-6 bg-white hover:translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 block"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white border-2 border-black shrink-0">
                    <Library className="w-6 h-6 text-black" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xs font-mono font-bold text-black uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                      All Releases
                    </h3>
                    <p className="text-xs font-mono text-neutral-600 font-bold">View all versions and release notes on GitHub</p>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">GitHub →</span>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            <div className="p-6 border-4 border-black bg-white text-center">
              <p className="text-xs font-mono text-black uppercase tracking-wider leading-relaxed font-bold">
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
