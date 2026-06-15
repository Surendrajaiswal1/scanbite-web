import { useAuthStore } from "../../store/auth";

export const StoreStatusBadge = () => {
  const { user } = useAuthStore();
  const isOpen = user?.is_store_open ?? true;

  if (isOpen) {
    return (
      <span className="ml-2 flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-100">
        <span className="size-1.5 rounded-full bg-emerald-500"></span>Store Open
      </span>
    );
  }

  return (
    <span className="ml-2 flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border bg-rose-50 text-rose-700 border-rose-100">
      <span className="size-1.5 rounded-full bg-rose-500"></span>Store Closed
    </span>
  );
};
