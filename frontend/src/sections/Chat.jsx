import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Search, 
  Globe, 
  Brain, 
  Mic, 
  MicOff, 
  RefreshCcw, 
  Download,
  Terminal,
  AlertCircle,
  FileText
} from 'lucide-react';
import { chatWithAI, stt, tts, downloadPDF } from '../services/api';

const Chat = ({ initialPrompt, preferences }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [autoLoadDest, setAutoLoadDest] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const steps = [
    { id: 'transcribing', label: 'Transcribing your request...', icon: <Mic size={14} /> },
    { id: 'searching', label: 'Searching destinations...', icon: <Search size={14} /> },
    { id: 'insights', label: 'Gathering travel insights...', icon: <Globe size={14} /> },
    { id: 'designing', label: 'Designing itinerary...', icon: <Brain size={14} /> },
    { id: 'finalizing', label: 'Finalizing travel plan...', icon: <Terminal size={14} /> }
  ];

  // Auto-send logic for initialPrompt (Trending cards)
  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
      const destMatch = initialPrompt.match(/to (.*)/);
      if (destMatch) setAutoLoadDest(destMatch[1]);
    }
  }, [initialPrompt]);

  // Internal container scroll
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, currentStep, isLoading]);

  const handleSend = async (msg, forceVoice = false) => {
    const text = msg || input;
    if (!text.trim()) return;

    setError(null);
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Start from index 1 because index 0 is "Transcribing" (voice only)
      for (let i = 1; i < steps.length; i++) {
        setCurrentStep(i);
        await new Promise(r => setTimeout(r, 600));
      }

      const data = await chatWithAI(text, preferences, messages);
      
      if (!data || !data.response) throw new Error("Agent failed to respond.");

      const assistantMsg = { 
        role: 'assistant', 
        content: data.response,
        image: data.image,
        pulse: data.pulse,
        destination: data.destination
      };
      setMessages(prev => [...prev, assistantMsg]);
      
      if (voiceMode || forceVoice) {
        try {
          const audioData = await tts(data.response.substring(0, 300));
          if (audioData?.audio) {
            const audio = new Audio(`data:audio/mp3;base64,${audioData.audio}`);
            audio.play();
          }
        } catch (voiceErr) {
          console.warn("Voice playback failed", voiceErr);
        }
      }

    } catch (err) {
      console.error(err);
      setError("Something went wrong with the AI engine. Please try again.");
    } finally {
      setIsLoading(false);
      setCurrentStep(0);
      setAutoLoadDest(null);
    }
  };

  const handleDownloadPDF = async (itinerary) => {
    setIsDownloading(true);
    try {
      const data = await downloadPDF(itinerary);
      if (data.pdf) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${data.pdf}`;
        link.download = `Atlas_Itinerary_${Date.now()}.pdf`;
        link.click();
      }
    } catch (err) {
      console.error("PDF Download failed", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          setIsLoading(true);
          setCurrentStep(0); // Show "Transcribing..."
          try {
            const data = await stt(base64Audio);
            if (data.text) {
              setVoiceMode(true);
              handleSend(data.text, true);
            }
          } catch (err) {
            console.error("STT Error", err);
            setError("Could not transcribe voice.");
            setIsLoading(false);
            setCurrentStep(-1);
          }
        };
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  const handleMicToggle = () => isRecording ? stopRecording() : startRecording();

  return (
    <div className="w-full max-w-[1000px] mx-auto h-[850px] glass-card rounded-[48px] flex flex-col overflow-hidden relative shadow-2xl border border-white/10">
      
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-12 space-y-12 chat-scrollbar isolate scroll-smooth"
      >
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40">
            <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center border border-white/5">
              <Bot size={48} />
            </div>
            <div>
              <h3 className="text-3xl font-heading font-bold mb-3">Atlas: AI Travel Agent</h3>
              <p className="max-w-md font-light">Your elite 2.5 itinerary engine is active.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-6 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-white text-dark' : 'bg-white/10 border border-white/10'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-8 rounded-[32px] overflow-hidden relative ${
                msg.role === 'user' 
                ? 'bg-white text-dark font-medium shadow-2xl' 
                : 'bg-white/5 border border-white/10 text-white/90 shadow-xl'
              }`}>
                {msg.role === 'assistant' ? (
                  <>
                    {/* Premium Hero Image */}
                    {msg.image && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group"
                      >
                        <img src={msg.image} alt="Destination" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      </motion.div>
                    )}

                    {/* Live Pulse Widget (Now outside image so it always shows) */}
                    {msg.pulse && (
                      <div className="mb-8 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-6 shadow-xl">
                        <div className="p-3 bg-white/10 rounded-xl">
                          <RefreshCcw size={20} className="text-white/60" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Live Destination Pulse</p>
                          <p className="text-sm text-white/90 leading-relaxed">{msg.pulse}</p>
                        </div>
                      </div>
                    )}

                    <div className="prose-elite">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    
                    {/* Exquisite Action Buttons */}
                    {msg.content.includes('Day 1') && (
                      <div className="flex flex-wrap gap-4 mt-8">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDownloadPDF(msg.content)}
                          disabled={isDownloading}
                          className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-xl hover:bg-white hover:text-dark transition-all duration-500 group border border-white/10"
                        >
                          {isDownloading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <FileText size={16} className="group-hover:scale-110 transition-transform" />
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-widest">Download Bespoke PDF</span>
                        </motion.button>

                        <motion.a
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          href={`https://www.google.com/maps/search/?api=1&query=${preferences.destination || 'Travel'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-xl hover:bg-white/20 transition-all duration-500 group border border-white/10"
                        >
                          <Globe size={16} className="group-hover:rotate-12 transition-transform" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Explore Interactive Map</span>
                        </motion.a>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="whitespace-pre-wrap font-body text-lg leading-relaxed">{msg.content}</div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && !error && (
          <div className="space-y-8">
            <div className="flex justify-start gap-3 items-center">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Loader2 size={18} className="animate-spin text-white/40" />
              </div>
              <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                {autoLoadDest ? `Planning your trip to ${autoLoadDest}...` : "Architecting your journey with Atlas..."}
              </p>
            </div>

            <div className="flex flex-col gap-4 pl-16">
              {steps.map((step, idx) => (
                <div 
                  key={step.id} 
                  className={`flex items-center gap-4 transition-all duration-700 ${idx <= currentStep ? 'opacity-100' : 'opacity-10'}`}
                >
                  <div className={`p-2 rounded-lg ${idx === currentStep ? 'bg-white text-dark scale-110' : 'bg-white/5 text-white'}`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${idx === currentStep ? 'text-white' : 'text-white/40'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-6 pt-10">
            <div className="bg-red-500/10 border border-red-500/20 px-8 py-4 rounded-2xl flex items-center gap-4 text-red-400">
              <AlertCircle size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">{error}</span>
            </div>
            <button 
              onClick={() => {
                const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                if (lastUserMsg) handleSend(lastUserMsg.content);
              }}
              className="px-6 py-3 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <RefreshCcw size={14} /> Retry Last Message
            </button>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-10 border-t border-white/5 bg-white/[0.02] backdrop-blur-2xl">
        <div className="relative group flex items-center gap-3 bg-white/5 border border-white/10 rounded-[32px] pl-10 pr-4 py-4 focus-within:border-white/30 transition-all duration-500 shadow-2xl">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message Atlas..."
            className="flex-1 bg-transparent border-none text-white text-xl focus:outline-none focus:ring-0 font-body placeholder:text-white/10"
            disabled={isLoading}
          />
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleMicToggle}
              disabled={isLoading && !isRecording}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                isRecording 
                ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' 
                : 'bg-white/5 hover:bg-white/10 text-white/40'
              }`}
            >
              {isRecording ? <MicOff size={24} className="text-white" /> : <Mic size={24} />}
            </button>
            
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="w-14 h-14 rounded-2xl bg-white text-dark flex items-center justify-center disabled:opacity-20 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
