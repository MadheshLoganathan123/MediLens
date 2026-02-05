# MediLens - Complete UI/UX Guide & Navigation Flow

## 🎨 Complete Application Overview

MediLens is a comprehensive healthcare patient mobile app with AI-powered health triage, case management, and care navigation features. The app features a modern, clean, medical-themed UI with trustworthy design patterns.

---

## 📱 Complete Screen List (12 Screens)

### Authentication & Onboarding (4 screens)
1. **Splash Screen** - Brand introduction with animated logo
2. **Login Screen** - Email/password authentication
3. **Signup Screen** - New user registration
4. **Enhanced Profile Setup** - 4-step comprehensive profile creation

### Main Application (8 screens)
5. **Home Screen** - Dashboard with quick actions
6. **Report Health Issue** - Choose input method
7. **Symptom Form** - Detailed symptom entry
8. **Analysis Result** - AI-powered health assessment
9. **Nearby Hospitals** - Search and find care facilities
10. **My Cases** - Case history and management
11. **Case Status** - Detailed case tracking with timeline
12. **Profile Tab** - User profile management

---

## 🗺️ Complete Navigation Map

```
Splash (auto 2.5s)
    ↓
Login ←→ Signup
    ↓
Enhanced Profile Setup (4 steps)
    Step 1: Personal Information
    Step 2: Health Details
    Step 3: Medical History
    Step 4: Emergency & Insurance
    ↓
Home Screen (Bottom Navigation)
    ├─ Tab 1: Home
    │   ├─ Report Health Issue → Choose Method → Symptom Form → Analysis Result → Home
    │   ├─ My Cases Button → My Cases Screen → Case Status Screen
    │   ├─ Hospitals Button → Nearby Hospitals → Home
    │   ├─ Medications Button (placeholder)
    │   └─ Appointments Button (placeholder)
    │
    ├─ Tab 2: Health (placeholder)
    ├─ Tab 3: Care (placeholder)
    └─ Tab 4: Profile
        └─ Edit Profile (future)
```

---

## 📋 Enhanced Profile Setup Screen (NEW)

### Overview
**4-Step Wizard** collecting comprehensive patient information for personalized healthcare.

### Step 1: Personal Information (25% Progress)
**Required Fields:**
- Full Name* (text input with User icon)
- Date of Birth* (date picker with Calendar icon)
- Gender* (3-button selector: Male/Female/Other)
- Phone Number* (tel input with Phone icon)

**Optional Fields:**
- Street Address (text input with MapPin icon)
- City (text input)
- Zip Code (text input)

**UI Elements:**
- Progress bar: 25% filled
- Step indicator: "Step 1 of 4: Personal Information"
- Continue button (disabled until required fields filled)

**Styling:**
- White background with blue-50 gradient
- Rounded-xl input fields with border-gray-200
- Focus state: blue-500 ring
- Icons: gray-400, left-aligned in inputs

---

### Step 2: Health Details (50% Progress)

**Fields:**
- Blood Type (8-button grid selector: A+, A-, B+, B-, AB+, AB-, O+, O-)
- Height in cm (number input)
- Weight in kg (number input)

**Info Card:**
- Blue-50 background
- Heart icon
- Explanation: "Why we need this"
- Helper text about medication dosages

**Navigation:**
- Back button (gray)
- Continue button (gradient)

**Styling:**
- Blood type buttons: 4-column grid
- Selected: red-500 border, red-50 background
- Height/Weight: 2-column grid layout

---

### Step 3: Medical History (75% Progress)

**Fields (all optional textareas):**
- Allergies (3 rows, placeholder: "Penicillin, peanuts, pollen...")
- Chronic Conditions (3 rows, placeholder: "Diabetes, hypertension...")
- Current Medications (3 rows, placeholder: "List medications...")

**Privacy Card:**
- Purple-50 background
- Shield icon
- "Privacy Protected" heading
- Encryption notice

**Styling:**
- Textareas: resize-none, rounded-xl
- Icon indicators for each field
- 16px vertical spacing between fields

---

### Step 4: Emergency Contact & Insurance (100% Progress)

**Emergency Contact:**
- Contact Name (text input with User icon)
- Contact Phone (tel input with Phone icon)

**Insurance Information:**
- Provider Name (text input with Shield icon)
- Policy Number (text input)

**Actions:**
- Back button
- Complete Profile button (gradient)
- "Skip remaining steps" link

**Styling:**
- Divider line (gray-200) between sections
- All fields optional
- Completion triggers save to localStorage

---

## 🏥 Nearby Hospitals Screen (NEW)

### Layout Structure
- **Header**: Gradient background with back button, title, search bar
- **Filters**: Status filter chips + view mode toggle (List/Map)
- **Content**: Scrollable hospital cards
- **Summary**: Result count display

### Search & Filter System

**Search Bar:**
- Full-width white input
- Search icon (left)
- Placeholder: "Search hospitals or clinics"
- Real-time filtering

**Filter Chips (Horizontal Scroll):**
- All (default)
- Hospital
- Clinic  
- Urgent Care
- Active: blue-600 background
- Inactive: gray-100 background

**View Mode Toggle:**
- List button (List icon)
- Map button (Map icon) - shows placeholder
- Active: blue-100 background

### Hospital Card Design

**Card Structure (per hospital):**
```
┌─────────────────────────────────────┐
│ [Icon] Type Badge                   │
│ Hospital Name ★ 4.8 • 1.2 km       │
│ [Dept1] [Dept2] [Dept3] +2 more    │
│ ⏱ Wait: 15min   📍 Address          │
│ [Select Button] [☎] [🗺]           │
└─────────────────────────────────────┘
```

**Card Components:**
1. **Header Row:**
   - Type icon (Hospital: Building2, Clinic: Stethoscope)
   - Type badge (gray-100 background)
   - Status badge (Open: green, Busy: yellow, Closed: red)

2. **Title & Ratings:**
   - Hospital name (bold, large)
   - Star rating (yellow)
   - Distance from user

3. **Department Tags:**
   - Blue-50 background chips
   - Max 3 visible + count badge
   - Examples: Emergency, Cardiology, etc.

4. **Info Row:**
   - Wait time with Clock icon
   - Address snippet with MapPin icon

5. **Action Buttons:**
   - **Select** (gradient, primary CTA)
   - **Phone** (white with border, phone icon)
   - **Navigate** (white with border, navigation icon)

### Status Indicators

**Open:**
- Green-100 background
- Green-700 text
- Green-500 pulsing dot

**Busy:**
- Yellow-100 background
- Yellow-700 text
- Yellow-500 pulsing dot

**Closed:**
- Red-100 background
- Red-700 text
- Red-500 dot

### Map View (Placeholder)
- Gray-100 background
- Centered message card
- Map icon (64px, blue)
- "Coming soon" message
- "View List" button

---

## 📊 Case Status Screen (NEW)

### Overview
Detailed case tracking with timeline stepper, appointment details, doctor info, and hospital information.

### Header Section
- **Gradient Background** (blue-600 to cyan-500)
- **Case ID Badge**: "Case ID: #MED-2024-001"
- **Issue Title**: Large, bold white text
- **Badges**: 
  - Severity badge (color-coded)
  - Status badge (white/20 background)

### Progress Timeline

**5-Step Stepper:**
1. ✅ **Submitted** - Completed (green checkmark)
2. ✅ **Reviewed** - Completed (green checkmark)
3. ✅ **Accepted** - Completed (green checkmark)
4. ⏺ **Scheduled** - Active (pulsing blue circle)
5. ○ **Completed** - Pending (gray circle)

**Timeline Design:**
- Vertical line connecting steps (green when completed, gray when pending)
- Each step shows:
  - Icon (CheckCircle, Circle)
  - Label (bold when active)
  - Description text
  - Timestamp with Clock icon
- Active step: blue-600 text with pulse animation
- Completed: gray-900 text
- Pending: gray-500 text

### Appointment Card (when status = Scheduled)

**Design:**
- Blue-50 to cyan-50 gradient background
- Blue-200 border (2px)
- "Confirmed" badge (top-right)

**Content:**
- Calendar icon + "Upcoming Appointment" heading
- Date & Time display
- Department information
- **Action Buttons:**
  - Reschedule (white with border)
  - Cancel (red-50 with red border)

### Doctor Info Card

**Layout:**
```
┌────────────────────────────────┐
│ [👩‍⚕️]  Dr. Sarah Johnson       │
│        General Physician       │
│        ★★★★★ 5.0              │
│ [Message] [Video Call]         │
└────────────────────────────────┘
```

**Components:**
- Avatar: 64px gradient circle with emoji
- Name: Bold, large text
- Specialty: Gray-600, smaller
- Star rating: 5 yellow stars + score
- **Action Buttons:**
  - Message (blue-50 background, blue text)
  - Video Call (green-50 background, green text)

### Hospital Info Card

**Content:**
- MapPin icon + heading
- Hospital name (bold)
- Full address (gray text)
- Phone number (clickable link, blue)
- **Action Buttons:**
  - Call Hospital (gradient, primary)
  - Navigate (white with border, MapPin icon)

### Case Details Card

**Sections:**
1. **Symptoms Reported:**
   - Gray-50 background box
   - Full symptom description

2. **Special Instructions:**
   - Amber-50 background
   - Amber-200 border
   - AlertCircle icon
   - Important notes (e.g., fasting requirements)

3. **Download Button:**
   - Gray-100 background
   - Download icon + "Download Case Report"

### Help Section

**Card Design:**
- Purple-50 to pink-50 gradient
- Purple-100 border
- "Need Help?" heading
- 24/7 support message
- Purple-600 CTA button

---

## 📁 My Cases Screen (NEW)

### Layout Structure
- **Header**: Gradient with stats (X active, Y total)
- **Search Bar**: Full-width search
- **Filters**: Two-row filter chips (Status + Severity)
- **Cases List**: Scrollable case cards
- **Summary Footer**: Statistics grid

### Search & Filter System

**Search Bar:**
- Placeholder: "Search by issue type or case ID"
- Real-time filtering
- Searches: issue type, case ID, description

**Status Filters:**
- All (default)
- Scheduled
- Completed
- Cancelled

**Severity Filters:**
- All (default)
- Low
- Medium
- Critical

**Active Filter Styling:**
- Blue-600 background
- White text
- Others: gray-100 background

### Case Card Design

**Card Structure:**
```
┌────────────────────────────────────────┐
│ #MED-2024-001  [Medium] →              │
│ Fever and Headache                     │
│ Persistent headache for 3 days...      │
│ 📅 Feb 1, 2026                         │
│ ┌────────────────────────────────┐    │
│ │ Doctor: Dr. Sarah Johnson      │    │
│ │ Hospital: City General         │    │
│ └────────────────────────────────┘    │
│ [Scheduled]                            │
└────────────────────────────────────────┘
```

**Components:**

1. **Header Row:**
   - Case ID (monospace font, gray-100 badge)
   - Severity badge with icon:
     - Low: Green with CheckCircle
     - Medium: Yellow with AlertCircle
     - Critical: Red with AlertCircle
   - ChevronRight (right-aligned)

2. **Issue Title:**
   - Bold, large (18px)
   - 1-line display

3. **Description:**
   - Gray-600 text
   - 2-line clamp (ellipsis)

4. **Date:**
   - Calendar icon
   - Formatted date (e.g., "Feb 1, 2026")

5. **Doctor/Hospital Info** (if available):
   - Gray-50 background box
   - Doctor name
   - Hospital name

6. **Status Badge:**
   - Color-coded background
   - Status icon + text
   - Inline-flex layout

### Status Badge Colors

**Submitted:** Blue-100, blue-700, Circle icon
**Reviewed:** Purple-100, purple-700, FileText icon
**Accepted:** Cyan-100, cyan-700, CheckCircle icon
**Scheduled:** Blue-100, blue-700, Calendar icon
**Completed:** Green-100, green-700, CheckCircle icon
**Cancelled:** Gray-100, gray-700, XCircle icon

### Empty State

**When no results:**
- Centered layout
- Gray-100 circle (96px) with FileText icon
- "No cases found" heading
- Helper text: "Try adjusting filters"

### Summary Footer

**3-Column Stats Grid:**
```
┌──────────┬──────────┬──────────┐
│    2     │    4     │    6     │
│  Active  │Completed │  Total   │
└──────────┴──────────┴──────────┘
```

**Styling:**
- White background
- Gray-200 top border
- Each stat: Large number (32px) + small label
- Colors: blue (active), green (completed), gray (total)

---

## 🎯 Interaction Patterns

### Card Tap Behaviors

**Nearby Hospitals Screen:**
- Tap "Select" button → Returns to home (or opens booking)
- Tap phone icon → Initiates call
- Tap navigate icon → Opens maps

**My Cases Screen:**
- Tap entire card → Navigate to Case Status Screen
- Smooth transition animation

**Case Status Screen:**
- Tap back → Return to My Cases
- Tap "Message" → Opens chat (future)
- Tap "Video Call" → Opens video interface (future)

### Filter Interactions

**Multi-Level Filtering:**
- Filters combine (AND logic)
- Active filter count shows in results text
- Instant update on selection

**Search + Filter:**
- Searches filtered results
- Real-time debounced search
- Case-insensitive matching

### Button States

**Primary Gradient Buttons:**
- Hover: shadow-xl, scale(1.02)
- Active: scale(0.98)
- Disabled: opacity-50, no cursor

**Secondary Border Buttons:**
- Hover: shadow-md, bg-gray-50
- Active: subtle scale

---

## 🎨 Design System Additions

### New Color Codes

**Blood Type Red:**
- Background: red-50 (#FEF2F2)
- Border: red-500 (#EF4444)
- Text: red-700 (#B91C1C)

**Insurance Purple:**
- Background: purple-50 (#FAF5FF)
- Border: purple-100 (#F3E8FF)
- Text: purple-700 (#7E22CE)

**Status Colors:**
- Open: green-500 (#10B981)
- Busy: yellow-500 (#F59E0B)
- Closed: red-500 (#EF4444)

### New Icon Mappings

**Profile Icons:**
- User: Personal info
- Calendar: Date/appointments
- Phone: Contact numbers
- MapPin: Location data
- Droplet: Blood type
- Activity: Health metrics
- AlertCircle: Allergies/warnings
- Heart: Medications
- Shield: Insurance/privacy
- FileText: Medical history

**Hospital Icons:**
- Building2: Hospital
- Stethoscope: Clinic
- Navigation: Directions
- Star: Ratings

**Case Status Icons:**
- Circle: Pending step
- CheckCircle: Completed step
- XCircle: Cancelled
- Clock: Timing info
- FileText: Documentation

### Spacing Standards

**Card Padding:**
- Small card: p-4 (16px)
- Medium card: p-5 (20px)
- Large card: p-6 (24px)

**Section Gaps:**
- Filter chips: gap-2 (8px)
- Card list: space-y-3 (12px)
- Form fields: space-y-5 (20px)

**Border Radius:**
- Badges: rounded-full
- Buttons: rounded-xl (12px)
- Cards: rounded-2xl (16px)
- Header: rounded-b-3xl (24px bottom)

---

## 📱 Responsive Behavior

### Mobile First (320-428px)
- Full-width components
- Single-column layouts
- Bottom sheets for filters
- Fixed headers & footers
- Horizontal scroll for chips

### Tablet (768px+)
- 2-column grids for hospital cards
- Wider max-width containers
- Side-by-side action buttons
- Larger touch targets

### Desktop (1024px+)
- Centered max-width layout (768px)
- Hover states enabled
- Sidebar navigation option
- Multi-column case lists

---

## ♿ Accessibility Features

### ARIA Enhancements

**Profile Setup:**
- aria-label on step indicators
- aria-required on mandatory fields
- aria-describedby for helper texts
- role="progressbar" on progress

**Hospital Search:**
- aria-label on filter chips
- aria-pressed for active filters
- aria-live for result count updates

**Case Timeline:**
- aria-current for active step
- aria-label on status icons
- role="list" and role="listitem"

### Keyboard Navigation

**Focus Order:**
1. Back button
2. Search input
3. Filter chips (horizontal arrow keys)
4. List items (vertical arrow keys)
5. Action buttons within cards

**Shortcuts:**
- Tab: Next element
- Shift+Tab: Previous element
- Enter/Space: Activate button
- Escape: Close modal/go back

### Touch Targets

**Minimum Sizes:**
- Primary buttons: 56px height
- Filter chips: 40px height
- Icon buttons: 44x44px
- Card tap area: Full card height

**Spacing:**
- 8px minimum between interactive elements
- 16px padding around touch zones
- Increased margins on mobile

---

## 🔄 Data Flow & State Management

### LocalStorage Schema

**User Profile:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "phone": "+1555123456",
  "address": "123 Main St",
  "city": "New York",
  "zipCode": "10001",
  "bloodType": "A+",
  "height": "175",
  "weight": "70",
  "allergies": "Penicillin",
  "chronicConditions": "None",
  "currentMedications": "None",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+1555987654",
  "insuranceProvider": "Blue Cross",
  "insuranceNumber": "BC123456789"
}
```

### Screen State Management

**Navigation State:**
- currentScreen (string enum)
- selectedCaseId (string)
- reportData (object)
- userProfile (object)

**Component State:**
- Search queries (per screen)
- Active filters (per screen)
- Tab selection (home screen)
- Form data (multi-step forms)

---

## 🚀 Future Enhancements

### Planned Features

1. **Medications Screen:**
   - Pill tracking
   - Reminder system
   - Refill alerts

2. **Appointments Screen:**
   - Calendar view
   - Booking system
   - Reminders

3. **Health Metrics Dashboard:**
   - Vital signs tracking
   - Charts & trends
   - Goal setting

4. **Teleconsultation:**
   - Video call integration
   - Chat with doctors
   - Prescription delivery

5. **Map Integration:**
   - Real maps in hospital search
   - Live navigation
   - Traffic estimates

### Technical Improvements

- Real backend API integration
- Push notifications
- Offline mode
- Dark mode
- Multi-language support
- Voice input implementation
- Biometric authentication

---

## 📊 Performance Metrics

### Target Performance

**Load Times:**
- Splash → Login: < 2.5s
- Screen transitions: < 300ms
- Search results: < 500ms
- Image loading: Progressive with placeholders

**Animations:**
- 60fps target
- GPU acceleration for transforms
- Smooth scrolling
- No layout shifts

### Optimization Strategies

- Lazy loading for images
- Virtual scrolling for long lists
- Debounced search (300ms)
- Memoized components
- Code splitting by route

---

## 📖 Component Catalog

### Complete Component List

**Layout Components:**
- Screen Container (gradient background)
- Header (gradient with rounded bottom)
- Bottom Navigation Bar
- Card Container (white, rounded-2xl)

**Form Components:**
- Text Input (with left icon)
- Textarea (multi-line)
- Date Picker
- Phone Input
- Number Input
- Button Group Selector (gender, blood type)
- File Upload (dashed border)

**Display Components:**
- Progress Bar (gradient fill)
- Stepper/Timeline (vertical)
- Badge (pill-shaped)
- Status Indicator (colored dot + text)
- Rating Stars
- Avatar (gradient circle)
- Info Card (colored background)

**Interactive Components:**
- Primary Button (gradient)
- Secondary Button (white with border)
- Icon Button (circular)
- Filter Chip (toggle)
- Search Bar
- Card (tappable)

**Navigation Components:**
- Tab Bar (bottom)
- Back Button
- Breadcrumb (step indicator)

---

## 🎯 Design Principles Summary

1. **Medical Trust:** Clean, professional, reassuring aesthetics
2. **Clarity First:** Clear hierarchy, obvious CTAs, readable text
3. **Efficient Workflow:** Minimal steps, smart defaults, quick actions
4. **Accessibility:** WCAG 2.1 AA compliant, keyboard & screen reader support
5. **Mobile Optimized:** Touch-friendly, thumb-zone CTAs, swipe gestures
6. **Consistent Language:** Unified patterns, predictable behaviors
7. **Helpful Feedback:** Visual confirmations, loading states, error messages
8. **Safety Focused:** Prominent disclaimers, clear severity indicators

---

**End of Complete UI Guide**

*Version: 2.0*  
*Last Updated: February 2, 2026*  
*Total Screens: 12*  
*Design System: MediLens Healthcare Platform*
