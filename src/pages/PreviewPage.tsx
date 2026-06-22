import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { callEdgeFunction } from '../lib/edgeFunction';
import { FileRecord } from '../types';
import { X, Download } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

export const PreviewPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [file, setFile] = useState<FileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadFile = async () => {
      if (!fileId) {
        toast.error('File ID not provided');
        navigate('/dashboard');
        return;
      }

      try {
        const result = await callEdgeFunction<{ file: FileRecord; url?: string }>(
          'get-signed-url',
          { fileId },
          false
        );
        setFile(result.file);
        if (result.url) {
          setSignedUrl(result.url);
        }
      } catch (err: any) {
        console.error(err);
        toast.error('Unable to load file');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [fileId, user, navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!file) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center text-white">
        <p className="text-neutral-400">File not found</p>
      </div>
    );
  }

  const isPdf = file.file_type.toLowerCase() === 'pdf';

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col text-white">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="font-mono text-sm font-semibold truncate">{file.name}</h2>
          <p className="text-xs text-neutral-500 mt-1">{file.mime_type}</p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          {signedUrl && (
            <a
              href={signedUrl}
              download={file.name}
              className="p-2 hover:bg-neutral-800 rounded-md transition"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
          )}
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-neutral-800 rounded-md transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isPdf && signedUrl ? (
          <iframe
            src={`${signedUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            title="PDF Viewer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="bg-neutral-900 rounded-lg p-8 max-w-md text-center space-y-4">
              <p className="text-neutral-400">
                Preview not available for {file.file_type.toUpperCase()} files
              </p>
              {signedUrl && (
                <a
                  href={signedUrl}
                  download={file.name}
                  className="inline-block px-4 py-2 bg-white text-black rounded-md font-semibold hover:bg-neutral-200 transition"
                >
                  Download File
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
