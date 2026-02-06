# MediLens - 24-Hour AI Hackathon Plan
**Goal:** Demo-ready mobile app in 24 hours  
**Strategy:** Maximum demo impact, minimum complexity  
**Focus:** Core features that showcase AI and healthcare innovation

---

## 🎯 Hackathon Strategy

### Core Demo Features (Must Have)
1. ✅ **Health Issue Reporting with AI Analysis** - The star feature
2. ✅ **User Authentication** - Already working
3. ✅ **Case Tracking** - Show user's health cases
4. ✅ **Nearby Hospitals** - Map integration

### Nice-to-Have (If Time Permits)
- Medications tracking
- Appointments booking
- Profile management

### Cut for Hackathon
- ❌ Complex medication logging
- ❌ Appointment scheduling system
- ❌ Push notifications
- ❌ Advanced filtering
- ❌ Production deployment (demo locally)

---

## ⏰ 24-Hour Timeline Breakdown

### Hour 0-2: Setup & Database (2 hours) 🔴 CRITICAL

#### Hour 1: Environment Setup (30 min)
```bash
# 1. Verify all dependencies installed
cd backend
pip install -r requirements.txt

cd ..
npm install

# 2. Check .env files exist
# backend/.env should have:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_JWT_SECRET
# - OPENROUTER_API_KEY

# Root .env should have:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_API_BASE_URL=http://localhost:5000/api
```

#### Hour 1-2: Minimal Database (1.5 hours)
**Only create ONE table for hackathon:**

```sql
-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.health_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symptoms TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'Medium',
  status VARCHAR(20) DEFAULT 'Submitted',
  ai_analysis TEXT,
  images_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_cases_user_id ON public.health_cases(user_id);

-- RLS Policies
ALTER TABLE public.health_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cases" ON public.health_cases
  FOR ALL USING (auth.uid() = user_id);
```

**Skip:** Medications, appointments tables (use mock data in frontend)

---

### Hour 2-6: Core Backend API (4 hours) 🔴 CRITICAL

#### Fix Backend First (30 min)
Fix merge conflicts in `backend/main.py`:

```python
# Replace lines 47-51 with:
class Profile(BaseModel):
    id: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zip_code: Optional[str] = None
    blood_type: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    current_medications: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_number: Optional[str] = None
    medical_history: Optional[List[dict]] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None
```

Fix profile update endpoint (lines 167-219):
```python
@app.post("/api/profile", response_model=Profile)
async def update_profile(profile: Profile, current_user=Depends(get_current_user)):
    """Update user profile"""
    update_data = profile.dict(exclude_unset=True)
    update_data["id"] = current_user["id"]
    
    # Remove None values
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    response = supabase.table("profiles").upsert(update_data).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=400,
            detail={"code": "PROFILE_UPDATE_FAILED", "message": "Failed to update profile"},
        )
    return response.data[0]
```

#### Implement Health Cases API (3.5 hours)

Add to `backend/main.py`:

```python
from typing import List, Optional
from pydantic import BaseModel

# Add after AnalyzeResponse class (around line 78)
class HealthCaseCreate(BaseModel):
    symptoms: str
    severity: str = "Medium"
    images_urls: List[str] = []

class HealthCaseResponse(BaseModel):
    id: str
    user_id: str
    symptoms: str
    severity: str
    status: str
    ai_analysis: Optional[str]
    images_urls: List[str]
    created_at: str

# Add endpoints before app.include_router (around line 268)

@app.post("/api/cases", response_model=HealthCaseResponse)
async def create_case(
    case: HealthCaseCreate,
    current_user=Depends(get_current_user)
):
    """Create a new health case with AI analysis"""
    # Get AI analysis (this is the hackathon star feature!)
    analysis_result = None
    if case.symptoms:
        try:
            analysis_response = await analyze_issue(
                AnalyzeRequest(symptoms=case.symptoms, has_image=len(case.images_urls) > 0),
                current_user
            )
            analysis_result = analysis_response.analysis
        except Exception as e:
            print(f"AI analysis failed: {e}")
            analysis_result = "Analysis temporarily unavailable. Please consult a healthcare professional."
    
    # Insert case
    case_data = {
        "user_id": current_user["id"],
        "symptoms": case.symptoms,
        "severity": case.severity,
        "status": "Submitted",
        "ai_analysis": analysis_result,
        "images_urls": case.images_urls
    }
    
    response = supabase.table("health_cases").insert(case_data).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=400,
            detail={"code": "CASE_CREATE_FAILED", "message": "Failed to create case"}
        )
    
    return response.data[0]

@app.get("/api/cases", response_model=List[HealthCaseResponse])
async def get_cases(
    status: Optional[str] = None,
    current_user=Depends(get_current_user)
):
    """Get user's health cases"""
    query = supabase.table("health_cases").select("*").eq("user_id", current_user["id"])
    
    if status:
        query = query.eq("status", status)
    
    query = query.order("created_at", desc=True)
    response = query.execute()
    
    return response.data or []

@app.get("/api/cases/{case_id}", response_model=HealthCaseResponse)
async def get_case(case_id: str, current_user=Depends(get_current_user)):
    """Get a specific case"""
    response = (
        supabase.table("health_cases")
        .select("*")
        .eq("id", case_id)
        .eq("user_id", current_user["id"])
        .execute()
    )
    
    if not response.data:
        raise HTTPException(
            status_code=404,
            detail={"code": "CASE_NOT_FOUND", "message": "Case not found"}
        )
    
    return response.data[0]

@app.put("/api/cases/{case_id}", response_model=HealthCaseResponse)
async def update_case(
    case_id: str,
    update_data: dict,
    current_user=Depends(get_current_user)
):
    """Update case status"""
    response = (
        supabase.table("health_cases")
        .update(update_data)
        .eq("id", case_id)
        .eq("user_id", current_user["id"])
        .execute()
    )
    
    if not response.data:
        raise HTTPException(
            status_code=404,
            detail={"code": "CASE_NOT_FOUND", "message": "Case not found"}
        )
    
    return response.data[0]
```

**Test immediately:**
```bash
# Start backend
cd backend
uvicorn main:app --reload --port 5000

# In another terminal, test:
curl -X POST http://localhost:5000/api/cases \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "Headache for 3 days", "severity": "Medium"}'
```

---

### Hour 6-10: Frontend Integration (4 hours) 🔴 CRITICAL

#### Update API Client (30 min)

Add to `src/lib/apiClient.ts`:

```typescript
// Add after analyzeIssue function

export interface HealthCase {
  id: string;
  user_id: string;
  symptoms: string;
  severity: string;
  status: string;
  ai_analysis?: string;
  images_urls: string[];
  created_at: string;
}

export async function createCase(caseData: {
  symptoms: string;
  severity: string;
  images_urls?: string[];
}): Promise<HealthCase> {
  return apiFetch<HealthCase>("/cases", {
    method: "POST",
    body: JSON.stringify(caseData),
  });
}

export async function getCases(status?: string): Promise<HealthCase[]> {
  const params = status ? `?status=${status}` : "";
  return apiFetch<HealthCase[]>(`/cases${params}`);
}

export async function getCase(caseId: string): Promise<HealthCase> {
  return apiFetch<HealthCase>(`/cases/${caseId}`);
}

export async function updateCase(
  caseId: string,
  updateData: Partial<HealthCase>
): Promise<HealthCase> {
  return apiFetch<HealthCase>(`/cases/${caseId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
}
```

#### Update Components (3.5 hours)

**1. Update `src/App.tsx` - Health Case Flow (1 hour)**

Find the `handleReportSubmit` function and update:

```typescript
async function handleReportSubmit(method: 'image' | 'text' | 'voice', data: any) {
  try {
    setReportData({ method, ...data });
    
    // If symptoms provided, create case immediately
    if (data.symptoms) {
      const newCase = await createCase({
        symptoms: data.symptoms,
        severity: data.severity || 'Medium',
        images_urls: data.images?.map((img: File) => URL.createObjectURL(img)) || []
      });
      
      setSelectedCaseId(newCase.id);
      setCurrentScreen('analysis-result');
    } else {
      setCurrentScreen('symptom-form');
    }
  } catch (error) {
    console.error('Failed to create case:', error);
    alert('Failed to submit health issue. Please try again.');
  }
}
```

**2. Update `src/components/MyCasesScreen.tsx` (1 hour)**

Replace mock data with real API:

```typescript
import { useState, useEffect } from 'react';
import { getCases } from '../lib/apiClient';

// Inside component:
const [cases, setCases] = useState<Case[]>([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState<string>('all');

useEffect(() => {
  async function fetchCases() {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const data = await getCases(status);
      
      // Transform API data to component format
      const transformedCases: Case[] = data.map((c: any) => ({
        id: c.id,
        date: c.created_at.split('T')[0],
        issueType: c.symptoms.substring(0, 30) + '...',
        severity: c.severity as 'Low' | 'Medium' | 'Critical',
        status: c.status as Case['status'],
        doctor: c.doctor_name,
        hospital: c.hospital_name,
        description: c.symptoms
      }));
      
      setCases(transformedCases);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      // Fallback to empty array on error
      setCases([]);
    } finally {
      setLoading(false);
    }
  }
  fetchCases();
}, [filter]);
```

**3. Update `src/components/CaseStatusScreen.tsx` (1 hour)**

```typescript
import { useState, useEffect } from 'react';
import { getCase } from '../lib/apiClient';

// Inside component, add:
useEffect(() => {
  if (caseId) {
    async function fetchCaseDetails() {
      try {
        const caseData = await getCase(caseId);
        // Update component state with real data
        setCaseDetails(caseData);
      } catch (error) {
        console.error('Failed to fetch case:', error);
      }
    }
    fetchCaseDetails();
  }
}, [caseId]);
```

**4. Update `src/components/SymptomFormScreen.tsx` (30 min)**

Update submit handler:

```typescript
const handleSubmit = async () => {
  try {
    const newCase = await createCase({
      symptoms: symptoms,
      severity: selectedSeverity || 'Medium',
      images_urls: uploadedImages.map(img => img.url) // Assuming you store URLs
    });
    
    // Navigate to analysis result with the case
    onComplete(newCase);
  } catch (error) {
    console.error('Failed to submit:', error);
    alert('Failed to submit. Please try again.');
  }
};
```

---

### Hour 10-14: Polish & Mobile Prep (4 hours)

#### Hour 10-11: Error Handling & Loading States (1 hour)

Add loading indicators:
```typescript
// In components, add:
const [loading, setLoading] = useState(false);

// Wrap API calls:
try {
  setLoading(true);
  const data = await getCases();
  // ... handle data
} catch (error) {
  // Show user-friendly error
  alert('Something went wrong. Please try again.');
} finally {
  setLoading(false);
}

// In JSX:
{loading ? <div>Loading...</div> : <YourContent />}
```

#### Hour 11-12: Fix UI Issues (1 hour)
- Test all navigation flows
- Fix any broken links
- Ensure all screens load properly
- Add error boundaries

#### Hour 12-14: Mobile Setup (2 hours) 🟡 OPTIONAL

**Quick Capacitor Setup (if time permits):**

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Initialize
npx cap init "MediLens" "com.medilens.app"

# Add platforms
npx cap add ios
npx cap add android

# Build
npm run build
npx cap sync

# Open in IDE (for demo, just show it opens)
npx cap open ios  # or android
```

**If no time:** Demo as PWA/web app - it's mobile-responsive!

---

### Hour 14-18: Demo Preparation (4 hours)

#### Hour 14-15: Create Demo Data (1 hour)

Add some test cases to database for demo:

```sql
-- Run in Supabase SQL Editor (replace USER_ID with actual user ID)
INSERT INTO health_cases (user_id, symptoms, severity, status, ai_analysis, created_at)
VALUES 
  ('USER_ID', 'Persistent headache for 3 days with mild fever', 'Medium', 'Under Review', 
   'Based on your symptoms, this could be a tension headache or migraine. Rest, hydration, and over-the-counter pain relief may help. If symptoms persist or worsen, consult a healthcare professional.', 
   NOW() - INTERVAL '2 days'),
  ('USER_ID', 'Stomach pain after meals', 'Low', 'Completed', 
   'This may be related to diet or digestion. Consider keeping a food diary and avoiding trigger foods. If pain is severe or persistent, seek medical attention.', 
   NOW() - INTERVAL '5 days');
```

#### Hour 15-16: Test Complete User Flow (1 hour)

**Demo Script:**
1. ✅ Login/Signup
2. ✅ Report health issue
3. ✅ View AI analysis
4. ✅ View cases list
5. ✅ View case details
6. ✅ Find nearby hospitals

**Fix any bugs found!**

#### Hour 16-18: Presentation Prep (2 hours)

**Create Demo Slides:**
1. Problem statement
2. Solution overview
3. Key features (AI analysis highlight!)
4. Tech stack
5. Live demo
6. Future roadmap

**Prepare:**
- Screen recordings of key flows
- Screenshots of best features
- One-liner pitch: "MediLens uses AI to analyze health symptoms and connect patients with nearby care"

---

### Hour 18-22: Final Polish & Testing (4 hours)

#### Hour 18-19: UI/UX Polish (1 hour)
- Add smooth transitions
- Improve error messages
- Add success notifications
- Polish loading states

#### Hour 19-20: Performance Check (1 hour)
- Test on slow network
- Add loading skeletons
- Optimize images
- Check bundle size

#### Hour 20-21: Cross-browser Testing (1 hour)
- Test on Chrome
- Test on Safari
- Test on mobile browsers
- Fix any issues

#### Hour 21-22: Documentation (1 hour)

**Create `HACKATHON_README.md`:**
```markdown
# MediLens - 24-Hour Hackathon Demo

## Quick Start
1. Backend: `cd backend && uvicorn main:app --reload`
2. Frontend: `npm run dev`
3. Open http://localhost:5173

## Demo Credentials
- Email: demo@medilens.com
- Password: (create account)

## Key Features
- AI-powered symptom analysis
- Health case tracking
- Nearby hospital finder

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: FastAPI + Python
- Database: Supabase (PostgreSQL)
- AI: OpenRouter (Gemma model)
- Auth: Supabase Auth
```

---

### Hour 22-24: Final Testing & Backup Plan (2 hours)

#### Hour 22-23: Final Run-through (1 hour)
- Test everything one more time
- Prepare backup demo video
- Test on multiple devices
- Prepare answers to common questions

#### Hour 23-24: Backup & Contingency (1 hour)

**If something breaks:**
- Have mock data ready as fallback
- Prepare video demo as backup
- Have screenshots ready
- Prepare "what we learned" talking points

**Final Checklist:**
- [ ] Backend running
- [ ] Frontend running
- [ ] Database connected
- [ ] AI analysis working
- [ ] Demo script ready
- [ ] Backup plan ready

---

## 🎯 Hackathon Success Criteria

### Minimum Viable Demo:
- ✅ User can sign up/login
- ✅ User can report health issue
- ✅ AI analyzes symptoms (THE STAR FEATURE!)
- ✅ User can view their cases
- ✅ App looks polished and professional

### Nice-to-Have:
- Nearby hospitals working
- Case status updates
- Image upload (if time)

### Cut These:
- ❌ Complex features
- ❌ Production deployment
- ❌ Mobile app build (demo as web)
- ❌ Advanced filtering
- ❌ Notifications

---

## 🚨 Common Pitfalls & Quick Fixes

### Backend won't start
```bash
# Check Python version (need 3.8+)
python --version

# Reinstall dependencies
pip install -r backend/requirements.txt

# Check .env file exists
cat backend/.env
```

### API returns 401
- Check JWT token is being sent
- Verify token in Supabase dashboard
- Check CORS settings

### Database errors
- Verify RLS policies are set
- Check user_id matches auth.uid()
- Test query in Supabase SQL editor first

### AI analysis fails
- Check OPENROUTER_API_KEY is set
- Verify API key has credits
- Add fallback message if AI fails

### Frontend won't connect
- Check VITE_API_BASE_URL in .env
- Verify backend is running on port 5000
- Check browser console for CORS errors

---

## 💡 Pro Tips for Hackathon

1. **Start with database** - Everything depends on it
2. **Test APIs immediately** - Don't wait until frontend is done
3. **Use Postman** - Test APIs before frontend integration
4. **Commit often** - Git saves you when things break
5. **Focus on demo** - Polish what judges will see
6. **AI is your differentiator** - Make it shine!
7. **Have backup plan** - Mock data if APIs fail
8. **Sleep is important** - 2-3 hours minimum

---

## 📊 Time Allocation Summary

| Task | Hours | Priority |
|------|-------|----------|
| Setup & Database | 2 | 🔴 Critical |
| Backend API | 4 | 🔴 Critical |
| Frontend Integration | 4 | 🔴 Critical |
| Polish & Mobile Prep | 4 | 🟡 High |
| Demo Prep | 4 | 🟡 High |
| Final Polish | 4 | 🟢 Medium |
| Buffer/Testing | 2 | 🟢 Medium |
| **Total** | **24** | |

---

## 🎤 Demo Pitch Template

**30-second pitch:**
"MediLens is an AI-powered healthcare app that helps patients understand their symptoms and find care. Users report health issues, our AI analyzes them, and we connect patients with nearby hospitals. Built in 24 hours using React, FastAPI, and OpenRouter AI."

**Key points to highlight:**
1. AI-powered symptom analysis (unique!)
2. Seamless user experience
3. Real-time case tracking
4. Healthcare accessibility

---

## ✅ Final Checklist (Hour 24)

- [ ] Backend running and tested
- [ ] Frontend running and tested
- [ ] Database populated with demo data
- [ ] AI analysis working
- [ ] All navigation flows work
- [ ] Demo script prepared
- [ ] Backup video/screenshots ready
- [ ] Pitch prepared
- [ ] Team knows their parts
- [ ] Laptop charged, internet working

---

**Good luck! You've got this! 🚀**

**Remember:** A working demo with AI analysis beats a broken app with all features. Focus on making the core flow perfect!
