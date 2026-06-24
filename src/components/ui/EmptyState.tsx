import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Vault Section Empty",
  description = "No digital files have been checked into this academic directory yet."
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 border-3 border-black text-center my-6 bg-white">
      <div className="p-4 bg-white text-black border-2 border-black mb-3">
        <FolderOpen className="w-8 h-8 stroke-[1.2]" />
      </div>
      <h3 className="text-sm font-display font-bold tracking-wider text-black uppercase mb-1">
        {title}
      </h3>
      <p className="text-xs font-sans text-neutral-700 max-w-sm font-medium">
        {description}
      </p>
    </div>
  );
};
