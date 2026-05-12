import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";
import Toast from "../../components/Toast";
import { useToast } from "../../hooks/useToast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [confirmId, setConfirmId] = useState(null);
  const { sporocila, dodajSporocilo, odstraniSporocilo } = useToast();

  const load = async () => {
    setUsers(await adminFetch("/admin/uporabniki"));
  };

  const block = async (id) => {
    await adminFetch(`/admin/uporabniki/${id}/blokiraj`, { method: "PUT" });
    dodajSporocilo("Uporabnik blokiran", "success");
    setConfirmId(null);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Uporabniki</h1>

      {users.map((u) => (
        <div key={u.id} className="bg-white p-3 border mb-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>{u.uporabnisko_ime}</span>
            {u.vloga === "blokiran" && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Blokiran</span>
            )}
            {u.vloga === "admin" && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Admin</span>
            )}
            {u.vloga === "moderator" && (
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Moderator</span>
            )}
          </div>

          {confirmId === u.id ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Si prepričan?</span>
              <button onClick={() => block(u.id)} className="text-sm px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Da</button>
              <button onClick={() => setConfirmId(null)} className="text-sm px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Ne</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmId(u.id)}
              disabled={u.vloga === "blokiran"}
              className="text-red-500 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
            >
              {u.vloga === "blokiran" ? "Blokiran" : "Blokiraj"}
            </button>
          )}
        </div>
      ))}
      <Toast sporocila={sporocila} odstraniSporocilo={odstraniSporocilo} />
    </div>
  );
}