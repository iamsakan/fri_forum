from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator
from database import supabase
from dependencies import get_current_user, get_moderator
from typing import Optional

router = APIRouter(prefix="/prijave", tags=["prijave"])

class NovaPrijava(BaseModel):
    razlog: str
    objava_id: Optional[int] = None
    komentar_id: Optional[int] = None

    @field_validator("razlog")
    @classmethod
    def preveri_razlog(cls, v):
        if len(v.strip()) < 4:
            raise ValueError("Razlog mora imeti vsaj 4 znake")
        return v

@router.post("/")
def prijavi_vsebino(prijava: NovaPrijava, current_user=Depends(get_current_user)):
    if not prijava.objava_id and not prijava.komentar_id:
        raise HTTPException(status_code=400, detail="Podati morate objava_id ali komentar_id")
    
    result = supabase.table("prijava").insert({
        "razlog": prijava.razlog,
        "objava_id": prijava.objava_id,
        "komentar_id": prijava.komentar_id,
        "avtor_id": current_user.id,
        "status": "caka"
    }).execute()
    return {"sporocilo": "Prijava uspešno oddana", "id": result.data[0]["id"]}

@router.get("/")
def get_prijave(current_user=Depends(get_moderator)):
    result = supabase.table("prijava")\
        .select("*, profil(uporabnisko_ime), objava(naslov), komentar(vsebina, objava_id)")\
        .eq("status", "caka")\
        .order("cas", desc=False)\
        .execute()
    return result.data

@router.put("/{id}/resi")
def resi_prijavo(id: int, current_user=Depends(get_moderator)):
    supabase.table("prijava").update({"status": "reseno"}).eq("id", id).execute()
    return {"sporocilo": "Prijava označena kot rešena"}

@router.put("/{id}/zavrni")
def zavrni_prijavo(id: int, current_user=Depends(get_moderator)):
    supabase.table("prijava").update({"status": "zavrnjeno"}).eq("id", id).execute()
    return {"sporocilo": "Prijava zavrnjena"}