import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { apiClient } from "../services/api";

export const StorePreviewPage = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ business_slug?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await apiClient.getBusinessProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const businessSlug = profile?.business_slug || "";
  const publicUrl = businessSlug ? `${window.location.origin}/shop/${businessSlug}` : "";

  const handleCompleteOnboarding = async () => {
    setIsCompleting(true);
    const response = await apiClient.completeOnboarding();
    
    if (response.success) {
      if (user) {
        setUser({ ...user, onboarding_completed: true });
      }
      navigate("/dashboard");
    } else {
      setIsCompleting(false);
      alert("Failed to complete onboarding. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-h)] mb-4">Step 3: Store Preview</h1>
          <p className="text-[var(--text)]">
            Your digital storefront is ready! Here is a preview of how it looks to your customers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          <div className="bg-[var(--card-bg)] rounded-2xl shadow-xl shadow-black/10 border border-[var(--border)] p-8 text-center flex flex-col items-center">
            <h2 className="text-xl font-bold text-[var(--text-h)] mb-6">Your Menu QR Code</h2>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 inline-block">
              {publicUrl && (
                <QRCodeSVG 
                  value={publicUrl} 
                  size={240}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>

            <p className="text-[var(--text)] text-sm mb-8">
              Customers will scan this QR code to view your digital menu directly on their phones.
            </p>

            <button 
              onClick={handleCompleteOnboarding}
              disabled={isCompleting}
              className="w-full bg-[var(--accent)] hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transition duration-200 shadow-lg shadow-[var(--accent)]/20 text-lg disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isCompleting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Complete Onboarding & Go to Dashboard"
              )}
            </button>
          </div>

          <div className="bg-[var(--card-bg)] rounded-2xl shadow-xl shadow-black/10 border border-[var(--border)] overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--background)]">
              <h2 className="font-semibold text-[var(--text-h)] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Live Preview
              </h2>
            </div>
            <div className="flex-1 bg-black/5 p-4 md:p-8 flex items-center justify-center">
              <div className="w-full max-w-sm h-[650px] bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-[var(--text-h)] overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-6 bg-[var(--text-h)] rounded-b-2xl w-40 mx-auto z-10"></div>
                {publicUrl && (
                  <iframe 
                    src={publicUrl} 
                    title="Menu Preview"
                    className="w-full h-full border-0 pt-6"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
