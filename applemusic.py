# apple.py
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

def random_song(*, country: str = "US") -> Optional[Dict[str, Any]]:
    letters = "abcdefghijklmnopqrstuvwxyz"
    for _ in range(8):  # try up to 8 times
        term = random.choice(letters)
        items = search_songs(term, country=country)
        with_preview = [it for it in items if it.get("preview_url")]
        if with_preview:
            return random.choice(with_preview)
    return None
def lookup_track(track_id: int, country: str = "US"):
    url = f"https://itunes.apple.com/lookup?id={track_id}&entity=song"
    response = requests.get(url)
    data = response.json()
    track = data["results"][0]
    return {
        "track_id": track_id,
        "title": track["trackName"],
        "artist": track["artistname"],
        "preview_url": track["previewUrl"],
        "artwork": track["artworkUrl100"]
    }
