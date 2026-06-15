import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../services/api";

interface NotificationDropdownProps {
  isMobile?: boolean;
}

interface OrderNotification {
  id: number;
  order_number: string;
  status: string;
  created_at: string;
}

export const NotificationDropdown = ({ }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [readIds, setReadIds] = useState<number[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load read notifications from localStorage
    const saved = localStorage.getItem("read_notifications");
    if (saved) {
      try {
        setReadIds(JSON.parse(saved));
      } catch (e) {
        // Handle parse error
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.getOrders();
      if (response.success && response.data) {
        // Filter for pending orders or recently created orders
        const pendingOrders = response.data.filter((o: any) => o.status === 'pending');
        setNotifications(pendingOrders);
      }
    } catch (e) {
      // Handle error gracefully
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  const unreadNotifications = notifications.filter(n => !readIds.includes(n.id));

  const markAsRead = (id: number) => {
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    localStorage.setItem("read_notifications", JSON.stringify(newReadIds));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const newReadIds = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(newReadIds);
    localStorage.setItem("read_notifications", JSON.stringify(newReadIds));
    setIsOpen(false);
  };

  const getTimeElapsed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center size-10 rounded-xl transition-colors hover:bg-slate-100 ${isOpen ? 'bg-slate-100' : ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
        {unreadNotifications.length > 0 && (
          <span className="absolute top-2 right-2 size-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 w-72 sm:w-80 rounded-xl border border-slate-200 bg-white shadow-xl animate-[fadeIn_0.15s_ease-out] top-full right-0 mt-2"
        >
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
            {unreadNotifications.length > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map(notification => (
                <div key={notification.id} className="relative flex flex-col gap-1 p-3 sm:p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
                  <Link 
                    to="/orders" 
                    className="absolute inset-0 z-10"
                    onClick={() => {
                      markAsRead(notification.id);
                      setIsOpen(false);
                    }}
                  >
                    <span className="sr-only">View order</span>
                  </Link>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      New Order Received
                    </p>
                    <span className="shrink-0 text-[10px] font-medium text-slate-400">
                      {getTimeElapsed(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Order <span className="font-semibold text-slate-700">{notification.order_number}</span> is waiting for your approval.
                  </p>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-slate-200 z-20"
                    title="Mark as read"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">You're all caught up</p>
                  <p className="text-xs text-slate-500 mt-0.5">No new notifications right now.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
