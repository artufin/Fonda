"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Ruta del video con fondo verde, ej. "/videos/esqueleto.mp4". */
  src: string;
  /** Cada cuántos milisegundos se dispara la animación. */
  intervalMs?: number;
  /** Cuán "verde" tiene que ser un pixel para volverse transparente (0-255). */
  umbralBajo?: number;
  umbralAlto?: number;
};

/**
 * Reproduce un video con croma verde superpuesto a toda la pantalla, quitando
 * el verde en tiempo real con un canvas (un <video> normal no puede ser
 * transparente). El video se dibuja ajustado por alto, centrado, recortando
 * los bordes izquierdo/derecho si no calzan con el aspecto de la pantalla.
 */
export function ChromaKeyOverlay({
  src,
  intervalMs = 10000,
  umbralBajo = 30,
  umbralAlto = 90,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Buffer del tamaño nativo del video: el recorte de color se calcula ahí
    // (pocos píxeles, barato) y luego se escala una sola vez al canvas visible.
    const buffer = document.createElement("canvas");
    const bufferCtx = buffer.getContext("2d", { willReadFrequently: true });
    if (!bufferCtx) return;

    let raf = 0;
    let dibujando = false;

    const ajustarTamano = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    ajustarTamano();
    window.addEventListener("resize", ajustarTamano);

    const dibujarCuadro = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (vw && vh) {
        if (buffer.width !== vw) buffer.width = vw;
        if (buffer.height !== vh) buffer.height = vh;

        bufferCtx.drawImage(video, 0, 0, vw, vh);
        const frame = bufferCtx.getImageData(0, 0, vw, vh);
        const data = frame.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const exceso = g - Math.max(r, b); // qué tan más verde que rojo/azul es
          let alpha: number;
          if (exceso <= umbralBajo) alpha = 255;
          else if (exceso >= umbralAlto) alpha = 0;
          else alpha = Math.round(255 * (1 - (exceso - umbralBajo) / (umbralAlto - umbralBajo)));
          data[i + 3] = alpha;
        }
        bufferCtx.putImageData(frame, 0, 0);

        const escala = canvas.height / vh;
        const anchoDestino = vw * escala;
        const x = (canvas.width - anchoDestino) / 2; // centra, deja que sobre y se recorte

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(buffer, 0, 0, vw, vh, x, 0, anchoDestino, canvas.height);
      }
      raf = requestAnimationFrame(dibujarCuadro);
    };

    const iniciarCiclo = () => {
      if (dibujando) return;
      dibujando = true;
      video.currentTime = 0;
      video.play().catch(() => {
        dibujando = false;
      });
    };

    const onPlay = () => {
      raf = requestAnimationFrame(dibujarCuadro);
    };

    const onEnded = () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dibujando = false;
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("ended", onEnded);

    iniciarCiclo();
    const intervalo = setInterval(iniciarCiclo, intervalMs);

    return () => {
      clearInterval(intervalo);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", ajustarTamano);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("ended", onEnded);
    };
  }, [intervalMs, umbralBajo, umbralAlto]);

  return (
    <>
      <video ref={videoRef} src={src} muted playsInline preload="auto" hidden />
      <canvas ref={canvasRef} className="chroma-overlay" />
    </>
  );
}
