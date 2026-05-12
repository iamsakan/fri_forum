import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";
import Toast from "../../components/Toast";
import { useToast } from "../../hooks/useToast";

export default function AdminPrijave() {
  const [prijave, setPrijave] = useState([]);
  const [filter, setFilter] = useState("caka");
  const { sporocila, dodajSporocilo, odstraniSporocilo } = useToast();

  const load = async () => {
    const url = filter === "caka" ? "/prijave/" : filter === "resene" ? "/prijave/resene" : "/prijave/zavrnjene";
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
      <h1 className="text-xl font-bold mb-4">Prijave</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("caka")}
          className={`px-3 py-1.5 rounded-lg border text-sm ${filter === "caka" ? "bg-gray-900 text-white" : "border-gray-200 text-gray-600"}`}
        >
          Nove
        </button>
        <button
          onClick={() => setFilter("resene")}
          className={`px-3 py-1.5 rounded-lg border text-sm ${filter === "resene" ? "bg-gray-900 text-white" : "border-gray-200 text-gray-600"}`}
        >
          Rešene
        </button>
        <button
          onClick={() => setFilter("zavrnjene")}
          className={`px-3 py-1.5 rounded-lg border text-sm ${filter === "zavrnjene" ? "bg-gray-900 text-white" : "border-gray-200 text-gray-600"}`}
        >
          Zavrnjene
        </button>
      </div>

      {prijave.map((p) => (
        <div key={p.id} className="bg-white p-3 border mb-2">
          <p className="text-sm text-gray-500 mb-1">
            {p.objava_id ? "Prijavljena objava" : "Prijavljen komentar"}
          </p>

          {p.objava ? (
            <a href={`/objava/${p.objava_id}`}
              target="_blank"
              className="font-semibold text-blue-600 hover:underline"
            >
              {p.objava.naslov}
            </a>
          ) : (
            <a href={`/objava/${p.komentar?.objava_id}`}
              target="_blank"
              className="text-gray-800 hover:underline"
            >
              {p.komentar?.vsebina}
            </a>
          )}

          <p className="text-sm text-gray-600 mt-1">Razlog: {p.razlog}</p>
          <p className="text-sm text-gray-400">
            Prijavil: {p.profil?.uporabnisko_ime || "Neznan"}
          </p>

          {filter === "caka" && (
            <div className="flex gap-2 mt-2">
              <button onClick={() => resi(p.id)} className="text-green-600">Reši</button>
              <button onClick={() => zavrni(p.id)} className="text-red-500">Zavrni</button>
            </div>
          )}
        </div>
      ))}
      <Toast sporocila={sporocila} odstraniSporocilo={odstraniSporocilo} />
    </div>
  );
}