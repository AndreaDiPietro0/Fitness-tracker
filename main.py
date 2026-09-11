from fastapi import FastAPI
from pydantic import BaseModel
from datetime import date
from sqlalchemy.orm import sessionmaker
from models import engine, Allenamento, Sonno, MisuraCorporea, Pisolino

app = FastAPI()

# Sessione = il "canale" attraverso cui parliamo al database
SessionLocal = sessionmaker(bind=engine)

# Definiamo la "forma" attesa dei dati in arrivo per un allenamento
class AllenamentoInput(BaseModel):
    data: date
    tipo_attivita: str
    durata_minuti: int
    calorie_stimate: float | None = None
    frequenza_cardiaca_media: int | None = None

@app.post("/webhook/allenamento")
def ricevi_allenamento(dati: AllenamentoInput):
    db = SessionLocal()
    nuovo = Allenamento(**dati.model_dump())
    db.add(nuovo)
    db.commit()
    db.close()
    return {"status": "ok", "messaggio": "Allenamento salvato"}

class SonnoInput(BaseModel):
    data: date
    ore_totali: float
    ore_sonno_leggero: float | None = None
    ore_sonno_profondo: float | None = None
    ore_sonno_rem: float | None = None
    qualita_percepita: int | None = None

@app.post("/webhook/sonno")
def ricevi_sonno(dati: SonnoInput):
    db = SessionLocal()
    nuovo = Sonno(**dati.model_dump())
    db.add(nuovo)
    db.commit()
    db.close()
    return {"status": "ok", "messaggio": "Sonno salvato"}


class PisolinoInput(BaseModel):
    data: date
    ora_inizio: str | None = None
    durata_minuti: int

@app.post("/webhook/pisolino")
def ricevi_pisolino(dati: PisolinoInput):
    db = SessionLocal()
    nuovo = Pisolino(**dati.model_dump())
    db.add(nuovo)
    db.commit()
    db.close()
    return {"status": "ok", "messaggio": "Pisolino salvato"}


class MisuraCorporeaInput(BaseModel):
    data: date
    peso_kg: float
    percentuale_grasso: float | None = None
    massa_magra: float | None = None
    bmi: float | None = None

@app.post("/webhook/misura-corporea")
def ricevi_misura(dati: MisuraCorporeaInput):
    db = SessionLocal()
    nuovo = MisuraCorporea(**dati.model_dump())
    db.add(nuovo)
    db.commit()
    db.close()
    return {"status": "ok", "messaggio": "Misura salvata"}