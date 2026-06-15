export interface MenuItem {
  id: number;
  name: string;
  category: string;
  description: string | null;
  quantity: number;
  price: string | number;
  discount: string | number | null;
  final_price: string | number;
  image_url: string | null;
  currency?: string;
}

const formatCurrency = (amount: number | string, currencyCode?: string | null) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode || "INR",
  }).format(Number(amount));
};

interface MenuItemListProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}

export const MenuItemList = ({ items, onEdit, onDelete }: MenuItemListProps) => {
  if (items.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-xl shadow-black/10 border border-[var(--border)] p-8 text-center mt-8">
        <div className="w-16 h-16 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border)]">
          <svg className="w-8 h-8 text-[var(--text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[var(--text-h)] mb-2">No menu items yet</h3>
        <p className="text-[var(--text)] text-sm">
          Add some items manually or upload a CSV to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-[var(--text-h)] mb-4">Your Menu Items ({items.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] overflow-hidden flex shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-[var(--background)] flex items-center justify-center border-r border-[var(--border)]">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8 text-[var(--text)] opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[var(--text-h)] line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-[var(--accent)] font-medium mb-1">{item.category}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(item)} className="p-1.5 text-[var(--text)] hover:text-[var(--accent)] bg-[var(--background)] rounded-lg transition-colors" title="Edit">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-1.5 text-[var(--text)] hover:text-red-500 bg-[var(--background)] rounded-lg transition-colors" title="Delete">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                {item.description && <p className="text-sm text-[var(--text)] line-clamp-2 mt-1">{item.description}</p>}
              </div>
              
              <div className="flex justify-between items-end mt-2">
                <span className="text-xs text-[var(--text)]">Qty: {item.quantity}</span>
                <div className="text-right">
                  {item.discount && parseFloat(item.discount.toString()) > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[var(--text)] line-through">{formatCurrency(item.price, item.currency)}</span>
                      <span className="font-bold text-[var(--text-h)]">{formatCurrency(item.final_price, item.currency)}</span>
                    </div>
                  ) : (
                    <span className="font-bold text-[var(--text-h)]">{formatCurrency(item.price, item.currency)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
