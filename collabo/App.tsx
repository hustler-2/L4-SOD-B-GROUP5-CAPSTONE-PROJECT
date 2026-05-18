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
  Minus,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Github
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
      <div className="flex items-center justify-center min-h-screen bg-gr-dark">
        <Bus size={64} className="text-gr-lime animate-bounce" />
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

      {showNav && <Footer onNavigate={goTo} />}

      {/* Mobile-only bottom nav fallback */}
      {showNav && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md h-16 bg-gr-dark/80 backdrop-blur-xl border border-white/10 flex items-center justify-around px-4 z-50 rounded-2xl shadow-2xl">
          <button 
            className={`flex flex-col items-center gap-1 ${screen === 'home' ? 'text-gr-lime' : 'text-white/40'}`}
            onClick={() => goTo('home')}
          >
            <Home size={20} strokeWidth={screen === 'home' ? 2.5 : 2} />
          </button>
          <button className={`flex flex-col items-center gap-1 ${screen === 'liveMap' ? 'text-gr-lime' : 'text-white/40'}`} onClick={() => goTo('liveMap')}>
            <MapIcon size={20} />
          </button>
          <button className={`flex flex-col items-center gap-1 ${screen === 'destination' ? 'text-gr-lime' : 'text-white/40'}`} onClick={() => goTo('destination')}>
            <Search size={20} />
          </button>
          <button className={`flex flex-col items-center gap-1 ${screen === 'tracking' ? 'text-gr-lime' : 'text-white/40'}`} onClick={() => goTo('tracking')}>
            <Navigation size={20} />
          </button>
          <button 
            className={`flex flex-col items-center gap-1 ${screen === 'profile' ? 'text-gr-lime' : 'text-white/40'}`}
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
    <nav className="fixed top-0 left-0 right-0 h-20 bg-gr-dark/80 backdrop-blur-xl border-b border-gr-lime/10 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div 
            onClick={() => goTo('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gr-lime rounded-xl flex items-center justify-center text-gr-dark shadow-lg shadow-gr-lime/20 group-hover:scale-105 transition-transform">
              <Bus size={24} strokeWidth={1.5} />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-white">Greenroot</span>
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
            <span className="text-xs font-bold text-white">{userProfile?.name}</span>
            <span className="text-[10px] font-medium text-gr-lime uppercase tracking-wider">Gold Member</span>
          </div>
          <button 
            onClick={() => goTo('profile')}
            className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden hover:ring-4 hover:ring-gr-lime/20 transition-all active:scale-95"
          >
            {userProfile ? (
              <span className="font-bold text-sm text-gr-lime">{userProfile.name.substring(0, 2).toUpperCase()}</span>
            ) : (
              <User size={20} className="text-white/40" />
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
          ? 'bg-gr-lime/10 text-gr-lime shadow-sm' 
          : 'text-white/40 hover:bg-white/5 hover:text-white'
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
    <div className="min-h-screen flex items-center justify-center hero-gradient p-8 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-50"></div>
      <div className="max-w-md w-full flex flex-col items-center text-center relative z-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 mb-10 bg-gr-lime rounded-[40px] flex items-center justify-center shadow-2xl shadow-gr-lime/20"
        >
          <Bus size={64} strokeWidth={1} className="text-gr-dark" />
        </motion.div>
        
        <h1 className="text-6xl font-black font-display text-white mb-4 tracking-tighter">Greenroot</h1>
        <p className="text-xl text-white/50 font-medium mb-16 tracking-tight">Your city transit, reimagined for the modern web.</p>
        
        <button 
          onClick={onStart}
          className="w-full bg-gr-lime text-gr-dark py-6 rounded-[24px] font-black text-xl shadow-[0_20px_40px_-10px_rgba(126,201,74,0.3)] hover:scale-[1.02] active:scale-95 transition-all mb-8"
        >
          Begin Journey
        </button>
        
        <div className="flex justify-center gap-3 opacity-20">
          <div className="w-2 h-2 rounded-full bg-gr-lime"></div>
          <div className="w-2 h-2 rounded-full bg-gr-lime"></div>
          <div className="w-2 h-2 rounded-full bg-gr-lime"></div>
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
    <div className="min-h-screen flex items-center justify-center bg-gr-dark p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gr-lime/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gr-green/5 blur-[120px] rounded-full -ml-20 -mb-20"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-[60px] p-12 shadow-2xl border border-white/10 flex flex-col items-center relative z-10"
      >
        <div className="w-20 h-20 bg-gr-lime rounded-[28px] flex items-center justify-center text-gr-dark mb-10 shadow-xl shadow-gr-lime/20">
           <Bus size={40} />
        </div>
        
        <h2 className="text-4xl font-black font-display text-white tracking-tight mb-2">Welcome Back</h2>
        <p className="text-white/40 font-medium mb-12">Log in to manage your city transit</p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full p-5 bg-white/5 rounded-[24px] border-2 border-transparent focus:border-gr-lime focus:bg-white/10 outline-none transition-all font-bold text-white placeholder:text-white/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full p-5 bg-white/5 rounded-[24px] border-2 border-transparent focus:border-gr-lime focus:bg-white/10 outline-none transition-all font-bold text-white placeholder:text-white/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs font-bold px-4">{error}</p>}
          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-gr-lime text-gr-dark py-5 rounded-[24px] font-black text-lg transition-all active:scale-95 shadow-xl shadow-gr-lime/20"
          >
            {isLoggingIn ? 'Verifying...' : 'Log In'}
          </button>
        </form>

        <div className="flex items-center gap-4 w-full my-8">
           <div className="h-px bg-white/10 flex-1"></div>
           <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">or</span>
           <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white/5 border-2 border-white/5 py-5 rounded-[24px] flex items-center justify-center gap-4 hover:bg-white/10 transition-all font-black text-white active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6" alt="Google" />
          Sign in with Google
        </button>

        <p className="mt-10 text-sm font-bold text-white/40">
          New to Greenroot? <button onClick={onGoToRegister} className="text-gr-lime hover:underline">Register now</button>
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
    <div className="min-h-screen flex items-center justify-center bg-gr-dark p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gr-lime/5 blur-[120px] rounded-full -ml-20 -mt-20"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-[60px] p-12 shadow-2xl border border-white/10 flex flex-col items-center relative z-10"
      >
        <h2 className="text-4xl font-black font-display text-white tracking-tight mb-2">Create Account</h2>
        <p className="text-white/40 font-medium mb-12 text-center px-8">Join the fastest growing public transport network in Kigali</p>

        <form onSubmit={handleRegister} className="w-full space-y-4">
          <input 
            type="text" 
            placeholder="Full Name"
            className="w-full p-5 bg-white/5 rounded-[24px] border-2 border-transparent focus:border-gr-lime focus:bg-white/10 outline-none transition-all font-bold text-white placeholder:text-white/20"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full p-5 bg-white/5 rounded-[24px] border-2 border-transparent focus:border-gr-lime focus:bg-white/10 outline-none transition-all font-bold text-white placeholder:text-white/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full p-5 bg-white/5 rounded-[24px] border-2 border-transparent focus:border-gr-lime focus:bg-white/10 outline-none transition-all font-bold text-white placeholder:text-white/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs font-bold px-4">{error}</p>}
          <button 
            type="submit"
            disabled={isRegistering}
            className="w-full bg-gr-lime text-gr-dark py-5 rounded-[24px] font-black text-lg transition-all active:scale-95 shadow-xl shadow-gr-lime/20"
          >
            {isRegistering ? 'Creating...' : 'Register'}
          </button>
        </form>

        <div className="flex items-center gap-4 w-full my-8">
           <div className="h-px bg-white/10 flex-1"></div>
           <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">or</span>
           <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white/5 border-2 border-white/5 py-5 rounded-[24px] flex items-center justify-center gap-4 hover:bg-white/10 transition-all font-black text-white active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6" alt="Google" />
          Sign up with Google
        </button>

        <p className="mt-10 text-sm font-bold text-white/40">
          Already have an account? <button onClick={onGoToLogin} className="text-gr-lime hover:underline">Log in</button>
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
          <h1 className="text-4xl font-black font-display tracking-tight text-white mb-2">
            Welcome, {name}
          </h1>
          <p className="text-white/40 font-medium max-w-md">
            Ready for your next journey? Track your bus or book a new trip instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
             {[1, 2, 3].map(i => (
               <div key={i} className="w-10 h-10 rounded-xl border-4 border-gr-dark bg-white/10 flex items-center justify-center overflow-hidden">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
               </div>
             ))}
          </div>
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-2">
            2.4k others commuting now
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickCard 
          icon={<MapIcon size={28} className="text-gr-dark" />} 
          label="Live Network Map" 
          sub="Fleet-wide view" 
          onClick={() => onNavigate('liveMap')} 
          bg="bg-gr-lime shadow-xl shadow-gr-lime/20"
          large
          active
        />
        <QuickCard 
          icon={<Calendar size={28} className="text-gr-lime" />} 
          label="Book Seats" 
          sub="Reserve future trips" 
          onClick={() => onNavigate('destination')} 
          bg="bg-white/5 border border-white/10"
          large
        />
        <QuickCard 
          icon={<Clock size={28} className="text-gr-lime" />} 
          label="Arrival ETAs" 
          sub="Real-time schedules" 
          onClick={() => onNavigate('buses')} 
          bg="bg-white/5 border border-white/10"
          large
        />
        <QuickCard 
          icon={<CreditCard size={28} className="text-gr-lime" />} 
          label="Smart Wallet" 
          sub="RWF 12,400 Balance" 
          onClick={() => onNavigate('payment')} 
          bg="bg-white/5 border border-white/10"
          large
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold font-display text-white leading-none">Recommended Buses</h3>
            <button 
              onClick={() => onNavigate('buses')}
              className="text-sm font-bold text-gr-lime hover:underline"
            >
              See all routes
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BUSES.slice(0, 4).map(bus => (
              <div key={bus.id} onClick={() => onSelectBus(bus)} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-gr-lime/30 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-bold text-gr-lime mb-1 uppercase tracking-tighter">Route {bus.route}</div>
                    <div className="font-bold text-white group-hover:text-gr-lime transition-colors">{bus.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 mb-1 text-[10px] font-bold text-red-500 uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                      Live
                    </div>
                    <div className="text-2xl font-black text-white leading-none">{bus.eta}m</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-white/30 border-t border-white/5 pt-4">
                  <span className="flex items-center gap-1"><User size={12} /> {bus.seats} seats</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {bus.duration}m ride</span>
                  <span className="ml-auto text-gr-lime">RWF {bus.fare}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold font-display text-white leading-none">Recent Trips</h3>
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-gr-lime/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-gr-lime/10 rounded-2xl flex items-center justify-center">
                  <History size={24} className="text-gr-lime" />
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">View All</button>
              </div>
              <div className="space-y-4">
                {RECENT_DESTINATIONS.slice(0, 3).map((dest, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-gr-lime mt-1 transition-all group-hover:scale-150"></div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-gr-lime transition-colors">{dest.name}</p>
                      <p className="text-[10px] text-white/20 font-medium uppercase">{dest.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-gr-lime/10 rounded-xl flex items-center justify-center">
                   <TrendingUp className="text-gr-lime" size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Points earned</p>
                   <p className="text-lg font-black text-white">+1.2k this month</p>
                </div>
             </div>
             <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-white transition-colors">
                View Rewards
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickCard({ icon, label, sub, onClick, bg, large, active }: { icon: React.ReactNode, label: string, sub: string, onClick: () => void, bg: string, large?: boolean, active?: boolean }) {
  return (
    <div 
      onClick={onClick} 
      className={`p-8 rounded-[32px] flex flex-col gap-6 hover:scale-[1.02] transition-all cursor-pointer group ${active ? 'hero-gradient border border-gr-lime/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
    >
      <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold text-white group-hover:text-gr-lime transition-colors">{label}</div>
        <div className="text-xs text-white/40 font-medium transition-colors">{sub}</div>
      </div>
    </div>
  );
}

function DestinationScreen({ onBack, onSelect }: { onBack: () => void, onSelect: () => void }) {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors"><ChevronLeft size={32} /></button>
        <h2 className="text-5xl font-black font-display text-white tracking-tight">Where to?</h2>
      </div>
      
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gr-lime transition-colors" size={24} />
        <input 
          className="w-full bg-white/5 border-2 border-white/10 rounded-[32px] py-6 pl-16 pr-8 text-xl text-white placeholder:text-white/10 focus:border-gr-lime focus:ring-0 transition-all shadow-2xl"
          placeholder="Enter destination, street or landmark..."
          autoFocus
          onChange={(e) => { if(e.target.value.length > 2) setTimeout(onSelect, 800) }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
        <div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-6">Recent Destinations</p>
          <div className="flex flex-col gap-4">
            {RECENT_DESTINATIONS.map((dest, i) => (
              <div key={i} onClick={onSelect} className="flex items-center gap-5 p-4 hover:bg-white/5 rounded-3xl transition-all cursor-pointer group border border-transparent hover:border-white/10">
                <div className={`w-12 h-12 bg-gr-lime/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {React.cloneElement(dest.icon as React.ReactElement, { className: 'w-4 h-4 text-gr-lime' })}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-lg group-hover:text-gr-lime transition-colors">{dest.name}</div>
                  <div className="text-sm text-white/40">{dest.addr}</div>
                </div>
                <ChevronRight size={18} className="text-white/10 group-hover:text-gr-lime group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-6">Popular Areas</p>
          <div className="grid grid-cols-2 gap-3">
            {['Nyabugogo', 'Remera', 'Gikondo', 'Kimironko', 'Kacyiru', 'Musanze', 'Butare', 'Rubavu'].map(tag => (
              <button 
                key={tag} 
                onClick={onSelect} 
                className="bg-white/5 hover:bg-gr-lime/10 hover:text-gr-lime border border-white/5 p-4 rounded-2xl text-sm font-bold text-white/60 transition-all text-left flex justify-between items-center group"
              >
                {tag}
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
          
          <div className="mt-10 p-6 bg-white/5 border border-white/10 rounded-[32px] text-white">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gr-lime rounded-lg flex items-center justify-center text-gr-dark">
                   <Navigation size={18} />
                </div>
                <h4 className="font-bold">Plan multi-stop trip</h4>
             </div>
             <p className="text-xs text-white/40 mb-6 font-medium">Need to make multiple stops? Use our route planner to optimize your journey.</p>
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
            className="flex items-center gap-2 text-white/40 font-bold hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={20} strokeWidth={3} /> Change route
          </button>
          <h2 className="text-4xl font-black font-display text-white tracking-tight">Available Buses</h2>
          <p className="text-white/40 font-medium">Showing buses from Nyabugogo to CBD Kigali</p>
        </div>
        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gr-lime transition-colors" size={18} />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:border-gr-lime focus:ring-0 transition-all font-medium"
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
            className={`group bg-white/5 border rounded-[36px] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer relative ${
              bus.id === "1" ? "border-gr-lime/50 border-2" : "border-white/10"
            }`}
          >
            {bus.id === "1" && (
              <div className="absolute top-0 right-10 bg-gr-lime text-gr-dark text-[10px] font-black uppercase px-4 py-1.5 rounded-b-xl z-10 shadow-lg shadow-gr-lime/20">
                Recommended
              </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-4xl font-black text-white leading-none mb-2 group-hover:text-gr-lime transition-colors">
                  {bus.route}
                </div>
                <div className="text-sm font-bold text-white/40">
                  {bus.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white leading-none">
                  {bus.eta}
                </div>
                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">
                  minutes
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              <DetailsBadge icon={<User size={12} />} label={`${bus.seats} seats`} urgent={bus.seats < 10} />
              <DetailsBadge icon={<Clock size={12} />} label={`${bus.duration} min ride`} />
              <DetailsBadge icon={<CreditCard size={12} />} label={`RWF ${bus.fare}`} success />
            </div>

            <div className="flex items-center gap-3 text-sm font-bold text-white py-4 border-t border-white/5">
               <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 group-hover:bg-gr-lime group-hover:text-gr-dark transition-all">
                  <Bus size={20} />
               </div>
               <span>Board at Bay 4</span>
               <ArrowRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-gr-lime" />
            </div>
          </div>
        ))}
      </div>

      {filteredBuses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-[40px] border-2 border-dashed border-white/10">
          <Bus size={64} className="text-white/10 mb-6" />
          <h3 className="text-2xl font-bold text-white mb-2">No routes found</h3>
          <p className="text-white/40 font-medium max-w-sm">
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
      urgent ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
      success ? 'bg-gr-lime/10 text-gr-lime border border-gr-lime/20' :
      'bg-white/5 text-white/40 border border-white/10'
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
    { id: 'R101', color: '#7ec94a', path: 'M 100 100 Q 250 150 400 300 T 700 450' },
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
    <div className="flex-1 flex flex-col h-full bg-gr-dark rounded-[40px] overflow-hidden shadow-2xl border border-white/10 relative">
      <div className="absolute top-6 left-6 z-30 flex items-center gap-4">
        <button onClick={onBack} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white shadow-xl hover:bg-white/10 transition-all border border-white/10">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <div className="bg-gr-dark/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/10">
          <h2 className="text-xl font-black font-display text-white">Greenroot Live Map</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-gr-lime rounded-full animate-pulse"></div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">7 Buses Live • 3 Routes Active</p>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-gr-dark overflow-hidden">
        <motion.div 
          animate={{ scale: zoom }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="absolute inset-0 origin-center"
        >
          <div className="absolute inset-0 bg-gr-dark">
            {/* Grid */}
            <div className="absolute inset-0 grid-pattern pointer-events-none opacity-20"></div>
            
            {/* Roads & Routes */}
            <svg className="absolute inset-0 w-full h-full">
              {/* Background Roads */}
              <path d="M 0 200 L 1200 200" fill="none" stroke="#ffffff05" strokeWidth="80" />
              <path d="M 400 0 L 400 1000" fill="none" stroke="#ffffff05" strokeWidth="80" />
              
              {/* Active Route Glows */}
              {routes.map(r => (
                <path key={`glow-${r.id}`} d={r.path} fill="none" stroke={r.color} strokeWidth="12" strokeOpacity="0.1" />
              ))}
              
              {/* Active Route Lines */}
              {routes.map(r => (
                <path key={`line-${r.id}`} d={r.path} fill="none" stroke={r.color} strokeWidth="2" strokeDasharray="12 12" />
              ))}
            </svg>

            {/* Landmarks */}
            <Landmark x={400} y={200} label="Central Hub" icon={<Home size={14} />} color="blue" />
            <Landmark x={700} y={450} label="South Station" icon={<MapPin size={14} />} color="purple" />
            <Landmark x={100} y={100} label="North Point" icon={<MapPin size={14} />} color="orange" />
            <Landmark x={100} y={700} label="Industrial Park" icon={<MapPin size={14} />} color="slate" />

            {/* Neighborhood Labels */}
            <div className="absolute top-[10%] left-[50%] -translate-x-1/2 text-[40px] font-black font-display text-white/5 uppercase tracking-[0.2em] pointer-events-none">DOWNTOWN</div>
            <div className="absolute bottom-[20%] left-[15%] text-[40px] font-black font-display text-white/5 uppercase tracking-[0.2em] pointer-events-none">WEST SIDE</div>

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
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gr-dark shadow-xl border-2 border-white/10 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: routes.find(r => r.id === bus.route)?.color }}
                  >
                    <Bus size={20} />
                  </div>
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md px-2 py-1 rounded-lg shadow-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] font-black text-white">{bus.route} - Active</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Zoom Controls */}
        <div className="absolute right-8 bottom-8 flex flex-col gap-3 z-30">
          <button onClick={zoomIn} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/10 hover:bg-white/10 active:scale-95 transition-all">
            <Plus size={24} />
          </button>
          <button onClick={zoomOut} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/10 hover:bg-white/10 active:scale-95 transition-all">
            <Minus size={24} />
          </button>
        </div>

        {/* Stats Overlay */}
        <div className="absolute left-8 bottom-8 z-30 hidden lg:block">
          <div className="bg-gr-dark/90 backdrop-blur-md p-6 rounded-[30px] shadow-2xl border border-white/10 max-w-xs">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-4">Traffic Insights</h3>
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
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
    orange: 'bg-orange-500/10 text-orange-500',
    slate: 'bg-white/5 text-white/40',
  };

  return (
    <div className="absolute flex flex-col items-center" style={{ top: y, left: x }}>
      <div className={`w-8 h-8 ${colorMap[color]} rounded-lg flex items-center justify-center shadow-sm mb-1`}>
        {icon}
      </div>
      <span className="text-[9px] font-bold text-white/20 font-display uppercase tracking-tighter whitespace-nowrap">{label}</span>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string, value: string, color: string }) {
  const colorMap: any = {
    green: 'bg-gr-lime',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${colorMap[color]}`}></div>
        <span className="text-xs font-bold text-white/40">{label}</span>
      </div>
      <span className="text-xs font-black text-white">{value}</span>
    </div>
  );
}

function TrackingScreen({ bus, onBack, onBook }: { bus: BusInfo, onBack: () => void, onBook: () => void }) {
  const [zoom, setZoom] = useState(1);
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[600px] bg-gr-dark rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
      <div className="flex-1 relative bg-gr-dark overflow-hidden">
        <motion.div 
          animate={{ scale: zoom }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="absolute inset-0 origin-center"
        >
          <div className="absolute inset-0 bg-gr-dark">
          <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none"></div>
          
          <svg className="absolute inset-0 w-full h-full">
            <path d="M -100 200 L 1200 200" fill="none" stroke="#ffffff03" strokeWidth="60" strokeLinecap="round" />
            <path d="M 400 -100 L 400 1000" fill="none" stroke="#ffffff03" strokeWidth="60" strokeLinecap="round" />
            
            <path d="M 100 100 Q 200 200 400 300 T 800 500" fill="none" stroke="#7ec94a05" strokeWidth="20" strokeLinecap="round" />
            <path d="M 100 100 Q 200 200 400 300 T 800 500" fill="none" stroke="#7ec94a" strokeWidth="2" strokeDasharray="10 10" strokeOpacity="0.3" />
          </svg>

          {/* Markers */}
          <motion.div 
            animate={{ x: [100, 300, 500, 700], y: [100, 220, 350, 450] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute z-20"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gr-lime/20 rounded-full animate-ping"></div>
              <div className="w-14 h-14 bg-gr-lime rounded-3xl flex items-center justify-center text-gr-dark shadow-2xl border-4 border-gr-dark">
                <Bus size={28} />
              </div>
            </div>
          </motion.div>
        </div>
        </motion.div>

        <div className="absolute right-6 bottom-32 flex flex-col gap-3 z-30">
          <button onClick={zoomIn} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white shadow-xl hover:bg-white/10 border border-white/10">
            <Plus size={20} />
          </button>
          <button onClick={zoomOut} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white shadow-xl hover:bg-white/10 border border-white/10">
            <Minus size={20} />
          </button>
        </div>

        <button onClick={onBack} className="absolute top-6 left-6 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white shadow-xl hover:bg-white/10 border border-white/10 z-30">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="w-full lg:w-96 p-10 flex flex-col bg-gr-dark border-l border-white/10 shrink-0">
        <div className="flex-1">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black font-display text-white mb-2 leading-none">Live Tracking</h2>
            <p className="text-white/40 font-medium tracking-tight">Monitor your bus in real-time</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-gr-lime/10 rounded-2xl flex items-center justify-center shrink-0">
                <Bus size={24} className="text-gr-lime" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Current Route</p>
                <div className="font-bold text-white text-lg leading-tight">{bus.name}</div>
                <div className="text-gr-lime font-black text-xl mt-1">Route {bus.route}</div>
              </div>
            </div>

            <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 relative overflow-hidden">
              <div className="absolute right-[-20%] bottom-[-20%] w-32 h-32 bg-gr-lime/5 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Arrival ETA</p>
                  <p className="text-4xl font-black text-white leading-none">{bus.eta}<span className="text-sm text-white/40 font-bold ml-1">min</span></p>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gr-lime shadow-sm">
                  <Clock size={24} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Bus Capacity</h4>
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-white/40">{bus.seats} / 54 seats free</span>
                    <span className="text-gr-lime">Low density</span>
                 </div>
                 <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{width: 0}} animate={{width: '30%'}} className="h-full bg-gr-lime"></motion.div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onBook}
          className="w-full bg-gr-lime text-gr-dark py-5 rounded-[24px] font-black text-lg shadow-xl shadow-gr-lime/20 active:scale-95 transition-all mt-10"
        >
          Book This Bus
        </button>
      </div>
    </div>
  );
}

function BookingScreen({ bus, onBack, onContinue, selectedSeat, setSelectedSeat }: { bus: BusInfo, onBack: () => void, onContinue: () => void, selectedSeat: string | null, setSelectedSeat: (s: string | null) => void }) {
  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[700px] bg-gr-dark rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
      <div className="w-full lg:w-[450px] bg-gr-dark p-10 shrink-0 border-r border-white/10 flex flex-col">
        <div className="flex-1">
          <button onClick={onBack} className="flex items-center gap-2 text-white/40 font-bold hover:text-white transition-colors mb-10">
            <ChevronLeft size={20} strokeWidth={3} /> Back to tracking
          </button>
          
          <h2 className="text-4xl font-black font-display text-white mb-2 leading-none">Select Seat</h2>
          <p className="text-white/40 font-medium mb-12">Route {bus.route} • RWF {bus.fare}</p>

          <div className="space-y-6 mb-12">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
               <span className="text-sm font-bold text-white/40">Selected Seat</span>
               <span className="text-xl font-black text-gr-lime">{selectedSeat || 'None'}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onContinue}
          disabled={!selectedSeat}
          className={`w-full py-5 rounded-[24px] font-black text-lg shadow-xl transition-all mt-10 active:scale-95 ${
            selectedSeat 
              ? 'bg-gr-lime text-gr-dark shadow-gr-lime/20' 
              : 'bg-white/5 text-white/20 cursor-not-allowed shadow-none'
          }`}
        >
          Confirm {selectedSeat ? `Seat ${selectedSeat}` : 'Selection'}
        </button>
      </div>

      <div className="flex-1 p-10 flex items-center justify-center bg-gr-dark">
        <div className="bg-white/5 p-12 rounded-[60px] shadow-2xl border-8 border-white/5">
          <div className="flex flex-col gap-8">
            {[1, 2, 3, 4, 5, 6, 7].map((row) => (
              <div key={row} className="flex gap-12">
                <div className="flex gap-4">
                  <Seat id={`${row}A`} selected={selectedSeat} onSelect={setSelectedSeat} />
                  <Seat id={`${row}B`} selected={selectedSeat} onSelect={setSelectedSeat} />
                </div>
                <div className="flex gap-4">
                  <Seat id={`${row}C`} selected={selectedSeat} onSelect={setSelectedSeat} />
                  <Seat id={`${row}D`} selected={selectedSeat} onSelect={setSelectedSeat} />
                </div>
              </div>
            ))}
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
        taken ? 'bg-white/5 text-white/10' :
        isSelected ? 'bg-gr-lime text-gr-dark shadow-lg shadow-gr-lime/40 scale-110' :
        'bg-white/5 text-white/40 hover:bg-white/10 border border-white/10 hover:border-gr-lime/30'
      }`}
    >
      {id}
    </button>
  );
}

function PaymentScreen({ onBack, onPay, selectedSeat, method, setMethod, profile }: { onBack: () => void, onPay: () => void, selectedSeat: string | null, method: string, setMethod: (m: 'wallet' | 'mtn' | 'airtel') => void, profile: UserProfile }) {
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors"><ChevronLeft size={32} /></button>
        <h2 className="text-5xl font-black font-display text-white tracking-tight">Checkout</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white/5 border-2 border-white/10 p-8 rounded-[40px] shadow-2xl">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase mb-1">Route</p>
                <p className="text-xl font-bold text-white leading-tight">14B — Nyabugogo to CBD</p>
              </div>
              <hr className="border-white/5" />
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-white/40 uppercase">Total amount</p>
                <p className="text-3xl font-black text-gr-lime">RWF 400</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <PaymentMethod 
              id="wallet" 
              icon={<CreditCard className="text-gr-lime" size={20} />} 
              label="Smart Wallet" 
              detail={`RWF ${profile.walletBalance.toLocaleString()}`} 
              active={method === 'wallet'} 
              onClick={() => setMethod('wallet')} 
            />
          </div>

          <button 
            onClick={onPay}
            className="w-full bg-gr-lime text-gr-dark py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-gr-lime/20 active:scale-95 transition-all mt-6"
          >
            Pay & Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentMethod({ icon, label, detail, active, onClick }: { icon: React.ReactNode, label: string, detail: string, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 p-5 rounded-[28px] border-2 transition-all cursor-pointer ${active ? 'bg-white/10 border-gr-lime shadow-xl shadow-gr-lime/5' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
    >
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-white leading-none mb-1">{label}</div>
        <div className="text-[10px] text-white/20 font-bold uppercase tracking-tight">{detail}</div>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${active ? 'border-gr-lime bg-gr-lime' : 'border-white/10'}`}>
        {active && <Check size={14} className="text-gr-dark" strokeWidth={4} />}
      </div>
    </div>
  );
}

function TapGoScreen({ onBack, onBoard, selectedSeat, name }: { onBack: () => void, onBoard: () => void, selectedSeat: string | null, name: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-12 max-w-3xl mx-auto py-20 px-4">
      <div className="text-center">
        <h2 className="text-6xl font-black font-display text-white mb-4 tracking-tight">Tap & Board</h2>
        <p className="text-white/40 font-medium text-lg">Present this screen to the reader on the bus</p>
      </div>

      <div className="relative group">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gr-lime rounded-full blur-3xl -z-10"
        ></motion.div>
        
        <div onClick={onBoard} className="w-80 h-80 bg-white/5 border-8 border-white/10 rounded-full shadow-2xl flex flex-col items-center justify-center gap-6 cursor-pointer hover:scale-105 active:scale-95 transition-all">
          <Smartphone size={80} className="text-gr-lime" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Device Ready</p>
            <p className="text-2xl font-black text-white">Seat {selectedSeat || 'C4'}</p>
          </div>
        </div>
      </div>

      <button onClick={onBack} className="text-white/20 font-bold hover:text-white transition-colors uppercase tracking-widest text-[10px]"> Cancel & Go Back </button>
    </div>
  );
}

function SuccessScreen({ name, onDone, selectedSeat }: { name: string, onDone: () => void, selectedSeat: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white/5 rounded-[60px] p-12 shadow-2xl flex flex-col items-center text-center border-8 border-white/10"
      >
        <div className="w-24 h-24 bg-gr-lime rounded-[32px] flex items-center justify-center text-gr-dark mb-10 shadow-2xl shadow-gr-lime/30">
          <Check size={48} strokeWidth={3} />
        </div>

        <h2 className="text-5xl font-black font-display text-white mb-4 tracking-tight">Successful!</h2>
        <p className="text-white/40 font-medium text-lg mb-12">Trip confirmed. Have a safe journey, {name}!</p>

        <button 
          onClick={onDone}
          className="w-full bg-gr-lime text-gr-dark py-5 rounded-[24px] font-black text-xl shadow-2xl shadow-gr-lime/20 active:scale-95 transition-all"
        >
          Return Home
        </button>
      </motion.div>
    </div>
  );
}

function ProfileScreen({ profile, onBack, onNavigate }: { profile: UserProfile, onBack: () => void, onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center gap-6">
        <div className="w-32 h-32 bg-gr-lime rounded-[40px] flex items-center justify-center text-gr-dark text-5xl font-black shadow-2xl shadow-gr-lime/20">
          {profile.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-5xl font-black font-display text-white tracking-tight mb-2">{profile.name}</h1>
          <span className="bg-gr-lime/10 text-gr-lime px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gr-lime/20">
            Gold Member
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfileStat icon={<CreditCard size={24} />} label="Balance" value={`RWF ${profile.walletBalance.toLocaleString()}`} color="text-gr-lime" bg="bg-white/5" />
        <ProfileStat icon={<MapPin size={24} />} label="Trips" value="14 Rides" color="text-white" bg="bg-white/5" />
        
        <button 
          onClick={() => { localStorage.removeItem('greenroot_user'); onNavigate('login'); }}
          className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function ProfileStat({ icon, label, value, color, bg }: { icon: React.ReactNode, label: string, value: string, color: string, bg: string }) {
  return (
    <div className={`p-6 rounded-[32px] ${bg} border border-white/10 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} bg-white/5 shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">{label}</p>
        <p className={`text-xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function Footer({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <footer className="bg-gr-dark border-t border-white/5 pt-20 pb-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gr-lime rounded-xl flex items-center justify-center text-gr-dark shadow-lg shadow-gr-lime/20">
                <Bus size={24} strokeWidth={1.5} />
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-white">Greenroot</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Reimagining city transit for Rwanda. Fast, reliable, and eco-friendly bus tracking and booking at your fingertips.
            </p>
            <div className="flex items-center gap-4">
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Facebook size={18} />} />
              <SocialIcon icon={<Instagram size={18} />} />
              <SocialIcon icon={<Mail size={18} />} />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              <FooterLink onClick={() => onNavigate('home')}>Dashboard</FooterLink>
              <FooterLink onClick={() => onNavigate('liveMap')}>Live Map</FooterLink>
              <FooterLink onClick={() => onNavigate('destination')}>Book a Seat</FooterLink>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-white/20 text-xs font-medium">© 2026 Greenroot Inc.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 hover:bg-gr-lime hover:text-gr-dark hover:scale-110 transition-all">
      {icon}
    </button>
  );
}

function FooterLink({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) {
  return (
    <li>
      <button 
        onClick={onClick}
        className="text-white/40 text-sm font-medium hover:text-gr-lime transition-colors w-full text-left"
      >
        {children}
      </button>
    </li>
  );
}
