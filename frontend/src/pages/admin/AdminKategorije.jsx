import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";

export default function AdminKategorije() {
  const [kat, setKat] = useState([]);
  const [ime, setIme] = useState("");
  const [opis, setOpis] = useState("");
  const [barva, setBarva] = useState("#3B82F6");

  const load = async () => {
    setKat(await adminFetch("/kategorije"));
  };

  const add = async () => {
    await adminFetch("/admin/kategorije", {
      method: "POST",
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
    const confirmDelete = window.confirm(
      "Ali si prepričan, da želiš izbrisati kategorijo?",
    );

    if (!confirmDelete) return;
    await adminFetch(`/admin/kategorije/${id}`, { method: "DELETE" });
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Kategorije</h1>

      {/* INPUT FORM */}
      <div className="flex flex-col gap-2 mb-4">
        <input
          value={ime}
          onChange={(e) => setIme(e.target.value)}
          className="border p-2"
          placeholder="Ime kategorije"
        />

        <input
          value={opis}
          onChange={(e) => setOpis(e.target.value)}
          className="border p-2"
          placeholder="Opis kategorije"
        />

        <input
          type="color"
          value={barva}
          onChange={(e) => setBarva(e.target.value)}
          className="w-12 h-10 p-0 border"
        />

        <button onClick={add} className="bg-black text-white px-3 py-2">
          Dodaj
        </button>
      </div>

      {/* LIST */}
      {kat.map((k) => (
        <div
          key={k.id}
          className="flex justify-between items-center bg-white p-2 border mb-2"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: k.barva }}
            />
            {k.naziv}
          </div>

          <button onClick={() => del(k.id)} className="text-red-500 cursor-pointer hover:underline">
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
