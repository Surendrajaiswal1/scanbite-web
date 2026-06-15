import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type MenuItemFormType, menuItemSchema } from "../utils/validation";
import { apiClient } from "../services/api";
import type { MenuItem } from "./MenuItemList";

interface MenuItemFormProps {
  onSuccess?: () => void;
  itemToEdit?: MenuItem | null;
  onClose: () => void;
  onDelete?: (id: number) => void;
}

export const MenuItemForm = ({ onSuccess, itemToEdit, onClose, onDelete }: MenuItemFormProps) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormType>({
    resolver: zodResolver(menuItemSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (itemToEdit) {
      setValue("name", itemToEdit.name);
      setValue("category", itemToEdit.category);
      if (itemToEdit.description) setValue("description", itemToEdit.description);
      setValue("quantity", itemToEdit.quantity);
      setValue("price", parseFloat(itemToEdit.price.toString()));
      if (itemToEdit.discount) setValue("discount", parseFloat(itemToEdit.discount.toString()));
      if (itemToEdit.currency) setValue("currency", itemToEdit.currency);
    } else {
      reset();
      setValue("currency", "INR"); // default
    }
    setSelectedImage(null);
    setGeneralError(null);
  }, [itemToEdit, setValue, reset]);

  const onSubmit = async (data: MenuItemFormType) => {
    try {
      setGeneralError(null);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("category", data.category);
      if (data.description !== undefined && data.description !== null) formData.append("description", data.description);
      formData.append("quantity", data.quantity.toString());
      formData.append("price", data.price.toString());
      if (data.discount !== undefined && data.discount !== null) formData.append("discount", data.discount.toString());
      formData.append("currency", data.currency || "INR");
      if (selectedImage) formData.append("image", selectedImage);

      const response = itemToEdit 
        ? await apiClient.updateMenuItem(itemToEdit.id, formData)
        : await apiClient.createMenuItem(formData);

      if (response.success) {
        if (!itemToEdit) {
          reset();
          setValue("currency", "INR"); // keep default
        }
        setSelectedImage(null);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        if (response.errors && typeof response.errors === "object" && Object.keys(response.errors).length > 0) {
          Object.entries(response.errors).forEach(([field, messages]: [string, unknown]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            setError(field as keyof MenuItemFormType, {
              type: "server",
              message: String(message),
            });
          });
          setGeneralError("Please fix the errors below.");
        } else {
          setGeneralError(response.message || response.error || "Failed to save menu item");
        }
      }
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity animate-[fadeIn_0.3s_ease-out]"
        onClick={onClose}
      ></div>
      <div 
        role="dialog" 
        className="fixed z-50 gap-4 bg-white shadow-xl transition-all inset-x-0 bottom-0 border-t rounded-t-2xl p-0 max-h-[92dvh] overflow-y-auto animate-[slideUp_0.3s_ease-out] lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-lg lg:rounded-2xl lg:bottom-4 lg:border lg:animate-[fadeIn_0.3s_ease-out]"
      >
        <button 
          type="button" 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 cursor-pointer transition-opacity hover:opacity-100 bg-slate-100 p-1 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="flex flex-col space-y-2 text-center sm:text-left px-6 pt-5 pb-2">
            <h2 className="font-semibold text-slate-900 text-xl text-left flex justify-between items-center pr-8">
              {itemToEdit ? "Edit item" : "Add new item"}
              {itemToEdit && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(itemToEdit.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center -mr-2"
                  aria-label="Delete item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              )}
            </h2>
          </div>

          <div className="px-6 py-4 space-y-4">
            {generalError && (
              <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {generalError}
              </div>
            )}

            <label className="block text-left">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Name</span>
              <input
                {...register("name")}
                placeholder="e.g. Flat White"
                maxLength={80}
                className={`w-full h-11 rounded-lg border px-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${errors.name ? "border-red-500" : "border-slate-200"}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </label>

            <div className="grid grid-cols-2 gap-3 text-left">
              <label className="block">
                <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Price</span>
                <div className="relative flex">
                  <select 
                    {...register("currency")}
                    className={`h-11 rounded-l-lg border-y border-l bg-slate-50 px-2 text-sm focus:outline-none ${errors.currency ? "border-red-500" : "border-slate-200"}`}
                  >
                    <option value="INR">₹</option>
                    <option value="USD">$</option>
                    <option value="EUR">€</option>
                    <option value="GBP">£</option>
                  </select>
                  <input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    max="999999"
                    placeholder="0.00"
                    className={`w-full h-11 rounded-r-lg border pl-2 pr-3 text-sm tabular-nums focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${errors.price ? "border-red-500" : "border-slate-200"}`}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Category</span>
                <input
                  {...register("category")}
                  placeholder="Coffee, Food..."
                  maxLength={40}
                  className={`w-full h-11 rounded-lg border px-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${errors.category ? "border-red-500" : "border-slate-200"}`}
                />
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <label className="block">
                <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Quantity</span>
                <input
                  {...register("quantity", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="99999"
                  placeholder="10"
                  className={`w-full h-11 rounded-lg border px-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${errors.quantity ? "border-red-500" : "border-slate-200"}`}
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Discount</span>
                <input
                  {...register("discount", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  max="999999"
                  placeholder="0.00"
                  className={`w-full h-11 rounded-lg border px-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${errors.discount ? "border-red-500" : "border-slate-200"}`}
                />
                {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount.message}</p>}
              </label>
            </div>

            <label className="block text-left">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Description (optional)</span>
              <textarea
                {...register("description")}
                rows={3}
                maxLength={500}
                placeholder="Short description for the storefront"
                className={`w-full rounded-lg border p-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${errors.description ? "border-red-500" : "border-slate-200"}`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </label>

            <label className="block text-left">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">
                {itemToEdit && itemToEdit.image_url ? "Update Image (optional)" : "Product Image (optional)"}
              </span>
              {itemToEdit && itemToEdit.image_url && !selectedImage && (
                <div className="mb-3 w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                  <img src={itemToEdit.image_url} alt="Current" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setSelectedImage(e.target.files[0]);
                }}
                className="w-full h-11 rounded-lg border border-slate-200 px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 focus:outline-none focus:border-indigo-400"
              />
            </label>

          </div>

          <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 grid grid-cols-2 gap-3 rounded-b-2xl">
            <button 
              type="button" 
              onClick={onClose}
              className="h-12 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 active:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-xl bg-slate-900 text-white font-bold text-sm disabled:opacity-40 active:bg-slate-800 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : null}
              {itemToEdit ? "Save changes" : "Create item"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
