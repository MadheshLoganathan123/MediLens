import { useState, useEffect } from 'react'; 
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
import { getCases } from '@/lib/apiClient';
import type { HealthCase } from '@/types';

interface Case {
  id: string;
  date: string;
  issueType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
}

interface MyCasesScreenProps {
  onBack: () => void;
  onSelectCase: (caseId: string) => void;
}

export function MyCasesScreen({ onBack, onSelectCase }: MyCasesScreenProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | Case['status']>('All');
  const [filterSeverity, setFilterSeverity] = useState<'All' | Case['severity']>('All');

  // Fetch cases on mount
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const healthCases = await getCases();
        
        // Transform HealthCase to Case interface
        const transformedCases: Case[] = healthCases.map(hc => ({
          id: hc.id,
          date: hc.created_at,
          issueType: hc.category || 'General',
          severity: (hc.severity as 'low' | 'medium' | 'high' | 'critical') || 'medium',
          status: (hc.status as 'open' | 'in_progress' | 'resolved' | 'closed') || 'open',
          description: hc.symptoms,
        }));
        
        setCases(transformedCases);
      } catch (err: any) {
        console.error('Failed to fetch cases:', err);
        setError(err.message || 'Failed to load cases. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);

  const filteredCases = cases.filter(case_ => {
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
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Low' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle, label: 'Medium' };
      case 'high':
        return { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertCircle, label: 'High' };
      case 'critical':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Critical' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Circle, label: 'Unknown' };
    }
  };

  const getStatusConfig = (status: Case['status']) => {
    switch (status) {
      case 'open':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Circle, label: 'Open' };
      case 'in_progress':
        return { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: Clock, label: 'In Progress' };
      case 'resolved':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Resolved' };
      case 'closed':
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: 'Closed' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Circle, label: 'Unknown' };
    }
  };

  const activeCases = cases.filter(c => 
    ['open', 'in_progress'].includes(c.status)
  ).length;

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-10 pb-6 flex-shrink-0">
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
              {activeCases} active case{activeCases !== 1 ? 's' : ''} • {cases.length} total
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
            {['All', 'open', 'in_progress', 'resolved', 'closed'].map((status) => {
              const label =
                status === 'All'
                  ? 'All'
                  : status === 'open'
                    ? 'Open'
                    : status === 'in_progress'
                      ? 'In Progress'
                      : status === 'resolved'
                        ? 'Resolved'
                        : 'Closed';
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as typeof filterStatus)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Severity</h3>
          <div className="flex items-center space-x-2">
            {['All', 'low', 'medium', 'high', 'critical'].map((severity) => {
              const label =
                severity === 'All'
                  ? 'All'
                  : severity === 'low'
                    ? 'Low'
                    : severity === 'medium'
                      ? 'Medium'
                      : severity === 'high'
                        ? 'High'
                        : 'Critical';
              return (
                <button
                  key={severity}
                  onClick={() => setFilterSeverity(severity as typeof filterSeverity)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filterSeverity === severity
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-3">
          Showing {filteredCases.length} of {cases.length} cases
        </p>
      </div>

      {/* Cases List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading your cases...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="bg-red-100 p-6 rounded-full mb-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Failed to load cases</h3>
            <p className="text-gray-600 text-sm text-center max-w-xs mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {cases.length === 0 ? 'No cases yet' : 'No cases found'}
            </h3>
            <p className="text-gray-600 text-sm text-center max-w-xs">
              {cases.length === 0
                ? 'Start by reporting a health issue to create your first case'
                : 'Try adjusting your filters or search query'}
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
                  onClick={() => onSelectCase(case_.id)}
                  className="w-full bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all text-left"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {case_.id.substring(0, 8)}
                        </span>
                        <div className={`${severityConfig.bg} ${severityConfig.text} px-2 py-1 rounded-full flex items-center space-x-1`}>
                          <SeverityIcon className="w-3 h-3" />
                          <span className="text-xs font-semibold">{severityConfig.label}</span>
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

                  {/* Status Badge */}
                  <div className={`${statusConfig.bg} ${statusConfig.text} px-3 py-2 rounded-lg flex items-center space-x-2 inline-flex`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{statusConfig.label}</span>
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
              {cases.filter(c => c.status === 'resolved').length}
            </div>
            <div className="text-xs text-gray-600">Resolved</div>
          </div>
          <div className="text-2xl font-bold text-gray-600 text-center">
            <div className="text-2xl font-bold text-gray-600">{cases.length}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}
