import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationsModal({ open, setOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }

      try {
        const res = await fetch("https://friforum-production.up.railway.app/notifikacije/", {
          headers: { Authorization: "Bearer " + token }
        });
        if (res.ok) setNotifications(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Označi kot prebrane
    const oznaci = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch("https://friforum-production.up.railway.app/notifikacije/preberi", {
        method: "PUT",
        headers: { Authorization: "Bearer " + token }
      });
    };

    fetchNotifications();
    oznaci();
  }, [open]);

  if (!open) return null;

  const casObjave = (cas) => {
    const diff = Math.floor((new Date() - new Date(cas + "Z")) / 1000);
    if (diff < 60) return `pred ${diff}s`;
    if (diff < 3600) return `pred ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `pred ${Math.floor(diff / 3600)}h`;
    return `pred ${Math.floor(diff / 86400)} dnevi`;
  };

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg"
      >
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Obvestila</h3>
        </div>

        <div className="flex flex-col max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400 p-4">Nalaganje...</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-gray-400 p-4 text-center">Ni novih obvestil</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => { if (n.objava_id) { setOpen(false); navigate(`/objava/${n.objava_id}`); } }}
                className={`px-4 py-3 border-b border-gray-100 last:border-0 text-sm transition ${
                  n.objava_id ? "cursor-pointer hover:bg-gray-50" : ""
                } ${!n.prebrana ? "bg-blue-50 hover:bg-blue-100" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ background: !n.prebrana ? "#3b82f6" : "transparent" }}
                  />
                  <div className="flex-1">
                    <p className="text-gray-800">{n.sporocilo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{casObjave(n.cas)}</p>
                  </div>
                  {n.objava_id && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end p-3 border-t border-gray-100">
          <button
            onClick={() => setOpen(false)}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 cursor-pointer transition"
          >
            Zapri
          </button>
        </div>
      </div>
    </div>
  );
}