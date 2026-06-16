import { MAX_FILE_SIZE_BYTES, SUPPORTED_EXTENSIONS } from '../constants/fileTypes';

export function validateFile(file: File): { valid: boolean; error?: string } {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file format. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds 50MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`
    };
  }

  return { valid: true };
}
