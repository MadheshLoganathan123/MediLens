import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplet,
  Activity,
  AlertCircle,
  Heart,
  Shield,
  Edit,
  LogOut,
  Loader2,
  ChevronRight,
  FileText
} from 'lucide-react';
import * as api from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

interface ProfileScreenProps {
  onEditProfile: () => void;
  onBack?: () => void;
}

export function ProfileScreen({ onEditProfile, onBack }: ProfileScreenProps) {
  const { signOut, user } = useAuth();
  const [profile, setProfile] = useState<api.UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProfile();
      setProfile(data);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      // Navigation will be handled by AuthContext
    } catch (err: any) {
      console.error('Sign out failed:', err);
      setError(err.message || 'Failed to sign out');
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadProfile}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="min-h-full flex flex-col overflow-hidden">
        {/* Header with Sign Out */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-10 pb-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white text-2xl font-bold">My Profile</h1>
              <p className="text-blue-100 text-sm mt-1">Manage your health information</p>
            </div>
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-all flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Profile Avatar */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">
                {profile?.full_name || 'User'}
              </h2>
              <p className="text-blue-100 text-sm">{profile?.email || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 px-6 py-6 space-y-4">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h3>
              <button
                onClick={onEditProfile}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-3">
              <ProfileField
                icon={<User className="w-4 h-4" />}
                label="Full Name"
                value={profile?.full_name}
              />
              <ProfileField
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={profile?.email}
              />
              <ProfileField
                icon={<Phone className="w-4 h-4" />}
                label="Phone"
                value={profile?.phone_number}
              />
              <ProfileField
                icon={<Calendar className="w-4 h-4" />}
                label="Date of Birth"
                value={profile?.date_of_birth}
              />
            </div>
          </div>

          {/* Address Information */}
          {(profile?.address || profile?.city || profile?.zip_code) && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-lg text-gray-900 flex items-center mb-4">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Address
              </h3>
              <div className="space-y-3">
                <ProfileField label="Street" value={profile?.address} />
                <div className="grid grid-cols-2 gap-3">
                  <ProfileField label="City" value={profile?.city} />
                  <ProfileField label="Zip Code" value={profile?.zip_code} />
                </div>
              </div>
            </div>
          )}

          {/* Health Information */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-bold text-lg text-gray-900 flex items-center mb-4">
              <Activity className="w-5 h-5 mr-2 text-red-600" />
              Health Details
            </h3>
            <div className="space-y-3">
              <ProfileField
                icon={<Droplet className="w-4 h-4 text-red-500" />}
                label="Blood Type"
                value={profile?.blood_type}
              />
              <div className="grid grid-cols-2 gap-3">
                <ProfileField
                  label="Height"
                  value={profile?.height ? `${profile.height} cm` : undefined}
                />
                <ProfileField
                  label="Weight"
                  value={profile?.weight ? `${profile.weight} kg` : undefined}
                />
              </div>
            </div>
          </div>

          {/* Medical History */}
          {(profile?.allergies || profile?.chronic_conditions || profile?.current_medications) && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-lg text-gray-900 flex items-center mb-4">
                <Heart className="w-5 h-5 mr-2 text-purple-600" />
                Medical History
              </h3>
              <div className="space-y-4">
                {profile?.allergies && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-semibold text-gray-700">Allergies</span>
                    </div>
                    <p className="text-gray-900 bg-orange-50 p-3 rounded-lg text-sm">
                      {profile.allergies}
                    </p>
                  </div>
                )}
                {profile?.chronic_conditions && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-700">Chronic Conditions</span>
                    </div>
                    <p className="text-gray-900 bg-blue-50 p-3 rounded-lg text-sm">
                      {profile.chronic_conditions}
                    </p>
                  </div>
                )}
                {profile?.current_medications && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Heart className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-semibold text-gray-700">Current Medications</span>
                    </div>
                    <p className="text-gray-900 bg-purple-50 p-3 rounded-lg text-sm">
                      {profile.current_medications}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {(profile?.emergency_contact_name || profile?.emergency_contact_phone) && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-lg text-gray-900 flex items-center mb-4">
                <Phone className="w-5 h-5 mr-2 text-red-600" />
                Emergency Contact
              </h3>
              <div className="space-y-3">
                <ProfileField label="Name" value={profile?.emergency_contact_name} />
                <ProfileField label="Phone" value={profile?.emergency_contact_phone} />
              </div>
            </div>
          )}

          {/* Insurance */}
          {(profile?.insurance_provider || profile?.insurance_number) && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-lg text-gray-900 flex items-center mb-4">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Insurance Information
              </h3>
              <div className="space-y-3">
                <ProfileField label="Provider" value={profile?.insurance_provider} />
                <ProfileField label="Policy Number" value={profile?.insurance_number} />
              </div>
            </div>
          )}

          {/* Edit Profile Button */}
          <button
            onClick={onEditProfile}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <Edit className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out?</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to sign out of your account?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                disabled={signingOut}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {signingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <span>Sign Out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for profile fields
interface ProfileFieldProps {
  icon?: React.ReactNode;
  label: string;
  value?: string | number;
}

function ProfileField({ icon, label, value }: ProfileFieldProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className="text-gray-600 text-sm">{label}</span>
      </div>
      <span className="font-semibold text-gray-900 text-sm">
        {value || <span className="text-gray-400 font-normal">Not set</span>}
      </span>
    </div>
  );
}
