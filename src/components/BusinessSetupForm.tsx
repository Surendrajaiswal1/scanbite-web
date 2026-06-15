import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { useNavigate } from "react-router-dom";
import { businessSetupSchema, type BusinessSetupFormType } from "../utils/validation";
import { apiClient } from "../services/api";
import { useAuthStore } from "../store/auth";

export const BusinessSetupForm = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
    control,
  } = useForm<BusinessSetupFormType>({
    resolver: zodResolver(businessSetupSchema),
    mode: "onChange",
  });

  const formValues = watch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.getBusinessProfile();
        if (response.success && response.data) {
          setIsEditMode(true);
          reset({
            shop_name: response.data.shop_name,
            phone_number: response.data.phone_number,
            address: response.data.address,
            upi_id: response.data.upi_id,
            business_type: response.data.business_type,
            custom_business_type: response.data.custom_business_type,
          });
        } else {
          // Check for partial save
          const partialData = localStorage.getItem("business_setup_partial");
          if (partialData) {
            try {
              reset(JSON.parse(partialData));
            } catch {
              console.error("Failed to parse partial save data");
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  // Partial save
  useEffect(() => {
    if (!loading && !isEditMode) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("business_setup_partial", JSON.stringify(formValues));
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formValues, loading, isEditMode]);

  const onSubmit = async (data: BusinessSetupFormType) => {
    try {
      setGeneralError(null);
      
      const response = isEditMode
        ? await apiClient.updateBusinessProfile(data)
        : await apiClient.createBusinessProfile(data);

      if (response.success && response.data) {
        localStorage.removeItem("business_setup_partial");
        
        if (user) {
          setUser({
            ...user,
            business_name: response.data.shop_name,
            business_type: response.data.business_type,
            business_slug: response.data.business_slug,
          });
        }

        navigate("/menu-setup"); // Redirect to next step per AC 5
      } else {
        if (response.errors && typeof response.errors === "object" && Object.keys(response.errors).length > 0) {
          Object.entries(response.errors).forEach(
            ([field, messages]: [string, unknown]) => {
              const message = Array.isArray(messages) ? messages[0] : messages;
              const fieldName = field as keyof BusinessSetupFormType;
              // React Hook Form error setting
              setError(fieldName, {
                type: "server",
                message: String(message),
              });
            }
          );
          setGeneralError("Please fix the errors above.");
        } else {
          setGeneralError(response.message || response.error || "Failed to save business details");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError("An unexpected error occurred");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl p-8 border border-[var(--border)] shadow-xl shadow-black/10 relative overflow-hidden">
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-h)] mb-2">
          {isEditMode ? "Edit Business Profile" : "Set Up Your Business"}
        </h2>
        <p className="text-[var(--text)] text-sm">
          {isEditMode 
            ? "Update your shop details below." 
            : "Let's get your shop ready on ScanBite. Please provide your details."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-h)] mb-2">Shop Name *</label>
          <input
            {...register("shop_name")}
            type="text"
            placeholder="e.g. ScanBite Cafe"
            className={`w-full px-4 py-3 rounded-xl border bg-transparent text-[var(--text-h)] outline-none transition focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
              errors.shop_name ? "border-red-500" : "border-[var(--border)]"
            }`}
          />
          {errors.shop_name && <p className="text-red-500 text-xs mt-1.5">{errors.shop_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-h)] mb-2">Business Type *</label>
          <select
            {...register("business_type")}
            className={`w-full px-4 py-3 rounded-xl border bg-[var(--background)] text-[var(--text-h)] outline-none transition focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
              errors.business_type ? "border-red-500" : "border-[var(--border)]"
            }`}
          >
            <option value="">Select a business type</option>
            <option value="restaurant">Restaurant</option>
            <option value="cafe">Cafe</option>
            <option value="bakery">Bakery</option>
            <option value="retail">Retail</option>
            <option value="shop">Shop</option>
            <option value="other">Other</option>
          </select>
          {errors.business_type && <p className="text-red-500 text-xs mt-1.5">{errors.business_type.message}</p>}
        </div>

        {formValues.business_type === "other" && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-h)] mb-2">Custom Business Type *</label>
            <input
              {...register("custom_business_type")}
              type="text"
              placeholder="e.g. Food Truck"
              className={`w-full px-4 py-3 rounded-xl border bg-transparent text-[var(--text-h)] outline-none transition focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
                errors.custom_business_type ? "border-red-500" : "border-[var(--border)]"
              }`}
            />
            {errors.custom_business_type && <p className="text-red-500 text-xs mt-1.5">{errors.custom_business_type.message}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--text-h)] mb-2">Phone Number *</label>
          <Controller
            name="phone_number"
            control={control}
            render={({ field }) => (
              <PhoneInput
                {...field}
                international
                defaultCountry="US"
                className={`w-full px-4 py-3 rounded-xl border bg-[var(--background)] outline-none transition focus-within:ring-2 focus-within:ring-[var(--accent)]\/20 focus-within:border-[var(--accent)] ${errors.phone_number ? 'border-red-300 bg-red-50 focus-within:ring-red-600/20 focus-within:border-red-500' : 'border-[var(--border)]'}`}
              />
            )}
          />
          {errors.phone_number && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.phone_number.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-h)] mb-2">Address *</label>
          <textarea
            {...register("address")}
            placeholder="Full shop address"
            rows={3}
            className={`w-full px-4 py-3 rounded-xl border bg-transparent text-[var(--text-h)] outline-none transition focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
              errors.address ? "border-red-500" : "border-[var(--border)]"
            }`}
          />
          {errors.address && <p className="text-red-500 text-xs mt-1.5">{errors.address.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-h)] mb-2">UPI ID *</label>
          <input
            {...register("upi_id")}
            type="text"
            placeholder="e.g. name@bank"
            className={`w-full px-4 py-3 rounded-xl border bg-transparent text-[var(--text-h)] outline-none transition focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
              errors.upi_id ? "border-red-500" : "border-[var(--border)]"
            }`}
          />
          {errors.upi_id && <p className="text-red-500 text-xs mt-1.5">{errors.upi_id.message}</p>}
        </div>

        {generalError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {generalError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition duration-200 shadow-lg shadow-[var(--accent)]/20 flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            isEditMode ? "Save Changes" : "Continue to Menu Setup →"
          )}
        </button>
      </form>
    </div>
  );
};
