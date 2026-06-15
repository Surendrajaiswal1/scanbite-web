import { StoreStatusBadge } from "../components/merchant/StoreStatusBadge";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api";
import { MerchantLayout } from "../components/MerchantLayout";
import { HeaderActions } from "../components/merchant/HeaderActions";

interface MenuItem {
  id: string | number;
  name: string;
}

interface OrderItem {
  id: string | number;
  quantity: number;
  menu_item?: MenuItem;
  price?: string | number;
  unit_price?: string | number;
}

interface Order {
  id: string | number;
  order_number: string;
  customer_name: string;
  payment_method: string;
  payment_status: string;
  total_amount: string | number;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

export const OrdersPage = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "cancelled">("active");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const ordersRes = await apiClient.getOrders();
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const updateOrderStatus = async (orderId: string | number, newStatus: string) => {
    const res = await apiClient.updateOrder(orderId, newStatus);
    if (res.success && res.data) {
      const updatedOrder = res.data;
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
        if (newStatus === 'completed' || newStatus === 'cancelled') {
            setTimeout(() => setSelectedOrder(null), 300);
        }
      }
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getTimeElapsed = (dateString: string) => {
    const diff = Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / 60000,
    );
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "preparing":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "ready":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "completed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const activeOrders = orders.filter(o => ["pending", "preparing", "ready"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "completed");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");

  const displayedOrders = activeTab === "active" ? activeOrders : activeTab === "completed" ? completedOrders : cancelledOrders;

  return (
    <MerchantLayout>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-2 min-w-0">
          <div>
            <h1 className="text-base font-semibold lg:text-lg truncate m-0">Live Orders</h1>
            <p className="text-[11px] text-slate-500 truncate m-0">{activeOrders.length} active</p>
          </div>
          <StoreStatusBadge />
        </div>
        <div className="flex items-center gap-2">
          <HeaderActions />
        </div>
      </header>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <div className="flex gap-2 mb-4 overflow-x-auto -mx-1 px-1 pb-1">
          <button 
            onClick={() => setActiveTab('active')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeTab === 'active' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            Active ({activeOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeTab === 'completed' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            Completed ({completedOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('cancelled')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeTab === 'cancelled' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            Cancelled ({cancelledOrders.length})
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Today</h2>
        </div>

        <div className="space-y-3">
          {displayedOrders.length > 0 ? (
            displayedOrders.map(order => {
              const totalItems = order.order_items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
              
              return (
                <button 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{order.order_number}</span>
                        <span className="text-xs text-slate-400 inline-flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> 
                          {getTimeElapsed(order.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-700">{order.customer_name}</p>
                      <p className="mt-0.5 text-xs text-slate-500 truncate">
                        {totalItems} items · {order.payment_method === 'Cash on Counter' ? 'Counter' : 'Online'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold tabular-nums">{formatCurrency(Number(order.total_amount))}</p>
                      <div className="mt-1">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                          {order.status === 'pending' ? 'new' : order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-medium text-slate-500">No {activeTab} orders</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-up Order Details Dialog */}
      {selectedOrder && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedOrder(null)}
          ></div>
          <div 
            role="dialog" 
            className="fixed z-50 gap-4 bg-white shadow-xl transition-all inset-x-0 bottom-0 border-t rounded-t-2xl p-0 max-h-[90dvh] overflow-y-auto animate-[slideUp_0.3s_ease-out] lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-lg lg:rounded-2xl lg:bottom-4 lg:border lg:animate-[fadeIn_0.3s_ease-out]"
          >
            <button 
              type="button" 
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 rounded-sm opacity-70 cursor-pointer transition-opacity hover:opacity-100 bg-slate-100 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
            <div className="flex flex-col">
              <div className="flex flex-col space-y-2 text-center sm:text-left px-6 pt-5 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-slate-900 text-xl text-left">Order {selectedOrder.order_number}</h2>
                    <p className="text-xs text-slate-500 mt-1 text-left">
                      {selectedOrder.customer_name} · {selectedOrder.payment_method === 'Cash on Counter' ? 'Counter' : 'Online'} · {getTimeElapsed(selectedOrder.created_at)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status === 'pending' ? 'new' : selectedOrder.status}
                  </span>
                </div>
              </div>
              <div className="px-6 pb-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 text-left">Items</p>
                <div className="space-y-3 mb-5">
                  {selectedOrder.order_items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                      <div className="flex gap-3">
                        <span className="font-medium text-slate-900">{item.quantity}x</span>
                        <span className="text-slate-700">{item.menu_item?.name}</span>
                      </div>
                      <span className="font-medium text-slate-900">{formatCurrency(Number(item.unit_price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-slate-50 p-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Payment Method</span>
                    <span className="font-medium">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className={`${selectedOrder.payment_status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'} font-semibold uppercase text-xs`}>
                      {selectedOrder.payment_status}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold mt-3 pt-3 border-t border-slate-200">
                    <span>Total</span>
                    <span>{formatCurrency(Number(selectedOrder.total_amount))}</span>
                  </div>
                </div>
              </div>
              
              {["pending", "preparing", "ready"].includes(selectedOrder.status) && (
                <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 grid grid-cols-2 gap-3 rounded-b-2xl">
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, "cancelled")}
                    className="h-12 rounded-xl border border-slate-200 font-bold text-sm text-red-600 active:bg-red-50 inline-flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg> 
                    Reject
                  </button>
                  <button 
                    onClick={() => {
                        const nextStatus = selectedOrder.status === 'pending' ? 'preparing' : selectedOrder.status === 'preparing' ? 'ready' : 'completed';
                        updateOrderStatus(selectedOrder.id, nextStatus);
                    }}
                    className="h-12 rounded-xl bg-slate-900 text-white font-bold text-sm active:bg-slate-800 inline-flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M20 6 9 17l-5-5"></path></svg> 
                    {selectedOrder.status === 'pending' ? 'Accept Order' : selectedOrder.status === 'preparing' ? 'Mark Ready' : 'Complete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </MerchantLayout>
  );
};
