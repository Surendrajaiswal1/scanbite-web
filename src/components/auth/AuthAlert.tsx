interface AuthAlertProps {
  message: string;
  variant?: "error" | "success";
}

export const AuthAlert = ({
  message,
  variant = "error",
}: AuthAlertProps) => (
  <div
    className={`px-4 py-3 rounded-xl text-sm border ${
      variant === "success"
        ? "bg-green-50 border-green-200 text-green-700"
        : "bg-red-50 border-red-200 text-red-700"
    }`}
  >
    {message}
  </div>
);