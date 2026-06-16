import React from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Image as ImageIcon, 
  FileArchive, 
  FileCheck,
  File, 
  BookOpen, 
  HelpCircle, 
  FlaskConical,
  ClipboardList
} from 'lucide-react';

interface FileIconProps {
  extension: string;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ extension, className = 'w-5 h-5' }) => {
  const ext = extension.toLowerCase().trim();

  if (ext === 'pdf') {
    return <FileText className={`text-red-500 ${className}`} />;
  }
  
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return <BookOpen className={`text-blue-400 ${className}`} />;
  }

  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet className={`text-emerald-500 ${className}`} />;
  }

  if (['ppt', 'pptx'].includes(ext)) {
    return <Presentation className={`text-amber-500 ${className}`} />;
  }

  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return <ImageIcon className={`text-purple-400 ${className}`} />;
  }

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <FileArchive className={`text-neutral-400 ${className}`} />;
  }

  return <File className={`text-neutral-300 ${className}`} />;
};
