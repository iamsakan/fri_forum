import { useEffect, useState } from "react";

export default function ProfileModal({ open, setOpen }) {
    const [profil, setProfil] = useState(null);
    const [objave, setObjave] = useState([]);
    const [komentarji, setKomentarji] = useState([]);
    const [uporabniskoIme, setUporabniskoIme] = useState("");
    const [bio, setBio] = useState("");
    const [aktivniTab, setAktivniTab] = useState("objave");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        const token = localStorage.getItem("token");

        const loadData = async () => {
            setLoading(true);
            try {
                const res = await fetch("http://localhost:8000/profil/me", {
                    headers: { Authorization: "Bearer " + token }
                });
                const data = await res.json();
                setProfil(data.profil);
                setUporabniskoIme(data.profil.uporabnisko_ime);
                setBio(data.profil.bio || "");
                setObjave(data.objave || []);
                setKomentarji(data.komentarji || []);
            } catch (err) {
                console.log("ERROR:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [open]);

    const saveProfile = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/profil/me", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ uporabnisko_ime: uporabniskoIme, bio })
        });
        if (res.ok) {
            localStorage.setItem("uporabnisko_ime", uporabniskoIme);
            alert("Profil posodobljen!");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("uporabnisko_ime");
        window.location.href = "/";
    };

    if (!open) return null;

    const inicialke = profil?.uporabnisko_ime?.slice(0, 2).toUpperCase() || "??";

    return (
        <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white rounded-xl border border-gray-200 shadow-lg max-h-[85vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Moj profil</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={handleLogout}
                                className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition"
                            >
                                Odjava
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Avatar + info */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-700 text-lg font-bold">{inicialke}</span>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{profil?.uporabnisko_ime}</p>
                            <p className="text-sm text-gray-500">{profil?.vloga}</p>
                        </div>
                    </div>

                    {/* Statistika */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-xl font-bold text-blue-600">{objave.length}</p>
                            <p className="text-xs text-gray-500">Objave</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-xl font-bold text-purple-600">{komentarji.length}</p>
                            <p className="text-xs text-gray-500">Komentarji</p>
                        </div>
                    </div>
                </div>

                {/* Urejanje profila */}
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Uredi profil</h3>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Uporabniško ime</label>
                            <input
                                value={uporabniskoIme}
                                onChange={(e) => setUporabniskoIme(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={2}
                                placeholder="Povejte nekaj o sebi..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
                            />
                        </div>
                        <button
                            onClick={saveProfile}
                            className="bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-700 transition"
                        >
                            Shrani spremembe
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setAktivniTab("objave")}
                        className={`flex-1 py-3 text-sm font-medium transition ${
                            aktivniTab === "objave"
                                ? "text-gray-900 border-b-2 border-gray-900"
                                : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        Objave ({objave.length})
                    </button>
                    <button
                        onClick={() => setAktivniTab("komentarji")}
                        className={`flex-1 py-3 text-sm font-medium transition ${
                            aktivniTab === "komentarji"
                                ? "text-gray-900 border-b-2 border-gray-900"
                                : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        Komentarji ({komentarji.length})
                    </button>
                </div>

                {/* Vsebina tabov */}
                <div className="p-4">
                    {loading ? (
                        <p className="text-center text-gray-400 py-4">Nalagam...</p>
                    ) : aktivniTab === "objave" ? (
                        objave.length === 0 ? (
                            <p className="text-center text-gray-400 py-4 text-sm">Še nimate objav</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {objave.map(o => (
                                    <a
                                        key={o.id}
                                        href={`/objava/${o.id}`}
                                        className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition"
                                    >
                                        <p className="text-sm font-medium text-gray-900">{o.naslov}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{o.kategorija?.naziv}</p>
                                    </a>
                                ))}
                            </div>
                        )
                    ) : (
                        komentarji.length === 0 ? (
                            <p className="text-center text-gray-400 py-4 text-sm">Še nimate komentarjev</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {komentarji.map(k => (
                                    <div key={k.id} className="p-3 rounded-lg border border-gray-100">
                                        <p className="text-sm text-gray-700">{k.vsebina}</p>
                                        <p className="text-xs text-gray-400 mt-1">Na objavi: {k.objava?.naslov}</p>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}