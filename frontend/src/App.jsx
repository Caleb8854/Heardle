import { useState, useEffect, useRef} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { getSong, getPreview, correctGuess} from "./api";
import PlayButton from "./components/PlayButton.jsx"

function App() {
  const [count, setCount] = useState(0)
  const [song, setSong] = useState(null);
  const [preview, setPreview] = useState(null);
  const [guess, setGuess] = useState("");
  const [guessResult, setGuessResult] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    async function loadSong() {
      try {
        const data = await getSong();
        setSong(data)
      } catch (err){
        console.error("Failed to fetch song", err);
      }
    }
    loadSong();
  }, []);
  const playPreview = async () => {
    if (!song) return;
    try {
      const audio = audioRef.current;
      audio.src = song.preview_url;
      audio.load();
      await audio.play();
    } catch (err) {
      console.error("Playback failed:", err);
    }
  };
  return (
    <>

      <audio ref={audioRef} preload="none" />
      <PlayButton onClick={playPreview}>Play Preview</PlayButton>
    </>
  );
}

export default App
