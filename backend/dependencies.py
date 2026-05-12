from fastapi import HTTPException, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security
from database import supabase

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Niste prijavljeni")
    
    try:
        token = credentials.credentials
        user = supabase.auth.get_user(token)
        
        if not user.user:
            raise HTTPException(status_code=401, detail="Neveljaven token")
        
        # Preveri ali je uporabnik blokiran
        profil = supabase.table("profil")\
            .select("vloga")\
            .eq("id", user.user.id)\
            .single()\
            .execute()
        
        if profil.data and profil.data["vloga"] == "blokiran":
            raise HTTPException(status_code=403, detail="Vaš račun je bil blokiran")
        
        return user.user
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Neveljaven token")

async def get_admin(current_user=Depends(get_current_user)):
    profil = supabase.table("profil")\
        .select("vloga")\
        .eq("id", current_user.id)\
        .single()\
        .execute()
    
    if not profil.data or profil.data["vloga"] != "admin":
        raise HTTPException(status_code=403, detail="Samo admini imajo dostop")
    
    return current_user

async def get_moderator(current_user=Depends(get_current_user)):
    profil = supabase.table("profil")\
        .select("vloga")\
        .eq("id", current_user.id)\
        .single()\
        .execute()
    
    if not profil.data or profil.data["vloga"] not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Samo moderatorji in admini imajo dostop")
    
    return current_user