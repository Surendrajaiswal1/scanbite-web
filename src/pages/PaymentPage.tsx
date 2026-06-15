import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCartStore } from "../store/cart";
import { apiClient } from "../services/api";
import { QRCodeSVG } from "qrcode.react";

const formatCurrency = (amount: number | string, currencyCode?: string | null) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode || "INR",
  }).format(Number(amount));
};

export const PaymentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { items, clearCart, shopSlug, customerDetails } = useCartStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Cash on Counter" | "Online Payment">("Cash on Counter");
  const [upiScreen, setUpiScreen] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [merchantProfile, setMerchantProfile] = useState<any>(null);

  const [clickedPay, setClickedPay] = useState(false);

  // Simulate webhook auto-redirect when returning from UPI app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && clickedPay && !isSubmitting) {
        // User returned to the browser after opening the UPI app
        handleUpiSuccess();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [clickedPay, isSubmitting]);

  useEffect(() => {
    if (slug) {
      apiClient.getPublicMenu(slug).then(res => {
        if (res.success && res.data) {
          setMerchantProfile(res.data.business_profile);
        }
      });
    }
  }, [slug]);

  useEffect(() => {
    if (items.length === 0 || (shopSlug && shopSlug !== slug)) {
      navigate(`/shop/${slug}`);
    } else if (!customerDetails.name || !customerDetails.phone) {
      navigate(`/shop/${slug}/checkout`);
    }
  }, [items.length, shopSlug, slug, navigate, customerDetails]);

  if (items.length === 0 || (shopSlug && shopSlug !== slug) || !customerDetails.name) return null;

  const subtotal = items.reduce((acc, item) => {
    const priceToUse = (item.discount && parseFloat(item.discount.toString()) > 0) ? item.final_price : item.price;
    return acc + (Number(priceToUse) * item.cartQuantity);
  }, 0);

  const displayCurrency = items[0]?.currency || "INR";

  const handlePlaceOrder = async (status: string = "Pending") => {
    setIsSubmitting(true);
    setPaymentError(null);
    
    try {
      const orderItems = items.map(i => ({ id: i.id, quantity: i.cartQuantity }));
      const response = await apiClient.createOrder(
        slug!, 
        orderItems, 
        customerDetails,
        paymentMethod,
        status
      );
      
      if (response.success && response.order) {
        clearCart();
        navigate(`/shop/${slug}/confirmation`, { state: { order: response.order, items: items } });
      } else {
        setPaymentError(response.message || "Failed to place order.");
        if (paymentMethod === "Online Payment") setUpiScreen(false);
      }
    } catch (err) {
      console.error(err);
      setPaymentError("An error occurred while placing your order.");
      if (paymentMethod === "Online Payment") setUpiScreen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onProceed = () => {
    if (paymentMethod === "Online Payment") {
      setUpiScreen(true);
    } else {
      handlePlaceOrder("Pending"); // Cash on counter
    }
  };

  const handleUpiSuccess = () => {
    handlePlaceOrder("Paid");
  };

  const handleUpiFail = () => {
    setUpiScreen(false);
    setPaymentError("Payment failed or was cancelled. Please try again.");
  };

  if (upiScreen) {
    const upiId = merchantProfile?.upi_id || "";
    const shopName = merchantProfile?.shop_name || "ScanBite Shop";
    
    // Construct the UPI Intent URI
    // Format: upi://pay?pa=UPI_ID&pn=PAYEE_NAME&am=AMOUNT&cu=INR&tn=TRANSACTION_NOTE
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shopName)}&am=${subtotal}&cu=INR&tn=${encodeURIComponent(`Order at ${shopName}`)}`;

    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-[var(--card-bg)] p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden border border-[var(--border)]">
          {isSubmitting && (
            <div className="absolute inset-0 bg-[var(--card-bg)]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
               <div className="size-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
               <p className="mt-4 font-semibold text-[var(--text-h)]">Verifying Payment...</p>
            </div>
          )}
          
          <h2 className="text-xl font-bold text-[var(--text-h)] mb-1">Pay via UPI</h2>
          <p className="text-[var(--text)] mb-6 text-sm">Scan QR code or use a UPI app</p>
          
          {upiId ? (
            <div className="bg-white p-4 rounded-2xl mb-6 inline-block mx-auto border-2 border-[var(--border)] shadow-sm">
              <QRCodeSVG value={upiUri} size={200} level="H" includeMargin={true} />
            </div>
          ) : (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm mb-6 border border-red-500/50">
              Merchant has not configured a UPI ID.
            </div>
          )}

          <div className="text-3xl font-black text-[var(--accent)] mb-8">
            {formatCurrency(subtotal, displayCurrency)}
          </div>
          
          <div className="space-y-3">
            {upiId && (
              <a 
                href={upiUri}
                onClick={() => setClickedPay(true)}
                className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-bold py-3 rounded-xl shadow-lg active:scale-[0.98] transition-transform"
              >
                Pay with UPI App
              </a>
            )}
            
            {clickedPay ? (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-[var(--text)] font-medium">
                <div className="size-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                Waiting for payment confirmation...
              </div>
            ) : (
              <button 
                onClick={handleUpiSuccess}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg active:scale-[0.98] transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Confirm Payment
              </button>
            )}

            <button 
              onClick={handleUpiFail}
              className="w-full bg-[var(--background)] text-[var(--text-h)] font-bold py-3 rounded-xl active:scale-[0.98] transition-transform mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">
      <header className="sticky top-0 z-30 bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center justify-between">
        <button 
          onClick={() => navigate(`/shop/${slug}/checkout`)}
          className="size-10 flex items-center justify-center rounded-full bg-[var(--background)] text-[var(--text)] active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[var(--text-h)]">Review & Payment</h1>
        <div className="w-10"></div>
      </header>

      <div className="p-4 max-w-2xl mx-auto mt-2 space-y-6">
        
        {paymentError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-200 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
            <p>{paymentError}</p>
          </div>
        )}

        {/* Review Customer Details */}
        <div className="bg-[var(--card-bg)] p-5 rounded-2xl shadow-sm border border-[var(--border)] relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[var(--text-h)]">Your Details</h2>
            <button onClick={() => navigate(`/shop/${slug}/checkout`)} className="text-[var(--accent)] text-sm font-semibold">Edit</button>
          </div>
          <div className="space-y-2 text-sm text-[var(--text)]">
          </div>
        </div>

        {/* Review Order Summary */}
        <div className="bg-[var(--card-bg)] p-5 rounded-2xl shadow-sm border border-[var(--border)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[var(--text-h)]">Order Summary</h2>
            <button onClick={() => navigate(`/shop/${slug}/cart`)} className="text-[var(--accent)] text-sm font-semibold">Edit</button>
          </div>
          <div className="space-y-3 mb-4">
            {items.map(item => {
              const originalPrice = Number(item.price);
              const hasDiscount = item.discount && parseFloat(item.discount.toString()) > 0;
              const discountedPrice = hasDiscount ? Number(item.final_price) : originalPrice;
              const itemTotal = discountedPrice * item.cartQuantity;

              return (
                <div key={item.id} className="flex justify-between text-sm items-center">
                  <span className="text-[var(--text)] flex-1 truncate pr-4">
                    {item.cartQuantity}x {item.name}
                  </span>
                  <span className="font-medium text-[var(--text-h)]">
                    {formatCurrency(itemTotal, item.currency)}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center">
            <span className="font-bold text-[var(--text-h)]">Total</span>
            <span className="font-bold text-lg text-[var(--text-h)]">{formatCurrency(subtotal, items[0]?.currency || 'INR')}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-[var(--card-bg)] p-5 rounded-2xl shadow-sm border border-[var(--border)] mb-20">
          <h2 className="font-bold text-[var(--text-h)] mb-4">Payment Method</h2>
          
          <div className="space-y-3">
            <label 
              className={`cursor-pointer border p-4 rounded-xl flex items-center gap-4 transition-all ${paymentMethod === 'Cash on Counter' ? 'border-[var(--accent)] bg-indigo-50/50' : 'border-[var(--border)]'}`}
              onClick={() => setPaymentMethod("Cash on Counter")}
            >
              <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'Cash on Counter' ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
                {paymentMethod === 'Cash on Counter' && <div className="size-2.5 rounded-full bg-[var(--accent)]"></div>}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-h)] text-sm">Cash on Counter</p>
                <p className="text-xs text-[var(--text)]">Pay when you pick up your order</p>
              </div>
            </label>

            <label 
              className={`cursor-pointer border p-4 rounded-xl flex items-center gap-4 transition-all ${paymentMethod === 'Online Payment' ? 'border-[var(--accent)] bg-indigo-50/50' : 'border-[var(--border)]'}`}
              onClick={() => setPaymentMethod("Online Payment")}
            >
              <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'Online Payment' ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
                {paymentMethod === 'Online Payment' && <div className="size-2.5 rounded-full bg-[var(--accent)]"></div>}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-h)] text-sm">Online Payment</p>
                <p className="text-xs text-[var(--text)]">Pay securely via UPI / Cards</p>
              </div>
            </label>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-[var(--card-bg)] border-t border-[var(--border)] p-4 pb-8 md:pb-4 z-40">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={onProceed}
              disabled={isSubmitting}
              className="w-full bg-[var(--accent)] text-white font-bold py-4 rounded-xl shadow-lg shadow-[var(--accent)]\/20 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </>
              ) : (
                <span className="font-bold">Place Order</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
