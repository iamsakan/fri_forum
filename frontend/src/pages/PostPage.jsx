import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProfileModal from "../components/ProfileModal";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";

function countAllComments(komentarji) {
  let count = 0;

  for (const k of komentarji) {
    count += 1;

    if (Array.isArray(k.odgovori)) {
      count += k.odgovori.length;
    }
  }

  return count;
}


export default function PostPage() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [komentarji, setKomentarji] = useState([]);
  const [novKomentar, setNovKomentar] = useState("");
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [profileMode, setProfileMode] = useState("me");
  const [priloge, setPriloge] = useState([]);
  const [komentarFile, setKomentarFile] = useState(null);
  const [komentarPreview, setKomentarPreview] = useState(null);
  const komentarFileRef = useRef(null);
  const { sporocila, dodajSporocilo, odstraniSporocilo } = useToast();

  useEffect(() => {
    const loadAll = async () => {
      // Najprej glasovi
      const token = localStorage.getItem("token");
      if (token) {
        const resGlasovi = await fetch("https://friforum-production.up.railway.app/glasovi/moji", {
          headers: { Authorization: "Bearer " + token },
        });
        if (resGlasovi.ok) {
          const glasoviData = await resGlasovi.json();
          localStorage.setItem("moji_glasovi", JSON.stringify(glasoviData));
          setUserVote(glasoviData[String(id)] || null);
        }
      }

      // Potem objava
      const resObjava = await fetch(`https://friforum-production.up.railway.app/objave/${id}`);
      const objavaData = await resObjava.json();
      setPost(objavaData);
      setVotes(objavaData.skupaj_glasov || 0);

      // Priloge
      const resPriloge = await fetch(`https://friforum-production.up.railway.app/objave/${id}/priloge`);
      const prilogeData = await resPriloge.json();
      setPriloge(Array.isArray(prilogeData) ? prilogeData : []);

      // Komentarji
    const resKomentarji = await fetch(
        `https://friforum-production.up.railway.app/komentarji/${id}`,
    );
    const komentarjiData = await resKomentarji.json();
    setKomentarji(Array.isArray(komentarjiData) ? komentarjiData : []);

    // Glasovi na komentarjih
    if (token) {
        const resGlasoviKomentarjev = await fetch(
            "https://friforum-production.up.railway.app/glasovi/moji/komentarji",
            { headers: { Authorization: "Bearer " + token } }
        );
        if (resGlasoviKomentarjev.ok) {
            const glasoviKomentarjev = await resGlasoviKomentarjev.json();
            localStorage.setItem("moji_glasovi_komentarjev", JSON.stringify(glasoviKomentarjev));
            }
        }
    };

    loadAll();
  }, [id]);

  const refreshKomentarji = async () => {
    const res = await fetch(`https://friforum-production.up.railway.app/komentarji/${id}`);
    const data = await res.json();
    setKomentarji(Array.isArray(data) ? data : []);
  };

  const vote = async (tip) => {
    const token = localStorage.getItem("token");
    if (!token) {
      dodajSporocilo("Moraš biti prijavljen", "warning");
      return;
    }

    const res = await fetch("https://friforum-production.up.railway.app/glasovi/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ objava_id: parseInt(id), tip }),
    });

    if (res.ok) {
      if (userVote === tip) {
        setVotes(tip === "up" ? votes - 1 : votes + 1);
        setUserVote(null);
      } else if (userVote === null) {
        setVotes(tip === "up" ? votes + 1 : votes - 1);
        setUserVote(tip);
      } else {
        setVotes(tip === "up" ? votes + 2 : votes - 2);
        setUserVote(tip);
      }
    }
  };

  const dodajKomentar = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      dodajSporocilo("Moraš biti prijavljen", "warning");
      return;
    }
    if (!novKomentar.trim()) return;

    setLoading(true);
    const res = await fetch("https://friforum-production.up.railway.app/komentarji/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ vsebina: novKomentar, objava_id: parseInt(id) }),
    });

    if (res.ok) {
      const komentar = await res.json();
      
      // Upload slike če obstaja
      if (komentarFile) {
        const formData = new FormData();
        formData.append("datoteka", komentarFile);
        await fetch(`https://friforum-production.up.railway.app/komentarji/${komentar.id}/priloge`, {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: formData,
        });
        setKomentarFile(null);
        setKomentarPreview(null);
      }

      setNovKomentar("");
      await refreshKomentarji();
    }
    setLoading(false);
};

    const report = async (tip, idTarget) => {
    const token = localStorage.getItem("token");
    if (!token) return dodajSporocilo("Moraš biti prijavljen", "warning");

    await fetch("https://friforum-production.up.railway.app/prijave/", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
        tip,
        target_id: idTarget,
        }),
    });

    dodajSporocilo("Prijavljeno!", "success");
    };

  const casNazaj = (datum) => {
    const diff = Math.floor((new Date() - new Date(datum + "Z")) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

  if (!post)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Nalagam...</p>
      </div>
    );

  const inicialkeAvtorja =
    post.profil?.uporabnisko_ime?.slice(0, 2).toUpperCase() || "??";

  const openProfile = (username) => {
    const currentUser = localStorage.getItem("uporabnisko_ime");

    setSelectedUser(username);
    setProfileMode(username === currentUser ? "me" : "user");
    setProfileOpen(true);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
        >
          ← Nazaj
        </button>

        {/* Objava */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          {post.kategorija && (
            <span
              className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3"
              style={{
                background: post.kategorija.barva + "20",
                color: post.kategorija.barva,
              }}
            >
              {post.kategorija.naziv}
            </span>
          )}

          <h1 className="text-xl font-bold text-gray-900 mb-3">
            {post.naslov}
          </h1>

          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <span
                className="text-blue-700 font-bold"
                style={{ fontSize: "9px" }}
              >
                {inicialkeAvtorja}
              </span>
            </div>
            <span
              onClick={() => openProfile(post.profil?.uporabnisko_ime)}
              className="cursor-pointer hover:underline"
            >
              {post.profil?.uporabnisko_ime || "Anon"}
            </span>
            <span>•</span>
            <span>{casNazaj(post.cas_objave)}</span>
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">{post.vsebina}</p>

          {/* Priloge */}
            {priloge.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                    {priloge.map((p) => (
                        p.tip_datoteke.startsWith("image/") ? (
                            <a key={p.id} href={p.pot} target="_blank" rel="noopener noreferrer">
                                <img src={p.pot} alt={p.ime_datoteke} className="rounded-lg max-h-96 object-contain border border-gray-200 cursor-pointer hover:opacity-90 transition" />
                            </a>
                        ) : (
                            <a key={p.id} href={p.pot} target="_blank" className="text-blue-600 hover:underline text-sm">📎 {p.ime_datoteke}</a>
                        )
                    ))}
                </div>
            )}

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => vote("up")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition text-sm font-medium ${
                userVote === "up"
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              ↑ Upvote
            </button>
            <span
              className={`text-sm font-semibold ${votes > 0 ? "text-blue-600" : votes < 0 ? "text-red-500" : "text-gray-500"}`}
            >
              {votes}
            </span>
            <button
              onClick={() => vote("down")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition text-sm ${
                userVote === "down"
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              ↓ Downvote
            </button>
            <button
              onClick={() => report("objava", post.id)}
              className="text-xs text-red-500 ml-2"
            >
              Report
            </button>
            <span className="text-sm text-gray-400 ml-2">
              💬 {countAllComments(komentarji)} komentarjev
            </span>
          </div>
        </div>

        {/* Dodaj komentar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <span className="text-gray-400 text-xs">?</span>
            </div>
            <div className="flex-1">
            <textarea
                value={novKomentar}
                onChange={(e) => setNovKomentar(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
            {komentarPreview && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                <img src={komentarPreview} alt="preview" className="w-full max-h-40 object-cover" />
                </div>
            )}
            <div className="flex items-center gap-2 mt-2">
                <button
                onClick={dodajKomentar}
                disabled={loading || !novKomentar.trim()}
                className="bg-gray-700 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
                >
                {loading ? "Pošiljam..." : "Post Comment"}
                </button>
                <button
                onClick={() => komentarFileRef.current.click()}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                📎 Dodaj sliko
                </button>
                {komentarFile && (
                <button
                    onClick={() => { setKomentarFile(null); setKomentarPreview(null); }}
                    className="text-sm text-red-500 hover:text-red-700"
                >
                    odstrani
                </button>
                )}
            </div>
            <input
                ref={komentarFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                const f = e.target.files[0];
                if (!f) return;
                setKomentarFile(f);
                setKomentarPreview(URL.createObjectURL(f));
                }}
            />
            </div>
        </div>
        </div>

        {/* Komentarji */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
                {countAllComments(komentarji)}{" "}
                {countAllComments(komentarji) === 1 ? "Comment" : "Comments"}
            </h3>

          {komentarji.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-sm">
              Še ni komentarjev — bodite prvi!
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {komentarji.map((k) => (
                <KomentarKomponenta
                  key={k.id}
                  komentar={k}
                  casNazaj={casNazaj}
                  objavaId={id}
                  refreshKomentarji={refreshKomentarji}
                  openProfile={openProfile}
                  dodajSporocilo={dodajSporocilo}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <ProfileModal
        open={profileOpen}
        setOpen={setProfileOpen}
        username={selectedUser}
        mode={profileMode}
      />
      <Toast sporocila={sporocila} odstraniSporocilo={odstraniSporocilo} />
    </div>
  );
}

function KomentarKomponenta({
  komentar,
  casNazaj,
  objavaId,
  refreshKomentarji,
  openProfile,
  dodajSporocilo,
}) {
  const navigate = useNavigate();
  const [score, setScore] = useState(komentar.glasovi || 0);
    const shranjeniGlasoviKomentarjev = JSON.parse(
        localStorage.getItem("moji_glasovi_komentarjev") || "{}"
    );
    const [userVote, setUserVote] = useState(
        shranjeniGlasoviKomentarjev[String(komentar.id)] || null
    );
  const [showOdgovor, setShowOdgovor] = useState(false);
  const [novOdgovor, setNovOdgovor] = useState("");
  const [loading, setLoading] = useState(false);

  const [priloge, setPriloge] = useState([]);

    useEffect(() => {
        fetch(`https://friforum-production.up.railway.app/komentarji/${komentar.id}/priloge`)
            .then(res => res.json())
            .then(data => setPriloge(Array.isArray(data) ? data : []));
    }, [komentar.id]);

  const voteComment = async (tip) => {
    const token = localStorage.getItem("token");
    if (!token) return dodajSporocilo("Moraš biti prijavljen", "warning");

    const res = await fetch("https://friforum-production.up.railway.app/glasovi/komentar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        komentar_id: komentar.id,
        tip,
      }),
    });

    if (res.ok) {
      if (userVote === tip) {
        setScore(tip === "up" ? score - 1 : score + 1);
        setUserVote(null);
      } else if (!userVote) {
        setScore(tip === "up" ? score + 1 : score - 1);
        setUserVote(tip);
      } else {
        setScore(tip === "up" ? score + 2 : score - 2);
        setUserVote(tip);
      }
    }
};

  const report = async (tip, idTarget) => {
    const token = localStorage.getItem("token");
    if (!token) return dodajSporocilo("Moraš biti prijavljen", "warning");

    await fetch("https://friforum-production.up.railway.app/prijave/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        tip: tip,
        target_id: idTarget,
      }),
    });

    dodajSporocilo("Prijavljeno!", "success");
  };

  const odgovori = komentar.odgovori || [];
  const inicialke =
    komentar.profil?.uporabnisko_ime?.slice(0, 2).toUpperCase() || "??";

  const dodajOdgovor = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      dodajSporocilo("Moraš biti prijavljen", "warning");
      return;
    }
    if (!novOdgovor.trim()) return;

    setLoading(true);
    const res = await fetch("https://friforum-production.up.railway.app/komentarji/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        vsebina: novOdgovor,
        objava_id: parseInt(objavaId),
        stars_id: komentar.id,
      }),
    });

    if (res.ok) {
      setNovOdgovor("");
      setShowOdgovor(false);
      await refreshKomentarji();
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <span className="text-blue-700 font-bold" style={{ fontSize: "9px" }}>
          {inicialke}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            onClick={() => openProfile(komentar.profil?.uporabnisko_ime)}
            className="text-sm font-medium text-gray-900 cursor-pointer hover:underline"
          >
            {komentar.profil?.uporabnisko_ime || "Anon"}
          </span>
          <span className="text-xs text-gray-400">
            {casNazaj(komentar.cas)}
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-2">{komentar.vsebina}</p>
        {priloge.length > 0 && (
        <div className="flex flex-col gap-1 mb-2">
                {priloge.map((p) => (
                    <a key={p.id} href={p.pot} target="_blank" rel="noopener noreferrer">
                        <img src={p.pot} alt={p.ime_datoteke} className="rounded-lg max-h-60 object-contain border border-gray-200 cursor-pointer hover:opacity-90 transition" />
                    </a>
                ))}
            </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-500">
            <button
                onClick={() => voteComment("up")}
                className={`px-2 py-1 rounded-lg border text-sm transition ${
                userVote === "up"
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
            >
                ↑
            </button>

            <span className="text-sm font-semibold">{score}</span>

            <button
                onClick={() => voteComment("down")}
                className={`px-2 py-1 rounded-lg border text-sm transition ${
                userVote === "down"
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
            >
                ↓
            </button>
        </div>
        <button
          onClick={() => setShowOdgovor(!showOdgovor)}
          className="text-xs text-gray-400 hover:text-gray-600 transition"
        >
          Reply
        </button>
        <button
          onClick={() => report("komentar", komentar.id)}
          className="text-xs text-red-500 ml-2"
        >
          Report
        </button>

        {showOdgovor && (
          <div className="mt-2 flex gap-2">
            <input
              value={novOdgovor}
              onChange={(e) => setNovOdgovor(e.target.value)}
              placeholder="Vaš odgovor..."
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={dodajOdgovor}
              disabled={loading}
              className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              {loading ? "..." : "Pošlji"}
            </button>
          </div>
        )}

        {odgovori.length > 0 && (
          <div className="mt-3 flex flex-col gap-3 pl-4 border-l-2 border-gray-100">
            {odgovori.map((o) => (
              <KomentarKomponenta
                key={o.id}
                komentar={o}
                casNazaj={casNazaj}
                objavaId={objavaId}
                refreshKomentarji={refreshKomentarji}
                dodajSporocilo={dodajSporocilo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
