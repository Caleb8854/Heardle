from datetime import date
from functools import lru_cache
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from applemusic import daily_song
from game import isMatch

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SongOut(BaseModel):
    track_id: int
    title: str
    artist: str
    preview_url: str
    artwork: str | None = None
    rounds: List[int] = Field(default_factory=lambda: [1,2,4,7,11,16])

class GuessOut(BaseModel):
    valid: bool
    answer: str

@lru_cache(maxsize=8)
def _pick_song_for_day(day: str):
    s = daily_song(day)
    if not s:
        return None
    return s

@app.get("/song",response_model=SongOut)
def get_daily_song():
    today = date.today().isoformat()
    s = _pick_song_for_day(today)
    if not s:
        raise HTTPException(503, "No previewable track")
    return SongOut(**s)

@app.get("/guess", response_model=GuessOut)
def check_guess(guess: str):
    today = date.today().isoformat()
    s = daily_song(today)
    if not s:
        raise HTTPException(503, "No previewable track")
    artist = s["artist"]
    title = s["title"]
    correct = isMatch(guess, artist, title)
    return GuessOut(
        valid = correct,
        answer = f"{title} - {artist}"
    )