import { useEffect, useState } from "react";

export default function NotificationsModal({ open, setOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchNotifications = async () => {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        // TODO: backend endpoint (trenutno mock fallback)
        const res = await fetch("https://friforum-production.up.railway.app/prijave/", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (!res.ok) {
          setNotifications([]);
          return;
        }

        const data = await res.json();

        // fallback transform (ker še nimaš notifications API)
        const fake = Array.isArray(data)
          ? data.slice(0, 5).map((d) => ({
              id: d.id,
              text: `Nova prijava: ${d.tip}`,
            }))
          : [];

        setNotifications(fake);
      } catch (err) {
        console.log(err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg"
      >
        {/* HEADER */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Obvestila
          </h3>
        </div>

        {/* BODY */}
        <div className="p-4 flex flex-col gap-2 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400">Nalaganje...</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-gray-400">
              Ni novih obvestil
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-700"
              >
                {n.text}
              </div>
            ))
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-100">
          <button
            onClick={() => setOpen(false)}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800"
          >
            Zapri
          </button>
        </div>
      </div>
    </div>
  );
}