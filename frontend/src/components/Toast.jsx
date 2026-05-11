import { useEffect } from "react";

export default function Toast({ sporocila, odstraniSporocilo }) {
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px" }}>
      {sporocila.map((s) => (
        <ToastItem key={s.id} sporocilo={s} onRemove={() => odstraniSporocilo(s.id)} />
      ))}
    </div>
  );
}

function ToastItem({ sporocilo, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 3000);
    return () => clearTimeout(timer);
  }, []);

  const ikona = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "↑",
  }[sporocilo.tip] || "✓";

  const barva = {
    success: "#16a34a",
    error: "#dc2626",
    warning: "#d97706",
    info: "#2563eb",
  }[sporocilo.tip] || "#16a34a";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      background: "white", border: "0.5px solid #e5e7eb",
      borderRadius: "12px", padding: "12px 16px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      minWidth: "260px", maxWidth: "360px",
      animation: "slideIn 0.2s ease"
    }}>
      <span style={{ fontSize: "16px", color: barva, fontWeight: "500" }}>{ikona}</span>
      <span style={{ fontSize: "14px", color: "#111827", flex: 1 }}>{sporocilo.besedilo}</span>
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "16px" }}>✕</button>
    </div>
  );
}