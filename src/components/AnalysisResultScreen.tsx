import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  MapPin,
  Phone,
  Calendar,
  Video,
  Building2,
  Stethoscope,
  Clock,
  TrendingUp,
  Info,
  Home
} from 'lucide-react';

interface AnalysisResultScreenProps {
  symptoms: string;
  aiSummary?: string;
  onBackToHome: () => void;
}

type Severity = 'low' | 'medium' | 'critical';
type CareType = 'clinic' | 'hospital' | 'emergency' | 'teleconsult';

interface AnalysisResult {
  severity: Severity;
  severityScore: number;
  summary: string;
  possibleConditions: string[];
  careType: CareType;
  careDescription: string;
  recommendations: string[];
  estimatedWaitTime?: string;
}

export function AnalysisResultScreen({ symptoms, aiSummary, onBackToHome }: AnalysisResultScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    // If we have an AI summary from the backend, use it directly.
    if (aiSummary) {
      const baseResult: AnalysisResult = {
        severity: 'medium',
        severityScore: 60,
        summary: aiSummary,
        possibleConditions: ['See AI summary for details'],
        careType: 'teleconsult',
        careDescription: 'Use this assessment to discuss with a clinician or teleconsultation.',
        recommendations: [
          'Review the AI summary carefully.',
          'Seek professional medical advice to confirm any concerns.',
          'Monitor your symptoms for any changes or worsening.',
        ],
        estimatedWaitTime: 'Same day available',
      };
      setResult(baseResult);
      setIsLoading(false);
      return;
    }

    // Fallback: local heuristic if AI is unavailable
    const timer = setTimeout(() => {
      const lowerSymptoms = symptoms.toLowerCase();
      let mockResult: AnalysisResult;

      if (lowerSymptoms.includes('chest pain') || lowerSymptoms.includes('breathing') || lowerSymptoms.includes('severe')) {
        mockResult = {
          severity: 'critical',
          severityScore: 85,
          summary: 'Your symptoms indicate a potentially serious condition that requires immediate medical attention.',
          possibleConditions: ['Acute Cardiac Event', 'Respiratory Distress', 'Severe Infection'],
          careType: 'emergency',
          careDescription: 'Visit Emergency Room immediately',
          recommendations: [
            'Seek immediate emergency care',
            'Do not drive yourself - call emergency services',
            'Keep monitoring vital signs',
            'Have someone stay with you'
          ],
          estimatedWaitTime: 'Immediate attention'
        };
      } else if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('pain') || lowerSymptoms.includes('headache')) {
        mockResult = {
          severity: 'medium',
          severityScore: 55,
          summary: 'Your symptoms suggest a moderate health concern that should be evaluated by a healthcare provider soon.',
          possibleConditions: ['Viral Infection', 'Migraine', 'Upper Respiratory Infection'],
          careType: 'clinic',
          careDescription: 'Schedule a clinic visit within 24-48 hours',
          recommendations: [
            'Visit a clinic or urgent care center',
            'Monitor temperature regularly',
            'Stay hydrated and get adequate rest',
            'Take over-the-counter pain relief if needed'
          ],
          estimatedWaitTime: '24-48 hours'
        };
      } else {
        mockResult = {
          severity: 'low',
          severityScore: 25,
          summary: 'Your symptoms appear to be mild and may not require immediate medical intervention.',
          possibleConditions: ['Common Cold', 'Minor Allergies', 'Muscle Strain'],
          careType: 'teleconsult',
          careDescription: 'A virtual consultation may be sufficient',
          recommendations: [
            'Consider a teleconsultation for convenience',
            'Monitor symptoms for any changes',
            'Practice self-care and rest',
            'Seek in-person care if symptoms worsen'
          ],
          estimatedWaitTime: 'Same day available'
        };
      }

      setResult(mockResult);
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [symptoms, aiSummary]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">Analyzing Symptoms...</h2>
            <p className="text-gray-600 text-center text-sm mb-4">
              Our AI is processing your information
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const getSeverityConfig = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-700',
          iconColor: 'text-red-600',
          label: 'Critical'
        };
      case 'medium':
        return {
          icon: AlertCircle,
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          badgeBg: 'bg-yellow-100',
          badgeText: 'text-yellow-700',
          iconColor: 'text-yellow-600',
          label: 'Medium'
        };
      case 'low':
        return {
          icon: CheckCircle,
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          badgeBg: 'bg-green-100',
          badgeText: 'text-green-700',
          iconColor: 'text-green-600',
          label: 'Low'
        };
    }
  };

  const getCareTypeConfig = (careType: CareType) => {
    switch (careType) {
      case 'emergency':
        return {
          icon: AlertTriangle,
          color: 'red',
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          label: 'Emergency Room'
        };
      case 'hospital':
        return {
          icon: Building2,
          color: 'orange',
          bgColor: 'bg-orange-100',
          iconColor: 'text-orange-600',
          label: 'Hospital Visit'
        };
      case 'clinic':
        return {
          icon: Stethoscope,
          color: 'blue',
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          label: 'Clinic Visit'
        };
      case 'teleconsult':
        return {
          icon: Video,
          color: 'green',
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          label: 'Teleconsultation'
        };
    }
  };

  const severityConfig = getSeverityConfig(result.severity);
  const careConfig = getCareTypeConfig(result.careType);
  const SeverityIcon = severityConfig.icon;
  const CareIcon = careConfig.icon;

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-10 pb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-2xl font-bold">Analysis Complete</h1>
          <button
            onClick={onBackToHome}
            className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all"
          >
            <Home className="w-5 h-5 text-white" />
          </button>
        </div>
        <p className="text-blue-100 text-sm">AI-powered health triage results</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-6">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 3 of 3</span>
            <span className="text-sm text-gray-500">Results</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 w-full rounded-full"></div>
          </div>
        </div>

        {/* Severity Badge */}
        <div className={`${severityConfig.bgColor} border-2 ${severityConfig.borderColor} rounded-2xl p-5 mb-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`${severityConfig.badgeBg} p-3 rounded-xl`}>
                <SeverityIcon className={`w-6 h-6 ${severityConfig.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Severity Level</p>
                <h3 className={`text-xl font-bold ${severityConfig.textColor}`}>
                  {severityConfig.label} Priority
                </h3>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline">
                <span className={`text-3xl font-bold ${severityConfig.textColor}`}>
                  {result.severityScore}
                </span>
                <span className="text-sm text-gray-500 ml-1">/100</span>
              </div>
              <TrendingUp className={`w-4 h-4 ${severityConfig.iconColor} ml-auto`} />
            </div>
          </div>
        </div>

        {/* AI Summary Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            AI Assessment Summary
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">{result.summary}</p>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Possible Conditions:</h4>
            <div className="flex flex-wrap gap-2">
              {result.possibleConditions.map((condition, index) => (
                <span
                  key={index}
                  className="bg-white px-3 py-1.5 rounded-lg text-sm text-gray-700 border border-gray-200"
                >
                  {condition}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Care Type */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-md p-5 mb-6 border-2 border-blue-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
            Recommended Care
          </h3>
          
          <div className="flex items-start space-x-4 mb-4">
            <div className={`${careConfig.bgColor} p-4 rounded-xl`}>
              <CareIcon className={`w-8 h-8 ${careConfig.iconColor}`} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-gray-900 mb-1">{careConfig.label}</h4>
              <p className="text-gray-600 text-sm">{result.careDescription}</p>
            </div>
          </div>

          {result.estimatedWaitTime && (
            <div className="bg-white rounded-lg p-3 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                <span className="font-medium">Expected timeframe:</span> {result.estimatedWaitTime}
              </span>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">Recommendations</h3>
          <ul className="space-y-3">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="bg-blue-100 p-1.5 rounded-lg mt-0.5">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700 text-sm flex-1">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Find Care Near Me</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white text-gray-700 border-2 border-gray-200 py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Call Now</span>
            </button>
            <button className="bg-white text-gray-700 border-2 border-gray-200 py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Schedule</span>
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-xs text-amber-800">
            <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and does not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified health provider with any questions you may have regarding a medical condition.
          </p>
        </div>

        {/* Back to Home */}
        <button
          onClick={onBackToHome}
          className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-medium hover:bg-gray-200 transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
