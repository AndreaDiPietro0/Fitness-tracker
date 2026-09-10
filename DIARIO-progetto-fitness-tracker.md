# Diario del progetto — Fitness & Dieta Tracker con agente AI

## Obiettivo del progetto
Costruire una web app personale che:
- raccoglie dati di allenamento, sonno, peso e composizione corporea (Xiaomi Smart Band 10 + Renpho, via Apple Salute)
- li salva in un database
- espone un agente basato sull'API Claude con **tool use** (function calling) per interrogare i dati in linguaggio naturale e mostrare trend/analisi
- NON fornisce consigli medici, nutrizionali o di allenamento — è uno strumento di tracciamento e analisi, non di prescrizione

## Perché questo progetto
- Esercitarsi su skill richieste nel mercato del lavoro remoto: backend, frontend, integrazione API, tool use, MCP
- Avere un progetto reale da portfolio/GitHub, non un tutorial fine a sé stesso
- Usarlo davvero, non solo dimostrarlo

## Stack scelto (e perché)
| Componente | Scelta | Perché |
|---|---|---|
| Backend | Python + FastAPI | Semplice, ottimo per API/webhook, SDK Anthropic matura in Python |
| Database | SQLite (poi eventualmente Postgres) | Leggero per iniziare, si può migrare dopo senza riscrivere tutto |
| ORM | SQLAlchemy | Standard de facto in Python, definisce le tabelle come classi Python |
| Frontend | HTML/JS semplice (poi eventualmente React) | Non serve complessità subito, il core è il backend + AI |
| Fonte dati | Apple Salute (hub unico per Xiaomi Band + Renpho) | Un solo punto di integrazione invece di due app separate |
| Import dati | Apple Shortcuts → webhook HTTP | Automazione senza inserimento manuale, nessun codice Swift necessario |
| AI layer | Claude API con tool use | Il modello chiama funzioni reali sui dati invece di "indovinare" |
| Ambiente dev | VS Code + venv Python + Docker (se serve Postgres) | Standard, gira nativo su Mac M1 |

## Roadmap (8 fasi)
1. Schema database e setup progetto
2. Endpoint webhook per ricevere i dati
3. Automazione Shortcuts su iPhone
4. Backfill storico (export manuale una tantum da Salute)
5. Frontend base (senza AI) — verifica che la pipeline dati funzioni
6. Claude API + tool use — l'agente vero e proprio
7. Rifinitura: error handling, sicurezza (dati sensibili!)
8. Packaging finale: repo GitHub, README, demo

---

## Diario dei passi

### Step 1 — Setup ambiente di sviluppo ✅
**Perché:** isolare le dipendenze del progetto da altri progetti Python sul Mac (es. quelli della tesi), evitare conflitti di versione.

**Cosa abbiamo fatto:**
1. Verificato Python 3.10+ (`python3 --version`)
2. Creata la cartella `fitness-tracker/` come root del progetto
3. Creato un ambiente virtuale isolato: `python3 -m venv venv` + `source venv/bin/activate`
4. Installate le librerie base:
   - **FastAPI**: framework per il backend/API
   - **uvicorn**: server che fa girare FastAPI
   - **SQLAlchemy**: ORM per definire le tabelle come classi Python invece di SQL a mano

### Step 2 — Schema database ✅
**Perché è la decisione più importante:** tutto il resto (webhook, automazione, funzioni dell'agente) dipende da come sono strutturati i dati qui.

**Tabelle definite in `models.py`:**

1. **`allenamenti`**: id, data, tipo_attivita, durata_minuti, calorie_stimate, frequenza_cardiaca_media
2. **`sonno`** (un record al giorno, `data` unique): id, data, ore_totali, ore_sonno_leggero, ore_sonno_profondo, ore_sonno_rem, qualita_percepita
3. **`misure_corporee`** (dati Renpho): id, data, peso_kg, percentuale_grasso, massa_magra, bmi
4. **`pisolini`** (record multipli per giorno possibili, niente `unique` su data): id, data, ora_inizio, durata_minuti — separata da `sonno` perché la band non fornisce le fasi (leggero/profondo/REM) per i pisolini, solo la durata totale

**Tabella `pasti` (alimentazione): rimandata a fase futura.** Andrà gestita con FatSecret — da verificare se sincronizza con Apple Salute o serve un'integrazione API separata.

**Comandi eseguiti:**
```
python3 models.py   # crea fisicamente fitness.db con le tabelle sopra
ls                   # verifica comparsa di fitness.db
```

### Step 2.5 — Setup Git/GitHub (in corso)
**Perché farlo ora**: evitare di versionare per errore `venv/` (pesante, ricreabile) o dati sensibili come l'API key o `fitness.db`.

```
git init
```
`.gitignore` con: `venv/`, `__pycache__/`, `*.pyc`, `.env`, `fitness.db`

```
git add .
git commit -m "Setup iniziale: ambiente e schema database"
```
Poi repo creato su GitHub e collegato con `git remote add origin ...` + `git push -u origin main`.

### Step 3 — (prossimo)
*Da compilare quando lo affrontiamo.*

---

## Note e decisioni da ricordare
- L'agente non deve mai dare consigli nutrizionali/di allenamento specifici — solo analisi sui dati raccolti
- Apple Salute non ha API cloud remota: l'accesso ai dati avviene solo sul dispositivo, da cui la scelta di Shortcuts
- Renpho e Xiaomi Band confluiscono entrambi in Apple Salute — non serve integrarli separatamente
