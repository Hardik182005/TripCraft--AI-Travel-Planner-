import React, { useState } from 'react'
import Hero from './sections/Hero'
import Trending from './sections/Trending'
import Chat from './sections/Chat'
import Preferences from './sections/Preferences'
import PreferencesScreen from './sections/PreferencesScreen'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [view, setView] = useState('landing') // 'landing' | 'preferences' | 'active'
  const [initialPrompt, setInitialPrompt] = useState('')
  const [preferences, setPreferences] = useState({
    destination: '',
    budget: 'Standard',
    group: 'Solo',
    transport: 'Flight',
    stay: 'Hotel',
    duration: 5,
    customDuration: '',
    useCustomDuration: false,
    food: 'Local',
    intensity: 'Moderate',
    interest: 'Culture'
  })

  const handleStartPlanning = () => {
    setView('preferences');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleCompletePreferences = () => {
    setView('active');
    if (preferences.destination) {
      setInitialPrompt(`Plan an elite trip to ${preferences.destination}`);
    }
  }

  const handleSkipPreferences = () => {
    setView('active');
  }

  const handlePlanTrip = (destination) => {
    setPreferences(prev => ({ ...prev, destination }));
    setView('active');
    setInitialPrompt(`Plan an elite trip to ${destination}`);
    setTimeout(() => setInitialPrompt(''), 100);
  }

  return (
    <div className="min-h-screen bg-dark overflow-x-hidden selection:bg-white selection:text-dark">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-blue/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent-purple/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 font-body">
        {/* Sticky Header */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 backdrop-blur-md bg-dark/20 border-b border-white/5">
          <div className="container-custom flex justify-between items-center px-0">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setView('landing')}
              className="text-3xl font-heading font-bold text-white tracking-tighter cursor-pointer"
            >
              TripCraft <span className="text-white/20 font-light">AI</span>
            </motion.div>
            
            <nav className="hidden lg:flex gap-16 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
              <span className="hover:text-white transition-all cursor-pointer">Philosophy</span>
              <span className="hover:text-white transition-all cursor-pointer" onClick={() => { setView('landing'); setTimeout(() => document.getElementById('trending')?.scrollIntoView({behavior: 'smooth'}), 100); }}>Trending</span>
              <span className="hover:text-white transition-all cursor-pointer" onClick={() => setView('active')}>Atlas AI</span>
            </nav>

            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-8 py-3 rounded-xl border border-white/10 glass-card text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-dark transition-all"
              onClick={handleStartPlanning}
            >
              Start Planning
            </motion.button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero */}
              <Hero onStart={handleStartPlanning} />
              
              {/* Trending Destinations (Moved ABOVE) */}
              <div id="trending" className="section-spacing bg-white py-32">
                <Trending onPlanTrip={handlePlanTrip} />
              </div>
            </motion.div>
          )}

          {view === 'preferences' && (
            <motion.div 
              key="preferences"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <PreferencesScreen 
                preferences={preferences} 
                setPreferences={setPreferences} 
                onComplete={handleCompletePreferences}
                onSkip={handleSkipPreferences}
              />
            </motion.div>
          )}

          {view === 'active' && (
            <motion.div 
              key="active"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className="container-custom py-40 min-h-screen"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Sidebar (Appears after chat loads) */}
                <aside className="lg:col-span-4 hidden lg:block">
                  <Preferences preferences={preferences} setPreferences={setPreferences} />
                </aside>

                {/* Main Chat Experience */}
                <main className="lg:col-span-8 w-full max-w-[1000px] mx-auto">
                  <Chat 
                    initialPrompt={initialPrompt} 
                    preferences={preferences} 
                  />
                </main>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimalist Footer */}
        <footer className="py-20 bg-black border-t border-white/5 text-center">
            <p className="text-white text-xs font-body tracking-[0.2em] uppercase opacity-40">
              TripCraft AI © 2026
            </p>
        </footer>
      </div>
    </div>
  )
}

export default App
