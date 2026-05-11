import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PostList from "../components/PostList";
import SortBar from "../components/SortBar";
import CategoryFilter from "../components/CategoryFilter";

export default function Home() {
    const [query, setQuery] = useState("");
    const [posts, setPosts] = useState([]);
    const [sort, setSort] = useState("new");
    const [kategorije, setKategorije] = useState([]);
    const [aktivnaKategorija, setAktivnaKategorija] = useState(null);

    const fetchPosts = () => {
        let url = `http://localhost:8000/objave/?sort=${sort}`;
        if (query) url += `&q=${query}`;
        if (aktivnaKategorija) url += `&kategorija_id=${aktivnaKategorija}`;

        fetch(url)
            .then((res) => res.json())
            .then((data) => setPosts(data.objave || []));
    };

    const fetchMojiGlasovi = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:8000/glasovi/moji", {
            headers: { Authorization: "Bearer " + token }
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("moji_glasovi", JSON.stringify(data));
        }
    };

    useEffect(() => {
        fetchKategorije();
        fetchMojiGlasovi();
    }, []);

    const fetchKategorije = () => {
        fetch("http://localhost:8000/kategorije")
            .then((res) => res.json())
            .then((data) => setKategorije(data));
    };

    useEffect(() => {
        fetchKategorije();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [sort, query, aktivnaKategorija]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar setQuery={setQuery} refreshPosts={fetchPosts} />

            <div className="max-w-3xl mx-auto px-4 py-6">
                {/* Naslov */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Discussion Feed</h1>
                    <p className="text-gray-500 text-sm mt-1">Connect with fellow students, ask questions, and share knowledge</p>
                </div>

                {/* Filter kategorij */}
                <div className="flex gap-2 flex-wrap mb-4">
                    <button
                        onClick={() => setAktivnaKategorija(null)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                            aktivnaKategorija === null
                                ? "bg-gray-900 text-white"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                    >
                        All Categories
                    </button>
                    {kategorije.map(k => (
                        <button
                            key={k.id}
                            onClick={() => setAktivnaKategorija(k.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                                aktivnaKategorija === k.id
                                    ? "bg-gray-900 text-white"
                                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
                            }`}
                        >
                            {k.naziv}
                        </button>
                    ))}
                </div>

                {/* Sort bar */}
                <div className="flex gap-2 mb-4">
                    {[
                        { key: "new", label: "Recent", icon: "🕐" },
                        { key: "top", label: "Upvotes", icon: "⬆️" },
                    ].map(s => (
                        <button
                            key={s.key}
                            onClick={() => setSort(s.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition border ${
                                sort === s.key
                                    ? "bg-gray-100 border-gray-300 text-gray-900 font-medium"
                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                        >
                            <span>{s.icon}</span>
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Seznam objav */}
                <div className="flex flex-col gap-3">
                    {posts.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-lg">Ni objav</p>
                            <p className="text-sm mt-1">Bodite prvi ki ustvari objavo!</p>
                        </div>
                    ) : (
                        <PostList posts={posts} />
                    )}
                </div>
            </div>
        </div>
    );
}