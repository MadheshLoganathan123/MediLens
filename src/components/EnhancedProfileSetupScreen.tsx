import { useState } from 'react';
import {
  User,
  Calendar,
  Users,
  FileText,
  Phone,
  MapPin,
  Droplet,
  Heart,
  Activity,
  AlertCircle,
  Shield
} from 'lucide-react';

interface ExtendedUserProfile {
  name: string;
  email: string;
  age?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  bloodType?: string;
  height?: string;
  weight?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  latitude?: number;
  longitude?: number;
}

interface EnhancedProfileSetupScreenProps {
  initialProfile: any;
  onComplete: (profile: ExtendedUserProfile) => void;
  onBack?: () => void;
}

export function EnhancedProfileSetupScreen({ initialProfile, onComplete, onBack }: EnhancedProfileSetupScreenProps) {
  const [step, setStep] = useState(1);

  // Personal Information
  const [name, setName] = useState(initialProfile?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialProfile?.dateOfBirth || '');
  const [age, setAge] = useState(initialProfile?.age || '');
  const [gender, setGender] = useState(initialProfile?.gender || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');

  // Address Information
  const [address, setAddress] = useState(initialProfile?.address || '');
  const [city, setCity] = useState(initialProfile?.city || '');
  const [zipCode, setZipCode] = useState(initialProfile?.zipCode || '');

  // Health Information
  const [bloodType, setBloodType] = useState(initialProfile?.bloodType || '');
  const [height, setHeight] = useState(initialProfile?.height || '');
  const [weight, setWeight] = useState(initialProfile?.weight || '');

  // Medical History
  const [allergies, setAllergies] = useState(initialProfile?.allergies || '');
  const [chronicConditions, setChronicConditions] = useState(initialProfile?.chronicConditions || '');
  const [currentMedications, setCurrentMedications] = useState(initialProfile?.currentMedications || '');

  // Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState(initialProfile?.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(initialProfile?.emergencyContactPhone || '');

  // Insurance
  const [insuranceProvider, setInsuranceProvider] = useState(initialProfile?.insuranceProvider || '');
  const [insuranceNumber, setInsuranceNumber] = useState(initialProfile?.insuranceNumber || '');

  // Location
  const [latitude, setLatitude] = useState<string>(initialProfile?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState<string>(initialProfile?.longitude?.toString() || '');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setIsGettingLocation(false);
      },
      (error) => {
        setLocationError('Unable to retrieve your location');
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      name,
      email: initialProfile?.email || '',
      age,
      dateOfBirth,
      gender,
      phone,
      address,
      city,
      zipCode,
      bloodType,
      height,
      weight,
      allergies,
      chronicConditions,
      currentMedications,
      emergencyContactName,
      emergencyContactPhone,
      insuranceProvider,
      insuranceNumber,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
    });
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="min-h-full flex flex-col px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">
            Step {step} of {totalSteps}: {
              step === 1 ? 'Personal Information' :
                step === 2 ? 'Health Details' :
                  step === 3 ? 'Medical History' :
                    'Emergency & Insurance'
            }
          </p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <div className="space-y-5">
              {/* Full Name */}
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
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Male', 'Female', 'Other'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setGender(option)}
                      className={`py-3 px-4 rounded-xl border-2 transition-all ${gender === option
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

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* City & Zip */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    id="zip"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="10001"
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Location Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Coordinates (for Nearby Hospitals)
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="Latitude"
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="Longitude"
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  <MapPin className={`w-4 h-4 ${isGettingLocation ? 'animate-bounce' : ''}`} />
                  <span className="text-sm font-medium">
                    {isGettingLocation ? 'Getting location...' : 'Use Current Location'}
                  </span>
                </button>
                {locationError && (
                  <p className="text-xs text-red-500 mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {locationError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 bg-white text-gray-700 border-2 border-gray-200 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!name || !dateOfBirth || !gender || !phone}
                className={`bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${onBack ? 'flex-1' : 'w-full'}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Health Details */}
        {
          step === 2 && (
            <div className="flex-1 flex flex-col">
              <div className="space-y-5">
                {/* Blood Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Droplet className="h-4 w-4 inline mr-2" />
                    Blood Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {bloodTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBloodType(type)}
                        className={`py-3 px-2 rounded-xl border-2 transition-all ${bloodType === type
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <span className="text-sm font-bold">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                      <Activity className="h-4 w-4 inline mr-2" />
                      Height (cm)
                    </label>
                    <input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="170"
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                      <Activity className="h-4 w-4 inline mr-2" />
                      Weight (kg)
                    </label>
                    <input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="70"
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm mb-1">Why we need this</h4>
                      <p className="text-blue-700 text-xs">
                        Your health metrics help us provide accurate medication dosages and personalized health recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-white text-gray-700 border-2 border-gray-200 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            </div>
          )
        }

        {/* Step 3: Medical History */}
        {
          step === 3 && (
            <div className="flex-1 flex flex-col">
              <div className="space-y-5">
                {/* Allergies */}
                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    Allergies
                  </label>
                  <textarea
                    id="allergies"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Penicillin, peanuts, pollen, etc."
                    rows={3}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Chronic Conditions */}
                <div>
                  <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Chronic Conditions
                  </label>
                  <textarea
                    id="conditions"
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.target.value)}
                    placeholder="Diabetes, hypertension, asthma, etc."
                    rows={3}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Current Medications */}
                <div>
                  <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-2">
                    <Heart className="h-4 w-4 inline mr-2" />
                    Current Medications
                  </label>
                  <textarea
                    id="medications"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    placeholder="List any medications you're currently taking..."
                    rows={3}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Privacy Note */}
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-900 text-sm mb-1">Privacy Protected</h4>
                      <p className="text-purple-700 text-xs">
                        Your medical information is encrypted and only shared with your consent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-white text-gray-700 border-2 border-gray-200 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            </div>
          )
        }

        {/* Step 4: Emergency Contact & Insurance */}
        {
          step === 4 && (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="space-y-5">
                {/* Emergency Contact Name */}
                <div>
                  <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Emergency Contact Name
                  </label>
                  <input
                    id="emergencyName"
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Contact person's name"
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Emergency Contact Phone */}
                <div>
                  <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Emergency Contact Phone
                  </label>
                  <input
                    id="emergencyPhone"
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+1 (555) 987-6543"
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="h-px bg-gray-200 my-2"></div>

                {/* Insurance Provider */}
                <div>
                  <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="h-4 w-4 inline mr-2" />
                    Insurance Provider
                  </label>
                  <input
                    id="insurance"
                    type="text"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="Blue Cross, Aetna, etc."
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Insurance Number */}
                <div>
                  <label htmlFor="insuranceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Policy Number
                  </label>
                  <input
                    id="insuranceNumber"
                    type="text"
                    value={insuranceNumber}
                    onChange={(e) => setInsuranceNumber(e.target.value)}
                    placeholder="Policy number"
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-white text-gray-700 border-2 border-gray-200 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Complete Profile
                </button>
              </div>

              <button
                type="button"
                onClick={() => onComplete({ name, email: initialProfile?.email || '' })}
                className="w-full mt-4 text-gray-600 hover:text-gray-700 font-medium text-sm"
              >
                Skip remaining steps
              </button>
            </form>
          )
        }
      </div >
    </div >
  );
}
