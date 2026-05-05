from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from database import supabase
from routers import objave, komentarji, glasovi, profil, auth, admin, prijave

security = HTTPBearer()

app = FastAPI(
    title="FRI Forum API",
    swagger_ui_parameters={"persistAuthorization": True}
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(objave.router)
app.include_router(komentarji.router)
app.include_router(glasovi.router)
app.include_router(profil.router)
app.include_router(admin.router)
app.include_router(prijave.router)  

@app.get("/")
def root():
    return {"status": "FRI Forum API deluje!"}

@app.get("/kategorije")
def get_kategorije():
    result = supabase.table("kategorija").select("*").execute()
    return result.data