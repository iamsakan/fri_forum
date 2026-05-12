import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";
import Toast from "../../components/Toast";
import { useToast } from "../../hooks/useToast";

export default function AdminPrijave() {
  const [prijave, setPrijave] = useState([]);
  const { sporocila, dodajSporocilo, odstraniSporocilo } = useToast();

  const load = async () => {
    setPrijave(await adminFetch("/prijave/"));
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
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Prijave</h1>

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

          <div className="flex gap-2 mt-2">
            <button onClick={() => resi(p.id)} className="text-green-600">Reši</button>
            <button onClick={() => zavrni(p.id)} className="text-red-500">Zavrni</button>
          </div>
        </div>
      ))}
      <Toast sporocila={sporocila} odstraniSporocilo={odstraniSporocilo} />
    </div>
  );
}