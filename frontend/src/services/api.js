import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const getTrending = async () => {
  const response = await api.get('/trending');
  return response.data;
};

export const chatWithAI = async (message, preferences, history, imageData = null) => {
  const response = await api.post('/chat', { message, preferences, history, image_data: imageData });
  return response.data;
};

export const stt = async (audioB64) => {
  const response = await api.post('/voice/stt', { audio: audioB64 });
  return response.data;
};

export const tts = async (text, voiceId) => {
  const response = await api.post('/voice/tts', { text, voice_id: voiceId });
  return response.data;
};

export const downloadPDF = async (itinerary) => {
  const response = await api.post('/download', { itinerary });
  return response.data;
};

export default api;
