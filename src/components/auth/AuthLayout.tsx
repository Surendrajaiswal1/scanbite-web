import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export const AuthLayout = ({
  title,
  subtitle,
  children,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-4xl font-bold text-accent mb-2">
            ScanBite
          </h1>

          <p className="text-text text-sm">
            QR-based Takeaway Ordering Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[var(--border)] rounded-3xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-[var(--text-h)]">
            {title}
          </h2>

          <p className="text-[var(--text)] text-sm mt-1 mb-8">
            {subtitle}
          </p>

          {children}
        </div>
      </div>
    </div>
  );
};