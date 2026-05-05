import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://localhost:8000"

function App() {
  const [kategorije, setKategorije] = useState([])
  const [objave, setObjave] = useState([])
  const [forma, setForma] = useState({ naslov: "", vsebina: "", kategorija_id: "" })
  const [posiljam, setPosiljam] = useState(false)

  useEffect(() => {
    axios.get(`${API}/kategorije`).then(res => setKategorije(res.data))
    axios.get(`${API}/objave`).then(res => setObjave(res.data))
  }, [])

  const ustvariObjavo = async () => {
    if (!forma.naslov || !forma.vsebina || !forma.kategorija_id) {
      alert("Izpolnite vsa polja!")
      return
    }
    setPosiljam(true)
    await axios.post(`${API}/objave/`, {
      naslov: forma.naslov,
      vsebina: forma.vsebina,
      kategorija_id: parseInt(forma.kategorija_id)
    })
    setForma({ naslov: "", vsebina: "", kategorija_id: "" })
    const res = await axios.get(`${API}/objave`)
    setObjave(res.data)
    setPosiljam(false)
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>FRI Forum</h1>

      <h2>Kategorije</h2>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {kategorije.map(k => (
          <span key={k.id} style={{
            background: k.barva,
            color: "white",
            padding: "5px 15px",
            borderRadius: "20px",
            fontWeight: "bold"
          }}>
            {k.naziv}
          </span>
        ))}
      </div>

      <h2>Nova objava</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <input
          placeholder="Naslov"
          value={forma.naslov}
          onChange={e => setForma({...forma, naslov: e.target.value})}
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
        />
        <textarea
          placeholder="Vsebina"
          value={forma.vsebina}
          onChange={e => setForma({...forma, vsebina: e.target.value})}
          rows={4}
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
        />
        <select
          value={forma.kategorija_id}
          onChange={e => setForma({...forma, kategorija_id: e.target.value})}
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
        >
          <option value="">Izberi kategorijo</option>
          {kategorije.map(k => (
            <option key={k.id} value={k.id}>{k.naziv}</option>
          ))}
        </select>
        <button
          onClick={ustvariObjavo}
          disabled={posiljam}
          style={{ padding: "10px", background: "#3B82F6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          {posiljam ? "Pošiljam..." : "Objavi"}
        </button>
      </div>

      <h2>Objave</h2>
      {objave.length === 0 && <p>Še ni objav.</p>}
      {objave.map(o => (
        <div key={o.id} style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "10px"
        }}>
          <h3>{o.naslov}</h3>
          <p>{o.vsebina}</p>
          <small>Kategorija: {o.kategorija?.naziv}</small>
        </div>
      ))}
    </div>
  )
}

export default App