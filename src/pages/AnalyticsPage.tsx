import { StoreStatusBadge } from "../components/merchant/StoreStatusBadge";
import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api";
import { MerchantLayout } from "../components/MerchantLayout";
import { HeaderActions } from "../components/merchant/HeaderActions";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface MenuItem {
  id: string | number;
  name: string;
}

interface OrderItem {
  id: string | number;
  quantity: number;
  menu_item?: MenuItem;
}

interface Order {
  id: string | number;
  total_amount: string | number;
  status: string;
  payment_status: string;
  created_at: string;
  order_items?: OrderItem[];
}

export const AnalyticsPage = () => {
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

  const {
    revenue,
    orderCount,
    avgTicket,
    peakHour,
    dailyRevenueData,
    hourlyOrdersData,
    bestSellers,
  } = useMemo(() => {
    const now = new Date();
    // last 7 days
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let rev = 0;
    let ordCount = 0;
    const hourCounts: Record<number, number> = {};
    const itemSales: Record<string, { count: number; name: string }> = {};

    // For charts
    const dailyRevMap: Record<string, number> = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      dailyRevMap[days[d.getDay()]] = 0;
    }

    orders.forEach((order) => {
      const orderDate = new Date(order.created_at);
      if (orderDate >= sevenDaysAgo && (order.status === "completed" || order.payment_status === "Paid")) {
        const amount = Number(order.total_amount) || 0;
        rev += amount;
        ordCount++;

        const hour = orderDate.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;

        const dayName = days[orderDate.getDay()];
        if (dailyRevMap[dayName] !== undefined) {
          dailyRevMap[dayName] += amount;
        }

        if (order.order_items) {
          order.order_items.forEach((item) => {
            const name = item.menu_item?.name || "Unknown Item";
            if (!itemSales[name]) itemSales[name] = { count: 0, name };
            itemSales[name].count += item.quantity || 1;
          });
        }
      }
    });

    let peakHr = "N/A";
    let maxOrdersInHr = 0;
    for (const [hStr, count] of Object.entries(hourCounts)) {
      if (count > maxOrdersInHr) {
        maxOrdersInHr = count;
        const h = parseInt(hStr);
        peakHr = h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
      }
    }

    // Sort days chronologically based on today
    const dailyData: { name: string; value: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dName = days[d.getDay()];
      dailyData.push({ name: dName, value: dailyRevMap[dName] });
    }

    // Hourly Data (e.g. 7 AM to 10 PM)
    const hourlyData: { name: string; orders: number }[] = [];
    for (let h = 7; h <= 22; h++) {
      const displayH = h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`;
      hourlyData.push({ name: displayH, orders: hourCounts[h] || 0 });
    }

    // Best Sellers
    const bSellers = Object.values(itemSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      revenue: rev,
      orderCount: ordCount,
      avgTicket: ordCount > 0 ? rev / ordCount : 0,
      peakHour: peakHr,
      dailyRevenueData: dailyData,
      hourlyOrdersData: hourlyData,
      bestSellers: bSellers,
    };
  }, [orders]);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getEmojiForName = (name: string) => {
    const lName = name.toLowerCase();
    if (lName.includes("latte") || lName.includes("milk") || lName.includes("boba")) return "🧋";
    if (lName.includes("cold") || lName.includes("ice")) return "🧊";
    if (lName.includes("matcha") || lName.includes("tea")) return "🍵";
    if (lName.includes("coffee") || lName.includes("espresso") || lName.includes("brew") || lName.includes("white")) return "☕";
    if (lName.includes("cake") || lName.includes("pastry") || lName.includes("muffin")) return "🧁";
    if (lName.includes("sandwich") || lName.includes("burger")) return "🥪";
    return "🍽️";
  };

  const maxBestSellerCount = bestSellers.length > 0 ? bestSellers[0].count : 1;

  return (
    <MerchantLayout>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-2 min-w-0">
          <div>
            <h1 className="text-base font-semibold lg:text-lg truncate m-0">Analytics</h1>
            <p className="text-[11px] text-slate-500 truncate m-0">Last 7 days</p>
          </div>
          <StoreStatusBadge />
        </div>
        <HeaderActions />
      </header>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Revenue</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(revenue)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Orders</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{orderCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg Ticket</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(avgTicket)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Peak Hour</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{peakHour}</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Daily Revenue</h2>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyRevenueData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), "Revenue"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#revGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Orders by Hour</h2>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyOrdersData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
                    cursor={{ fill: "#f1f5f9" }}
                  />
                  <Bar dataKey="orders" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Best Sellers</h2>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {bestSellers.length > 0 ? (
              bestSellers.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-slate-100 grid place-items-center text-xl">
                    {getEmojiForName(item.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(item.count / maxBestSellerCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm font-bold tabular-nums w-12 text-right">{item.count}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">No items sold recently.</div>
            )}
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
};
