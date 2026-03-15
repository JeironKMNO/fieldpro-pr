"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Loader2, AlertCircle, X } from "lucide-react";

interface VoiceRecorderWhisperProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceRecorderWhisper({
  onTranscription,
  disabled,
}: VoiceRecorderWhisperProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const mimeTypeRef = useRef<string>("audio/webm");

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(220 38 38)"; // red-600
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const stopStreams = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    if (isRecording || isProcessing) return;
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Waveform setup
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Detect best supported mime type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "audio/ogg";
      mimeTypeRef.current = mimeType;

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stopStreams();
        setIsRecording(false);
        setIsProcessing(true);

        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        chunksRef.current = [];

        // Derive extension
        const ext = mimeTypeRef.current.includes("mp4")
          ? "mp4"
          : mimeTypeRef.current.includes("ogg")
            ? "ogg"
            : "webm";

        const file = new File([blob], `audio.${ext}`, {
          type: mimeTypeRef.current,
        });

        if (blob.size < 1000) {
          setErrorMessage("Grabación muy corta. Intenta hablar más fuerte.");
          setTimeout(() => setErrorMessage(null), 4000);
          setIsProcessing(false);
          return;
        }

        try {
          const formData = new FormData();
          formData.append("audio", file);

          const res = await fetch("/api/ai/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const data = (await res.json()) as { text?: string; error?: string };

          if (!data.text?.trim()) {
            setErrorMessage("No se detectó voz. Intenta de nuevo.");
            setTimeout(() => setErrorMessage(null), 4000);
          } else {
            onTranscription(data.text.trim());
          }
        } catch {
          setErrorMessage("Error al transcribir. Verifica tu conexión.");
          setTimeout(() => setErrorMessage(null), 5000);
        } finally {
          setIsProcessing(false);
          setDuration(0);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250); // collect chunks every 250ms

      setIsRecording(true);
      setDuration(0);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      drawWaveform();
    } catch (err) {
      const msg =
        err instanceof Error && err.name === "NotAllowedError"
          ? "Permiso de micrófono denegado. Permite el acceso en la barra de direcciones."
          : "No se pudo acceder al micrófono.";
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const stopRecording = () => {
    const elapsed = Date.now() - startTimeRef.current;
    if (elapsed < 500) return; // guard accidental stops

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => {
    return () => {
      stopStreams();
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopStreams]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  };

  // — Processing state —
  if (isProcessing) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs text-teal-700">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Transcribiendo...</span>
      </div>
    );
  }

  // — Error state —
  if (errorMessage) {
    return (
      <div className="flex max-w-[220px] items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs text-red-600">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{errorMessage}</span>
        <button onClick={() => setErrorMessage(null)} className="shrink-0">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  // — Recording state —
  if (isRecording) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1">
        {/* Pulsing dot */}
        <div className="relative flex h-3 w-3 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
        </div>

        {/* Waveform */}
        <canvas
          ref={canvasRef}
          width={72}
          height={22}
          className="hidden sm:block opacity-80"
        />

        {/* Timer */}
        <span className="min-w-[36px] font-mono text-xs text-red-600">
          {formatDuration(duration)}
        </span>

        {/* Stop button */}
        <button
          onClick={stopRecording}
          className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-red-600"
        >
          <Square className="h-2.5 w-2.5 fill-current" />
          Detener
        </button>
      </div>
    );
  }

  // — Idle state —
  return (
    <button
      type="button"
      onClick={() => void startRecording()}
      disabled={disabled}
      title="Grabar mensaje de voz (Whisper AI)"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-teal-50 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Mic className="h-4 w-4" />
    </button>
  );
}
