import { StoreStatusBadge } from "../components/merchant/StoreStatusBadge";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { QRCodeSVG } from "qrcode.react";
import { apiClient } from "../services/api";
import { MerchantLayout } from "../components/MerchantLayout";
import { HeaderActions } from "../components/merchant/HeaderActions";

interface MenuItem {
  id: string | number;
  name: string;
  category?: string;
  quantity: string | number;
  image_url?: string;
}

interface OrderItem {
  id: string | number;
  quantity: number;
  menu_item?: MenuItem;
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
  notes?: string;
  order_items?: OrderItem[];
}

interface DashboardProfile {
  shop_name: string;
  business_slug: string;
  address?: string;
  store_views?: number;
  menu_items?: unknown[];
}

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const fetchData = async () => {
      const [profileRes, menuRes, ordersRes] = await Promise.all([
        apiClient.getBusinessProfile(),
        apiClient.getMenuItems(),
        apiClient.getOrders(),
      ]);

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      }
      if (menuRes.success && menuRes.data) {
        setMenuItems(menuRes.data);
      }
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const updateOrderStatus = async (
    orderId: string | number,
    newStatus: string,
  ) => {
    const res = await apiClient.updateOrder(orderId, newStatus);
    if (res.success && res.data) {
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const shopName = profile?.shop_name || user.full_name;
  const businessSlug = profile?.business_slug || "";
  const publicUrl = businessSlug
    ? `${window.location.origin}/shop/${businessSlug}`
    : "";

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
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
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };
  // Metrics Calculations
  const paidOrders = orders.filter((o) => o.payment_status === "Paid");
  const totalRevenue = paidOrders.reduce(
    (acc, o) => acc + Number(o.total_amount),
    0,
  );
  const activeOrdersCount = orders.filter((o) =>
    ["pending", "preparing", "ready"].includes(o.status),
  ).length;
  const avgSpend = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  const todayRevenue = paidOrders
    .filter(
      (o) =>
        new Date(o.created_at).toDateString() === new Date(now).toDateString(),
    )
    .reduce((acc, o) => acc + Number(o.total_amount), 0);
  const yesterdayRevenue = paidOrders
    .filter(
      (o) =>
        new Date(o.created_at).toDateString() ===
        new Date(now - 86400000).toDateString(),
    )
    .reduce((acc, o) => acc + Number(o.total_amount), 0);
  const revenuePercent =
    yesterdayRevenue === 0
      ? todayRevenue > 0
        ? 100
        : 0
      : Math.round(
        ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100,
      );
  const isPositive = revenuePercent >= 0;

  const lowStockItems = menuItems.filter((item) => Number(item.quantity) < 10);

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
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <MerchantLayout>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-2 min-w-0">
          <div>
            <h1 className="text-base font-semibold lg:text-lg truncate m-0">
              Today's Activity
            </h1>
            <p className="text-[11px] text-slate-500 truncate m-0">
              {shopName} · {profile?.address || "HQ"}
            </p>
          </div>
          <StoreStatusBadge />
        </div>
        <HeaderActions />
      </header>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Revenue
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {formatCurrency(totalRevenue)}
            </p>
            <p
              className={`mt-1 text-xs ${isPositive ? "text-emerald-600" : "text-red-600"}`}
            >
              {isPositive ? "+" : ""}
              {revenuePercent}% vs yesterday
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Active Orders
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {activeOrdersCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Store Scans
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {profile?.store_views || 0}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Avg Spend
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {formatCurrency(avgSpend)}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Live Orders
              </h2>
            </div>
            <div className="space-y-3">
              {orders.filter((o) =>
                ["pending", "preparing", "ready"].includes(o.status),
              ).length > 0 ? (
                orders
                  .filter((o) =>
                    ["pending", "preparing", "ready"].includes(o.status),
                  )
                  .map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">
                              {order.order_number}
                            </span>
                            <span className="text-xs text-slate-400">
                              {getTimeElapsed(order.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium text-slate-700 truncate">
                            {order.order_items
                              ?.map(
                                (i) => `${i.quantity}x ${i.menu_item?.name}`,
                              )
                              .join(", ")}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {order.customer_name} ·{" "}
                            {formatCurrency(Number(order.total_amount))} ·{" "}
                            {order.payment_method}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}
                        >
                          {order.status === "pending" ? "new" : order.status}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        {order.status === "pending" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "preparing")
                            }
                            className="flex-1 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white shadow-sm active:scale-95 transition-transform"
                          >
                            Accept
                          </button>
                        )}
                        {order.status === "preparing" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "ready")
                            }
                            className="flex-1 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white shadow-sm active:scale-95 transition-transform"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === "ready" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "completed")
                            }
                            className="flex-1 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white shadow-sm active:scale-95 transition-transform"
                          >
                            Complete Pickup
                          </button>
                        )}
                        <a
                          href="/orders"
                          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center"
                        >
                          Details
                        </a>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    No active orders
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Digital Storefront</h3>
              </div>
              <div className="flex justify-center mb-6">
                <div className="size-48 rounded-xl bg-white p-3 flex items-center justify-center">
                  {publicUrl ? (
                    <QRCodeSVG
                      id="menu-qr-code"
                      value={publicUrl}
                      size={160}
                      level="H"
                      includeMargin={true}
                    />
                  ) : (
                    <div className="text-slate-400 text-xs">
                      Generating...
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full rounded-lg bg-white py-2.5 text-sm font-bold text-slate-900 inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line>
                    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
                  </svg>
                  Share Store Link
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="w-full rounded-lg border border-white/20 py-2.5 text-sm font-bold text-white inline-flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"></path>
                    <rect x="6" y="14" width="12" height="8" rx="1"></rect>
                  </svg>
                  Print Flyer
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Inventory Alerts
                </h2>
              </div>
              <div className="space-y-4">
                {lowStockItems.length > 0 ? (
                  lowStockItems.slice(0, 5).map((item) => {
                    const isOutOfStock = Number(item.quantity) <= 0;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold flex items-center gap-2">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="size-6 rounded object-cover"
                              />
                            ) : (
                              <span className="text-lg w-6 flex justify-center">
                                {item.category
                                  ?.toLowerCase()
                                  .includes("drink") ||
                                  item.category
                                    ?.toLowerCase()
                                    .includes("beverage")
                                  ? "🧊"
                                  : item.category
                                    ?.toLowerCase()
                                    .includes("dessert")
                                    ? "🍰"
                                    : "📦"}
                              </span>
                            )}
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {isOutOfStock
                              ? "Out of stock"
                              : `${item.quantity} units left`}
                          </p>
                        </div>
                        {isOutOfStock ? (
                          <a
                            href="/menu-setup"
                            className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider"
                          >
                            Update
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="size-3"
                            >
                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
                              <path d="M12 9v4"></path>
                              <path d="M12 17h.01"></path>
                            </svg>
                            Low
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <span className="text-lg w-6 flex justify-center">✨</span>All items
                      </p>
                      <p className="text-xs text-slate-500">
                        Your items are stocked.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </MerchantLayout>
  );
};
