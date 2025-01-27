import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function SignInOverlay() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-2xl bg-black/30 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md mx-auto">
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/30 via-purple-500/30 to-indigo-500/30 rounded-[32px] blur-xl" />
        
        {/* Content Container */}
        <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 text-center overflow-hidden">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl">
              <svg
                viewBox="0 0 24 24"
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Welcome to Melody Haven
          </h2>
          <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-sm mx-auto">
            Millions of songs, podcasts, and playlists. Ready for you to enjoy.
          </p>

          {/* Sign In Button */}
          <div className="space-y-4">
            <Button
              onClick={signInWithGoogle}
              className="w-full bg-white hover:bg-white/90 text-black font-medium rounded-full py-6 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </div>
            </Button>

            <p className="text-sm text-white/50 px-6">
              By continuing, you agree to our Terms of Service & Privacy Policy
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl -z-10" />
        </div>
      </div>
    </div>
  );
} 