from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import supabase
from dependencies import get_current_user

router = APIRouter(prefix="/glasovi", tags=["glasovi"])

class NovGlas(BaseModel):
    tip: str
    objava_id: int

@router.post("/")
def glasuj(glas: NovGlas, current_user=Depends(get_current_user)):
    if glas.tip not in ["up", "down"]:
        raise HTTPException(status_code=400, detail="Tip mora biti 'up' ali 'down'")
    
    # Preveri če je že glasoval
    obstojen = supabase.table("glas")\
        .select("id, tip")\
        .eq("objava_id", glas.objava_id)\
        .eq("avtor_id", current_user.id)\
        .execute()
    
    if obstojen.data:
        # Če je isti glas — odstrani (toggle)
        if obstojen.data[0]["tip"] == glas.tip:
            supabase.table("glas").delete().eq("id", obstojen.data[0]["id"]).execute()
            return {"sporocilo": "Glas odstranjen"}
        else:
            # Če je drugačen glas — posodobi
            supabase.table("glas").update({"tip": glas.tip}).eq("id", obstojen.data[0]["id"]).execute()
            return {"sporocilo": "Glas posodobljen"}
    
    # Nov glas
    result = supabase.table("glas").insert({
        "tip": glas.tip,
        "objava_id": glas.objava_id,
        "avtor_id": current_user.id
    }).execute()
    return result.data[0]

@router.get("/{objava_id}")
def get_glasovi(objava_id: int):
    result = supabase.table("glas")\
        .select("tip")\
        .eq("objava_id", objava_id)\
        .execute()
    
    up = sum(1 for g in result.data if g["tip"] == "up")
    down = sum(1 for g in result.data if g["tip"] == "down")
    
    return {"up": up, "down": down, "skupaj": up - down}