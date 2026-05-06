import { useEffect, useState } from "react";

export default function ProfileModal({ open, setOpen }) {
    const [profile, setProfile] = useState(null);
    const [objave, setObjave] = useState([]);
    const [komentarji, setKomentarji] = useState([]);
    const [uporabniskoIme, setUporabniskoIme] = useState("");

    useEffect(() => {
        if (!open) return;

        const token = localStorage.getItem("token");

        const loadData = async () => {
            try {
                // 🔥 1. NAJPREJ DOBI USERJA
                const resProfile = await fetch("http://localhost:8000/profil/me", {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                });

                const profileData = await resProfile.json();
                setProfile(profileData);
                setUporabniskoIme(profileData.uporabnisko_ime);

                // 🔥 2. OBJAVE – FILTRIRAJ PO USER ID
                const resObjave = await fetch("http://localhost:8000/objave/");
                const objaveData = await resObjave.json();

                const allObjave = objaveData.objave || [];
                const mojeObjave = allObjave.filter(
                    (o) => o.uporabnik_id === profileData.id
                );

                setObjave(mojeObjave);

                // 🔥 3. KOMENTARJI – ISTO
                // ⚠️ backend endpoint zahteva objava_id → zato fallback
                const resKomentarji = await fetch("http://localhost:8000/komentarji/1");
                const komentarjiData = await resKomentarji.json();

                let allKomentarji = [];

                if (Array.isArray(komentarjiData)) {
                    allKomentarji = komentarjiData;
                } else if (Array.isArray(komentarjiData.komentarji)) {
                    allKomentarji = komentarjiData.komentarji;
                }

                const mojiKomentarji = allKomentarji.filter(
                    (k) => k.uporabnik_id === profileData.id
                );

                setKomentarji(mojiKomentarji);

            } catch (err) {
                console.log("ERROR PROFILE:", err);
            }
        };

        loadData();
    }, [open]);

    const saveProfile = async () => {
        const token = localStorage.getItem("token");

        await fetch("http://localhost:8000/profil/me", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                uporabnisko_ime: uporabniskoIme
            })
        });

        alert("Profil posodobljen");
    };

    if (!open) return null;

    return (
        <div
            onClick={() => setOpen(false)}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(6px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "600px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    background: "white",
                    borderRadius: "10px",
                    padding: "20px"
                }}
            >
                <h2>Moj profil</h2>

                {/* EDIT */}
                <div style={{ marginBottom: 15 }}>
                    <input
                        value={uporabniskoIme}
                        onChange={(e) => setUporabniskoIme(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                    />

                    <button onClick={saveProfile} style={{ marginTop: 10 }}>
                        Shrani profil
                    </button>
                </div>

                <hr />

                {/* OBJAVE */}
                <h3>Moje objave</h3>
                {objave.length === 0 && <p>Ni objav</p>}
                {objave.map(o => (
                    <div key={o.id} style={{ borderBottom: "1px solid #ddd", padding: 5 }}>
                        {o.naslov}
                    </div>
                ))}

                <hr />

                {/* KOMENTARJI */}
                <h3>Moji komentarji</h3>
                {komentarji.length === 0 && <p>Ni komentarjev</p>}
                {komentarji.map(k => (
                    <div key={k.id} style={{ borderBottom: "1px solid #ddd", padding: 5 }}>
                        {k.vsebina}
                    </div>
                ))}
            </div>
        </div>
    );
}