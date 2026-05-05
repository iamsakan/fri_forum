from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from database import supabase
from dependencies import get_current_user
import uuid

router = APIRouter(prefix="/komentarji", tags=["priloge komentarjev"])

DOVOLJENI_TIPI = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
MAX_VELIKOST = 5 * 1024 * 1024  # 5MB

@router.post("/{komentar_id}/priloge")
async def dodaj_prilogo_komentarju(
    komentar_id: int,
    datoteka: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    # Preveri da je current_user avtor komentarja
    komentar = supabase.table("komentar")\
        .select("avtor_id")\
        .eq("id", komentar_id)\
        .single()\
        .execute()
    
    if not komentar.data:
        raise HTTPException(status_code=404, detail="Komentar ne obstaja")
    
    if komentar.data["avtor_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Samo avtor lahko dodaja priloge")

    # Preveri tip datoteke
    if datoteka.content_type not in DOVOLJENI_TIPI:
        raise HTTPException(status_code=400, detail="Tip datoteke ni dovoljen")
    
    vsebina = await datoteka.read()
    
    # Preveri velikost
    if len(vsebina) > MAX_VELIKOST:
        raise HTTPException(status_code=400, detail="Datoteka je prevelika (max 5MB)")
    
    # Unikaten naziv datoteke
    ime = f"komentarji/{komentar_id}/{uuid.uuid4()}_{datoteka.filename}"
    
    # Naloži na Supabase Storage
    supabase.storage.from_("priloge").upload(ime, vsebina, {
        "content-type": datoteka.content_type
    })
    
    # Javni URL datoteke
    url = supabase.storage.from_("priloge").get_public_url(ime)
    
    # Shrani v bazo
    result = supabase.table("priloga_komentar").insert({
        "ime_datoteke": datoteka.filename,
        "tip_datoteke": datoteka.content_type,
        "velikost": len(vsebina),
        "pot": url,
        "komentar_id": komentar_id
    }).execute()
    
    return {
        "sporocilo": "Priloga uspešno naložena",
        "url": url,
        "priloga": result.data[0]
    }

@router.get("/{komentar_id}/priloge")
def get_priloge_komentarja(komentar_id: int):
    result = supabase.table("priloga_komentar")\
        .select("*")\
        .eq("komentar_id", komentar_id)\
        .execute()
    return result.data

@router.delete("/{komentar_id}/priloge/{priloga_id}")
def izbrisi_prilogo_komentarja(
    komentar_id: int,
    priloga_id: int,
    current_user=Depends(get_current_user)
):
    priloga = supabase.table("priloga_komentar")\
        .select("*")\
        .eq("id", priloga_id)\
        .eq("komentar_id", komentar_id)\
        .single()\
        .execute()
    
    if not priloga.data:
        raise HTTPException(status_code=404, detail="Priloga ne obstaja")

    # Preveri lastništvo
    komentar = supabase.table("komentar")\
        .select("avtor_id")\
        .eq("id", komentar_id)\
        .single()\
        .execute()

    if komentar.data["avtor_id"] != current_user.id:
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
    supabase.table("priloga_komentar").delete().eq("id", priloga_id).execute()
    
    return {"sporocilo": "Priloga izbrisana"}