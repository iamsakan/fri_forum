import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";

export default function AdminObjave() {
  const [objave, setObjave] = useState([]);

  const load = async () => {
    const data = await adminFetch("/admin/objave");
    setObjave(data || []);
  };

  const brisi = async (id) => {
    await adminFetch(`/admin/objave/${id}`, { method: "DELETE" });
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Objave</h1>

      <div className="flex flex-col gap-2">
        {objave.map((o) => (
          <div key={o.id} className="bg-white p-3 border rounded flex justify-between">
            <div>
              <p className="font-medium">{o.naslov}</p>
            </div>

            <button
              onClick={() => brisi(o.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}