# apple.py
import hashlib
import random, requests
from typing import Dict, Any, List, Optional

BASE_SEARCH = "https://itunes.apple.com/search"

def _slim(item: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "track_id": int(item["trackId"]),
        "title": item.get("trackName", ""),
        "artist": item.get("artistName", ""),
        "preview_url": item.get("previewUrl"),
        "artwork": item.get("artworkUrl100"),
    }

def search_songs(term: str, *, limit: int = 50, country: str = "US") -> List[Dict[str, Any]]:
    res = requests.get(
        BASE_SEARCH,
        params={
            "term": term,
            "media": "music",
            "entity": "song",
            "limit": min(limit, 200),
            "country": country,
        },
        timeout=10,
    )
    res.raise_for_status()
    data = res.json()
    return [_slim(it) for it in data.get("results", [])]

def daily_song(date: str, salt: str = "iamthegoat",*, country: str = "US") -> Optional[Dict[str, Any]]:
    h = hashlib.sha256((date + salt).encode()).hexdigest()
    num = int(h, 16)

    letters = "abcdefghijklmnopqrstuvwxyz"
    letter = letters[num % len(letters)]

    items = search_songs(letter, limit=200, country=country)
    with_preview = [it for it in items if it.get("preview_url")]
    if not with_preview:
        return None

    idx = num % len(with_preview)
    return with_preview[idx]

def lookup_track(track_id: int):
    url = f"https://itunes.apple.com/lookup?id={track_id}"

    response = requests.get(url)

    data = response.json()
    results = data.get("results", [])
    track = results[0]

    return {
        "track_id": track_id,
        "title": track.get("trackName"),
        "artist": track.get("artistname"),
        "preview_url": track.get("previewUrl"),
        "artwork": track.get("artworkUrl100")
    }
