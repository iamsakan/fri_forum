import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import CreatePostModal from "./CreatePostModal";
import ProfileModal from "./ProfileModal";

export default function Navbar({ setQuery, refreshPosts }) {
    const [openModal, setOpenModal] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkAuth = () => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    };

    useEffect(() => {
        checkAuth();

        const onStorageChange = () => {
            checkAuth();
        };

        window.addEventListener("storage", onStorageChange);

        return () => {
            window.removeEventListener("storage", onStorageChange);
        };
    }, []);

    const handleLogin = () => {
        window.location.href = "/login";
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        checkAuth();
        window.location.href = "/";
    };

    return (
        <>
            <nav style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                borderBottom: "1px solid #ddd"
            }}>
                <h2>Forum</h2>

                <SearchBar setQuery={setQuery} />

                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                    {isLoggedIn ? (
                        <>
                            <button onClick={() => setOpenModal(true)}>
                                + Objava
                            </button>

                            <div style={{ cursor: "pointer" }}>
                                🔔
                            </div>

                            <div
                                onClick={() => setOpenProfile(true)}
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    border: "1px solid #ddd",
                                    cursor: "pointer"
                                }}
                            >
                                <img
                                    src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftravelhonestly.com%2Fwp-content%2Fuploads%2F2023%2F08%2Fburek.jpg"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}
                                />
                            </div>

                            <button onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={handleLogin}>
                            🔑 Prijava
                        </button>
                    )}
                </div>
            </nav>

            {/* CREATE POST */}
            {isLoggedIn && (
                <CreatePostModal
                    open={openModal}
                    setOpen={setOpenModal}
                    refreshPosts={refreshPosts}
                />
            )}

            {/* PROFILE */}
            {isLoggedIn && (
                <ProfileModal
                    open={openProfile}
                    setOpen={setOpenProfile}
                />
            )}
        </>
    );
}