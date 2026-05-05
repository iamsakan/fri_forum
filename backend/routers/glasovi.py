from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase

router = APIRouter(prefix="/glasovi", tags=["glasovi"])

class NovGlas(BaseModel):
    tip: str
    objava_id: int

@router.post("/")
def glasuj(glas: NovGlas):
    if glas.tip not in ["up", "down"]:
        raise HTTPException(status_code=400, detail="Tip mora biti 'up' ali 'down'")
    
    result = supabase.table("glas").insert({
        "tip": glas.tip,
        "objava_id": glas.objava_id
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