'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Boss } from '@/types';
import { bossApi } from '@/lib/api';
import LiveTimer from '@/components/LiveTimer';
import EditBossModal from '@/components/EditBossModal';

// Fixed Schedule Data (Monday=1, ..., Sunday=0)
const FIXED_SCHEDULE_DATA = [
  { d: 1, t: '11:30', n: 'Clemantis' }, { d: 1, t: '19:00', n: 'Thymele' },
  { d: 2, t: '11:30', n: 'Saphirus' }, { d: 2, t: '19:00', n: 'Neutro' },
  { d: 3, t: '11:30', n: 'Thymele' }, { d: 3, t: '21:00', n: 'Auraq' },
  { d: 4, t: '11:30', n: 'Neutro' }, { d: 4, t: '19:00', n: 'Clemantis' },
  { d: 5, t: '19:00', n: 'Roderick' }, { d: 5, t: '22:00', n: 'Auraq' },
  { d: 6, t: '15:00', n: 'Milavy' }, { d: 6, t: '17:00', n: 'Ringor' }, { d: 6, t: '22:00', n: 'Chaiflock' },
  { d: 0, t: '17:00', n: 'Saphirus' }, { d: 0, t: '21:00', n: 'Benji' },
];

const getNextFixedSpawn = (bossName: string) => {
  const slots = FIXED_SCHEDULE_DATA.filter(s => bossName.includes(s.n));
  if (slots.length === 0) return null;

  const now = new Date();
  // Fixed UTC+8 for Philippines Time
  const phtOffset = 8 * 60 * 60 * 1000; 
  const nowPHT = new Date(now.getTime() + phtOffset);
  
  let bestDate: Date | null = null;
  let minDiff = Infinity;

  slots.forEach(slot => {
    const [h, m] = slot.t.split(':').map(Number);
    const targetPHT = new Date(Date.UTC(nowPHT.getUTCFullYear(), nowPHT.getUTCMonth(), nowPHT.getUTCDate(), h, m, 0));
    const currentDayIndex = nowPHT.getUTCDay();
    let daysDiff = (slot.d - currentDayIndex + 7) % 7;
    
    // If today and passed, add 7 days
    if (daysDiff === 0 && targetPHT.getTime() < nowPHT.getTime() + 1000) { // +1s buffer
       daysDiff = 7;
    }
    targetPHT.setUTCDate(targetPHT.getUTCDate() + daysDiff);
    
    // Convert back to real UTC timestamp
    const realUtcTime = new Date(targetPHT.getTime() - phtOffset);
    const diff = realUtcTime.getTime() - now.getTime();
    
    if (diff < minDiff) {
       minDiff = diff;
       bestDate = realUtcTime;
    }
  });
  
  return bestDate ? (bestDate as Date).toISOString() : null;
};

// Returns true if boss is in fixed schedule
const isFixedBoss = (name: string) => FIXED_SCHEDULE_DATA.some(f => name.includes(f.n));

export default function BossListClient() {
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [fixedBosses, setFixedBosses] = useState<Boss[]>([]);
  const [filteredBosses, setFilteredBosses] = useState<Boss[]>([]);
  const [activeTab, setActiveTab] = useState<'field' | 'fixed'>('field');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionType, setActionType] = useState<'edit' | 'kill'>('edit');
  
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Check for existing auth on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('guild_boss_auth');
    const savedPassword = localStorage.getItem('guild_boss_password');
    if (authStatus === 'true' && savedPassword) {
      setIsAuthenticated(true);
      setLoginPassword(savedPassword);
    }
  }, []);

  const fetchBosses = useCallback(async () => {
    try {
      const data = await bossApi.getAllBosses();
      
      // Separate Dynamic (DB) from Fixed
      const dynamic = data.filter(b => !isFixedBoss(b.name));
      setBosses(dynamic);

      // Generate Fixed Schedule Bosses
      const uniqueFixedNames = Array.from(new Set(FIXED_SCHEDULE_DATA.map(s => s.n)));
      const generatedFixed: Boss[] = uniqueFixedNames.map((name, idx) => {
          const existing = data.find(b => b.name === name);
          return {
              id: existing ? existing.id : -9000 - idx, // Negative IDs for local
              name: name,
              level: existing ? existing.level : 0,
              location: existing ? existing.location : 'Fixed Event',
              attackType: existing ? existing.attackType : 'melee',
              respawnHours: 0,
              lastKillAt: null,
              nextSpawnAt: getNextFixedSpawn(name),
              isScheduled: true
          };
      });
      
      // Sort by soonest
      generatedFixed.sort((a,b) => {
          if (!a.nextSpawnAt) return 1;
          if (!b.nextSpawnAt) return -1;
          return new Date(a.nextSpawnAt).getTime() - new Date(b.nextSpawnAt).getTime();
      });

      setFixedBosses(generatedFixed);
      setLoading(false);
    } catch (err) {
      setError('Failed to load bosses');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBosses();
      const interval = setInterval(fetchBosses, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchBosses, isAuthenticated]);

  useEffect(() => {
    let filtered = [...bosses];

    if (searchTerm) {
      filtered = filtered.filter((b) => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLocation !== 'all') {
      filtered = filtered.filter((b) => b.location === filterLocation);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((b) => b.attackType === filterType);
    }

    setFilteredBosses(filtered);
  }, [bosses, filterLocation, filterType, searchTerm]);

  const locations = [...new Set(bosses.map((b) => b.location))].sort();

  // Find nearest upcoming boss (checking both dynamic and fixed lists)
  const allForNearest = [...bosses, ...fixedBosses];
  const nearestBoss = allForNearest
    .filter(b => b.nextSpawnAt && new Date(b.nextSpawnAt).getTime() > new Date().getTime())
    .sort((a, b) => new Date(a.nextSpawnAt!).getTime() - new Date(b.nextSpawnAt!).getTime())[0];

  const handleLogin = async () => {
    setLoginError('');
    const isValid = await bossApi.checkPassword(loginPassword);
    if (isValid) {
      localStorage.setItem('guild_boss_auth', 'true');
      localStorage.setItem('guild_boss_password', loginPassword);
      setIsAuthenticated(true);
    } else {
      setLoginError('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('guild_boss_auth');
    localStorage.removeItem('guild_boss_password');
    setIsAuthenticated(false);
    setLoginPassword('');
  };

  const handleEdit = (boss: Boss) => {
    setSelectedBoss(boss);
    setActionType('edit');
    setShowEditModal(true);
  };

  const handleKill = async (boss: Boss) => {
    const password = localStorage.getItem('guild_boss_password');
    if (!password) return;
    
    if (confirm(`Mark ${boss.name} as killed and schedule next spawn?`)) {
      try {
        await bossApi.killBoss(boss.id, password);
        await fetchBosses();
      } catch (err) {
        alert('Failed to mark boss as killed');
      }
    }
  };

  const handleSaveEdit = async (updates: any) => {
    if (!selectedBoss) return;
    const password = localStorage.getItem('guild_boss_password');
    if (!password) return;

    try {
      await bossApi.updateBoss(selectedBoss.id, password, updates);
      await fetchBosses();
      setSelectedBoss(null);
    } catch (err) {
      throw err;
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/10 ring-1 ring-white/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-purple-500/30 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <span className="text-4xl">⚔️</span>
              </div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-3 tracking-tight">
                Guild Boss
              </h1>
              <p className="text-blue-200/80 font-medium">Secure Access Required</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-blue-200/70 uppercase tracking-wider mb-2 ml-1">
                  Access Code
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-blue-300/50">🔒</span>
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full pl-10 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 group-hover/input:bg-black/30"
                    placeholder="Enter guild password..."
                    autoFocus
                  />
                </div>
              </div>
              
              {loginError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-shake">
                  <span>🚫</span> {loginError}
                </div>
              )}
              
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                Enter Dashboard
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-xs text-blue-200/40">
                Authorized Personnel Only • Secure Session
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <div className="text-xl text-purple-200/80 font-medium animate-pulse">Summoning Data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="text-xl text-red-400 bg-red-900/20 px-6 py-4 rounded-xl border border-red-900/50">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-slate-950 text-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-xl">⚔️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                  Guild Boss Timer
                </h1>
              </div>
            </div>
            <div className="flex gap-3">
               <button
                onClick={() => setActiveTab('field')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 border flex items-center gap-2 ${
                  activeTab === 'field' 
                  ? 'bg-purple-500/20 text-purple-200 border-purple-500/40' 
                  : 'bg-transparent text-slate-400 border-transparent hover:bg-white/5'
                }`}
              >
                <span>⚔️</span> <span className="hidden sm:inline">Field</span>
              </button>
               <button
                onClick={() => setActiveTab('fixed')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 border flex items-center gap-2 ${
                  activeTab === 'fixed' 
                  ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40' 
                  : 'bg-transparent text-slate-400 border-transparent hover:bg-white/5'
                }`}
              >
                <span>📅</span> <span className="hidden sm:inline">Fixed</span>
              </button>

              <div className="w-px h-8 bg-white/10 mx-1" />

              <Link
                href="/calendar"
                className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 px-4 py-2 rounded-lg transition-all duration-200 border border-purple-500/20 hover:border-purple-500/40 flex items-center gap-2"
              >
                <span>📅</span> <span className="hidden sm:inline">Calendar</span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-300 px-4 py-2 rounded-lg transition-all duration-200 border border-red-500/20 hover:border-red-500/40 flex items-center gap-2"
              >
                <span>🚪</span> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Nearest Boss Hero Section */}
        {nearestBoss && (
          <div className="mb-12 relative overflow-hidden rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl shadow-purple-900/40 group hover:border-purple-500/50 transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm" />
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
            
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-200 text-sm font-semibold border border-red-500/30 mb-6 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
                  <span>🚨</span> NEXT TARGET DETECTED
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                  <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-blue-200 drop-shadow-2xl">
                    {nearestBoss.name}
                  </h2>
                  <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/50 transition-all duration-500">
                      <img 
                        src={`/bosses/${nearestBoss.name.toLowerCase()}.png`}
                        alt={nearestBoss.name}
                        className="w-full h-full object-cover transform scale-110 hover:scale-100 transition-transform duration-700"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                      />
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-lg text-slate-300 font-medium">
                  <span className="flex items-center gap-2 bg-slate-800/60 px-5 py-2.5 rounded-xl border border-white/5 shadow-lg backdrop-blur-md">
                    <span className="text-blue-400">📍</span> {nearestBoss.location}
                  </span>
                  <span className="flex items-center gap-2 bg-slate-800/60 px-5 py-2.5 rounded-xl border border-white/5 shadow-lg backdrop-blur-md">
                    <span className="text-purple-400">⚔️</span> Lv {nearestBoss.level}
                  </span>
                  <span className={`flex items-center gap-2 bg-slate-800/60 px-5 py-2.5 rounded-xl border border-white/5 shadow-lg backdrop-blur-md`}>
                     {nearestBoss.attackType === 'melee' ? '🛡️' : '✨'} {nearestBoss.attackType}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center relative">
                 <div className="absolute inset-0 bg-purple-500/20 blur-[50px] rounded-full"></div>
                <div className="text-sm text-purple-200 uppercase tracking-[0.2em] mb-4 font-bold text-shadow-glow">Target Arriving In</div>
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl min-w-[320px] text-center transform hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50"></div>
                  <div className="text-5xl font-mono font-bold relative z-10 tracking-wider">
                    <LiveTimer boss={nearestBoss} />
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
                    <div className="text-purple-300/60 text-xs uppercase tracking-widest font-semibold mb-1">Estimated Arrival</div>
                    <div className="text-purple-100 font-mono text-lg">
                      {new Date(nearestBoss.nextSpawnAt!).toLocaleString([], { 
                        weekday: 'short', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats & Filters (Field Tab) */}
        {activeTab === 'field' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Card */}
          <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">📊</span>
            </div>
            <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-2">Active Targets</h3>
            <div className="text-4xl font-bold text-white mb-1">{bosses.length}</div>
            <div className="text-purple-300 text-sm">Bosses Tracked</div>
          </div>

          {/* Search & Filters */}
          <div className="lg:col-span-3 bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/3 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 group-focus-within:text-purple-400 transition-colors">🔍</span>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder="Search bosses..."
              />
            </div>

            <div className="w-full md:w-1/3">
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none cursor-pointer hover:bg-black/30 transition-colors"
                style={{ backgroundImage: 'none' }}
              >
                <option value="all">📍 All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>📍 {loc}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-1/3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none cursor-pointer hover:bg-black/30 transition-colors"
              >
                <option value="all">⚡ All Types</option>
                <option value="melee">⚔️ Melee</option>
                <option value="magic">✨ Magic</option>
              </select>
            </div>
          </div>
        </div>
        )}

        {/* Fixed Event Schedule (Fixed Tab) */}
        {activeTab === 'fixed' && fixedBosses.length > 0 && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-bold text-slate-200 mb-6 pl-2 border-l-4 border-yellow-500/50 flex items-center gap-3">
              <span className="text-2xl">📅</span> Fixed Event Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {fixedBosses.map((boss) => (
                <div key={boss.id} className="group bg-slate-800/30 backdrop-blur-md rounded-2xl p-1 border border-white/5 hover:border-yellow-500/30 hover:bg-slate-800/50 transition-all duration-300 relative overflow-hidden">
                   {/* Card Gradient */}
                   <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-yellow-500/0 to-orange-500/0 group-hover:via-yellow-500/5 transition-all duration-500" />
                   
                   {/* Boss Image Background */}
                   <div className="absolute inset-0 z-0">
                      <img 
                        src={`/bosses/${boss.name.toLowerCase()}.png`}
                        alt={boss.name}
                        className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-500 grayscale group-hover:grayscale-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/30" />
                   </div>

                   <div className="p-5 relative z-10 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-slate-100 group-hover:text-yellow-200 transition-colors">{boss.name}</h3>
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-200 border border-yellow-500/20 rounded text-xs font-semibold">Fixed</span>
                      </div>
                      
                      <div className="pt-4 mt-auto border-t border-white/5">
                        {boss.nextSpawnAt ? (
                          <div className="mb-4">
                            <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Time Remaining</div>
                            <div className="text-2xl font-mono text-yellow-100 font-bold tracking-tight">
                              <LiveTimer boss={boss} />
                            </div>
                            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                               <span>📅</span>
                               {new Date(boss.nextSpawnAt).toLocaleString([], { weekday:'short', hour:'2-digit', minute:'2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-500 italic">No scheduled spawn</div>
                        )}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Field Bosses (Field Tab) */}
        {activeTab === 'field' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-slate-200 mb-6 pl-2 border-l-4 border-purple-500/50 flex items-center gap-3">
            <span className="text-2xl">⚔️</span> Field Bosses
          </h3>

          {/* Boss Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBosses.map((boss) => (
              <div
                key={boss.id}
                className="group bg-slate-800/30 backdrop-blur-md rounded-2xl p-1 border border-white/5 hover:border-purple-500/30 hover:bg-slate-800/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Card Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-blue-500/0 group-hover:via-purple-500/10 transition-all duration-500" />

                {/* Boss Image Background */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={`/bosses/${boss.name.toLowerCase()}.png`}
                    alt={boss.name}
                    className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-500 grayscale group-hover:grayscale-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/30" />
                </div>

                <div className="p-5 relative z-10 h-full flex flex-col">
                  {/* Top Section: Info & Thumbnail */}
                  <div className="flex justify-between gap-4 mb-6 flex-grow">
                     <div className="flex-1 min-w-0"> {/* min-w-0 needed for text truncation to work in flex child */}
                        <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-purple-200 transition-colors truncate">{boss.name}</h3>
                        
                        <div className="flex gap-2 text-xs font-semibold mb-4">
                          <span className={`px-2 py-1 rounded-md border ${
                            boss.attackType === 'melee' 
                              ? 'bg-orange-500/10 text-orange-200 border-orange-500/20' 
                              : 'bg-blue-500/10 text-blue-200 border-blue-500/20'
                          }`}>
                            {boss.attackType === 'melee' ? '⚔️' : '✨'} {boss.attackType}
                          </span>
                          <span className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-md border border-slate-600/50">
                            Lv {boss.level}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-sm text-slate-400">
                            <span className="text-base mt-0.5">📍</span>
                            <span className="font-medium text-slate-300 leading-snug break-words">{boss.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="text-base">⏱️</span>
                            <span>Respawn: <span className="text-slate-300">{boss.respawnHours}h</span></span>
                          </div>
                        </div>
                     </div>

                     <div className="flex flex-col items-end gap-3">
                         <div className="w-3 h-3 rounded-full bg-slate-700 shadow-inner group-hover:bg-purple-500/50 transition-colors" />
                         <div className="w-36 h-36 rounded-xl overflow-hidden border-2 border-white/10 shadow-lg bg-black/40">
                             <img 
                                src={`/bosses/${boss.name.toLowerCase()}.png`}
                                alt={boss.name}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                              />
                         </div>
                     </div>
                  </div>
                  
                  <div className="pt-4 mt-auto border-t border-white/5">
                    {boss.nextSpawnAt ? (
                      <div className="mb-4">
                        <div className="flex justify-between items-end mb-1">
                          <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Time Remaining</div>
                           <div className="text-xs text-slate-400 font-mono">
                            {new Date(boss.nextSpawnAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <LiveTimer boss={boss} />
                      </div>
                    ) : (
                      <div className="mb-4 text-amber-300 font-semibold flex items-center gap-2 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        <span>⏳</span> Not Scheduled
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(boss)}
                        className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-2 pl-2 pr-3 rounded-lg text-sm font-medium transition-all duration-200 border border-white/5 hover:border-white/20 flex items-center justify-center gap-2 group/btn"
                      >
                        <span className="group-hover/btn:rotate-12 transition-transform">✏️</span> Edit
                      </button>
                      <button
                        onClick={() => handleKill(boss)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-2 pl-2 pr-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-purple-900/20 hover:shadow-purple-500/30 flex items-center justify-center gap-2 group/btn"
                      >
                        <span className="group-hover/btn:animate-bounce">⚔️</span> Kill
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {filteredBosses.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <span className="text-5xl opacity-50">🔍</span>
            </div>
            <h3 className="text-2xl text-slate-300 font-bold mb-2">No bosses found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* Modals */}
      {showEditModal && selectedBoss && (
        <EditBossModal
          isOpen={showEditModal}
          boss={selectedBoss}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBoss(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
