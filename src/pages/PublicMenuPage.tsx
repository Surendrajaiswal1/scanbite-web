import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../services/api";
import type { MenuItem } from "../components/MenuItemList";
import { useCartStore } from "../store/cart";

interface BusinessProfile {
  shop_name: string;
  address: string;
  business_type: string;
  phone_number: string;
  is_store_open?: boolean;
}

const formatCurrency = (amount: number | string, currencyCode?: string | null) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode || "INR",
    minimumFractionDigits: 0,
  }).format(Number(amount));
};

export const PublicMenuPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { items, addItem, updateQuantity, shopSlug } = useCartStore();

  useEffect(() => {
    const fetchMenu = async () => {
      if (!slug) return;
      const response = await apiClient.getPublicMenu(slug);
      
      if (response.success && response.data) {
        setProfile(response.data.business_profile);
        setMenuItems(response.data.menu_items);
      } else {
        setError(response.message || "Menu not found");
      }
      setLoading(false);
    };

    fetchMenu();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col p-6 text-center">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Menu Unavailable</h1>
        <p className="text-slate-500">{error || "This menu doesn't exist or is currently offline."}</p>
      </div>
    );
  }

  if (!profile.is_store_open) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col p-6 text-center">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Store Closed</h1>
        <p className="text-slate-500">Sorry, we are currently not accepting orders. Please check back later.</p>
      </div>
    );
  }

  const categories = Array.from(new Set(menuItems.map(i => i.category)));
  
  // Calculate cart totals (only if cart belongs to this shop)
  const cartForThisShop = shopSlug === slug ? items : [];
  const cartItemCount = cartForThisShop.reduce((acc, item) => acc + item.cartQuantity, 0);
  const cartTotal = cartForThisShop.reduce((acc, item) => {
    const priceToUse = (item.discount && parseFloat(item.discount.toString()) > 0) ? item.final_price : item.price;
    return acc + (Number(priceToUse) * item.cartQuantity);
  }, 0);
  const displayCurrency = menuItems[0]?.currency || "INR";

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      {/* Clean Modern Header */}
      <div className="bg-white sticky top-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <div className="size-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-3xl shadow-sm shrink-0">
              {profile.shop_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0">{profile.shop_name}</h1>
              <p className="text-sm text-slate-500 m-0 mt-1">{profile.address || profile.business_type}</p>
            </div>
          </div>
          
          {/* Categories Scroller */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 hide-scrollbar">
            {categories.map((cat, i) => (
              <a 
                key={i} 
                href={`#cat-${cat}`}
                className="whitespace-nowrap px-4 py-1.5 bg-slate-50 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-10">
        {categories.map(category => {
          const itemsInCategory = menuItems.filter(i => i.category === category);
          
          return (
            <div key={category} id={`cat-${category}`} className="scroll-mt-48">
              <h2 className="text-xl font-bold text-slate-900 mb-5 m-0">{category}</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {itemsInCategory.map(item => {
                  const isDiscounted = item.discount && parseFloat(item.discount.toString()) > 0;
                  
                  // Check if in cart
                  const cartItem = cartForThisShop.find(i => i.id === item.id);
                  const isOutOfStock = Number(item.quantity) <= 0;
                  
                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row">
                      {/* Image Area */}
                      <div className="w-full sm:w-36 h-40 sm:h-auto shrink-0 bg-slate-100 relative group">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="size-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {isOutOfStock && (
                            <span className="bg-white/90 text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                              Sold Out
                            </span>
                        )}
                      </div>
                      
                      {/* Content Area */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-slate-900 leading-tight mb-1">{item.name}</h3>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                              {item.quantity} left
                            </span>
                          </div>
                          {item.description && <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>}
                        </div>
                        
                        <div className="mt-4 flex items-end justify-between gap-4">
                          <div className="flex flex-col">
                            {isDiscounted ? (
                              <>
                                <span className="text-xs text-slate-400 line-through decoration-slate-300">
                                  {formatCurrency(Number(item.price))}
                                </span>
                                <span className="text-lg font-bold text-slate-900 leading-none mt-0.5">
                                  {formatCurrency(Number(item.final_price))}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-slate-900 leading-none">
                                {formatCurrency(Number(item.price))}
                              </span>
                            )}
                          </div>
                          
                          {/* Add to Cart Controls */}
                          {!isOutOfStock && (
                            <div>
                              {cartItem ? (
                                <div className="flex items-center gap-3 bg-slate-50 rounded-full p-1 border border-slate-200">
                                  <button 
                                    onClick={() => updateQuantity(item.id, cartItem.cartQuantity - 1)}
                                    className="size-7 flex items-center justify-center rounded-full bg-white text-slate-700 shadow-sm active:scale-90 transition-transform"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
                                      <path d="M5 12h14"></path>
                                    </svg>
                                  </button>
                                  <span className="font-bold text-sm min-w-4 text-center text-slate-900">{cartItem.cartQuantity}</span>
                                  <button 
                                    onClick={() => {
                                      if (cartItem.cartQuantity < Number(item.quantity)) {
                                        updateQuantity(item.id, cartItem.cartQuantity + 1);
                                      }
                                    }}
                                    disabled={cartItem.cartQuantity >= Number(item.quantity)}
                                    className="size-7 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm disabled:opacity-50 active:scale-90 transition-transform"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
                                      <path d="M5 12h14"></path><path d="M12 5v14"></path>
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => addItem(item, slug!)}
                                  className="bg-indigo-50 text-indigo-700 font-bold text-sm px-5 py-2 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors active:scale-95"
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer */}
      <div className="text-center pb-20 pt-10">
        <p className="text-xs text-slate-400">Powered by ScanBite</p>
      </div>

      {/* Floating Cart Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <button 
            onClick={() => navigate(`/shop/${slug}/cart`)}
            className="w-full bg-slate-900 text-white shadow-xl shadow-slate-900/20 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-white/90">
                  <path d="M16 10a4 4 0 0 1-8 0"></path><path d="M3.103 6.034h17.794"></path><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"></path>
                </svg>
                <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                  {cartItemCount}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs text-white/70 font-medium">View Cart</span>
                <span className="font-bold">{formatCurrency(cartTotal, displayCurrency)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-white/50">
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
