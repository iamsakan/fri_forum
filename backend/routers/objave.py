from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from database import supabase

router = APIRouter(prefix="/objave", tags=["objave"])

class NovaObjava(BaseModel):
    naslov: str
    vsebina: str
    kategorija_id: int

    @validator("naslov")
    def preveri_naslov(cls, v):
        if len(v.strip()) < 3:
            raise ValueError("Naslov mora imeti vsaj 3 znake")
        return v

    @validator("vsebina")
    def preveri_vsebino(cls, v):
        if len(v.strip()) < 10:
            raise ValueError("Vsebina mora imeti vsaj 10 znakov")
        return v

@router.get("/")
def get_objave():
    result = supabase.table("objava")\
        .select("*, kategorija(naziv, barva)")\
        .order("cas_objave", desc=True)\
        .execute()
    return result.data

@router.get("/{id}")
def get_objava(id: int):
    result = supabase.table("objava")\
        .select("*, kategorija(naziv, barva)")\
        .eq("id", id)\
        .single()\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Objava ne obstaja")
    return result.data

@router.post("/")
def ustvari_objavo(objava: NovaObjava):
    result = supabase.table("objava").insert({
        "naslov": objava.naslov,
        "vsebina": objava.vsebina,
        "kategorija_id": objava.kategorija_id
    }).execute()
    return result.data[0]

@router.delete("/{id}")
def izbrisi_objavo(id: int):
    supabase.table("objava").delete().eq("id", id).execute()
    return {"sporocilo": "Objava izbrisana"}