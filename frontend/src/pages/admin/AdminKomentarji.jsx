import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";

export default function AdminKomentarji() {
  const [kom, setKom] = useState([]);

  const load = async () => {
    const data = await adminFetch("/admin/komentarji");
    setKom(Array.isArray(data) ? data : data?.komentarji || []);
  };

  const del = async (id) => {
    await adminFetch(`/admin/komentarji/${id}`, { method: "DELETE" });
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Komentarji</h1>

      {kom.map((k) => (
        <div key={k.id} className="bg-white p-3 border mb-2 flex justify-between">
          <p>{k.vsebina}</p>
          <button onClick={() => del(k.id)} className="text-red-500">
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}