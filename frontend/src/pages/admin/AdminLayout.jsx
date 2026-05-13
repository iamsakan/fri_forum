import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [vloga, setVloga] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { nav("/"); return; }

    fetch("https://friforum-production.up.railway.app/profil/me", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        const v = data.profil?.vloga;
        if (v !== "admin" && v !== "moderator") {
          nav("/");
        } else {
          setVloga(v);
          localStorage.setItem("vloga", v);
          setLoading(false);
        }
      })
      .catch(() => nav("/"));
  }, []);

  // Redirect moderatorja stran od admin-only strani
  useEffect(() => {
    if (!vloga) return;
    const adminOnly = ["/admin/kategorije", "/admin/users"];
    if (vloga === "moderator" && adminOnly.includes(location.pathname)) {
      nav("/admin/objave");
    }
  }, [vloga, location.pathname]);

  if (loading) return null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("vloga");
    nav("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const allLinks = [
    { to: "/admin/objave",     label: "Objave",      icon: "ti-file-text", roles: ["admin", "moderator"] },
    { to: "/admin/komentarji", label: "Komentarji",  icon: "ti-message",   roles: ["admin", "moderator"] },
    { to: "/admin/prijave",    label: "Prijave",     icon: "ti-flag",      roles: ["admin", "moderator"] },
    { to: "/admin/kategorije", label: "Kategorije",  icon: "ti-tag",       roles: ["admin"] },
    { to: "/admin/users",      label: "Uporabniki",  icon: "ti-users",     roles: ["admin"] },
  ];

  const links = allLinks.filter(l => l.roles.includes(vloga));

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-56 bg-white border-r flex flex-col min-h-screen shrink-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-base font-semibold text-gray-900">Admin Panel</h1>
            {vloga === "moderator" && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                Mod
              </span>
            )}
          </div>
          <a href="/" className="text-xs text-gray-400 hover:text-gray-700 transition">
            ← Homepage
          </a>
        </div>

        <nav className="flex flex-col py-2 flex-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-2.5 px-4 py-2 text-sm transition border-l-2 ${
                isActive(l.to)
                  ? "bg-gray-50 text-gray-900 font-medium border-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-transparent"
              }`}
            >
              <i className={`ti ${l.icon} text-base`} aria-hidden="true" />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition cursor-pointer"
          >
            <i className="ti ti-logout text-base" aria-hidden="true" />
            Odjava
          </button>
        </div>
      </div>

      {/* Vsebina */}
      <div className="flex-1 p-6 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}