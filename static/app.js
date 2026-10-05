// --- Mostra/nascondi campi extra in base al tipo di attività ---
const selectTipo = document.getElementById("tipo_attivita");
const campiCorsa = document.getElementById("campi-corsa");

let storicoChat = [];

selectTipo.addEventListener("change", () => {
  const tipiConDettagli = ["corsa", "tapis roulant"];
  if (tipiConDettagli.includes(selectTipo.value)) {
    campiCorsa.style.display = "block";
  } else {
    campiCorsa.style.display = "none";
  }
});

// --- Carica e mostra i dati dei passi ---
let datiPassi = [];
let ordinePassi = { campo: "data", crescente: false };

async function caricaPassi() {
  const risposta = await fetch("/dati/passi");
  datiPassi = await risposta.json();
  disegnaTabellaPassi();
}

function disegnaTabellaPassi() {
  const dati = [...datiPassi].sort((a, b) => {
    const valA = a[ordinePassi.campo];
    const valB = b[ordinePassi.campo];
    if (valA < valB) return ordinePassi.crescente ? -1 : 1;
    if (valA > valB) return ordinePassi.crescente ? 1 : -1;
    return 0;
  });

  const tabella = document.getElementById("tabella-passi");
  const frecciaData = ordinePassi.campo === "data" ? (ordinePassi.crescente ? "↑" : "↓") : "";
  const frecciaPassi = ordinePassi.campo === "numero_passi" ? (ordinePassi.crescente ? "↑" : "↓") : "";

  tabella.innerHTML = `<tr>
    <th onclick="ordinaPassi('data')" style="cursor:pointer;">Data ${frecciaData}</th>
    <th onclick="ordinaPassi('numero_passi')" style="cursor:pointer;">Passi ${frecciaPassi}</th>
    <th></th>
  </tr>`;

  dati.forEach(record => {
    tabella.innerHTML += `<tr>
      <td>${record.data}</td>
      <td>${record.numero_passi}</td>
      <td><button onclick="eliminaDato('passi', '${record.data}')">Elimina</button></td>
    </tr>`;
  });
}

function ordinaPassi(campo) {
  if (ordinePassi.campo === campo) {
    ordinePassi.crescente = !ordinePassi.crescente;
  } else {
    ordinePassi.campo = campo;
    ordinePassi.crescente = true;
  }
  disegnaTabellaPassi();
}

// --- Carica e mostra le misure corporee ---
let datiMisure = [];
let ordineMisure = { campo: "data", crescente: false };

async function caricaMisure() {
  const risposta = await fetch("/dati/misure-corporee");
  datiMisure = await risposta.json();
  disegnaTabellaMisure();
}

function disegnaTabellaMisure() {
  const dati = [...datiMisure].sort((a, b) => {
    const valA = a[ordineMisure.campo];
    const valB = b[ordineMisure.campo];
    if (valA < valB) return ordineMisure.crescente ? -1 : 1;
    if (valA > valB) return ordineMisure.crescente ? 1 : -1;
    return 0;
  });

  const tabella = document.getElementById("tabella-misure");
  const freccia = (campo) => ordineMisure.campo === campo ? (ordineMisure.crescente ? "↑" : "↓") : "";

  tabella.innerHTML = `<tr>
    <th onclick="ordinaMisure('data')" style="cursor:pointer;">Data ${freccia("data")}</th>
    <th onclick="ordinaMisure('peso_kg')" style="cursor:pointer;">Peso (kg) ${freccia("peso_kg")}</th>
    <th>IMC</th>
    <th>% Grasso</th>
    <th>Massa magra (kg)</th>
    <th></th>
  </tr>`;

  dati.forEach(record => {
    tabella.innerHTML += `<tr>
      <td>${record.data}</td>
      <td>${record.peso_kg ?? "-"}</td>
      <td>${record.bmi ?? "-"}</td>
      <td>${record.percentuale_grasso ?? "-"}</td>
      <td>${record.massa_magra ?? "-"}</td>
      <td><button onclick="eliminaDato('misura-corporea', '${record.data}')">Elimina</button></td>
    </tr>`;
  });
}

function ordinaMisure(campo) {
  if (ordineMisure.campo === campo) {
    ordineMisure.crescente = !ordineMisure.crescente;
  } else {
    ordineMisure.campo = campo;
    ordineMisure.crescente = true;
  }
  disegnaTabellaMisure();
}

document.getElementById("form-passi").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const corpo = {
    data: document.getElementById("data-passi").value,
    numero_passi: parseInt(document.getElementById("numero_passi").value),
    distanza_km: document.getElementById("distanza_km_passi").value
      ? parseFloat(document.getElementById("distanza_km_passi").value) : null,
  };

  const risposta = await fetch("/webhook/passi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "hQ8TYqmqnU6BQmxoPgJaCzX53cr0PrM8v5qo3DP15ok"
    },
    body: JSON.stringify(corpo)
  });

  const messaggio = document.getElementById("messaggio-form-passi");
  messaggio.textContent = risposta.ok ? "Passi salvati!" : "Errore nel salvataggio.";
  if (risposta.ok) {
    document.getElementById("form-passi").reset();
    caricaPassi();
  }
});

document.getElementById("form-sonno-manuale").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const corpo = {
    data: document.getElementById("data-sonno-manuale").value,
    ore_totali: parseFloat(document.getElementById("ore_totali_manuale").value),
    ore_sonno_leggero: document.getElementById("leggero_manuale").value
      ? parseFloat(document.getElementById("leggero_manuale").value) : null,
    ore_sonno_profondo: document.getElementById("profondo_manuale").value
      ? parseFloat(document.getElementById("profondo_manuale").value) : null,
    ore_sonno_rem: document.getElementById("rem_manuale").value
      ? parseFloat(document.getElementById("rem_manuale").value) : null,
  };

  const risposta = await fetch("/webhook/sonno", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "hQ8TYqmqnU6BQmxoPgJaCzX53cr0PrM8v5qo3DP15ok"
    },
    body: JSON.stringify(corpo)
  });

  const messaggio = document.getElementById("messaggio-form-sonno-manuale");
  messaggio.textContent = risposta.ok ? "Sonno salvato!" : "Errore nel salvataggio.";
  if (risposta.ok) {
    document.getElementById("form-sonno-manuale").reset();
    caricaSonno();
  }
});


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

let datiSonno = [];
let ordineSonnoCrescente = false;

async function caricaSonno() {
  const risposta = await fetch("/dati/sonno");
  datiSonno = await risposta.json();
  disegnaTabellaSonno();
}

function disegnaTabellaSonno() {
  const dati = [...datiSonno].sort((a, b) => {
    if (a.data < b.data) return ordineSonnoCrescente ? -1 : 1;
    if (a.data > b.data) return ordineSonnoCrescente ? 1 : -1;
    return 0;
  });

  const tabella = document.getElementById("tabella-sonno");
  const freccia = ordineSonnoCrescente ? "↑" : "↓";

  tabella.innerHTML = `<tr>
    <th onclick="ordinaSonno()" style="cursor:pointer;">Data ${freccia}</th>
    <th>Ore totali</th><th>REM</th><th>Leggero</th><th>Profondo</th><th></th><th></th>
  </tr>`;

  dati.forEach(record => {
    tabella.innerHTML += `<tr>
      <td>${record.data}</td>
      <td>${record.ore_totali ?? "-"}</td>
      <td><input type="number" step="0.01" class="input-rem" data-data="${record.data}" value="${record.ore_sonno_rem ?? ""}"></td>
      <td><input type="number" step="0.01" class="input-leggero" data-data="${record.data}" value="${record.ore_sonno_leggero ?? ""}"></td>
      <td><input type="number" step="0.01" class="input-profondo" data-data="${record.data}" value="${record.ore_sonno_profondo ?? ""}"></td>
      <td><button onclick="salvaFasiSonno('${record.data}')">Salva</button></td>
      <td><button onclick="eliminaDato('sonno', '${record.data}')">Elimina</button></td>
    </tr>`;
  });
}

function ordinaSonno() {
  ordineSonnoCrescente = !ordineSonnoCrescente;
  disegnaTabellaSonno();
}

async function salvaFasiSonno(data) {
  const leggero = document.querySelector(`.input-leggero[data-data="${data}"]`).value;
  const profondo = document.querySelector(`.input-profondo[data-data="${data}"]`).value;
  const rem = document.querySelector(`.input-rem[data-data="${data}"]`).value;

  const corpo = {
    data: data,
    ore_sonno_leggero: leggero ? parseFloat(leggero) : null,
    ore_sonno_profondo: profondo ? parseFloat(profondo) : null,
    ore_sonno_rem: rem ? parseFloat(rem) : null,
  };

  const risposta = await fetch("/webhook/sonno", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "hQ8TYqmqnU6BQmxoPgJaCzX53cr0PrM8v5qo3DP15ok"
    },
    body: JSON.stringify(corpo)
  });

  if (risposta.ok) {
    caricaSonno();
  } else {
    alert("Errore nel salvataggio");
  }
}

let datiAllenamenti = [];
let ordineAllenamenti = { campo: "data", crescente: false };

async function caricaAllenamenti() {
  const risposta = await fetch("/dati/allenamenti");
  datiAllenamenti = await risposta.json();
  disegnaTabellaAllenamenti();
}

function disegnaTabellaAllenamenti() {
  const dati = [...datiAllenamenti].sort((a, b) => {
    const valA = a[ordineAllenamenti.campo];
    const valB = b[ordineAllenamenti.campo];
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (valA < valB) return ordineAllenamenti.crescente ? -1 : 1;
    if (valA > valB) return ordineAllenamenti.crescente ? 1 : -1;
    return 0;
  });

  const tabella = document.getElementById("tabella-allenamenti");
  const freccia = (campo) => ordineAllenamenti.campo === campo ? (ordineAllenamenti.crescente ? "↑" : "↓") : "";

  tabella.innerHTML = `<tr>
    <th onclick="ordinaAllenamenti('data')" style="cursor:pointer;">Data ${freccia("data")}</th>
    <th>Tipo</th>
    <th onclick="ordinaAllenamenti('durata_minuti')" style="cursor:pointer;">Durata (min) ${freccia("durata_minuti")}</th>
    <th onclick="ordinaAllenamenti('calorie_stimate')" style="cursor:pointer;">Calorie ${freccia("calorie_stimate")}</th>
    <th>Distanza (km)</th><th>FC media</th><th>FC max</th><th>Passi allenamento</th><th></th>
  </tr>`;

  dati.forEach(record => {
    tabella.innerHTML += `<tr>
      <td>${record.data}</td>
      <td>${record.tipo_attivita}</td>
      <td>${record.durata_minuti}</td>
      <td>${record.calorie_stimate ?? "-"}</td>
      <td>${record.distanza_km ?? "-"}</td>
      <td>${record.frequenza_cardiaca_media ?? "-"}</td>
      <td>${record.frequenza_cardiaca_max ?? "-"}</td>
      <td>${record.passi_allenamento ?? "-"}</td>
      <td><button onclick="eliminaAllenamento(${record.id})">Elimina</button></td>
    </tr>`;
  });
}

function ordinaAllenamenti(campo) {
  if (ordineAllenamenti.campo === campo) {
    ordineAllenamenti.crescente = !ordineAllenamenti.crescente;
  } else {
    ordineAllenamenti.campo = campo;
    ordineAllenamenti.crescente = true;
  }
  disegnaTabellaAllenamenti();
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
      body: JSON.stringify({ messaggio: messaggioUtente, storico: storicoChat })
    });

    const dati = await risposta.json();
    if (risposta.ok) {
      box.innerHTML += `\n\n🤖 Agente: ${dati.risposta}`;
      storicoChat = dati.storico;
    } else {
      box.innerHTML += `\n\n🤖 Agente: Errore: ${dati.detail}`;
    }
  } catch (errore) {
    box.innerHTML += `\n\n🤖 Agente: Errore di connessione.`;
  }

  box.scrollTop = box.scrollHeight;
  input.disabled = false;
  input.focus();
});

async function eliminaDato(tipo, data) {
  if (!confirm(`Eliminare il dato di ${tipo} del ${data}?`)) return;

  const risposta = await fetch(`/webhook/${tipo}/${data}`, {
    method: "DELETE",
    headers: { "X-API-Key": "hQ8TYqmqnU6BQmxoPgJaCzX53cr0PrM8v5qo3DP15ok" }
  });

  if (risposta.ok) {
    if (tipo === "passi") caricaPassi();
    if (tipo === "sonno") caricaSonno();
    if (tipo === "misura-corporea") caricaMisure();
  } else {
    alert("Errore nell'eliminazione");
  }
}

async function eliminaAllenamento(id) {
  if (!confirm("Eliminare questo allenamento?")) return;

  const risposta = await fetch(`/webhook/allenamento/${id}`, {
    method: "DELETE",
    headers: { "X-API-Key": "hQ8TYqmqnU6BQmxoPgJaCzX53cr0PrM8v5qo3DP15ok" }
  });

  if (risposta.ok) {
    caricaAllenamenti();
  } else {
    alert("Errore nell'eliminazione");
  }
}

// --- Avvio: carica i dati appena la pagina è pronta ---
caricaPassi();
caricaMisure();
caricaSonno();
caricaAllenamenti();

