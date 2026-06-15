import { StoreStatusBadge } from "../components/merchant/StoreStatusBadge";
import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api";
import { MenuItemForm } from "../components/MenuItemForm";
import { CsvUpload } from "../components/CsvUpload";
import { MerchantLayout } from "../components/MerchantLayout";
import { HeaderActions } from "../components/merchant/HeaderActions";
import type { MenuItem } from "../components/MenuItemList";

export const MenuItemsPage = () => {
  const { user } = useAuthStore();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const fetchItems = async () => {
    const response = await apiClient.getMenuItems();
    if (response.success && response.data) {
      setItems(response.data);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchItems();
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const response = await apiClient.deleteMenuItem(id);
      if (response.success) {
        fetchItems();
      } else {
        alert(response.message || "Failed to delete item");
      }
    }
  };

  const formatCurrency = (amount: number, currency?: string | null) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
    }).format(amount);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) || 
      item.category.toLowerCase().includes(lowerQuery)
    );
  }, [items, searchQuery]);

  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const cat = item.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [filteredItems]);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const liveCount = items.filter(i => Number(i.quantity) > 0).length;

  return (
    <MerchantLayout>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-2 min-w-0">
          <div>
            <h1 className="text-base font-semibold lg:text-lg truncate m-0">Menu</h1>
            <p className="text-[11px] text-slate-500 truncate m-0">{items.length} items · {liveCount} live</p>
          </div>
          <StoreStatusBadge />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCsvModalOpen(true)}
            className="hidden lg:inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 text-slate-700 px-3 py-2 text-sm font-semibold active:scale-95 transition-transform hover:bg-slate-50"
          >
            Upload CSV
          </button>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="hidden lg:inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-semibold active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg> 
            Add item
          </button>
          <HeaderActions />
        </div>
      </header>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <div className="relative mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
          <input 
            placeholder="Search items" 
            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          {Object.keys(groupedItems).length > 0 ? (
            Object.entries(groupedItems).map(([category, catItems]) => (
              <section key={category}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">{category}</h2>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
                  {catItems.map(item => {
                    const isActive = Number(item.quantity) > 0;
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3.5">
                        <div className="size-12 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-2xl overflow-hidden border border-slate-100">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">
                              {category.toLowerCase().includes("drink") || category.toLowerCase().includes("beverage") ? "🧊" : 
                               category.toLowerCase().includes("dessert") ? "🍰" : "📦"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            {item.discount && parseFloat(item.discount.toString()) > 0 ? (
                              <>
                                <span className="line-through text-slate-400 mr-1.5">{formatCurrency(Number(item.price), item.currency)}</span>
                                <span className="font-bold text-slate-700">{formatCurrency(Number(item.final_price), item.currency)}</span>
                              </>
                            ) : (
                              formatCurrency(Number(item.price), item.currency)
                            )}
                            {!isActive ? (
                              <span className="ml-2 text-red-500 font-semibold">• Out of stock</span>
                            ) : Number(item.quantity) < 10 ? (
                              <span className="ml-2 text-amber-500 font-medium">• Only {item.quantity} left</span>
                            ) : null}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleEdit(item)}
                          className="size-9 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" 
                          aria-label="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
                        </button>
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={isActive}
                          data-state={isActive ? "checked" : "unchecked"}
                          value="on"
                          className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        >
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-medium text-slate-500">No items found</p>
              {!searchQuery && (
                <button 
                  onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-semibold active:scale-95 transition-transform"
                >
                  Add your first item
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <MenuItemForm 
          onSuccess={fetchItems} 
          itemToEdit={editingItem} 
          onClose={() => setIsModalOpen(false)} 
          onDelete={(id) => { handleDelete(id); setIsModalOpen(false); }}
        />
      )}

      {isCsvModalOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCsvModalOpen(false)}
          ></div>
          <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Upload Bulk Items</h3>
              <button onClick={() => setIsCsvModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
              </button>
            </div>
            <CsvUpload onSuccess={() => { fetchItems(); setIsCsvModalOpen(false); }} />
          </div>
        </>
      )}
    </MerchantLayout>
  );
};
