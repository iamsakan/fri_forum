from fastapi import APIRouter, Depends
from database import supabase
from dependencies import get_current_user

router = APIRouter(prefix="/notifikacije", tags=["notifikacije"])

@router.get("/")
def get_notifikacije(current_user=Depends(get_current_user)):
    result = supabase.table("notifikacije")\
        .select("*")\
        .eq("uporabnik_id", current_user.id)\
        .order("cas", desc=True)\
        .limit(20)\
        .execute()
    return result.data

@router.put("/preberi")
def oznaci_prebrane(current_user=Depends(get_current_user)):
    supabase.table("notifikacije")\
        .update({"prebrana": True})\
        .eq("uporabnik_id", current_user.id)\
        .execute()
    return {"ok": True}