export type SectionId = 'notes' | 'assignment' | 'question_paper' | 'question_bank' | 'lab_manual' | 'images';

export interface FileRecord {
  id: string;
  name: string;
  original_name: string;
  storage_path: string;
  section: SectionId;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  is_deployed: boolean;
  uploaded_by: string;
  downloads: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  action: 'upload' | 'delete' | 'rename' | 'deploy' | 'undeploy' | 'edit_meta';
  file_id: string | null;
  file_name: string;
  performed_by: string;
  details: Record<string, any> | null;
  created_at: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user' | 'guest';
}

export interface SectionMeta {
  id: SectionId;
  label: string;
  icon: string; // Lucide icon name
  description: string;
}
