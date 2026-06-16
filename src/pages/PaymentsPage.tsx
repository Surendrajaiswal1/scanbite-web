import { StoreStatusBadge } from "../components/merchant/StoreStatusBadge";
import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api";
import { MerchantLayout } from "../components/MerchantLayout";
import { HeaderActions } from "../components/merchant/HeaderActions";

interface Order {
  id: string | number;
  order_number: string;
  total_amount: string | number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
}

export const PaymentsPage = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const ordersRes = await apiClient.getOrders();
    if (ordersRes.success && ordersRes.data) {
      setOrders(ordersRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkPaid = async (orderId: string | number) => {
    const res = await apiClient.updateOrder(orderId, undefined, "Paid");
    if (res.success) {
      fetchData(); // Refresh the list
    }
  };

  const {
    earned,
    pendingPayout,
    successfulCount,
    failedCount,
    transactions,
  } = useMemo(() => {
    let earnedTotal = 0;
    let pendingTotal = 0;
    let successCount = 0;
    let failCount = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const txs: any[] = [];

    orders.forEach((order) => {
      const amount = Number(order.total_amount) || 0;
      const paymentStatus = order.payment_status?.toLowerCase() || "pending";
      const status = order.status?.toLowerCase() || "pending";
      const orderDate = new Date(order.created_at);

      if (orderDate >= today) {
        // Count as successful if paid or completed
        if (paymentStatus === "paid" || paymentStatus === "success" || status === "completed") {
          earnedTotal += amount;
          successCount++;
        } else if (paymentStatus === "failed" || status === "cancelled") {
          failCount++;
        } else if (paymentStatus === "pending") {
          pendingTotal += amount;
        }

        txs.push(order);
      }
    });

    // Sort transactions by most recent
    txs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      earned: earnedTotal,
      pendingPayout: pendingTotal,
      successfulCount: successCount,
      failedCount: failCount,
      transactions: txs,
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
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPaymentStatusDisplay = (paymentStatus: string, orderStatus: string) => {
    const ps = paymentStatus?.toLowerCase() || "pending";
    const os = orderStatus?.toLowerCase() || "pending";
    if (ps === "paid" || ps === "success" || os === "completed") return "success";
    if (ps === "failed" || os === "cancelled") return "failed";
    if (ps === "refunded") return "refunded";
    return "pending";
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ["Order Number", "Date", "Time", "Payment Method", "Amount", "Status"];
    const rows = transactions.map(t => {
      const d = new Date(t.created_at);
      const dateStr = d.toLocaleDateString();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return [
        t.order_number || `Order #${t.id}`,
        dateStr,
        timeStr,
        t.payment_method || "Card",
        t.total_amount,
        getPaymentStatusDisplay(t.payment_status, t.status)
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MerchantLayout>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-2 min-w-0">
          <div>
            <h1 className="text-base font-semibold lg:text-lg truncate m-0">Payments</h1>
            <p className="text-[11px] text-slate-500 truncate m-0">Today</p>
          </div>
          <StoreStatusBadge />
        </div>
        <HeaderActions />
      </header>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Earned</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(earned)}</p>
            <p className="mt-1 text-xs text-emerald-600">Net of refunds</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Pending payout</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(pendingPayout)}</p>
            <p className="mt-1 text-xs text-amber-600">Settles tomorrow</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Successful</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{successfulCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Failed</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{failedCount}</p>
          </div>
        </section>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Transactions</h2>
          <button onClick={handleExportCSV} className="text-xs font-semibold text-indigo-600">Export CSV</button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
          {transactions.length > 0 ? (
            transactions.map((tx) => {
              const displayStatus = getPaymentStatusDisplay(tx.payment_status, tx.status);
              const amount = Number(tx.total_amount) || 0;
              const method = tx.payment_method || "Card";

              return (
                <div key={tx.id} className="flex items-center gap-3 p-3.5">
                  <div className={`size-9 rounded-full grid place-items-center ${displayStatus === 'refunded'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-emerald-50 text-emerald-600'
                    }`}>
                    {displayStatus === 'refunded' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m7 7 10 10"></path><path d="M17 7v10H7"></path></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{tx.order_number || `Order #${tx.id}`}</p>
                    <p className="text-xs text-slate-500 truncate">{method} · {formatTime(tx.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {displayStatus === 'pending' && tx.payment_method === "Cash on Counter" && (
                      <button 
                        onClick={() => handleMarkPaid(tx.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-xs font-bold active:scale-95 shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Mark Paid
                      </button>
                    )}
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold tabular-nums ${displayStatus === 'failed' ? 'text-red-500' : displayStatus === 'refunded' ? 'text-slate-500 line-through' : ''
                        }`}>
                        {formatCurrency(amount)}
                      </p>
                      {displayStatus === 'success' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-1 block">Paid</span>
                      )}
                      {displayStatus === 'pending' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mt-1 block">Pending</span>
                      )}
                      {displayStatus === 'failed' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 mt-1 block">Failed</span>
                      )}
                      {displayStatus === 'refunded' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1 block">Refunded</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">No transactions found.</div>
          )}
        </div>
      </div>
    </MerchantLayout>
  );
};
