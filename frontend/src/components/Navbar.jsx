import { useState, useEffect } from "react";
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

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const ime = localStorage.getItem("uporabnisko_ime");
    setIsLoggedIn(!!token);
    if (ime) setInicialke(ime.slice(0, 2).toUpperCase());
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogin = () => (window.location.href = "/login");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("uporabnisko_ime");
    checkAuth();
    window.location.href = "/";
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6 shrink-0">
            <a
              href="/"
              className="flex items-center gap-2 font-bold text-gray-900 text-lg"
            >
              <div className="w-7 h-7">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                  <rect width="100" height="100" rx="20" fill="#2563EB"/>
                  <rect x="22" y="25" width="56" height="12" rx="3" fill="white"/>
                  <rect x="22" y="44" width="40" height="12" rx="3" fill="white"/>
                  <rect x="22" y="63" width="56" height="12" rx="3" fill="white"/>
                </svg>
              </div>
              FRI Forum
            </a>
          </div>

          {/* Search */}
          <div className="flex-4 max-w-md">
            <SearchBar setQuery={setQuery} />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setOpenModal(true)}
                  className="flex items-center gap-1 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-700 transition"
                >
                  <span className="text-lg leading-none">+</span>
                  Nova objava
                </button>

                <div
                  onClick={() => setOpenProfile(true)}
                  className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer hover:bg-blue-200 transition"
                >
                  <span className="text-blue-700 text-xs font-bold">
                    {inicialke}
                  </span>
                </div>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-gray-900 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-gray-700 transition"
              >
                Prijava
              </button>
            )}
          </div>
        </div>
      </nav>

      {isLoggedIn && (
        <CreatePostModal
          open={openModal}
          setOpen={setOpenModal}
          refreshPosts={refreshPosts}
        />
      )}

      {isLoggedIn && (
        <ProfileModal open={openProfile} setOpen={setOpenProfile} />
      )}

      {isLoggedIn && (
        <NotificationsModal
          open={openNotifications}
          setOpen={setOpenNotifications}
        />
      )}
    </>
  );
}
