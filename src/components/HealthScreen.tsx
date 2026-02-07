import { useState, useEffect } from 'react';
import {
  Activity,
  Droplet,
  Pill,
  Moon,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Heart,
  ChevronRight,
  Circle
} from 'lucide-react';
import { getCases } from '@/lib/apiClient';
import type { HealthCase } from '@/types';

interface HealthScreenProps {
  onNavigateToCases: () => void;
  onNavigateToMedications: () => void;
}

interface HealthHabit {
  id: string;
  label: string;
  icon: any;
  completed: boolean;
}

interface MoodEntry {
  date: string;
  mood: number; // 1-5 scale
  emoji: string;
}

const MOOD_EMOJIS = ['😖', '😣', '😟', '😐', '😃'];
const MOOD_LABELS = ['Very Bad', 'Bad', 'Okay', 'Good', 'Great'];
const MOOD_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

const STORAGE_KEYS = {
  HABITS: 'medilens_health_habits',
  MOOD: 'medilens_mood_history',
};

export function HealthScreen({ onNavigateToCases, onNavigateToMedications }: HealthScreenProps) {
  const [habits, setHabits] = useState<HealthHabit[]>([
    { id: 'water', label: 'Drank enough water', icon: Droplet, completed: false },
    { id: 'medicine', label: 'Took medicine', icon: Pill, completed: false },
    { id: 'sleep', label: 'Slept well', icon: Moon, completed: false },
    { id: 'symptoms', label: 'Checked symptoms', icon: Activity, completed: false },
  ]);

  const [currentMood, setCurrentMood] = useState<number>(3); // Default to neutral
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [todaysFocus, setTodaysFocus] = useState<{
    message: string;
    severity: 'low' | 'medium' | 'high';
    iconType: 'heart' | 'activity' | 'alert';
  }>({
    message: 'Stay hydrated and maintain your health routine.',
    severity: 'low',
    iconType: 'heart',
  });
  const [recentCases, setRecentCases] = useState<HealthCase[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);

  // Load habits from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`${STORAGE_KEYS.HABITS}_${today}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHabits(parsed);
      } catch (error) {
        console.error('Failed to load habits:', error);
      }
    }
  }, []);

  // Load mood history
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.MOOD);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMoodHistory(parsed);
        
        // Set current mood if already logged today
        const today = new Date().toISOString().split('T')[0];
        const todayMood = parsed.find((entry: MoodEntry) => entry.date === today);
        if (todayMood) {
          setCurrentMood(todayMood.mood);
        }
      } catch (error) {
        console.error('Failed to load mood history:', error);
      }
    }
  }, []);

  // Load recent cases for smart focus
  useEffect(() => {
    const loadCases = async () => {
      try {
        setIsLoadingCases(true);
        const cases = await getCases();
        setRecentCases(cases);
        
        // Generate smart focus based on recent cases
        if (cases.length > 0) {
          const latestCase = cases[0];
          const openCases = cases.filter(c => c.status === 'open' || c.status === 'in_progress');
          
          if (latestCase.severity === 'high' || latestCase.severity === 'emergency') {
            setTodaysFocus({
              message: 'Your recent symptoms look serious. Consider visiting a hospital or consulting a doctor today.',
              severity: 'high',
              iconType: 'alert',
            });
          } else if (openCases.length > 0) {
            setTodaysFocus({
              message: `You have ${openCases.length} active case${openCases.length > 1 ? 's' : ''}. Monitor your symptoms and follow medical advice.`,
              severity: 'medium',
              iconType: 'activity',
            });
          } else {
            setTodaysFocus({
              message: 'Great job staying on top of your health! Keep up your daily habits.',
              severity: 'low',
              iconType: 'heart',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load cases:', error);
      } finally {
        setIsLoadingCases(false);
      }
    };

    loadCases();
  }, []);

  // Save habits to localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`${STORAGE_KEYS.HABITS}_${today}`, JSON.stringify(habits));
  }, [habits]);

  const toggleHabit = (habitId: string) => {
    setHabits(prev =>
      prev.map(habit =>
        habit.id === habitId ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const saveMood = () => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: MoodEntry = {
      date: today,
      mood: currentMood,
      emoji: MOOD_EMOJIS[currentMood - 1],
    };

    const updatedHistory = [
      newEntry,
      ...moodHistory.filter(entry => entry.date !== today),
    ].slice(0, 30); // Keep last 30 days

    setMoodHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEYS.MOOD, JSON.stringify(updatedHistory));
  };

  const handleMoodChange = (value: number) => {
    setCurrentMood(value);
  };

  useEffect(() => {
    // Auto-save mood after 1 second of no changes
    const timer = setTimeout(() => {
      saveMood();
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentMood]);

  const completedHabits = habits.filter(h => h.completed).length;
  const habitProgress = (completedHabits / habits.length) * 100;

  const last7DaysMood = moodHistory.slice(0, 7).reverse();
  const avgMood = last7DaysMood.length > 0
    ? last7DaysMood.reduce((sum, entry) => sum + entry.mood, 0) / last7DaysMood.length
    : 3;

  const focusColors = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-600' },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' },
  };

  const focusColor = focusColors[todaysFocus.severity];

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-10 pb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-3xl font-bold mb-1">Health</h1>
            <p className="text-blue-100 text-sm">Track your daily wellness</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Today's Health Focus Card */}
        <div className={`${focusColor.bg} border ${focusColor.border} rounded-2xl p-5 shadow-sm`}>
          <div className="flex items-start space-x-3">
            <div className={`${focusColor.bg} p-2 rounded-lg`}>
              {todaysFocus.iconType === 'heart' && <Heart className={`w-6 h-6 ${focusColor.icon}`} />}
              {todaysFocus.iconType === 'activity' && <Activity className={`w-6 h-6 ${focusColor.icon}`} />}
              {todaysFocus.iconType === 'alert' && <AlertCircle className={`w-6 h-6 ${focusColor.icon}`} />}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold ${focusColor.text} mb-1`}>Today's Health Focus</h3>
              <p className={`text-sm ${focusColor.text}`}>{todaysFocus.message}</p>
            </div>
          </div>
        </div>

        {/* My Health Habits */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">My Health Habits</h2>
            <span className="text-sm font-semibold text-blue-600">
              {completedHabits}/{habits.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${habitProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Habit Checklist */}
          <div className="space-y-3">
            {habits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                  habit.completed
                    ? 'bg-green-50 border-2 border-green-500'
                    : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className={`flex-shrink-0 ${habit.completed ? 'text-green-600' : 'text-gray-400'}`}>
                  {habit.completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>
                <div className={`flex-shrink-0 ${habit.completed ? 'text-green-600' : 'text-gray-500'}`}>
                  {habit.id === 'water' && <Droplet className="w-5 h-5" />}
                  {habit.id === 'medicine' && <Pill className="w-5 h-5" />}
                  {habit.id === 'sleep' && <Moon className="w-5 h-5" />}
                  {habit.id === 'symptoms' && <Activity className="w-5 h-5" />}
                </div>
                <span
                  className={`flex-1 text-left font-medium ${
                    habit.completed ? 'text-green-700 line-through' : 'text-gray-700'
                  }`}
                >
                  {habit.label}
                </span>
              </button>
            ))}
          </div>

          {completedHabits === habits.length && (
            <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-green-700 font-semibold text-sm">
                🎉 Great job! All habits completed today!
              </p>
            </div>
          )}
        </div>

        {/* How Are You Feeling? Mood Slider */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 text-lg mb-4">How Are You Feeling?</h2>

          {/* Current Mood Display */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">{MOOD_EMOJIS[currentMood - 1]}</div>
            <p className="text-lg font-semibold text-gray-700">{MOOD_LABELS[currentMood - 1]}</p>
          </div>

          {/* Mood Slider */}
          <div className="mb-6">
            <input
              type="range"
              min="1"
              max="5"
              value={currentMood}
              onChange={(e) => handleMoodChange(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #fca5a5, #fcd34d, #86efac)`,
              }}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>😖</span>
              <span>😣</span>
              <span>😟</span>
              <span>😐</span>
              <span>😃</span>
            </div>
          </div>

          {/* Mood History - Last 7 Days */}
          {last7DaysMood.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700 text-sm">Last 7 Days</h3>
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>Avg: {MOOD_EMOJIS[Math.round(avgMood) - 1]}</span>
                </div>
              </div>
              <div className="flex items-end justify-between space-x-2 h-24">
                {last7DaysMood.map((entry, index) => {
                  const height = (entry.mood / 5) * 100;
                  const colorClass = MOOD_COLORS[entry.mood - 1];
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full ${colorClass} rounded-t transition-all`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">
                        {new Date(entry.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onNavigateToCases}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-sm">My Cases</p>
                <p className="text-xs text-gray-500">View history</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={onNavigateToMedications}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Pill className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-sm">Medications</p>
                <p className="text-xs text-gray-500">Track meds</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Health Tip */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-4">
          <h4 className="font-semibold text-purple-900 mb-2 text-sm">💡 Daily Health Tip</h4>
          <p className="text-xs text-purple-700">
            Staying consistent with your health habits is more important than perfection. Small daily actions lead to big results!
          </p>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
