# FRI Forum
Spletna forumska aplikacija za študente Fakultete za računalništvo in informatiko.

🔗 **Live demo:** [fri-forum.vercel.app](https://fri-forum.vercel.app)

---

# Avtorja
- David Poljanec
- Anel Šakanović

---

## Opis projekta
FRI Forum je full-stack spletna aplikacija, razvita v okviru predmeta **Razvoj informacijskih sistemov**. Aplikacija omogoča:

- Registracijo in prijavo uporabnikov
- Objavljanje objav po kategorijah (APS1, KPOV, AI, UVP, Splošno...)
- Komentiranje in odgovarjanje na komentarje (threaded komentarji)
- Glasovanje (upvote/downvote) na objavah in komentarjih
- Iskanje in filtriranje objav po kategorijah
- Sortiranje objav (najnovejše / najboljše)
- Obvestila (notifikacije) ob novem komentarju na objavi
- Ogled in urejanje profilov uporabnikov
- Prijavljanje neprimernih vsebin
- Admin panel za upravljanje vsebine
- Moderatorski panel z omejenimi pravicami
- Responzivni dizajn (mobilna in desktop različica)

---

## Vloge uporabnikov

| Vloga | Pravice |
|-------|---------|
| Uporabnik | Objavljanje, komentiranje, glasovanje, prijavljanje vsebin |
| Moderator | + Brisanje objav in komentarjev, reševanje prijav |
| Admin | + Upravljanje uporabnikov, kategorij, vseh vsebin |

---

## Tehnologije

### Frontend
- **React** + Vite
- **Tailwind CSS**
- **React Router**

### Backend
- **FastAPI** (Python)
- **Supabase** (PostgreSQL baza + avtentikacija)

### Deployment
- **Vercel** — frontend
- **Railway** — backend

---

## Lokalni razvoj

### Zahteve
- Python 3.10+
- Node.js 18+

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend bo dostopen na `http://localhost:8000`  
Swagger dokumentacija: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend bo dostopen na `http://localhost:5173`

### Okolijske spremenljivke
Ustvarite `backend/.env`:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your_anon_key
SECRET_KEY=your_secret_key
```

---

## Struktura projekta
```
fri_forum/
├── backend/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── objave.py
│   │   ├── komentarji.py
│   │   ├── glasovi.py
│   │   ├── profil.py
│   │   ├── admin.py
│   │   ├── prijave.py
│   │   ├── notifikacije.py
│   │   ├── priloge.py
│   │   └── priloge_komentarjev.py
│   ├── main.py
│   ├── database.py
│   ├── dependencies.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── PostCard.jsx
    │   │   ├── PostList.jsx
    │   │   ├── SearchBar.jsx
    │   │   ├── NotificationsModal.jsx
    │   │   ├── ProfileModal.jsx
    │   │   ├── CreatePostModal.jsx
    │   │   └── ReportModal.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── ObjavaDetail.jsx
    │   │   └── admin/
    │   │       ├── AdminLayout.jsx
    │   │       ├── AdminObjave.jsx
    │   │       ├── AdminKomentarji.jsx
    │   │       ├── AdminKategorije.jsx
    │   │       ├── AdminPrijave.jsx
    │   │       └── AdminUsers.jsx
    │   └── ...
    └── package.json
```

---

## Varnost
- JWT avtentikacija preko Supabase
- Row Level Security (RLS) na občutljivih tabelah
- Rate limiting na prijavi (5 poskusov/minuto)
- Validacija vlog na vsakem zaščitenem endpointu
- Blokiranje uporabnikov z admin pravicami

---

## API Dokumentacija
Po zagonu backenda je dokumentacija dostopna na:  
`http://localhost:8000/docs`

Produkcijska dokumentacija:  
`https://friforum-production.up.railway.app/docs`