from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import get_db, engine, Base
from models import User
from auth_routes import router as auth_router
from utils import verify_token

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Cloobot Auth API",
    description="Authentication system for Cloobot SaaS application",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - very permissive for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Add OPTIONS handler for all routes
@app.options("/{path:path}")
async def options_handler(path: str):
    return {"message": "OK"}

# Include auth routes
app.include_router(auth_router, prefix="/auth", tags=["authentication"])

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

@app.get("/")
async def root():
    return {"message": "Cloobot Auth API is running"}

@app.get("/dashboard")
async def dashboard(current_user: User = Depends(get_current_user)):
    return {
        "message": f"Welcome to Cloobot, {current_user.email}!",
        "user": {
            "email": current_user.email,
            "provider": current_user.provider,
            "created_at": current_user.created_at
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
