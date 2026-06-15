import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProfileModal } from "./ProfileModal";
import { useAuthStore } from "../../store/auth";
import { apiClient } from "../../services/api";

interface ProfileDropdownProps {
  shopName: string;
  userEmail: string;
  onLogout: () => void;
  isMobile?: boolean;
}

export const ProfileDropdown = ({ shopName, userEmail, onLogout, isMobile = false }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { user, setUser } = useAuthStore();
  const isStoreOpen = user?.is_store_open ?? true;

  const handleToggleStore = async () => {
    if (!user) return;
    try {
      setIsToggling(true);
      const res = await apiClient.updateBusinessProfile({
        is_store_open: !isStoreOpen
      });
      if (res) {
        setUser({ ...user, is_store_open: !isStoreOpen });
      }
    } catch (err) {
      console.error('Failed to toggle store status', err);
    } finally {
      setIsToggling(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monogram = shopName ? shopName.charAt(0).toUpperCase() : "S";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-100 ${isOpen ? 'bg-slate-100' : ''} ${isMobile ? '' : 'w-full text-left'}`}
      >
        <div className="size-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {monogram}
        </div>
        {!isMobile && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{shopName}</p>
            <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
          </div>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 w-56 rounded-xl border border-slate-200 bg-white shadow-lg animate-[fadeIn_0.15s_ease-out] ${isMobile
            ? 'top-full right-0 mt-2'
            : 'bottom-full left-0 mb-2'
            }`}
        >
          {/* <div className="p-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">{shopName}</p>
            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
          </div> */}
          <div className="p-1.5">
            <button onClick={() => { setIsOpen(false); setIsProfileModalOpen(true); }} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Profile
            </button>
            <Link to="/storefront" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Store Profile
            </Link>
          </div>
          <div className="p-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-600 font-medium">Store Status</span>
            <button
              onClick={handleToggleStore}
              disabled={isToggling}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isStoreOpen ? 'bg-emerald-500' : 'bg-slate-300'} ${isToggling ? 'opacity-50' : ''}`}
            >
              <span className="sr-only">Toggle store status</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isStoreOpen ? 'translate-x-2' : '-translate-x-2'}`}
              />
            </button>
          </div>
          <div className="p-1.5 border-t border-slate-100">
            <button
              onClick={() => { setIsOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
          </div>
        </div>
      )}

      {isProfileModalOpen && (
        <ProfileModal onClose={() => setIsProfileModalOpen(false)} />
      )}
    </div>
  );
};
