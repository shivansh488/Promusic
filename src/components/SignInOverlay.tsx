import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function SignInOverlay() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-8">
      {/* Logo Section */}
      <div className="w-full flex justify-center pt-12">
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
          <div className="relative w-full h-full bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-12 h-12 text-white"
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm text-center gap-8">
        <h1 className="text-3xl font-bold text-white">Let's get you in</h1>
        
        <div className="w-full space-y-3">
          <Button
            onClick={signInWithGoogle}
            variant="outline"
            className="w-full bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 text-white py-6"
          >
            <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5 mr-3" />
            Continue with Google
          </Button>
          
          <Button
            variant="outline"
            className="w-full bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 text-white py-6"
            disabled
          >
            <img src="https://www.facebook.com/favicon.ico" alt="" className="w-5 h-5 mr-3" />
            Continue with Facebook
          </Button>
          
          <Button
            variant="outline"
            className="w-full bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 text-white py-6"
            disabled
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            Continue with Apple
          </Button>
        </div>

        <div className="w-full flex items-center gap-4 text-white/60 text-sm">
          <div className="h-px flex-1 bg-white/20" />
          <span>or</span>
          <div className="h-px flex-1 bg-white/20" />
        </div>

        <div className="w-full space-y-4">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white py-6"
            disabled
          >
            Log in with a password
          </Button>
          <p className="text-sm text-white/60">
            Don't have an account?{" "}
            <button className="text-primary hover:underline">Sign Up</button>
          </p>
        </div>
      </div>

      {/* Bottom Text */}
      <p className="text-xs text-white/40 text-center max-w-sm">
        By continuing, you agree to our Terms of Service & Privacy Policy
      </p>
    </div>
  );
}