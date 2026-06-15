import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PhoneInput from "react-phone-number-input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../../store/auth";
import { apiClient } from "../../services/api";
import { profileDetailsSchema, profilePasswordSchema, type ProfileDetailsFormType, type ProfilePasswordFormType } from "../../utils/validation";

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal = ({ onClose }: ProfileModalProps) => {
  const { user, setUser } = useAuthStore();
  
  const [view, setView] = useState<'details' | 'password'>('details');
  const [loading, setLoading] = useState(true);

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const detailsForm = useForm<ProfileDetailsFormType>({
    resolver: zodResolver(profileDetailsSchema),
    mode: "onChange",
    defaultValues: {
      full_name: user?.full_name || "",
      shop_name: "",
      phone_number: "",
      address: "",
    }
  });

  const passwordForm = useForm<ProfilePasswordFormType>({
    resolver: zodResolver(profilePasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      password_confirmation: "",
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.getBusinessProfile();
        if (res.success && res.data) {
          detailsForm.reset({
            full_name: user?.full_name || "",
            shop_name: res.data.shop_name || "",
            phone_number: res.data.phone_number || "",
            address: res.data.address || "",
          });
        }
      } catch (err) {
        console.error("Failed to load business profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [detailsForm, user]);

  const onDetailsSubmit = async (data: ProfileDetailsFormType) => {
    setGeneralError(null);
    setSuccess(null);
    
    try {
      // Update User (Full Name)
      const userRes = await apiClient.updateProfile({ full_name: data.full_name });
      
      if (!userRes.success) {
        if (userRes.errors && typeof userRes.errors === "object") {
          Object.entries(userRes.errors).forEach(([key, messages]) => {
            if (Array.isArray(messages)) {
              detailsForm.setError(key as keyof ProfileDetailsFormType, { type: "server", message: messages[0] });
            }
          });
        } else {
          setGeneralError(userRes.message || "Failed to update profile");
        }
        return;
      }

      // Update Business Profile
      const bizRes = await apiClient.updateBusinessProfile({
        shop_name: data.shop_name,
        phone_number: data.phone_number,
        address: data.address
      });

      if (!bizRes.success) {
         if (bizRes.errors && typeof bizRes.errors === "object") {
          Object.entries(bizRes.errors).forEach(([key, messages]) => {
            if (Array.isArray(messages)) {
              detailsForm.setError(key as keyof ProfileDetailsFormType, { type: "server", message: messages[0] });
            }
          });
        } else {
          setGeneralError(bizRes.message || "Failed to update business profile");
        }
        return;
      }

      // Both successful
      setSuccess("Profile updated successfully!");
      if (user) {
        setUser({ 
          ...user, 
          full_name: data.full_name,
          business_name: data.shop_name 
        });
      }
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || "An unexpected error occurred");
    }
  };

  const onPasswordSubmit = async (data: ProfilePasswordFormType) => {
    setGeneralError(null);
    setSuccess(null);
    
    try {
      const response = await apiClient.updateProfile({
        password: data.password,
        password_confirmation: data.password_confirmation
      });

      if (response.success) {
        setSuccess("Password changed successfully!");
        passwordForm.reset();
        setTimeout(() => {
          setSuccess(null);
          setView('details');
        }, 2000);
      } else {
        if (response.errors && typeof response.errors === "object") {
          Object.entries(response.errors).forEach(([key, messages]) => {
            if (Array.isArray(messages)) {
              passwordForm.setError(key as keyof ProfilePasswordFormType, { type: "server", message: messages[0] });
            }
          });
        } else {
          setGeneralError(response.message || "Failed to change password");
        }
      }
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || "An unexpected error occurred");
    }
  };

  return createPortal(
    <>
      <div 
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="fixed z-[110] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-6 animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {view === 'password' && (
              <button 
                onClick={() => { setView('details'); setGeneralError(null); setSuccess(null); passwordForm.reset(); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
              </button>
            )}
            <h3 className="font-bold text-xl text-slate-900">
              {view === 'details' ? 'Profile Settings' : 'Change Password'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {generalError}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100">
            {success}
          </div>
        )}

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : view === 'details' ? (
          <form onSubmit={detailsForm.handleSubmit(onDetailsSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input 
                type="email" 
                disabled
                value={user?.email || ""}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 cursor-not-allowed" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input 
                {...detailsForm.register("full_name")}
                type="text" 
                className={`w-full h-11 rounded-xl border bg-white px-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ${detailsForm.formState.errors.full_name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-indigo-400'}`} 
              />
              {detailsForm.formState.errors.full_name && (
                <p className="text-red-500 text-xs mt-1.5">{detailsForm.formState.errors.full_name.message}</p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Business Details</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Shop Name</label>
                  <input 
                    {...detailsForm.register("shop_name")}
                    type="text" 
                    className={`w-full h-11 rounded-xl border bg-white px-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ${detailsForm.formState.errors.shop_name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-indigo-400'}`} 
                  />
                  {detailsForm.formState.errors.shop_name && (
                    <p className="text-red-500 text-xs mt-1.5">{detailsForm.formState.errors.shop_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                  <Controller
                    name="phone_number"
                    control={detailsForm.control}
                    render={({ field }) => (
                      <PhoneInput
                        {...field}
                        international
                        defaultCountry="US"
                        className={`w-full h-11 rounded-xl border bg-white px-4 text-sm transition-all [&>input]:outline-none [&>input]:bg-transparent [&>input]:ml-2 ${detailsForm.formState.errors.phone_number ? 'border-red-500 focus-within:ring-red-100 focus-within:border-red-500' : 'border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100'}`}
                      />
                    )}
                  />
                  {detailsForm.formState.errors.phone_number && (
                    <p className="text-red-500 text-xs mt-1.5">{detailsForm.formState.errors.phone_number.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                  <textarea 
                    {...detailsForm.register("address")}
                    className={`w-full rounded-xl border bg-white p-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none h-24 ${detailsForm.formState.errors.address ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-indigo-400'}`} 
                  />
                  {detailsForm.formState.errors.address && (
                    <p className="text-red-500 text-xs mt-1.5">{detailsForm.formState.errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Password</p>
                <p className="text-xs text-slate-500">Update your account password</p>
              </div>
              <button 
                type="button"
                onClick={() => { setView('password'); setGeneralError(null); setSuccess(null); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Change
              </button>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="submit"
                disabled={detailsForm.formState.isSubmitting}
                className="w-full h-11 rounded-xl font-bold text-sm bg-indigo-600 text-white disabled:opacity-50 active:scale-95 transition-transform shadow-md shadow-indigo-600/20"
              >
                {detailsForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <input 
                {...passwordForm.register("password")}
                type="password" 
                placeholder="Enter new password"
                className={`w-full h-11 rounded-xl border bg-white px-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ${passwordForm.formState.errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-indigo-400'}`} 
              />
              {passwordForm.formState.errors.password && (
                <p className="text-red-500 text-xs mt-1.5">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
              <input 
                {...passwordForm.register("password_confirmation")}
                type="password" 
                placeholder="Confirm new password"
                className={`w-full h-11 rounded-xl border bg-white px-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ${passwordForm.formState.errors.password_confirmation ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-indigo-400'}`} 
              />
              {passwordForm.formState.errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1.5">{passwordForm.formState.errors.password_confirmation.message}</p>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={() => { setView('details'); setGeneralError(null); setSuccess(null); passwordForm.reset(); }}
                className="flex-1 h-11 rounded-xl font-semibold text-sm bg-white border border-slate-200 text-slate-600 active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
                className="flex-[2] h-11 rounded-xl font-bold text-sm bg-indigo-600 text-white disabled:opacity-50 active:scale-95 transition-transform shadow-md shadow-indigo-600/20"
              >
                {passwordForm.formState.isSubmitting ? "Saving..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>,
    document.body
  );
};
