import type { ReactNode } from "react";

export interface AuthButtonProps {
  children: ReactNode;
  loading?: boolean;
  type?: "button" | "submit";
}

export const AuthButton = ({
  children,
  loading,
  type = "submit",
}: AuthButtonProps) => {
  return (
    <button
      type={type}
      disabled={loading}
      className="
        w-full
        h-12
        rounded-xl
        bg-[var(--accent)]
        text-white
        font-medium
        shadow-sm
        transition
        hover:opacity-90
        active:scale-[0.99]
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      {loading ? "Please wait..." : children}
    </button>
  );
};