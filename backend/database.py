"""
Simple SQLite database for user management.
"""

import sqlite3
import uuid
import json
from datetime import datetime
from typing import Optional, Tuple
from pathlib import Path

# Database file location
DB_PATH = Path(__file__).parent / "users.db"

# Create/connect to database
def get_db_connection():
    """Get a database connection."""
    try:
        conn = sqlite3.connect(str(DB_PATH))
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        raise RuntimeError(f"Database connection failed: {str(e)}")


def init_db():
    """Initialize the database with the users table."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    
    conn.commit()
    conn.close()

    # Create profiles table for storing user profiles locally
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
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
            medical_history TEXT,
            latitude REAL,
            longitude REAL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


# Initialize database on import
init_db()


def create_user(email: str, password_hash: str) -> Tuple[str, str]:
    """
    Create a new user.
    
    Returns:
        Tuple of (user_id, email)
    """
    user_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO users (id, email, password_hash, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, email, password_hash, now, now))
        conn.commit()
        return user_id, email
    except sqlite3.IntegrityError:
        raise ValueError(f"User with email {email} already exists")
    finally:
        conn.close()


def get_user_by_email(email: str) -> Optional[dict]:
    """Get a user by email."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, email, password_hash FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None


def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get a user by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, email FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None


def get_profile_by_id(user_id: str) -> Optional[dict]:
    """Get a profile by user id."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM profiles WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        profile = dict(row)
        # Parse medical_history from JSON string back to list
        if profile.get('medical_history'):
            try:
                profile['medical_history'] = json.loads(profile['medical_history'])
            except (json.JSONDecodeError, TypeError):
                profile['medical_history'] = []
        else:
            profile['medical_history'] = []
        return profile
    return None


def upsert_profile(user_id: str, data: dict) -> dict:
    """Insert or update a profile for the user."""
    now = datetime.utcnow().isoformat()
    existing = get_profile_by_id(user_id)
    conn = get_db_connection()
    cursor = conn.cursor()

    # Define allowed columns to prevent SQL injection
    ALLOWED_COLUMNS = {
        'email', 'full_name', 'phone_number', 'date_of_birth', 'address',
        'city', 'zip_code', 'blood_type', 'height', 'weight', 'allergies',
        'chronic_conditions', 'current_medications', 'emergency_contact_name',
        'emergency_contact_phone', 'insurance_provider', 'insurance_number',
        'medical_history', 'latitude', 'longitude'
    }
    
    # Filter data to only allowed columns and convert complex types
    filtered_data = {}
    for k, v in data.items():
        if k in ALLOWED_COLUMNS:
            # Convert lists/dicts to JSON strings for SQLite storage
            if isinstance(v, (list, dict)):
                filtered_data[k] = json.dumps(v)
            else:
                filtered_data[k] = v
    
    if not filtered_data:
        conn.close()
        return get_profile_by_id(user_id) or {}

    try:
        if existing:
            # Build update set with parameterized queries
            set_parts = [f"{k} = ?" for k in filtered_data.keys()]
            values = list(filtered_data.values()) + [now, user_id]
            sql = f"UPDATE profiles SET {', '.join(set_parts)}, updated_at = ? WHERE id = ?"
            cursor.execute(sql, tuple(values))
        else:
            # Insert new profile with parameterized queries
            fields = ["id"] + list(filtered_data.keys()) + ["created_at", "updated_at"]
            placeholders = ",".join(["?"] * len(fields))
            values = [user_id] + list(filtered_data.values()) + [now, now]
            sql = f"INSERT INTO profiles ({', '.join(fields)}) VALUES ({placeholders})"
            cursor.execute(sql, tuple(values))

        conn.commit()
    except sqlite3.Error as e:
        conn.rollback()
        raise RuntimeError(f"Database error during profile upsert: {str(e)}")
    finally:
        conn.close()

    return get_profile_by_id(user_id)
