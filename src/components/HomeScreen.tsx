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
  Droplet,
  Phone,
  LogOut,
  Shield
} from 'lucide-react';
import { HealthScreen } from './HealthScreen';

interface UserProfile {
  name: string;
  email: string;
  age?: string;
  gender?: string;
  medicalInfo?: string;
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  zip_code?: string;
  blood_type?: string;
  height?: number;
  weight?: number;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_number?: string;
}

interface HomeScreenProps {
  userProfile: UserProfile | null;
  onStartReport: () => void;
  onNavigateToHospitals: () => void;
  onNavigateToCases: () => void;
  onNavigateToMedications?: () => void;
  onNavigateToAppointments?: () => void;
  onSignOut?: () => void;
  onEditProfile?: () => void;
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

export function HomeScreen({ 
  userProfile, 
  onStartReport, 
  onNavigateToHospitals, 
  onNavigateToCases, 
  onNavigateToMedications, 
  onNavigateToAppointments,
  onSignOut,
  onEditProfile
}: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'health' | 'care' | 'profile'>('home');
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-10 pb-6 flex-shrink-0">
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
              onClick={() => setShowSignOutConfirm(true)}
              className="bg-white/10 text-white/95 px-3 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition-all flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
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

      {/* Main Content - Conditional based on activeTab */}
      {activeTab === 'home' && (
        <div className="flex-1 overflow-y-auto px-6 py-6">
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

          {/* Recent Cases */}
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
                          className={`text-xs px-2 py-1 rounded-full ${
                            case_.status === 'Resolved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {case_.status}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        case_.priority === 'Medium'
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
      )}

      {/* Health Tab */}
      {activeTab === 'health' && (
        <HealthScreen
          onNavigateToCases={onNavigateToCases}
          onNavigateToMedications={onNavigateToMedications || (() => {})}
        />
      )}

      {/* Care Tab */}
      {activeTab === 'care' && (
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Contacts</h2>

          {/* Primary Emergency Numbers */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              Primary Emergency Numbers
            </h3>
            <div className="space-y-3">
              <a href="tel:112" className="bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center justify-between hover:bg-red-100 transition-all active:scale-95">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-600 p-3 rounded-full">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">112</p>
                    <p className="text-sm text-gray-600">National Emergency (Police, Fire, Ambulance)</p>
                  </div>
                </div>
                <div className="text-red-600 text-2xl">→</div>
              </a>

              <a href="tel:108" className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-all active:scale-95">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-3 rounded-full">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">108</p>
                    <p className="text-sm text-gray-600">Emergency Medical Ambulance</p>
                  </div>
                </div>
                <div className="text-blue-600 text-xl">→</div>
              </a>

              <a href="tel:102" className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-all active:scale-95">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-600 p-3 rounded-full">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">102</p>
                    <p className="text-sm text-gray-600">Maternal & Child Healthcare</p>
                  </div>
                </div>
                <div className="text-pink-600 text-xl">→</div>
              </a>
            </div>
          </div>

          {/* Health & Medical Helplines */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-blue-600" />
              Health & Medical Helplines
            </h3>
            <div className="space-y-2">
              <a href="tel:104" className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">104</p>
                    <p className="text-xs text-gray-600">Health Helpline (Medical Advice)</p>
                  </div>
                </div>
                <div className="text-green-600">→</div>
              </a>

              <a href="tel:181" className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">181</p>
                    <p className="text-xs text-gray-600">Women's Helpline</p>
                  </div>
                </div>
                <div className="text-purple-600">→</div>
              </a>

              <a href="tel:1098" className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">1098</p>
                    <p className="text-xs text-gray-600">Child Protection Emergency</p>
                  </div>
                </div>
                <div className="text-orange-600">→</div>
              </a>

              <a href="tel:1073" className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">1073</p>
                    <p className="text-xs text-gray-600">Road Accident Emergency</p>
                  </div>
                </div>
                <div className="text-red-600">→</div>
              </a>

              <a href="tel:1033" className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">1033</p>
                    <p className="text-xs text-gray-600">National Highway Emergency</p>
                  </div>
                </div>
                <div className="text-yellow-600">→</div>
              </a>

              <a href="tel:14567" className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">14567</p>
                    <p className="text-xs text-gray-600">Senior Citizen Helpline</p>
                  </div>
                </div>
                <div className="text-blue-600">→</div>
              </a>

              <a href="tel:1097" className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">1097</p>
                    <p className="text-xs text-gray-600">AIDS Helpline</p>
                  </div>
                </div>
                <div className="text-pink-600">→</div>
              </a>

              <a href="tel:1066" className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">1066</p>
                    <p className="text-xs text-gray-600">Anti-Poison Helpline</p>
                  </div>
                </div>
                <div className="text-green-600">→</div>
              </a>
            </div>
          </div>

          {/* Metropolitan Contacts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-cyan-600" />
              Metropolitan Services
            </h3>
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-3">
                <p className="font-semibold text-gray-900 text-sm mb-2">Mumbai/BMC</p>
                <div className="space-y-1">
                  <a href="tel:1916" className="flex items-center justify-between text-sm hover:bg-white/50 p-2 rounded-lg transition-all">
                    <span className="text-gray-700">1916 - Disaster Control</span>
                    <Phone className="w-4 h-4 text-blue-600" />
                  </a>
                  <a href="tel:1292" className="flex items-center justify-between text-sm hover:bg-white/50 p-2 rounded-lg transition-all">
                    <span className="text-gray-700">1292 - Disaster Management</span>
                    <Phone className="w-4 h-4 text-blue-600" />
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3">
                <p className="font-semibold text-gray-900 text-sm mb-2">Delhi/NCR</p>
                <div className="space-y-1">
                  <a href="tel:18001210000" className="flex items-center justify-between text-sm hover:bg-white/50 p-2 rounded-lg transition-all">
                    <span className="text-gray-700">1800 121 - RED Health</span>
                    <Phone className="w-4 h-4 text-purple-600" />
                  </a>
                  <a href="tel:01126593677" className="flex items-center justify-between text-sm hover:bg-white/50 p-2 rounded-lg transition-all">
                    <span className="text-gray-700">011-26593677 - Poison Control</span>
                    <Phone className="w-4 h-4 text-purple-600" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Quick Tips
            </h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>112 India App:</strong> Download for panic calls with location data</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Smart Phone SOS:</strong> Press power button 3 times quickly for emergency alert</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Private Ambulances:</strong> Consider RED Health or app-based services in metros for faster response</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900">{userProfile?.name}</h2>
                <p className="text-gray-600 text-sm">{userProfile?.email}</p>
              </div>
            </div>

            {/* Personal Information */}
            {(userProfile?.phone_number || userProfile?.date_of_birth || userProfile?.gender) && (
              <div className="mb-4">
                <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="space-y-2">
                  {userProfile?.phone_number && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Phone</span>
                      <span className="font-semibold text-gray-900 text-sm">{userProfile.phone_number}</span>
                    </div>
                  )}
                  {userProfile?.date_of_birth && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Date of Birth</span>
                      <span className="font-semibold text-gray-900 text-sm">{userProfile.date_of_birth}</span>
                    </div>
                  )}
                  {userProfile?.gender && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Gender</span>
                      <span className="font-semibold text-gray-900 text-sm">{userProfile.gender}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Address */}
            {(userProfile?.address || userProfile?.city || userProfile?.zip_code) && (
              <div className="mb-4">
                <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-green-600" />
                  Address
                </h3>
                <div className="space-y-2">
                  {userProfile?.address && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Street</span>
                      <span className="font-semibold text-gray-900 text-sm">{userProfile.address}</span>
                    </div>
                  )}
                  {userProfile?.city && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">City</span>
                      <span className="font-semibold text-gray-900 text-sm">{userProfile.city}</span>
                    </div>
                  )}
                  {userProfile?.zip_code && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Zip Code</span>
                      <span className="font-semibold text-gray-900 text-sm">{userProfile.zip_code}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Health Details */}
            {(userProfile?.blood_type || userProfile?.height || userProfile?.weight) && (
              <div className="mb-4">
                <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center">
                  <Droplet className="w-4 h-4 mr-2 text-red-600" />
                  Health Details
                </h3>
                <div className="space-y-2">
                  {userProfile?.blood_type && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Blood Type</span>
                      <span className="font-semibold text-gray-900 text-sm">{userProfile.blood_type}</span>
                    </div>
                  )}
                  {userProfile?.height && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Height</span>
                      <span className="font-semibold text-gray-900 text-sm">{userProfile.height} cm</span>
                    </div>
                  )}
                  {userProfile?.weight && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Weight</span>
                      <span className="font-semibold text-gray-900 text-sm">{userProfile.weight} kg</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Medical History */}
          {(userProfile?.allergies || userProfile?.chronic_conditions || userProfile?.current_medications) && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center">
                <Heart className="w-4 h-4 mr-2 text-purple-600" />
                Medical History
              </h3>
              <div className="space-y-3">
                {userProfile?.allergies && (
                  <div>
                    <span className="text-xs font-semibold text-gray-600 block mb-1">Allergies</span>
                    <p className="text-gray-900 bg-orange-50 p-3 rounded-lg text-sm">
                      {userProfile.allergies}
                    </p>
                  </div>
                )}
                {userProfile?.chronic_conditions && (
                  <div>
                    <span className="text-xs font-semibold text-gray-600 block mb-1">Chronic Conditions</span>
                    <p className="text-gray-900 bg-blue-50 p-3 rounded-lg text-sm">
                      {userProfile.chronic_conditions}
                    </p>
                  </div>
                )}
                {userProfile?.current_medications && (
                  <div>
                    <span className="text-xs font-semibold text-gray-600 block mb-1">Current Medications</span>
                    <p className="text-gray-900 bg-purple-50 p-3 rounded-lg text-sm">
                      {userProfile.current_medications}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {(userProfile?.emergency_contact_name || userProfile?.emergency_contact_phone) && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-red-600" />
                Emergency Contact
              </h3>
              <div className="space-y-2">
                {userProfile?.emergency_contact_name && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">Name</span>
                    <span className="font-semibold text-gray-900 text-sm">{userProfile.emergency_contact_name}</span>
                  </div>
                )}
                {userProfile?.emergency_contact_phone && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">Phone</span>
                    <span className="font-semibold text-gray-900 text-sm">{userProfile.emergency_contact_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Insurance */}
          {(userProfile?.insurance_provider || userProfile?.insurance_number) && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-600" />
                Insurance
              </h3>
              <div className="space-y-2">
                {userProfile?.insurance_provider && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">Provider</span>
                    <span className="font-semibold text-gray-900 text-sm">{userProfile.insurance_provider}</span>
                  </div>
                )}
                {userProfile?.insurance_number && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">Policy Number</span>
                    <span className="font-semibold text-gray-900 text-sm">{userProfile.insurance_number}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Profile Button */}
          <button
            onClick={onEditProfile}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 mb-4"
          >
            <Settings className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 safe-area-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'home' ? 'bg-blue-50' : ''}`}>
              <Home className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === 'health' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'health' ? 'bg-blue-50' : ''}`}>
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Health</span>
          </button>

          <button
            onClick={() => setActiveTab('care')}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === 'care' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'care' ? 'bg-blue-50' : ''}`}>
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Care</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'profile' ? 'bg-blue-50' : ''}`}>
              <User className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out?</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to sign out of your account?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSignOutConfirm(false);
                  if (onSignOut) onSignOut();
                }}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
