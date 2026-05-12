import { Link, Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    nav("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r p-4">
        <h1 className="text-xl font-bold mb-6">Admin Panel</h1>

        <nav className="flex flex-col gap-2 text-sm">
          <Link to="/admin/objave">Objave</Link>
          <Link to="/admin/komentarji">Komentarji</Link>
          <Link to="/admin/kategorije">Kategorije</Link>
          <Link to="/admin/prijave">Prijave</Link>
          <Link to="/admin/users">Uporabniki</Link>
        </nav>

        <button
          onClick={logout}
          className="mt-6 text-red-500 text-sm"
        >
          Logout
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}