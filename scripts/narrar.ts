// A NARRAÇÃO de um vídeo pela ElevenLabs (opcional: quem grava a própria voz não precisa disto).
// O texto e a voz estão no projeto.ts do vídeo; a chave, SÓ no .env (ELEVENLABS_API_KEY).
//
//   npm run narrar -- exemplo-vertical              gera as falas que ainda não existem
//   npm run narrar -- exemplo-vertical am-01 am-02  só essas
//   REFAZER=1 npm run narrar -- exemplo-vertical …  gera de novo (a anterior vai para bruto/anteriores/)
//   TRATAR=1 npm run narrar -- exemplo-vertical     só refaz o tratamento dos silêncios, sem API
//   VOZ_ID=… npm run narrar -- …                    testa outra voz sem mexer no código
import { narrarProjeto } from "./narracao/elevenlabs";

const [pasta, ...ids] = process.argv.slice(2);
if (!pasta) {
  console.error("uso: npm run narrar -- <pasta do vídeo em src/videos/> [ids das falas…]");
  process.exit(1);
}
const { PROJETO } = await import(`../src/videos/${pasta}/projeto.ts`);
await narrarProjeto(PROJETO, ids).catch((e) => {
  // a chave nunca aparece no erro
  const chave = process.env.ELEVENLABS_API_KEY;
  const msg = String(e?.message ?? e);
  console.error(chave ? msg.split(chave).join("***") : msg);
  process.exit(1);
});
