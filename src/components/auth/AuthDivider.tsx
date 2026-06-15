export const AuthDivider = () => {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[var(--border)]" />
      </div>

      <div className="relative flex justify-center text-sm">
        <span className="bg-[var(--bg)] px-4 text-[var(--text)]">
          OR
        </span>
      </div>
    </div>
  );
};