"use client";
import { usePlayer } from "./PlayerContext";

export default function PlayerDisplay() {
  const { isPlaying } = usePlayer();

  return (
    <div className="player-display">
      <div className="display-text-main">
        <p>{isPlaying ? "PLAY" : "PAUSE"}</p>
        <span>{isPlaying ? "    ●LIVE" : ""}</span>
      </div>

      <div className="marquee">
        <div className="marquee-inner">
          BASEMENT CLUB RADIO - Programa Especial Retro Synthwave - 24HS - VAMO LAS PUTA HARRY
        </div>
      </div>
    </div>
  );
}