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
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">F</span>
              </div>
              FRI Forum
            </a>
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block"
            >
              Feed
            </a>
            <a
              href="/kategorije"
              className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block"
            >
              Kategorije
            </a>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
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
                  New Post
                </button>

                <button
                  onClick={() => setOpenNotifications(true)}
                  className="text-gray-500 hover:text-gray-900 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
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
