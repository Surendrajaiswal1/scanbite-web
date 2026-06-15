import { StoreStatusBadge } from "../components/merchant/StoreStatusBadge";
import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api";
import { MerchantLayout } from "../components/MerchantLayout";
import { HeaderActions } from "../components/merchant/HeaderActions";

interface Order {
  id: string | number;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  total_amount: string | number;
  status: string;
  created_at: string;
}

interface CustomerMetric {
  name: string;
  email: string;
  totalSpent: number;
  visits: number;
  lastVisit: Date;
  firstVisit: Date;
}

export const CustomersPage = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const ordersRes = await apiClient.getOrders();
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const customersData = useMemo(() => {
    const customerMap: Record<string, CustomerMetric> = {};

    orders.forEach(order => {
      // Use email as key if available, otherwise name. Default to 'Anonymous' if both empty.
      const rawEmail = order.customer_email?.trim() || "";
      const rawName = order.customer_name?.trim() || "";
      
      const key = rawEmail.toLowerCase() || rawName.toLowerCase() || "anonymous";
      if (key === "anonymous") return;

      const orderDate = new Date(order.created_at);
      const amount = Number(order.total_amount) || 0;

      if (!customerMap[key]) {
        customerMap[key] = {
          name: rawName || "Guest",
          email: rawEmail || "",
          totalSpent: 0,
          visits: 0,
          lastVisit: orderDate,
          firstVisit: orderDate
        };
      }

      const c = customerMap[key];
      c.totalSpent += amount;
      c.visits += 1;
      if (orderDate > c.lastVisit) c.lastVisit = orderDate;
      if (orderDate < c.firstVisit) c.firstVisit = orderDate;
    });

    const customersList = Object.values(customerMap);
    
    // Sort by total spent descending
    customersList.sort((a, b) => b.totalSpent - a.totalSpent);
    return customersList;
  }, [orders]);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  
  // Calculate top-level metrics
  const totalCustomers = customersData.length;
  const repeatCustomers = customersData.filter(c => c.visits > 1).length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newToday = customersData.filter(c => c.firstVisit >= today).length;

  const totalRevenue = customersData.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgSpend = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTimeElapsed = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff} days ago`;
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <MerchantLayout>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-2 min-w-0">
          <div>
            <h1 className="text-base font-semibold lg:text-lg truncate m-0">Customers</h1>
            <p className="text-[11px] text-slate-500 truncate m-0">{totalCustomers} known customers</p>
          </div>
          <StoreStatusBadge />
        </div>
        <HeaderActions />
      </header>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{totalCustomers}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Repeat</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{repeatCustomers}</p>
            <p className="mt-1 text-xs text-emerald-600">Loyal customers</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">New today</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{newToday}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg spend</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(avgSpend)}</p>
          </div>
        </section>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Top customers</h2>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
          {customersData.length > 0 ? (
            customersData.map((customer, index) => (
              <div key={index} className="flex items-center gap-3 p-3.5">
                <div className="size-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 font-bold grid place-items-center text-sm">
                  {getInitials(customer.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{customer.name}</p>
                  <p className="text-xs text-slate-500 truncate">{customer.email || "No email"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums">{formatCurrency(customer.totalSpent)}</p>
                  <p className="text-[11px] text-slate-500">
                    {customer.visits} {customer.visits === 1 ? 'visit' : 'visits'} · {getTimeElapsed(customer.lastVisit)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">No customers found.</div>
          )}
        </div>
      </div>
    </MerchantLayout>
  );
};
