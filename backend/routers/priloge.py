from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from database import supabase
from dependencies import get_current_user, get_moderator
import uuid

router = APIRouter(prefix="/objave", tags=["priloge"])

DOVOLJENI_TIPI = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
MAX_VELIKOST = 5 * 1024 * 1024  # 5MB

@router.post("/{objava_id}/priloge")
async def dodaj_prilogo(
    objava_id: int,
    datoteka: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    # Preveri da je current_user avtor objave
    objava = supabase.table("objava")\
        .select("avtor_id")\
        .eq("id", objava_id)\
        .single()\
        .execute()
    
    if not objava.data:
        raise HTTPException(status_code=404, detail="Objava ne obstaja")
    
    if objava.data["avtor_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Samo avtor lahko dodaja priloge")

    # Preveri tip datoteke
    if datoteka.content_type not in DOVOLJENI_TIPI:
        raise HTTPException(status_code=400, detail="Tip datoteke ni dovoljen")
    
    vsebina = await datoteka.read()
    
    # Preveri velikost
    if len(vsebina) > MAX_VELIKOST:
        raise HTTPException(status_code=400, detail="Datoteka je prevelika (max 5MB)")
    
    # Unikaten naziv datoteke
    ime = f"objave/{objava_id}/{uuid.uuid4()}_{datoteka.filename}"
    
    # Naloži na Supabase Storage
    supabase.storage.from_("priloge").upload(ime, vsebina, {
        "content-type": datoteka.content_type
    })
    
    # Javni URL datoteke
    url = supabase.storage.from_("priloge").get_public_url(ime)
    
    # Shrani v bazo
    result = supabase.table("priloga").insert({
        "ime_datoteke": datoteka.filename,
        "tip_datoteke": datoteka.content_type,
        "velikost": len(vsebina),
        "pot": url,
        "objava_id": objava_id
    }).execute()
    
    return {
        "sporocilo": "Priloga uspešno naložena",
        "url": url,
        "priloga": result.data[0]
    }

@router.get("/{objava_id}/priloge")
def get_priloge(objava_id: int):
    result = supabase.table("priloga")\
        .select("*")\
        .eq("objava_id", objava_id)\
        .execute()
    return result.data

@router.delete("/{objava_id}/priloge/{priloga_id}")
def izbrisi_prilogo(objava_id: int, priloga_id: int, current_user=Depends(get_current_user)):
    # Pridobi prilogo
    priloga = supabase.table("priloga")\
        .select("*")\
        .eq("id", priloga_id)\
        .eq("objava_id", objava_id)\
        .single()\
        .execute()
    
    if not priloga.data:
        raise HTTPException(status_code=404, detail="Priloga ne obstaja")

    # Preveri lastništvo
    objava = supabase.table("objava")\
        .select("avtor_id")\
        .eq("id", objava_id)\
        .single()\
        .execute()

    if objava.data["avtor_id"] != current_user.id:
        # Preveri če je moderator
        profil = supabase.table("profil")\
            .select("vloga")\
            .eq("id", current_user.id)\
            .single()\
            .execute()
        if not profil.data or profil.data["vloga"] not in ["admin", "moderator"]:
            raise HTTPException(status_code=403, detail="Nimate dovoljenja za brisanje te priloge")
    
    # Izbrisi iz Storage
    ime = "/".join(priloga.data["pot"].split("/")[-3:])
    supabase.storage.from_("priloge").remove([ime])
    
    # Izbrisi iz baze
    supabase.table("priloga").delete().eq("id", priloga_id).execute()
    
    return {"sporocilo": "Priloga izbrisana"}