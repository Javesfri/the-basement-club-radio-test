"use client";

import { useRef, useEffect, useState } from "react";
import { usePlayer } from "./PlayerContext";

export default function PlayerKnob() {
  const { setVolume, volume } = usePlayer();

  const knobRef = useRef(null);
  const rafRef = useRef(null);
  
  // Referencias para la lógica de arrastre "Delta"
  const dragging = useRef(false);
  const lastPointerAngle = useRef(0); // Guardamos el ángulo anterior del mouse
  const displayAngle = useRef(0);     // Ángulo acumulado de la perilla

  // ----------------------------------------------------
  // CONFIGURACIÓN
  // ----------------------------------------------------
  const VISUAL_OFFSET = 0; // <--- AJUSTA ESTO SI ES NECESARIO (EJ: 5, -3, etc.)
  // 1. Rango de giro (300 grados total)
  const MIN_ANGLE = -150;
  const MAX_ANGLE = 150;
  const ANGLE_RANGE = MAX_ANGLE - MIN_ANGLE;

  // 2. Sensibilidad (0.6 es ideal para precisión y rapidez)
  const SENSITIVITY = 1; 

  // 3. Zona de "Imán" (Snap) para asegurar llegar a 0 y 100
  const SNAP_THRESHOLD = 3; // Si el volumen es < 3, baja a 0.

  // ----------------------------------------------------
  // CONVERSIONES
  // ----------------------------------------------------
  const angleToVolume = (angle) => {
    // Normalizar de 0 a 1
    let n = (angle - MIN_ANGLE) / ANGLE_RANGE;
    let vol = Math.round(n * 100);

    // Lógica de SNAP (Imán)
    if (vol <= SNAP_THRESHOLD) vol = 0;
    if (vol >= (100 - SNAP_THRESHOLD)) vol = 100;

    return Math.max(0, Math.min(100, vol));
  };

  const volumeToAngle = (v) => {
    return MIN_ANGLE + (v / 100) * ANGLE_RANGE;
  };

  // Estado visual
  const [rotation, setRotation] = useState(volumeToAngle(volume));

  // ----------------------------------------------------
  // SINCRONIZACIÓN EXTERNA (Cuando cambia el volumen por contexto)
  // ----------------------------------------------------
  useEffect(() => {
    if (!dragging.current) {
      const ang = volumeToAngle(volume);
      setRotation(ang);
      displayAngle.current = ang;
    }
  }, [volume]);

  // ----------------------------------------------------
  // CÁLCULO DEL ÁNGULO DEL PUNTERO
  // ----------------------------------------------------
  const getPointerAngle = (e) => {
    const r = knobRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    
    // Atan2 devuelve radianes de -PI a PI
    let deg = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Ajustar para que el 0 esté arriba (reloj 12:00)
    deg -= 90; 
    
    return deg;
  };

  // ----------------------------------------------------
  // LOGICA DEL ARRASTRE (DELTA)
  // ----------------------------------------------------
  const onPointerDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    
    // Al iniciar, solo guardamos la posición actual del mouse.
    // No calculamos offset, trabajaremos con DIFERENCIAS.
    lastPointerAngle.current = getPointerAngle(e);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;

    // 1. Obtener ángulo actual del mouse
    const currentPointerAngle = getPointerAngle(e);

    // 2. Calcular DELTA (Diferencia desde el último frame)
    let delta = currentPointerAngle - lastPointerAngle.current;

    // CORRECCIÓN DE CRUCE DE EJES (El salto de 180 a -180)
    // Si la diferencia es abrupta (ej: 350 grados), es que cruzamos el eje.
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    // 3. Aplicar el cambio a nuestro ángulo acumulado con sensibilidad
    displayAngle.current += delta * SENSITIVITY;

    // 4. Actualizar la referencia del mouse para el siguiente frame
    lastPointerAngle.current = currentPointerAngle;

    // 5. Limitar ángulo (Clamp)
    // Usamos una variable temporal para no "atascar" la referencia displayAngle
    // si el usuario sigue arrastrando hacia afuera (para poder volver fácil).
    let limitedAngle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, displayAngle.current));
    
    // Si nos pasamos de los límites, corregimos suavemente la referencia
    // para que no se sienta "despegado" si vuelve hacia atrás.
    if (displayAngle.current > MAX_ANGLE) displayAngle.current = MAX_ANGLE;
    if (displayAngle.current < MIN_ANGLE) displayAngle.current = MIN_ANGLE;

    // 6. Renderizar
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        
        setRotation(limitedAngle);

        const newVol = angleToVolume(limitedAngle);
        // Solo actualizamos contexto si cambió el valor entero
        if (newVol !== volume) {
          setVolume(newVol);
        }
      });
    }
  };

  const onPointerUp = () => {
    dragging.current = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  // ----------------------------------------------------
  // SCROLL (WHEEL)
  // ----------------------------------------------------
  const onWheel = (e) => {
    e.preventDefault();
    const step = 2; // Paso fino
    const delta = -Math.sign(e.deltaY) * step;
    
    let newVol = Math.max(0, Math.min(100, volume + delta));
    setVolume(newVol);

    // Sincronizar rotación visual e interna
    const visibleAngle = volumeToAngle(newVol);
    setRotation(visibleAngle);
    displayAngle.current = visibleAngle;
  };

  useEffect(() => {
    const el = knobRef.current;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [volume]);

  return (
    <div
      ref={knobRef}
      className="knob-wrapper"
      onPointerDown={onPointerDown}
      style={{
        userSelect: "none",
        touchAction: "none",
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <div className="knob-title"><span>VOLUMEN</span></div>

      {/* IMAGEN DE LA PERILLA */}
      <img
        src="/perilla6.png"
        className="knob-image"
        style={{ 
          transform: `scale(0.85) rotate(${rotation+VISUAL_OFFSET}deg)`,
          // AQUÍ ESTÁ LA MAGIA DEL "SMOOTH / DELAY"
          // Una transición rápida (0.1s) suaviza los saltos de frames del mouse
          // dándole peso a la perilla.
          transition: dragging.current ? 'transform 0.1s cubic-bezier(0.2, 0, 0, 1)' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        draggable={false}
        alt="Knob"
      />

      <div className="knob-display-volumen">
        <span>{volume}</span>
      </div>
    </div>
  );
}
