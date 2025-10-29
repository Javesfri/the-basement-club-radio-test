import { useRef, useState } from "react";

export default function Home() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  return (
    <div className="radio-container">
      <img src="/logo.png" alt="Radio Logo" className="radio-logo" />

      <div className="player-bar">
        <button onClick={togglePlay} className="player-button">
          {isPlaying ? "❚❚" : "►"}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />

        <div className="player-info">
          <p className="now-playing">
            {isPlaying ? "Reproduciendo..." : "Pausado"}
          </p>
          <p className="station-name">Basement Radio</p>
        </div>
      </div>

      <audio
        ref={audioRef}
        src="https://thebasementradio.duckdns.org:8443/radio.mp3"
        preload="none"
      />
    </div>
  );
}
