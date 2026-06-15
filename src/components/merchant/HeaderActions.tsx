import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import { apiClient } from "../../services/api";
import { ProfileDropdown } from "./ProfileDropdown";
import { NotificationDropdown } from "./NotificationDropdown";

export const HeaderActions = () => {
  const { user, logout } = useAuthStore();
  const [shopName, setShopName] = useState(user?.business_name || user?.full_name || "Shop");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.getBusinessProfile();
        if (res.success && res.data) {
          setShopName(res.data.shop_name || user?.business_name || user?.full_name || "Shop");
        }
      } catch (err) {
        console.error("Failed to fetch business profile for header", err);
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.href = "/signup";
  };

  return (
    <div className="flex items-center gap-2">
      <NotificationDropdown />
      <ProfileDropdown 
        shopName={shopName} 
        userEmail={user?.email || ""} 
        onLogout={handleLogout} 
        isMobile={true} 
      />
    </div>
  );
};
