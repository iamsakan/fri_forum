import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";

export default function AdminKategorije() {
  const [kat, setKat] = useState([]);
  const [ime, setIme] = useState("");
  const [opis, setOpis] = useState("");
  const [barva, setBarva] = useState("#3B82F6");
  const [confirmId, setConfirmId] = useState(null);

  const load = async () => {
    setKat(await adminFetch("/kategorije"));
  };

  const add = async () => {
    await adminFetch("/admin/kategorije", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        naziv: ime,
        opis: opis,
        barva: barva,
      }),
    });

    setIme("");
    setOpis("");
    setBarva("#3B82F6");
    load();
  };

  const del = async (id) => {
    await adminFetch(`/admin/kategorije/${id}`, {
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
        <h1 className="text-lg font-semibold text-gray-900">Kategorije</h1>

        <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-1">
          {kat.length} kategorij
        </span>
      </div>

      {/* INPUT FORM */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
        <div className="flex flex-col gap-3">
          <input
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-300 transition"
            placeholder="Ime kategorije"
          />

          <input
            value={opis}
            onChange={(e) => setOpis(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-300 transition"
            placeholder="Opis kategorije"
          />

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={barva}
              onChange={(e) => setBarva(e.target.value)}
              className="w-10 h-10 p-0 border border-gray-200 rounded-lg cursor-pointer"
            />

            <span className="text-xs text-gray-400">Barva kategorije</span>
          </div>

          <button
            onClick={add}
            className="text-sm bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-black transition cursor-pointer"
          >
            Dodaj kategorijo
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {kat.length === 0 ? (
          <div className="px-4 py-8 text-sm text-gray-400 text-center">
            Ni kategorij
          </div>
        ) : (
          kat.map((k, index) => (
            <div
              key={k.id}
              className={`px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition ${
                index !== kat.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: k.barva }}
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {k.naziv}
                  </p>
                  {k.opis && (
                    <p className="text-xs text-gray-400 truncate">
                      {k.opis}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                {confirmId === k.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Si prepričan?
                    </span>

                    <button
                      onClick={() => del(k.id)}
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
          ))
        )}
      </div>
    </div>
  );
}