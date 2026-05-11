import { useState, useEffect, useRef } from "react";

export default function CreatePostModal({ open, setOpen, refreshPosts }) {
  const [naslov, setNaslov] = useState("");
  const [vsebina, setVsebina] = useState("");
  const [kategorije, setKategorije] = useState([]);
  const [kategorijaId, setKategorijaId] = useState("");
  const [error, setError] = useState("");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("https://friforum-production.up.railway.app/kategorije")
      .then((res) => res.json())
      .then((data) => setKategorije(data));
  }, []);

  if (!open) return null;

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setNaslov("");
    setVsebina("");
    setKategorijaId("");
    setError("");
    removeFile();
  };

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

    try {
      // 1. CREATE POST
      const res = await fetch("https://friforum-production.up.railway.app/objave/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          naslov,
          vsebina,
          kategorija_id: Number(kategorijaId),
        }),
      });

      if (!res.ok) {
        setError("Objava ni uspela");
        return;
      }

      const objava = await res.json();

      // 2. UPLOAD FILE (če obstaja)
      if (file) {
        const formData = new FormData();
        formData.append("datoteka", file);

        const uploadRes = await fetch(
          `https://friforum-production.up.railway.app/objave/${objava.id}/priloge`,
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
            },
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          console.log("Upload fail");
        }
      }

      // 3. RESET + CLOSE
      resetForm();
      setOpen(false);
      refreshPosts();
    } catch (err) {
      console.log(err);
      setError("Napaka pri ustvarjanju objave");
    }
  };

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-lg"
      >
        {/* HEADER */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Nova objava
          </h3>
        </div>

        {/* BODY */}
        <div className="p-4 flex flex-col gap-3">
          <input
            placeholder="Naslov"
            value={naslov}
            onChange={(e) => setNaslov(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />

          <textarea
            placeholder="Vsebina"
            value={vsebina}
            onChange={(e) => setVsebina(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500"
          />

          {/* FILE BUTTON */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current.click()}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              📎 Dodaj sliko
            </button>

            {file && (
              <button
                onClick={removeFile}
                className="text-sm text-red-500 hover:text-red-700"
              >
                odstrani
              </button>
            )}
          </div>

          {/* PREVIEW */}
          {preview && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={preview}
                alt="preview"
                className="w-full max-h-60 object-cover"
              />
            </div>
          )}

          {/* CATEGORY */}
          <select
            value={kategorijaId}
            onChange={(e) => setKategorijaId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Izberi kategorijo</option>
            {kategorije.map((k) => (
              <option key={k.id} value={k.id}>
                {k.naziv}
              </option>
            ))}
          </select>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800"
            >
              Prekliči
            </button>

            <button
              onClick={createPost}
              className="bg-gray-900 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-gray-700 transition"
            >
              Objavi
            </button>
          </div>

          {/* hidden input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}