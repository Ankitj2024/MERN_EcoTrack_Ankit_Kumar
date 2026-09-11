import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google?: any;
  }
}

interface Props {
  text?: string;
}

export const GoogleSignInButton: React.FC<Props> = ({ text = "Continue with Google" }) => {
  const { googleLogin } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoEmail, setDemoEmail] = useState("google.demo@ecotrack.com");
  const [demoName, setDemoName] = useState("Google EcoTrack User");

  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      toastError("Failed to receive Google credential.");
      return;
    }

    setLoading(true);
    try {
      const data = await googleLogin(response.credential);
      toastSuccess(`Signed in as ${data?.user?.name || "Google User"}!`);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Google Auth error:", err);
      toastError(err?.response?.data?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) return;

    const interval = setInterval(() => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        clearInterval(interval);
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
          });

          // Render hidden or visible Google button inside container
          googleBtnContainerRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: "outline",
            size: "large",
            width: 380,
            text: "continue_with",
            shape: "pill",
          });
        } catch (e) {
          console.warn("Failed to initialize Google GSI button:", e);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [googleClientId]);

  const handleCustomButtonClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      // Prompt Google One Tap or click the hidden native button
      const nativeBtn = googleBtnContainerRef.current?.querySelector("div[role=button]") as HTMLElement;
      if (nativeBtn) {
        nativeBtn.click();
        return;
      }
      window.google.accounts.id.prompt();
    } else {
      // Dev mode fallback dialog
      setShowDemoModal(true);
    }
  };

  const handleMockGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await googleLogin("", {
        email: demoEmail,
        name: demoName,
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${demoEmail}`,
      });
      setShowDemoModal(false);
      toastSuccess(`Signed in with Google as ${data?.user?.name}!`);
      navigate("/dashboard");
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Demo Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full">
        {/* If Google Client ID is configured, this div renders the official GSI button */}
        {googleClientId ? (
          <div className="flex justify-center w-full" ref={googleBtnContainerRef} />
        ) : null}

        {/* Custom styled Google Button */}
        {(!googleClientId || !window.google?.accounts?.id) && (
          <button
            type="button"
            onClick={handleCustomButtonClick}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 font-semibold text-sm border border-gray-300 dark:border-white/[0.1] rounded-2xl shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] cursor-pointer"
          >
            {/* Google G Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.43 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.57 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loading ? "Connecting..." : text}</span>
          </button>
        )}
      </div>

      {/* Dev Mode Simulation Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.43 7.37 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.57 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-base">Google Sign-In</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Development Mode Simulation</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
              No <code className="bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-emerald-500 font-mono">VITE_GOOGLE_CLIENT_ID</code> detected in <code className="font-mono">.env</code>. You can test instant Google authentication right now with this mock Google account, or configure your client ID in <code className="font-mono">.env</code>.
            </p>

            <form onSubmit={handleMockGoogleLogin} className="space-y-3 pt-1">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 dark:text-zinc-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 dark:text-zinc-500 mb-1">Google Email</label>
                <input
                  type="email"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDemoModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md active:scale-95"
                >
                  {loading ? "Signing in..." : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
