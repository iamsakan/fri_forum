import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";
import Toast from "../../components/Toast";
import { useToast } from "../../hooks/useToast";

export default function AdminPrijave() {
  const [prijave, setPrijave] = useState([]);
  const [filter, setFilter] = useState("caka");
  const { sporocila, dodajSporocilo, odstraniSporocilo } = useToast();

  const load = async () => {
    const url =
      filter === "caka"
        ? "/prijave/"
        : filter === "resene"
        ? "/prijave/resene"
        : "/prijave/zavrnjene";

    setPrijave(await adminFetch(url));
  };

  const resi = async (id) => {
    await adminFetch(`/prijave/${id}/resi`, { method: "PUT" });
    dodajSporocilo("Prijava rešena!", "success");
    load();
  };

  const zavrni = async (id) => {
    await adminFetch(`/prijave/${id}/zavrni`, { method: "PUT" });
    dodajSporocilo("Prijava zavrnjena", "info");
    load();
  };

  useEffect(() => {
    load();
  }, [filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Prijave</h1>

        <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-1">
          {prijave.length} prijav
        </span>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setFilter("caka")}
          className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
            filter === "caka"
              ? "bg-gray-900 text-white border-gray-900"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Nove
        </button>

        <button
          onClick={() => setFilter("resene")}
          className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
            filter === "resene"
              ? "bg-gray-900 text-white border-gray-900"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Rešene
        </button>

        <button
          onClick={() => setFilter("zavrnjene")}
          className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
            filter === "zavrnjene"
              ? "bg-gray-900 text-white border-gray-900"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Zavrnjene
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {prijave.length === 0 ? (
          <div className="px-4 py-8 text-sm text-gray-400 text-center">
            Ni prijav
          </div>
        ) : (
          prijave.map((p, index) => (
            <div
              key={p.id}
              className={`px-4 py-4 hover:bg-gray-50 transition ${
                index !== prijave.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.objava_id
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {p.objava_id
                        ? "Prijavljena objava"
                        : "Prijavljen komentar"}
                    </span>

                    {filter === "resene" && (
                      <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        Rešeno
                      </span>
                    )}

                    {filter === "zavrnjene" && (
                      <span className="text-xs font-medium bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                        Zavrnjeno
                      </span>
                    )}
                  </div>

                  {p.objava ? (
                    <a
                      href={`/objava/${p.objava_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-gray-900 hover:text-blue-600 transition"
                    >
                      {p.objava.naslov}
                    </a>
                  ) : (
                    <a
                      href={`/objava/${p.komentar?.objava_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-gray-800 hover:text-blue-600 transition"
                    >
                      {p.komentar?.vsebina}
                    </a>
                  )}

                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium text-gray-700">Razlog:</span>{" "}
                    {p.razlog}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Prijavil: {p.profil?.uporabnisko_ime || "Neznan"}
                  </p>
                </div>

                {filter === "caka" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => resi(p.id)}
                      className="text-xs text-green-600 hover:bg-green-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      Reši
                    </button>

                    <button
                      onClick={() => zavrni(p.id)}
                      className="text-xs text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      Zavrni
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Toast
        sporocila={sporocila}
        odstraniSporocilo={odstraniSporocilo}
      />
    </div>
  );
}