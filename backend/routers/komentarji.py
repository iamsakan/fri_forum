from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator
from database import supabase
from dependencies import get_current_user

router = APIRouter(prefix="/komentarji", tags=["komentarji"])

class NovKomentar(BaseModel):
    vsebina: str
    objava_id: int
    stars_id: int = None  # None = glavni komentar, int = odgovor na komentar

    @field_validator("vsebina")
    @classmethod
    def preveri_vsebino(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Komentar mora imeti vsaj 2 znaka")
        return v

@router.get("/{objava_id}")
def get_komentarji(objava_id: int):
    result = supabase.table("komentar")\
        .select("*, profil(uporabnisko_ime), glas_komentar(tip)")\
        .eq("objava_id", objava_id)\
        .order("cas", desc=False)\
        .execute()
    
    komentarji = result.data
    
    for k in komentarji:
        glasovi = k.pop("glas_komentar", [])
        k["st_upvote"] = sum(1 for g in glasovi if g["tip"] == "up")
        k["st_downvote"] = sum(1 for g in glasovi if g["tip"] == "down")
        k["glasovi"] = k["st_upvote"] - k["st_downvote"]
    
    glavni = []
    slovar = {}
    
    for k in komentarji:
        k["odgovori"] = []
        slovar[k["id"]] = k
    
    for k in komentarji:
        if k["stars_id"] is None:
            glavni.append(k)
        else:
            stars = slovar.get(k["stars_id"])
            if stars:
                stars["odgovori"].append(k)
    
    return glavni

@router.post("/")
def dodaj_komentar(komentar: NovKomentar, current_user=Depends(get_current_user)):
    # Če je odgovor, preveri da starš obstaja
    if komentar.stars_id:
        stars = supabase.table("komentar")\
            .select("id")\
            .eq("id", komentar.stars_id)\
            .execute()
        if not stars.data:
            raise HTTPException(status_code=404, detail="Starševski komentar ne obstaja")
    
    result = supabase.table("komentar").insert({
        "vsebina": komentar.vsebina,
        "objava_id": komentar.objava_id,
        "avtor_id": current_user.id,
        "stars_id": komentar.stars_id
    }).execute()

    # Poišči avtorja objave in mu pošlji notifikacijo
    try:
        objava = supabase.table("objava").select("avtor_id").eq("id", komentar.objava_id).single().execute()
        if objava.data and objava.data["avtor_id"] != str(current_user.id):
            profil = supabase.table("profil").select("uporabnisko_ime").eq("id", str(current_user.id)).single().execute()
            ime = profil.data["uporabnisko_ime"] if profil.data else "Nekdo"
            supabase.table("notifikacije").insert({
                "uporabnik_id": objava.data["avtor_id"],
                "tip": "komentar",
                "objava_id": komentar.objava_id,
                "sporocilo": f"{ime} je komentiral tvojo objavo"
            }).execute()
    except:
        pass  # notifikacija ne sme blokirati komentarja

    return result.data[0]

@router.delete("/{id}")
def izbrisi_komentar(id: int, current_user=Depends(get_current_user)):
    obstojen = supabase.table("komentar").select("avtor_id").eq("id", id).single().execute()
    if not obstojen.data:
        raise HTTPException(status_code=404, detail="Komentar ne obstaja")
    if obstojen.data["avtor_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Nimate dovoljenja za brisanje tega komentarja")
    
    supabase.table("komentar").delete().eq("id", id).execute()
    return {"sporocilo": "Komentar izbrisan"}