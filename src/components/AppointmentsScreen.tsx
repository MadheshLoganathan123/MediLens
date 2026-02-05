import { useState } from 'react';
import { 
  ChevronLeft, 
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  Phone,
  Plus,
  ChevronRight,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Appointment {
  id: number;
  type: 'In-Person' | 'Teleconsult' | 'Follow-up';
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location?: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  purpose: string;
  avatar: string;
}

interface AppointmentsScreenProps {
  onBack: () => void;
}

const mockAppointments: Appointment[] = [
  {
    id: 1,
    type: 'In-Person',
    doctor: 'Dr. Sarah Johnson',
    specialty: 'General Physician',
    date: '2026-02-05',
    time: '09:00 AM',
    location: 'City General Hospital, Room 302',
    status: 'Upcoming',
    purpose: 'Annual checkup',
    avatar: '👩‍⚕️'
  },
  {
    id: 2,
    type: 'Teleconsult',
    doctor: 'Dr. Michael Chen',
    specialty: 'Cardiologist',
    date: '2026-02-08',
    time: '02:30 PM',
    status: 'Upcoming',
    purpose: 'Follow-up on blood pressure',
    avatar: '👨‍⚕️'
  },
  {
    id: 3,
    type: 'Follow-up',
    doctor: 'Dr. Emily White',
    specialty: 'Dermatologist',
    date: '2026-02-12',
    time: '11:00 AM',
    location: 'QuickCare Clinic',
    status: 'Upcoming',
    purpose: 'Skin rash follow-up',
    avatar: '👩‍⚕️'
  },
  {
    id: 4,
    type: 'In-Person',
    doctor: 'Dr. Robert Davis',
    specialty: 'Orthopedic',
    date: '2026-01-25',
    time: '10:00 AM',
    location: 'Central Medical Hospital',
    status: 'Completed',
    purpose: 'Back pain consultation',
    avatar: '👨‍⚕️'
  },
  {
    id: 5,
    type: 'Teleconsult',
    doctor: 'Dr. Lisa Anderson',
    specialty: 'Psychiatrist',
    date: '2026-01-20',
    time: '03:00 PM',
    status: 'Cancelled',
    purpose: 'Mental health consultation',
    avatar: '👩‍⚕️'
  },
];

export function AppointmentsScreen({ onBack }: AppointmentsScreenProps) {
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');
  const [showBookModal, setShowBookModal] = useState(false);

  const filteredAppointments = mockAppointments.filter(
    appt => filter === 'All' || appt.status === filter
  );

  const upcomingCount = mockAppointments.filter(a => a.status === 'Upcoming').length;
  const nextAppt = mockAppointments.find(a => a.status === 'Upcoming');

  const getTypeConfig = (type: Appointment['type']) => {
    switch (type) {
      case 'In-Person':
        return { icon: MapPin, bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'Teleconsult':
        return { icon: Video, bg: 'bg-green-100', text: 'text-green-700' };
      case 'Follow-up':
        return { icon: Clock, bg: 'bg-purple-100', text: 'text-purple-700' };
    }
  };

  const getStatusConfig = (status: Appointment['status']) => {
    switch (status) {
      case 'Upcoming':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Calendar };
      case 'Completed':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle };
      case 'Cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle };
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-white hover:text-orange-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          <span className="font-medium">Back</span>
        </button>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-3xl font-bold mb-1">Appointments</h1>
            <p className="text-orange-100 text-sm">{upcomingCount} upcoming appointment{upcomingCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
            <Calendar className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Next Appointment Card */}
        {nextAppt && (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="text-white text-xs font-medium mb-2">Next Appointment</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{nextAppt.avatar}</div>
                <div>
                  <div className="text-white font-semibold">{nextAppt.doctor}</div>
                  <div className="text-orange-100 text-sm">
                    {new Date(nextAppt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {nextAppt.time}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-lg">
            {filter === 'All' ? 'All Appointments' : `${filter} Appointments`}
          </h2>
          <button
            onClick={() => setShowBookModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-orange-700 transition-all flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Book New</span>
          </button>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 text-sm text-center max-w-xs">
              {filter === 'All' ? 'Book your first appointment' : `No ${filter.toLowerCase()} appointments`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appt) => {
              const typeConfig = getTypeConfig(appt.type);
              const statusConfig = getStatusConfig(appt.status);
              const TypeIcon = typeConfig.icon;
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={appt.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-4xl">{appt.avatar}</div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{appt.doctor}</h3>
                        <p className="text-sm text-gray-600">{appt.specialty}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`${typeConfig.bg} ${typeConfig.text} px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}>
                            <TypeIcon className="w-3 h-3" />
                            <span>{appt.type}</span>
                          </span>
                          <span className={`${statusConfig.bg} ${statusConfig.text} px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{appt.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-600">Date</div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {new Date(appt.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-600">Time</div>
                          <div className="font-semibold text-gray-900 text-sm">{appt.time}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  {appt.location && (
                    <div className="flex items-start space-x-2 mb-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-600">Location</div>
                        <div className="text-sm text-gray-900">{appt.location}</div>
                      </div>
                    </div>
                  )}

                  {/* Purpose */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-600 mb-1">Purpose</div>
                    <div className="text-sm text-gray-900 font-medium">{appt.purpose}</div>
                  </div>

                  {/* Actions */}
                  {appt.status === 'Upcoming' && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      {appt.type === 'Teleconsult' ? (
                        <button className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center justify-center space-x-2">
                          <Video className="w-4 h-4" />
                          <span>Join Call</span>
                        </button>
                      ) : (
                        <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>Get Directions</span>
                        </button>
                      )}
                      <button className="bg-gray-100 text-gray-700 p-2.5 rounded-xl hover:bg-gray-200 transition-all">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-red-100 transition-all text-sm">
                        Cancel
                      </button>
                    </div>
                  )}

                  {appt.status === 'Completed' && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl font-semibold hover:bg-blue-100 transition-all text-sm">
                        View Summary
                      </button>
                      <button className="flex-1 bg-purple-50 text-purple-600 py-2.5 rounded-xl font-semibold hover:bg-purple-100 transition-all text-sm">
                        Book Follow-up
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="bg-white border-2 border-gray-200 p-4 rounded-xl hover:border-orange-500 hover:shadow-md transition-all">
            <Calendar className="w-6 h-6 text-orange-600 mb-2" />
            <div className="font-semibold text-gray-900 text-sm">View Calendar</div>
            <div className="text-xs text-gray-600">Monthly view</div>
          </button>
          <button className="bg-white border-2 border-gray-200 p-4 rounded-xl hover:border-orange-500 hover:shadow-md transition-all">
            <User className="w-6 h-6 text-orange-600 mb-2" />
            <div className="font-semibold text-gray-900 text-sm">Find Doctor</div>
            <div className="text-xs text-gray-600">Search specialists</div>
          </button>
        </div>
      </div>

      {/* Book Modal (Placeholder) */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-xl text-gray-900 mb-4">Book New Appointment</h3>
            <p className="text-gray-600 mb-4">
              This feature will allow you to search for doctors and book appointments.
            </p>
            <button
              onClick={() => setShowBookModal(false)}
              className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
