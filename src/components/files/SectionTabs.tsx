import React from 'react';
import { useUIStore, uiStore } from '../../store/uiStore';
import { SECTIONS } from '../../constants/sections';

export const SectionTabs: React.FC = () => {
  const activeSection = useUIStore(s => s.activeSection);

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none select-none border-b-2 border-black pb-3">
      <button
        onClick={() => uiStore.setActiveSection('all')}
        className={`text-[10px] font-mono px-3 py-1.5 border-2 transition-colors duration-150 cursor-pointer whitespace-nowrap uppercase tracking-wider font-bold ${
          activeSection === 'all'
            ? 'bg-black text-white border-black'
            : 'bg-white text-black border-black hover:bg-[#FF3B30] hover:text-white hover:border-[#FF3B30]'
        }`}
      >
        ALL
      </button>
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => uiStore.setActiveSection(s.id)}
          className={`text-[10px] font-mono px-3 py-1.5 border-2 transition-colors duration-150 cursor-pointer whitespace-nowrap uppercase tracking-wider font-bold ${
            activeSection === s.id
              ? 'bg-black text-white border-black'
            : 'bg-white text-black border-black hover:bg-blue-600 hover:text-white hover:border-blue-600'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};
