import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProfileModal from "../components/ProfileModal";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import ReportModal from "../components/ReportModal";

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
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
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
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentUserId = localStorage.getItem("user_id");
  const isOwner = post && String(post.avtor_id) === String(currentUserId);

  const deletePost = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(
      `https://friforum-production.up.railway.app/objave/${post.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    if (res.ok) {
      dodajSporocilo("Objava izbrisana", "success");
      navigate("/"); // ali nazaj na feed
    } else {
      dodajSporocilo("Napaka pri brisanju", "warning");
    }
  };

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      // Najprej glasovi
      const token = localStorage.getItem("token");
      if (token) {
        const resGlasovi = await fetch(
          "https://friforum-production.up.railway.app/glasovi/moji",
          {
            headers: { Authorization: "Bearer " + token },
          },
        );
        if (resGlasovi.ok) {
          const glasoviData = await resGlasovi.json();
          localStorage.setItem("moji_glasovi", JSON.stringify(glasoviData));
          setUserVote(glasoviData[String(id)] || null);
        }
      }

      // Potem objava
      const resObjava = await fetch(
        `https://friforum-production.up.railway.app/objave/${id}`,
      );
      const objavaData = await resObjava.json();
      setPost(objavaData);
      setVotes(objavaData.skupaj_glasov || 0);

      // Priloge
      const resPriloge = await fetch(
        `https://friforum-production.up.railway.app/objave/${id}/priloge`,
      );
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
          { headers: { Authorization: "Bearer " + token } },
        );
        if (resGlasoviKomentarjev.ok) {
          const glasoviKomentarjev = await resGlasoviKomentarjev.json();
          localStorage.setItem(
            "moji_glasovi_komentarjev",
            JSON.stringify(glasoviKomentarjev),
          );
        }
      }
    };

    loadAll();
  }, [id]);

  const refreshKomentarji = async () => {
    const res = await fetch(
      `https://friforum-production.up.railway.app/komentarji/${id}`,
    );
    const data = await res.json();
    setKomentarji(Array.isArray(data) ? data : []);
  };

  const vote = async (tip) => {
    const token = localStorage.getItem("token");
    if (!token) {
      dodajSporocilo("Moraš biti prijavljen", "warning");
      return;
    }

    const res = await fetch(
      "https://friforum-production.up.railway.app/glasovi/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ objava_id: parseInt(id), tip }),
      },
    );

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
    const res = await fetch(
      "https://friforum-production.up.railway.app/komentarji/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ vsebina: novKomentar, objava_id: parseInt(id) }),
      },
    );

    if (res.ok) {
      const komentar = await res.json();

      // Upload slike če obstaja
      if (komentarFile) {
        const formData = new FormData();
        formData.append("datoteka", komentarFile);
        await fetch(
          `https://friforum-production.up.railway.app/komentarji/${komentar.id}/priloge`,
          {
            method: "POST",
            headers: { Authorization: "Bearer " + token },
            body: formData,
          },
        );
        setKomentarFile(null);
        setKomentarPreview(null);
      }

      setNovKomentar("");
      await refreshKomentarji();
    }
    setLoading(false);
  };

  const report = async (tip, idTarget, razlog, e) => {
  if (e) e.stopPropagation();
  const token = localStorage.getItem("token");
  if (!token) return dodajSporocilo("Moraš biti prijavljen", "warning");

  await fetch("https://friforum-production.up.railway.app/prijave/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      razlog: razlog,
      objava_id: tip === "objava" ? idTarget : null,
      komentar_id: tip === "komentar" ? idTarget : null,
    }),
  });

  dodajSporocilo("Prijavljeno!", "success");
  };

  const casNazaj = (datum) => {
    const diff = Math.floor((new Date() - new Date(datum + "Z")) / 1000);
    if (diff < 60) return `pred ${diff}s`;
    if (diff < 3600) return `pred ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `pred ${Math.floor(diff / 3600)}h`;
    return `pred ${Math.floor(diff / 86400)}dnevi`;
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

          <h1 className="text-xl font-bold text-gray-900 mb-3 break-words">
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

          <p className="text-gray-700 leading-relaxed mb-6 break-words">
            {post.vsebina}
          </p>

          {/* Priloge */}
          {priloge.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              {priloge.map((p) =>
                p.tip_datoteke.startsWith("image/") ? (
                  <a
                    key={p.id}
                    href={p.pot}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex justify-center">
                      <img
                        src={p.pot}
                        alt={p.ime_datoteke}
                        className="rounded-lg max-h-96 object-contain border border-gray-200 cursor-pointer hover:opacity-90 transition"
                      />
                    </div>
                  </a>
                ) : (
                  <a
                    key={p.id}
                    href={p.pot}
                    target="_blank"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    📎 {p.ime_datoteke}
                  </a>
                ),
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => vote("up")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition text-sm font-medium ${
                  userVote === "up"
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                ↑ Gorglas
              </button>

              <span
                className={`text-sm font-semibold ${
                  votes > 0
                    ? "text-blue-600"
                    : votes < 0
                      ? "text-red-500"
                      : "text-gray-500"
                }`}
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
                ↓ Dolglas
              </button>

              <span className="text-sm text-gray-400 ml-2">
                💬 {countAllComments(komentarji)} komentarjev
              </span>
            </div>

            {/* KEBAB MENU */}
            <div className="relative flex items-center" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((prev) => !prev);
                }}
                className="text-2xl leading-none text-gray-400 hover:text-gray-700 flex items-center"
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 w-36 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-10">
                  <button
                    onClick={() => { setReportTarget({tip: "objava", id: post.id}); setReportOpen(true); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    Prijavi
                  </button>

                  {isOwner && (
                    <button
                      onClick={deletePost}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Odstrani
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dodaj komentar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-gray-400 text-xs">?</span>
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                value={novKomentar}
                onChange={(e) => setNovKomentar(e.target.value)}
                placeholder="Deli svoje mnenje..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
              {komentarPreview && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={komentarPreview}
                    alt="preview"
                    className="w-full max-h-40 object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={dodajKomentar}
                  disabled={loading || !novKomentar.trim()}
                  className="bg-gray-700 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
                >
                  {loading ? "Pošiljam..." : "Objavi komentar"}
                </button>
                <button
                  onClick={() => komentarFileRef.current.click()}
                  className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <i className="fas fa-image"></i> Dodaj sliko
                </button>
                {komentarFile && (
                  <button
                    onClick={() => {
                      setKomentarFile(null);
                      setKomentarPreview(null);
                    }}
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
      <ReportModal
        open={reportOpen}
        setOpen={setReportOpen}
        onSubmit={(razlog) => report(reportTarget?.tip, reportTarget?.id, razlog)}
      />
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
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const shranjeniGlasoviKomentarjev = JSON.parse(
    localStorage.getItem("moji_glasovi_komentarjev") || "{}",
  );
  const [userVote, setUserVote] = useState(
    shranjeniGlasoviKomentarjev[String(komentar.id)] || null,
  );
  const [showOdgovor, setShowOdgovor] = useState(false);
  const [novOdgovor, setNovOdgovor] = useState("");
  const [loading, setLoading] = useState(false);

  const [priloge, setPriloge] = useState([]);
  const currentUserId = localStorage.getItem("user_id");
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isCommentOwner =
    komentar.avtor_id && String(komentar.avtor_id) === String(currentUserId);
  const deleteComment = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(
      `https://friforum-production.up.railway.app/komentarji/${komentar.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    if (res.ok) {
      dodajSporocilo("Komentar izbrisan", "success");
      await refreshKomentarji();
    } else {
      dodajSporocilo("Napaka pri brisanju", "warning");
    }
  };

  useEffect(() => {
    fetch(
      `https://friforum-production.up.railway.app/komentarji/${komentar.id}/priloge`,
    )
      .then((res) => res.json())
      .then((data) => setPriloge(Array.isArray(data) ? data : []));
  }, [komentar.id]);

  const voteComment = async (tip) => {
    const token = localStorage.getItem("token");
    if (!token) return dodajSporocilo("Moraš biti prijavljen", "warning");

    const res = await fetch(
      "https://friforum-production.up.railway.app/glasovi/komentar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          komentar_id: komentar.id,
          tip,
        }),
      },
    );

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

  const report = async (tip, idTarget, razlog, e) => {
  if (e) e.stopPropagation();
  const token = localStorage.getItem("token");
  if (!token) return dodajSporocilo("Moraš biti prijavljen", "warning");

  await fetch("https://friforum-production.up.railway.app/prijave/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      razlog: razlog,
      objava_id: tip === "objava" ? idTarget : null,
      komentar_id: tip === "komentar" ? idTarget : null,
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
    const res = await fetch(
      "https://friforum-production.up.railway.app/komentarji/",
      {
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
      },
    );

    if (res.ok) {
      setNovOdgovor("");
      setShowOdgovor(false);
      await refreshKomentarji();
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-3 min-w-0">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <span className="text-blue-700 font-bold" style={{ fontSize: "9px" }}>
          {inicialke}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
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

          {/* KEBAB MENU */}
          <div className="relative flex items-center" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === komentar.id ? null : komentar.id);
              }}
            >
              ⋮
            </button>

            {openMenuId === komentar.id && (
              <div className="absolute right-0 top-6 w-36 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-10">
                <button
                    onClick={() => { setReportTarget({tip: "komentar", id: komentar.id}); setReportOpen(true); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    Prijavi
                </button>

                {isCommentOwner && (
                  <button
                    onClick={deleteComment}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Odstrani
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-2 break-words">
          {komentar.vsebina}
        </p>
        {priloge.length > 0 && (
          <div className="flex flex-col gap-1 mb-2">
            {priloge.map((p) => (
              <a
                key={p.id}
                href={p.pot}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={p.pot}
                  alt={p.ime_datoteke}
                  className="rounded-lg max-h-60 object-contain border border-gray-200 cursor-pointer hover:opacity-90 transition"
                />
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
          Odgovori
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
      <ReportModal
        open={reportOpen}
        setOpen={setReportOpen}
        onSubmit={(razlog) => report(reportTarget?.tip, reportTarget?.id, razlog)}
      />
    </div>
  );
}
