import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  FileText, 
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Download,
  RefreshCw,
  Loader
} from 'lucide-react';
import { getCase, updateCase } from '@/lib/apiClient';
import type { HealthCase } from '@/types';

interface CaseStatusScreenProps {
  caseId: string;
  onBack: () => void;
}

type DisplayStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface StatusStep {
  status: DisplayStatus;
  label: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
  description?: string;
}

export function CaseStatusScreen({ caseId, onBack }: CaseStatusScreenProps) {
  const [caseData, setCaseData] = useState<HealthCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Fetch case data on mount
  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!caseId || !caseId.trim()) {
          setError('Invalid case ID. Please select a case from the list.');
          return;
        }
        const data = await getCase(caseId);
        setCaseData(data);
      } catch (err: any) {
        console.error('Failed to fetch case:', err);
        setError(err.message || 'Failed to load case details');
      } finally {
        setIsLoading(false);
      }
    };

    if (caseId) {
      fetchCaseData();
    } else {
      setError('No case selected. Please go back and select a case.');
      setIsLoading(false);
    }
  }, [caseId]);

  // Map API status to display status
  const mapStatusToDisplay = (status: string): DisplayStatus => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'open';
      case 'in_progress':
        return 'in_progress';
      case 'resolved':
        return 'resolved';
      case 'closed':
        return 'closed';
      default:
        return 'open';
    }
  };

  // Build status steps based on current status
  const getStatusSteps = (): StatusStep[] => {
    const currentStatus = caseData?.status ? mapStatusToDisplay(caseData.status) : 'open';
    const submittedDate = caseData?.created_at ? new Date(caseData.created_at).toLocaleString() : 'Not available';

    const steps: StatusStep[] = [
      {
        status: 'open',
        label: 'Submitted',
        completed: ['in_progress', 'resolved', 'closed'].includes(currentStatus),
        active: currentStatus === 'open',
        timestamp: submittedDate,
        description: 'Your case has been submitted successfully'
      },
      {
        status: 'in_progress',
        label: 'In Progress',
        completed: ['resolved', 'closed'].includes(currentStatus),
        active: currentStatus === 'in_progress',
        description: 'Your case is being reviewed'
      },
      {
        status: 'resolved',
        label: 'Resolved',
        completed: currentStatus === 'resolved',
        active: false,
        description: 'Case has been resolved'
      },
      {
        status: 'closed',
        label: 'Closed',
        completed: currentStatus === 'closed',
        active: false,
        description: 'Case is archived'
      },
    ];

    return steps;
  };

  const handleStatusUpdate = async (newStatus: DisplayStatus) => {
    if (!caseData || isUpdating) return;

    try {
      setIsUpdating(true);
      setUpdateError(null);
      const updated = await updateCase(caseData.id, { status: newStatus });
      setCaseData(updated);
    } catch (err: any) {
      console.error('Failed to update case status:', err);
      setUpdateError(err.message || 'Failed to update case status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-10 pb-6 flex-shrink-0">
          <button
            onClick={onBack}
            className="mb-6 flex items-center text-white hover:text-blue-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 mr-1" />
            <span className="font-medium">Back</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading case details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-10 pb-6 flex-shrink-0">
          <button
            onClick={onBack}
            className="mb-6 flex items-center text-white hover:text-blue-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 mr-1" />
            <span className="font-medium">Back</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="bg-red-100 p-6 rounded-full mb-4 inline-block">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Failed to load case</h3>
            <p className="text-gray-600 text-sm mb-4">{error || 'Case not found'}</p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();
  const currentStatus = mapStatusToDisplay(caseData.status);
  const severityColor = caseData.severity 
    ? caseData.severity === 'low' 
      ? 'bg-green-100 text-green-700'
      : caseData.severity === 'medium'
        ? 'bg-yellow-100 text-yellow-700'
        : caseData.severity === 'high'
          ? 'bg-orange-100 text-orange-700'
          : 'bg-red-100 text-red-700'
    : 'bg-gray-100 text-gray-700';

  const severityLabel = caseData.severity 
    ? caseData.severity.charAt(0).toUpperCase() + caseData.severity.slice(1)
    : 'Not specified';

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
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-100 text-sm">Case ID: #{caseData.id.substring(0, 8)}</span>
            </div>
            <h1 className="text-white text-3xl font-bold mb-2">{caseData.category || 'Health Case'}</h1>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${severityColor}`}>
                {severityLabel} Priority
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                {currentStatus === 'open' ? 'Open' : currentStatus === 'in_progress' ? 'In Progress' : currentStatus === 'resolved' ? 'Resolved' : 'Closed'}
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

        {/* AI Analysis */}
        {caseData.ai_analysis && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
              AI Analysis
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-700">
                {typeof caseData.ai_analysis === 'string'
                  ? caseData.ai_analysis
                  : caseData.ai_analysis?.analysis || caseData.ai_analysis?.summary || JSON.stringify(caseData.ai_analysis)}
              </p>
            </div>
          </div>
        )}

        {/* Case Details */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Case Details
          </h2>

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Symptoms Reported</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{caseData.symptoms}</p>
            </div>

            {caseData.category && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Category</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{caseData.category}</p>
              </div>
            )}

            {caseData.severity && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Severity Level</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{severityLabel}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Submitted</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {new Date(caseData.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Status Update Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 mb-6">
          <h3 className="font-semibold text-purple-900 mb-3">Update Case Status</h3>
          
          {/* Update Error Message */}
          {updateError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 text-sm">{updateError}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {(['open', 'in_progress', 'resolved', 'closed'] as DisplayStatus[]).map((status) => {
              const label = status === 'open' ? 'Open' : status === 'in_progress' ? 'In Progress' : status === 'resolved' ? 'Resolved' : 'Closed';
              const isCurrentStatus = status === currentStatus;
              return (
                <button
                  key={status}
                  onClick={() => !isCurrentStatus && handleStatusUpdate(status)}
                  disabled={isCurrentStatus || isUpdating}
                  className={`w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                    isCurrentStatus
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                  } ${(isCurrentStatus || isUpdating) ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isUpdating && !isCurrentStatus ? (
                    <>
                      <Loader className="w-4 h-4 inline mr-1 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      {isCurrentStatus && <CheckCircle className="w-4 h-4 inline mr-1" />}
                      {label}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2">Case Information</h3>
          <p className="text-sm text-blue-700 mb-3">
            Your case has been created successfully. You can track its progress here and update the status as needed.
          </p>
          <button className="bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm w-full">
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh Details
          </button>
        </div>
      </div>
    </div>
  );
}
