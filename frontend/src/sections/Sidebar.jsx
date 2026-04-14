import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  History, 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Volume2, 
  UserCircle,
  ShieldCheck,
  Zap,
  Trash2,
  Bookmark,
  Info,
  Layers,
  Sparkles,
  CheckCircle2,
  Utensils
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, preferences, setPreferences, theme, toggleTheme }) => {
  const [savedTrips, setSavedTrips] = useState([]);

  useEffect(() => {
    const trips = JSON.parse(localStorage.getItem('tripcraft_vault') || '[]');
    setSavedTrips(trips);
  }, [isOpen]);

  const deleteTrip = (id) => {
    const updated = savedTrips.filter(t => t.id !== id);
    localStorage.setItem('tripcraft_vault', JSON.stringify(updated));
    setSavedTrips(updated);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[450px] bg-[#0A0A0A] border-l border-white/5 z-[101] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <SettingsIcon size={24} className="text-white/40" />
                </div>
                <h2 className="text-2xl font-heading font-bold tracking-tight text-white">The Command Center</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {/* Theme & Mode Switcher */}
              <section className="space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Interface Aesthetic</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'bg-white text-dark border-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                    <Moon size={24} />
                    <span className="text-xs font-bold uppercase tracking-widest">Stealth Black</span>
                  </button>
                  <button 
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'bg-[#F5F5F7] text-dark border-dark' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                    <Sun size={24} />
                    <span className="text-xs font-bold uppercase tracking-widest">Elite White</span>
                  </button>
                </div>
              </section>

              {/* Voice Architect Settings */}
              <section className="space-y-6">
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Atlas Voice Architect</p>
                 <div className="space-y-3">
                    {[
                      { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', desc: 'Elite Sales Agent (Standard)', icon: '🤵' },
                      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', desc: 'Soft Elegance (Calm)', icon: '🎙️' },
                      { id: 'pMs7uSoxq6IG76ZMo7vW', name: 'Alfie', desc: 'British Gentleman (Formal)', icon: '🇬🇧' }
                    ].map(v => (
                       <button 
                        key={v.id}
                        onClick={() => setPreferences(prev => ({ ...prev, voice_id: v.id }))}
                        className={`w-full p-5 rounded-2xl border flex items-center justify-between group transition-all ${preferences.voice_id === v.id ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                       >
                         <div className="flex items-center gap-4">
                            <span className="text-2xl">{v.icon}</span>
                            <div className="text-left">
                               <p className="text-sm font-bold text-white">{v.name}</p>
                               <p className="text-[10px] text-white/40 uppercase tracking-widest">{v.desc}</p>
                            </div>
                         </div>
                         {preferences.voice_id === v.id && <Zap size={16} className="text-accent-blue" />}
                       </button>
                    ))}
                 </div>
              </section>

              {/* Personality Engine */}
               <section className="space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">AI Personality Engine</p>
                <div className="flex flex-wrap gap-2">
                  {['Professional', 'Storyteller', 'Minimalist'].map(p => (
                    <button 
                      key={p}
                      onClick={() => setPreferences(prev => ({ ...prev, personality: p }))}
                      className={`px-6 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${preferences.personality === p ? 'bg-white text-dark border-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/20'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </section>

              {/* The Vault: Saved Itineraries */}
              <section className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">The Itinerary Vault</p>
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-white/40">{savedTrips.length} Saved</span>
                </div>
                
                <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/40 mb-2">
                <Utensils size={14} className="text-accent-blue" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Dietary Architect</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'veg', label: 'Vegetarian' },
                  { id: 'non-veg', label: 'Non-Veg' },
                  { id: 'egg', label: 'Eggitarian' },
                  { id: 'jain', label: 'Jain' }
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onPreferenceChange({ ...preferences, dietary: d.id })}
                    className={`h-12 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                      preferences.dietary === d.id 
                      ? 'bg-white text-dark border-white shadow-lg' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
                  {savedTrips.length === 0 ? (
                    <div className="p-10 border border-dashed border-white/10 rounded-3xl text-center">
                       <History size={32} className="mx-auto text-white/10 mb-4" />
                       <p className="text-xs text-white/20 uppercase tracking-widest">Vault is currently empty</p>
                    </div>
                  ) : (
                    savedTrips.map(trip => (
                      <div 
                        key={trip.id}
                        className="group relative p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-white/20 transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="text-lg font-bold text-white pr-8">{trip.destination}</h4>
                           <button 
                            onClick={(e) => { e.stopPropagation(); deleteTrip(trip.id); }}
                            className="p-2 text-white/20 hover:text-red-500 transition-colors"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">{trip.date}</p>
                        <div className="mt-4 flex gap-2">
                           <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] text-white/60 font-bold uppercase tracking-widest">
                             {trip.budget}
                           </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Footer Status */}
            <div className="p-10 bg-white/[0.01] border-t border-white/5 text-center">
               <div className="flex items-center justify-center gap-3 text-emerald-400">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Atlas Security Active</span>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
