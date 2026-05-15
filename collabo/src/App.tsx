/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, 
  Search, 
  MapPin, 
  Calendar, 
  CreditCard, 
  ArrowRight, 
  Home, 
  Navigation, 
  User, 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  Smartphone,
  ShieldCheck,
  Circle,
  Settings,
  Bell,
  History,
  LogOut,
  ChevronRight,
  TrendingUp,
  Award,
  Fingerprint,
  Mail,
  Lock,
  UserPlus,
  Check,
  Camera,
  Shield,
  Gift,
  Ticket,
  Map as MapIcon,
  Plus,
  Minus
} from 'lucide-react';

// --- Types ---
type Screen = 'splash' | 'login' | 'register' | 'home' | 'destination' | 'buses' | 'tracking' | 'booking' | 'payment' | 'tapgo' | 'success' | 'profile' | 'liveMap' | 'loading';

interface UserProfile {
  name: string;
  email: string;
  walletBalance: number;
  tripsCount: number;
  points: number;
  role: 'member' | 'admin';
}

interface BusInfo {
  id: string;
  route: string;
  name: string;
  eta: number;
  seats: number;
  duration: number;
  fare: number;
  type: 'express' | 'local' | 'night';
}

// --- Data ---
const BUSES: BusInfo[] = [
  { id: '1', route: '14B', name: 'Express — CBD Direct', eta: 3, seats: 12, duration: 22, fare: 400, type: 'express' },
  { id: '2', route: '22', name: 'Via Remera', eta: 8, seats: 28, duration: 35, fare: 350, type: 'local' },
  { id: '3', route: '7A', name: 'Local Stopper', eta: 14, seats: 5, duration: 48, fare: 300, type: 'local' },
  { id: '4', route: '31C', name: 'Night Route', eta: 22, seats: 41, duration: 30, fare: 400, type: 'night' },
];

const RECENT_DESTINATIONS = [
  { name: 'CBD Kigali', addr: 'City centre, KN 4 Ave', time: '2h ago', icon: <MapPin className="w-4 h-4 text-green-600" />, bg: 'bg-green-50' },
  { name: 'Kimironko Market', addr: 'KG 11 Ave, Gasabo', time: 'Yesterday', icon: <Home className="w-4 h-4 text-teal-600" />, bg: 'bg-teal-50' },
  { name: 'Kigali Convention Centre', addr: 'KG 2 Roundabout', time: 'Mon', icon: <Navigation className="w-4 h-4 text-green-600" />, bg: 'bg-green-50' },
  { name: 'Nyabugogo Terminal', addr: 'Main bus station', time: 'Sat', icon: <Bus className="w-4 h-4 text-green-700" />, bg: 'bg-green-100' },
];

const TAKEN_SEATS = [1, 2, 5, 9, 13, 17, 18, 21, 25, 28, 30, 33];

// --- Sub-components (Screens) ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedBus, setSelectedBus] = useState<BusInfo | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'mtn' | 'airtel'>('wallet');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    const checkAuth = () => {
      const savedUser = localStorage.getItem('greenroot_user');
      if (savedUser) {
        setUserProfile(JSON.parse(savedUser));
        if (screen === 'splash' || screen === 'login' || screen === 'register' || screen === 'loading') {
          setScreen('home');
        }
      } else {
        setUserProfile(null);
        if (screen !== 'splash' && screen !== 'register') {
          setScreen('login');
        }
      }
      setLoading(false);
    };

    const timer = setTimeout(checkAuth, 1000);
    return () => clearTimeout(timer);
  }, [screen]);

  const goTo = (s: Screen) => setScreen(s);

  // Transitions for screen changes
  const screenVariants = {
    enter: { x: 20, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-600">
        <Bus size={64} className="text-white animate-bounce" />
      </div>
    );
  }

  const showNav = !['splash', 'login', 'register', 'loading'].includes(screen);

  return (
    <div className="web-container">
      {showNav && <Navbar screen={screen} goTo={goTo} userProfile={userProfile} />}
      
      <main className={`${showNav ? 'pt-20 pb-12' : ''} flex-1 flex flex-col`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={screenVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`flex-1 flex flex-col ${showNav ? 'content-area' : ''}`}
          >
            {screen === 'splash' && <SplashScreen onStart={() => goTo('login')} />}
            {screen === 'login' && <LoginScreen onLogin={() => goTo('home')} onGoToRegister={() => goTo('register')} />}
            {screen === 'register' && <RegisterScreen onGoToLogin={() => goTo('login')} />}
            {screen === 'home' && userProfile && <HomeScreen name={userProfile.name} onNavigate={goTo} onSelectBus={(bus) => { setSelectedBus(bus); goTo('tracking'); }} />}
            {screen === 'liveMap' && (
              <LiveMapScreen onBack={() => setScreen('home')} />
            )}
            {screen === 'destination' && <DestinationScreen onBack={() => goTo('home')} onSelect={() => goTo('buses')} />}
            {screen === 'buses' && <BusesScreen onBack={() => goTo('destination')} onSelectBus={(bus) => { setSelectedBus(bus); goTo('tracking'); }} />}
            {screen === 'tracking' && <TrackingScreen bus={selectedBus || BUSES[0]} onBack={() => goTo('home')} onBook={() => goTo('booking')} />}
            {screen === 'booking' && <BookingScreen bus={selectedBus || BUSES[0]} onBack={() => goTo('tracking')} onContinue={() => goTo('payment')} selectedSeat={selectedSeat} setSelectedSeat={setSelectedSeat} />}
            {screen === 'payment' && <PaymentScreen onBack={() => goTo('booking')} onPay={() => goTo('tapgo')} selectedSeat={selectedSeat} method={paymentMethod} setMethod={setPaymentMethod} profile={userProfile} />}
            {screen === 'tapgo' && userProfile && <TapGoScreen name={userProfile.name} onBack={() => goTo('payment')} onBoard={() => goTo('success')} selectedSeat={selectedSeat} />}
            {screen === 'success' && userProfile && <SuccessScreen name={userProfile.name} onDone={() => goTo('home')} selectedSeat={selectedSeat} />}
            {screen === 'profile' && userProfile && <ProfileScreen profile={userProfile} onBack={() => goTo('home')} onNavigate={goTo} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile-only bottom nav fallback */}
      {showNav && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md h-16 bg-white/80 backdrop-blur-xl border border-white/20 flex items-center justify-around px-4 z-50 rounded-2xl shadow-2xl">
          <button 
            className={`flex flex-col items-center gap-1 ${screen === 'home' ? 'text-green-600' : 'text-slate-400'}`}
            onClick={() => goTo('home')}
          >
            <Home size={20} strokeWidth={screen === 'home' ? 2.5 : 2} />
          </button>
          <button className={`flex flex-col items-center gap-1 ${screen === 'liveMap' ? 'text-green-600' : 'text-slate-400'}`} onClick={() => goTo('liveMap')}>
            <MapIcon size={20} />
          </button>
          <button className={`flex flex-col items-center gap-1 ${screen === 'destination' ? 'text-green-600' : 'text-slate-400'}`} onClick={() => goTo('destination')}>
            <Search size={20} />
          </button>
          <button className={`flex flex-col items-center gap-1 ${screen === 'tracking' ? 'text-green-600' : 'text-slate-400'}`} onClick={() => goTo('tracking')}>
            <Navigation size={20} />
          </button>
          <button 
            className={`flex flex-col items-center gap-1 ${screen === 'profile' ? 'text-green-600' : 'text-slate-400'}`}
            onClick={() => goTo('profile')}
          >
            <User size={20} strokeWidth={screen === 'profile' ? 2.5 : 2} />
          </button>
        </div>
      )}
    </div>
  );
}

function Navbar({ screen, goTo, userProfile }: { screen: Screen, goTo: (s: Screen) => void, userProfile: UserProfile | null }) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div 
            onClick={() => goTo('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-600/20 group-hover:scale-105 transition-transform">
              <Bus size={24} strokeWidth={1.5} />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-slate-900">Greenroot</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <NavButton active={screen === 'home'} onClick={() => goTo('home')} icon={<Home size={18} />} label="Dashboard" />
            <NavButton active={screen === 'liveMap'} onClick={() => goTo('liveMap')} icon={<MapIcon size={18} />} label="Live Map" />
            <NavButton active={screen === 'destination' || screen === 'buses'} onClick={() => goTo('destination')} icon={<Search size={18} />} label="Find Bus" />
            <NavButton active={screen === 'tracking'} onClick={() => goTo('tracking')} icon={<Navigation size={18} />} label="Live Tracking" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-slate-800">{userProfile?.name}</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Gold Member</span>
          </div>
          <button 
            onClick={() => goTo('profile')}
            className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden hover:ring-4 hover:ring-green-50 transition-all active:scale-95"
          >
            {userProfile ? (
              <span className="font-bold text-sm text-green-600">{userProfile.name.substring(0, 2).toUpperCase()}</span>
            ) : (
              <User size={20} className="text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
        active 
          ? 'bg-green-50 text-green-700 shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// --- Screen Components ---

function SplashScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-600 p-8">
      <div className="max-w-md w-full flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 mb-10 bg-white/10 rounded-[40px] flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          <Bus size={64} strokeWidth={1} className="text-white" />
        </motion.div>
        
        <h1 className="text-6xl font-black font-display text-white mb-4 tracking-tighter">Greenroot</h1>
        <p className="text-xl text-green-100/60 font-medium mb-16 tracking-tight">Your city transit, reimagined for the modern web.</p>
        
        <button 
          onClick={onStart}
          className="w-full bg-white text-green-700 py-6 rounded-[24px] font-black text-xl shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] hover:bg-green-50 active:scale-95 transition-all mb-8"
        >
          Begin Journey
        </button>
        
        <div className="flex justify-center gap-3 opacity-20">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onGoToRegister }: { onLogin: () => void, onGoToRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = () => {
    // Simulate Google Login
    const mockUser: UserProfile = {
      name: 'John Doe',
      email: 'john@example.com',
      walletBalance: 2500,
      tripsCount: 12,
      points: 1540,
      role: 'member'
    };
    localStorage.setItem('greenroot_user', JSON.stringify(mockUser));
    onLogin();
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) return;
    setIsLoggingIn(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockUser: UserProfile = {
        name: 'Traveler',
        email: email,
        walletBalance: 12400,
        tripsCount: 45,
        points: 4200,
        role: 'member'
      };
      localStorage.setItem('greenroot_user', JSON.stringify(mockUser));
      setIsLoggingIn(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-green-500/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 blur-[120px] rounded-full -ml-20 -mb-20"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-[60px] p-12 shadow-2xl border-8 border-white shadow-slate-200/50 flex flex-col items-center relative z-10"
      >
        <div className="w-20 h-20 bg-green-600 rounded-[28px] flex items-center justify-center text-white mb-10 shadow-xl shadow-green-600/20">
           <Bus size={40} />
        </div>
        
        <h2 className="text-4xl font-black font-display text-slate-900 tracking-tight mb-2">Welcome Back</h2>
        <p className="text-slate-400 font-medium mb-12">Log in to manage your city transit</p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full p-5 bg-slate-50 rounded-[24px] border-2 border-transparent focus:border-green-500 focus:bg-white outline-none transition-all font-bold"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full p-5 bg-slate-50 rounded-[24px] border-2 border-transparent focus:border-green-500 focus:bg-white outline-none transition-all font-bold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs font-bold px-4">{error}</p>}
          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[24px] font-black text-lg transition-all active:scale-95 shadow-xl shadow-slate-900/20"
          >
            {isLoggingIn ? 'Verifying...' : 'Log In'}
          </button>
        </form>

        <div className="flex items-center gap-4 w-full my-8">
           <div className="h-px bg-slate-100 flex-1"></div>
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or</span>
           <div className="h-px bg-slate-100 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border-2 border-slate-100 py-5 rounded-[24px] flex items-center justify-center gap-4 hover:bg-slate-50 transition-all font-black text-slate-700 active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6" alt="Google" />
          Sign in with Google
        </button>

        <p className="mt-10 text-sm font-bold text-slate-400">
          New to Greenroot? <button onClick={onGoToRegister} className="text-green-600 hover:underline">Register now</button>
        </p>
      </motion.div>
    </div>
  );
}

function RegisterScreen({ onGoToLogin }: { onGoToLogin: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !email || !password) return;
    setIsRegistering(true);
    
    // Simulate registration
    setTimeout(() => {
      const mockUser: UserProfile = {
        name,
        email,
        walletBalance: 2000,
        tripsCount: 0,
        points: 500,
        role: 'member'
      };
      localStorage.setItem('greenroot_user', JSON.stringify(mockUser));
      setIsRegistering(false);
      onGoToLogin();
    }, 1500);
  };

  const handleGoogleLogin = () => {
    // Simulate Google Login
    const mockUser: UserProfile = {
      name: 'User',
      email: 'user@example.com',
      walletBalance: 2000,
      tripsCount: 0,
      points: 500,
      role: 'member'
    };
    localStorage.setItem('greenroot_user', JSON.stringify(mockUser));
    onGoToLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-green-500/5 blur-[120px] rounded-full -ml-20 -mt-20"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-[60px] p-12 shadow-2xl border-8 border-white shadow-slate-200/50 flex flex-col items-center relative z-10"
      >
        <h2 className="text-4xl font-black font-display text-slate-900 tracking-tight mb-2">Create Account</h2>
        <p className="text-slate-400 font-medium mb-12 text-center px-8">Join the fastest growing public transport network in Kigali</p>

        <form onSubmit={handleRegister} className="w-full space-y-4">
          <input 
            type="text" 
            placeholder="Full Name"
            className="w-full p-5 bg-slate-50 rounded-[24px] border-2 border-transparent focus:border-green-500 focus:bg-white outline-none transition-all font-bold"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full p-5 bg-slate-50 rounded-[24px] border-2 border-transparent focus:border-green-500 focus:bg-white outline-none transition-all font-bold"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full p-5 bg-slate-50 rounded-[24px] border-2 border-transparent focus:border-green-500 focus:bg-white outline-none transition-all font-bold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs font-bold px-4">{error}</p>}
          <button 
            type="submit"
            disabled={isRegistering}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-[24px] font-black text-lg transition-all active:scale-95 shadow-xl shadow-green-600/20"
          >
            {isRegistering ? 'Creating...' : 'Register'}
          </button>
        </form>

        <div className="flex items-center gap-4 w-full my-8">
           <div className="h-px bg-slate-100 flex-1"></div>
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or</span>
           <div className="h-px bg-slate-100 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border-2 border-slate-100 py-5 rounded-[24px] flex items-center justify-center gap-4 hover:bg-slate-50 transition-all font-black text-slate-700 active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6" alt="Google" />
          Sign up with Google
        </button>

        <p className="mt-10 text-sm font-bold text-slate-400">
          Already have an account? <button onClick={onGoToLogin} className="text-green-600 hover:underline">Log in</button>
        </p>
      </motion.div>
    </div>
  );
}

function HomeScreen({ name, onNavigate, onSelectBus }: { name: string, onNavigate: (s: Screen) => void, onSelectBus: (b: BusInfo) => void }) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-display tracking-tight text-slate-900 mb-2">
            Welcome, {name}
          </h1>
          <p className="text-slate-500 font-medium max-w-md">
            Ready for your next journey? Track your bus or book a new trip instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
             {[1, 2, 3].map(i => (
               <div key={i} className="w-10 h-10 rounded-xl border-4 border-slate-50 bg-slate-200 flex items-center justify-center overflow-hidden">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
               </div>
             ))}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">
            2.4k others commuting now
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickCard 
          icon={<MapIcon size={28} className="text-green-600" />} 
          label="Live Network Map" 
          sub="Fleet-wide view" 
          onClick={() => onNavigate('liveMap')} 
          bg="bg-green-600 !text-white"
          large
        />
        <QuickCard 
          icon={<Calendar size={28} className="text-teal-600" />} 
          label="Book Seats" 
          sub="Reserve future trips" 
          onClick={() => onNavigate('destination')} 
          bg="bg-teal-50"
          large
        />
        <QuickCard 
          icon={<Clock size={28} className="text-emerald-700" />} 
          label="Arrival ETAs" 
          sub="Real-time schedules" 
          onClick={() => onNavigate('buses')} 
          bg="bg-emerald-50"
          large
        />
        <QuickCard 
          icon={<CreditCard size={28} className="text-green-600" />} 
          label="Smart Wallet" 
          sub="RWF 12,400 Balance" 
          onClick={() => onNavigate('payment')} 
          bg="bg-slate-100/50"
          large
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold font-display text-slate-900 leading-none">Recommended Buses</h3>
            <button 
              onClick={() => onNavigate('buses')}
              className="text-sm font-bold text-green-600 hover:text-green-700 underline"
            >
              See all routes
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BUSES.slice(0, 4).map(bus => (
              <div key={bus.id} onClick={() => onSelectBus(bus)} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:border-green-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-bold text-green-600 mb-1 uppercase tracking-tighter">Route {bus.route}</div>
                    <div className="font-bold text-slate-900 group-hover:text-green-700 transition-colors">{bus.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 mb-1 text-[10px] font-bold text-red-500 uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                      Live
                    </div>
                    <div className="text-2xl font-black text-slate-900 leading-none">{bus.eta}m</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-4">
                  <span className="flex items-center gap-1"><User size={12} /> {bus.seats} seats</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {bus.duration}m ride</span>
                  <span className="ml-auto text-green-700">RWF {bus.fare}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold font-display text-slate-900 leading-none">Recent Trips</h3>
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-green-500/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <History size={24} className="text-green-400" />
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">View All</button>
              </div>
              <div className="space-y-4">
                {RECENT_DESTINATIONS.slice(0, 3).map((dest, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1 transition-all group-hover:scale-150"></div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{dest.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase">{dest.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                   <TrendingUp className="text-teal-600" size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points earned</p>
                   <p className="text-lg font-black text-slate-900">+1.2k this month</p>
                </div>
             </div>
             <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-bold text-slate-800 transition-colors">
                View Rewards
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickCard({ icon, label, sub, onClick, bg, large }: { icon: React.ReactNode, label: string, sub: string, onClick: () => void, bg: string, large?: boolean }) {
  return (
    <div 
      onClick={onClick} 
      className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-6 hover:border-green-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group"
    >
      <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold text-slate-900 group-hover:text-green-700 transition-colors">{label}</div>
        <div className="text-xs text-slate-400 font-medium group-hover:text-slate-500 transition-colors">{sub}</div>
      </div>
    </div>
  );
}

function DestinationScreen({ onBack, onSelect }: { onBack: () => void, onSelect: () => void }) {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 transition-colors"><ChevronLeft size={32} /></button>
        <h2 className="text-5xl font-black font-display text-slate-900 tracking-tight">Where to?</h2>
      </div>
      
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={24} />
        <input 
          className="w-full bg-white border-2 border-slate-100 rounded-[32px] py-6 pl-16 pr-8 text-xl text-slate-900 placeholder:text-slate-300 focus:border-green-500 focus:ring-0 transition-all shadow-xl shadow-slate-200/50"
          placeholder="Enter destination, street or landmark..."
          autoFocus
          onChange={(e) => { if(e.target.value.length > 2) setTimeout(onSelect, 800) }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Recent Destinations</p>
          <div className="flex flex-col gap-4">
            {RECENT_DESTINATIONS.map((dest, i) => (
              <div key={i} onClick={onSelect} className="flex items-center gap-5 p-4 hover:bg-white hover:shadow-xl hover:scale-[1.02] rounded-3xl transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                <div className={`w-12 h-12 ${dest.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {dest.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-lg group-hover:text-green-700 transition-colors">{dest.name}</div>
                  <div className="text-sm text-slate-400">{dest.addr}</div>
                </div>
                <ChevronRight size={18} className="text-slate-200 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Popular Areas</p>
          <div className="grid grid-cols-2 gap-3">
            {['Nyabugogo', 'Remera', 'Gikondo', 'Kimironko', 'Kacyiru', 'Musanze', 'Butare', 'Rubavu'].map(tag => (
              <button 
                key={tag} 
                onClick={onSelect} 
                className="bg-white hover:bg-green-50 hover:text-green-700 border border-slate-100 p-4 rounded-2xl text-sm font-bold text-slate-600 transition-all text-left flex justify-between items-center group shadow-sm"
              >
                {tag}
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
          
          <div className="mt-10 p-6 bg-slate-900 rounded-[32px] text-white">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                   <Navigation size={18} />
                </div>
                <h4 className="font-bold">Plan multi-stop trip</h4>
             </div>
             <p className="text-xs text-slate-400 mb-6 font-medium">Need to make multiple stops? Use our route planner to optimize your journey.</p>
             <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">Start Planning</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BusesScreen({ onBack, onSelectBus }: { onBack: () => void, onSelectBus: (b: BusInfo) => void }) {
  const [filter, setFilter] = useState("");

  const filteredBuses = BUSES.filter((bus) =>
    bus.route.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-800 transition-colors mb-4"
          >
            <ChevronLeft size={20} strokeWidth={3} /> Change route
          </button>
          <h2 className="text-4xl font-black font-display text-slate-900 tracking-tight">Available Buses</h2>
          <p className="text-slate-500 font-medium">Showing buses from Nyabugogo to CBD Kigali</p>
        </div>
        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={18} />
          <input
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:ring-0 transition-all font-medium"
            placeholder="Filter by route..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuses.map((bus) => (
          <div
            key={bus.id}
            onClick={() => onSelectBus(bus)}
            className={`group bg-white border rounded-[36px] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer relative ${
              bus.id === "1" ? "border-green-500 border-2" : "border-slate-100"
            }`}
          >
            {bus.id === "1" && (
              <div className="absolute top-0 right-10 bg-green-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-b-xl z-10 shadow-lg shadow-green-500/20">
                Recommended
              </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-4xl font-black text-slate-900 leading-none mb-2 group-hover:text-green-700 transition-colors">
                  {bus.route}
                </div>
                <div className="text-sm font-bold text-slate-400">
                  {bus.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-slate-900 leading-none">
                  {bus.eta}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  minutes
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              <DetailsBadge icon={<User size={12} />} label={`${bus.seats} seats`} urgent={bus.seats < 10} />
              <DetailsBadge icon={<Clock size={12} />} label={`${bus.duration} min ride`} />
              <DetailsBadge icon={<CreditCard size={12} />} label={`RWF ${bus.fare}`} success />
            </div>

            <div className="flex items-center gap-3 text-sm font-bold text-slate-900 py-4 border-t border-slate-50">
               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-green-600 group-hover:text-white transition-all">
                  <Bus size={20} />
               </div>
               <span>Board at Bay 4</span>
               <ArrowRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-green-600" />
            </div>
          </div>
        ))}
      </div>

      {filteredBuses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
          <Bus size={64} className="text-slate-200 mb-6" />
          <h3 className="text-2xl font-bold text-slate-800 mb-2">No routes found</h3>
          <p className="text-slate-400 font-medium max-w-sm">
            We couldn't find any buses matching your search. Try searching for "CBD" or a route number.
          </p>
        </div>
      )}
    </div>
  );
}

function DetailsBadge({ icon, label, urgent, success }: { icon: React.ReactNode, label: string, urgent?: boolean, success?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold ${
      urgent ? 'bg-orange-50 text-orange-600 border border-orange-100' :
      success ? 'bg-green-50 text-green-700 border border-green-100' :
      'bg-slate-50 text-slate-500 border border-slate-100'
    }`}>
      {icon}
      {label}
    </span>
  );
}

function LiveMapScreen({ onBack }: { onBack: () => void }) {
  const [zoom, setZoom] = useState(1);
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.3, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.5));

  const routes = [
    { id: 'R101', color: '#10b981', path: 'M 100 100 Q 250 150 400 300 T 700 450' },
    { id: 'R202', color: '#3b82f6', path: 'M 700 100 Q 550 250 400 400 T 100 700' },
    { id: 'R305', color: '#8b5cf6', path: 'M 0 400 L 800 400' }
  ];

  const buses = [
    { id: 1, route: 'R101', x: [100, 400, 700], y: [100, 300, 450], duration: 15 },
    { id: 2, route: 'R202', x: [700, 400, 100], y: [100, 400, 700], duration: 18 },
    { id: 3, route: 'R305', x: [0, 400, 800], y: [400, 400, 400], duration: 12 },
    { id: 4, route: 'R101', x: [700, 400, 100], y: [450, 300, 100], duration: 20 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 relative">
      <div className="absolute top-6 left-6 z-30 flex items-center gap-4">
        <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl hover:bg-slate-50 transition-all border border-slate-100">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-slate-100">
          <h2 className="text-xl font-black font-display text-slate-900">Greenroot Live Map</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">7 Buses Live • 3 Routes Active</p>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-100 overflow-hidden">
        <motion.div 
          animate={{ scale: zoom }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="absolute inset-0 origin-center"
        >
          <div className="absolute inset-0 bg-[#f8fafc]">
            {/* Grid */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
            
            {/* Roads & Routes */}
            <svg className="absolute inset-0 w-full h-full">
              {/* Background Roads */}
              <path d="M 0 200 L 1200 200" fill="none" stroke="#fff" strokeWidth="80" />
              <path d="M 400 0 L 400 1000" fill="none" stroke="#fff" strokeWidth="80" />
              
              {/* Active Route Glows */}
              {routes.map(r => (
                <path key={`glow-${r.id}`} d={r.path} fill="none" stroke={r.color} strokeWidth="12" strokeOpacity="0.1" />
              ))}
              
              {/* Active Route Lines */}
              {routes.map(r => (
                <path key={`line-${r.id}`} d={r.path} fill="none" stroke={r.color} strokeWidth="4" strokeDasharray="12 12" />
              ))}
            </svg>

            {/* Landmarks */}
            <Landmark x={400} y={200} label="Central Hub" icon={<Home size={14} />} color="blue" />
            <Landmark x={700} y={450} label="South Station" icon={<MapPin size={14} />} color="purple" />
            <Landmark x={100} y={100} label="North Point" icon={<MapPin size={14} />} color="orange" />
            <Landmark x={100} y={700} label="Industrial Park" icon={<MapPin size={14} />} color="slate" />

            {/* Neighborhood Labels */}
            <div className="absolute top-[10%] left-[50%] -translate-x-1/2 text-[40px] font-black font-display text-slate-200/40 uppercase tracking-[0.2em] pointer-events-none">DOWNTOWN</div>
            <div className="absolute bottom-[20%] left-[15%] text-[40px] font-black font-display text-slate-200/40 uppercase tracking-[0.2em] pointer-events-none">WEST SIDE</div>

            {/* Animated Buses */}
            {buses.map(bus => (
              <motion.div 
                key={bus.id}
                animate={{ x: bus.x, y: bus.y }}
                transition={{ duration: bus.duration, repeat: Infinity, ease: 'linear' }}
                className="absolute z-20"
              >
                <div className="relative group">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl border-2 border-white transition-transform group-hover:scale-125"
                    style={{ backgroundColor: routes.find(r => r.id === bus.route)?.color }}
                  >
                    <Bus size={20} />
                  </div>
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg border border-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] font-black text-slate-900">{bus.route} - Active</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Zoom Controls */}
        <div className="absolute right-8 bottom-8 flex flex-col gap-3 z-30">
          <button onClick={zoomIn} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all">
            <Plus size={24} />
          </button>
          <button onClick={zoomOut} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all">
            <Minus size={24} />
          </button>
        </div>

        {/* Stats Overlay */}
        <div className="absolute left-8 bottom-8 z-30 hidden lg:block">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-[30px] shadow-2xl border border-slate-100 max-w-xs">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-4">Traffic Insights</h3>
            <div className="space-y-4">
              <StatRow label="Avg Wait" value="12m" color="green" />
              <StatRow label="Fleet Utilization" value="84%" color="blue" />
              <StatRow label="On-Time Rate" value="96.2%" color="purple" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Landmark({ x, y, label, icon, color }: { x: number, y: number, label: string, icon: React.ReactNode, color: string }) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-500',
    purple: 'bg-purple-50 text-purple-500',
    orange: 'bg-orange-50 text-orange-500',
    slate: 'bg-slate-50 text-slate-500',
  };

  return (
    <div className="absolute flex flex-col items-center" style={{ top: y, left: x }}>
      <div className={`w-8 h-8 ${colorMap[color]} rounded-lg flex items-center justify-center shadow-sm mb-1`}>
        {icon}
      </div>
      <span className="text-[9px] font-bold text-slate-400 font-display uppercase tracking-tighter whitespace-nowrap">{label}</span>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string, value: string, color: string }) {
  const colorMap: any = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${colorMap[color]}`}></div>
        <span className="text-xs font-bold text-slate-400">{label}</span>
      </div>
      <span className="text-xs font-black text-slate-900">{value}</span>
    </div>
  );
}

function TrackingScreen({ bus, onBack, onBook }: { bus: BusInfo, onBack: () => void, onBook: () => void }) {
  const [zoom, setZoom] = useState(1);
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[600px] bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100">
      <div className="flex-1 relative bg-slate-100 overflow-hidden">
        {/* Mock Map - Enhanced with many details and Zoom support */}
        <motion.div 
          animate={{ scale: zoom }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="absolute inset-0 origin-center"
        >
          <div className="absolute inset-0 bg-[#f8fafc]">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
          
          {/* Detailed Road Network */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Main Highways */}
            <path d="M -100 200 L 1200 200" fill="none" stroke="#fff" strokeWidth="60" strokeLinecap="round" />
            <path d="M 400 -100 L 400 1000" fill="none" stroke="#fff" strokeWidth="60" strokeLinecap="round" />
            <path d="M -100 600 L 1200 600" fill="none" stroke="#fff" strokeWidth="40" strokeLinecap="round" />
            
            {/* Street Lines */}
            <path d="M -100 200 L 1200 200" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="12 12" />
            <path d="M 400 -100 L 400 1000" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="12 12" />
            
            {/* Secondary Roads */}
            <path d="M 200 200 Q 250 400 400 450 T 600 600" fill="none" stroke="#fff" strokeWidth="30" strokeLinecap="round" />
            <path d="M 200 200 Q 250 400 400 450 T 600 600" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="8 8" />
            
            {/* Bus Path */}
            <path d="M 100 100 Q 200 200 400 300 T 800 500" fill="none" stroke="#f1f5f9" strokeWidth="20" strokeLinecap="round" />
            <path d="M 100 100 Q 200 200 400 300 T 800 500" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="10 10" />
          </svg>

          {/* Landmarks / POIs */}
          <div className="absolute top-[15%] left-[25%] flex flex-col items-center">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 shadow-sm mb-1">
              <MapPin size={16} />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">City Center</span>
          </div>

          <div className="absolute top-[45%] left-[45%] flex flex-col items-center">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-500 shadow-sm mb-1">
              <MapPin size={16} />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Hospital</span>
          </div>

          <div className="absolute bottom-[25%] right-[35%] flex flex-col items-center">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500 shadow-sm mb-1">
              <MapPin size={16} />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Park Mall</span>
          </div>

          {/* Bus Stops */}
          {[
            { top: '150px', left: '150px', label: 'Stop A' },
            { top: '250px', left: '350px', label: 'Stop B' },
            { top: '400px', left: '600px', label: 'Stop C' }
          ].map((stop, i) => (
            <div key={i} className="absolute z-10" style={{ top: stop.top, left: stop.left }}>
              <div className="w-3 h-3 bg-white border-2 border-slate-300 rounded-full shadow-sm"></div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400 whitespace-nowrap bg-white/80 px-1 rounded">{stop.label}</div>
            </div>
          ))}

          {/* Secondary Moving Bus (Incoming) */}
          <motion.div 
            animate={{ x: [800, 400, 0], y: [600, 600, 600] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute z-20"
          >
            <div className="relative group">
              <div className="w-8 h-8 bg-slate-400 rounded-lg flex items-center justify-center text-white shadow-md opacity-60">
                <Bus size={14} />
              </div>
            </div>
          </motion.div>

          {/* Active Bus (User Tracking) */}
          <motion.div 
            animate={{ x: [100, 300, 500, 700], y: [100, 220, 350, 450] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute z-20"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-green-500/20 rounded-full animate-ping"></div>
              <div className="w-14 h-14 bg-green-600 rounded-3xl flex items-center justify-center text-white shadow-2xl border-4 border-white">
                <Bus size={28} />
              </div>
              <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-2xl shadow-xl border border-slate-100 whitespace-nowrap">
                <div className="text-[10px] font-black text-slate-900 leading-none">R{bus.route} - {bus.name}</div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-[8px] font-bold text-green-600 uppercase tracking-tighter">Live • Arriving {bus.eta}m</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Marker Labels (Neighborhoods) */}
          <div className="absolute top-[80%] left-[10%] text-[24px] font-black font-display text-slate-200/50 pointer-events-none uppercase tracking-widest leading-none">KGL WEST</div>
          <div className="absolute top-[20%] right-[10%] text-[24px] font-black font-display text-slate-200/50 pointer-events-none uppercase tracking-widest leading-none">DWTN DISTRICT</div>
        </div>
        </motion.div>

        {/* Floating Controls */}
        <div className="absolute right-6 bottom-32 flex flex-col gap-3 z-30">
          <button 
            onClick={zoomIn}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl hover:bg-slate-50 transition-all active:scale-95 border border-slate-100"
          >
            <Plus size={20} />
          </button>
          <button 
            onClick={zoomOut}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl hover:bg-slate-50 transition-all active:scale-95 border border-slate-100"
          >
            <Minus size={20} />
          </button>
        </div>

        <button onClick={onBack} className="absolute top-6 left-6 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl hover:bg-slate-50 transition-all z-30">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>

        <div className="absolute top-6 right-6 flex flex-col gap-2 z-30">
          <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-slate-50 transition-all text-slate-500"><Navigation size={20} /></button>
          <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-slate-50 transition-all text-slate-500"><Search size={20} /></button>
        </div>
      </div>

      <div className="w-full lg:w-96 p-10 flex flex-col bg-white shrink-0">
        <div className="flex-1">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black font-display text-slate-900 mb-2 leading-none">Live Tracking</h2>
            <p className="text-slate-400 font-medium tracking-tight">Monitor your bus in real-time</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                <Bus size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Active Link</p>
                <div className="font-bold text-slate-900 text-lg leading-tight">{bus.name}</div>
                <div className="text-green-600 font-black text-xl mt-1">Route {bus.route}</div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden">
              <div className="absolute right-[-20%] bottom-[-20%] w-32 h-32 bg-green-500/5 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Arrival</p>
                  <p className="text-4xl font-black text-slate-900 leading-none">{bus.eta}<span className="text-sm">min</span></p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-green-600">
                  <Clock size={24} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bus Capacity</h4>
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-800">{bus.seats} / 54 seats available</span>
                    <span className="text-green-600">Low density</span>
                 </div>
                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{width: 0}} animate={{width: '30%'}} className="h-full bg-green-500"></motion.div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onBook}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-green-600/20 active:scale-95 transition-all mt-10"
        >
          Book This Bus
        </button>
      </div>
    </div>
  );
}

function BookingScreen({ bus, onBack, onContinue, selectedSeat, setSelectedSeat }: { bus: BusInfo, onBack: () => void, onContinue: () => void, selectedSeat: string | null, setSelectedSeat: (s: string | null) => void }) {
  const [selectedZone, setSelectedZone] = useState('all');

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[700px] bg-slate-50 rounded-[40px] overflow-hidden shadow-2xl border border-white">
      <div className="w-full lg:w-[450px] bg-white p-10 shrink-0 border-r border-slate-100 flex flex-col">
        <div className="flex-1">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-800 transition-colors mb-10">
            <ChevronLeft size={20} strokeWidth={3} /> Change bus
          </button>
          
          <h2 className="text-4xl font-black font-display text-slate-900 mb-2 leading-none">Select Seat</h2>
          <p className="text-slate-400 font-medium mb-12">Route {bus.route} • RWF {bus.fare}</p>

          <div className="space-y-6 mb-12">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-sm font-bold text-slate-500">Selected Seat</span>
               <span className="text-xl font-black text-green-600">{selectedSeat || 'None'}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <LegendItem color="bg-green-600" label="Selected" />
              <LegendItem color="bg-white border border-slate-200" label="Available" />
              <LegendItem color="bg-slate-200" label="Taken" />
            </div>
          </div>

          <div className="space-y-4">
             <button onClick={() => setSelectedZone('front')} className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${selectedZone === 'front' ? 'border-green-600 bg-green-50/50' : 'border-slate-100 bg-white'}`}>
                <span className="text-sm font-bold">Front Seats (1-12)</span>
                <span className="text-[10px] font-black text-green-600">FASTER EXIT</span>
             </button>
             <button onClick={() => setSelectedZone('all')} className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${selectedZone === 'all' ? 'border-green-600 bg-green-50/50' : 'border-slate-100 bg-white'}`}>
                <span className="text-sm font-bold">Show All Seats</span>
                <span className="text-[10px] font-black text-slate-400">42 AVAILABLE</span>
             </button>
          </div>
        </div>

        <button 
          onClick={onContinue}
          disabled={!selectedSeat}
          className={`w-full py-5 rounded-[24px] font-black text-lg shadow-xl transition-all mt-10 active:scale-95 ${
            selectedSeat 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          Confirm {selectedSeat ? `Seat ${selectedSeat}` : 'Selection'}
        </button>
      </div>

      <div className="flex-1 p-10 flex items-center justify-center overflow-y-auto">
        <div className="bg-white p-12 rounded-[60px] shadow-2xl relative border-8 border-slate-100">
          <div className="w-16 h-2 bg-slate-200 rounded-full mx-auto mb-16"></div>
          
          <div className="flex flex-col gap-8">
            {[1, 2, 3, 4, 5, 6, 7].map((row) => (
              <div key={row} className="flex gap-12">
                <div className="flex gap-4">
                  <Seat id={`${row}A`} selected={selectedSeat} onSelect={setSelectedSeat} />
                  <Seat id={`${row}B`} selected={selectedSeat} onSelect={setSelectedSeat} />
                </div>
                <div className="flex gap-4">
                  <Seat id={`${row}C`} selected={selectedSeat} onSelect={setSelectedSeat} taken />
                  <Seat id={`${row}D`} selected={selectedSeat} onSelect={setSelectedSeat} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="absolute top-10 right-[-30px] w-20 h-40 bg-slate-800 rounded-3xl flex items-center justify-center p-4">
             <div className="w-full h-full border-2 border-slate-700 rounded-xl flex items-center justify-center">
                <div className="text-[8px] font-black text-slate-600 uppercase -rotate-90">ENTRANCE</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Seat({ id, selected, onSelect, taken }: { id: string, selected: string | null, onSelect: (id: string) => void, taken?: boolean }) {
  const isSelected = selected === id;
  return (
    <button
      disabled={taken}
      onClick={() => onSelect(id)}
      className={`w-12 h-12 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
        taken ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
        isSelected ? 'bg-green-600 text-white shadow-lg shadow-green-600/40 scale-110' :
        'bg-slate-50 text-slate-600 hover:bg-green-50 border border-slate-100 hover:border-green-200'
      }`}
    >
      {id}
    </button>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
    </div>
  );
}

function PaymentScreen({ onBack, onPay, selectedSeat, method, setMethod, profile }: { onBack: () => void, onPay: () => void, selectedSeat: string | null, method: string, setMethod: (m: 'wallet' | 'mtn' | 'airtel') => void, profile: UserProfile }) {
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 transition-colors"><ChevronLeft size={32} /></button>
        <h2 className="text-5xl font-black font-display text-slate-900 tracking-tight">Checkout</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Trip Summary</p>
          <div className="bg-white border-2 border-slate-100 p-8 rounded-[40px] shadow-xl shadow-slate-200/50">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Route</p>
                <p className="text-xl font-bold text-slate-900 leading-tight">14B — Nyabugogo to CBD</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Seat</p>
                  <p className="text-xl font-bold text-slate-900">{selectedSeat || 'C4'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Departure</p>
                  <p className="text-xl font-bold text-slate-900">08:45 AM</p>
                </div>
              </div>
              <hr className="border-slate-50" />
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-slate-400 uppercase">Total amount</p>
                <p className="text-3xl font-black text-green-600">RWF 400</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-green-50 rounded-3xl border border-green-100 flex items-center gap-4">
             <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shrink-0">
                <Ticket size={20} />
             </div>
             <p className="text-xs font-bold text-green-800">Your ticket will be valid for 24 hours after booking.</p>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Payment Method</p>
          <div className="flex flex-col gap-3">
            <PaymentMethod 
              id="wallet" 
              icon={<CreditCard className="text-green-600" size={20} />} 
              label="Greenroot Wallet" 
              detail={`Balance: RWF ${profile.walletBalance.toLocaleString()}`} 
              active={method === 'wallet'} 
              onClick={() => setMethod('wallet')} 
              bg="bg-green-50"
            />
            <PaymentMethod 
              id="mtn" 
              icon={<Smartphone className="text-yellow-600" size={20} />} 
              label="MTN Mobile Money" 
              detail="**** 4821" 
              active={method === 'mtn'} 
              onClick={() => setMethod('mtn')} 
              bg="bg-yellow-50"
            />
            <PaymentMethod 
              id="airtel" 
              icon={<Smartphone className="text-red-600" size={20} />} 
              label="Airtel Money" 
              detail="**** 7293" 
              active={method === 'airtel'} 
              onClick={() => setMethod('airtel')} 
              bg="bg-red-50"
            />
          </div>

          <button 
            onClick={onPay}
            className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-slate-900/20 active:scale-95 transition-all mt-6"
          >
            Pay & Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentMethod({ icon, label, detail, active, onClick, bg, id }: { icon: React.ReactNode, label: string, detail: string, active: boolean, onClick: () => void, bg: string, id: string }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 p-5 rounded-[28px] border-2 transition-all cursor-pointer ${active ? 'bg-white border-green-500 ring-4 ring-green-50' : 'bg-white border-slate-100 hover:border-slate-200'}`}
    >
      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-slate-900 leading-none mb-1">{label}</div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{detail}</div>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${active ? 'border-green-600 bg-green-600' : 'border-slate-200'}`}>
        {active && <Check size={14} className="text-white" strokeWidth={4} />}
      </div>
    </div>
  );
}

function TapGoScreen({ onBack, onBoard, selectedSeat, name }: { onBack: () => void, onBoard: () => void, selectedSeat: string | null, name: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-12 max-w-3xl mx-auto py-20 px-4">
      <div className="text-center">
        <h2 className="text-6xl font-black font-display text-slate-900 mb-4 tracking-tight">Tap & Board</h2>
        <p className="text-slate-500 font-medium text-lg">Present this screen to the reader on the bus</p>
      </div>

      <div className="relative group">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl -z-10 group-hover:bg-green-500/40 transition-colors"
        ></motion.div>
        
        <div onClick={onBoard} className="w-80 h-80 bg-white border-8 border-slate-100 rounded-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-6 cursor-pointer hover:scale-105 active:scale-95 transition-all">
          <Smartphone size={80} className="text-green-600" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Device Ready</p>
            <p className="text-2xl font-black text-slate-900">Seat {selectedSeat || 'C4'}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[48px] p-10 text-white w-full shadow-2xl flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
             <div>
               <p className="text-[10px] font-bold text-slate-500 uppercase">Passenger</p>
               <p className="text-xl font-bold">{name}</p>
             </div>
             <div className="text-right">
               <p className="text-[10px] font-bold text-slate-500 uppercase">Fare Paid</p>
               <p className="text-xl font-bold text-green-400">RWF 400</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             <p className="text-sm text-slate-400 font-medium tracking-tight">Active Ticket ID: <span className="font-mono text-white text-xs">SB-9284-XK</span></p>
          </div>
        </div>
        <div className="shrink-0 bg-white p-3 rounded-2xl">
           {/* Mock QR Code */}
           <div className="w-24 h-24 grid grid-cols-5 gap-1">
              {[...Array(25)].map((_, i) => (
                <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-slate-900' : 'bg-slate-100'}`}></div>
              ))}
           </div>
        </div>
      </div>

      <button onClick={onBack} className="text-slate-400 font-bold hover:text-slate-800 transition-colors uppercase tracking-widest text-[10px]"> Cancel & Go Back </button>
    </div>
  );
}
  function SuccessScreen({ name, onDone, selectedSeat }: { name: string, onDone: () => void, selectedSeat: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-4 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[60px] p-12 shadow-2xl flex flex-col items-center text-center border-8 border-slate-100"
      >
        <div className="w-24 h-24 bg-green-600 rounded-[32px] flex items-center justify-center text-white mb-10 shadow-2xl shadow-green-600/30">
          <Check size={48} strokeWidth={3} />
        </div>

        <h2 className="text-5xl font-black font-display text-slate-900 mb-4 tracking-tight">Boarding Successful!</h2>
        <p className="text-slate-500 font-medium text-lg mb-12">Trip confirmed. Have a safe journey, {name}!</p>

        <div className="bg-slate-50 rounded-[40px] p-10 w-full space-y-6 mb-12">
          <SuccessRow label="Route" val="14B — Nyabugogo to CBD" />
          <SuccessRow label="Seat" val={selectedSeat || 'C4'} />
          <SuccessRow label="Boarding Time" val="08:42 AM" />
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-green-700">
             <span className="text-[10px] font-black uppercase tracking-widest">Amount Paid</span>
             <span className="text-2xl font-black">RWF 400</span>
          </div>
        </div>

        <button 
          onClick={onDone}
          className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[24px] font-black text-xl shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
        >
          Return Home
        </button>
      </motion.div>
    </div>
  );
}
function SuccessRow({ label, val }: { label: string, val: string }) {
  return (
    <div className="flex justify-between items-center text-slate-800">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-lg font-bold">{val}</span>
    </div>
  );
}

function ProfileScreen({ profile, onBack, onNavigate }: { profile: UserProfile, onBack: () => void, onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-32 h-32 bg-green-600 rounded-[40px] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-green-600/20 group-hover:scale-105 transition-all">
            {profile.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border-4 border-slate-50 rounded-2xl flex items-center justify-center text-green-600 shadow-xl cursor-pointer hover:bg-green-50 transition-colors">
            <Camera size={20} />
          </div>
        </div>
        <div>
          <h1 className="text-5xl font-black font-display text-slate-900 tracking-tight mb-2">{profile.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-green-100">
               <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div>
               Gold Member
            </span>
            <span className="text-slate-400 font-medium text-sm">Joined May 2024</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileStat icon={<CreditCard size={24} />} label="Balance" value={`RWF ${profile.walletBalance.toLocaleString()}`} color="text-green-600" bg="bg-green-50" />
            <ProfileStat icon={<MapPin size={24} />} label="Trips this week" value="14 Rides" color="text-teal-600" bg="bg-teal-50" />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold font-display text-slate-900 leading-none">Account Settings</h3>
            <div className="bg-white border-2 border-slate-100 rounded-[32px] divide-y divide-slate-50 shadow-sm">
              <ProfileMenuItem icon={<User size={20} />} label="Personal Information" detail="Change name, profile photo" />
              <ProfileMenuItem icon={<Bell size={20} />} label="Notifications" detail="Bus arrivals, payments" />
              <ProfileMenuItem icon={<Shield size={20} />} label="Security" detail="Password, two-factor auth" />
              <ProfileMenuItem icon={<Gift size={20} />} label="Refer a Friend" detail="Earn RWF 500 per referral" success />
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-2xl font-bold font-display text-slate-900 leading-none">Smart Card</h3>
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden aspect-[1.6/1] flex flex-col justify-between group cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="flex justify-between items-start">
                 <Bus size={32} className="text-green-500" />
                 <TrendingUp size={24} className="text-white/20" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Active Member</p>
                <p className="text-xl font-mono tracking-[0.2em] mb-4">**** **** **** 9284</p>
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-[8px] font-bold text-slate-500 uppercase">Holder</p>
                      <p className="text-sm font-bold uppercase">{profile.name}</p>
                   </div>
                   <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                      <div className="w-6 h-4 border border-white/20 rounded-sm"></div>
                   </div>
                </div>
              </div>
           </div>
           
           <button 
             onClick={() => { localStorage.removeItem('greenroot_user'); onNavigate('login'); }}
             className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
           >
             <LogOut size={18} />
             Sign Out
           </button>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, detail, onClick }: { icon: React.ReactNode, label: string, detail?: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl hover:border-green-100 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
          {icon}
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800">{label}</div>
          {detail && <div className="text-[10px] text-slate-400 font-medium">{detail}</div>}
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
    </div>
  );
}

function ProfileStat({ icon, label, value, color, bg }: { icon: React.ReactNode, label: string, value: string, color: string, bg: string }) {
  return (
    <div className={`p-6 rounded-[32px] ${bg} border border-white flex items-center gap-4 shadow-sm`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} bg-white shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
        <p className={`text-xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function ProfileMenuItem({ icon, label, detail, success }: { icon: React.ReactNode, label: string, detail?: string, success?: boolean }) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors`}>
          {icon}
        </div>
        <div>
           <div className="text-sm font-bold text-slate-900">{label}</div>
           {detail && <div className={`text-[10px] font-medium ${success ? 'text-green-600' : 'text-slate-400'}`}>{detail}</div>}
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
    </div>
  );
}
