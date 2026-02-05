import { useState } from 'react';
import { 
  ChevronLeft, 
  Pill, 
  Plus, 
  Clock,
  Calendar,
  Bell,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit
} from 'lucide-react';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  timeSlots: string[];
  takenToday: boolean[];
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  purpose: string;
  color: string;
}

interface MedicationsScreenProps {
  onBack: () => void;
}

const mockMedications: Medication[] = [
  {
    id: 1,
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    timeSlots: ['08:00 AM', '08:00 PM'],
    takenToday: [true, false],
    startDate: '2026-01-15',
    prescribedBy: 'Dr. Sarah Johnson',
    purpose: 'Type 2 Diabetes',
    color: 'blue'
  },
  {
    id: 2,
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    timeSlots: ['09:00 AM'],
    takenToday: [true],
    startDate: '2026-01-10',
    prescribedBy: 'Dr. Michael Chen',
    purpose: 'High Blood Pressure',
    color: 'red'
  },
  {
    id: 3,
    name: 'Vitamin D3',
    dosage: '1000 IU',
    frequency: 'Once daily',
    timeSlots: ['08:00 AM'],
    takenToday: [false],
    startDate: '2026-02-01',
    prescribedBy: 'Dr. Emily White',
    purpose: 'Vitamin Deficiency',
    color: 'yellow'
  },
  {
    id: 4,
    name: 'Aspirin',
    dosage: '81mg',
    frequency: 'Once daily',
    timeSlots: ['07:00 PM'],
    takenToday: [false],
    startDate: '2025-12-20',
    prescribedBy: 'Dr. Sarah Johnson',
    purpose: 'Cardiovascular Health',
    color: 'green'
  },
];

export function MedicationsScreen({ onBack }: MedicationsScreenProps) {
  const [medications] = useState<Medication[]>(mockMedications);
  const [showAddModal, setShowAddModal] = useState(false);

  const getColorClass = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' },
      red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-500' },
      green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500' },
    };
    return colors[color] || colors.blue;
  };

  const todayProgress = medications.reduce((total, med) => {
    const taken = med.takenToday.filter(Boolean).length;
    return total + taken;
  }, 0);

  const totalDoses = medications.reduce((total, med) => total + med.timeSlots.length, 0);
  const progressPercentage = totalDoses > 0 ? (todayProgress / totalDoses) * 100 : 0;

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-white hover:text-purple-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          <span className="font-medium">Back</span>
        </button>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-3xl font-bold mb-1">Medications</h1>
            <p className="text-purple-100 text-sm">Manage your prescriptions</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
            <Pill className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-medium">Today's Progress</span>
            <span className="text-white text-sm font-bold">
              {todayProgress}/{totalDoses} doses
            </span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-4 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-purple-600">{medications.length}</div>
          <div className="text-xs text-gray-600">Active Meds</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-green-600">{todayProgress}</div>
          <div className="text-xs text-gray-600">Taken Today</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalDoses - todayProgress}</div>
          <div className="text-xs text-gray-600">Remaining</div>
        </div>
      </div>

      {/* Medications List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-lg">Your Medications</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>

        <div className="space-y-4">
          {medications.map((med) => {
            const colorClass = getColorClass(med.color);
            const allTaken = med.takenToday.every(Boolean);
            const someTaken = med.takenToday.some(Boolean);

            return (
              <div
                key={med.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Color Bar */}
                <div className={`h-1 ${colorClass.bg}`}></div>

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`${colorClass.bg} p-2 rounded-lg`}>
                          <Pill className={`w-5 h-5 ${colorClass.text}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{med.name}</h3>
                          <p className="text-sm text-gray-600">{med.dosage} • {med.frequency}</p>
                        </div>
                      </div>
                    </div>
                    {allTaken ? (
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-semibold">Complete</span>
                      </div>
                    ) : someTaken ? (
                      <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-semibold">In Progress</span>
                      </div>
                    ) : (
                      <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-semibold">Pending</span>
                      </div>
                    )}
                  </div>

                  {/* Time Slots */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {med.timeSlots.map((time, index) => (
                        <button
                          key={index}
                          className={`px-3 py-2 rounded-lg border-2 transition-all ${
                            med.takenToday[index]
                              ? 'bg-green-50 border-green-500 text-green-700'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-purple-500'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{time}</span>
                            {med.takenToday[index] && <CheckCircle className="w-4 h-4" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="text-xs text-gray-600 mb-1">Purpose</div>
                    <div className="font-medium text-gray-900 text-sm">{med.purpose}</div>
                  </div>

                  {/* Doctor */}
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <span>Prescribed by {med.prescribedBy}</span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Since {new Date(med.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button className="flex-1 bg-purple-50 text-purple-600 py-2 rounded-lg font-semibold hover:bg-purple-100 transition-all flex items-center justify-center space-x-2 text-sm">
                      <Bell className="w-4 h-4" />
                      <span>Set Reminder</span>
                    </button>
                    <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Refill Reminder */}
        <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start space-x-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">Refill Reminders</h4>
              <p className="text-amber-700 text-sm mb-3">
                2 medications will need refills in the next 7 days
              </p>
              <button className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-all text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal (Placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-xl text-gray-900 mb-4">Add New Medication</h3>
            <p className="text-gray-600 mb-4">This feature will allow you to add new medications to track.</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
