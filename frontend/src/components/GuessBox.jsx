import { useState, useEffect } from "react";
import { correctGuess } from "../api";

export default function GuessBox({ onCorrect, onIncorrect, revealAnswer, roundIndex, disabled=false }) {
  const [guess, setGuess] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {

    setGuess("");
    setError("");
  }, [roundIndex]);

  const submitGuess = async (e) => {
    e.preventDefault();
    const value = guess.trim();
    if (!value || loading || disabled) return;

    setLoading(true);
    setError("");
    setFeedback(null);

    try {
      const res = await correctGuess(value);
      setFeedback(res);
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
    <form onSubmit={submitGuess} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input
        type="text"
        placeholder="Type title - artist"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        disabled={loading || disabled}
        autoComplete="off"
        style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", minWidth: 260 }}
      />
      <button type="submit" disabled={loading || disabled || !guess.trim()}>
        {loading ? "Checking…" : "Submit"}
      </button>

      {error && <span style={{ color: "crimson" }}>{error}</span>}
      {feedback && !error && (
        <span style={{ marginLeft: 8, color: feedback.valid ? "green" : "crimson", whiteSpace: "pre-wrap" }}>
          {feedback.valid ? "✅ Correct!" : "❌ Wrong"}
          {revealAnswer && ` — Answer: ${feedback.answer}`}
        </span>
      )}
    </form>
  );
}
