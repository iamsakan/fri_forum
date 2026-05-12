import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";

export default function AdminPrijave() {
  const [prijave, setPrijave] = useState([]);

  const load = async () => {
    setPrijave(await adminFetch("/prijave/"));
  };

  const resi = async (id) => {
    await adminFetch(`/prijave/${id}/resi`, { method: "PUT" });
    load();
  };

  const zavrni = async (id) => {
    await adminFetch(`/prijave/${id}/zavrni`, { method: "PUT" });
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
          <p>{p.opis}</p>

          <div className="flex gap-2 mt-2">
            <button onClick={() => resi(p.id)} className="text-green-600">
              Reši
            </button>
            <button onClick={() => zavrni(p.id)} className="text-red-500">
              Zavrni
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}