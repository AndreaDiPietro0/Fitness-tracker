# Fitness Tracker con Agente AI

Web app personale che raccoglie dati di allenamento, sonno, peso e composizione corporea da Apple Salute (Xiaomi Smart Band 10 + Renpho), li salva in un database, ed espone un agente basato sull'API Claude con **tool use** per interrogarli in linguaggio naturale.

**Nota**: l'agente fa solo analisi sui dati raccolti — non fornisce consigli medici, nutrizionali o di allenamento.

## Perché questo progetto

Costruito per esercitarmi su backend, frontend, integrazione con LLM tramite tool use/function calling e deploy — non un tutorial, ma uno strumento che uso davvero ogni giorno.

## Come funziona

1. **Raccolta dati**: automazioni Apple Shortcuts leggono da Apple Salute (passi, sonno, misure corporee) e le mandano al backend via webhook. Gli allenamenti si inseriscono manualmente da un form (Apple Salute non espone dati di allenamento completi via Shortcuts).
2. **Backend**: FastAPI + PostgreSQL, con upsert per evitare duplicati sui dati giornalieri.
3. **Frontend**: pagina singola con tabelle dei dati, form di inserimento, e una chat per interrogare l'agente.
4. **Agente**: endpoint `/chat` che usa l'API Claude con tool use — il modello richiede l'esecuzione di funzioni Python reali (query sul database) invece di rispondere a memoria, gestendo anche più tool richiesti nella stessa domanda.

## Stack

- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: PostgreSQL (Neon), SQLite in sviluppo locale
- **Frontend**: HTML/CSS/JavaScript vanilla
- **AI**: Claude API (Anthropic), tool use / function calling
- **Hosting**: Render
- **Automazione raccolta dati**: Apple Shortcuts

## Sicurezza

Gli endpoint di scrittura (`/webhook/*`) e la chat (`/chat`) sono protetti da una chiave API condivisa, verificata tramite header `X-API-Key`. Gli endpoint di sola lettura (`/dati/*`) e il frontend restano pubblici.

## Setup locale

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Crea un file `.env` nella root con:
```
ANTHROPIC_API_KEY=la-tua-chiave
DATABASE_URL=postgresql://...   # opzionale in locale, usa SQLite se assente
API_SECRET_KEY=una-chiave-segreta-a-tua-scelta
```

Avvia il server:
```bash
uvicorn main:app --reload
```

## Stato del progetto

✅ Raccolta automatica: passi, misure corporee (peso, IMC, % grasso, massa magra), sonno
✅ Inserimento manuale: allenamenti (con dettagli per corsa/tapis roulant)
✅ Agente con tool use su 4 categorie di dati
✅ Deploy cloud, sicurezza di base
🔜 Pisolini, memoria conversazionale nella chat, filtri avanzati sulla tabella allenamenti

## Limiti noti

- Mi Fitness (Xiaomi Smart Band 10) non sincronizza le fasi del sonno su Apple Salute, solo la durata totale (bug segnalato a Xiaomi)
- Il piano gratuito di Render "addormenta" il servizio dopo inattività (~30-60 secondi di attesa alla richiesta successiva)
