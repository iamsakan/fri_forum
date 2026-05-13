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
- Obvestila (notifikacije) ob novem komentarju
- Ogled in urejanje profilov uporabnikov
- Prijavljanje neprimernih vsebin
- Admin panel za upravljanje vsebine
- Moderatorski panel z omejenimi pravicami
- Responzivni dizajn (mobilna in desktop različica)

---

## Vloge uporabnikov

| Vloga | Pravice |
|-------|---------|
| Uporabnik | Objavljanje, komentiranje, glasovanje, prijavljanje |
| Moderator | + Brisanje objav/komentarjev, reševanje prijav |
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
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your_anon_key
SECRET_KEY=your_secret_key
---

## Struktura projekta
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
│   │   └── ...
│   ├── main.py
│   ├── database.py
│   ├── dependencies.py
│   └── requirements.txt
└── frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── PostCard.jsx
│   │   ├── NotificationsModal.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── admin/
│   │   └── ...
│   └── ...
└── package.json
---

## Varnost
- JWT avtentikacija
- Row Level Security (RLS) na notifikacijah
- Rate limiting na prijavi (5 poskusov/minuto)
- Validacija vlog na vsakem zaščitenem endpointu

---

## API Dokumentacija
Po zagonu backenda je dokumentacija dostopna na:  
`http://localhost:8000/docs`

Produkcijska dokumentacija:  
`https://friforum-production.up.railway.app/docs`