# Quick Test Guide - Image Analysis & Priority

## 🚀 Quick Start Testing

### 1. Start Backend
```powershell
.\restart-backend-now.ps1
```

### 2. Start Frontend
```powershell
npm run dev
```

## 📋 Test Checklist

### Test 1: Image Upload & Analysis
1. Login to the app
2. Click "Report Health Issue"
3. Select "Upload Image" method
4. Choose a medical image (skin condition, wound, etc.)
5. **Verify**: Image preview appears
6. Add symptom description
7. Click "Analyze with AI"
8. **Verify**: 
   - Loading spinner shows
   - Analysis results appear with:
     - ✅ Analysis summary text
     - ✅ Detected symptoms (if any)
     - ✅ Urgency level badge (colored)
     - ✅ Recommendations

### Test 2: Priority Assignment
1. After analysis completes
2. **Check urgency level color**:
   - 🔴 Red = Emergency/High
   - 🟡 Yellow = Medium
   - 🟢 Green = Low
3. Submit the case
4. Go to "My Cases"
5. **Verify**: Case shows correct severity/priority

### Test 3: Different Urgency Levels
Test with different types of images:
- **Emergency**: Severe injury, heavy bleeding
- **High**: Significant swelling, deep wound
- **Medium**: Rash, minor swelling
- **Low**: Small bruise, minor irritation

### Test 4: Mobile Layout
1. Open app in mobile view (430×880px)
2. Navigate through all screens:
   - Home
   - Report Health Issue
   - Symptom Form
   - My Cases
   - Medications
   - Profile
3. **Verify**: 
   - ✅ No content overflow
   - ✅ Headers fit properly
   - ✅ All buttons accessible
   - ✅ Modals fit within screen

## 🔍 What to Look For

### ✅ Success Indicators
- Image uploads without errors
- Analysis completes in 5-10 seconds
- Results display with structured data
- Urgency level matches symptom severity
- Case created with correct priority
- All screens fit mobile container

### ❌ Potential Issues
- Analysis takes too long (>30 seconds)
- No urgency level shown
- Priority not set on case
- Content overflows mobile screen
- TypeScript errors in console

## 🐛 Debugging

### If Analysis Fails
1. Check backend logs for errors
2. Verify GEMINI_API_KEY is set in backend/.env
3. Check image size (should be <5MB)
4. Try with different image format (JPEG, PNG)

### If Priority Not Set
1. Check browser console for errors
2. Verify `urgency_level` in API response
3. Check case creation payload includes `severity`
4. Verify backend analyzer returns correct structure

### If Mobile Layout Issues
1. Check browser width is 430px
2. Verify container has `overflow-hidden`
3. Check header padding is `pt-10 pb-6`
4. Ensure no `rounded-b-3xl` on headers

## 📊 Expected API Response

### /api/analyze-image Response
```json
{
  "success": true,
  "analysis_text": "The image shows visible redness...",
  "detected_symptoms": [
    {
      "symptom_name": "Redness",
      "severity": "medium",
      "description": "Visible inflammation"
    }
  ],
  "possible_conditions": ["Contact Dermatitis"],
  "urgency_level": "medium",
  "recommendations": [
    "Apply cold compress",
    "Consult dermatologist if persists"
  ],
  "disclaimer": "This is not a medical diagnosis..."
}
```

## 🎯 Success Criteria

All tests pass when:
- ✅ Images upload and analyze successfully
- ✅ Urgency level displayed with correct color
- ✅ Cases created with matching severity
- ✅ All screens fit mobile container (430×880px)
- ✅ No TypeScript or runtime errors
- ✅ Analysis completes in reasonable time (<30s)

## 📞 Support

If issues persist:
1. Check `IMAGE_ANALYSIS_FIX_COMPLETE.md` for detailed info
2. Review `MOBILE_LAYOUT_COMPLETE.md` for layout specs
3. Check backend logs in terminal
4. Verify all dependencies installed
