import { Config } from "@remotion/cli/config";

// O vídeo é desenhado direto em 1080×1920 (sem escala): o que se vê no Studio é o que sai.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(18);
