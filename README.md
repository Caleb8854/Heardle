# 🎵 Heardle Clone

A full-stack music guessing game inspired by **Heardle**.  
Players try to guess the daily song from short audio previews, with the snippet length increasing after each incorrect guess or skip.

## 🚀 Features
- Daily song selection powered by **Apple Music / iTunes API**
- Guess validation with fuzzy matching of artist and title
- Progressive rounds with increasing preview durations (1s, 2s, 4s, 7s, 11s, 16s by default)
- Skipping system to reveal longer snippets if unsure
- Frontend built with **React + Vite**
- Backend powered by **FastAPI**

## 📂 Project Structure
```
.
├── backend/
│   ├── app.py          # FastAPI server with routes (/song, /guess)
│   ├── applemusic.py   # Apple Music/iTunes API utilities
│   ├── game.py         # Guess checking and normalization logic
│
├── frontend/
│   ├── App.jsx         # Main React component
│   ├── api.js          # Axios wrapper for backend API
│   ├── App.css         # Game-specific styles
│   ├── index.css       # Global styles
│   └── main.jsx        # React entry point
```

## 🛠️ Installation

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install fastapi uvicorn requests pydantic
uvicorn app:app --reload
```
Backend runs at **http://localhost:8000**

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**

## 🎮 How to Play
1. Open the frontend in your browser.
2. Press **Play** to hear the first 1s snippet.
3. Type your guess (song + artist).
   - ✅ Correct guess → You win!
   - ❌ Wrong guess → Next snippet unlocks.
   - ⏭️ Skip → Move to the next round without guessing.
4. After the final round, the correct answer is revealed.

## 🔧 Configuration
- Daily song selection is based on a deterministic hash of the current date.
- Default preview lengths can be changed in `SongOut.rounds` in **app.py**.
- CORS origins are configured in `app.py` for `localhost:5173`.

## 📜 License
MIT License – free to use and modify.
