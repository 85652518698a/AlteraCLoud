import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-white">
      <div className="text-center space-y-6 max-w-md">
        <AlertCircle className="w-16 h-16 text-neutral-500 mx-auto" />
        
        <div>
          <h1 className="font-display font-black text-5xl tracking-widest mb-2">404</h1>
          <p className="text-xs font-mono tracking-[0.2em] text-neutral-500 uppercase mb-4">
            Requested Resource Not Found
          </p>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            The file or page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button
          onClick={() => navigate('/')}
          variant="primary"
          className="w-full"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
