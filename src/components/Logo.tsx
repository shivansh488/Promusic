import { useState } from 'react';
import logoImage from '../../logo.png';

export function Logo({ className = "" }: { className?: string }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-[2px]">
        <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
          {!imageError ? (
            <img
              src={logoImage}
              alt="ProMusic Logo"
              className="w-full h-full object-contain p-1"
              onError={() => {
                console.error('Logo image failed to load');
                setImageError(true);
              }}
            />
          ) : (
            // Fallback content if image fails to load
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">
              <span className="text-white font-bold text-lg">P</span>
            </div>
          )}
        </div>
      </div>
      <span className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
        ProMusic
      </span>
    </div>
  );
} 