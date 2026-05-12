import { useState } from "react";

const RAZLOGI = [
  "Spam",
  "Neprimerna vsebina",
  "Sovražni govor",
  "Dezinformacije",
  "Drugo",
];

export default function ReportModal({ open, setOpen, onSubmit }) {
  const [izbranRazlog, setIzbranRazlog] = useState("");
  const [drugRazlog, setDrugRazlog] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    const razlog = izbranRazlog === "Drugo" ? drugRazlog : izbranRazlog;
    if (!razlog.trim()) return;
    onSubmit(razlog);
    setIzbranRazlog("");
    setDrugRazlog("");
    setOpen(false);
  };

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prijavi vsebino</h3>

        <div className="flex flex-col gap-2 mb-4">
          {RAZLOGI.map((r) => (
            <button
              key={r}
              onClick={() => setIzbranRazlog(r)}
              className={`text-left px-3 py-2 rounded-lg border text-sm transition ${
                izbranRazlog === r
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {izbranRazlog === "Drugo" && (
          <textarea
            value={drugRazlog}
            onChange={(e) => setDrugRazlog(e.target.value)}
            placeholder="Opišite razlog..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none mb-4"
          />
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setOpen(false)}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800"
          >
            Prekliči
          </button>
          <button
            onClick={handleSubmit}
            disabled={!izbranRazlog || (izbranRazlog === "Drugo" && !drugRazlog.trim())}
            className="bg-red-500 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
          >
            Prijavi
          </button>
        </div>
      </div>
    </div>
  );
}