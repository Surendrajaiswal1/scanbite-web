import { StoreStatusBadge } from "../components/merchant/StoreStatusBadge";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { QRCodeSVG } from "qrcode.react";
import { apiClient } from "../services/api";
import { MerchantLayout } from "../components/MerchantLayout";
import { HeaderActions } from "../components/merchant/HeaderActions";

export const StorefrontPage = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<{ business_slug?: string; shop_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const businessSlug = profile?.business_slug || "";
  const shopName = profile?.shop_name || user.full_name;
  const publicUrl = businessSlug ? `${window.location.origin}/shop/${businessSlug}` : "";

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    alert("Link copied to clipboard!");
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("menu-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${businessSlug}-qr.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleWhatsApp = () => {
    if (!publicUrl) return;
    const text = encodeURIComponent(`Check out our menu and order online: ${publicUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <MerchantLayout>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-2 min-w-0">
          <div>
            <h1 className="text-base font-semibold lg:text-lg truncate m-0">Storefront QR</h1>
            <p className="text-[11px] text-slate-500 truncate m-0">Share with your customers</p>
          </div>
          <StoreStatusBadge />
        </div>
        <HeaderActions />
      </header>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-slate-900 p-6 lg:p-8 text-white shadow-xl">
            <div className="flex justify-center mb-5">
              <div className="size-56 rounded-2xl bg-white p-5 flex items-center justify-center">
                {publicUrl ? (
                  <QRCodeSVG
                    id="menu-qr-code"
                    value={publicUrl}
                    size={184}
                    level="H"
                    includeMargin={false}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="text-slate-400 text-xs">Generating...</div>
                )}
              </div>
            </div>
            <p className="text-center text-sm font-medium mb-1">{shopName}</p>
            <p className="text-center text-xs text-white/60 mb-6 truncate">{publicUrl.replace(/^https?:\/\//, '')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleDownloadQR} className="h-12 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M12 15V3"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path></svg> Download
              </button>
              <button onClick={() => window.print()} className="h-12 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"></path><rect x="6" y="14" width="12" height="8" rx="1"></rect></svg> Print
              </button>
              <button onClick={handleWhatsApp} className="h-12 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path></svg> WhatsApp
              </button>
              <button onClick={handleCopyLink} className="h-12 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg> Copy link
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Customer Preview</h2>
              <a className="text-xs font-semibold text-indigo-600 inline-flex items-center gap-1" href={publicUrl} target="_blank" rel="noopener noreferrer">
                Open <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
              </a>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm h-[600px] flex flex-col items-center justify-center bg-slate-100 p-8">
               <div className="w-full max-w-[320px] h-[550px] bg-white rounded-[2rem] shadow-xl border-[6px] border-slate-800 overflow-hidden relative">
                  <div className="absolute top-0 inset-x-0 h-5 bg-slate-800 rounded-b-xl w-32 mx-auto z-10"></div>
                  {publicUrl ? (
                    <iframe 
                      src={publicUrl} 
                      title="Menu Preview"
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                      Loading preview...
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 lg:p-5">
          <p className="text-sm font-semibold text-slate-900">Pro tip</p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">Print this QR and place it on each table. Customers scan and order without waiting at the counter.</p>
        </div>
      </div>
    </MerchantLayout>
  );
};
