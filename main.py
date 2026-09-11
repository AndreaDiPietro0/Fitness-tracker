from fastapi import FastAPI
from pydantic import BaseModel
from datetime import date
from sqlalchemy.orm import sessionmaker
from models import engine, Allenamento, Sonno, MisuraCorporea, Pisolino, Passi

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
    esistente = db.query(Sonno).filter(Sonno.data == dati.data).first()
    if esistente:
        esistente.ore_totali = dati.ore_totali
        esistente.ore_sonno_leggero = dati.ore_sonno_leggero
        esistente.ore_sonno_profondo = dati.ore_sonno_profondo
        esistente.ore_sonno_rem = dati.ore_sonno_rem
        esistente.qualita_percepita = dati.qualita_percepita
    else:
        nuovo = Sonno(**dati.model_dump())
        db.add(nuovo)
    db.commit()
    db.close()
    return {"status": "ok", "messaggio": "Sonno salvato o aggiornato"}


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

class PassiInput(BaseModel):
    data: date
    numero_passi: int
    distanza_km: float | None = None

@app.post("/webhook/passi")
def ricevi_passi(dati: PassiInput):
    db = SessionLocal()
    esistente = db.query(Passi).filter(Passi.data == dati.data).first()
    if esistente:
        esistente.numero_passi = dati.numero_passi
        esistente.distanza_km = dati.distanza_km
    else:
        nuovo = Passi(**dati.model_dump())
        db.add(nuovo)
    db.commit()
    db.close()
    return {"status": "ok", "messaggio": "Passi salvati o aggiornati"}