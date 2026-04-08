from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from database import get_db
from models import User, AuthProvider
from utils import create_access_token, verify_password, get_password_hash, verify_token
import os
from dotenv import load_dotenv
import requests
from urllib.parse import urlencode

load_dotenv()

router = APIRouter()

# Auth0 Configuration
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID")
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET")
AUTH0_REDIRECT_URI = os.getenv("AUTH0_REDIRECT_URI")

# Pydantic models
class UserSignup(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Local Authentication Routes
@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    """Register a new user with email and password."""
    
    print(f"Signup attempt: email={user_data.email}, password_length={len(user_data.password)}")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    print("Creating new user...")
    hashed_password = get_password_hash(user_data.password)
    print("Password hashed successfully")
    
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        provider=AuthProvider.LOCAL
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print("User created successfully")
    
    # Create access token
    access_token = create_access_token(data={"sub": new_user.email})
    print("Access token created")
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "email": new_user.email,
            "provider": new_user.provider.value,
            "created_at": new_user.created_at.isoformat()
        }
    )

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user with email and password."""
    
    # Find user
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if user is local auth user
    if user.provider != AuthProvider.LOCAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses SSO. Please login with Okta."
        )
    
    # Verify password
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "email": user.email,
            "provider": user.provider.value,
            "created_at": user.created_at.isoformat()
        }
    )

# Auth0 SSO Routes
@router.get("/okta/login")
async def okta_login():
    """Redirect user to Auth0 for authentication."""
    if not all([AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_REDIRECT_URI]):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth0 configuration missing"
        )
    
    # Build Auth0 authorization URL
    auth_params = {
        "client_id": AUTH0_CLIENT_ID,
        "response_type": "code",
        "scope": "openid profile email",
        "redirect_uri": AUTH0_REDIRECT_URI,
        "state": "random_state_string"
    }
    
    auth_url = f"https://{AUTH0_DOMAIN}/authorize?{urlencode(auth_params)}"
    
    return RedirectResponse(url=auth_url)

@router.get("/okta/callback")
async def okta_callback(code: str, state: str, db: Session = Depends(get_db)):
    """Handle Auth0 OAuth callback."""
    
    if not all([AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET]):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth0 configuration missing"
        )
    
    try:
        # Exchange authorization code for tokens
        token_data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": AUTH0_REDIRECT_URI,
            "client_id": AUTH0_CLIENT_ID,
            "client_secret": AUTH0_CLIENT_SECRET,
        }
        
        print(f"Token exchange data: {token_data}")
        print(f"Token URL: https://{AUTH0_DOMAIN}/oauth/token")
        
        token_response = requests.post(
            f"https://{AUTH0_DOMAIN}/oauth/token",
            json=token_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Token response status: {token_response.status_code}")
        print(f"Token response body: {token_response.text}")
        
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to exchange authorization code: {token_response.text}"
            )
        
        token_info = token_response.json()
        
        # Get user info from Auth0
        userinfo_response = requests.get(
            f"https://{AUTH0_DOMAIN}/userinfo",
            headers={"Authorization": f"Bearer {token_info.get('access_token')}"}
        )
        
        if userinfo_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Auth0"
            )
        
        userinfo = userinfo_response.json()
        email = userinfo.get("email")
        name = userinfo.get("name", email)
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Auth0"
            )
        
        # Find or create user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new user from Auth0
            user = User(
                email=email,
                hashed_password=None,
                provider=AuthProvider.OKTA
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        elif user.provider != AuthProvider.OKTA:
            # User exists with different provider
            error_message = "This account already exists with local authentication. Please use a different email for Auth0 login."
            return RedirectResponse(
                url=f"http://localhost:3000?error={error_message}",
                status_code=302
            )
        
        # Create JWT token for our app
        access_token = create_access_token(data={"sub": user.email})
        
        # Redirect to frontend with token
        frontend_url = "http://localhost:3000"
        callback_params = {
            "access_token": access_token,
            "token_type": "bearer",
            "email": user.email,
            "provider": user.provider.value
        }
        
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?{urlencode(callback_params)}"
        )
        
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error communicating with Auth0: {str(e)}"
        )

# Security
security = HTTPBearer()

# Dependency to get current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = verify_token(token)
    email = payload.get("sub")
    
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return {
        "email": current_user.email,
        "provider": current_user.provider.value,
        "created_at": current_user.created_at.isoformat()
    }