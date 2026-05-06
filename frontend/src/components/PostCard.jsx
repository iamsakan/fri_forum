import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PostCard({ post }) {
    const [votes, setVotes] = useState(post.skupaj_glasov || 0);
    const [userVote, setUserVote] = useState(null); // 'up' ali 'down'
    const navigate = useNavigate();

    const vote = async (tip, e) => {
        e.stopPropagation();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Moraš biti prijavljen");
            return;
        }

        const res = await fetch("http://localhost:8000/glasovi/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                objava_id: post.id,
                tip: tip
            })
        });

        if (res.ok) {
            if (userVote === tip) {
                // Toggle — odstrani glas
                setVotes(tip === "up" ? votes - 1 : votes + 1);
                setUserVote(null);
            } else if (userVote === null) {
                // Nov glas
                setVotes(tip === "up" ? votes + 1 : votes - 1);
                setUserVote(tip);
            } else {
                // Sprememba glasu
                setVotes(tip === "up" ? votes + 2 : votes - 2);
                setUserVote(tip);
            }
        }
    };

    const casObjave = () => {
        const diff = Math.floor((new Date() - new Date(post.cas_objave)) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const inicialke = post.profil?.uporabnisko_ime?.slice(0, 2).toUpperCase() || "??";

    return (
        <div
            onClick={() => navigate(`/objava/${post.id}`)}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition cursor-pointer"
        >
            <div className="flex gap-4">
                {/* Glasovanje — leva stran */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                        onClick={(e) => vote("up", e)}
                        className={`p-1 rounded hover:bg-gray-100 transition ${userVote === "up" ? "text-blue-600" : "text-gray-400"}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <span className={`text-sm font-semibold ${votes > 0 ? "text-blue-600" : votes < 0 ? "text-red-500" : "text-gray-500"}`}>
                        {votes}
                    </span>
                    <button
                        onClick={(e) => vote("down", e)}
                        className={`p-1 rounded hover:bg-gray-100 transition ${userVote === "down" ? "text-red-500" : "text-gray-400"}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Vsebina */}
                <div className="flex-1 min-w-0">
                    {/* Kategorija badge */}
                    {post.kategorija && (
                        <span
                            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2"
                            style={{
                                background: post.kategorija.barva + "20",
                                color: post.kategorija.barva
                            }}
                        >
                            {post.kategorija.naziv}
                        </span>
                    )}

                    {/* Naslov */}
                    <h2 className="text-base font-semibold text-gray-900 mb-1 leading-snug">
                        {post.naslov}
                    </h2>

                    {/* Vsebina preview */}
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {post.vsebina}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-700 text-xs font-bold" style={{fontSize: "8px"}}>{inicialke}</span>
                            </div>
                            <span>{post.profil?.uporabnisko_ime || "Anon"}</span>
                        </div>
                        <span>•</span>
                        <span>{casObjave()}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>komentarji</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}