import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    setUsers(await adminFetch("/admin/uporabniki"));
  };

  const block = async (id) => {
    const confirmBlock = window.confirm(
      "Ali si prepričan, da želiš blokirati uporabnika?",
    );

    if (!confirmBlock) return;
    await adminFetch(`/admin/uporabniki/${id}/blokiraj`, {
      method: "PUT",
    });
    load();
  };

  useEffect(() => {
    load();
  }, []);

  const openProfile = (username) => {
    navigate("/", { state: { openProfile: username } });
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Uporabniki</h1>

      {users.map((u) => (
        <div
          key={u.id}
          className="bg-white p-3 border mb-2 flex justify-between"
        >
          <div
            onClick={() => openProfile(u.uporabnisko_ime)}
            className="cursor-pointer hover:underline"
          >
            {u.uporabnisko_ime}
          </div>

          <button
            onClick={() => block(u.id)}
            className="text-red-500 cursor-pointer hover:underline"
          >
            Block
          </button>
        </div>
      ))}
    </div>
  );
}
