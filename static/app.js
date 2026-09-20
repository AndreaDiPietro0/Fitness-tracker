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
    headers: { "Content-Type": "application/json" },
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

// --- Avvio: carica i dati appena la pagina è pronta ---
caricaPassi();
caricaMisure();
caricaSonno();

