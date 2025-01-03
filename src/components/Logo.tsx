export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-[2px]">
        <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
          <img
            src="/logo.png"
            alt="ProMusic Logo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <span className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
        ProMusic
      </span>
    </div>
  );
} 