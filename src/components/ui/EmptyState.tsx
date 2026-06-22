import React from 'react';
import { Ghost, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Vault Section Empty",
  description = "No digital files have been checked into this academic directory yet."
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-neutral-900 rounded-lg text-center my-6">
      <div className="p-4 bg-neutral-950 text-neutral-600 rounded-full mb-3 animate-pulse">
        <FolderOpen className="w-8 h-8 stroke-[1.2]" />
      </div>
      <h3 className="text-sm font-display font-medium tracking-wider text-zinc-300 uppercase mb-1">
        {title}
      </h3>
      <p className="text-xs font-sans text-neutral-500 max-w-sm">
        {description}
      </p>
    </div>
  );
};
