import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";
import { useNavigate } from "react-router-dom";

export default function AdminKomentarji() {
  const [kom, setKom] = useState([]);
  const [confirmId, setConfirmId] = useState(null);

  const navigate = useNavigate();

  const load = async () => {
    const data = await adminFetch("/admin/komentarji");
    setKom(Array.isArray(data) ? data : data?.komentarji || []);
  };

  const delKomentar = async (id) => {
    await adminFetch(`/admin/komentarji/${id}`, {
      method: "DELETE",
    });

    setConfirmId(null);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Komentarji</h1>

        <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-1">
          {kom.length} komentarjev
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {kom.length === 0 ? (
          <div className="px-4 py-8 text-sm text-gray-400 text-center">
            Ni komentarjev
          </div>
        ) : (
          kom.map((k, index) => (
            <div
              key={k.id}
              className={`px-4 py-4 hover:bg-gray-50 transition ${
                index !== kom.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div
                  onClick={() => navigate(`/objava/${k.objava_id}`)}
                  className="flex items-start gap-3 cursor-pointer min-w-0 flex-1"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {k.vsebina?.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 break-words hover:text-blue-600 transition">
                      {k.vsebina}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {confirmId === k.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Si prepričan?
                      </span>

                      <button
                        onClick={() => delKomentar(k.id)}
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
                      onClick={() => setConfirmId(k.id)}
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