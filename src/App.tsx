import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { apiFetch, ApiError, analyzeIssue } from './lib/apiClient';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { EnhancedProfileSetupScreen } from './components/EnhancedProfileSetupScreen';
import { HomeScreen } from './components/HomeScreen';
import { ReportHealthIssueScreen } from './components/ReportHealthIssueScreen';
import { SymptomFormScreen } from './components/SymptomFormScreen';
import { AnalysisResultScreen } from './components/AnalysisResultScreen';
import { NearbyHospitalsScreen } from './components/NearbyHospitalsScreen';
import { CaseStatusScreen } from './components/CaseStatusScreen';
import { MyCasesScreen } from './components/MyCasesScreen';
import { MedicationsScreen } from './components/MedicationsScreen';
import { AppointmentsScreen } from './components/AppointmentsScreen';

type Screen = 'splash' | 'login' | 'signup' | 'profile-setup' | 'profile-edit' | 'home' | 'report-health' | 'symptom-form' | 'analysis-result' | 'nearby-hospitals' | 'case-status' | 'my-cases' | 'medications' | 'appointments';

interface UserProfile {
  name: string;
  email: string;
  age?: string;
  gender?: string;
  medicalInfo?: string;
  latitude?: number;
  longitude?: number;
}

type AppProps = {
  initialScreen?: Screen;
};

export default function App({ initialScreen = 'splash' }: AppProps) {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [reportData, setReportData] = useState<{
    method?: 'image' | 'text' | 'voice';
    symptoms?: string;
    images?: File[];
    aiAnalysis?: string;
  }>({});
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  // snapshot for restoring transient Home UI state when navigating away
  const [savedHomeState, setSavedHomeState] = useState<null | {
    reportData: typeof reportData;
    selectedCaseId: string;
  }>(null);

  useEffect(() => {
    // Initial session check
    const initAuth = async () => {
      // Start session fetch but don't block UI for too long.
      // If fetching session takes longer than `fallbackMs` show login/signup immediately.
      const fallbackMs = 600; // adjust for UX

      const sessionPromise = (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          return session;
        } catch (err) {
          console.error('Initial session check failed:', err);
          return null;
        }
      })();

      const timeout = new Promise(resolve => setTimeout(() => resolve(null), fallbackMs));

      const early = await Promise.race([sessionPromise, timeout]) as any;

      if (early) {
        setSession(early);
        await handleSession(early);
        setIsLoading(false);
      } else {
        // show login/signup quickly while session finishes in background
        setIsLoading(false);
        // continue to resolve full session in background and handle it when available
        sessionPromise.then(async (session) => {
          if (session) {
            setSession(session);
            await handleSession(session);
          }
        }).catch(err => console.error('Background session check error:', err));
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state change:', _event, session?.user?.id);
      setSession(session);

      if (session) {
        await handleSession(session);
      } else {
        setUserProfile(null);
        if (currentScreen !== 'signup' && currentScreen !== 'login' && currentScreen !== 'splash') {
          setCurrentScreen('login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isLoading && currentScreen === 'splash') {
      if (session) {
        setCurrentScreen('home');
      } else {
        setCurrentScreen('login');
      }
    }
  }, [isLoading, session, currentScreen]);

  const [isHandlingSession, setIsHandlingSession] = useState(false);

  async function handleSession(session: any) {
    // Prevent concurrent calls
    if (isHandlingSession) {
      console.log('Already handling session, skipping...');
      return;
    }

    try {
      setIsHandlingSession(true);

      try {
        const data = await apiFetch<any>('/profile');

        if (!data) {
          console.warn('No profile data returned for user:', session.user.id);
          setUserProfile(null);
          setCurrentScreen('profile-setup');
        } else {
          setUserProfile(data);
          if (currentScreen === 'login' || currentScreen === 'signup' || currentScreen === 'splash') {
            setCurrentScreen('home');
          }
        }
      } catch (err: any) {
        const apiErr = err as ApiError;

        if (apiErr.code === 'PROFILE_NOT_FOUND' || apiErr.status === 404) {
          console.warn('No profile found for user:', session.user.id);
          setUserProfile(null);
          setCurrentScreen('profile-setup');
        } else if (apiErr.code === 'TOKEN_EXPIRED' || apiErr.status === 401) {
          console.warn('Token expired while fetching profile, redirecting to login');
          setSession(null);
          setUserProfile(null);
          setCurrentScreen('login');
        } else {
          console.error('Error fetching profile from API:', apiErr);
        }
      } finally {
        setIsHandlingSession(false);
      }
    } catch (err: any) {
      console.error('Error in handleSession:', err);
      setIsHandlingSession(false);
    }
  }

  async function handleSupabaseLogin(email: string, password: string) {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert('Login error: ' + error.message);
      }
      // onAuthStateChange will handle navigation on successful login
      return data;
    } catch (err: any) {
      console.error('Login failed:', err);
      alert('Login failed: ' + (err?.message || err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSupabaseSignup(name: string, email: string, password: string) {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        alert('Signup error: ' + error.message);
        return;
      }

      // If user is returned immediately (session) create profile row.
      const user = data?.user ?? data?.session?.user;
      if (user) {
        // Try to create a profile record for the new user.
        const profilePayload = {
          id: user.id,
          full_name: name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: insertErr } = await supabase
          .from('profiles')
          .insert([profilePayload]);

        if (insertErr) {
          // If profile creation fails due to RLS or other reasons, log it; onAuthStateChange will prompt profile setup
          console.warn('Failed to create profile automatically:', insertErr.message || insertErr);
        }

        alert('Signup successful!');
        // navigation handled by auth listener
      } else {
        // No immediate session — likely email confirmation flow
        alert('Check your email for confirmation!');
        setCurrentScreen('login');
      }
    } catch (err: any) {
      console.error('Signup failed:', err);
      alert('Signup failed: ' + (err?.message || err));
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogin(email: string) {
    // Legacy support
    setCurrentScreen('login');
  }

  function handleSignup(name: string, email: string) {
    setCurrentScreen('signup');
  }

  async function handleProfileSetup(profile: any) {
    if (!session?.user) return;
    try {
      const profileData = {
        full_name: profile.name,
        medical_history: profile.medicalInfo
          ? [{ info: profile.medicalInfo, date: new Date().toISOString() }]
          : [],
        latitude: profile.latitude,
        longitude: profile.longitude,
      };

<<<<<<< HEAD
      const data = await apiFetch('/profile', {
        method: 'POST',
        body: JSON.stringify(profileData),
      });

=======
    const profileData = {
      id: session.user.id,
      full_name: profile.name,
      phone_number: profile.phone,
      date_of_birth: profile.dateOfBirth,
      address: profile.address,
      city: profile.city,
      zip_code: profile.zipCode,
      blood_type: profile.bloodType,
      height: profile.height ? parseFloat(profile.height) : null,
      weight: profile.weight ? parseFloat(profile.weight) : null,
      allergies: profile.allergies,
      chronic_conditions: profile.chronicConditions,
      current_medications: profile.currentMedications,
      emergency_contact_name: profile.emergencyContactName,
      emergency_contact_phone: profile.emergencyContactPhone,
      insurance_provider: profile.insuranceProvider,
      insurance_number: profile.insuranceNumber,
      updated_at: new Date().toISOString(),
      medical_history: profile.medicalInfo ? [{ info: profile.medicalInfo, date: new Date().toISOString() }] : [],
      latitude: profile.latitude,
      longitude: profile.longitude
    };

    // Use Supabase directly for setup
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();

    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
>>>>>>> 5617faaa2fb3dd7c3115aab3dea4984b04837600
      setUserProfile(data);
      setCurrentScreen('home');
    } catch (err: any) {
      const apiErr = err as ApiError;
      console.error('Error updating profile via API:', apiErr);
      alert('Error updating profile: ' + (apiErr.message || 'Unknown error'));
    }
  }

  async function handleProfileUpdate(profile: any) {
    if (!session?.user) return;

    const profileData = {
      id: session.user.id,
      email: session.user.email,
      full_name: profile.name,
      phone_number: profile.phone,
      date_of_birth: profile.dateOfBirth,
      address: profile.address,
      city: profile.city,
      zip_code: profile.zipCode,
      blood_type: profile.bloodType,
      height: profile.height ? parseFloat(profile.height) : null,
      weight: profile.weight ? parseFloat(profile.weight) : null,
      allergies: profile.allergies,
      chronic_conditions: profile.chronicConditions,
      current_medications: profile.currentMedications,
      emergency_contact_name: profile.emergencyContactName,
      emergency_contact_phone: profile.emergencyContactPhone,
      insurance_provider: profile.insuranceProvider,
      insurance_number: profile.insuranceNumber,
      latitude: profile.latitude,
      longitude: profile.longitude,
      medical_history: userProfile?.medical_history || []
    };

    try {
      // Call FastAPI backend for profile update
      const response = await fetch('http://localhost:5000/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile on server');
      }

      const updatedProfile = await response.json();
      setUserProfile(updatedProfile);
      setCurrentScreen('home');
    } catch (err: any) {
      console.error('Profile update error:', err);
      alert('Error updating profile: ' + err.message);
    }
  }

  const handleStartReport = () => {
    setReportData({});
    setCurrentScreen('report-health');
  };

  const handleMethodSelected = (method: 'image' | 'text' | 'voice', images?: File[]) => {
    setReportData({ method, images });
    setCurrentScreen('symptom-form');
  };

  const handleSubmitSymptoms = async (symptoms: string, images?: File[]) => {
    // Optimistically store user inputs
    setReportData((prev) => ({ ...prev, symptoms, images }));

    try {
      const ai = await analyzeIssue(symptoms, !!(images && images.length > 0));
      setReportData((prev) => ({ ...prev, symptoms, images, aiAnalysis: ai.analysis }));
    } catch (err: any) {
      console.error('AI analysis failed:', err);
      // Keep going with just user symptoms if AI fails
    }

    setCurrentScreen('analysis-result');
  };

  const handleBackToHome = () => {
    // restore any saved home state when returning from a secondary screen
    if (savedHomeState) {
      setReportData(savedHomeState.reportData || {});
      setSelectedCaseId(savedHomeState.selectedCaseId || '');
      setSavedHomeState(null);
    }
    setCurrentScreen('home');
  };

  async function handleSignOut() {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        alert('Sign out error: ' + error.message);
      }
    } catch (err: any) {
      console.error('Unexpected sign out error:', err);
    } finally {
      // Clear local session state immediately to avoid showing protected UI
      setSession(null);
      setUserProfile(null);
      setCurrentScreen('login');
      setIsLoading(false);
    }
  }

  const handleNavigateToHospitals = () => {
    // snapshot transient UI state so it can be restored when user returns
    setSavedHomeState({ reportData, selectedCaseId });
    // reset transient UI (avoid carrying partial forms into hospitals screen)
    setReportData({});
    setSelectedCaseId('');
    setCurrentScreen('nearby-hospitals');
  };

  const handleNavigateToCases = () => {
    setCurrentScreen('my-cases');
  };

  const handleViewCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentScreen('case-status');
  };

  function renderScreen() {
    if (isLoading) {
      return <SplashScreen />;
    }

    // Protected Route Logic
    const publicScreens: Screen[] = ['splash', 'login', 'signup'];
    if (!session && !publicScreens.includes(currentScreen)) {
      return (
        <LoginScreen
          onLogin={handleSupabaseLogin}
          onNavigateToSignup={() => setCurrentScreen('signup')}
        />
      );
    }

    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'login':
        return (
          <LoginScreen
            onLogin={handleSupabaseLogin}
            onNavigateToSignup={() => setCurrentScreen('signup')}
          />
        );
      case 'signup':
        return (
          <SignupScreen
            onSignup={handleSupabaseSignup}
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'profile-setup':
        return (
          <EnhancedProfileSetupScreen
            initialProfile={userProfile}
            onComplete={handleProfileSetup}
          />
        );
      case 'home':
        return (
          <HomeScreen
            userProfile={{
              name: userProfile?.full_name || userProfile?.name || 'User',
              email: userProfile?.email || session?.user?.email || '',
              age: userProfile?.age || '',
              gender: userProfile?.gender || '',
              medicalInfo: userProfile?.medical_history && userProfile.medical_history.length > 0
                ? userProfile.medical_history[0].info
                : ''
            }}
            onStartReport={handleStartReport}
            onNavigateToHospitals={handleNavigateToHospitals}
            onNavigateToCases={handleNavigateToCases}
            onSignOut={handleSignOut}
            onEditProfile={() => setCurrentScreen('profile-edit')}
            onNavigateToMedications={() => setCurrentScreen('medications')}
            onNavigateToAppointments={() => setCurrentScreen('appointments')}
          />
        );
      case 'profile-edit':
        return (
          <EnhancedProfileSetupScreen
            initialProfile={{
              name: userProfile?.full_name,
              email: userProfile?.email || session?.user?.email,
              dateOfBirth: userProfile?.date_of_birth,
              address: userProfile?.address,
              city: userProfile?.city,
              zipCode: userProfile?.zip_code,
              bloodType: userProfile?.blood_type,
              height: userProfile?.height,
              weight: userProfile?.weight,
              phone: userProfile?.phone_number,
              gender: userProfile?.gender,
              allergies: userProfile?.allergies,
              chronicConditions: userProfile?.chronic_conditions,
              currentMedications: userProfile?.current_medications,
              emergencyContactName: userProfile?.emergency_contact_name,
              emergencyContactPhone: userProfile?.emergency_contact_phone,
              insuranceProvider: userProfile?.insurance_provider,
              insuranceNumber: userProfile?.insurance_number,
              latitude: userProfile?.latitude,
              longitude: userProfile?.longitude
            }}
            onComplete={handleProfileUpdate}
            onBack={() => setCurrentScreen('home')}
          />
        );
      case 'report-health':
        return (
          <ReportHealthIssueScreen
            onMethodSelected={handleMethodSelected}
            onBack={handleBackToHome}
          />
        );
      case 'symptom-form':
        return (
          <SymptomFormScreen
            initialImages={reportData.images}
            onSubmit={handleSubmitSymptoms}
            onBack={() => setCurrentScreen('report-health')}
          />
        );
      case 'analysis-result':
        return (
          <AnalysisResultScreen
            symptoms={reportData.symptoms || ''}
            aiSummary={reportData.aiAnalysis}
            onBackToHome={handleBackToHome}
          />
        );
      case 'nearby-hospitals':
        return (
          <NearbyHospitalsScreen
            userProfile={userProfile}
            onBack={handleBackToHome}
            onSelectHospital={(hospital) => {
              console.log('Selected hospital:', hospital);
              handleBackToHome();
            }}
          />
        );
      case 'my-cases':
        return (
          <MyCasesScreen
            onBack={handleBackToHome}
            onViewCase={handleViewCase}
          />
        );
      case 'case-status':
        return (
          <CaseStatusScreen
            caseId={selectedCaseId}
            onBack={() => setCurrentScreen('my-cases')}
          />
        );
      case 'medications':
        return (
          <MedicationsScreen
            onBack={handleBackToHome}
          />
        );
      case 'appointments':
        return (
          <AppointmentsScreen
            onBack={handleBackToHome}
          />
        );
      default:
        return <SplashScreen />;
    }
  }

  return (
    <div className="app-viewport">
      <div className="mobile-container">
        {/* Mobile Notch Indicator (Visible on Desktop) */}
        <div className="mobile-notch"></div>

        {/* App Content */}
        <div className="app-content-wrapper">
          {renderScreen()}
        </div>

        {/* Home Indicator (Visible on Desktop) */}
        <div className="mobile-home-indicator"></div>
      </div>
    </div>
  );
}