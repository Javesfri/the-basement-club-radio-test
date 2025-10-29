import { useRef, useState } from "react";

export default function Home() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="radio-container">
      <img src="/logo.png" alt="Radio Logo" className="radio-logo" />

      <div className="player-bar">
        <button onClick={togglePlay} className="player-button">
          {isPlaying ? "❚❚" : "►"}
        </button>

        <div className="player-info">
          <p className="now-playing">
            {isPlaying ? "Reproduciendo..." : "Pausado"}
          </p>
          <p className="station-name">Basement Radio</p>
        </div>
      </div>

      <audio
        ref={audioRef}
        src="http://72.61.33.218:8000"
        preload="none"
      />
    </div>
  );
}
