import { useState } from "react";
import { apiClient } from "../services/api";

interface CsvUploadProps {
  onSuccess?: () => void;
}

export const CsvUpload = ({ onSuccess }: CsvUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error"; details?: { name?: string; errors?: string[] }[] } | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.importCsvMenuItems(file);

      if (response.success) {
        setMessage({ 
          text: response.message || "Successfully imported CSV", 
          type: "success",
          details: response.errors && response.errors.length > 0 ? response.errors : undefined
        });
        setFile(null);
        // Reset file input natively
        const input = document.getElementById("csv-upload-input") as HTMLInputElement;
        if (input) input.value = "";
        
        if (onSuccess) onSuccess();
      } else {
        setMessage({ text: response.message || "Failed to import CSV", type: "error" });
      }
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--accent)]/5 rounded-xl p-6 border border-[var(--accent)]/20 mb-6">
        <h3 className="font-medium text-[var(--text-h)] mb-2">CSV Format Requirements</h3>
        <p className="text-sm text-[var(--text)] mb-4">
          Please make sure your CSV file includes the following exact column headers:
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {["Product_Name", "Product_Category", "Product_Description", "Product_Quantity", "Product_Price", "Discount", "Currency"].map((header) => (
            <span key={header} className="bg-[var(--background)] border border-[var(--border)] px-2 py-1 rounded text-[var(--text-h)] font-mono">
              {header}
            </span>
          ))}
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.type === "success" && !message.details ? "bg-green-500/10 border border-green-500/50 text-green-600" : "bg-red-500/10 border border-red-500/50 text-red-500"}`}>
          <div className="font-medium">{message.text}</div>
          {message.details && message.details.length > 0 && (
            <div className="mt-2 space-y-1 bg-white/50 p-2 rounded border border-red-500/20 text-xs">
              <p className="font-semibold text-red-700">The following items failed to import:</p>
              <ul className="list-disc pl-4 space-y-1">
                {message.details.map((err, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{err.name || 'Unknown item'}:</span> {err.errors?.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-10 text-center hover:border-[var(--accent)]/50 transition-colors bg-[var(--background)]/50">
        <input
          id="csv-upload-input"
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        <label
          htmlFor="csv-upload-input"
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          <svg className="w-12 h-12 text-[var(--text)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[var(--text-h)] font-medium mb-1">
            {file ? file.name : "Click to select a CSV file"}
          </span>
          <span className="text-[var(--text)] text-sm">
            {file ? "Ready to upload" : "or drag and drop it here"}
          </span>
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition duration-200 shadow-lg shadow-[var(--accent)]/20"
      >
        {loading ? "Uploading..." : "Upload and Import"}
      </button>
    </div>
  );
};
