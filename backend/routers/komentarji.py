from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from database import supabase

router = APIRouter(prefix="/komentarji", tags=["komentarji"])

class NovKomentar(BaseModel):
    vsebina: str
    objava_id: int

    @validator("vsebina")
    def preveri_vsebino(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Komentar mora imeti vsaj 2 znaka")
        return v

@router.get("/{objava_id}")
def get_komentarji(objava_id: int):
    result = supabase.table("komentar")\
        .select("*")\
        .eq("objava_id", objava_id)\
        .order("cas", desc=False)\
        .execute()
    return result.data

@router.post("/")
def dodaj_komentar(komentar: NovKomentar):
    result = supabase.table("komentar").insert({
        "vsebina": komentar.vsebina,
        "objava_id": komentar.objava_id
    }).execute()
    return result.data[0]

@router.delete("/{id}")
def izbrisi_komentar(id: int):
    supabase.table("komentar").delete().eq("id", id).execute()
    return {"sporocilo": "Komentar izbrisan"}