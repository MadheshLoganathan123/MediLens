import { 
  ChevronLeft, 
  FileText, 
  User, 
  MapPin, 
  Phone, 
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  Download,
  MessageCircle,
  Video
} from 'lucide-react';

interface CaseStatusScreenProps {
  caseId: string;
  onBack: () => void;
}

type CaseStatus = 'Submitted' | 'Reviewed' | 'Accepted' | 'Scheduled' | 'Completed';

interface StatusStep {
  status: CaseStatus;
  label: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
  description?: string;
}

export function CaseStatusScreen({ caseId, onBack }: CaseStatusScreenProps) {
  // Mock case data
  const currentStatus: CaseStatus = 'Scheduled';
  
  const statusSteps: StatusStep[] = [
    {
      status: 'Submitted',
      label: 'Submitted',
      completed: true,
      active: false,
      timestamp: '2026-02-01, 10:30 AM',
      description: 'Your case has been submitted successfully'
    },
    {
      status: 'Reviewed',
      label: 'Reviewed',
      completed: true,
      active: false,
      timestamp: '2026-02-01, 11:45 AM',
      description: 'Medical team reviewed your symptoms'
    },
    {
      status: 'Accepted',
      label: 'Accepted',
      completed: true,
      active: false,
      timestamp: '2026-02-01, 02:15 PM',
      description: 'Case accepted by Dr. Sarah Johnson'
    },
    {
      status: 'Scheduled',
      label: 'Scheduled',
      completed: false,
      active: true,
      timestamp: '2026-02-03, 09:00 AM',
      description: 'Appointment scheduled'
    },
    {
      status: 'Completed',
      label: 'Completed',
      completed: false,
      active: false,
    },
  ];

  const mockCase = {
    id: caseId,
    issueType: 'Fever and Headache',
    severity: 'Medium',
    submittedDate: '2026-02-01',
    appointmentDate: '2026-02-03',
    appointmentTime: '09:00 AM',
    doctor: {
      name: 'Dr. Sarah Johnson',
      specialty: 'General Physician',
      avatar: '👩‍⚕️',
    },
    hospital: {
      name: 'City General Hospital',
      address: '123 Medical Plaza, New York, NY 10001',
      phone: '+1 (555) 123-4567',
      department: 'General Medicine',
    },
    symptoms: 'Persistent headache for 3 days with mild fever (99.5°F)',
    notes: 'Patient advised to fast 8 hours before appointment for blood work.',
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-white hover:text-blue-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          <span className="font-medium">Back</span>
        </button>
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-100 text-sm">Case ID: #{caseId}</span>
            </div>
            <h1 className="text-white text-3xl font-bold mb-2">{mockCase.issueType}</h1>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                mockCase.severity === 'Low' ? 'bg-green-100 text-green-700' :
                mockCase.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {mockCase.severity} Priority
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                {currentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Progress Timeline */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Case Progress
          </h2>

          <div className="space-y-4">
            {statusSteps.map((step, index) => (
              <div key={step.status} className="flex items-start space-x-4">
                {/* Timeline Icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step.completed
                        ? 'bg-green-100 border-green-500'
                        : step.active
                        ? 'bg-blue-100 border-blue-500 animate-pulse'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : step.active ? (
                      <Circle className="w-5 h-5 text-blue-600 fill-blue-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-12 mt-2 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    ></div>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pb-4">
                  <h3
                    className={`font-semibold mb-1 ${
                      step.active ? 'text-blue-600' : step.completed ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </h3>
                  {step.description && (
                    <p className="text-sm text-gray-600 mb-1">{step.description}</p>
                  )}
                  {step.timestamp && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {step.timestamp}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Details */}
        {currentStatus === 'Scheduled' && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-md p-6 mb-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Upcoming Appointment
              </h2>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Confirmed
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Date & Time</span>
                <span className="font-semibold text-gray-900">
                  {mockCase.appointmentDate} • {mockCase.appointmentTime}
                </span>
              </div>
              <div className="h-px bg-gray-200 my-3"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Department</span>
                <span className="font-semibold text-gray-900">{mockCase.hospital.department}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-white text-gray-700 border-2 border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Reschedule</span>
              </button>
              <button className="flex-1 bg-red-50 text-red-600 border-2 border-red-200 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all flex items-center justify-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Doctor Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Assigned Doctor
          </h2>

          <div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-3xl">
              {mockCase.doctor.avatar}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{mockCase.doctor.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{mockCase.doctor.specialty}</p>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-4 h-4 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
                <span className="text-sm text-gray-600 ml-2">5.0</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="bg-blue-50 text-blue-600 py-2.5 rounded-xl font-semibold hover:bg-blue-100 transition-all flex items-center justify-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </button>
            <button className="bg-green-50 text-green-600 py-2.5 rounded-xl font-semibold hover:bg-green-100 transition-all flex items-center justify-center space-x-2">
              <Video className="w-4 h-4" />
              <span>Video Call</span>
            </button>
          </div>
        </div>

        {/* Hospital Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Hospital Information
          </h2>

          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900">{mockCase.hospital.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{mockCase.hospital.address}</p>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Phone</span>
              <a href={`tel:${mockCase.hospital.phone}`} className="text-blue-600 font-medium text-sm">
                {mockCase.hospital.phone}
              </a>
            </div>

            <div className="flex gap-2 pt-2">
              <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Call Hospital</span>
              </button>
              <button className="bg-white border-2 border-gray-200 text-gray-700 p-3 rounded-xl hover:bg-gray-50 transition-all">
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Case Details */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Case Details
          </h2>

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Symptoms Reported</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{mockCase.symptoms}</p>
            </div>

            {mockCase.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Special Instructions</h4>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">{mockCase.notes}</p>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Download Case Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
          <h3 className="font-semibold text-purple-900 mb-2">Need Help?</h3>
          <p className="text-sm text-purple-700 mb-3">
            Contact our support team 24/7 for any assistance with your case.
          </p>
          <button className="bg-purple-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-all text-sm">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
