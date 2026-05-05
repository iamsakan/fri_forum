from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter(prefix="/profil", tags=["profil"])

@router.get("/{id}")
def get_profil(id: str):
    profil = supabase.table("profil")\
        .select("*")\
        .eq("id", id)\
        .single()\
        .execute()
    
    if not profil.data:
        raise HTTPException(status_code=404, detail="Profil ne obstaja")
    
    objave = supabase.table("objava")\
        .select("*, kategorija(naziv, barva)")\
        .eq("avtor_id", id)\
        .order("cas_objave", desc=True)\
        .execute()
    
    komentarji = supabase.table("komentar")\
        .select("*")\
        .eq("avtor_id", id)\
        .execute()
    
    return {
        "profil": profil.data,
        "objave": objave.data,
        "st_objav": len(objave.data),
        "st_komentarjev": len(komentarji.data)
    }