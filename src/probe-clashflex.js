const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

const TARGET_URL = process.env.CLASHFLEX_URL || "https://clashflex.com/en/war/";
const CLAN_TAG = (process.env.CLAN_TAG || "#2CG8JCYCP").replace(/\s/g, "");
const OUTPUT_DIR = process.env.OUTPUT_DIR || "artifacts";
const WAIT_MS = Number(process.env.PROBE_WAIT_MS || 15000);
const MAX_BODY_BYTES = 1_500_000;

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const responses = [];
  const failures = [];

  page.on("requestfailed", request => {
    failures.push({ url: request.url(), error: request.failure()?.errorText || "unknown" });
  });

  page.on("response", async response => {
    const headers = response.headers();
    const contentType = headers["content-type"] || "";
    if (!/(json|text|javascript|html)/i.test(contentType)) return;
    try {
      const body = await response.body();
      if (body.length > MAX_BODY_BYTES) return;
      responses.push({
        url: response.url(),
        status: response.status(),
        contentType,
        body: body.toString("utf8")
      });
    } catch (error) {
      failures.push({ url: response.url(), error: `body-read: ${error.message}` });
    }
  });

  let navigationError = null;
  try {
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(WAIT_MS);
  } catch (error) {
    navigationError = error.message;
  }

  const html = await page.content().catch(() => "");
  const result = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    targetUrl: TARGET_URL,
    finalUrl: page.url(),
    pageTitle: await page.title().catch(() => ""),
    clanTag: CLAN_TAG,
    clanTagFoundInHtml: html.toLowerCase().includes(CLAN_TAG.toLowerCase()),
    navigationError,
    html,
    responses,
    requestFailures: failures
  };

  const outputPath = path.join(OUTPUT_DIR, "clashflex-probe.json");
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");
  await page.screenshot({ path: path.join(OUTPUT_DIR, "clashflex-page.png"), fullPage: true }).catch(() => {});
  await browser.close();

  console.log(`Probe saved: ${outputPath}`);
  console.log(`Clan tag found in initial HTML: ${result.clanTagFoundInHtml}`);
  console.log(`Captured network responses: ${responses.length}`);
  if (navigationError) {
    console.error(`Navigation warning: ${navigationError}`);
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
