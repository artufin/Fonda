"use client";

import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";

type Status = "starting" | "scanning" | "denied" | "unsupported" | "error";

type Props = {
  /** Se llama con el texto del QR. Devuelve true si fue válido (detiene la cámara). */
  onResult: (text: string) => boolean;
};

const MAX_WIDTH = 480; // Reducimos la imagen para que decodificar sea rápido en celulares.
const DECODE_EVERY_MS = 120;

export function QrScanner({ onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const [status, setStatus] = useState<Status>("starting");

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    let stream: MediaStream | null = null;
    let raf = 0;
    let lastDecode = 0;
    let stopped = false;

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };

    const tick = (now: number) => {
      if (stopped) return;
      raf = requestAnimationFrame(tick);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) return;
      if (now - lastDecode < DECODE_EVERY_MS) return;
      lastDecode = now;

      const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
      const w = Math.round(video.videoWidth * scale);
      const h = Math.round(video.videoHeight * scale);
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);
      const img = ctx.getImageData(0, 0, w, h);
      const code = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });

      if (code?.data && onResultRef.current(code.data)) {
        stop();
      }
    };

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      .then(async (s) => {
        if (stopped) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = s;
        await video.play();
        setStatus("scanning");
        raf = requestAnimationFrame(tick);
      })
      .catch((err: unknown) => {
        const name = err instanceof Error ? err.name : "";
        setStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error");
      });

    return stop;
  }, []);

  return (
    <div className="scanner">
      <video ref={videoRef} className="scanner__video" playsInline muted autoPlay />
      <canvas ref={canvasRef} hidden />
      {status === "scanning" && <div className="scanner__marco" aria-hidden />}
      {status === "starting" && <div className="scanner__aviso">Abriendo la cámara...</div>}
      {status === "denied" && (
        <div className="scanner__aviso">
          Sin permiso para usar la cámara. Actívalo en la configuración del navegador y recarga.
        </div>
      )}
      {status === "unsupported" && (
        <div className="scanner__aviso">Este navegador no permite usar la cámara desde la web.</div>
      )}
      {status === "error" && (
        <div className="scanner__aviso">No se pudo abrir la cámara. Prueba recargando la página.</div>
      )}
    </div>
  );
}
