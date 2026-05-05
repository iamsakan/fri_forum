from fastapi import HTTPException, Header
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
        
        return user.user
    
    except Exception as e:
        raise HTTPException(status_code=401, detail="Neveljaven token")