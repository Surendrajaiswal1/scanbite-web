import { BusinessSetupForm } from "../components/BusinessSetupForm";

export const BusinessSetupPage = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <BusinessSetupForm />
      </div>
    </div>
  );
};
