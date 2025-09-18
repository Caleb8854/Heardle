import { useState, useEffect } from "react";
import { correctGuess } from "../api";

export default function GuessBox({ onCorrect, onIncorrect, roundIndex, disabled=false }) {
  const [guess, setGuess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    setGuess("");
  }, [roundIndex]);

  const submitGuess = async (e) => {
    e.preventDefault();
    const value = guess.trim();
    if (!value || loading || disabled) return;

    setLoading(true);

    try {
      const res = await correctGuess(value);
      if (res.valid) onCorrect?.(res);
      else onIncorrect?.(res);
    } catch (err) {
      setError(err.message || "Failed to check guess");
    } finally {
      setLoading(false);
      setGuess("");
    }
  };

    return (
    <form className="guessbox" onSubmit={submitGuess}>
      <div className="input-wrap">
        <span className="input-icon" aria-hidden>🔍</span>
        <input
          className="input"
          type="text"
          placeholder="Know it? Search for the title"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={loading || disabled}
          autoComplete="off"
        />
        {!!guess && (
          <button
            type="button"
            className="clear"
            aria-label="Clear"
            onClick={() => setGuess("")}
          >
            ×
          </button>
        )}
      </div>

      <button className="btn-submit" type="submit" disabled={loading || disabled || !guess.trim()}>
        SUBMIT
      </button>

      
    </form>
  );
}
