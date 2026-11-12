// O PYTHON certo em qualquer sistema. O kit tem três ambientes Python próprios em
// node_modules/.cache/ (venv-whisper, venv-geo, venv-imagens); no Windows o executável fica em
// Scripts\python.exe, no Linux/macOS em bin/python. E o Python do sistema chama "python3" no
// Linux/macOS e "python" (ou "py") no Windows.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

export const WINDOWS = process.platform === "win32";

export const pastaDoVenv = (nome) => path.join("node_modules", ".cache", nome);

export const pythonDoVenv = (nome) => path.join(pastaDoVenv(nome), WINDOWS ? "Scripts\\python.exe" : "bin/python");

export const venvExiste = (nome) => existsSync(pythonDoVenv(nome));

// o primeiro que responder com Python 3.9+
export const pythonDoSistema = () => {
  for (const cmd of WINDOWS ? ["python", "py", "python3"] : ["python3", "python"]) {
    try {
      const v = execFileSync(cmd, ["-c", "import sys; print(sys.version_info[0] * 100 + sys.version_info[1])"], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
      if (Number(v) >= 309) return cmd;
    } catch {
      // não existe ou é a "loja" do Windows: tenta o próximo
    }
  }
  return null;
};
