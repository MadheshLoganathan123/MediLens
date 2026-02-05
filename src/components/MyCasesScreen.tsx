import { useState } from 'react';
import { 
  ChevronLeft, 
  Search, 
  Filter,
  FileText,
  Calendar,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Circle
} from 'lucide-react';

interface Case {
  id: string;
  date: string;
  issueType: string;
  severity: 'Low' | 'Medium' | 'Critical';
  status: 'Submitted' | 'Reviewed' | 'Accepted' | 'Scheduled' | 'Completed' | 'Cancelled';
  doctor?: string;
  hospital?: string;
  description: string;
}

interface MyCasesScreenProps {
  onBack: () => void;
  onViewCase?: (caseId: string) => void;
}

const mockCases: Case[] = [
  {
    id: 'MED-2024-001',
    date: '2026-02-01',
    issueType: 'Fever and Headache',
    severity: 'Medium',
    status: 'Scheduled',
    doctor: 'Dr. Sarah Johnson',
    hospital: 'City General Hospital',
    description: 'Persistent headache for 3 days with mild fever'
  },
  {
    id: 'MED-2024-002',
    date: '2026-01-28',
    issueType: 'Stomach Pain',
    severity: 'Low',
    status: 'Completed',
    doctor: 'Dr. Michael Chen',
    hospital: 'MediCare Urgent Care',
    description: 'Acute stomach discomfort after meals'
  },
  {
    id: 'MED-2024-003',
    date: '2026-01-25',
    issueType: 'Skin Rash',
    severity: 'Low',
    status: 'Completed',
    doctor: 'Dr. Emily White',
    hospital: 'QuickCare Clinic',
    description: 'Red itchy rash on arms'
  },
  {
    id: 'MED-2024-004',
    date: '2026-01-20',
    issueType: 'Chest Pain',
    severity: 'Critical',
    status: 'Completed',
    doctor: 'Dr. Robert Davis',
    hospital: 'Central Medical Hospital',
    description: 'Sharp chest pain and difficulty breathing'
  },
  {
    id: 'MED-2024-005',
    date: '2026-01-15',
    issueType: 'Allergic Reaction',
    severity: 'Medium',
    status: 'Cancelled',
    description: 'Swelling and hives after food consumption'
  },
  {
    id: 'MED-2024-006',
    date: '2026-01-10',
    issueType: 'Back Pain',
    severity: 'Low',
    status: 'Completed',
    doctor: 'Dr. Lisa Anderson',
    hospital: 'City General Hospital',
    description: 'Lower back pain for one week'
  },
];

export function MyCasesScreen({ onBack, onViewCase }: MyCasesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | Case['status']>('All');
  const [filterSeverity, setFilterSeverity] = useState<'All' | Case['severity']>('All');

  const filteredCases = mockCases.filter(case_ => {
    const matchesSearch = 
      case_.issueType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || case_.status === filterStatus;
    const matchesSeverity = filterSeverity === 'All' || case_.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getSeverityConfig = (severity: Case['severity']) => {
    switch (severity) {
      case 'Low':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle };
      case 'Medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle };
      case 'Critical':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle };
    }
  };

  const getStatusConfig = (status: Case['status']) => {
    switch (status) {
      case 'Submitted':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Circle };
      case 'Reviewed':
        return { bg: 'bg-purple-100', text: 'text-purple-700', icon: FileText };
      case 'Accepted':
        return { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: CheckCircle };
      case 'Scheduled':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Calendar };
      case 'Completed':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle };
      case 'Cancelled':
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle };
    }
  };

  const activeCases = mockCases.filter(c => 
    ['Submitted', 'Reviewed', 'Accepted', 'Scheduled'].includes(c.status)
  ).length;

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
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-3xl font-bold mb-1">My Cases</h1>
            <p className="text-blue-100 text-sm">
              {activeCases} active case{activeCases !== 1 ? 's' : ''} • {mockCases.length} total
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
            <FileText className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by issue type or case ID"
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="mb-3">
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Status</h3>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {['All', 'Scheduled', 'Completed', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as typeof filterStatus)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Severity</h3>
          <div className="flex items-center space-x-2">
            {['All', 'Low', 'Medium', 'Critical'].map((severity) => (
              <button
                key={severity}
                onClick={() => setFilterSeverity(severity as typeof filterSeverity)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filterSeverity === severity
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {severity}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-3">
          Showing {filteredCases.length} of {mockCases.length} cases
        </p>
      </div>

      {/* Cases List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-600 text-sm text-center max-w-xs">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCases.map((case_) => {
              const severityConfig = getSeverityConfig(case_.severity);
              const statusConfig = getStatusConfig(case_.status);
              const SeverityIcon = severityConfig.icon;
              const StatusIcon = statusConfig.icon;

              return (
                <button
                  key={case_.id}
                  onClick={() => onViewCase?.(case_.id)}
                  className="w-full bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all text-left"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {case_.id}
                        </span>
                        <div className={`${severityConfig.bg} ${severityConfig.text} px-2 py-1 rounded-full flex items-center space-x-1`}>
                          <SeverityIcon className="w-3 h-3" />
                          <span className="text-xs font-semibold">{case_.severity}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {case_.issueType}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {case_.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>

                  {/* Date */}
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(case_.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>

                  {/* Doctor & Hospital Info */}
                  {case_.doctor && case_.hospital && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="text-xs text-gray-600 mb-1">
                        <strong>Doctor:</strong> {case_.doctor}
                      </div>
                      <div className="text-xs text-gray-600">
                        <strong>Hospital:</strong> {case_.hospital}
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className={`${statusConfig.bg} ${statusConfig.text} px-3 py-2 rounded-lg flex items-center space-x-2 inline-flex`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{case_.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activeCases}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {mockCases.filter(c => c.status === 'Completed').length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="text-2xl font-bold text-gray-600 text-center">
            <div className="text-2xl font-bold text-gray-600">{mockCases.length}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}
