import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [geslo, setGeslo] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            const res = await fetch("https://friforum-production.up.railway.app/auth/prijava", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, geslo })
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                setError(data?.detail || "Prijava ni uspela");
                return;
            }

            const token = data?.access_token;
            if (!token) {
                setError("Ni tokena iz strežnika");
                return;
            }

            localStorage.setItem("token", token);
            localStorage.setItem("user_id", data.user_id);
            window.location.href = "/";
        } catch (err) {
            setError("Napaka pri povezavi s strežnikom");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">F</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">FRI Forum</span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">Dobrodošli nazaj</h1>
                    <p className="text-sm text-gray-500 mb-6">Prijavite se v vaš račun</p>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="vas@fri.uni-lj.si"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Geslo</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={geslo}
                                onChange={(e) => setGeslo(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
                        >
                            {loading ? "Prijavljam..." : "Prijava"}
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Nimate računa?{" "}
                        <a href="/registracija" className="text-blue-600 hover:underline font-medium">
                            Registracija
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}