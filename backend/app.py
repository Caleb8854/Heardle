from datetime import date
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from applemusic import daily_song, lookup_track
from game import isMatch

app = FastAPI()

class SongOut(BaseModel):
    track_id: int
    title: str
    artist: str
    preview_url: str
    artwork: str | None = None
    rounds: List[int] = Field(default_factory=lambda: [1,3,7,15,30,30])

class PreviewOut(BaseModel):
    preview_url: str

class GuessIn(BaseModel):
    guess: str

class GuessOut(BaseModel):
    valid: bool
    answer: str


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

@app.get("/song",response_model=SongOut)
def get_daily_song():
    today = date.today().isoformat()
    s = daily_song(today)
    if not s:
        raise HTTPException(503, "No previewable track")
    return SongOut(**s)

@app.get("/preview", response_model=PreviewOut)
def preview(track_id: int):
    tr = lookup_track(track_id)
    if not tr:
        raise HTTPException(status_code=404, detail="Track not found")
    
    url = tr["preview_url"]
    if not url:
        raise HTTPException(status_code=404, detail="No preview available")
    return PreviewOut(preview_url = url)
@app.get("/guess", response_model=GuessOut)
def check_guess(guess: GuessIn):
    today = date.today().isoformat()
    s = daily_song(today)
    if not s:
        raise HTTPException(503, "No previewable track")
    artist = s["artist"]
    title = s["title"]
    correct = isMatch(guess, artist, title)
    return GuessOut(
        valid = correct,
        answer = f"{artist} - {title}"
    )