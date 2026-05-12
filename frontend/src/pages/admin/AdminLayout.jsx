import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminLayout() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/");
      return;
    }

    fetch("https://friforum-production.up.railway.app/profil/me", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        const vloga = data.profil?.vloga;
        if (vloga !== "admin" && vloga !== "moderator") {
          nav("/");
        } else {
          setLoading(false);
        }
      })
      .catch(() => nav("/"));
  }, []);

  if (loading) return null;

  const logout = () => {
    localStorage.removeItem("token");
    nav("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-64 bg-white border-r p-4">
        <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-900 mb-4 block">← Homepage</a>
        <nav className="flex flex-col gap-2 text-sm">
          <Link to="/admin/objave">Objave</Link>
          <Link to="/admin/komentarji">Komentarji</Link>
          <Link to="/admin/kategorije">Kategorije</Link>
          <Link to="/admin/prijave">Prijave</Link>
          <Link to="/admin/users">Uporabniki</Link>
        </nav>
        <button onClick={logout} className="mt-6 text-red-500 text-sm">
          Logout
        </button>
      </div>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}