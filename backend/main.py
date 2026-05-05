from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from routers import objave, komentarji, glasovi, profil

app = FastAPI(title="FRI Forum API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(objave.router)
app.include_router(komentarji.router)
app.include_router(glasovi.router)
app.include_router(profil.router)

@app.get("/")
def root():
    return {"status": "FRI Forum API deluje!"}

@app.get("/kategorije")
def get_kategorije():
    result = supabase.table("kategorija").select("*").execute()
    return result.data