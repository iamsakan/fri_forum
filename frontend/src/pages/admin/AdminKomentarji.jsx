import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";
import { useNavigate } from "react-router-dom";

export default function AdminKomentarji() {
  const [kom, setKom] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    const data = await adminFetch("/admin/komentarji");
    setKom(Array.isArray(data) ? data : data?.komentarji || []);
  };

  const del = async (id) => {
    const confirmDelete = window.confirm(
      "Ali si prepričan, da želiš izbrisati komentar?",
    );

    if (!confirmDelete) return;
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
        <div
          key={k.id}
          className="bg-white p-3 border mb-2 flex justify-between"
        >
          <div
            onClick={() => navigate(`/objava/${k.objava_id}`)}
            className="cursor-pointer hover:underline"
          >
            <p>{k.vsebina}</p>
          </div>
          <button onClick={() => del(k.id)} className="text-red-500 cursor-pointer hover:underline">
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
