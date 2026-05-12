import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";
import { useNavigate } from "react-router-dom";

export default function AdminObjave() {
  const [objave, setObjave] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    const data = await adminFetch("/admin/objave");
    setObjave(data || []);
  };

  const brisi = async (id) => {
    const confirmDelete = window.confirm(
      "Ali si prepričan, da želiš izbrisati objavo?",
    );

    if (!confirmDelete) return;

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
          <div
            key={o.id}
            className="bg-white p-3 border rounded flex justify-between"
          >
            <div
              onClick={() => navigate(`/objava/${o.id}`)}
              className="cursor-pointer hover:underline"
            >
              <p className="font-medium">{o.naslov}</p>
            </div>

            <button onClick={() => brisi(o.id)} className="text-red-500 cursor-pointer hover:underline">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
