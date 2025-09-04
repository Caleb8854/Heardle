from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from applemusic import random_song, lookup_track
import random, requests



class RandomSongOut(BaseModel):
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
    ansewr: str

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/song",response_model=RandomSongOut)
def get_random_song():

    s = random_song(country="US")
    if not s:
        raise HTTPException(503, "No previewable tracks found")
    return RandomSongOut(**s)

@app.get("/preview", response_model=PreviewOut)
def preview(track_id: int):
    print("hi")
    print("Incoming track_id:", track_id, type(track_id))
    tr = lookup_track(track_id)
    if not tr:
        raise HTTPException(status_code=404, detail="Track not found")
    
    url = tr["preview_url"]
    if not url:
        raise HTTPException(status_code=404, detail="No preview available")
    return PreviewOut(preview_url = url)

s = random_song()
print(preview(s))