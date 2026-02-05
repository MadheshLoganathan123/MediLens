import { useState } from 'react';
import { User, Calendar, Users, FileText } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  age?: string;
  gender?: string;
  medicalInfo?: string;
}

interface ProfileSetupScreenProps {
  initialProfile: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
}

export function ProfileSetupScreen({ initialProfile, onComplete }: ProfileSetupScreenProps) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [age, setAge] = useState(initialProfile?.age || '');
  const [gender, setGender] = useState(initialProfile?.gender || '');
  const [medicalInfo, setMedicalInfo] = useState(initialProfile?.medicalInfo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      name,
      email: initialProfile?.email || '',
      age,
      gender,
      medicalInfo,
    });
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="min-h-full flex flex-col px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">
            Help us personalize your healthcare experience
          </p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 w-3/4 rounded-full"></div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="space-y-5">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Age Input */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="1"
                  max="120"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Male', 'Female', 'Other'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGender(option)}
                    className={`py-3 px-4 rounded-xl border-2 transition-all ${
                      gender === option
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Users className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Medical Info (Optional) */}
            <div>
              <label htmlFor="medicalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Medical Information <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="medicalInfo"
                  value={medicalInfo}
                  onChange={(e) => setMedicalInfo(e.target.value)}
                  placeholder="Any allergies, chronic conditions, or medications..."
                  rows={4}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This information helps us provide better healthcare recommendations
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue to MediLens
          </button>

          {/* Skip Link */}
          <button
            type="button"
            onClick={() => onComplete({ name, email: initialProfile?.email || '' })}
            className="w-full mt-4 text-gray-600 hover:text-gray-700 font-medium"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
