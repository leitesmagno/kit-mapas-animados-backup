// ---------------------------------------------------------------------------
// Um ícone de DUNA no acabamento dos ícones 3D (Fluent): não existe emoji de duna de areia (o
// "deserto" tem cacto, que é sertão). Duas dunas em camadas, a da frente com a crista acesa
// pelo sol e a sombra do lado oposto — desenhado em SVG, escala sem perder nitidez.
// ---------------------------------------------------------------------------
export const IconeDuna: React.FC<{ tamanho?: number }> = ({ tamanho = 100 }) => (
  <svg viewBox="-2 30 104 68" width={tamanho} height={tamanho} style={{ overflow: "visible", filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.4))" }}>
    <defs>
      <linearGradient id="dunaFundo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFE3A3" />
        <stop offset="100%" stopColor="#E9A84E" />
      </linearGradient>
      <linearGradient id="dunaFrente" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFD27A" />
        <stop offset="55%" stopColor="#F2A43A" />
        <stop offset="100%" stopColor="#C8741F" />
      </linearGradient>
      <linearGradient id="dunaSombra" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#A85A17" stopOpacity={0.75} />
        <stop offset="100%" stopColor="#A85A17" stopOpacity={0} />
      </linearGradient>
    </defs>
    {/* a duna do fundo */}
    <path d="M6 70 C 22 44, 40 36, 58 50 C 70 58, 82 56, 96 62 L 96 84 L 6 84 Z" fill="url(#dunaFundo)" />
    {/* a duna da frente, com a crista */}
    <path d="M2 86 C 18 60, 36 44, 52 46 C 66 48, 78 64, 98 74 L 98 92 C 70 96, 30 96, 2 92 Z" fill="url(#dunaFrente)" />
    {/* a face à sombra (depois da crista) */}
    <path d="M52 46 C 66 48, 78 64, 98 74 L 98 92 C 84 93, 70 94, 60 94 C 62 76, 58 58, 52 46 Z" fill="url(#dunaSombra)" />
    {/* a crista iluminada */}
    <path d="M10 80 C 22 62, 36 49, 52 46" fill="none" stroke="#FFF4D6" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
    {/* marcas do vento */}
    <path d="M20 88 C 30 84, 40 84, 48 86 M 30 92 C 38 89, 46 89, 54 91" fill="none" stroke="#B86A1E" strokeWidth={1.6} strokeLinecap="round" opacity={0.55} />
  </svg>
);
