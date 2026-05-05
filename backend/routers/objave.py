from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator
from database import supabase
from dependencies import get_current_user, security

router = APIRouter(prefix="/objave", tags=["objave"])

class NovaObjava(BaseModel):
    naslov: str
    vsebina: str
    kategorija_id: int

    @field_validator("naslov")
    @classmethod
    def preveri_naslov(cls, v):
        if len(v.strip()) < 3:
            raise ValueError("Naslov mora imeti vsaj 3 znake")
        return v

    @field_validator("vsebina")
    @classmethod
    def preveri_vsebino(cls, v):
        if len(v.strip()) < 10:
            raise ValueError("Vsebina mora imeti vsaj 10 znakov")
        return v

@router.get("/")
def get_objave(kategorija_id: int = None, q: str = None):
    query = supabase.table("objava")\
        .select("*, kategorija(naziv, barva), profil(uporabnisko_ime)")\
        .order("cas_objave", desc=True)
    
    # Filtriranje po kategoriji
    if kategorija_id:
        query = query.eq("kategorija_id", kategorija_id)
    
    # Iskanje po naslovu
    if q:
        query = query.ilike("naslov", f"%{q}%")
    
    result = query.execute()
    return result.data

@router.get("/{id}")
def get_objava(id: int):
    result = supabase.table("objava")\
        .select("*, kategorija(naziv, barva), profil(uporabnisko_ime)")\
        .eq("id", id)\
        .single()\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Objava ne obstaja")
    return result.data

@router.post("/")
def ustvari_objavo(objava: NovaObjava, current_user=Depends(get_current_user)):
    result = supabase.table("objava").insert({
        "naslov": objava.naslov,
        "vsebina": objava.vsebina,
        "kategorija_id": objava.kategorija_id,
        "avtor_id": current_user.id  # vezava avtorja!
    }).execute()
    return result.data[0]

@router.put("/{id}")
def uredi_objavo(id: int, objava: NovaObjava, current_user=Depends(get_current_user)):
    # Preveri da je avtor res lastnik
    obstojena = supabase.table("objava").select("avtor_id").eq("id", id).single().execute()
    if not obstojena.data:
        raise HTTPException(status_code=404, detail="Objava ne obstaja")
    if obstojena.data["avtor_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Nimate dovoljenja za urejanje te objave")
    
    result = supabase.table("objava").update({
        "naslov": objava.naslov,
        "vsebina": objava.vsebina,
        "kategorija_id": objava.kategorija_id
    }).eq("id", id).execute()
    return result.data[0]

@router.delete("/{id}")
def izbrisi_objavo(id: int, current_user=Depends(get_current_user)):
    # Preveri da je avtor res lastnik
    obstojena = supabase.table("objava").select("avtor_id").eq("id", id).single().execute()
    if not obstojena.data:
        raise HTTPException(status_code=404, detail="Objava ne obstaja")
    if obstojena.data["avtor_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Nimate dovoljenja za brisanje te objave")
    
    supabase.table("objava").delete().eq("id", id).execute()
    return {"sporocilo": "Objava izbrisana"}