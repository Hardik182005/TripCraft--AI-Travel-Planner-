import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  MapPin, 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Wallet, 
  Home, 
  Compass,
  ArrowRight
} from 'lucide-react';

const PreferencesScreen = ({ preferences, setPreferences, onComplete, onSkip }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const sections = [
    {
      title: "Where & How Long?",
      render: () => (
        <div className="space-y-10">
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm font-bold text-white/40 uppercase tracking-[0.2em]">
              <MapPin size={16} /> Destination (Optional)
            </label>
            <input 
              type="text" 
              placeholder="e.g. Kyoto, Japan" 
              value={preferences.destination || ''}
              onChange={(e) => handleChange('destination', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-xl focus:outline-none focus:border-white/30 transition-all font-body text-white"
            />
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm font-bold text-white/40 uppercase tracking-[0.2em]">
              <Clock size={16} /> Duration
            </label>
            <div className="flex flex-wrap gap-3">
              {[2, 3, 5, 7, 10].map(d => (
                <button
                  key={d}
                  onClick={() => {
                    handleChange('duration', d);
                    handleChange('useCustomDuration', false);
                  }}
                  className={`py-4 px-8 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    !preferences.useCustomDuration && preferences.duration === d 
                    ? 'bg-white text-dark shadow-xl' 
                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {d} Days
                </button>
              ))}
              <div className="relative group">
                <input 
                  type="number"
                  placeholder="Custom"
                  value={preferences.useCustomDuration ? preferences.customDuration : ''}
                  onChange={(e) => {
                    handleChange('useCustomDuration', true);
                    handleChange('customDuration', e.target.value);
                  }}
                  className="w-32 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/30 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Essentials",
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm font-bold text-white/40 uppercase tracking-[0.2em]">
              Travel Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'Flight', icon: <Plane size={14} />, label: 'Flight' },
                { id: 'Train', icon: <Train size={14} />, label: 'Train' },
                { id: 'Bus', icon: <Bus size={14} />, label: 'Bus' },
                { id: 'Car', icon: <Car size={14} />, label: 'Car' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => handleChange('transport', mode.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl text-xs font-bold transition-all ${
                    preferences.transport === mode.id ? 'bg-white text-dark' : 'bg-white/5 text-white/40'
                  }`}
                >
                  {mode.icon} {mode.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm font-bold text-white/40 uppercase tracking-[0.2em]">
              Travel Group
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Solo', 'Couple', 'Family', 'Friends'].map(g => (
                <button
                  key={g}
                  onClick={() => handleChange('group', g)}
                  className={`p-4 rounded-xl text-xs font-bold transition-all ${
                    preferences.group === g ? 'bg-white text-dark' : 'bg-white/5 text-white/40'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Level of Luxury",
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm font-bold text-white/40 uppercase tracking-[0.2em]">
              Budget
            </label>
            <div className="space-y-2">
              {['Economy', 'Standard', 'Premium', 'Elite'].map(b => (
                <button
                  key={b}
                  onClick={() => handleChange('budget', b)}
                  className={`w-full p-4 rounded-xl text-xs font-bold text-left px-6 transition-all ${
                    preferences.budget === b ? 'bg-white text-dark' : 'bg-white/5 text-white/40'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm font-bold text-white/40 uppercase tracking-[0.2em]">
              Stay Style
            </label>
            <div className="space-y-2">
              {['Hotel', 'Airbnb', 'Resort', 'Boutique'].map(s => (
                <button
                  key={s}
                  onClick={() => handleChange('stay', s)}
                  className={`w-full p-4 rounded-xl text-xs font-bold text-left px-6 transition-all ${
                    preferences.stay === s ? 'bg-white text-dark' : 'bg-white/5 text-white/40'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="min-h-screen pt-40 pb-20 flex flex-col items-center">
      <div className="max-w-[1000px] w-full px-6 text-center space-y-6 mb-20">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-heading font-bold"
        >
          Customize Your Journey
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/40 text-xl font-body"
        >
          Tell us your preferences to craft the perfect trip
        </motion.p>
      </div>

      <div className="max-w-[800px] w-full px-6 flex-1">
        <div className="glass-card rounded-[40px] p-12 space-y-12">
          {sections[activeTab].render()}
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/5 gap-6">
            <div className="flex gap-2">
              {sections.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${activeTab === i ? 'bg-white w-8' : 'bg-white/10'}`} 
                />
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              {activeTab > 0 && (
                <button 
                  onClick={() => setActiveTab(prev => prev - 1)}
                  className="px-6 py-3 text-white/40 font-bold uppercase tracking-widest text-[10px] hover:text-white"
                >
                  Back
                </button>
              )}
              
              {activeTab < sections.length - 1 ? (
                <button 
                  onClick={() => setActiveTab(prev => prev + 1)}
                  className="primary-btn flex items-center gap-3 !px-8"
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <div className="flex gap-4">
                  <button onClick={onSkip} className="px-8 py-4 text-white/40 font-bold uppercase tracking-widest text-[10px] hover:text-white">
                    Skip & Continue
                  </button>
                  <button onClick={onComplete} className="primary-btn !px-10">
                    Start Planning →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreferencesScreen;
