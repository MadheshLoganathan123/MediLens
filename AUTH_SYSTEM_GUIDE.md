# MediLens Authentication System Guide

## Overview

Your MediLens backend uses a **hybrid authentication system**:
- **Local SQLite database** for user credentials (email/password)
- **Custom JWT tokens** for session management
- **Supabase** for storing user profiles and health data

## Architecture

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ 1. Register/Login
       ▼
┌─────────────────────┐
│  FastAPI Backend    │
│  (Port 5000)        │
├─────────────────────┤
│ • auth_routes.py    │ ◄── Handles registration/login
│ • auth_utils.py     │ ◄── JWT & password hashing
│ • database.py       │ ◄── SQLite user management
└──────┬──────┬───────┘
       │      │
       │      └──────────┐
       ▼                 ▼
┌─────────────┐   ┌──────────────┐
│  SQLite DB  │   │   Supabase   │
│  users.db   │   │   (Profiles  │
│             │   │   & Cases)   │
└─────────────┘   └──────────────┘
```

## Database Schema

### Local SQLite (`users.db`)

#### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,              -- UUID
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,      -- bcrypt hash
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

#### Profiles Table (Local Cache)
```sql
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,              -- Same as user ID
    email TEXT,
    full_name TEXT,
    phone_number TEXT,
    date_of_birth TEXT,
    address TEXT,
    city TEXT,
    zip_code TEXT,
    blood_type TEXT,
    height REAL,
    weight REAL,
    allergies TEXT,
    chronic_conditions TEXT,
    current_medications TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    insurance_provider TEXT,
    insurance_number TEXT,
    medical_history TEXT,             -- JSON string
    latitude REAL,
    longitude REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### Supabase Tables

#### profiles (Synced from local)
- Same structure as local profiles table
- Used for foreign key constraints with health_cases

#### health_cases
```sql
CREATE TABLE health_cases (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    symptoms TEXT,
    ai_analysis JSONB,
    severity TEXT,
    category TEXT,
    status TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## API Endpoints

### Authentication Endpoints

#### 1. Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  }
}
```

#### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  }
}
```

### Profile Endpoints

#### 4. Get Profile
```http
GET /api/profile
Authorization: Bearer <token>

Response:
{
  "id": "uuid-here",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone_number": "+1234567890",
  "blood_type": "O+",
  ...
}
```

#### 5. Update Profile
```http
POST /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone_number": "+1234567890",
  "date_of_birth": "1990-01-01",
  "blood_type": "O+",
  "city": "New York",
  "allergies": "Penicillin"
}

Response: Updated profile object
```

### Health Cases Endpoints

#### 6. Create Health Case
```http
POST /api/cases
Authorization: Bearer <token>
Content-Type: application/json

{
  "symptoms": "Headache and fever",
  "severity": "medium",
  "category": "general"
}
```

#### 7. List Health Cases
```http
GET /api/cases
Authorization: Bearer <token>

Response: Array of health case objects
```

#### 8. Get Specific Case
```http
GET /api/cases/{case_id}
Authorization: Bearer <token>
```

#### 9. Update Case
```http
PUT /api/cases/{case_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "severity": "low"
}
```

## JWT Token Structure

```json
{
  "sub": "user-uuid",           // User ID
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,            // Issued at
  "exp": 1234654290             // Expires (24 hours default)
}
```

## Security Features

1. **Password Hashing**: bcrypt with automatic salt generation
2. **JWT Tokens**: HS256 algorithm with configurable expiration
3. **Token Validation**: Automatic expiration checking
4. **User Isolation**: All queries filtered by authenticated user ID
5. **CORS Protection**: Configurable allowed origins

## Configuration

### Required Environment Variables

```bash
# Supabase (for profiles and health cases)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Optional but recommended

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-secret-key-change-in-production

# Optional: AI Features
GOOGLE_API_KEY=your-google-api-key
GEMINI_API_KEY=your-gemini-api-key

# Optional: Map Features
RAPIDAPI_KEY=your-rapidapi-key
```

### Configuration File: `backend/config.py`

```python
class Settings(BaseSettings):
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    SUPABASE_URL: AnyHttpUrl
    SUPABASE_SERVICE_ROLE_KEY: str | None
    SUPABASE_ANON_KEY: str | None
    
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,..."
```

## Testing

### 1. Verify Backend Setup
```bash
cd backend
python verify_setup.py
```

This checks:
- Environment variables
- Database tables
- Authentication system
- Supabase connection

### 2. Test Authentication Flow
```powershell
.\test-complete-auth.ps1
```

This tests:
- User registration
- Token generation
- Profile creation
- Profile updates
- Login
- Token verification

### 3. Manual Testing with cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!"}'
```

**Get Profile:**
```bash
curl http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Issues & Solutions

### Issue 1: "User with this email already exists"
**Solution**: Email is already registered. Use login instead or use a different email.

### Issue 2: "Invalid credentials"
**Solution**: Check email and password are correct. Passwords are case-sensitive.

### Issue 3: "Could not validate credentials"
**Solution**: 
- Token may be expired (24 hours default)
- Token may be malformed
- JWT_SECRET may have changed
- Login again to get a new token

### Issue 4: "Database connection failed"
**Solution**: 
- Check `backend/users.db` exists
- Run `python verify_setup.py` to reinitialize

### Issue 5: "Supabase connection error"
**Solution**:
- Verify VITE_SUPABASE_URL is correct
- Verify SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY is set
- Check Supabase project is active

### Issue 6: Profile foreign key constraint error
**Solution**: User needs to be synced to Supabase profiles table. This happens automatically on registration/login, but you can manually sync by logging in again.

## Frontend Integration

### React Context Setup

```typescript
// src/context/AuthContext.tsx
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }
};
```

### API Client Setup

```typescript
// src/lib/apiClient.ts
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const getProfile = async () => {
  const response = await fetch('http://localhost:5000/api/profile', {
    headers: getAuthHeaders()
  });
  return response.json();
};
```

## Best Practices

1. **Always use HTTPS in production**
2. **Change JWT_SECRET before deploying**
3. **Set appropriate JWT_EXPIRATION_HOURS** (24 hours default)
4. **Implement token refresh** for better UX
5. **Add rate limiting** to prevent brute force attacks
6. **Log authentication events** for security monitoring
7. **Validate email format** on frontend and backend
8. **Enforce strong password requirements**
9. **Clear tokens on logout**
10. **Handle token expiration gracefully** in frontend

## File Structure

```
backend/
├── main.py                 # Main FastAPI app
├── auth_routes.py          # Authentication endpoints
├── auth_utils.py           # JWT & password utilities
├── database.py             # SQLite database operations
├── config.py               # Configuration settings
├── users.db                # SQLite database file
├── verify_setup.py         # Setup verification script
└── .env                    # Environment variables
```

## Support

For issues or questions:
1. Run `python backend/verify_setup.py` to diagnose problems
2. Check logs in the backend console
3. Review this guide for common issues
4. Test with `test-complete-auth.ps1`
