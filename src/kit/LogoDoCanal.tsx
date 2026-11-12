import { Img, staticFile } from "remotion";
import { useFormato } from "../motor/formato";

// ---------------------------------------------------------------------------
// O SELO DO CANAL — a logo redonda, pequena, transparente e fixa no canto de BAIXO à direita (como
// a marca d'água do YouTube): a identidade dos vídeos HORIZONTAIS (no lugar da marca d'água de
// texto, que é só dos verticais). A logo vem do marca.json ("logoRedonda", PNG com fundo
// transparente em public/marca/); o tamanho e a posição vêm do perfil de formato
// (motor/formato.ts → `logo`). Sem logo configurada, ou no vertical, a peça não desenha nada.
// Fica na tela do PRIMEIRO ao último quadro, sem fade de entrada.
//
//   <LogoDoCanal />   — por último no index, por cima de tudo
// ---------------------------------------------------------------------------

export const LogoDoCanal: React.FC<{ opacidade?: number }> = ({ opacidade }) => {
  const { logo } = useFormato();
  if (!logo) return null;
  const d = logo.diametro;
  return (
    <Img
      src={staticFile(logo.src)}
      style={{
        position: "absolute",
        left: logo.x - d / 2,
        top: logo.y - d / 2,
        width: d,
        height: d,
        opacity: opacidade ?? logo.opacidade,
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.45))",
        pointerEvents: "none",
      }}
    />
  );
};
