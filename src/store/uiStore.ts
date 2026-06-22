import { useState, useEffect } from 'react';
import { SectionId, FileRecord } from '../types';

interface UIState {
  currentPage: 'landing' | 'dashboard' | 'admin' | 'privacy' | 'terms' | 'download' | 'view';
  activeSection: SectionId | 'all';
  activeCourse: string;
  searchQuery: string;
  selectedFileForPreview: FileRecord | null;
  viewFile: FileRecord | null;
  renameModalFile: FileRecord | null;
  editMetaModalFile: FileRecord | null;
  confirmDialogData: {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    targetName: string;
    onConfirm: () => void;
  } | null;
}

let state: UIState = {
  currentPage: 'landing',
  activeSection: 'notes',
  activeCourse: '',
  searchQuery: '',
  selectedFileForPreview: null,
  viewFile: null,
  renameModalFile: null,
  editMetaModalFile: null,
  confirmDialogData: null,
};

const listeners = new Set<(state: UIState) => void>();

const get = () => state;

const set = (nextState: Partial<UIState> | ((curr: UIState) => Partial<UIState>)) => {
  const next = typeof nextState === 'function' ? nextState(state) : nextState;
  state = { ...state, ...next };
  listeners.forEach((listener) => listener(state));
};

const subscribe = (listener: (state: UIState) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const uiStore = {
  get,
  set,
  subscribe,
  
  setCurrentPage: (page: 'landing' | 'dashboard' | 'admin' | 'privacy' | 'terms' | 'download' | 'view') => {
    set({ currentPage: page });
  },

  setActiveSection: (section: SectionId | 'all') => {
    set({ activeSection: section });
  },

  setActiveCourse: (course: string) => {
    set({ activeCourse: course });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSelectedFileForPreview: (file: FileRecord | null) => {
    set({ selectedFileForPreview: file });
  },

  setViewFile: (file: FileRecord | null) => {
    set({ viewFile: file });
  },

  openFileViewer: (file: FileRecord) => {
    set({ viewFile: file, currentPage: 'view' });
    window.history.replaceState(null, '', `/view/${file.id}`);
  },

  setRenameModalFile: (file: FileRecord | null) => {
    set({ renameModalFile: file });
  },

  setEditMetaModalFile: (file: FileRecord | null) => {
    set({ editMetaModalFile: file });
  },

  showConfirmDialog: (data: {
    title: string;
    description: string;
    confirmText: string;
    targetName: string;
    onConfirm: () => void;
  }) => {
    set({
      confirmDialogData: {
        isOpen: true,
        ...data
      }
    });
  },

  closeConfirmDialog: () => {
    set({ confirmDialogData: null });
  }
};

export function useUIStore<SelectorOutput>(
  selector: (state: UIState) => SelectorOutput
): SelectorOutput {
  const [slice, setSlice] = useState(() => selector(state));

  useEffect(() => {
    const handleUpdate = (curr: UIState) => {
      setSlice(selector(curr));
    };
    return subscribe(handleUpdate);
  }, [selector]);

  return slice;
}
