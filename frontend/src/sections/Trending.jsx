import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrending } from '../services/api';
import { 
  Video, 
  MessageSquare, 
  Globe, 
  PlayCircle,
  TrendingUp,
  Loader2,
  ExternalLink
} from 'lucide-react';

const Trending = ({ onPlanTrip }) => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const data = await getTrending();
        setDestinations(data);
      } catch (err) {
        console.error("Failed to fetch trends", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  return (
    <section id="trending" className="py-32 bg-white text-dark">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-dark/5 p-2 rounded-lg">
                <TrendingUp size={20} className="text-dark/40" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-dark/30">Live Market Pulse</span>
            </div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-6xl md:text-7xl font-heading font-bold mb-8 text-dark tracking-tighter"
            >
              Trending Destinations
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 text-xl font-body leading-relaxed max-w-xl"
            >
              A real-time AI-powered stream of the world's most captivating locations, sourced from global search trends and travel communities.
            </motion.p>
          </div>
        </div>

        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center space-y-6">
            <Loader2 size={40} className="text-dark/20 animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-dark/20">Fetching trending destinations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AnimatePresence>
              {destinations.map((dest, i) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="group relative bg-[#F9F9F9] rounded-[40px] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]"
                >
                  <div className="h-80 overflow-hidden relative">
                    <img 
                      src={dest.image} 
                      alt={dest.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out grayscale-[10%] group-hover:grayscale-0"
                    />
                    
                    {/* Source Tag */}
                    <div className="absolute top-6 left-6 flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20">
                      {dest.source === 'YouTube' ? (
                        <><Video size={12} className="text-red-500" /><span className="text-[10px] font-bold uppercase tracking-wider text-dark/60">🎥 Trending on YouTube</span></>
                      ) : dest.source === 'Reddit' ? (
                        <><MessageSquare size={12} className="text-orange-500" /><span className="text-[10px] font-bold uppercase tracking-wider text-dark/60">💬 Popular on Reddit</span></>
                      ) : (
                        <><Globe size={12} className="text-blue-500" /><span className="text-[10px] font-bold uppercase tracking-wider text-dark/60">🌐 Discovered via Search</span></>
                      )}
                    </div>

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      {dest.link !== '#' && (
                        <a 
                          href={dest.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-dark hover:scale-110 transition-transform shadow-2xl"
                        >
                          <PlayCircle size={24} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="p-10 bg-white">
                    <h3 className="text-3xl font-bold mb-4 font-heading text-dark tracking-tight">{dest.name}</h3>
                    <p className="text-gray-400 mb-8 line-clamp-3 leading-[1.8] font-body text-base font-light">{dest.description}</p>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => onPlanTrip(dest.name)}
                        className="flex-1 py-5 rounded-2xl bg-dark text-white font-bold transition-all duration-300 shadow-xl hover:bg-black hover:shadow-2xl active:scale-95 uppercase tracking-widest text-[10px]"
                      >
                        Plan This Journey →
                      </button>
                      
                      {dest.link !== '#' && (
                        <a 
                          href={dest.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-16 h-16 bg-dark/5 rounded-2xl flex items-center justify-center text-dark/40 hover:bg-dark hover:text-white transition-all duration-300"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default Trending;
