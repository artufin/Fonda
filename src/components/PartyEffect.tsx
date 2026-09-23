"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Video con fondo verde a recortar en vivo. Opcional: se puede usar solo `sound`. */
  video?: string;
  /** Sonido a reproducir junto con el video (o solo, si no se pasa `video`). */
  sound?: string;
  /** Cada cuántos milisegundos se dispara el efecto. */
  intervalMs?: number;
  /** Cuán "verde" tiene que ser un pixel para volverse transparente (0-255). */
  umbralBajo?: number;
  umbralAlto?: number;
};

/**
 * Efecto de fiesta que se repite cada cierto tiempo: un video con croma verde
 * (recortado en vivo con canvas, ajustado por alto y centrado), un sonido, o
 * ambos sincronizados. Para agregar otro efecto basta con pegar el archivo
 * nuevo en /public y renderizar otra instancia de este componente con su
 * propio video/sonido/intervalo.
 */
export function PartyEffect({
  video,
  sound,
  intervalMs = 10000,
  umbralBajo = 30,
  umbralAlto = 90,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const videoEl = video ? videoRef.current : null;
    const canvas = video ? canvasRef.current : null;
    const audio = sound ? new Audio(sound) : null;
    if (audio) audio.preload = "auto";

    let ctx: CanvasRenderingContext2D | null = null;
    let buffer: HTMLCanvasElement | null = null;
    let bufferCtx: CanvasRenderingContext2D | null = null;
    let raf = 0;

    const ajustarTamano = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    if (videoEl && canvas) {
      ctx = canvas.getContext("2d");
      buffer = document.createElement("canvas");
      bufferCtx = buffer.getContext("2d", { willReadFrequently: true });
      ajustarTamano();
      window.addEventListener("resize", ajustarTamano);
    }

    const dibujarCuadro = () => {
      if (videoEl && canvas && ctx && buffer && bufferCtx) {
        const vw = videoEl.videoWidth;
        const vh = videoEl.videoHeight;
        if (vw && vh) {
          if (buffer.width !== vw) buffer.width = vw;
          if (buffer.height !== vh) buffer.height = vh;

          bufferCtx.drawImage(videoEl, 0, 0, vw, vh);
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
      }
      raf = requestAnimationFrame(dibujarCuadro);
    };

    const onPlay = () => {
      raf = requestAnimationFrame(dibujarCuadro);
    };
    const onEnded = () => {
      cancelAnimationFrame(raf);
      ctx?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
    };

    videoEl?.addEventListener("play", onPlay);
    videoEl?.addEventListener("ended", onEnded);

    const disparar = () => {
      if (videoEl) {
        videoEl.currentTime = 0;
        videoEl.play().catch(() => {});
      }
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    disparar();
    const intervalo = setInterval(disparar, intervalMs);

    return () => {
      clearInterval(intervalo);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", ajustarTamano);
      videoEl?.removeEventListener("play", onPlay);
      videoEl?.removeEventListener("ended", onEnded);
      audio?.pause();
    };
  }, [video, sound, intervalMs, umbralBajo, umbralAlto]);

  if (!video) return null;

  return (
    <>
      <video ref={videoRef} src={video} muted playsInline preload="auto" hidden />
      <canvas ref={canvasRef} className="chroma-overlay" />
    </>
  );
}
