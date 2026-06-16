import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api";
import { MenuItemForm } from "../components/MenuItemForm";
import type { MenuItem } from "../components/MenuItemList";
import { useNavigate } from "react-router-dom";
import { CsvUpload } from "../components/CsvUpload";

export const MenuSetupPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-h)] mb-3">Step 2: Add Menu Items</h1>
          <p className="text-[var(--text)]">
            Add at least one item to your menu so customers can start ordering. You can always add more later from your dashboard.
          </p>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl shadow-xl shadow-black/5 border border-[var(--border)] p-6 sm:p-8 mb-6">
          {items.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Items Added</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl text-slate-400">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.price} {item.currency || 'INR'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><path d="m7.5 4.27 9 5.15"></path></svg>
              </div>
              <p className="text-slate-500 font-medium">Your menu is currently empty.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 border-2 border-dashed border-slate-300 hover:border-[var(--accent)] hover:bg-indigo-50 text-slate-600 hover:text-[var(--accent)] font-semibold py-4 rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
              Add an Item
            </button>
            <button 
              onClick={() => setIsCsvModalOpen(true)}
              className="flex-1 border-2 border-dashed border-slate-300 hover:border-[var(--accent)] hover:bg-indigo-50 text-slate-600 hover:text-[var(--accent)] font-semibold py-4 rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
              Upload CSV
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate("/store-preview")}
          className="w-full bg-[var(--accent)] hover:opacity-90 text-white font-medium py-3.5 rounded-xl transition duration-200 shadow-lg shadow-[var(--accent)]/20"
        >
          {items.length > 0 ? "Continue to Preview" : "Skip for now"}
        </button>

      </div>

      {isModalOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <MenuItemForm 
            onSuccess={() => {
              fetchItems();
              setIsModalOpen(false);
            }} 
            onClose={() => setIsModalOpen(false)} 
          />
        </>
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
    </div>
  );
};
