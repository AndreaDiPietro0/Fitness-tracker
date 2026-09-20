from fastapi import FastAPI
from pydantic import BaseModel
from datetime import date
from sqlalchemy.orm import sessionmaker
from models import engine, Allenamento, Sonno, MisuraCorporea, Pisolino, Passi
from fastapi.staticfiles import StaticFiles

from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()
client = Anthropic()

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# Sessione = il "canale" attraverso cui parliamo al database
SessionLocal = sessionmaker(bind=engine)

# Definiamo la "forma" attesa dei dati in arrivo per un allenamento
class AllenamentoInput(BaseModel):
    data: date
    tipo_attivita: str
    durata_minuti: int
    calorie_stimate: float | None = None
    frequenza_cardiaca_media: int | None = None
    frequenza_cardiaca_max: int | None = None
    passi_allenamento: int | None = None
    distanza_km: float | None = None

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
    esistente = db.query(MisuraCorporea).filter(MisuraCorporea.data == dati.data).first()
    if esistente:
        esistente.peso_kg = dati.peso_kg
        esistente.bmi = dati.bmi
        esistente.percentuale_grasso = dati.percentuale_grasso
        esistente.massa_magra = dati.massa_magra
    else:
        nuovo = MisuraCorporea(**dati.model_dump())
        db.add(nuovo)
    db.commit()
    db.close()
    return {"status": "ok", "messaggio": "Misura salvata o aggiornata"}

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

@app.get("/dati/misure-corporee")
def leggi_misure():
    db = SessionLocal()
    risultati = db.query(MisuraCorporea).all()
    db.close()
    return risultati

@app.get("/dati/passi")
def leggi_passi():
    db = SessionLocal()
    risultati = db.query(Passi).all()
    db.close()
    return risultati


tools = [
    {
        "name": "get_passi",
        "description": "Restituisce il numero di passi registrati in un intervallo di date",
        "input_schema": {
            "type": "object",
            "properties": {
                "data_inizio": {"type": "string", "description": "Data di inizio in formato YYYY-MM-DD"},
                "data_fine": {"type": "string", "description": "Data di fine in formato YYYY-MM-DD"}
            },
            "required": ["data_inizio", "data_fine"]
        }
    },
    {
        "name": "get_sonno",
        "description": "Restituisce le ore di sonno registrate in un intervallo di date",
        "input_schema": {
            "type": "object",
            "properties": {
                "data_inizio": {"type": "string", "description": "Data di inizio in formato YYYY-MM-DD"},
                "data_fine": {"type": "string", "description": "Data di fine in formato YYYY-MM-DD"}
            },
            "required": ["data_inizio", "data_fine"]
        }
    },
    {
        "name": "get_allenamenti",
        "description": "Restituisce gli allenamenti registrati in un intervallo di date, con tipo, durata, calorie e altri dettagli",
        "input_schema": {
            "type": "object",
            "properties": {
                "data_inizio": {"type": "string", "description": "Data di inizio in formato YYYY-MM-DD"},
                "data_fine": {"type": "string", "description": "Data di fine in formato YYYY-MM-DD"}
            },
            "required": ["data_inizio", "data_fine"]
        }
    },
    {
        "name": "get_misure_corporee",
        "description": "Restituisce peso, IMC, percentuale di grasso e massa magra registrati in un intervallo di date",
        "input_schema": {
            "type": "object",
            "properties": {
                "data_inizio": {"type": "string", "description": "Data di inizio in formato YYYY-MM-DD"},
                "data_fine": {"type": "string", "description": "Data di fine in formato YYYY-MM-DD"}
            },
            "required": ["data_inizio", "data_fine"]
        }
    }
]

def esegui_get_passi(data_inizio: str, data_fine: str):
    db = SessionLocal()
    risultati = db.query(Passi).filter(Passi.data >= data_inizio, Passi.data <= data_fine).all()
    db.close()
    return [{"data": str(r.data), "numero_passi": r.numero_passi} for r in risultati]

def esegui_get_sonno(data_inizio: str, data_fine: str):
    db = SessionLocal()
    risultati = db.query(Sonno).filter(Sonno.data >= data_inizio, Sonno.data <= data_fine).all()
    db.close()
    return [{"data": str(r.data), "ore_totali": r.ore_totali} for r in risultati]

def esegui_get_allenamenti(data_inizio: str, data_fine: str):
    db = SessionLocal()
    risultati = db.query(Allenamento).filter(Allenamento.data >= data_inizio, Allenamento.data <= data_fine).all()
    db.close()
    return [{
        "data": str(r.data), "tipo_attivita": r.tipo_attivita, "durata_minuti": r.durata_minuti,
        "calorie_stimate": r.calorie_stimate, "distanza_km": r.distanza_km
    } for r in risultati]

def esegui_get_misure_corporee(data_inizio: str, data_fine: str):
    db = SessionLocal()
    risultati = db.query(MisuraCorporea).filter(MisuraCorporea.data >= data_inizio, MisuraCorporea.data <= data_fine).all()
    db.close()
    return [{
        "data": str(r.data), "peso_kg": r.peso_kg, "bmi": r.bmi,
        "percentuale_grasso": r.percentuale_grasso, "massa_magra": r.massa_magra
    } for r in risultati]

# Mappa nome tool -> funzione Python da eseguire davvero
esecutori_tool = {
    "get_passi": esegui_get_passi,
    "get_sonno": esegui_get_sonno,
    "get_allenamenti": esegui_get_allenamenti,
    "get_misure_corporee": esegui_get_misure_corporee,
}

class ChatInput(BaseModel):
    messaggio: str

@app.post("/chat")
def chatta_con_agente(dati: ChatInput):
    messaggi = [{"role": "user", "content": dati.messaggio}]

    while True:
        risposta = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            tools=tools,
            messages=messaggi
        )

        if risposta.stop_reason != "tool_use":
            return {"risposta": risposta.content[0].text}

        messaggi.append({"role": "assistant", "content": risposta.content})

        # Eseguiamo TUTTI i tool richiesti in questo giro (potrebbero essere più di uno)
        risultati_tool = []
        for blocco in risposta.content:
            if blocco.type == "tool_use":
                funzione = esecutori_tool[blocco.name]
                risultato = funzione(**blocco.input)
                risultati_tool.append({
                    "type": "tool_result",
                    "tool_use_id": blocco.id,
                    "content": str(risultato)
                })

        messaggi.append({"role": "user", "content": risultati_tool})
        # Il ciclo while ricomincia: mandiamo di nuovo tutto al modello,
        # che ora deciderà se rispondere o chiamare ancora un altro tool


@app.get("/dati/sonno")
def leggi_sonno():
    db = SessionLocal()
    risultati = db.query(Sonno).all()
    db.close()
    return risultati

@app.get("/dati/allenamenti")
def leggi_allenamenti():
    db = SessionLocal()
    risultati = db.query(Allenamento).all()
    db.close()
    return risultati