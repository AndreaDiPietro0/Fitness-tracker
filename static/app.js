// --- Mostra/nascondi campi extra in base al tipo di attività ---
const selectTipo = document.getElementById("tipo_attivita");
const campiCorsa = document.getElementById("campi-corsa");

selectTipo.addEventListener("change", () => {
  const tipiConDettagli = ["corsa", "tapis roulant"];
  if (tipiConDettagli.includes(selectTipo.value)) {
    campiCorsa.style.display = "block";
  } else {
    campiCorsa.style.display = "none";
  }
});

// --- Carica e mostra i dati dei passi ---
async function caricaPassi() {
  const risposta = await fetch("/dati/passi");
  const dati = await risposta.json();
  const tabella = document.getElementById("tabella-passi");
  tabella.innerHTML = "<tr><th>Data</th><th>Passi</th></tr>";
  dati.forEach(record => {
    tabella.innerHTML += `<tr><td>${record.data}</td><td>${record.numero_passi}</td></tr>`;
  });
}

// --- Carica e mostra le misure corporee ---
async function caricaMisure() {
  const risposta = await fetch("/dati/misure-corporee");
  const dati = await risposta.json();
  const tabella = document.getElementById("tabella-misure");
  tabella.innerHTML = "<tr><th>Data</th><th>Peso (kg)</th><th>IMC</th><th>% Grasso</th><th>Massa magra (kg)</th></tr>";
  dati.forEach(record => {
    tabella.innerHTML += `<tr>
      <td>${record.data}</td>
      <td>${record.peso_kg ?? "-"}</td>
      <td>${record.bmi ?? "-"}</td>
      <td>${record.percentuale_grasso ?? "-"}</td>
      <td>${record.massa_magra ?? "-"}</td>
    </tr>`;
  });
}

// --- Gestione invio form allenamento ---
document.getElementById("form-allenamento").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const corpo = {
    data: document.getElementById("data").value,
    tipo_attivita: document.getElementById("tipo_attivita").value,
    durata_minuti: parseInt(document.getElementById("durata_minuti").value),
    calorie_stimate: document.getElementById("calorie_stimate").value
      ? parseFloat(document.getElementById("calorie_stimate").value) : null,
    frequenza_cardiaca_media: document.getElementById("frequenza_cardiaca_media").value
      ? parseInt(document.getElementById("frequenza_cardiaca_media").value) : null,
    frequenza_cardiaca_max: document.getElementById("frequenza_cardiaca_max").value
      ? parseInt(document.getElementById("frequenza_cardiaca_max").value) : null,
    passi_allenamento: document.getElementById("passi_allenamento").value
      ? parseInt(document.getElementById("passi_allenamento").value) : null,
    distanza_km: document.getElementById("distanza_km").value
      ? parseFloat(document.getElementById("distanza_km").value) : null,
  };

const risposta = await fetch("/webhook/allenamento", {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        "X-API-Key": "hQ8TYqmqnU6BQmxoPgJaCzX53cr0PrM8v5qo3DP15ok"
    },
    body: JSON.stringify(corpo)
});

  const messaggio = document.getElementById("messaggio-form");
  if (risposta.ok) {
    messaggio.textContent = "Allenamento salvato!";
    document.getElementById("form-allenamento").reset();
    campiCorsa.style.display = "none";
  } else {
    messaggio.textContent = "Errore nel salvataggio.";
  }
});

async function caricaSonno() {
  const risposta = await fetch("/dati/sonno");
  const dati = await risposta.json();
  const tabella = document.getElementById("tabella-sonno");
  tabella.innerHTML = "<tr><th>Data</th><th>Ore totali</th><th>Leggero</th><th>Profondo</th><th>REM</th></tr>";
  dati.forEach(record => {
    tabella.innerHTML += `<tr>
      <td>${record.data}</td>
      <td>${record.ore_totali ?? "-"}</td>
      <td>${record.ore_sonno_leggero ?? "-"}</td>
      <td>${record.ore_sonno_profondo ?? "-"}</td>
      <td>${record.ore_sonno_rem ?? "-"}</td>
    </tr>`;
  });
}

document.getElementById("form-sonno").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const corpo = {
    data: document.getElementById("data-sonno").value,
    ore_totali: parseFloat(document.getElementById("ore_totali").value),
    ore_sonno_leggero: document.getElementById("ore_sonno_leggero").value
      ? parseFloat(document.getElementById("ore_sonno_leggero").value) : null,
    ore_sonno_profondo: document.getElementById("ore_sonno_profondo").value
      ? parseFloat(document.getElementById("ore_sonno_profondo").value) : null,
    ore_sonno_rem: document.getElementById("ore_sonno_rem").value
      ? parseFloat(document.getElementById("ore_sonno_rem").value) : null,
  };

  const risposta = await fetch("/webhook/sonno", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "la-tua-chiave-segreta-nuova"
    },
    body: JSON.stringify(corpo)
  });

  const messaggio = document.getElementById("messaggio-form-sonno");
  messaggio.textContent = risposta.ok ? "Sonno salvato!" : "Errore nel salvataggio.";
  if (risposta.ok) {
    document.getElementById("form-sonno").reset();
    caricaSonno(); // ricarica la tabella per mostrare subito l'aggiornamento
  }
});

async function caricaAllenamenti() {
  const risposta = await fetch("/dati/allenamenti");
  const dati = await risposta.json();
  const tabella = document.getElementById("tabella-allenamenti");
  tabella.innerHTML = "<tr><th>Data</th><th>Tipo</th><th>Durata (min)</th><th>Calorie</th><th>Distanza (km)</th><th>FC media</th><th>FC max</th><th>Passi allenamento</th></tr>";
  dati.forEach(record => {
    tabella.innerHTML += `<tr>
      <td>${record.data}</td>
      <td>${record.tipo_attivita}</td>
      <td>${record.durata_minuti}</td>
      <td>${record.calorie_stimate ?? "-"}</td>
      <td>${record.distanza_km ?? "-"}</td>
      <td>${record.frequenza_cardiaca_media}</td>
      <td>${record.frequenza_cardiaca_max}</td>
      <td>${record.passi_allenamento}</td>
    </tr>`;
  });
}

document.getElementById("form-chat").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const input = document.getElementById("messaggio-chat");
  const messaggioUtente = input.value;
  const box = document.getElementById("chat-messaggi");

  box.innerHTML += `\n\n👤 Tu: ${messaggioUtente}`;
  box.scrollTop = box.scrollHeight;
  input.value = "";
  input.disabled = true;

  try {
    const risposta = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "hQ8TYqmqnU6BQmxoPgJaCzX53cr0PrM8v5qo3DP15ok"
      },
      body: JSON.stringify({ messaggio: messaggioUtente })
    });

    const dati = await risposta.json();
    box.innerHTML += `\n\n🤖 Agente: ${risposta.ok ? dati.risposta : "Errore: " + dati.detail}`;
  } catch (errore) {
    box.innerHTML += `\n\n🤖 Agente: Errore di connessione.`;
  }

  box.scrollTop = box.scrollHeight;
  input.disabled = false;
  input.focus();
});

// --- Avvio: carica i dati appena la pagina è pronta ---
caricaPassi();
caricaMisure();
caricaSonno();
caricaAllenamenti();

