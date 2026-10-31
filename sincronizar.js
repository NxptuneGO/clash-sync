const fetch = require("node-fetch");

async function sincronizarConProxy() {
  const token = process.env.SUPERCELL_TOKEN;
  const webhookUrl = process.env.SHEET_WEB_APP_URL;
  const clanTag = "%232CG8JCYCP";
  
  const proxyTarget = "https://api.clashofclans.com/v1/clans/" + clanTag + "/members";
  const apiUrl = "https://corsproxy.io/?" + encodeURIComponent(proxyTarget);

  const headers = {
    "Authorization": "Bearer " + token,
    "Accept": "application/json"
  };

  console.log("Obteniendo miembros a través del proxy...");
  const resMiembros = await fetch(apiUrl, { headers });
  const miembrosData = await resMiembros.json();

  if (resMiembros.status === 200 && miembrosData.items) {
    const payload = {
      members: miembrosData.items.map(m => ({
        name: m.name,
        role: m.role,
        donations: m.donations,
        trophies: m.trophies
      }))
    };

    console.log("Enviando " + payload.members.length + " miembros a Google Sheets...");
    const resSheet = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("Respuesta de Google Sheets:", await resSheet.text());
  } else {
    console.log("Error al consultar Supercell:", JSON.stringify(miembrosData));
  }
}

sincronizarConProxy();
