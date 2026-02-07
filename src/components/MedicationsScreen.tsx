import { useState, useEffect } from 'react';
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
  Edit,
  X,
  Save,
  Download,
  Share2,
  History,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'once' | 'twice' | 'thrice' | 'custom';
  customFrequency?: number;
  timeSlots: string[];
  takenHistory: { [date: string]: boolean[] };
  startDate: string;
  endDate?: string;
  duration?: number; // in days
  prescribedBy: string;
  purpose: string;
  instructions?: string;
  withFood?: boolean;
  color: string;
  reminderEnabled: boolean;
  refillReminder?: number; // days before end
  createdAt: string;
  updatedAt: string;
}

interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: 'once' | 'twice' | 'thrice' | 'custom';
  customFrequency: string;
  timeSlots: string[];
  startDate: string;
  endDate: string;
  duration: string;
  prescribedBy: string;
  purpose: string;
  instructions: string;
  withFood: boolean;
  color: string;
  reminderEnabled: boolean;
  refillReminder: string;
}

interface MedicationsScreenProps {
  onBack: () => void;
}

const STORAGE_KEY = 'medilens_medications';
const COLORS = ['blue', 'red', 'yellow', 'green', 'purple', 'pink', 'cyan', 'orange'];

const getColorClass = (color: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' },
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-500' },
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-500' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-500' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500' },
  };
  return colors[color] || colors.blue;
};

const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

const getFrequencyLabel = (frequency: string, customFrequency?: number) => {
  if (frequency === 'custom' && customFrequency) {
    return `${customFrequency}x daily`;
  }
  const labels: Record<string, string> = {
    once: 'Once daily',
    twice: 'Twice daily',
    thrice: 'Three times daily',
  };
  return labels[frequency] || frequency;
};

export function MedicationsScreen({ onBack }: MedicationsScreenProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [expandedMedId, setExpandedMedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    dosage: '',
    frequency: 'once',
    customFrequency: '',
    timeSlots: ['09:00'],
    startDate: getTodayString(),
    endDate: '',
    duration: '',
    prescribedBy: '',
    purpose: '',
    instructions: '',
    withFood: false,
    color: 'blue',
    reminderEnabled: true,
    refillReminder: '7',
  });

  // Load medications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMedications(parsed);
      } catch (error) {
        console.error('Failed to load medications:', error);
      }
    }
  }, []);

  // Save medications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
  }, [medications]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Schedule notifications for medications
  useEffect(() => {
    medications.forEach(med => {
      if (med.reminderEnabled && 'Notification' in window && Notification.permission === 'granted') {
        med.timeSlots.forEach((time, index) => {
          const [hours, minutes] = time.split(':').map(Number);
          const now = new Date();
          const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
          
          if (scheduledTime > now) {
            const timeUntil = scheduledTime.getTime() - now.getTime();
            setTimeout(() => {
              new Notification(`Time to take ${med.name}`, {
                body: `${med.dosage} - ${med.instructions || 'Take as prescribed'}`,
                icon: '/pill-icon.png',
                tag: `${med.id}-${index}`,
              });
            }, timeUntil);
          }
        });
      }
    });
  }, [medications]);

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'once',
      customFrequency: '',
      timeSlots: ['09:00'],
      startDate: getTodayString(),
      endDate: '',
      duration: '',
      prescribedBy: '',
      purpose: '',
      instructions: '',
      withFood: false,
      color: 'blue',
      reminderEnabled: true,
      refillReminder: '7',
    });
  };

  const handleFrequencyChange = (freq: 'once' | 'twice' | 'thrice' | 'custom') => {
    let slots: string[] = [];
    switch (freq) {
      case 'once':
        slots = ['09:00'];
        break;
      case 'twice':
        slots = ['09:00', '21:00'];
        break;
      case 'thrice':
        slots = ['09:00', '14:00', '21:00'];
        break;
      case 'custom':
        slots = ['09:00'];
        break;
    }
    setFormData({ ...formData, frequency: freq, timeSlots: slots });
  };

  const addTimeSlot = () => {
    setFormData({ ...formData, timeSlots: [...formData.timeSlots, '09:00'] });
  };

  const removeTimeSlot = (index: number) => {
    setFormData({ ...formData, timeSlots: formData.timeSlots.filter((_, i) => i !== index) });
  };

  const updateTimeSlot = (index: number, value: string) => {
    const newSlots = [...formData.timeSlots];
    newSlots[index] = value;
    setFormData({ ...formData, timeSlots: newSlots });
  };

  const saveMedication = (editId?: string) => {
    if (!formData.name || !formData.dosage || !formData.prescribedBy || !formData.purpose) {
      alert('Please fill in all required fields');
      return;
    }

    const today = getTodayString();
    const newMed: Medication = {
      id: editId || `med_${Date.now()}`,
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      customFrequency: formData.frequency === 'custom' ? parseInt(formData.customFrequency) : undefined,
      timeSlots: formData.timeSlots,
      takenHistory: editId ? (medications.find(m => m.id === editId)?.takenHistory || {}) : {},
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      prescribedBy: formData.prescribedBy,
      purpose: formData.purpose,
      instructions: formData.instructions || undefined,
      withFood: formData.withFood,
      color: formData.color,
      reminderEnabled: formData.reminderEnabled,
      refillReminder: formData.refillReminder ? parseInt(formData.refillReminder) : undefined,
      createdAt: editId ? (medications.find(m => m.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Initialize today's tracking if not exists
    if (!newMed.takenHistory[today]) {
      newMed.takenHistory[today] = new Array(newMed.timeSlots.length).fill(false);
    }

    if (editId) {
      setMedications(prev => prev.map(m => m.id === editId ? newMed : m));
    } else {
      setMedications(prev => [...prev, newMed]);
    }

    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedMedication(null);
    resetForm();
  };

  const editMedication = (med: Medication) => {
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      customFrequency: med.customFrequency?.toString() || '',
      timeSlots: med.timeSlots,
      startDate: med.startDate,
      endDate: med.endDate || '',
      duration: med.duration?.toString() || '',
      prescribedBy: med.prescribedBy,
      purpose: med.purpose,
      instructions: med.instructions || '',
      withFood: med.withFood || false,
      color: med.color,
      reminderEnabled: med.reminderEnabled,
      refillReminder: med.refillReminder?.toString() || '7',
    });
    setSelectedMedication(med);
    setShowEditModal(true);
  };

  const deleteMedication = (id: string) => {
    if (confirm('Are you sure you want to delete this medication?')) {
      setMedications(prev => prev.filter(m => m.id !== id));
    }
  };

  const toggleDoseTaken = (medId: string, slotIndex: number) => {
    const today = getTodayString();
    setMedications(prev => prev.map(med => {
      if (med.id === medId) {
        const history = { ...med.takenHistory };
        if (!history[today]) {
          history[today] = new Array(med.timeSlots.length).fill(false);
        }
        history[today][slotIndex] = !history[today][slotIndex];
        return { ...med, takenHistory: history };
      }
      return med;
    }));
  };

  const exportMedicationLog = () => {
    const report = medications.map(med => ({
      name: med.name,
      dosage: med.dosage,
      frequency: getFrequencyLabel(med.frequency, med.customFrequency),
      prescribedBy: med.prescribedBy,
      purpose: med.purpose,
      adherence: calculateAdherence(med),
      history: med.takenHistory,
    }));

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medication-log-${getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareMedicationLog = async () => {
    const report = medications.map(med => ({
      name: med.name,
      dosage: med.dosage,
      frequency: getFrequencyLabel(med.frequency, med.customFrequency),
      prescribedBy: med.prescribedBy,
      purpose: med.purpose,
      adherence: calculateAdherence(med),
    }));

    const text = `Medication Report - ${getTodayString()}\n\n${report.map(r => 
      `${r.name} (${r.dosage})\nFrequency: ${r.frequency}\nPrescribed by: ${r.prescribedBy}\nAdherence: ${r.adherence}\n`
    ).join('\n')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Medication Report',
          text: text,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      alert('Sharing not supported on this device. Use Export instead.');
    }
  };

  const calculateAdherence = (med: Medication): string => {
    const days = Object.keys(med.takenHistory).length;
    if (days === 0) return '0%';
    
    let totalDoses = 0;
    let takenDoses = 0;
    
    Object.values(med.takenHistory).forEach(dayDoses => {
      totalDoses += dayDoses.length;
      takenDoses += dayDoses.filter(Boolean).length;
    });
    
    return totalDoses > 0 ? `${Math.round((takenDoses / totalDoses) * 100)}%` : '0%';
  };

  const viewHistory = (med: Medication) => {
    setSelectedMedication(med);
    setShowHistoryModal(true);
  };

  const today = getTodayString();
  const todayProgress = medications.reduce((total, med) => {
    const taken = (med.takenHistory[today] || []).filter(Boolean).length;
    return total + taken;
  }, 0);

  const totalDoses = medications.reduce((total, med) => total + med.timeSlots.length, 0);
  const progressPercentage = totalDoses > 0 ? (todayProgress / totalDoses) * 100 : 0;

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 pt-10 pb-6 flex-shrink-0">
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
          <div className="flex items-center space-x-2">
            <button
              onClick={exportMedicationLog}
              className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all"
              title="Export Log"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <Pill className="w-6 h-6 text-white" />
            </div>
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
        {medications.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pill className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Medications Yet</h3>
            <p className="text-gray-600 mb-6">Start tracking your medications by adding your first prescription</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Medication</span>
            </button>
          </div>
        ) : (
          <>
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
                const todayDoses = med.takenHistory[today] || new Array(med.timeSlots.length).fill(false);
                const allTaken = todayDoses.every(Boolean);
                const someTaken = todayDoses.some(Boolean);
                const isExpanded = expandedMedId === med.id;

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
                              <p className="text-sm text-gray-600">{med.dosage} • {getFrequencyLabel(med.frequency, med.customFrequency)}</p>
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
                              onClick={() => toggleDoseTaken(med.id, index)}
                              className={`px-3 py-2 rounded-lg border-2 transition-all ${
                                todayDoses[index]
                                  ? 'bg-green-50 border-green-500 text-green-700'
                                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-purple-500'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">{time}</span>
                                {todayDoses[index] && <CheckCircle className="w-4 h-4" />}
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

                      {/* Expandable Details */}
                      {isExpanded && (
                        <div className="space-y-3 mb-3">
                          {med.instructions && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="text-xs text-blue-600 mb-1 flex items-center">
                                <Info className="w-3 h-3 mr-1" />
                                Instructions
                              </div>
                              <div className="text-sm text-gray-900">{med.instructions}</div>
                            </div>
                          )}
                          
                          {med.withFood && (
                            <div className="bg-amber-50 rounded-lg p-3">
                              <div className="text-xs text-amber-600 mb-1">⚠️ Take with food</div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-xs text-gray-600 mb-1">Adherence</div>
                              <div className="font-bold text-lg text-purple-600">{calculateAdherence(med)}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-xs text-gray-600 mb-1">Days Tracked</div>
                              <div className="font-bold text-lg text-blue-600">{Object.keys(med.takenHistory).length}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Doctor & Date */}
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                        <span>Prescribed by {med.prescribedBy}</span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Since {new Date(med.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => setExpandedMedId(isExpanded ? null : med.id)}
                          className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center space-x-2 text-sm"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          <span>{isExpanded ? 'Less' : 'More'}</span>
                        </button>
                        <button
                          onClick={() => viewHistory(med)}
                          className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-all"
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => editMedication(med)}
                          className="bg-purple-50 text-purple-600 p-2 rounded-lg hover:bg-purple-100 transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMedication(med.id)}
                          className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Share Options */}
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Share2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Share with Doctor</h4>
                  <p className="text-blue-700 text-sm mb-3">
                    Export or share your medication log with your healthcare provider
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={exportMedicationLog}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={shareMedicationLog}
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all text-sm flex items-center space-x-2 border border-blue-200"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal - Full Screen Mobile View */}
      {(showAddModal || showEditModal) && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 pt-10 pb-6 flex-shrink-0">
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedMedication(null);
                resetForm();
              }}
              className="mb-4 flex items-center text-white hover:text-purple-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 mr-1" />
              <span className="font-medium">Back</span>
            </button>
            
            <div>
              <h1 className="text-white text-2xl font-bold mb-1">
                {showEditModal ? 'Edit Medication' : 'Add Medication'}
              </h1>
              <p className="text-purple-100 text-sm">Fill in the details below</p>
            </div>
          </div>

          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="px-6 py-6 space-y-4">
              {/* Medication Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medication Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Aspirin, Metformin"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Dosage */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dosage <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g., 500mg, 10ml, 2 tablets"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['once', 'twice', 'thrice', 'custom'] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => handleFrequencyChange(freq)}
                      className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                        formData.frequency === freq
                          ? 'bg-purple-50 border-purple-500 text-purple-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      {freq === 'once' && 'Once Daily'}
                      {freq === 'twice' && 'Twice Daily'}
                      {freq === 'thrice' && 'Three Times'}
                      {freq === 'custom' && 'Custom'}
                    </button>
                  ))}
                </div>
                {formData.frequency === 'custom' && (
                  <input
                    type="number"
                    value={formData.customFrequency}
                    onChange={(e) => setFormData({ ...formData, customFrequency: e.target.value })}
                    placeholder="Times per day"
                    min="1"
                    max="10"
                    className="w-full mt-3 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time Slots <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.timeSlots.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {formData.timeSlots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 transition-all flex-shrink-0"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.frequency === 'custom' && (
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="w-full bg-purple-50 text-purple-600 py-3 rounded-xl font-semibold hover:bg-purple-100 transition-all flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Time Slot</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 30, 90"
                  min="1"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Prescribed By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prescribed By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.prescribedBy}
                  onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                  placeholder="Dr. Name"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g., Blood pressure, Pain relief"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="e.g., Take with food, Avoid alcohol"
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* With Food */}
              <div className="flex items-center space-x-3 bg-white rounded-xl p-4 border border-gray-200">
                <input
                  type="checkbox"
                  id="withFood"
                  checked={formData.withFood}
                  onChange={(e) => setFormData({ ...formData, withFood: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="withFood" className="text-sm font-medium text-gray-700">
                  Take with food
                </label>
              </div>

              {/* Reminder */}
              <div className="flex items-center space-x-3 bg-white rounded-xl p-4 border border-gray-200">
                <input
                  type="checkbox"
                  id="reminderEnabled"
                  checked={formData.reminderEnabled}
                  onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="reminderEnabled" className="text-sm font-medium text-gray-700 flex items-center">
                  <Bell className="w-4 h-4 mr-2 text-purple-600" />
                  Enable reminders
                </label>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => {
                    const colorClass = getColorClass(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-12 h-12 rounded-xl border-2 transition-all ${colorClass.bg} ${
                          formData.color === color
                            ? `${colorClass.border} scale-110`
                            : 'border-transparent hover:scale-105'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Refill Reminder */}
              <div className="pb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Refill Reminder (Days Before)
                </label>
                <input
                  type="number"
                  value={formData.refillReminder}
                  onChange={(e) => setFormData({ ...formData, refillReminder: e.target.value })}
                  placeholder="7"
                  min="1"
                  max="30"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Fixed Bottom Buttons */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedMedication(null);
                resetForm();
              }}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => saveMedication(selectedMedication?.id)}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{showEditModal ? 'Update' : 'Save'}</span>
            </button>
          </div>
        </div>
      )}

      {/* History Modal - Full Screen Mobile View */}
      {showHistoryModal && selectedMedication && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 pt-10 pb-6 flex-shrink-0">
            <button
              onClick={() => {
                setShowHistoryModal(false);
                setSelectedMedication(null);
              }}
              className="mb-4 flex items-center text-white hover:text-purple-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 mr-1" />
              <span className="font-medium">Back</span>
            </button>
            
            <div>
              <h1 className="text-white text-2xl font-bold mb-1">History</h1>
              <p className="text-purple-100 text-sm">{selectedMedication.name}</p>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="px-6 py-6">
              <div className="mb-4">
                <h4 className="font-bold text-lg text-gray-900">{selectedMedication.name}</h4>
                <p className="text-sm text-gray-600">{selectedMedication.dosage}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-6">
                <div className="text-sm text-purple-600 mb-1">Overall Adherence</div>
                <div className="text-4xl font-bold text-purple-700 mb-2">{calculateAdherence(selectedMedication)}</div>
                <div className="text-sm text-purple-600">
                  {Object.keys(selectedMedication.takenHistory).length} days tracked
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-semibold text-gray-900 text-lg mb-4">Daily History</h5>
                {Object.entries(selectedMedication.takenHistory)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 30)
                  .map(([date, doses]) => {
                    const takenCount = doses.filter(Boolean).length;
                    const totalCount = doses.length;
                    const percentage = (takenCount / totalCount) * 100;

                    return (
                      <div key={date} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {new Date(date).toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-sm font-bold text-purple-600">
                            {takenCount}/{totalCount} doses
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percentage === 100 ? 'bg-green-500' : percentage > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
