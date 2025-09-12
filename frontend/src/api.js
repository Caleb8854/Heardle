import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export async function getSong(){
    const res = await api.get("/song");
    return res.data;
}

export async function getPreview(track_id){
    const res = await api.get("/preview",{ params: { track_id } });
    return res.data;
}

export async function correctGuess(guess){
    const res = await api.get("/guess", { params: { guess } });
    return res.data;
}

export default api;