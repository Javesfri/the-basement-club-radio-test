"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react"; // <-- Agregamos useRef y useEffect

const PlayerContext = createContext();
const RADIO_STREAM_URL = "https://radio.basementclub.art/listen/basementclub/radio.mp3";
const GAIN_RANGE = 12; // Rango de ganancia de EQ en dB (-12 a +12)

export function PlayerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamSource, setStreamSource] = useState(null);
  // volumen 0–100 (lo que usa la UI)
  const [volume, setVolumeState] = useState(20);

  // ---------------------------------------------
  // AÑADIDO: ESTADOS Y REFERENCIAS PARA EQ
  // ---------------------------------------------
  const [bass, setBass] = useState(0); // -12 a 12
  const [mid, setMid] = useState(0);   // -12 a 12
  const [treble, setTreble] = useState(0); // -12 a 12

  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const bassFilterRef = useRef(null);
  const midFilterRef = useRef(null);
  const trebleFilterRef = useRef(null);
  const gainNodeRef = useRef(null); // Nodo de volumen dentro de la cadena WAAPI
  
  // ---------------------------------------------
  // AÑADIDO: INICIALIZACIÓN DE LA CADENA DE AUDIO
  // ---------------------------------------------
  const initAudioChain = (audioElement) => {
    if (!audioContextRef.current && audioElement) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      const ctx = audioContextRef.current;
      
      // 1. Creación de Nodos (Filtros y Ganancia)
      bassFilterRef.current = ctx.createBiquadFilter();
      bassFilterRef.current.type = "lowshelf";
      bassFilterRef.current.frequency.value = 200; 

      midFilterRef.current = ctx.createBiquadFilter();
      midFilterRef.current.type = "peaking";
      midFilterRef.current.frequency.value = 1000; 
      midFilterRef.current.Q.value = 1; 

      trebleFilterRef.current = ctx.createBiquadFilter();
      trebleFilterRef.current.type = "highshelf";
      trebleFilterRef.current.frequency.value = 3000; 

      gainNodeRef.current = ctx.createGain(); // Nodo de Volumen
      
      // 2. Conexión de la Cadena
      sourceNodeRef.current = ctx.createMediaElementSource(audioElement);
      
      // Source -> Bass -> Mid -> Treble -> Gain -> Destination
      sourceNodeRef.current.connect(bassFilterRef.current);
      bassFilterRef.current.connect(midFilterRef.current);
      midFilterRef.current.connect(trebleFilterRef.current);
      
      trebleFilterRef.current.connect(gainNodeRef.current); 
      gainNodeRef.current.connect(ctx.destination);

      // Inicializar GainNode con el volumen actual de la UI (0-100 mapeado a 0-1)
      gainNodeRef.current.gain.value = volume / 100;
      
      // 
    }
  };

  // ---------------------------------------------
  // AÑADIDO: EFECTO para SINCRONIZAR FILTROS Y GANANCIA
  // ---------------------------------------------
  useEffect(() => {
    // Sincronizar EQ
    if (bassFilterRef.current) bassFilterRef.current.gain.value = bass;
    if (midFilterRef.current) midFilterRef.current.gain.value = mid;
    if (trebleFilterRef.current) trebleFilterRef.current.gain.value = treble;
  }, [bass, mid, treble]);
  
  // Sincronizar volumen (al montar)
  useEffect(() => {
    if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = volume / 100;
    }
  }, [volume]);
  
  // ---------------------------------------------
  // LÓGICA ORIGINAL
  // ---------------------------------------------

  /* --------------------------
ABRIR / CERRAR EL PLAYER
--------------------------- */
const togglePlayer = () => {
if (!isOpen) {
setStreamSource(RADIO_STREAM_URL);
setTimeout(() => setIsOpen(true), 120); // delay al encender
setTimeout(() => setIsPlaying(true), 240); // delay al encender
} else {
setIsPlaying(false);
setTimeout(() => setStreamSource(null), 50);
setTimeout(() => setIsOpen(false), 120); // delay al apagar
}
};

/* --------------------------
PLAY / PAUSE
--------------------------- */
const togglePlay = () => {
if (!isPlaying) {
  // AÑADIDO: Reanudar el AudioContext si está suspendido
  if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
   audioContextRef.current.resume();
  }
 }
 setIsPlaying((prev) => !prev);
};

/* --------------------------
VOLUMEN (UI → 0–100)
AUDIO (interno → 0–1)
--------------------------- */
const setVolume = (value) => {
const safe = Math.max(0, Math.min(100, value));
setVolumeState(safe);

// AÑADIDO: Si el volumen se ajusta a 0, pausamos la reproducción
    
    // AÑADIDO: Actualizar el GainNode de la Web Audio API
    if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = safe / 100;
    }
};

// conversión útil para el componente Player.jsx (Ahora solo para retrocompatibilidad)
const volumeNormalized = volume / 100;

return (
<PlayerContext.Provider
value={{
isOpen,
togglePlayer,

isPlaying,
togglePlay,
streamSource,
volume, // 0–100 (UI)
setVolume, // setter protegido
volumeNormalized, // 0–1 (audio tag)
        
        // ---------------------------------------------
        // AÑADIDO: EXPOSICIÓN DE ESTADOS Y FUNCIONES DE EQ
        // ---------------------------------------------
        bass,
        setBass,
        mid,
        setMid,
        treble,
        setTreble,
        initAudioChain, // Función para iniciar la cadena
        GAIN_RANGE, // Rango de ganancia para los knobs
}}
>
{children}
</PlayerContext.Provider>
);
}

export function usePlayer() {
return useContext(PlayerContext);
}