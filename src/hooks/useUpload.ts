import { useState } from 'react';
import { authStore } from '../store/authStore';

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, section: string, isDeployed: boolean) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('section', section);
    formData.append('isDeployed', String(isDeployed));

    try {
      const token = await authStore.getFirebaseIdToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${FUNCTIONS_BASE}/upload-file`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || 'Upload failed');
      }

      setProgress(100);
      return await response.json();
    } catch (err: any) {
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, progress, uploading };
}
