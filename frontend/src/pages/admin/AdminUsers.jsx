import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const load = async () => {
    setUsers(await adminFetch("/admin/uporabniki"));
  };

  const block = async (id) => {
    await adminFetch(`/admin/uporabniki/${id}/blokiraj`, {
      method: "PUT",
    });
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Uporabniki</h1>

      {users.map((u) => (
        <div key={u.id} className="bg-white p-3 border mb-2 flex justify-between">
          <span>{u.username}</span>
          <button onClick={() => block(u.id)} className="text-red-500">
            Block
          </button>
        </div>
      ))}
    </div>
  );
}