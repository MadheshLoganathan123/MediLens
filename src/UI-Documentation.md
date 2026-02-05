# MediLens - Complete UI/UX Design Documentation

## Design System Overview

### Color Palette
- **Primary Blue**: #2563EB to #0891B2 (Gradient)
- **Background**: Soft gradient from #EFF6FF via #FFFFFF to #EFF6FF
- **Success Green**: #10B981 with #D1FAE5 background
- **Warning Yellow**: #F59E0B with #FEF3C7 background
- **Critical Red**: #EF4444 with #FEE2E2 background
- **Neutral Grays**: #F9FAFB to #111827

### Typography
- **Headlines**: Bold, 24-32px, Tight tracking
- **Subheadings**: Semibold, 16-20px
- **Body**: Regular, 14-16px
- **Captions**: 12-14px, Gray-600

### Spacing System
- **Screen Padding**: 24px (6 in Tailwind)
- **Card Gaps**: 12-16px
- **Component Padding**: 16-24px
- **Border Radius**: 12px (small), 16px (medium), 24px (large)

### Shadow System
- **Small**: Shadow-sm (Subtle elevation)
- **Medium**: Shadow-md (Card elevation)
- **Large**: Shadow-lg (Floating elements)
- **Extra Large**: Shadow-xl (Primary CTAs)

---

## Navigation Architecture

### Navigation Flow Map
```
Splash Screen (2.5s auto-transition)
    ↓
Login Screen ←→ Signup Screen
    ↓
Profile Setup Screen
    ↓
Home Screen ←→ Report Health Issue Flow
    ↓              ↓
Profile Tab   Choose Input Method
                   ↓
              Symptom Form
                   ↓
              Analysis Result → Back to Home
```

### Screen States
- **Splash**: Auto-transition, no interaction
- **Auth Screens**: Tab-based navigation, form validation
- **Main App**: Bottom tab navigation + modal flows
- **Report Flow**: Linear wizard with back navigation

---

## Screen-by-Screen UI Description

### 1. Splash Screen
**Layout Structure:**
- Full-screen gradient background (Blue-600 → Blue-500 → Cyan-500)
- Centered vertical layout

**Components:**
- **Logo Container**: 
  - Pulsing white glow background (blur effect)
  - White circular container (96px)
  - Red heart icon (80px) with fill
  
- **Brand Text**:
  - App name "MediLens" (48px, bold, white)
  - Tagline below (20px, light blue-100)
  
- **Loading Indicator**:
  - 3 white dots with staggered bounce animation
  - Positioned at bottom third of screen

**Animations:**
- Fade-in on load
- Pulse effect on logo background
- Bounce animation on loading dots

---

### 2. Login Screen
**Layout Structure:**
- Scrollable container with vertical padding
- Top logo section (floating)
- Form section (flexible)
- Bottom navigation link

**Header Section:**
- Mini logo: Blue gradient circle (64px) with white heart
- "Welcome Back" heading (32px, bold)
- Subtitle text (gray-600)

**Form Components:**
- **Email Input**:
  - White background, gray-200 border
  - Mail icon (left, gray-400)
  - Rounded-xl (12px radius)
  - Focus: Blue-500 ring, 2px
  
- **Password Input**:
  - Lock icon (left)
  - Eye/EyeOff toggle (right)
  - Same styling as email
  
- **Forgot Password Link**:
  - Right-aligned, blue-600
  - Small text (14px)

**Action Buttons:**
- **Sign In Button**:
  - Full width
  - Blue-600 to Cyan-500 gradient
  - 56px height, rounded-xl
  - Shadow-lg with hover effect
  - Scale animation on press (1.02 → 0.98)
  
- **Sign Up Link**:
  - Centered text with blue link
  - Gray-600 text with blue-600 accent

**Interactions:**
- Input focus: Border color change + ring
- Button hover: Shadow increase + slight scale
- Button press: Scale down animation
- Tab navigation between inputs

---

### 3. Signup Screen
**Layout Structure:**
- Similar to Login but with additional fields
- Scrollable for smaller screens

**Form Fields:**
- Name input (User icon)
- Email input (Mail icon)
- Password input (Lock icon + toggle)
- Confirm Password input (Lock icon + toggle)

**Validation:**
- Real-time password match indicator
- Red error text below confirm password
- Disabled submit if passwords don't match

**Unique Features:**
- Password strength indicator (visual feedback)
- All inputs have left icons
- Right-side toggle for password fields

**Navigation:**
- Bottom link to Login screen
- Bidirectional navigation

---

### 4. Profile Setup Screen
**Layout Structure:**
- Progress bar at top (75% filled)
- Form section with mixed input types
- Fixed action buttons at bottom

**Progress Indicator:**
- Text: "Step 1 of 3" + description
- Visual bar: 3/4 filled with gradient
- 8px height, rounded-full

**Form Sections:**

**A. Name Input** (Required):
- User icon, white background
- Standard input styling

**B. Age Input** (Optional):
- Calendar icon
- Number input (1-120)
- Placeholder text

**C. Gender Selection** (Optional):
- 3-column grid layout
- Pill-shaped buttons
- Icon + text for each option
- Active state: Blue-500 border + blue-50 background
- Inactive: Gray-200 border

**D. Medical Info** (Optional):
- File icon
- Multi-line textarea (4 rows)
- Character counter
- Helper text below

**Action Buttons:**
- **Continue Button**: Primary gradient button
- **Skip Link**: Gray text, centered below

---

### 5. Home Screen
**Layout Structure:**
- Fixed header (gradient background)
- Scrollable content area
- Fixed bottom navigation (80px height)

**Header Section:**
- **Top Bar**:
  - Greeting text (left)
  - User name (left, large, bold)
  - Bell icon button (right, white/20 background)
  
- **Quick Stats Grid** (3 columns):
  - Each stat: Icon + Label + Value
  - White/20 backdrop-blur background
  - Rounded-xl cards
  - Icons: Activity, FolderOpen, Calendar

**Content Area:**

**A. Primary CTA Card**:
- Full width, gradient background
- 96px height, rounded-2xl
- Left: Icon (AlertCircle) + Text
- Right: Arrow in circle
- Shadow-xl elevation

**B. Feature Grid** (2x2):
- Each card: White background, shadow-md
- Icon in colored circle (gradient backgrounds)
- Title + subtitle
- Hover: Border color change + shadow increase
- Cards: My Cases, Hospitals, Medications, Appointments

**C. Recent Cases List**:
- Section header with "View All" link
- Card-based list items
- Each card shows:
  - Title, date (Clock icon)
  - Status badge (colored)
  - Priority badge (colored)

**Bottom Navigation:**
- 4 tabs: Home, Health, Care, Profile
- Active tab: Blue-600 + blue-50 background
- Inactive: Gray-400
- Icon + label for each
- Smooth transition on switch

**Tab Navigation Logic:**
- Tap Home: Shows main content
- Tap Profile: Shows profile view
- Tap others: Placeholder (can be expanded)

---

### 6. Profile Tab (Home Screen)
**Layout Structure:**
- Same header as home
- Different content area
- Same bottom navigation

**Profile Card:**
- White background, rounded-2xl
- Top: Avatar (gradient circle) + Name + Email
- Divider line
- Info rows: Age, Gender, Medical Info
- Each row: Label (left) + Value (right)

**Action Button:**
- Edit Profile button
- White background with border
- Settings icon + text

---

### 7. Report Health Issue - Choose Method Screen
**Layout Structure:**
- Gradient header with back button
- Progress indicator (1/3)
- Method selection cards
- Info card at bottom

**Header:**
- Back button (left, ChevronLeft icon)
- Title + subtitle
- Gradient background matching home

**Progress Bar:**
- "Step 1 of 3" text
- 33% filled bar (gradient)

**Method Cards** (3 options):

**A. Upload Image Card**:
- Camera icon in blue gradient circle
- Title + description
- Badge tags: "Recommended", "Fast Analysis"
- Upload icon (right)
- Hover: Border color change + shadow

**B. Enter Symptoms Card**:
- FileText icon in purple gradient circle
- Title + description
- "Detailed" badge
- Same card styling

**C. Voice Input Card**:
- Mic icon in orange gradient circle
- Title + description
- "Quick & Easy" + "Beta" badges
- Same card styling

**Info Card:**
- Blue-50 background
- Image icon in blue-100 circle
- Privacy message
- Border: Blue-100

**Interactions:**
- Tap any card: Navigate to Symptom Form
- Tap back: Return to Home
- Upload Image: Opens file picker

---

### 8. Symptom Form Screen
**Layout Structure:**
- Header with back button
- Progress indicator (2/3)
- Form fields (scrollable)
- Fixed submit button at bottom

**Progress Bar:**
- 66% filled (2/3 complete)

**Form Components:**

**A. Symptom Textarea**:
- Large text area (8 rows)
- FileText icon in label
- Placeholder with example
- Character counter (bottom-right)
- Helper text below
- Border focus effect

**B. Image Upload Section**:
- Label with Image icon
- Preview grid (3 columns):
  - Each image: Thumbnail (96px height)
  - Remove button (top-right, red circle with X)
  - Group hover: Show remove button
  
- Upload button:
  - Dashed border
  - Upload icon + text
  - Hover: Blue-400 border + blue-50 background

**C. Tips Card**:
- Purple-50 gradient background
- Lightbulb emoji + heading
- Bulleted list (4 tips)
- Small text (12px)

**Submit Button:**
- Full width, gradient
- Sparkles icon + "Analyze with AI" text
- Disabled state: Opacity 50%, no hover
- Enabled: Full shadow and scale animations

**Interactions:**
- Text input: Real-time character count
- Image upload: File picker → Preview grid
- Remove image: Tap X button
- Submit: Validates input → Navigate to Results

---

### 9. Analysis Result Screen

**Loading State:**
- Centered modal card
- Spinning border animation (blue)
- Stethoscope icon in center
- "Analyzing Symptoms..." text
- Progress bar animation
- 2.5s display time

**Result Layout:**
- Header: "Analysis Complete" + Home button
- Progress indicator (3/3, 100% filled)
- Severity card
- Summary card
- Care recommendation card
- Recommendations list
- Action buttons
- Disclaimer
- Back to Home button

**A. Severity Card:**
Dynamic colors based on level:

- **Low Severity**:
  - Green background (green-50)
  - CheckCircle icon
  - Score: /100 with TrendingUp icon
  
- **Medium Severity**:
  - Yellow background
  - AlertCircle icon
  - Orange/yellow color scheme
  
- **Critical Severity**:
  - Red background
  - AlertTriangle icon
  - Red color scheme

**B. Summary Card:**
- White background
- Info icon + heading
- AI-generated text paragraph
- Possible conditions section:
  - Gray-50 background box
  - Condition chips (white with gray border)
  - Flex wrap layout

**C. Care Recommendation Card:**
- White to blue-50 gradient
- Blue-200 border (2px)
- Care type icon in colored circle
- Title + description
- Wait time badge with Clock icon

Care Types:
- **Teleconsult**: Video icon, green
- **Clinic**: Stethoscope icon, blue
- **Hospital**: Building icon, orange
- **Emergency**: AlertTriangle icon, red

**D. Recommendations List:**
- White card
- Bulleted items with CheckCircle icons
- Blue icon backgrounds
- Left-aligned text

**E. Action Buttons:**
- Primary: "Find Care Near Me" (gradient, full width)
- Secondary grid (2 columns):
  - "Call Now" (Phone icon)
  - "Schedule" (Calendar icon)
  - Both white with gray border

**F. Disclaimer:**
- Amber-50 background
- Amber-200 border
- Small text (12px)
- Bold "Medical Disclaimer" label

---

## Interaction Patterns

### Button Interactions
1. **Primary CTAs**:
   - Hover: Shadow-xl, scale(1.02)
   - Active: scale(0.98)
   - Transition: All 200ms

2. **Secondary Buttons**:
   - Hover: Shadow-md, border color change
   - Active: Slight scale down

3. **Icon Buttons**:
   - Hover: Background opacity increase
   - Ripple effect on tap

### Form Interactions
1. **Input Focus**:
   - Border: Gray-200 → Blue-500
   - Ring: 2px blue-500
   - Smooth transition

2. **Validation**:
   - Real-time for passwords
   - Error text appears below
   - Red-500 color for errors

3. **File Upload**:
   - Click: Opens file picker
   - Drop: Dashed border animation
   - Preview: Immediate thumbnail generation

### Navigation Interactions
1. **Tab Switch**:
   - Active tab: Color + background change
   - Smooth transition (200ms)
   - Content area updates

2. **Back Navigation**:
   - Slide transition (right to left)
   - Header back button always visible
   - Hardware back button support

3. **Modal Flows**:
   - Slide up animation
   - Overlay backdrop (dim)
   - Swipe down to dismiss

### Loading States
1. **Spinner**: Circular with rotating border
2. **Progress Bar**: Animated width increase
3. **Skeleton**: Pulse animation on placeholder
4. **Disabled State**: Opacity 50%, cursor not-allowed

---

## Responsive Design

### Breakpoints
- **Mobile First**: 320px - 428px (primary target)
- **Tablet**: 768px+ (larger cards, 2-column grids)
- **Desktop**: 1024px+ (max-width container, centered)

### Adaptive Elements
1. **Cards**: Stack on mobile, grid on tablet+
2. **Bottom Nav**: Fixed on mobile, side nav on desktop
3. **Headers**: Sticky on scroll
4. **Modals**: Full screen on mobile, centered on desktop

---

## Accessibility Features

### ARIA Labels
- Icon buttons: aria-label for screen readers
- Form inputs: Proper label associations
- Status messages: aria-live regions

### Keyboard Navigation
- Tab order: Logical top-to-bottom
- Focus indicators: Visible blue ring
- Enter/Space: Activates buttons
- Escape: Closes modals

### Touch Targets
- Minimum: 44x44px for all interactive elements
- Spacing: 8px between adjacent targets
- Feedback: Visual + haptic on tap

### Color Contrast
- Text: Minimum 4.5:1 ratio
- Icons: 3:1 ratio
- Status colors: Distinct hues + icons

---

## Animation Specifications

### Timing Functions
- **Ease-in-out**: Default (200-300ms)
- **Spring**: Button interactions (0.98-1.02 scale)
- **Linear**: Progress bars, loading spinners

### Transition Properties
- **Opacity**: 200ms ease
- **Transform**: 200ms ease-out
- **Colors**: 150ms ease-in-out
- **Shadow**: 200ms ease

### Key Animations
1. **Fade In**: Opacity 0 → 1 (300ms)
2. **Slide Up**: translateY(20px) → 0 (300ms)
3. **Scale Press**: scale(1) → 0.98 (100ms)
4. **Bounce**: Staggered for loading dots
5. **Pulse**: Background glow on splash logo

---

## Component Library Summary

### Buttons
- Primary (gradient)
- Secondary (white + border)
- Icon (circular, transparent)
- Link (text only)

### Cards
- Standard (white + shadow)
- Feature (icon + gradient background)
- Status (colored background + border)
- List item (compact)

### Inputs
- Text field (icon + input)
- Textarea (multi-line)
- Select (button group)
- File upload (dashed border area)

### Badges
- Status (colored background + text)
- Pill (rounded-full)
- Count (small circular)

### Icons
- Size: 16px (small), 20px (medium), 24px (large)
- Color: Matches context
- Library: Lucide React

### Progress Indicators
- Bar (horizontal with gradient)
- Circular (spinning border)
- Dots (bouncing)
- Percentage (text + visual)

---

## Design Principles

1. **Medical Trust**: Clean, professional, reassuring
2. **Clarity**: Clear hierarchy, obvious actions
3. **Efficiency**: Minimal steps, smart defaults
4. **Accessibility**: WCAG 2.1 AA compliant
5. **Responsiveness**: Mobile-first, adaptive layouts
6. **Consistency**: Unified design language across screens
7. **Feedback**: Visual confirmation for all actions
8. **Safety**: Prominent disclaimers, clear severity indicators

---

## Future Enhancements

### Planned Screens
- My Cases (detailed list)
- Nearby Hospitals (map + list)
- Medications (tracker)
- Appointments (calendar)
- Settings (preferences)
- Help & Support

### Advanced Features
- Dark mode support
- Localization (multi-language)
- Voice input implementation
- Real-time chat with doctors
- Health metrics dashboard
- Medication reminders
- Appointment notifications

---

## Development Notes

### Tech Stack
- React (functional components + hooks)
- Tailwind CSS v4 (utility-first styling)
- Lucide React (icon library)
- LocalStorage (user persistence)

### State Management
- useState for local component state
- Props drilling for data flow
- LocalStorage for user profile persistence

### Routing
- Custom screen switching in App.tsx
- State-based navigation
- Back button handling via callbacks

### File Structure
```
/components
  - SplashScreen.tsx
  - LoginScreen.tsx
  - SignupScreen.tsx
  - ProfileSetupScreen.tsx
  - HomeScreen.tsx
  - ReportHealthIssueScreen.tsx
  - SymptomFormScreen.tsx
  - AnalysisResultScreen.tsx
/App.tsx (main navigation controller)
/styles/globals.css (Tailwind config)
```

---

**End of UI/UX Documentation**

*Version: 1.0*  
*Last Updated: February 2, 2026*  
*Design System: MediLens Healthcare Platform*
