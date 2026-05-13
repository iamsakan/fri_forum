import { useState, useEffect, useRef } from "react";
import SearchBar from "./SearchBar";
import CreatePostModal from "./CreatePostModal";
import ProfileModal from "./ProfileModal";
import NotificationsModal from "./NotificationsModal";

export default function Navbar({ setQuery, refreshPosts }) {
  const [openModal, setOpenModal] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inicialke, setInicialke] = useState("?");
  const [openNotifications, setOpenNotifications] = useState(false);
  const [neprebrane, setNeprebrane] = useState(0);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const burgerRef = useRef(null);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const ime = localStorage.getItem("uporabnisko_ime");
    setIsLoggedIn(!!token);
    if (ime) setInicialke(ime.slice(0, 2).toUpperCase());
  };

  const fetchNeprebrane = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("https://friforum-production.up.railway.app/notifikacije/", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setNeprebrane(data.filter((n) => !n.prebrana).length))
      .catch(() => {});
  };

  useEffect(() => {
    checkAuth();
    fetchNeprebrane();
    const interval = setInterval(fetchNeprebrane, 30000);
    window.addEventListener("storage", checkAuth);

    const token = localStorage.getItem("token");
    if (token) {
      fetch("https://friforum-production.up.railway.app/profil/me", {
        headers: { Authorization: "Bearer " + token },
      }).then((res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          localStorage.removeItem("uporabnisko_ime");
          localStorage.removeItem("vloga");
          checkAuth();
        }
      });
    }

    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (burgerRef.current && !burgerRef.current.contains(e.target)) {
        setBurgerOpen(false);
      }
    };
    if (burgerOpen) document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [burgerOpen]);

  const handleLogin = () => (window.location.href = "/login");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("uporabnisko_ime");
    checkAuth();
    window.location.href = "/";
  };

  const isAdmin = localStorage.getItem("vloga") === "admin";
  const isModerator = localStorage.getItem("vloga") === "moderator";

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        {/* Glavna vrstica */}
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg shrink-0">
            <div className="w-7 h-7">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <rect width="100" height="100" rx="20" fill="#2563EB"/>
                <rect x="22" y="25" width="56" height="12" rx="3" fill="white"/>
                <rect x="22" y="44" width="40" height="12" rx="3" fill="white"/>
                <rect x="22" y="63" width="56" height="12" rx="3" fill="white"/>
              </svg>
            </div>
            <span className="hidden sm:inline">FRI Forum</span>
          </a>

          {/* Search — samo na desktop */}
          <div className="hidden sm:flex flex-1 max-w-md">
            <SearchBar setQuery={setQuery} />
          </div>

          {/* Desna stran */}
          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn ? (
              <>
                {/* Desktop only */}
                {(isAdmin || isModerator) && (
  
                  <a href="/admin/objave"
                    className="hidden sm:inline-flex text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 transition"
                  >
                    {isModerator ? "Moderator" : "Admin"}
                  </a>
                )}
                <button
                  onClick={() => setOpenModal(true)}
                  className="hidden sm:flex items-center gap-1 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-700 transition cursor-pointer"
                >
                  <span className="text-lg leading-none">+</span>
                  Nova objava
                </button>

                {/* Zvonček — vedno viden */}
                <div className="relative">
                  <button
                    onClick={() => { setOpenNotifications(true); setNeprebrane(0); }}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                  {neprebrane > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                      {neprebrane}
                    </span>
                  )}
                </div>

                {/* Avatar — vedno viden */}
                <div
                  onClick={() => setOpenProfile(true)}
                  className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer hover:bg-blue-200 transition"
                >
                  <span className="text-blue-700 text-xs font-bold">{inicialke}</span>
                </div>

                {/* Burger — samo na mobilnem */}
                <div className="relative sm:hidden" ref={burgerRef}>
                  <button
                    onClick={() => setBurgerOpen((p) => !p)}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition cursor-pointer"
                  >
                    {burgerOpen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>

                  {burgerOpen && (
                    <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                      <button
                        onClick={() => { setOpenModal(true); setBurgerOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 cursor-pointer border-b border-gray-100"
                      >
                        <span className="text-base font-medium">+</span> Nova objava
                      </button>
                      {(isAdmin || isModerator) && (
  
                        <a href="/admin/objave"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition border-b border-gray-100"
                        >
                          {isModerator ? "Moderator panel" : "Admin panel"}
                        </a>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer"
                      >
                        Odjava
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-gray-900 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-gray-700 transition cursor-pointer"
              >
                Prijava
              </button>
            )}
          </div>
        </div>

        {/* Search — samo na mobilnem, pod glavno vrstico */}
        <div className="sm:hidden px-4 pb-3">
          <SearchBar setQuery={setQuery} />
        </div>
      </nav>

      {isLoggedIn && (
        <CreatePostModal open={openModal} setOpen={setOpenModal} refreshPosts={refreshPosts} />
      )}
      {isLoggedIn && (
        <ProfileModal open={openProfile} setOpen={setOpenProfile} />
      )}
      {isLoggedIn && (
        <NotificationsModal open={openNotifications} setOpen={setOpenNotifications} />
      )}
    </>
  );
}