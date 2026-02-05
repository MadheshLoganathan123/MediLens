import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
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

type Screen = 'splash' | 'login' | 'signup' | 'profile-setup' | 'home' | 'report-health' | 'symptom-form' | 'analysis-result' | 'nearby-hospitals' | 'case-status' | 'my-cases' | 'medications' | 'appointments';

interface UserProfile {
  name: string;
  email: string;
  age?: string;
  gender?: string;
  medicalInfo?: string;
  latitude?: number;
  longitude?: number;
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [reportData, setReportData] = useState<{
    method?: 'image' | 'text' | 'voice';
    symptoms?: string;
    images?: File[];
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

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      // if there's an explicit error from the client/runtime, bubble it
      if (error) {
        if (error.message?.includes('AbortError') || error.code === 'ABORT_ERR') {
          console.warn('Request aborted, retrying...');
          setIsHandlingSession(false);
          return;
        }
        console.error('Error fetching profile:', error);
        throw error;
      }

      // If data is null, user has no profile yet — direct them to profile setup
      if (!data) {
        console.warn('No profile found for user:', session.user.id);
        setUserProfile(null);
        setCurrentScreen('profile-setup');
      } else {
        setUserProfile(data);
        if (currentScreen === 'login' || currentScreen === 'signup' || currentScreen === 'splash') {
          setCurrentScreen('home');
        }
      }
    } catch (err: any) {
      // Silently handle abort errors
      if (err?.message?.includes('AbortError') || err?.code === 'ABORT_ERR') {
        console.warn('Session handling aborted, will retry on next auth change');
      } else {
        console.error('Error in handleSession:', err);
      }
    } finally {
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
          .insert(profilePayload, { returning: 'minimal' });

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

  async function handleProfileSetup(profile: UserProfile) {
    if (!session?.user) return;

    const profileData = {
      id: session.user.id,
      full_name: profile.name,
      updated_at: new Date().toISOString(),
      medical_history: profile.medicalInfo ? [{ info: profile.medicalInfo, date: new Date().toISOString() }] : [],
      latitude: profile.latitude,
      longitude: profile.longitude
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();

    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      setUserProfile(data);
      setCurrentScreen('home');
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

  const handleSubmitSymptoms = (symptoms: string, images?: File[]) => {
    setReportData({ ...reportData, symptoms, images });
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
            userProfile={userProfile}
            onStartReport={handleStartReport}
            onNavigateToHospitals={handleNavigateToHospitals}
            onNavigateToCases={handleNavigateToCases}
            onSignOut={handleSignOut}
            onNavigateToMedications={() => setCurrentScreen('medications')}
            onNavigateToAppointments={() => setCurrentScreen('appointments')}
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