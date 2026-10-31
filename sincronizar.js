const fetch = require("node-fetch");

async function sincronizarConProxy() {
  const token = process.env.SUPERCELL_TOKEN;
  const webhookUrl = process.env.SHEET_WEB_APP_URL;
  const clanTag = "%232CG8JCYCP";
  
  // Usamos el servicio proxy gratuito y abierto AllOrigins
  const targetUrl = "https://api.clashofclans.com/v1/clans/" + clanTag + "/members";
  const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(targetUrl);

  const headers = {
    "Authorization": "Bearer " + token,
    "Accept": "application/json"
  };

  console.log("Obteniendo miembros a través del proxy estático...");
  const resProxy = await fetch(proxyUrl);
  const proxyData = await resProxy.json();

  if (proxyData.contents) {
    const miembrosData = JSON.parse(proxyData.contents);

    if (miembrosData.items) {
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
      console.log("Error en los datos de Supercell:", JSON.stringify(miembrosData));
    }
  } else {
    console.log("Error al conectar con el proxy:", JSON.stringify(proxyData));
  }
}

sincronizarConProxy();
