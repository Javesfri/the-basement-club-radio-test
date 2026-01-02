"use client";

import { useRef, useEffect, useState } from "react";

// Este componente es totalmente independiente y no usa usePlayer()
// En su lugar, recibe el valor y el setter como props.
export default function UniversalKnob({
  value,
  setValue,
  minVolume = 0,
  maxVolume = 100,
  size = 150,
  title = "VOLUME",
  SENSITIVITY = 1,
  MIN_ANGLE = -150,
  MAX_ANGLE = 150,
  SNAP_THRESHOLD = 3,
  showDisplay = true, // Control para mostrar/ocultar el display numérico
}) {
  const knobRef = useRef(null);
  const rafRef = useRef(null);

  // Referencias para la lógica de arrastre "Delta"
  const dragging = useRef(false);
  const lastPointerAngle = useRef(0);
  const displayAngle = useRef(0);

  const ANGLE_RANGE = MAX_ANGLE - MIN_ANGLE;
  const VISUAL_OFFSET = 90;
  // ----------------------------------------------------
  // CONVERSIONES
  // ----------------------------------------------------
  const angleToValue = (angle) => {
    // Normalizar el ángulo al rango 0 a 1
    let n = (angle - MIN_ANGLE) / ANGLE_RANGE;

    // Mapear de 0-1 al rango personalizado (minVolume a maxVolume)
    let result = minVolume + n * (maxVolume - minVolume);

    // Redondear a números enteros si el rango es grande (Volumen), o dejar decimales si es necesario (EQ)
    let finalValue =
      maxVolume - minVolume >= 100
        ? Math.round(result)
        : parseFloat(result.toFixed(1));

    // Lógica de SNAP (Imán)
    if (
      finalValue <=
      minVolume + (maxVolume - minVolume) * (SNAP_THRESHOLD / 100)
    )
      finalValue = minVolume;
    if (
      finalValue >=
      maxVolume - (maxVolume - minVolume) * (SNAP_THRESHOLD / 100)
    )
      finalValue = maxVolume;

    return Math.max(minVolume, Math.min(maxVolume, finalValue));
  };

  const valueToAngle = (v) => {
    // Normalizar el valor al rango 0-1
    let n = (v - minVolume) / (maxVolume - minVolume);
    return MIN_ANGLE + n * ANGLE_RANGE;
  };

  // Estado visual
  const [rotation, setRotation] = useState(valueToAngle(value));

  // ----------------------------------------------------
  // SINCRONIZACIÓN EXTERNA (Cuando cambia el valor por contexto)
  // ----------------------------------------------------
  useEffect(() => {
    if (!dragging.current) {
      const ang = valueToAngle(value);
      setRotation(ang);
      displayAngle.current = ang;
    }
  }, [value, MIN_ANGLE, MAX_ANGLE, minVolume, maxVolume]);

  // ----------------------------------------------------
  // CÁLCULO DEL ÁNGULO DEL PUNTERO (No cambia)
  // ----------------------------------------------------
  const getPointerAngle = (e) => {
    const r = knobRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    let deg = Math.atan2(dy, dx) * (180 / Math.PI);
    deg -= 90;
    return deg;
  };

  // ----------------------------------------------------
  // LOGICA DEL ARRASTRE (DELTA) (Copia exacta con props)
  // ----------------------------------------------------
  const onPointerDown = (e) => {
    e.preventDefault();
    dragging.current = true;

    lastPointerAngle.current = getPointerAngle(e);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;

    const currentPointerAngle = getPointerAngle(e);
    let delta = currentPointerAngle - lastPointerAngle.current;

    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    displayAngle.current += delta * SENSITIVITY;
    lastPointerAngle.current = currentPointerAngle;

    // Limitar ángulo (Clamp)
    let limitedAngle = Math.max(
      MIN_ANGLE,
      Math.min(MAX_ANGLE, displayAngle.current)
    );

    if (displayAngle.current > MAX_ANGLE) displayAngle.current = MAX_ANGLE;
    if (displayAngle.current < MIN_ANGLE) displayAngle.current = MIN_ANGLE;

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        setRotation(limitedAngle);

        const newValue = angleToValue(limitedAngle);
        // Usamos setValue(newValue) que viene de las props (setVolume, setBass, etc.)
        if (newValue !== value) {
          setValue(newValue);
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
  // SCROLL (WHEEL) (Adaptado para usar value/setValue de props)
  // ----------------------------------------------------
  const onWheel = (e) => {
    e.preventDefault();
    const step = (maxVolume - minVolume) / 50; // Paso más fino basado en el rango
    const delta = -Math.sign(e.deltaY) * step;

    let newVal = Math.max(minVolume, Math.min(maxVolume, value + delta));

    // Para los EQ, si el valor es pequeño, lo redondeamos al punto medio (0)
    if (Math.abs(newVal) < step && minVolume < 0) {
      newVal = 0;
    } else if (maxVolume - minVolume < 100) {
      newVal = parseFloat(newVal.toFixed(1));
    } else {
      newVal = Math.round(newVal);
    }

    setValue(newVal);

    // Sincronizar rotación visual e interna
    const visibleAngle = valueToAngle(newVal);
    setRotation(visibleAngle);
    displayAngle.current = visibleAngle;
  };

  useEffect(() => {
    const el = knobRef.current;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [value, minVolume, maxVolume]); // Dependencias actualizadas

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
      <div className="knob-title">
        <span>{title}</span>
      </div>

      {/* IMAGEN DE LA PERILLA */}
      <img
        src="/perilla6.png" // Reutiliza la misma imagen
        className="knob-image"
        style={{
          transform: `scale(0.80) rotate(${rotation + VISUAL_OFFSET}deg)`,
          transition: dragging.current
            ? "transform 0.1s cubic-bezier(0.2, 0, 0, 1)"
            : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        draggable={false}
        alt={title}
      />

      {/* DISPLAY NUMÉRICO (Solo si showDisplay es true, útil para el Volumen) */}
      {
        <div className="knob-display-volumen">
          <span>{Math.round(value)}</span>
        </div>
      }
    </div>
  );
}