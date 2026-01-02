"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "../components/PlayerContext";
import PlayerDisplay from "@/components/PlayerDisplay";
// import PlayerKnob from "./PlayerKnob"; // <-- YA NO LO USAMOS, LO REEMPLAZA UNIVERSAL KNOB
import UniversalKnob from "./UniversalKnob"; // <-- IMPORTAMOS EL COMPONENTE REUTILIZABLE

export default function Player() {
  // 1. CORRECCIÓN CLAVE: Extraer todas las variables y funciones necesarias
  const {
    isOpen,
    isPlaying,
    togglePlay,
    streamSource,
    initAudioChain, // Necesario para conectar el EQ
    GAIN_RANGE = 12, // Rango de ganancia (dB)
    volume,
    setVolume,
    bass,
    setBass,
    mid,
    setMid,
    treble,
    setTreble,
    // Eliminamos 'volumeNormalized' ya que el volumen se gestiona por GainNode/setVolume
  } = usePlayer();

  // referencia al <audio>
  const audioRef = useRef(null);
  // ---------------------------------------------
  // NUEVA FUNCIÓN: RESTAURAR EQ
  // ---------------------------------------------
  const resetEQ = () => {
    setBass(0);
    setMid(0);
    setTreble(0);
  };
  /* --------------------------
     A. CONECTAR WEB AUDIO API (EQ)
     Este efecto es CRÍTICO. Conecta el elemento <audio> a la cadena de filtros.
  --------------------------- */
  useEffect(() => {
    // Inicializamos la cadena de audio (EQ) cuando el componente se monta.
    if (audioRef.current) {
      initAudioChain(audioRef.current);
    }
  }, [initAudioChain]);

  /* --------------------------
     B. SYNC PLAY / PAUSE (Se mantiene la lógica original)
     Nota: El volumen se maneja ahora con el GainNode.
  --------------------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (streamSource) {
      if (isPlaying) {
        audio.play().catch(() => {
          // algunos navegadores bloquean autoplay → ignoramos
        });
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, streamSource]);

  /* --------------------------
     C. SYNC VOLUME NATIVO ELIMINADO
     Esta lógica es obsoleta. El volumen ahora se controla mediante el GainNode 
     en el PlayerContext cada vez que se llama a setVolume.
  --------------------------- */
  /*
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volumeNormalized;
    }
  }, [volumeNormalized]);
  */

  return (
    <div className={`player-container ${isOpen ? "open" : ""}`}>
      <div className="logo-player-container">
        <img
          className="logo-player"
          src="/logo-player.png"
          alt="logo-player.png"
        />
      </div>

      {/* STREAMING RADIO - CRÍTICO: Agregar crossOrigin="anonymous" */}
      <audio
        ref={audioRef}
        src={streamSource || undefined}
        preload="none"
        crossOrigin="anonymous" // Necesario para que Web Audio API acceda al stream
      />

      <div className="vintage-player">
        {/* PLAY / PAUSE BUTTON */}
        <button className="play-pause-btn" onClick={togglePlay}>
          {isPlaying ? "❚❚" : "►"}
        </button>

        {/* DISPLAY */}
        <PlayerDisplay />

        {/* 2. PERILLA DE VOLUMEN (Ahora usa UniversalKnob para la física) */}
        <UniversalKnob
          title="VOLUME"
          value={volume}
          setValue={setVolume} // Usamos setValue para seguir la convención del UniversalKnob
          minVolume={0}
          maxVolume={100}
          size={85} // Tamaño grande
          showDisplay={true}
        />
      </div>
      {/* 3. SECCIÓN DE EQ: Graves, Medios, Agudos */}
      <div className="eq-section" style={{ display: "flex", gap: "15px" }}>
        <UniversalKnob
          title="BASS"
          value={bass}
          setValue={setBass}
          minVolume={-GAIN_RANGE}
          maxVolume={GAIN_RANGE} // -12dB a +12dB
          size={60} // Tamaño chico
          showDisplay={false} // No mostrar el número
        />
        <UniversalKnob
          title="MID"
          value={mid}
          setValue={setMid}
          minVolume={-GAIN_RANGE}
          maxVolume={GAIN_RANGE}
          size={60}
          showDisplay={false}
        />
        <UniversalKnob
          title="TREBLE"
          value={treble}
          setValue={setTreble}
          minVolume={-GAIN_RANGE}
          maxVolume={GAIN_RANGE}
          size={60}
          showDisplay={false}
        />
        <button onClick={resetEQ} className="button-reset">
          RESET
        </button>
      </div>
    </div>
  );
}
