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
  FileText,
  Camera,
  Video,
  Activity,
  Ticket,
  MapPin,
  ExternalLink,
  Paperclip,
  Image as ImageIcon,
  Users,
  Languages,
  Thermometer,
  ShieldAlert,
  CreditCard,
  QrCode,
  Share2,
  CheckCircle2
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVisionMode, setIsVisionMode] = useState(false);
  const [showDebate, setShowDebate] = useState(false);
  const [debateText, setDebateText] = useState("");
  
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
    const userMsg = { role: 'user', content: text, sentImage: selectedImage };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Expert Debate Simulation
      const city = text || preferences.destination;
      setDebateText(`(Culinary): Researching Michelin spots in ${city}... \n(Adventure): Analyzing crowd levels at main attractions... \n(Logistics): Calculating private transport efficiency...`);
      setShowDebate(true);

      // Start from index 1 because index 0 is "Transcribing" (voice only)
      for (let i = 1; i < steps.length; i++) {
        setCurrentStep(i);
        await new Promise(r => setTimeout(r, 600));
      }

      const base64Image = selectedImage ? selectedImage.split(',')[1] : null;
      const data = await chatWithAI(text, preferences, messages, base64Image);
      setSelectedImage(null);
      setIsVisionMode(false);
      setShowDebate(false);
      
      if (!data || !data.response) throw new Error("Agent failed to respond.");

      const assistantMsg = { 
        role: 'assistant', 
        content: data.response,
        image: data.image,
        pulse: data.pulse,
        safety: data.safety,
        events: data.events,
        aesthetic: data.aesthetic,
        video: data.video,
        crowd: data.crowd,
        phrases: data.phrases,
        heatmap: data.heatmap,
        destination: data.destination
      };
      setMessages(prev => [...prev, assistantMsg]);
      
      if (voiceMode || forceVoice) {
        try {
          const audioData = await tts(data.response.substring(0, 300), preferences.voice_id);
          if (audioData?.audio) {
            const audio = new Audio(`data:audio/mp3;base64,${audioData.audio}`);
            audio.play();
          }
        } catch (voiceErr) {
          console.warn("Voice playback failed", voiceErr);
        }
      }

      // Save to Vault logic
      if (data.response.includes('Day 1')) {
        const vault = JSON.parse(localStorage.getItem('tripcraft_vault') || '[]');
        const newTrip = {
          id: Date.now(),
          destination: data.destination || 'Bespoke Journey',
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          content: data.response,
          budget: preferences.budget,
          personality: preferences.personality
        };
        localStorage.setItem('tripcraft_vault', JSON.stringify([newTrip, ...vault].slice(0, 10)));
      }

    } catch (err) {
      console.error(err);
      setShowDebate(false);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setIsVisionMode(true);
        if (!input) setInput("Identify this place and plan an elite trip.");
      };
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto h-[850px] flex gap-6 relative">
      {/* Main Chat Container */}
      <div className="flex-1 glass-card rounded-[48px] flex flex-col overflow-hidden relative shadow-2xl border border-white/10">
      
      {/* Floating Expert Debate Panel */}
      <AnimatePresence>
        {showDebate && (
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="absolute right-10 top-32 w-80 z-50 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-4 text-accent-blue">
               <Users size={18} />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Expert Insight Debate</span>
            </div>
            <div className="space-y-4">
               {debateText.split('\n').map((line, i) => (
                 <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 }}
                    className="p-3 bg-white/5 rounded-xl border border-white/5"
                 >
                    <p className="text-[11px] text-white/70 leading-relaxed font-body italic">{line}</p>
                 </motion.div>
               ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
               <div className="flex gap-1">
                  {[0,1,2].map(d => (
                    <motion.div 
                      key={d}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-accent-blue/40"
                    />
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
                {msg.sentImage && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-dark/10">
                    <img src={msg.sentImage} alt="User upload" className="w-full h-40 object-cover" />
                  </div>
                )}
                {msg.role === 'assistant' ? (
                  <>
                    {/* NEW: Trip Optimization Score */}
                    {msg.content.includes('Day 1') && (
                      <div className="absolute -top-4 -right-4 z-20">
                         <div className="w-16 h-16 rounded-full bg-white text-dark flex flex-col items-center justify-center border-4 border-[#0A0A0A] shadow-2xl">
                            <span className="text-[10px] font-bold uppercase opacity-30 leading-none">Score</span>
                            <span className="text-xl font-heading font-black">98</span>
                         </div>
                      </div>
                    )}
                    {/* Premium Moodboard Grid */}
                    {msg.moodboard && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {msg.moodboard.map((img, idx) => (
                           <motion.div 
                             key={idx}
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: idx * 0.1 }}
                             className={`rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group ${idx === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                           >
                             <img src={img} alt="Mood" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 min-h-[120px]" />
                           </motion.div>
                        ))}
                      </div>
                    )}
                    {!msg.moodboard && msg.image && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group"
                      >
                        <img src={msg.image} alt="Destination" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      </motion.div>
                    )}

                    {/* NEW: Local Language Translator Widget */}
                    {msg.phrases && (
                      <div className="mt-8 p-8 bg-white/5 border border-white/10 rounded-[32px]">
                        <div className="flex items-center gap-3 mb-6 text-accent-blue">
                          <Languages size={20} />
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Atlas Local Translator</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {msg.phrases.map((p, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">{p.phrase}</p>
                              <p className="text-xl font-heading mb-1">{p.local}</p>
                              <p className="text-[10px] text-accent-blue/60 font-medium">/{p.phonetic}/</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NEW: Safety & Crowd Heatmap Intelligence */}
                    {msg.heatmap && (
                      <div className="mt-8 p-8 bg-[#0D0D0D] border border-white/5 rounded-[32px] relative overflow-hidden">
                        {/* Pulse Ring Animation */}
                        <div className="absolute top-8 right-8 flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                           <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Monitoring</span>
                        </div>

                        <div className="flex items-center gap-3 mb-6 text-red-400">
                          <ShieldAlert size={20} />
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Safety & Crowd Heatmap</h4>
                        </div>

                        <div className="space-y-6">
                           <div>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-3">Verified Safe Zones</p>
                              <div className="flex flex-wrap gap-2">
                                {msg.heatmap.safe_zones.map((z, i) => (
                                  <span key={i} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                                    {z}
                                  </span>
                                ))}
                              </div>
                           </div>

                           <div>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-3">Live Crowd Hotspots</p>
                              <div className="flex flex-wrap gap-2">
                                {msg.heatmap.crowd_hotspots.map((z, i) => (
                                  <span key={i} className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                                    {z}
                                  </span>
                                ))}
                              </div>
                           </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex flex-col">
                               <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Risk Score</span>
                               <span className="text-2xl font-heading text-white">{msg.heatmap.rating} / 10</span>
                            </div>
                            <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{msg.heatmap.status}</span>
                            </div>
                        </div>
                      </div>
                    )}

                    {/* NEW: Emergency Shield Widget (Fortress Update) */}
                    {msg.shield && (
                      <div className="mt-8 p-1 bg-gradient-to-br from-red-500/40 to-red-500/10 rounded-[32px] overflow-hidden shadow-2xl">
                         <div className="bg-[#0A0000] p-8 rounded-[30px] border border-red-500/20">
                            <div className="flex items-center gap-3 mb-6 text-red-500">
                               <ShieldAlert size={24} className="animate-pulse" />
                               <h4 className="text-[10px] font-bold uppercase tracking-[0.3em]">Concierge Emergency Shield</h4>
                            </div>
                            
                            <div className="space-y-4">
                               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                                     <MapPin size={18} />
                                  </div>
                                  <div>
                                     <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest leading-none mb-1">Elite Medical Support</p>
                                     <p className="text-sm text-white font-medium">{msg.shield.hospital}</p>
                                  </div>
                               </div>

                               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                     <Building2 size={18} />
                                  </div>
                                  <div>
                                     <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest leading-none mb-1">Indian Diplomatic Contact</p>
                                     <p className="text-sm text-emerald-400 font-bold">{msg.shield.embassy}</p>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    )}

                    {/* NEW: THE ELITE DIGITAL PASSPORT (Final Phase) */}
                    {msg.content.includes('Day 1') && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 group relative"
                      >
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-accent-blue/20 to-purple-500/20 rounded-[40px] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                        
                        <div className="relative p-1 bg-gradient-to-br from-white/20 to-white/5 rounded-[40px] overflow-hidden">
                           <div className="bg-[#050505] rounded-[38px] overflow-hidden flex flex-col md:flex-row shadow-2xl">
                              
                              {/* Passport Left: Visual & Identity */}
                              <div className="w-full md:w-1/3 bg-white/5 p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/10">
                                 <div className="w-24 h-24 rounded-full border-2 border-accent-blue/30 p-1 flex items-center justify-center relative">
                                    <div className="w-full h-full rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                                       <Users size={32} />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-[#050505]">
                                       <CheckCircle2 size={14} className="text-white" />
                                    </div>
                                 </div>
                                 
                                 <div className="text-center mt-6">
                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Passport Holder</p>
                                    <h3 className="text-xl font-heading text-white">Elite Traveler</h3>
                                    <p className="text-[10px] text-accent-blue font-bold uppercase tracking-widest mt-2">{preferences.personality} Mode</p>
                                 </div>

                                 <div className="mt-8 pt-8 border-t border-white/5 w-full flex justify-center">
                                    <QrCode size={48} className="text-white/20" />
                                 </div>
                              </div>

                              {/* Passport Right: Trip Data */}
                              <div className="flex-1 p-10 relative">
                                 {/* Background Pattern */}
                                 <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                    <Languages size={120} />
                                 </div>

                                 <div className="flex justify-between items-start mb-12">
                                    <div>
                                       <p className="text-[10px] text-accent-blue font-bold uppercase tracking-[0.3em] mb-2 leading-none">TripCraft Official Passport</p>
                                       <h2 className="text-4xl font-heading text-white leading-tight uppercase">{msg.destination || 'Global Explorer'}</h2>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Journey Score</p>
                                       <p className="text-3xl font-heading text-accent-blue">96.4</p>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                                    <div>
                                       <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-1">Visa Type</p>
                                       <p className="text-xs font-bold text-white uppercase tracking-wider">{preferences.interest || 'Culture'} & Discovery</p>
                                    </div>
                                     <div>
                                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-1">Issue Date</p>
                                        <p className="text-xs font-bold text-white uppercase tracking-wider">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                     </div>
                                  </div>

                                  <div className="mt-12 flex items-center justify-between">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                           <Banknote size={16} />
                                        </div>
                                        <div>
                                           <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mb-1">INR Pulse</p>
                                           <p className="text-sm font-bold text-white uppercase tracking-wider">₹10,000 ≈ {(10000 * msg.currency).toLocaleString()} Local</p>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                                           <Clock size={16} />
                                        </div>
                                        <div>
                                           <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mb-1">Local Time Pulse</p>
                                           <p className="text-sm font-bold text-white uppercase tracking-wider">Synchronized with AI</p>
                                        </div>
                                     </div>
                                     <button className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/sound">
                                        <Volume2 size={16} className="text-accent-blue group-hover/sound:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Local Soundscape</span>
                                     </button>
                                  </div>
                                    <div>
                                       <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-1">Budget Tier</p>
                                       <p className="text-xs font-bold text-white uppercase tracking-wider">{preferences.budget || 'Bespoke'}</p>
                                    </div>
                                    <div>
                                       <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-1">Security Clearance</p>
                                       <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Tier 1 Elite</p>
                                    </div>
                                 </div>

                                 <div className="mt-12 flex items-center gap-4">
                                    <button 
                                      onClick={() => alert("Passport Shared with Atlas Network")}
                                      className="flex-1 h-14 bg-white text-dark rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5"
                                    >
                                       <Share2 size={16} /> Share Digital Passport
                                    </button>
                                    <button className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-white/40 transition-all border border-white/5">
                                       <CreditCard size={20} />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex flex-col gap-4 mb-8">
                      {msg.pulse && (
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-6 shadow-xl">
                          <div className="p-3 bg-white/10 rounded-xl">
                            <RefreshCcw size={20} className="text-white/60" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Live Destination Pulse</p>
                            <p className="text-sm text-white/90 leading-relaxed">{msg.pulse}</p>
                          </div>
                        </div>
                      )}

                      {msg.safety && (
                        <div className="p-6 bg-red-500/5 backdrop-blur-md rounded-2xl border border-red-500/10 flex items-center gap-6 shadow-xl">
                          <div className="p-3 bg-red-500/10 rounded-xl">
                            <AlertCircle size={20} className="text-red-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/40 mb-1">Safety & Health Pulse</p>
                            <p className="text-sm text-white/80 leading-relaxed">{msg.safety}</p>
                          </div>
                        </div>
                      )}

                      {msg.events && (
                        <div className="p-6 bg-purple-500/5 backdrop-blur-md rounded-2xl border border-purple-500/10 flex items-center gap-6 shadow-xl">
                          <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Globe size={20} className="text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-500/40 mb-1">Live Local Events</p>
                            <p className="text-sm text-white/80 leading-relaxed italic line-clamp-2">{msg.events}</p>
                          </div>
                        </div>
                      )}

                      {/* NEW: Crowd Sentiment Pulse */}
                      {msg.crowd && (
                        <div className="p-6 bg-blue-500/5 backdrop-blur-md rounded-2xl border border-blue-500/10 flex items-center gap-6 shadow-xl">
                          <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Activity size={20} className="text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500/40 mb-1">Crowd Activity Pulse</p>
                            <p className="text-sm text-white/80 leading-relaxed font-bold">{msg.crowd}</p>
                          </div>
                        </div>
                      )}

                      {/* NEW: Aesthetic Spots Pulse */}
                      {msg.aesthetic && (
                        <div className="p-6 bg-pink-500/5 backdrop-blur-md rounded-2xl border border-pink-500/10 flex items-center gap-6 shadow-xl">
                          <div className="p-3 bg-pink-500/10 rounded-xl">
                            <Camera size={20} className="text-pink-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500/40 mb-1">Social Aesthetic Pulse</p>
                            <p className="text-sm text-white/80 leading-relaxed">{msg.aesthetic}</p>
                          </div>
                        </div>
                      )}

                      {/* NEW: Video Teaser Widget */}
                      {msg.video && (
                        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black relative group">
                          <div className="absolute top-4 left-4 z-10 p-3 bg-black/60 backdrop-blur-md rounded-xl flex items-center gap-3">
                             <Video size={16} className="text-white/60" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Cinema Pulse</span>
                          </div>
                          <iframe 
                            src={msg.video}
                            className="w-full h-[300px] opacity-80 group-hover:opacity-100 transition-opacity"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                    </div>

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
                          href={`https://www.google.com/maps/search/?api=1&query=${msg.destination || 'Travel'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-xl hover:bg-white/20 transition-all duration-500 group border border-white/10"
                        >
                          <MapPin size={16} className="group-hover:rotate-12 transition-transform" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Interactive Map</span>
                        </motion.a>

                        {/* NEW: One-Click Booking Buttons */}
                        <div className="flex w-full gap-4 mt-2">
                           <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={`https://www.skyscanner.net/transport/flights-from/anywhere/to/${msg.destination || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-accent-blue/20 text-accent-blue rounded-2xl hover:bg-accent-blue text-white transition-all duration-500 border border-accent-blue/20"
                          >
                            <Ticket size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Find Best Flights</span>
                          </motion.a>

                          <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={`https://www.booking.com/searchresults.html?ss=${msg.destination || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-accent-purple/20 text-accent-purple rounded-2xl hover:bg-accent-purple text-white transition-all duration-500 border border-accent-purple/20"
                          >
                            <Globe size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Book Elite Hotels</span>
                          </motion.a>
                        </div>
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
        {selectedImage && (
          <div className="mb-6 flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4">
             <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-2xl">
               <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
               <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hover:bg-red-500 transition-colors"
               >
                 <X size={12} className="text-white" />
               </button>
             </div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Vision Mode Active</p>
               <p className="text-xs text-white/40">Atlas is analyzing your image...</p>
             </div>
          </div>
        )}
        <div className="relative group flex items-center gap-3 bg-white/5 border border-white/10 rounded-[32px] pl-10 pr-4 py-4 focus-within:border-white/30 transition-all duration-500 shadow-2xl">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={selectedImage ? "Describe what you want to do here..." : "Message Atlas..."}
            className="flex-1 bg-transparent border-none text-white text-xl focus:outline-none focus:ring-0 font-body placeholder:text-white/10"
            disabled={isLoading}
          />
          
          <div className="flex items-center gap-3">
            <label className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 flex items-center justify-center cursor-pointer transition-all">
              <ImageIcon size={24} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>

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
    </div>
  );
};

export default Chat;
