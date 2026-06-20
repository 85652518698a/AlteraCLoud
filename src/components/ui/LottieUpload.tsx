import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/loading-bar.json';

interface LottieUploadProps {
  progress: number;
}

export const LottieUpload: React.FC<LottieUploadProps> = ({ progress }) => {
  return (
    <div className="w-full flex flex-col items-center gap-2">
      <Lottie
        animationData={loadingAnimation}
        loop
        className="w-full max-w-[240px] h-16"
      />
      <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
        {progress}%
      </span>
    </div>
  );
};
