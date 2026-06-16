import { useEffect, useState } from 'react';
import { callEdgeFunction } from '../lib/edgeFunction';
import { FileRecord } from '../types';

export function useFiles(section?: string) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const data = await callEdgeFunction<FileRecord[]>('get-files', {});
        const filtered = section ? data.filter(f => f.section === section) : data;
        setFiles(filtered);
      } catch (err) {
        console.error('Failed to fetch files', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [section]);

  return { files, loading };
}
