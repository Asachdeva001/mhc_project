'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, RefreshCcw, AlertTriangle, X, BarChart, TrendingUp, Sparkles,
  Zap, CloudRain, Bed
} from 'lucide-react';

import MoodGraph from '../../components/MoodGraph';
import Navigation from '../../components/Navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/authContext';

// Helper function for a personal touch
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [moodEntries, setMoodEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [todayMood, setTodayMood] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        loadDashboardData();
      } else {
        router.push('/auth/signin');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      const [entriesData, insightsData, todayData] = await Promise.all([
        api.mood.getMoodEntries({ limit: 30 }),
        api.mood.getMoodInsights(7),
        api.mood.getTodayMood()
      ]);
      setMoodEntries(entriesData || []);
      setInsights(insightsData || null);
      setTodayMood(todayData || null);
      setError('');
    } catch (error) {
      setError(`Failed to load dashboard data. Please try again.`);
    } finally {
      setDataLoading(false);
    }
  };

  const handleMoodLogged = () => {
    loadDashboardData();
  };

  const chartData = moodEntries.slice(0, 7).reverse().map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
    mood: entry.mood
  }));

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-sky-50">
      <Navigation currentPage="dashboard" />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      >
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="mb-6 p-4 bg-red-100 border border-red-300 rounded-2xl flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-800"><X size={20} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'}!
            </h1>
            <p className="text-slate-500 mt-1">Ready to check in with yourself?</p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={dataLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-slate-600 rounded-full shadow-sm hover:bg-slate-100 transition border border-slate-200 disabled:opacity-50"
          >
            {dataLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            <span>{dataLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          <div className="space-y-8 lg:col-span-1">
            <DailyCheckin todayMood={todayMood} onMoodLogged={handleMoodLogged} />
            <Insights insights={insights} />
          </div>

          <div className="space-y-8 lg:col-span-2">
            <motion.div layout className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-1">Your 7-Day Mood Flow</h2>
              <p className="text-slate-500 text-sm mb-4">See the patterns in your recent feelings.</p>
              <div className="h-64 w-full relative">
                {chartData.length > 0 ? <MoodGraph data={chartData} /> : <EmptyState message="Log your mood to see your graph grow." />}
              </div>
            </motion.div>

            {/* ✅ New video feed card */}
<VideoCheckIn onMoodLogged={handleMoodLogged} />


            <RecentEntries entries={moodEntries} />
          </div>

        </div>
      </motion.main>
    </div>
  );
}

/* --- Sub-Components --- */

const DailyCheckin = ({ todayMood, onMoodLogged }) => {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMood, setNewMood] = useState({ level: 5, note: '', energy: 3, stress: 3, sleep: 7 });

  const moodOptions = [
    { mood: 1, emoji: '😔', color: 'bg-red-400' },
    { mood: 3, emoji: '😐', color: 'bg-yellow-400' },
    { mood: 5, emoji: '🙂', color: 'bg-green-400' },
    { mood: 7, emoji: '😄', color: 'bg-teal-400' },
    { mood: 9, emoji: '🤩', color: 'bg-sky-400' },
  ];

  const handleMoodSelect = (level) => {
    setNewMood({ ...newMood, level });
    setShowForm(true);
  };

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    if (!newMood.note.trim()) {
      setError('Please add a brief note about your feelings.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.mood.logMood({
        mood: newMood.level, note: newMood.note.trim(), energy: newMood.energy,
        stress: newMood.stress, sleep: newMood.sleep
      });
      setShowForm(false);
      onMoodLogged();
      setNewMood({ level: 5, note: '', energy: 3, stress: 3, sleep: 7 });
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (todayMood?.hasEntry && !showForm) {
    return (
      <motion.div layout className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-700">You've logged your mood today!</p>
        <p className="text-4xl my-3">{moodOptions.find(o => o.mood >= todayMood.moodEntry.mood)?.emoji || '😊'}</p>
        <p className="text-slate-600 italic">“{todayMood.moodEntry.note}”</p>
        <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-teal-600 hover:underline">Update Entry</button>
      </motion.div>
    );
  }

  return (
    <motion.div layout className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">How are you feeling now?</h2>
      <div className="flex justify-around items-center mb-6">
        {moodOptions.map(({ mood, emoji }) => (
          <motion.button key={mood} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => handleMoodSelect(mood)}
            className={`text-3xl p-3 rounded-full transition ${newMood.level === mood && showForm ? 'bg-teal-100 ring-2 ring-teal-500' : 'hover:bg-slate-100'}`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleMoodSubmit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
            className="space-y-4 overflow-hidden"
          >
            {/* <SliderInput label="Mood Level" icon={Sparkles} min={1} max={10} value={newMood.level} onChange={(v) => setNewMood({ ...newMood, level: v })} color="bg-teal-500" /> */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SliderInput label="Energy" icon={Zap} min={1} max={5} value={newMood.energy} onChange={(v) => setNewMood({ ...newMood, energy: v })} color="bg-amber-500" />
              <SliderInput label="Stress" icon={CloudRain} min={1} max={5} value={newMood.stress} onChange={(v) => setNewMood({ ...newMood, stress: v })} color="bg-sky-500" />
              {/* --- FIX: Corrected the typo from newM to newMood --- */}
              <SliderInput label="Sleep" icon={Bed} min={0} max={12} value={newMood.sleep} onChange={(v) => setNewMood({ ...newMood, sleep: v })} color="bg-indigo-500" />
            </div>
            <textarea value={newMood.note} onChange={(e) => setNewMood({ ...newMood, note: e.target.value })}
              placeholder="What’s contributing to this feeling?" rows="3" required
              className="w-full text-gray-500 rounded-xl p-3 border transition bg-slate-50" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex space-x-2 pt-2">
              <button type="submit" disabled={isLoading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-full transition flex items-center justify-center">
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Entry'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 rounded-full transition">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Insights = ({ insights }) => (
  <motion.div layout className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6">
    <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Insights</h2>
    <div className="space-y-4">
      <InsightCard icon={BarChart} title="7-Day Avg. Mood" value={insights ? `${insights.averageMood || 0}/10` : '...'} color="text-emerald-600" />
      <InsightCard icon={Sparkles} title="Current Streak" value={insights ? `${insights.currentStreak || 0} days` : '...'} color="text-sky-600" />
      <InsightCard icon={TrendingUp} title="Mood Trend" value={insights ? insights.moodTrend || 'Stable' : '...'} color="text-amber-600" />
    </div>
  </motion.div>
);

const RecentEntries = ({ entries }) => (
  <motion.div layout className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6">
    <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Entries</h2>
    {entries.length === 0 ? <EmptyState message="Your recent mood entries will appear here." /> : (
      <motion.div className="space-y-3" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible">
        {entries.slice(0, 5).map((entry) => <RecentEntryItem key={entry.id} entry={entry} />)}
      </motion.div>
    )}
  </motion.div>
);

const RecentEntryItem = ({ entry }) => {
  const getMoodColor = (mood) => {
    if (mood <= 3) return 'bg-red-200 text-red-800';
    if (mood <= 6) return 'bg-yellow-200 text-yellow-800';
    if (mood <= 8) return 'bg-green-200 text-green-800';
    return 'bg-teal-200 text-teal-800';
  };

  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      className="flex items-start justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200/60"
    >
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getMoodColor(entry.mood)}`}>
          {entry.mood}/10
        </div>
        <div>
          <p className="font-semibold text-slate-700">{new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
          <p className="text-sm text-slate-600 italic">“{entry.note || 'No note'}”</p>
          <div className="flex space-x-4 text-xs text-slate-500 mt-2">
            {entry.energy && <span className="flex items-center"><Zap size={12} className="mr-1 text-amber-500" /> {entry.energy}/5</span>}
            {entry.stress && <span className="flex items-center"><CloudRain size={12} className="mr-1 text-sky-500" /> {entry.stress}/5</span>}
            {entry.sleep && <span className="flex items-center"><Bed size={12} className="mr-1 text-indigo-500" /> {entry.sleep}h</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InsightCard = ({ icon: Icon, title, value, color }) => (
  <div className="flex items-center space-x-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
    <div className={`p-3 rounded-full bg-white ${color}`}><Icon size={20} /></div>
    <div>
      <h3 className="text-sm text-slate-600">{title}</h3>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

const SliderInput = ({ label, icon: Icon, min, max, value, onChange, color }) => (
  <div className="w-full">
    <label className="flex items-center text-sm font-medium text-slate-600 mb-2">
      <Icon size={14} className="mr-2" /> {label}
    </label>
    <div className="relative flex items-center">
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-2 rounded-lg cursor-pointer appearance-none ${color}`}
        style={{ backgroundSize: `${(value - min) * 100 / (max - min)}% 100%` }}
      />
      <span className="text-xs text-slate-500 font-semibold ml-3 w-8 text-right">{value}</span>
    </div>
  </div>
);

const VideoCheckIn = ({ onMoodLogged }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null); // { mood, emotion, confidence }

  const startVideo = async () => {
    try {
      setError('');
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStreaming(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and device.');
      setIsStreaming(false);
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const captureAndLogMood = async () => {
    if (!videoRef.current) return;

    try {
      setIsProcessing(true);
      setError('');

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg'); // base64 frame

      const res = await api.mood.logVideoMood(dataUrl);
      setResult(res);

      // Refresh dashboard data
      if (onMoodLogged) onMoodLogged();
    } catch (err) {
      console.error('Error logging video mood:', err);
      setError('Could not analyze mood from video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <motion.div
      layout
      className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Video Mood Check-in</h2>
          <p className="text-slate-500 text-sm">
            Use your camera to capture a quick snapshot and let the app estimate your mood.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={isStreaming ? stopVideo : startVideo}
            className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm border transition
              ${
                isStreaming
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  : 'bg-teal-600 text-white border-teal-700 hover:bg-teal-700'
              }`}
          >
            {isStreaming ? 'Stop Video' : 'Start Video'}
          </button>
          {isStreaming && (
            <button
              onClick={captureAndLogMood}
              disabled={isProcessing}
              className="px-4 py-2 rounded-full text-sm font-semibold shadow-sm border bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 disabled:opacity-60"
            >
              {isProcessing ? 'Analyzing…' : 'Capture & Log Mood'}
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full bg-slate-900 rounded-2xl overflow-hidden aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 text-sm bg-slate-900/60">
            <p>Camera is off.</p>
            <p className="mt-1">Click &quot;Start Video&quot; to begin.</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-200 text-sm bg-slate-900/70 p-4 text-center">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="mt-3 text-sm text-slate-700">
          <p>
            Detected mood: <span className="font-semibold">{result.mood}/10</span>{' '}
            {result.emotion && (
              <span className="text-slate-500">({result.emotion}, conf: {(result.confidence ?? 0).toFixed(2)})</span>
            )}
          </p>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        A single snapshot is sent securely to our mood model to estimate your emotion and mood score.
      </p>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};


const EmptyState = ({ message }) => (
  <div className="text-center py-10">
    <p className="text-slate-500">{message}</p>
  </div>
);