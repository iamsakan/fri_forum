import { useEffect, useState } from "react";
import { adminFetch } from "./adminApi";
import Toast from "../../components/Toast";
import { useToast } from "../../hooks/useToast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [confirmId, setConfirmId] = useState(null);
  const { sporocila, dodajSporocilo, odstraniSporocilo } = useToast();
  const currentUsername = localStorage.getItem("uporabnisko_ime");

  const load = async () => {
    setUsers(await adminFetch("/admin/uporabniki"));
  };

  const block = async (id) => {
    await adminFetch(`/admin/uporabniki/${id}/blokiraj`, { method: "PUT" });
    dodajSporocilo("Uporabnik blokiran", "success");
    setConfirmId(null);
    load();
  };

  const changeRole = async (id, vloga) => {
    await adminFetch(`/admin/uporabniki/${id}/vloga`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vloga }),
    });
    dodajSporocilo("Vloga spremenjena!", "success");
    load();
  };

  const unblock = async (id) => {
    await adminFetch(`/admin/uporabniki/${id}/vloga`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vloga: "uporabnik" }),
    });
    dodajSporocilo("Uporabnik odblokirán!", "success");
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
  <div>
    <div className="flex items-center justify-between mb-5">
      <h1 className="text-lg font-semibold text-gray-900">Uporabniki</h1>
      <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-1">
        {users.length} uporabnikov
      </span>
    </div>

    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Uporabnik</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Vloga</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Dejanja</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const inicialke = u.uporabnisko_ime.slice(0, 2).toUpperCase();
            return (
              <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {inicialke}
                    </div>
                    <span className="font-medium text-gray-900">{u.uporabnisko_ime}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {u.vloga === "blokiran" ? (
                    <span className="text-xs font-medium bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Blokiran</span>
                  ) : (
                    <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Aktiven</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.vloga === "admin" ? (
                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Admin</span>
                  ) : u.vloga === "blokiran" || u.uporabnisko_ime === currentUsername ? (
                    <span className="text-gray-300">—</span>
                  ) : (
                    <select
                      value={u.vloga}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer hover:border-gray-300 transition"
                    >
                      <option value="uporabnik">Uporabnik</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {confirmId === u.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-gray-500">Si prepričan?</span>
                      <button onClick={() => block(u.id)} className="text-xs px-2.5 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer">Da</button>
                      <button onClick={() => setConfirmId(null)} className="text-xs px-2.5 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">Ne</button>
                    </div>
                  ) : u.vloga === "blokiran" ? (
                    <button onClick={() => unblock(u.id)} className="text-xs text-green-600 hover:bg-green-50 px-2.5 py-1 rounded-lg transition cursor-pointer">Odblokiraj</button>
                  ) : u.vloga === "admin" || u.uporabnisko_ime === currentUsername ? (
                    <span className="text-gray-300 text-xs">—</span>
                  ) : (
                    <button onClick={() => setConfirmId(u.id)} className="text-xs text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg transition cursor-pointer">Blokiraj</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <Toast sporocila={sporocila} odstraniSporocilo={odstraniSporocilo} />
  </div>
);
}