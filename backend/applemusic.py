# apple.py
import hashlib
import requests
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

def search_songs(term: str, *, limit: int, country: str = "US", offset: int = 0) -> List[Dict[str, Any]]:
    res = requests.get(
        BASE_SEARCH,
        params={
            "term": term,
            "media": "music",
            "entity": "song",
            "limit": min(limit, 200),
            "country": country,
            "offset": max(0,offset),
        },
        timeout=10,
    )
    if res.status_code == 404:
        return []
    res.raise_for_status()
    data = res.json()
    return [_slim(it) for it in data.get("results", [])]
def search_songs_helper(term: str, *, country: str = "US", start_page: int = 0, max_pages: int = 3) -> List[Dict[str, Any]]:
    results: List[Dict[str,Any]] = []
    for i in range(max_pages):
        page = start_page + i
        items = search_songs(term, limit=200, country=country, offset=page * 200)
        if not items:
            break
        results.extend(items)
    return [it for it in results if it.get("preview_url")]
def daily_song(date: str, salt: str = "iamthegoat",*, country: str = "US") -> Optional[Dict[str, Any]]:
    h = hashlib.sha256((date + salt).encode()).hexdigest()
    num = int(h, 16)

    letters = "abcdefghijklmnopqrstuvwxyz"
    letter = num % len(letters)
    letter_order = [letters[(letter + i) % len(letters)] for i in range(3)]
    start_page = (num >> 5) % 5
    page_span = 3
    countries = ["US", "GB", "CA", "AU"]
    if country in countries:
        countries.remove(country)
        countries.insert(0, country)

    pick: Optional[Dict[str, Any]] = None
    for ctry in countries:
        for letter in letter_order:
            with_preview = search_songs_helper(letter, country=ctry, start_page=start_page, max_pages=page_span)
            if with_preview:
                idx = (num >> 17) % len(with_preview)
                pick = with_preview[idx]
                break
        if pick:
            break

    return pick

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
