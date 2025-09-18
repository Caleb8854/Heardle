import { useState, useEffect, useRef} from 'react';
import './App.css';
import { getSong} from "./api";
import GuessBox from './components/GuessBox.jsx';

function App() {
  const [song, setSong] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [skipped,setskipped] = useState(false);
  const [end, setEnd] = useState(false);
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);
  const startedAtRef = useRef(0);
  const playTokenRef = useRef(0);



  useEffect(() => {
    async function loadSong() {
      try {
        const data = await getSong();
        setSong(data)
        setRevealAnswer(false);
      } catch (err){
        console.error("Failed to fetch song", err);
      }
    }
    loadSong();
  }, []);
  if (!song || !song.rounds) {
    return (
      <div style={{ padding: 16 }}>
        <audio ref={audioRef} preload="none" />
        <p>Loading…</p>
      </div>
    );
  }

  function scheduleStop(ms){
    const token = Date.now();
    playTokenRef.current = token;
    if(timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = setTimeout(() => {
      if(playTokenRef.current !== token) return;
      const audio = audioRef.current;
      if(audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      timeoutRef.current = null;
    }, Math.max(0,ms));
  };
  const stopAudioAndTimer = () => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  const playPreview = async () => {
    if (!song) return;
    try {
      const duration = song.rounds[roundIndex];
      const audio = audioRef.current;
      stopAudioAndTimer();
      audio.src = song.preview_url;
      audio.load();
      await audio.play();
      startedAtRef.current = Date.now();
      scheduleStop(duration * 1000);
    } catch (err) {
      console.error("Playback failed:", err);
    }
  };
  const handleCorrect = (res) => {
    stopAudioAndTimer();
    setskipped(false);
    setEnd(true);
    setRevealAnswer(true);
  };
  const handleIncorrect = (res) => {
    stopAudioAndTimer();
    const last = song ? song.rounds.length - 1 : 5;
    if(roundIndex < last){
      setRoundIndex((i) => Math.min(i + 1, last));
      setRevealAnswer(false);
    } else {
      setRevealAnswer(true);
      setEnd(true);
    }
    setskipped(false);

  };
  const handleSkip = () => {
    if(!song) return;

    const audio = audioRef.current;
    const isPlaying = audio && !audio.paused;
    const lastInd = song.rounds.length - 1;
    if(roundIndex >= lastInd){
      stopAudioAndTimer();
      setRevealAnswer(true);
      setskipped(true);
      setEnd(true);
      return;
    }
    if(timeoutRef.current){
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setRoundIndex(prev => {
      const next = Math.min(prev + 1, lastInd);
      if(isPlaying && next < song.rounds.length) {
        const elapsedSec = (Date.now() - startedAtRef.current) / 1000;
        const nextDuration = song.rounds[next];
        const remainingMs = Math.max(0, (nextDuration - elapsedSec) * 1000);
        scheduleStop(remainingMs);
      }
      return next;
    });

    

  };
  const total = song.rounds.length;
  const currDur = song.rounds[roundIndex];
  const nextDur = song.rounds[Math.min(roundIndex + 1, total - 1)];
  const skipIncrement = Math.max(0, (nextDur ?? currDur) - currDur);
  return (
    <div>
      <header className="header">
        <h1>Heardle</h1>
      </header>
      <div
        className="ticks"
        style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}
      >
        {song.rounds.map((_, i) => (
          <div key={i} className={`tick ${i <= roundIndex ? "tick--active" : ""}`} />
        ))}
      </div>

      <div className="control-row">
        <span className="time">0:00</span>
        <button className="play-btn" onClick={playPreview} aria-label="Play">
          ▶
        </button>
        <span className="time">{`0:${String(currDur).padStart(2, "0")}`}</span>
      </div>

      <div className="guess-row">
        <button className="btn-skip" onClick={handleSkip} disabled={end}>
          {`SKIP ${skipIncrement ? `(+${skipIncrement}s)` : ""}`}
        </button>

        <GuessBox
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          revealAnswer={revealAnswer}
          roundIndex={roundIndex}
          disabled={end}
        />
      </div>

      {revealAnswer && (
        <p className="answer-line">
          {skipped ? "Skipped — " : ""}
          Answer: <strong>{song.title} - {song.artist}</strong>
        </p>
      )}

      <audio ref={audioRef} preload="none" playsInline />
    </div>
  );
}

export default App