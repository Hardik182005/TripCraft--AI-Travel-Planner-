import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Plane, 
  Wallet, 
  Home, 
  Compass,
  LayoutDashboard
} from 'lucide-react';

const PreferenceGroup = ({ label, icon: Icon, children }) => (
  <div className="space-y-4">
    <label className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
      <Icon size={12} className="text-white/40" /> {label}
    </label>
    <div className="grid grid-cols-2 gap-3">
      {children}
    </div>
  </div>
);

const SelectButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`py-4 px-4 rounded-2xl text-[10px] font-bold transition-all duration-300 border ${
      active 
      ? 'bg-white text-dark shadow-xl border-white scale-[1.02]' 
      : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white border-white/5'
    } uppercase tracking-widest`}
  >
    {children}
  </button>
);

const Preferences = ({ preferences, setPreferences }) => {
  const handleChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="glass-card rounded-[40px] p-10 space-y-12 h-full sticky top-32">
      <div className="flex items-center gap-4 py-4 px-6 bg-white/5 rounded-2xl border border-white/5 opacity-50">
        <LayoutDashboard size={18} className="text-white/40" />
        <span className="text-xs font-bold uppercase tracking-widest text-white/50">Travel Dashboard</span>
      </div>

      <div className="space-y-3">
        <h3 className="text-3xl font-heading font-bold text-white">Your Selections</h3>
        <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Active Preferences</p>
      </div>

      <div className="space-y-10">
        <PreferenceGroup label="Transport" icon={Plane}>
          {['Flight', 'Train', 'Bus', 'Car'].map(m => (
            <SelectButton key={m} active={preferences.transport === m} onClick={() => handleChange('transport', m)}>
              {m}
            </SelectButton>
          ))}
        </PreferenceGroup>

        <PreferenceGroup label="Companion" icon={Users}>
          {['Solo', 'Couple', 'Family', 'Friends'].map(g => (
            <SelectButton key={g} active={preferences.group === g} onClick={() => handleChange('group', g)}>
              {g}
            </SelectButton>
          ))}
        </PreferenceGroup>

        <PreferenceGroup label="Budget" icon={Wallet}>
          {['Economy', 'Standard', 'Premium', 'Elite'].map(b => (
            <SelectButton key={b} active={preferences.budget === b} onClick={() => handleChange('budget', b)}>
              {b}
            </SelectButton>
          ))}
        </PreferenceGroup>

        <PreferenceGroup label="Interest" icon={Compass}>
          {['Culture', 'Food', 'Adventure', 'Beach'].map(i => (
            <SelectButton key={i} active={preferences.interest === i} onClick={() => handleChange('interest', i)}>
              {i}
            </SelectButton>
          ))}
        </PreferenceGroup>
      </div>

      <div className="pt-8 border-t border-white/5">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-4">Master Info</p>
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-white/30 uppercase tracking-widest">Destination</span>
            <span className="text-white">{preferences.destination || 'Not set'}</span>
          </div>
          <div className="flex justify-between text-xs font-bold">
            <span className="text-white/30 uppercase tracking-widest">Duration</span>
            <span className="text-white">{preferences.useCustomDuration ? preferences.customDuration : preferences.duration} Days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
