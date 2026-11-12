// Baixa um arquivo do CDN do TSE (cdn.tse.jus.br) de dentro de um Chrome headless.
//
//   node scripts/tse-baixar.mjs <url> <destino>
//
// O CDN do TSE (Akamai) recusa curl/urllib e o "HeadlessChrome" com 403; um Chrome com
// user-agent comum passa. O arquivo é pedido de dentro da página, na mesma origem, em
// pedaços de 16 MB (Range) — o zip do eleitorado tem ~400 MB.
import { spawn } from "node:child_process";
import fs from "node:fs";
const [url, out] = process.argv.slice(2);
const ch = spawn("google-chrome", ["--headless=new", "--disable-gpu", "--no-sandbox", "--remote-debugging-port=9334",
  "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36", "about:blank"], { stdio: "ignore" });
try {
  await new Promise((r) => setTimeout(r, 2500));
  const tabs = await (await fetch("http://127.0.0.1:9334/json")).json();
  const ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
  let id = 0;
  const pend = {};
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) pend[m.id](m); };
  await new Promise((r) => (ws.onopen = r));
  await send("Page.enable");
  await send("Page.navigate", { url: new URL(url).origin + "/estatistica/" });
  await new Promise((r) => setTimeout(r, 5000));
  const fd = fs.openSync(out, "w");
  const CH = 16 * 1024 * 1024;
  for (let ini = 0; ; ini += CH) {
    const v = (await send("Runtime.evaluate", { awaitPromise: true, returnByValue: true,
      expression: `(async()=>{const r=await fetch(${JSON.stringify(url)},{headers:{Range:'bytes=${ini}-${ini + CH - 1}'}});if(r.status!==206&&r.status!==200)return 'ERR'+r.status;const b=new Uint8Array(await r.arrayBuffer());let s='';for(let i=0;i<b.length;i+=32768)s+=String.fromCharCode(...b.subarray(i,i+32768));return btoa(s)})()` })).result.result.value;
    if (typeof v !== "string" || v.startsWith("ERR")) { console.log("parou", ini, v); break; }
    const buf = Buffer.from(v, "base64");
    fs.writeSync(fd, buf);
    if (buf.length < CH) break;
  }
  fs.closeSync(fd);
} finally {
  ch.kill();
}
process.exit(0);
