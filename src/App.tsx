import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { OTPVerificationPage } from "./pages/OTPVerificationPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { BusinessSetupPage } from "./pages/BusinessSetupPage";
import { MenuSetupPage } from "./pages/MenuSetupPage";
import { MenuItemsPage } from "./pages/MenuItemsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OrdersPage } from "./pages/OrdersPage";
import { PublicMenuPage } from "./pages/PublicMenuPage";
import { StorePreviewPage } from "./pages/StorePreviewPage";
import { StorefrontPage } from "./pages/StorefrontPage";
import { CustomersPage } from "./pages/CustomersPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { PaymentPage } from "./pages/PaymentPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ element, requireOnboarding = true }: { element: React.ReactElement, requireOnboarding?: boolean }) => {
  const { user, isInitialized } = useAuthStore();
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && !user.onboarding_completed) {
    return <Navigate to="/business-setup" replace />;
  }
  
  if (!requireOnboarding && user.onboarding_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

function App() {
  const { restoreSession } = useAuthStore();

  // Restore session on app load
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-otp" element={<OTPVerificationPage />} />
        <Route
          path="/business-setup"
          element={<ProtectedRoute element={<BusinessSetupPage />} requireOnboarding={false} />}
        />
        <Route
          path="/menu-setup"
          element={<ProtectedRoute element={<MenuSetupPage />} requireOnboarding={false} />}
        />
        <Route
          path="/items"
          element={<ProtectedRoute element={<MenuItemsPage />} />}
        />
        <Route
          path="/store-preview"
          element={<ProtectedRoute element={<StorePreviewPage />} requireOnboarding={false} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<DashboardPage />} />}
        />
        <Route
          path="/orders"
          element={<ProtectedRoute element={<OrdersPage />} />}
        />
        <Route
          path="/storefront"
          element={<ProtectedRoute element={<StorefrontPage />} />}
        />
        <Route
          path="/customers"
          element={<ProtectedRoute element={<CustomersPage />} />}
        />
        <Route
          path="/analytics"
          element={<ProtectedRoute element={<AnalyticsPage />} />}
        />
        <Route
          path="/payments"
          element={<ProtectedRoute element={<PaymentsPage />} />}
        />
        {/* Public Menu Route */}
        <Route path="/shop/:slug" element={<PublicMenuPage />} />
        <Route path="/shop/:slug/cart" element={<CartPage />} />
        <Route path="/shop/:slug/checkout" element={<CheckoutPage />} />
        <Route path="/shop/:slug/payment" element={<PaymentPage />} />
        <Route path="/shop/:slug/confirmation" element={<OrderConfirmationPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
