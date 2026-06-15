import type { InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = ({
  label,
  error,
  ...props
}: AuthInputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-h)] mb-2">
        {label}
      </label>

      <input
        {...props}
        className={`
          w-full
          h-12
          px-4
          rounded-xl
          border
          bg-white
          text-[var(--text-h)]
          placeholder:text-[var(--text)]
          outline-none
          transition
          focus:ring-2
          focus:ring-[var(--accent)]
          focus:border-[var(--accent)]
          ${
            error
              ? "border-red-400"
              : "border-[var(--border)]"
          }
        `}
      />

      {error && (
        <p className="text-xs mt-1 text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};