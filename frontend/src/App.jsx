import { useState, useEffect, useRef} from 'react'
import './App.css'
import { getSong, getPreview, correctGuess} from "./api";
import PlayButton from "./components/PlayButton.jsx"
import GuessBox from './components/GuessBox.jsx';

function App() {
  const [song, setSong] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);
  const startedAtRef = useRef(0);
  const playTokenRef = useRef(0);
  const [end, setEnd] = useState(false);


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
  }
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
    setRevealAnswer(true);
  }
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

  }
  const handleSkip = () => {
    if(!song) return;

    const audio = audioRef.current;
    const isPlaying = audio && !audio.paused;
    const lastInd = song.rounds.length - 1;
    if(roundIndex >= lastInd){
      stopAudioAndTimer();
      setRevealAnswer(true);
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
  return (
    <>
    
      <audio ref={audioRef} preload="none" />
      <PlayButton
        onClick={playPreview}
      >
        Play
      </PlayButton>
      <PlayButton
        onClick={handleSkip}
        disabled={!song || end}
      >
        Skip
      </PlayButton>


      <p>Current round: {roundIndex + 1} / 6</p>
      <GuessBox 
        onCorrect={handleCorrect} 
        onIncorrect={handleIncorrect}
        revealAnswer={revealAnswer}
        roundIndex={roundIndex}
        disabled={!song || end}/>
      {revealAnswer && (
        <p style={{ marginTop: 8}}>
          Answer: <strong>{song.title} - {song.artist}</strong>
        </p>
      )}
    </>
  );
}

export default App