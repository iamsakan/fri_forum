import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";
import { useNavigate } from "react-router-dom";

export default function AdminObjave() {
  const [objave, setObjave] = useState([]);
  const [confirmId, setConfirmId] = useState(null);

  const navigate = useNavigate();

  const load = async () => {
    const data = await adminFetch("/admin/objave");
    setObjave(data || []);
  };

  const brisi = async (id) => {
    await adminFetch(`/admin/objave/${id}`, { method: "DELETE" });

    setConfirmId(null);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Objave</h1>

        <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-1">
          {objave.length} objav
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {objave.length === 0 ? (
          <div className="px-4 py-8 text-sm text-gray-400 text-center">
            Ni objav
          </div>
        ) : (
          objave.map((o, index) => (
            <div
              key={o.id}
              className={`px-4 py-4 hover:bg-gray-50 transition ${
                index !== objave.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div
                  onClick={() => navigate(`/objava/${o.id}`)}
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {o.naslov?.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate hover:text-blue-600 transition">
                      {o.naslov}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {confirmId === o.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Si prepričan?
                      </span>

                      <button
                        onClick={() => brisi(o.id)}
                        className="text-xs px-2.5 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
                      >
                        Da
                      </button>

                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-xs px-2.5 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                      >
                        Ne
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(o.id)}
                      className="text-xs text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      Izbriši
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}