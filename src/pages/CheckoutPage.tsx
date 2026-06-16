import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCartStore } from "../store/cart";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';

const formatCurrency = (amount: number | string, currencyCode?: string | null) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode || "INR",
  }).format(Number(amount));
};

export const CheckoutPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { items, shopSlug, customerDetails, setCustomerDetails } = useCartStore();

  const [formData, setFormData] = useState({
    ...customerDetails
  });
  const [errors, setErrors] = useState<{ name?: string, phone?: string, email?: string, notes?: string }>({});

  useEffect(() => {
    if (items.length === 0 || (shopSlug && shopSlug !== slug)) {
      navigate(`/shop/${slug}`);
    }
  }, [items.length, shopSlug, slug, navigate]);

  if (items.length === 0 || (shopSlug && shopSlug !== slug)) return null;

  const subtotal = items.reduce((acc, item) => {
    const priceToUse = (item.discount && parseFloat(item.discount.toString()) > 0) ? item.final_price : item.price;
    return acc + (Number(priceToUse) * item.cartQuantity);
  }, 0);

  const displayCurrency = items[0]?.currency || "INR";

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    switch (field) {
      case 'name': {
        const nameRegex = /^[A-Za-z\s.]{3,50}$/;
        const hasLetter = /[A-Za-z]/.test(value);
        if (value && value.trim() !== '' && nameRegex.test(value.trim()) && hasLetter) {
          delete newErrors.name;
        }
        break;
      }
      case 'phone': {
        if (value && isValidPhoneNumber(value)) {
          delete newErrors.phone;
        }
        break;
      }
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || value.trim() === '' || emailRegex.test(value.trim())) {
          delete newErrors.email;
        }
        break;
      }
      case 'notes': {
        if (!value || value.length <= 200) {
          delete newErrors.notes;
        }
        break;
      }
    }
    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string, phone?: string, email?: string, notes?: string } = {};

    const nameRegex = /^[A-Za-z\s.]{3,50}$/;
    const hasLetter = /[A-Za-z]/.test(formData.name || "");
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = "Full name is required";
    } else if (!nameRegex.test(formData.name.trim()) || !hasLetter) {
      newErrors.name = "Name must contain at least one letter (3-50 chars)";
    }

    if (!formData.phone || !isValidPhoneNumber(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (formData.notes && formData.notes.length > 200) {
      newErrors.notes = "Notes must be at most 200 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setCustomerDetails({
      name: formData.name,
      phone: formData.phone || '',
      email: formData.email,
      notes: formData.notes
    });
    navigate(`/shop/${slug}/payment`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">
      <header className="sticky top-0 z-30 bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => navigate(`/shop/${slug}/cart`)}
          className="size-10 flex items-center justify-center rounded-full bg-[var(--background)] text-[var(--text)] active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[var(--text-h)]">Checkout</h1>
        <div className="w-10"></div>
      </header>

      <div className="p-4 max-w-2xl mx-auto mt-2">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="bg-[var(--card-bg)] p-5 rounded-2xl shadow-sm border border-[var(--border)] space-y-4">
            <h2 className="font-bold text-[var(--text-h)]">Customer Details</h2>

            <div>
              <label className="block text-sm font-medium text-[var(--text-h)] mb-1.5">Full Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                maxLength={50}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  validateField('name', e.target.value);
                }}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 ${errors.name ? 'border-red-300 bg-red-50 focus:ring-red-600/20 focus:border-red-500' : 'border-[var(--border)] bg-[var(--background)] focus:ring-[var(--accent)]\/20 focus:border-[var(--accent)]'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-h)] mb-1.5">Phone Number *</label>
              <PhoneInput
                international
                defaultCountry="US"
                value={formData.phone}
                onChange={(value) => {
                  setFormData({ ...formData, phone: value || '' });
                  validateField('phone', value || '');
                }}
                className={`w-full px-4 py-3 rounded-xl border bg-[var(--background)] outline-none transition focus-within:ring-2 focus-within:ring-[var(--accent)]\/20 focus-within:border-[var(--accent)] ${errors.phone ? 'border-red-300 bg-red-50 focus-within:ring-red-600/20 focus-within:border-red-500' : 'border-[var(--border)]'}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-h)] mb-1.5">Email (Optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  validateField('email', e.target.value);
                }}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 ${errors.email ? 'border-red-300 bg-red-50 focus:ring-red-600/20 focus:border-red-500' : 'border-[var(--border)] bg-[var(--background)] focus:ring-[var(--accent)]\/20 focus:border-[var(--accent)]'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-h)] mb-1.5">Order Notes (Optional)</label>
              <input
                type="text"
                value={formData.notes}
                maxLength={200}
                onChange={(e) => {
                  setFormData({ ...formData, notes: e.target.value });
                  validateField('notes', e.target.value);
                }}
                placeholder="e.g. Table 4 or Less ice please"
                className={`w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 ${errors.notes ? 'border-red-300 bg-red-50 focus:ring-red-600/20 focus:border-red-500' : 'border-[var(--border)] bg-[var(--background)] focus:ring-[var(--accent)]\/20 focus:border-[var(--accent)]'}`}
              />
              {errors.notes && <p className="text-red-500 text-xs mt-1.5">{errors.notes}</p>}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] p-5 rounded-2xl shadow-sm border border-[var(--border)] mb-20">
            <h2 className="font-bold text-[var(--text-h)] mb-4">Order Summary</h2>
            <div className="space-y-4 mb-4">
              {items.map(item => {
                const originalPrice = Number(item.price);
                const hasDiscount = item.discount && parseFloat(item.discount.toString()) > 0;
                const discountedPrice = hasDiscount ? Number(item.final_price) : originalPrice;
                const itemTotal = discountedPrice * item.cartQuantity;

                return (
                  <div key={item.id} className="flex flex-col text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between font-medium">
                      <span className="text-[var(--text-h)] line-clamp-1 pr-4">{item.name}</span>
                      <span className="text-[var(--text-h)] shrink-0">{formatCurrency(itemTotal, item.currency)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--text)] mt-1 text-xs">
                      <div className="flex gap-1.5">
                        <span>{item.cartQuantity} × {formatCurrency(discountedPrice, item.currency)}</span>
                        {hasDiscount && (
                          <span className="line-through text-slate-300 ml-1">{formatCurrency(originalPrice, item.currency)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[var(--border)] space-y-2">
              <div className="flex justify-between text-sm text-[var(--text)]">
                <span>Subtotal</span>
                <span className="font-medium text-[var(--text-h)]">{formatCurrency(subtotal, displayCurrency)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-[var(--border)]">
                <span className="font-bold text-[var(--text-h)]">Total</span>
                <span className="font-bold text-lg text-[var(--text-h)]">{formatCurrency(subtotal, displayCurrency)}</span>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-[var(--card-bg)] border-t border-[var(--border)] p-4 pb-8 md:pb-4 z-40">
            <div className="max-w-2xl mx-auto">
              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                Continue to Payment
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
