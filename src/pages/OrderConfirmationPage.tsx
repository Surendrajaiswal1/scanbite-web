import { useLocation, useNavigate, useParams } from "react-router-dom";



export const OrderConfirmationPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { order, items } = location.state || {};

  if (!order || !items) {
    navigate(`/shop/${slug}`);
    return null;
  }

  const isPaid = order.payment_status === "Paid";

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center pt-16 px-4 pb-12">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-12">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-[var(--text-h)] mb-2">Order Confirmed!</h2>
      <p className="text-[var(--text)] mb-8 max-w-sm text-center">
        Your order has been sent to the kitchen.
      </p>

      <div className="w-full max-w-md bg-[var(--card-bg)] rounded-3xl p-6 shadow-sm border border-[var(--border)] space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-dashed border-[var(--border)]">
          <div>
            <p className="text-xs text-[var(--text)] uppercase tracking-wider mb-1">Order Number</p>
            <p className="font-bold text-[var(--text-h)] text-lg">{order.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text)] uppercase tracking-wider mb-1">Status</p>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700">
              Preparing
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-dashed border-[var(--border)]">
          <div>
            <p className="text-xs text-[var(--text)] uppercase tracking-wider mb-1">Payment Method</p>
            <p className="font-semibold text-[var(--text-h)]">{order.payment_method}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text)] uppercase tracking-wider mb-1">Payment Status</p>
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {order.payment_status}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-[var(--text)] uppercase tracking-wider mb-3">Order Summary</p>
          <div className="space-y-3">
            {items.map((item: { id: string | number; name: string; cartQuantity: number }) => (
              <div key={item.id} className="flex justify-between text-sm">
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center bg-[var(--background)] -mx-6 -mb-6 p-6 rounded-b-3xl">
        </div>
      </div>

      <button
        onClick={() => navigate(`/shop/${slug}`)}
        className="mt-10 bg-[var(--accent)] text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-[var(--accent)]\/20 active:scale-95 transition-transform w-full max-w-md"
      >
        Back to Menu
      </button>
    </div>
  );
};
