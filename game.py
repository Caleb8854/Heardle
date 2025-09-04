import re
import random
import hashlib

def normalize(s: str):
    s = s.lower()
    pattern = re.compile(r"[^\w\s]")
    s = pattern.sub(" ", s)
    s = re.sub(r"\b(feat|ft|featuring)\b.*", "", s)
    s = re.sub(r"\b(remaster(ed)?|live|version|edit)\b.*", "", s)
    s = re.sub(r"[\(\[].*?[\)\]]", "", s)
    return " ".join(s.split())
def isMatch(guess: str, artist: str, title: str):
    g, a, t = normalize(guess), normalize(artist), normalize(title)
    if not g or not a or not t:
        return False
    if a in g and t in g:
        return True
    gt = set(g.split()); ta = set((a + " " + t).split())
    return len(gt & ta) / max(1, len(ta)) >= 0.7