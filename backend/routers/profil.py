from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import supabase
from dependencies import get_current_user

router = APIRouter(prefix="/profil", tags=["profil"])

class UrediProfil(BaseModel):
    uporabnisko_ime: str = None
    bio: str = None

@router.get("/me")
def get_moj_profil(current_user=Depends(get_current_user)):
    profil = supabase.table("profil")\
        .select("*")\
        .eq("id", current_user.id)\
        .single()\
        .execute()
    
    if not profil.data:
        raise HTTPException(status_code=404, detail="Profil ne obstaja")
    
    objave = supabase.table("objava")\
        .select("*, kategorija(naziv, barva)")\
        .eq("avtor_id", current_user.id)\
        .order("cas_objave", desc=True)\
        .execute()
    
    komentarji = supabase.table("komentar")\
        .select("*")\
        .eq("avtor_id", current_user.id)\
        .execute()

    glasovi = supabase.table("glas")\
        .select("tip")\
        .execute()

    return {
    "profil": profil.data,
    "objave": objave.data,
    "komentarji": komentarji.data,
    "st_objav": len(objave.data),
    "st_komentarjev": len(komentarji.data),
    "st_glasov": len(glasovi.data)
}

@router.get("/{username}")
def get_profil(username: str):
    profil = supabase.table("profil")\
        .select("*")\
        .eq("uporabnisko_ime", username)\
        .single()\
        .execute()
    
    if not profil.data:
        raise HTTPException(status_code=404, detail="Profil ne obstaja")
    
    id = profil.data["id"]
    
    objave = supabase.table("objava")\
        .select("*, kategorija(naziv, barva)")\
        .eq("avtor_id", id)\
        .order("cas_objave", desc=True)\
        .execute()
    
    komentarji = supabase.table("komentar")\
        .select("*, objava(naslov)")\
        .eq("avtor_id", current_user.id)\
        .order("cas", desc=True)\
        .execute()
    
    return {
        "profil": profil.data,
        "objave": objave.data,
        "komentarji": komentarji.data,
        "st_objav": len(objave.data),
        "st_komentarjev": len(komentarji.data)
    }

@router.put("/me")
def uredi_profil(podatki: UrediProfil, current_user=Depends(get_current_user)):
    # Preveri če uporabniško ime že obstaja
    if podatki.uporabnisko_ime:
        obstaja = supabase.table("profil")\
            .select("id")\
            .eq("uporabnisko_ime", podatki.uporabnisko_ime)\
            .execute()
        if obstaja.data and obstaja.data[0]["id"] != current_user.id:
            raise HTTPException(status_code=400, detail="Uporabniško ime je že zasedeno")
    
    posodobitve = {k: v for k, v in podatki.dict().items() if v is not None}
    if not posodobitve:
        raise HTTPException(status_code=400, detail="Ni podatkov za posodobitev")
    
    result = supabase.table("profil")\
        .update(posodobitve)\
        .eq("id", current_user.id)\
        .execute()
    
    return result.data[0]