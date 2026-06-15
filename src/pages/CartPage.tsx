import { useNavigate, useParams } from "react-router-dom";
import { useCartStore } from "../store/cart";

const formatCurrency = (amount: number | string, currencyCode?: string | null) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode || "INR",
  }).format(Number(amount));
};

export const CartPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, shopSlug } = useCartStore();

  // Redirect if cart belongs to a different shop or is empty
  if (items.length === 0 || (shopSlug && shopSlug !== slug)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-10 text-slate-300">
            <circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <button 
          onClick={() => navigate(`/shop/${slug}`)}
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => {
    const priceToUse = (item.discount && parseFloat(item.discount.toString()) > 0) ? item.final_price : item.price;
    return acc + (Number(priceToUse) * item.cartQuantity);
  }, 0);

  // Assuming currency is consistent across items
  const displayCurrency = items[0]?.currency || "INR";

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <button 
          onClick={() => navigate(`/shop/${slug}`)}
          className="size-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-slate-900">Your Cart</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {items.map((item) => {
          const isDiscounted = item.discount && parseFloat(item.discount.toString()) > 0;
          const price = isDiscounted ? item.final_price : item.price;

          return (
            <div key={item.id} className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-20 h-20 shrink-0 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="size-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2">{item.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400">
                      {item.quantity} available
                    </span>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 p-1 -mr-1 -mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                      <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-col">
                    {isDiscounted ? (
                      <>
                        <span className="text-[10px] text-slate-400 line-through decoration-slate-300">
                          {formatCurrency(item.price, displayCurrency)}
                        </span>
                        <span className="font-bold text-slate-900 leading-none mt-0.5">
                          {formatCurrency(price, displayCurrency)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-slate-900 leading-none">
                        {formatCurrency(price, displayCurrency)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 bg-slate-100 rounded-full px-2 py-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                      className="size-6 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm border border-slate-200 active:scale-90 transition-transform"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
                        <path d="M5 12h14"></path>
                      </svg>
                    </button>
                    <span className="font-bold text-sm min-w-4 text-center text-slate-900">{item.cartQuantity}</span>
                    <button 
                      onClick={() => {
                        if (item.cartQuantity < Number(item.quantity)) {
                          updateQuantity(item.id, item.cartQuantity + 1);
                        }
                      }}
                      disabled={item.cartQuantity >= Number(item.quantity)}
                      className="size-6 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm disabled:opacity-50 active:scale-90 transition-transform"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
                        <path d="M5 12h14"></path><path d="M12 5v14"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-8 md:pb-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="font-bold text-slate-500">Total</span>
            <span className="font-bold text-xl text-slate-900">{formatCurrency(subtotal, displayCurrency)}</span>
          </div>
          <button 
            onClick={() => navigate(`/shop/${slug}/checkout`)}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform flex justify-center items-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
