import React from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { SECTIONS } from '../../constants/sections';
import { SectionId } from '../../types';
import { BookOpen, ClipboardList, FileQuestion, Database, FlaskConical, Image } from 'lucide-react';

// Help component to resolve the icon components based on ID
const TabIcon: React.FC<{ iconName: string; className?: string }> = ({ iconName, className = 'w-4 h-4' }) => {
  switch (iconName) {
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'ClipboardList':
      return <ClipboardList className={className} />;
    case 'FileQuestion':
      return <FileQuestion className={className} />;
    case 'Database':
      return <Database className={className} />;
    case 'FlaskConical':
      return <FlaskConical className={className} />;
    case 'Image':
      return <Image className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};

export const SectionTabs: React.FC = () => {
  const activeSection = useUIStore(s => s.activeSection);

  return (
    <>
      {/* Mobile select dropdown */}
      <div className="sm:hidden w-full mb-4">
        <select
          value={activeSection}
          onChange={(e) => uiStore.setActiveSection(e.target.value as SectionId)}
          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-900 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-mono"
        >
          {SECTIONS.map((sec) => (
            <option key={sec.id} value={sec.id} className="bg-neutral-950">{sec.label.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:flex w-full border-b border-neutral-900 mb-8 select-none overflow-x-auto scrollbar-none scroll-smooth">
        <div className="flex space-x-8 min-w-max pb-px">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => uiStore.setActiveSection(sec.id)}
                className={`flex items-center gap-2.5 pb-4 px-1 text-xs font-mono tracking-wider uppercase relative cursor-pointer font-bold transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <TabIcon iconName={sec.icon} className={`w-3.5 h-3.5 transition-transform duration-150 ${isActive ? 'scale-110 text-white' : 'text-neutral-600'}`} />
                <span>{sec.label}</span>
                
                {/* Premium indicator underline */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-[fadeIn_0.15s_ease-out]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
