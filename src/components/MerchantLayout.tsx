import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api";

interface MerchantLayoutProps {
  children: React.ReactNode;
}

export const MerchantLayout = ({ children }: MerchantLayoutProps) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [shopName, setShopName] = useState<string>(user?.full_name || "");

  useEffect(() => {
    const fetchProfile = async () => {
      const profileRes = await apiClient.getBusinessProfile();
      if (profileRes.success && profileRes.data) {
        setShopName(profileRes.data.shop_name || user?.full_name || "");
      }
    };
    fetchProfile();
  }, [user]);


  const desktopNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 lg:size-4"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
    )},
    { name: "Orders", path: "/orders", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 lg:size-4"><path d="M16 10a4 4 0 0 1-8 0"></path><path d="M3.103 6.034h17.794"></path><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"></path></svg>
    )},
    { name: "Items", path: "/items", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 lg:size-4"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><path d="m7.5 4.27 9 5.15"></path></svg>
    )},
    { name: "Storefront", path: "/storefront", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 lg:size-4"><rect width="5" height="5" x="3" y="3" rx="1"></rect><rect width="5" height="5" x="16" y="3" rx="1"></rect><rect width="5" height="5" x="3" y="16" rx="1"></rect><path d="M21 16h-3a2 2 0 0 0-2 2v3"></path><path d="M21 21v.01"></path><path d="M12 7v3a2 2 0 0 1-2 2H7"></path><path d="M3 12h.01"></path><path d="M12 3h.01"></path><path d="M12 16v.01"></path><path d="M16 12h1"></path><path d="M21 12v.01"></path><path d="M12 21v-1"></path></svg>
    )},
    { name: "Customers", path: "/customers", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 lg:size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
    )},
    { name: "Analytics", path: "/analytics", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 lg:size-4"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
    )},
    { name: "Payments", path: "/payments", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 lg:size-4"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
    )}
  ];

  const mobileNavItemsLeft = [desktopNavItems[0], desktopNavItems[1]];
  const mobileNavItemsRight = [desktopNavItems[2], desktopNavItems[3], desktopNavItems[6]];

  return (
    <div className="min-h-dvh bg-slate-50 font-sans text-slate-900 pb-24 lg:pb-0">
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 z-30 hidden h-full w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <div className="size-8 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
            {shopName ? shopName.charAt(0).toUpperCase() : "M"}
          </div>
          <span className="ml-3 font-semibold tracking-tight truncate">ScanBite</span>
        </div>
        <nav className="p-4 space-y-1">
          {desktopNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-slate-100 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-900 truncate">{shopName}</p>
          <p className="text-[11px] text-slate-500 truncate mb-2">{user?.email}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pb-8 min-h-dvh">
        {children}
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 z-30 flex w-full border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        {mobileNavItemsLeft.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors ${
                isActive ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {item.name === "Dashboard" ? "Home" : item.name}
              </span>
            </Link>
          );
        })}
        
        <Link 
          to="/menu-setup?add=true" 
          aria-label="Add item"
          className="flex -mt-6 size-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg ring-4 ring-slate-50 active:scale-95 transition-transform self-start mx-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
        </Link>

        {mobileNavItemsRight.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors ${
                isActive ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {item.name === "Storefront" ? "Store" : item.name === "Payments" ? "Pay" : item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
