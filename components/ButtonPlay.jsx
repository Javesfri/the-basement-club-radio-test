"use client";

import { usePlayer } from "./PlayerContext";

export default function ButtonPlay() {
  const { isOpen, togglePlayer } = usePlayer();

  return (
    <div className="button-play-container">
      <div className="button-play-letters-container-off"><span>OFF</span></div>

      <button
        className={`button-play ${isOpen ? "on" : ""}`}
        onClick={togglePlayer}
      >
        <img
          src={isOpen ? "/button-on.png" : "/button-off.png"}
          alt="toggle"
          className="button-play-image"
        />
      </button>

      <div className="button-play-letters-container-on"><span>ON</span></div>
    </div>
  );
}
