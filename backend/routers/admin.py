from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import supabase
from dependencies import get_admin, get_moderator

router = APIRouter(prefix="/admin", tags=["admin"])

class NovaKategorija(BaseModel):
    naziv: str
    opis: str
    barva: str = "#3B82F6"

class UrediKategorijo(BaseModel):
    naziv: str = None
    opis: str = None
    barva: str = None

class UrediVlogo(BaseModel):
    vloga: str  # "uporabnik", "moderator", "admin"

# KATEGORIJE — samo admin
@router.post("/kategorije")
def ustvari_kategorijo(kategorija: NovaKategorija, current_user=Depends(get_admin)):
    result = supabase.table("kategorija").insert({
        "naziv": kategorija.naziv,
        "opis": kategorija.opis,
        "barva": kategorija.barva
    }).execute()
    return result.data[0]

@router.put("/kategorije/{id}")
def uredi_kategorijo(id: int, kategorija: UrediKategorijo, current_user=Depends(get_admin)):
    podatki = {k: v for k, v in kategorija.dict().items() if v is not None}
    if not podatki:
        raise HTTPException(status_code=400, detail="Ni podatkov za posodobitev")
    result = supabase.table("kategorija").update(podatki).eq("id", id).execute()
    return result.data[0]

@router.delete("/kategorije/{id}")
def izbrisi_kategorijo(id: int, current_user=Depends(get_admin)):
    supabase.table("kategorija").delete().eq("id", id).execute()
    return {"sporocilo": "Kategorija izbrisana"}

# UPRAVLJANJE UPORABNIKOV — samo admin
@router.get("/uporabniki")
def get_uporabniki(current_user=Depends(get_admin)):
    result = supabase.table("profil").select("*").execute()
    return result.data

@router.put("/uporabniki/{id}/vloga")
def spremeni_vlogo(id: str, podatki: UrediVlogo, current_user=Depends(get_admin)):
    if podatki.vloga not in ["uporabnik", "moderator", "admin"]:
        raise HTTPException(status_code=400, detail="Neveljavna vloga")
    result = supabase.table("profil").update({"vloga": podatki.vloga}).eq("id", id).execute()
    return result.data[0]

@router.put("/uporabniki/{id}/blokiraj")
def blokiraj_uporabnika(id: str, current_user=Depends(get_admin)):
    result = supabase.table("profil").update({"vloga": "blokiran"}).eq("id", id).execute()
    return {"sporocilo": "Uporabnik blokiran"}

# MODERACIJA — admin in moderator
@router.delete("/objave/{id}")
def moderator_izbrisi_objavo(id: int, current_user=Depends(get_moderator)):
    obstojna = supabase.table("objava").select("id").eq("id", id).execute()
    if not obstojna.data:
        raise HTTPException(status_code=404, detail="Objava ne obstaja")
    supabase.table("objava").delete().eq("id", id).execute()
    return {"sporocilo": "Objava izbrisana s strani moderatorja"}

@router.delete("/komentarji/{id}")
def moderator_izbrisi_komentar(id: int, current_user=Depends(get_moderator)):
    obstojen = supabase.table("komentar").select("id").eq("id", id).execute()
    if not obstojen.data:
        raise HTTPException(status_code=404, detail="Komentar ne obstaja")
    supabase.table("komentar").delete().eq("id", id).execute()
    return {"sporocilo": "Komentar izbrisan s strani moderatorja"}

@router.get("/objave")
def moderator_get_objave(current_user=Depends(get_moderator)):
    result = supabase.table("objava")\
        .select("*, profil(uporabnisko_ime), kategorija(naziv)")\
        .order("cas_objave", desc=True)\
        .execute()
    return result.data