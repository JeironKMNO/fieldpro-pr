"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@fieldpro/ui/components/button";

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    maxAlternatives: number;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition: new () => SpeechRecognitionInstance;
    }
}

interface VoiceRecorderProps {
    onTranscription: (text: string) => void;
    disabled?: boolean;
}

export function VoiceRecorder({ onTranscription, disabled }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const stoppedRef = useRef(false);
    const sentRef = useRef(false);
    const transcriptRef = useRef("");
    const startTimeRef = useRef<number>(0);
    const isStartingRef = useRef(false);

    const drawWaveform = useCallback(() => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = "hsl(142, 76%, 36%)";
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        animFrameRef.current = requestAnimationFrame(drawWaveform);
    }, []);

    const startRecording = async () => {
        // Prevent double-start
        if (isStartingRef.current || isRecording || isProcessing) {
            console.log("[Voice] Start blocked: already recording or processing");
            return;
        }

        isStartingRef.current = true;
        setErrorMessage(null);

        try {
            // Start audio stream for waveform visualization
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
            streamRef.current = stream;

            // Setup audio analyser for waveform visualization
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            // Setup Web Speech API for real-time transcription
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
                stream.getTracks().forEach((track) => track.stop());
                audioContext.close();
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.lang = "es-PR"; // Spanish - Puerto Rico
            recognition.interimResults = true;
            recognition.continuous = true;
            recognition.maxAlternatives = 1;

            let finalTranscript = "";

            recognition.onresult = (event) => {
                let interim = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript + " ";
                    } else {
                        interim += result[0].transcript;
                    }
                }
                const current = finalTranscript + interim;
                transcriptRef.current = current;
                setTranscript(current);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                
                // Handle specific errors with user-friendly messages
                switch (event.error) {
                    case "not-allowed":
                        setErrorMessage("Permiso de micrófono denegado. Verifica la configuración de tu navegador.");
                        stopRecording();
                        return;
                    case "no-speech":
                        // Don't stop, just let user keep trying
                        setErrorMessage("No detectamos voz. Intenta hablar más fuerte...");
                        setTimeout(() => setErrorMessage(null), 3000);
                        break;
                    case "network":
                        setErrorMessage("Problema de conexión. Verifica tu internet.");
                        stopRecording();
                        return;
                    case "aborted":
                        // User stopped intentionally, ignore
                        break;
                    default:
                        // Try to restart on other non-fatal errors only if still recording
                        if (!stoppedRef.current && event.error !== "aborted") {
                            try {
                                recognition.stop();
                                setTimeout(() => {
                                    if (!stoppedRef.current) {
                                        recognition.start();
                                    }
                                }, 100);
                            } catch { /* ignore */ }
                        }
                }
            };

            recognition.onend = () => {
                // Only auto-restart if still actively recording (not stopped by user)
                if (!stoppedRef.current) {
                    try {
                        recognition.start();
                    } catch { /* ignore */ }
                }
            };

            recognitionRef.current = recognition;
            recognition.start();

            setIsRecording(true);
            setDuration(0);
            setTranscript("");
            transcriptRef.current = "";
            stoppedRef.current = false;
            sentRef.current = false;
            startTimeRef.current = Date.now();

            // Start duration timer
            timerRef.current = setInterval(() => {
                setDuration((d) => d + 1);
            }, 1000);

            // Start waveform animation
            drawWaveform();
        } catch (error) {
            console.error("Error accessing microphone:", error);
            const errorMsg = error instanceof Error 
                ? (error.name === "NotAllowedError" 
                    ? "Permiso de micrófono denegado. Haz clic en el ícono 🔒 en la barra de direcciones para permitir."
                    : "No se pudo acceder al micrófono. Verifica que esté conectado.")
                : "Error al acceder al micrófono. Intenta de nuevo.";
            
            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            isStartingRef.current = false;
        }
    };

    const stopRecording = () => {
        // Guard: prevent re-entry or stopping when not recording
        if (stoppedRef.current || !isRecording) {
            console.log("[Voice] Stop blocked: already stopped or not recording");
            return;
        }
        
        // Minimum recording time check (500ms) to prevent accidental stops
        const recordingDuration = Date.now() - startTimeRef.current;
        if (recordingDuration < 500) {
            console.log("[Voice] Stop blocked: recording too short");
            return;
        }

        stoppedRef.current = true;
        setIsProcessing(true);
        setErrorMessage(null);

        // Stop speech recognition
        if (recognitionRef.current) {
            recognitionRef.current.onend = null; // Prevent restart
            recognitionRef.current.onresult = null; // Prevent late results
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        // Stop audio stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // Stop animation
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }

        // Stop timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setIsRecording(false);

        // Small delay to collect final transcript, then send ONCE
        setTimeout(() => {
            if (sentRef.current) {
                console.log("[Voice] Send blocked: already sent");
                return;
            }
            sentRef.current = true;
            const finalText = transcriptRef.current.trim();
            const finalDuration = Date.now() - startTimeRef.current;
            
            setTranscript("");
            setIsProcessing(false);
            
            // Validate minimum content
            if (!finalText) {
                setErrorMessage("No se detectó voz. Intenta hablar más fuerte o acércate al micrófono.");
                setTimeout(() => setErrorMessage(null), 4000);
            } else if (finalText.length < 3) {
                setErrorMessage("Mensaje muy corto. Intenta describir más detalles.");
                setTimeout(() => setErrorMessage(null), 4000);
            } else {
                console.log(`[Voice] Sending transcription (${finalDuration}ms): "${finalText.substring(0, 50)}..."`);
                onTranscription(finalText);
            }
        }, 500);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    if (isProcessing) {
        return (
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Procesando...</span>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div 
                className="flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-1.5 animate-in fade-in shadow-sm max-w-[280px]"
                title={errorMessage}
            >
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-600 dark:text-red-400 truncate">
                    {errorMessage}
                </span>
                <button 
                    onClick={() => setErrorMessage(null)}
                    className="ml-1 text-red-400 hover:text-red-600 flex-shrink-0"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>
        );
    }

    if (isRecording) {
        return (
            <div className="flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-1.5 animate-in fade-in shadow-lg">
                {/* Recording indicator */}
                <div className="relative flex items-center justify-center h-3 w-3">
                    <div className="absolute h-full w-full rounded-full bg-red-500 animate-ping opacity-75" />
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                </div>
                
                {/* Waveform - smaller */}
                <canvas
                    ref={canvasRef}
                    width={80}
                    height={24}
                    className="opacity-80 hidden sm:block"
                />
                
                {/* Duration */}
                <span className="text-sm font-mono text-red-600 dark:text-red-400 min-w-[40px]">
                    {formatDuration(duration)}
                </span>
                
                {/* Transcript preview - hidden on small screens */}
                {transcript && (
                    <span className="hidden md:block text-xs text-muted-foreground max-w-[100px] truncate italic" title={transcript}>
                        &quot;{transcript}&quot;
                    </span>
                )}
                
                {/* Stop button - more prominent */}
                <Button
                    type="button"
                    size="sm"
                    className="h-7 px-2 rounded-full bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm"
                    onClick={stopRecording}
                >
                    <Square className="h-3 w-3 fill-current mr-1" />
                    <span className="text-xs">Detener</span>
                </Button>
            </div>
        );
    }

    return (
        <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            onClick={startRecording}
            disabled={disabled}
            title="Grabar mensaje de voz"
        >
            <Mic className="h-5 w-5" />
        </Button>
    );
}
