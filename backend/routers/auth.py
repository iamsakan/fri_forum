from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from database import supabase

router = APIRouter(prefix="/auth", tags=["auth"])

class Registracija(BaseModel):
    email: str
    geslo: str
    uporabnisko_ime: str

    @field_validator("geslo")
    @classmethod
    def preveri_geslo(cls, v):
        if len(v) < 6:
            raise ValueError("Geslo mora imeti vsaj 6 znakov")
        return v

    @field_validator("uporabnisko_ime")
    @classmethod
    def preveri_ime(cls, v):
        if len(v.strip()) < 3:
            raise ValueError("Uporabniško ime mora imeti vsaj 3 znake")
        return v

class Prijava(BaseModel):
    email: str
    geslo: str

@router.post("/registracija")
def registracija(podatki: Registracija):
    try:
        rezultat = supabase.auth.sign_up({
            "email": podatki.email,
            "password": podatki.geslo
        })

        if not rezultat.user:
            raise HTTPException(status_code=400, detail="Registracija ni uspela")

        supabase.table("profil").insert({
            "id": rezultat.user.id,
            "uporabnisko_ime": podatki.uporabnisko_ime,
            "vloga": "uporabnik"
        }).execute()

        # Takoj prijavi uporabnika
        prijava = supabase.auth.sign_in_with_password({
            "email": podatki.email,
            "password": podatki.geslo
        })

        return {
            "sporocilo": "Registracija uspešna!",
            "access_token": prijava.session.access_token,
            "user_id": rezultat.user.id,
            "email": rezultat.user.email
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/prijava")
def prijava(podatki: Prijava):
    try:
        rezultat = supabase.auth.sign_in_with_password({
            "email": podatki.email,
            "password": podatki.geslo
        })

        if not rezultat.user:
            raise HTTPException(status_code=401, detail="Napačen email ali geslo")

        return {
            "access_token": rezultat.session.access_token,
            "user_id": rezultat.user.id,
            "email": rezultat.user.email
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail="Napačen email ali geslo")

@router.post("/odjava")
def odjava():
    supabase.auth.sign_out()
    return {"sporocilo": "Uspešno odjavljen"}