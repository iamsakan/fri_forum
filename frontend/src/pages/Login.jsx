import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [geslo, setGeslo] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");

        try {
            const res = await fetch("http://localhost:8000/auth/prijava", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    geslo
                })
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                console.log("LOGIN ERROR:", data);
                setError(data?.detail || "Prijava ni uspela");
                return;
            }

            const token = typeof data === "string" ? data : (data?.access_token || data?.token || data);

            if (!token) {
                setError("Ni tokena iz strežnika");
                return;
            }

            localStorage.setItem("token", token);
            window.location.href = "/";
        } catch (err) {
            console.log(err);
            setError("Napaka pri povezavi s strežnikom");
        }
    };

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{
                width: "300px",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "10px"
            }}>
                <h2>Prijava</h2>

                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                <input
                    type="password"
                    placeholder="Geslo"
                    value={geslo}
                    onChange={(e) => setGeslo(e.target.value)}
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button onClick={handleLogin} style={{ width: "100%" }}>
                    Prijava
                </button>
            </div>
        </div>
    );
}