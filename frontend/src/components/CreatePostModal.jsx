import { useState, useEffect } from "react";

export default function CreatePostModal({ open, setOpen, refreshPosts }) {
    const [naslov, setNaslov] = useState("");
    const [vsebina, setVsebina] = useState("");
    const [kategorije, setKategorije] = useState([]);
    const [kategorijaId, setKategorijaId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("https://friforum-production.up.railway.app/kategorije")
            .then(res => res.json())
            .then(data => setKategorije(data));
    }, []);

    if (!open) return null;

    const createPost = async () => {
        setError("");

        if (vsebina.length < 10) {
            setError("Vsebina mora imeti vsaj 10 znakov");
            return;
        }

        if (!kategorijaId) {
            setError("Izberi kategorijo");
            return;
        }

        const token = localStorage.getItem("token");

        const res = await fetch("https://friforum-production.up.railway.app/objave/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                naslov,
                vsebina,
                kategorija_id: Number(kategorijaId)
            })
        });

        if (!res.ok) {
            const err = await res.text();
            console.log(err);
            setError("Objava ni uspela");
            return;
        }

        setNaslov("");
        setVsebina("");
        setKategorijaId("");
        setOpen(false);

        refreshPosts();
    };

    return (
        <div
            onClick={() => setOpen(false)}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(4px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    width: "400px"
                }}
            >
                <h3>Nova objava</h3>

                <input
                    placeholder="Naslov"
                    value={naslov}
                    onChange={(e) => setNaslov(e.target.value)}
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                <textarea
                    placeholder="Vsebina"
                    value={vsebina}
                    onChange={(e) => setVsebina(e.target.value)}
                    style={{ width: "100%", height: "100px", marginBottom: "10px" }}
                />

                <select
                    value={kategorijaId}
                    onChange={(e) => setKategorijaId(e.target.value)}
                    style={{ width: "100%", marginBottom: "10px" }}
                >
                    <option value="">Izberi kategorijo</option>
                    {kategorije.map(k => (
                        <option key={k.id} value={k.id}>
                            {k.naziv}
                        </option>
                    ))}
                </select>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button onClick={createPost}>
                    Objavi
                </button>
            </div>
        </div>
    );
}