from fastapi import APIRouter, HTTPException, Depends, Query
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
def get_objave(
    kategorija_id: int = Query(None),
    q: str = Query(None),
    sort: str = Query("new"),
    page: int = Query(1),
    limit: int = Query(10)
):
    query = supabase.table("objava")\
        .select("*, kategorija(naziv, barva), profil(uporabnisko_ime), glas(tip)")
    
    # Filtriranje po kategoriji
    if kategorija_id:
        query = query.eq("kategorija_id", kategorija_id)
    
    # Iskanje po naslovu in vsebini
    if q:
        query = query.or_(f"naslov.ilike.%{q}%,vsebina.ilike.%{q}%")
    
    # limit prikazanih objav in paginacija
    start = (page - 1) * limit
    end = start + limit - 1
    query = query.range(start, end)
    
    # Sortiranje
    if sort == "new":
        query = query.order("cas_objave", desc=True)
    elif sort == "top":
        query = query.order("st_seckov", desc=True)
    
    result = query.execute()
    
    objave = result.data
    for objava in objave:
        glasovi = objava.pop("glas", [])
        objava["st_upvote"] = sum(1 for g in glasovi if g["tip"] == "up")
        objava["st_downvote"] = sum(1 for g in glasovi if g["tip"] == "down")
        objava["skupaj_glasov"] = objava["st_upvote"] - objava["st_downvote"]
    
    return {
        "objave": objave,
        "page": page,
        "limit": limit,
        "ima_vec": len(objave) == limit
    }

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