import { useState } from 'react';
import {
  AlertCircle,
  FolderOpen,
  MapPin,
  User,
  Heart,
  Activity,
  Pill,
  Calendar,
  Clock,
  Home,
  Settings,
  Bell,
  Zap,
  Droplet,
  Moon,
  TrendingUp,
  Target,
  Smartphone,
  BookOpen,
  Phone
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  age?: string;
  gender?: string;
  medicalInfo?: string;
}

interface HomeScreenProps {
  userProfile: UserProfile | null;
  onStartReport: () => void;
  onNavigateToHospitals: () => void;
  onNavigateToCases: () => void;
  onNavigateToMedications?: () => void;
  onNavigateToAppointments?: () => void;
  onSignOut?: () => void;
}

const mockCases = [
  {
    id: 1,
    title: 'Fever and Headache',
    date: '2026-01-28',
    status: 'Under Review',
    priority: 'Medium'
  },
  {
    id: 2,
    title: 'Stomach Pain',
    date: '2026-01-25',
    status: 'Resolved',
    priority: 'Low'
  },
];

export function HomeScreen({ userProfile, onStartReport, onNavigateToHospitals, onNavigateToCases, onNavigateToMedications, onNavigateToAppointments, onSignOut }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'health' | 'care' | 'profile'>('home');

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-100 text-sm">Welcome back,</p>
            <h1 className="text-white text-2xl font-bold mt-1">
              Hi, {userProfile?.name || 'User'}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all">
              <Bell className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => onSignOut?.()}
              className="bg-white/10 text-white/95 px-3 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <Activity className="w-5 h-5 text-white mb-1" />
            <p className="text-white text-xs">Health Score</p>
            <p className="text-white font-bold text-lg">85</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <FolderOpen className="w-5 h-5 text-white mb-1" />
            <p className="text-white text-xs">Active Cases</p>
            <p className="text-white font-bold text-lg">2</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <Calendar className="w-5 h-5 text-white mb-1" />
            <p className="text-white text-xs">Next Visit</p>
            <p className="text-white font-bold text-lg">5d</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'home' ? (
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
          {/* Primary CTA */}
          <button onClick={onStartReport} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="font-bold text-xl">Report Health Issue</h2>
                  <p className="text-blue-100 text-sm mt-1">Get instant AI-powered triage</p>
                </div>
              </div>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-white text-xl">→</span>
              </div>
            </div>
          </button>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button onClick={onNavigateToCases} className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-3 rounded-xl inline-block mb-3">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">My Cases</h3>
              <p className="text-gray-600 text-xs mt-1">View history</p>
            </button>

            <button onClick={onNavigateToHospitals} className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-xl inline-block mb-3">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Hospitals</h3>
              <p className="text-gray-600 text-xs mt-1">Find nearby</p>
            </button>

            <button onClick={onNavigateToMedications} className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl inline-block mb-3">
                <Pill className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Medications</h3>
              <p className="text-gray-600 text-xs mt-1">Manage meds</p>
            </button>

            <button onClick={onNavigateToAppointments} className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-3 rounded-xl inline-block mb-3">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Appointments</h3>
              <p className="text-gray-600 text-xs mt-1">Schedule visit</p>
            </button>
          </div>

          {/* Recent Cases Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Recent Cases</h3>
              <button className="text-blue-600 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {mockCases.map((case_) => (
                <div
                  key={case_.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{case_.title}</h4>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {case_.date}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${case_.status === 'Resolved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                            }`}
                        >
                          {case_.status}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${case_.priority === 'Medium'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}
                    >
                      {case_.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
          {/* Profile View */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900">{userProfile?.name}</h2>
                <p className="text-gray-600 text-sm">{userProfile?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Age</span>
                <span className="font-semibold text-gray-900">{userProfile?.age || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Gender</span>
                <span className="font-semibold text-gray-900">{userProfile?.gender || 'Not set'}</span>
              </div>
              {userProfile?.medicalInfo && (
                <div className="py-3">
                  <span className="text-gray-600 block mb-2">Medical Information</span>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">
                    {userProfile.medicalInfo}
                  </p>
                </div>
              )}
            </div>
          </div>

          <button className="w-full bg-white text-gray-700 border border-gray-200 py-4 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 safe-area-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'
              }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'home' ? 'bg-blue-50' : ''}`}>
              <Home className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            className="flex flex-col items-center space-y-1 text-gray-400"
            onClick={() => { }}
          >
            <div className="p-2 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Health</span>
          </button>

          <button
            className="flex flex-col items-center space-y-1 text-gray-400"
            onClick={() => setActiveTab('health')} // Care/Health tab can be handled if needed
          >
            <div className="p-2 rounded-xl">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Care</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'
              }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'profile' ? 'bg-blue-50' : ''}`}>
              <User className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}